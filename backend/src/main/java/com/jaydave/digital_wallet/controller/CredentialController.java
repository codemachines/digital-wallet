package com.jaydave.digital_wallet.controller;

import com.jaydave.digital_wallet.dto.IssueCredentialRequest;
import com.jaydave.digital_wallet.entity.Credential;
import com.jaydave.digital_wallet.entity.CredentialShareToken;
import com.jaydave.digital_wallet.repository.CredentialShareTokenRepository;
import com.jaydave.digital_wallet.service.CredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/credentials")
public class CredentialController {

    @Autowired
    private CredentialService credentialService;

    @Autowired
    private CredentialShareTokenRepository credentialShareTokenRepository;

    // ================== Issue Credential ==================
    @PostMapping("/issue")
    public Credential issueCredential(@RequestBody IssueCredentialRequest request) {
        return credentialService.issueCredential(request);
    }

    // ================== Verify Credential ==================
    @PostMapping("/verify/{credentialId}")
    public ResponseEntity<?> verifyCredential(@PathVariable String credentialId) {
        String status = credentialService.verifyCredential(credentialId);
        Credential credential = credentialService.getCredentialEntityById(credentialId);

        Map<String, Object> response = new HashMap<>();
        response.put("status", status);
        response.put("issuer", credential.getIssuerDid());
        response.put("issuedDate", credential.getIssuedAt());
        if (credential.getExpiryAt() != null) response.put("expiryDate", credential.getExpiryAt().toString());

        return "VERIFIED".equals(status) ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    // ================== Wallet Credentials ==================
    @GetMapping("/wallet/{walletId}")
    public ResponseEntity<?> getWalletCredentials(@PathVariable String walletId) {
        return ResponseEntity.ok(credentialService.getCredentialsByWallet(walletId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getCredential(@PathVariable String id) {
        return ResponseEntity.ok(credentialService.getCredentialById(id));
    }

    // ================== Revoke Credential ==================
    @PostMapping("/issuer/revoke/{credentialId}")
    public ResponseEntity<?> revokeCredential(@PathVariable String credentialId) {
        Credential revoked = credentialService.revokeCredential(credentialId);
        return ResponseEntity.ok(Map.of("status", "REVOKED", "message", "Credential has been revoked"));
    }

    // ================== Share Credential ==================
    @PostMapping("/wallet/share/{credentialId}")
    public ResponseEntity<?> shareCredential(@PathVariable String credentialId) {
        CredentialShareToken token = credentialService.generateSharingToken(credentialId, 300);
        return ResponseEntity.ok(Map.of("presentationToken", token.getToken(), "expiresIn", 300));
    }

    @PostMapping("/wallet/share/{credentialId}/qr")
    public ResponseEntity<byte[]> shareCredentialAsQR(@PathVariable String credentialId) throws Exception {
        CredentialShareToken token = credentialService.generateSharingToken(credentialId, 300);
        String tokenUrl = "https://wallet.app/share/" + token.getToken();
        byte[] qrCode = credentialService.generateQRCode(tokenUrl);
        return ResponseEntity.ok().header("Content-Type", "image/png").body(qrCode);
    }

    @PostMapping("/wallet/share/{credentialId}/link")
    public ResponseEntity<?> shareCredentialLink(@PathVariable String credentialId) {
        CredentialShareToken token = credentialService.generateSharingToken(credentialId, 300);
        String link = "https://wallet.app/share/" + token.getToken();
        return ResponseEntity.ok(Map.of("presentationToken", token.getToken(), "expiresIn", 300, "shareLink", link));
    }

    // ================== Present Credential (Selective Disclosure) ==================
    @PostMapping("/wallet/present")
    public ResponseEntity<?> presentCredential(@RequestBody Map<String, Object> request) {
        String credentialId = (String) request.get("credentialId");
        List<String> fields = (List<String>) request.get("fields");
        Credential credential = credentialService.getCredentialEntityById(credentialId);

        Map<String, Object> claims = credentialService.decodeClaims(credential.getEncryptedClaims());
        Map<String, Object> disclosed = claims.entrySet().stream()
                .filter(e -> fields.contains(e.getKey()))
                .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        String proof = null;
        try {
            proof = credentialService.signData(credential.getHash(), credentialService.getPrivateKey());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return ResponseEntity.ok(Map.of("credentialId", credential.getId(), "disclosedClaims", disclosed, "proof", proof));
    }

    // ================== Verification Logs ==================
    @GetMapping("/verification/logs")
    public ResponseEntity<?> getVerificationLogs() {
        List<Map<String, Object>> logs = credentialService.getAllVerificationLogs().stream()
                .map(log -> Map.<String, Object>of(
                        "credentialId", (Object) log.getCredentialId(),
                        "verifier", (Object) log.getVerifier(),
                        "verificationResult", (Object) log.getVerificationResult(),
                        "timestamp", (Object) log.getTimestamp()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }
}