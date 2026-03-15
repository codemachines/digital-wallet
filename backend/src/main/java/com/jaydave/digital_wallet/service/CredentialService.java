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
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.time.Instant;
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

    public CredentialService() {
        try {
            KeyPairGenerator generator = KeyPairGenerator.getInstance("RSA");
            generator.initialize(2048);
            this.keyPair = generator.generateKeyPair();
            this.privateKey = keyPair.getPrivate();
            this.publicKey = keyPair.getPublic();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    // ================== Credential Issuance ==================
    public Credential issueCredential(IssueCredentialRequest request) {
        Wallet wallet = walletRepository.findByDidWalletId(request.getWalletId())
                .orElseThrow(() -> new RuntimeException("Wallet not found"));

        String claimsJson;
        try {
            claimsJson = objectMapper.writeValueAsString(request.getClaims());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to convert claims to JSON", e);
        }

        String encryptedClaims = Base64.getEncoder().encodeToString(claimsJson.getBytes());
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
        credential.setSubjectDid(request.getWalletId());
        credential.setIssuedAt(LocalDateTime.now().toString());
        credential.setEncryptedClaims(encryptedClaims);
        credential.setHash(hash);
        credential.setSignature(signature);

        if (request.getExpiryAt() != null) {
            credential.setExpiryAt(request.getExpiryAt());
        } else {
            credential.setExpiryAt(null); // No expiry
        }

        credential.setRevoked(false); // default not revoked

        return credentialRepository.save(credential);
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
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));

        try {
            String decodedClaims = new String(Base64.getDecoder().decode(credential.getEncryptedClaims()));
            String recalculatedHash = generateHash(decodedClaims);

            if (!recalculatedHash.equals(credential.getHash())) {
                logVerification(credential, "INVALID_SIGNATURE");
                return "INVALID_SIGNATURE";
            }

            if (!verifySignature(credential.getHash(), credential.getSignature(), publicKey)) {
                logVerification(credential, "INVALID_SIGNATURE");
                return "INVALID_SIGNATURE";
            }

            if (credential.isRevoked()) {
                logVerification(credential, "REVOKED");
                return "REVOKED";
            }

            if (credential.getExpiryAt() != null && credential.getExpiryAt().isBefore(LocalDateTime.now())) {
                logVerification(credential, "EXPIRED");
                return "EXPIRED";
            }

            logVerification(credential, "VERIFIED");
            return "VERIFIED";

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
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
    public Credential revokeCredential(String credentialId) {
        Credential credential = getCredentialEntityById(credentialId);
        credential.setRevoked(true);
        Credential saved = credentialRepository.save(credential);
        logVerification(saved, "REVOKED");
        return saved;
    }

    // ================== Credential Sharing ==================
    public CredentialShareToken generateSharingToken(String credentialId, int validitySeconds) {
        Credential credential = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));

        CredentialShareToken token = new CredentialShareToken();
        token.setToken(UUID.randomUUID());
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
            String decoded = new String(Base64.getDecoder().decode(encryptedClaims));
            return objectMapper.readValue(decoded, Map.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to decode claims", e);
        }
    }

    public PrivateKey getPrivateKey() {
        return this.privateKey;
    }

    // ================== Credential Fetch ==================
    public List<CredentialResponse> getCredentialsByWallet(String walletId) {
        return credentialRepository.findBySubjectDid(walletId).stream()
                .map(c -> new CredentialResponse(
                        c.getId().toString(),
                        c.getType(),
                        c.getIssuerDid(),
                        c.getSubjectDid(),
                        c.getIssuedAt()
                )).collect(Collectors.toList());
    }

    public CredentialResponse getCredentialById(String credentialId) {
        Credential c = credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
        return new CredentialResponse(c.getId().toString(), c.getType(), c.getIssuerDid(), c.getSubjectDid(), c.getIssuedAt());
    }

    public Credential getCredentialEntityById(String credentialId) {
        return credentialRepository.findById(credentialId)
                .orElseThrow(() -> new RuntimeException("Credential not found"));
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