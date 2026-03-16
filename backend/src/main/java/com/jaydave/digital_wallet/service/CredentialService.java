package com.jaydave.digital_wallet.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.qrcode.QRCodeWriter;
import com.jaydave.digital_wallet.dto.CredentialResponse;
import com.jaydave.digital_wallet.dto.IssueCredentialRequest;
import com.jaydave.digital_wallet.entity.Credential;
import com.jaydave.digital_wallet.entity.CredentialShareToken;
import com.jaydave.digital_wallet.entity.VerificationLog;
import com.jaydave.digital_wallet.entity.Wallet;
import com.jaydave.digital_wallet.repository.CredentialRepository;
import com.jaydave.digital_wallet.repository.CredentialShareTokenRepository;
import com.jaydave.digital_wallet.repository.VerificationLogRepository;
import com.jaydave.digital_wallet.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.time.Instant;
import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;
import javax.crypto.SecretKey;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class CredentialService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private CredentialRepository credentialRepository;

    @Autowired
    private CredentialShareTokenRepository credentialShareTokenRepository;

    @Autowired
    private VerificationLogRepository verificationLogRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private final KeyPair keyPair;
    private final PrivateKey privateKey;
    private final PublicKey publicKey;
    private final SecretKey aesKey;

    // Inject the persistent AES key from application.properties
    public CredentialService(@Value("${wallet.aes.secret-key}") String aesSecretKeyBase64) {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            this.keyPair = generator.generateKeyPair();
            this.privateKey = keyPair.getPrivate();
            this.publicKey = keyPair.getPublic();

            // Load fixed AES-256 key from config — same key every restart so stored credentials can always be decrypted
            byte[] keyBytes = Base64.getDecoder().decode(aesSecretKeyBase64);
            this.aesKey = new SecretKeySpec(keyBytes, "AES");
        } catch (Exception e) {
            throw new RuntimeException("Failed to initialize CredentialService: " + e.getMessage(), e);
        }
    }

    // ================== Credential Issuance ==================
    public Credential issueCredential(IssueCredentialRequest request) {
        // Look up the subject/holder's wallet using the walletId (their DID string)
        Wallet wallet = walletRepository.findByDidWalletId(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found: " + request.getWalletId()));

        String claimsJson;
        try {
            claimsJson = objectMapper.writeValueAsString(request.getClaims());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert claims to JSON", e);
        }

        String encryptedClaims = encryptClaims(claimsJson);
        String hash = generateHash(claimsJson);
        String signature = null;
        try {
            signature = signData(hash, privateKey);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        Credential credential = new Credential();
        credential.setType(request.getType());
        credential.setIssuerDid(request.getIssuerDid());
        credential.setSubjectDid(wallet.getDidWalletId());
        credential.setWallet(wallet);
        credential.setIssuedAt(LocalDateTime.now().toString());
        credential.setEncryptedClaims(encryptedClaims);
        credential.setHash(hash);
        credential.setSignature(signature);
        // Store the RSA public key so verification always works even after server restarts
        credential.setIssuerPublicKey(Base64.getEncoder().encodeToString(publicKey.getEncoded()));
        credential.setExpiryAt(request.getExpiryAt());
        credential.setRevoked(false);

        Credential saved = credentialRepository.save(credential);
        System.out.println("ISSUED: ID=" + saved.getId() + ", Issuer=" + saved.getIssuerDid() + ", Subject=" + saved.getSubjectDid());
        return saved;
    }

    // current private method
    public String signData(String data, PrivateKey privateKey) throws Exception {
        Signature signature = Signature.getInstance("SHA256withRSA");
        signature.initSign(privateKey);
        signature.update(data.getBytes(StandardCharsets.UTF_8));
        byte[] signedBytes = signature.sign();
        return Base64.getEncoder().encodeToString(signedBytes);
    }

    // ================== Credential Verification ==================
    public String verifyCredential(String credentialId) {
        Credential credential = credentialRepository.findById(UUID.fromString(credentialId))
                .orElseThrow(() -> new RuntimeException("Credential not found"));

        try {
            // 1. Decrypt claims and verify hash integrity
            String decodedClaims = decryptClaims(credential.getEncryptedClaims());
            String recalculatedHash = generateHash(decodedClaims);
            if (!recalculatedHash.equals(credential.getHash())) {
                logVerification(credential, "INVALID_SIGNATURE");
                return "INVALID_SIGNATURE";
            }

            // 2. Verify RSA signature using the PUBLIC KEY stored with the credential
            //    (not the in-memory key, so verification works after server restarts)
            PublicKey storedPublicKey = reconstructPublicKey(credential.getIssuerPublicKey());
            if (!verifySignature(credential.getHash(), credential.getSignature(), storedPublicKey)) {
                logVerification(credential, "INVALID_SIGNATURE");
                return "INVALID_SIGNATURE";
            }

            // 3. Check revocation — use a direct scalar query to ALWAYS read fresh from DB,
            //    bypassing the JPA first-level entity cache which may hold a stale revoked=false
            boolean isRevoked = credentialRepository
                    .findRevokedById(UUID.fromString(credentialId))
                    .orElse(false);
            System.out.println("VERIFY REVOKED CHECK: credentialId=" + credentialId + " isRevoked=" + isRevoked);
            if (isRevoked) {
                logVerification(credential, "REVOKED");
                return "REVOKED";
            }

            // 4. Check expiry
            if (credential.getExpiryAt() != null && credential.getExpiryAt().isBefore(LocalDateTime.now())) {
                logVerification(credential, "EXPIRED");
                return "EXPIRED";
            }

            logVerification(credential, "VERIFIED");
            return "VERIFIED";

        } catch (Exception e) {
            throw new RuntimeException("Verification failed: " + e.getMessage(), e);
        }
    }

    /** Reconstruct an RSA PublicKey from its Base64-encoded byte representation. */
    private PublicKey reconstructPublicKey(String base64PublicKey) throws Exception {
        if (base64PublicKey == null || base64PublicKey.isBlank()) {
            throw new RuntimeException("No public key stored with this credential");
        }
        byte[] keyBytes = Base64.getDecoder().decode(base64PublicKey);
        java.security.spec.X509EncodedKeySpec keySpec = new java.security.spec.X509EncodedKeySpec(keyBytes);
        return KeyFactory.getInstance("RSA").generatePublic(keySpec);
    }

    private void logVerification(Credential credential, String status) {
        VerificationLog log = new VerificationLog();
        log.setCredentialId(credential.getId().toString());
        log.setVerifier("API_USER"); // replace with actual verifier info
        log.setVerificationResult(status);
        log.setTimestamp(Instant.now());
        verificationLogRepository.save(log);
    }

    // ================== Revocation ==================
    @jakarta.transaction.Transactional
    public Credential revokeCredential(String credentialId) {
        System.out.println("REVOKING credential: " + credentialId);
        Credential credential = credentialRepository.findById(java.util.UUID.fromString(credentialId))
                .orElseThrow(() -> new RuntimeException("Credential not found: " + credentialId));
        credential.setRevoked(true);
        Credential saved = credentialRepository.saveAndFlush(credential);
        System.out.println("REVOKED: " + saved.getId() + " revoked=" + saved.isRevoked());
        logVerification(saved, "REVOKED");
        return saved;
    }

    // ================== Credential Sharing ==================
    public CredentialShareToken generateSharingToken(String credentialId, int validitySeconds) {
        Credential credential = credentialRepository.findById(UUID.fromString(credentialId))
                .orElseThrow(() -> new RuntimeException("Credential not found"));

        CredentialShareToken token = new CredentialShareToken();
        // Do NOT call token.setToken() — let @GeneratedValue(UUID) assign it on INSERT.
        // Manually setting the UUID in Hibernate 6 makes isNew()=false → UPDATE → failure.
        token.setCredential(credential);
        token.setExpiresAt(Instant.now().plusSeconds(validitySeconds));

        return credentialShareTokenRepository.save(token);
    }

    public byte[] generateQRCode(String tokenUrl) throws Exception {
        QRCodeWriter qrCodeWriter = new QRCodeWriter();
        var bitMatrix = qrCodeWriter.encode(tokenUrl, BarcodeFormat.QR_CODE, 250, 250);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
        return outputStream.toByteArray();
    }

    // ================== Selective Disclosure ==================
    public Map<String, Object> decodeClaims(String encryptedClaims) {
        try {
            String decoded = decryptClaims(encryptedClaims);
            return objectMapper.readValue(decoded, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode claims", e);
        }
    }

    private String encryptClaims(String rawData) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, this.aesKey);
            byte[] encrypted = cipher.doFinal(rawData.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(encrypted);
        } catch (Exception e) {
            throw new RuntimeException("Encryption failed", e);
        }
    }

    private String decryptClaims(String encryptedData) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, this.aesKey);
            byte[] decrypted = cipher.doFinal(Base64.getDecoder().decode(encryptedData));
            return new String(decrypted, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Decryption failed", e);
        }
    }

    public PrivateKey getPrivateKey() {
        return this.privateKey;
    }

    // ================== Credential Fetch ==================
    public List<CredentialResponse> getCredentialsByWalletId(java.util.UUID walletId, String subjectDid) {
        System.out.println("FETCHING FOR HOLDER: walletId=" + walletId + " subjectDid=" + subjectDid);
        List<Credential> list = credentialRepository.findByWalletIdOrSubjectDid(walletId, subjectDid);
        System.out.println("FOUND: " + list.size());
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CredentialResponse> getCredentialsByWallet(String walletDid) {
        System.out.println("FETCHING FOR HOLDER: " + walletDid);
        List<Credential> list = credentialRepository.findBySubjectDid(walletDid);
        System.out.println("FOUND: " + list.size());
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public List<CredentialResponse> getCredentialsByIssuer(String issuerDid) {
        System.out.println("FETCHING FOR ISSUER: " + issuerDid);
        List<Credential> list = credentialRepository.findByIssuerDid(issuerDid);
        System.out.println("FOUND: " + list.size());
        return list.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CredentialResponse getCredentialById(String credentialId) {
        Credential c = credentialRepository.findById(UUID.fromString(credentialId))
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        return mapToResponse(c);
    }

    private CredentialResponse mapToResponse(Credential c) {
        Map<String, Object> claims = decodeClaims(c.getEncryptedClaims());
        return new CredentialResponse(
                c.getId().toString(),
                c.getType(),
                c.getIssuerDid(),
                c.getSubjectDid(),
                c.getIssuerDid(),
                c.getSubjectDid(),
                c.getIssuedAt(),
                c.isRevoked(),
                claims
        );
    }

    public Credential getCredentialEntityById(String credentialId) {
        return credentialRepository.findById(UUID.fromString(credentialId))
                .orElseThrow(() -> new RuntimeException("Credential not found"));
    }

    // ================== Share Token Verification ==================
    public Map<String, Object> verifyByShareToken(String tokenStr) {
        UUID tokenUUID;
        try {
            tokenUUID = UUID.fromString(tokenStr);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid token format");
        }

        CredentialShareToken shareToken = credentialShareTokenRepository.findByToken(tokenUUID)
                .orElseThrow(() -> new RuntimeException("Token not found or already used"));

        if (shareToken.getExpiresAt().isBefore(Instant.now())) {
            throw new RuntimeException("Token has expired");
        }

        Credential credential = shareToken.getCredential();
        String status = verifyCredential(credential.getId().toString());

        Map<String, Object> response = new java.util.HashMap<>();
        response.put("status", status);
        response.put("issuer", credential.getIssuerDid());
        response.put("issuedDate", credential.getIssuedAt());
        response.put("credentialId", credential.getId().toString());
        if (credential.getExpiryAt() != null) {
            response.put("expiryDate", credential.getExpiryAt().toString());
        }
        return response;
    }

    public List<VerificationLog> getAllVerificationLogs() {
        return verificationLogRepository.findAll();
    }

    // ================== Utility ==================
    private String generateHash(String data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(data.getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder();
            for (byte b : hashBytes) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private boolean verifySignature(String data, String signatureStr, PublicKey publicKey) {
        try {
            Signature signature = Signature.getInstance("SHA256withRSA");
            signature.initVerify(publicKey);
            signature.update(data.getBytes(StandardCharsets.UTF_8));
            byte[] signatureBytes = Base64.getDecoder().decode(signatureStr);
            return signature.verify(signatureBytes);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}