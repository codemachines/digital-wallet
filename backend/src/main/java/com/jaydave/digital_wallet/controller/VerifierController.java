package com.jaydave.digital_wallet.controller;

import com.jaydave.digital_wallet.entity.Credential;
import com.jaydave.digital_wallet.service.CredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/")
public class VerifierController {

    @Autowired
    private CredentialService credentialService;

    /**
     * POST /verify
     *
     * Accepts either:
     *   { "token": "<share-token-uuid OR credential-uuid>" }
     *   { "credentialId": "<credential-uuid>" }
     *
     * Smart routing:
     *   1. If "token" given → try as share token first.
     *   2. If "Token not found", try the same uuid as a direct credential ID.
     *   3. If "credentialId" given → verify directly.
     */
    @PostMapping("/verify")
    public ResponseEntity<?> verifyCredential(@RequestBody Map<String, String> request) {
        try {
            String token      = request.get("token");
            String credentialId = request.get("credentialId");

            // ── Path 1: token provided (could be share token OR credential UUID) ──
            if (token != null && !token.isBlank()) {

                // 1a. Try as a share token first
                try {
                    Map<String, Object> result = credentialService.verifyByShareToken(token);
                    String status = (String) result.get("status");
                    return "VERIFIED".equals(status)
                            ? ResponseEntity.ok(result)
                            : ResponseEntity.badRequest().body(result);
                } catch (RuntimeException shareEx) {
                    // "Token not found" → fall through and try as a direct credential UUID
                    if (!shareEx.getMessage().contains("Token not found")
                            && !shareEx.getMessage().contains("Invalid token format")) {
                        // Real error (e.g. token expired) — surface it properly
                        return ResponseEntity.badRequest().body(Map.of(
                                "status", "INVALID_SIGNATURE",
                                "issuer", "",
                                "issuedDate", "",
                                "error", shareEx.getMessage()
                        ));
                    }
                }

                // 1b. Treat the token value as a credential UUID
                credentialId = token;
            }

            // ── Path 2: verify by credential UUID ──
            if (credentialId == null || credentialId.isBlank()) {
                return ResponseEntity.badRequest().body(
                        Map.of("error", "credentialId or token is required"));
            }

            String status = credentialService.verifyCredential(credentialId);
            Credential credential = credentialService.getCredentialEntityById(credentialId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", status);
            response.put("issuer", credential.getIssuerDid() != null ? credential.getIssuerDid() : "");
            response.put("issuedDate", credential.getIssuedAt() != null ? credential.getIssuedAt() : "");
            response.put("credentialId", credential.getId().toString());
            if (credential.getExpiryAt() != null) {
                response.put("expiryDate", credential.getExpiryAt().toString());
            }

            return "VERIFIED".equals(status)
                    ? ResponseEntity.ok(response)
                    : ResponseEntity.badRequest().body(response);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "status", "INVALID_SIGNATURE",
                    "issuer", "",
                    "issuedDate", ""
            ));
        }
    }

    /**
     * GET /verify/token/{token} — for QR code scan redirects
     */
    @GetMapping("/verify/token/{token}")
    public ResponseEntity<?> verifyByToken(@PathVariable String token) {
        try {
            Map<String, Object> result = credentialService.verifyByShareToken(token);
            String status = (String) result.get("status");
            return "VERIFIED".equals(status)
                    ? ResponseEntity.ok(result)
                    : ResponseEntity.badRequest().body(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", e.getMessage(),
                    "status", "INVALID_SIGNATURE"
            ));
        }
    }

    @PostMapping("/verify/present")
    public ResponseEntity<?> presentCredential(@RequestBody Map<String, Object> request) {
        try {
            String credentialId = (String) request.get("credentialId");
            List<String> fields = (List<String>) request.get("fields");
            Credential credential = credentialService.getCredentialEntityById(credentialId);

            Map<String, Object> claims = credentialService.decodeClaims(credential.getEncryptedClaims());
            Map<String, Object> disclosed = claims.entrySet().stream()
                    .filter(e -> fields.contains(e.getKey()))
                    .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

            String proof = credentialService.signData(credential.getHash(), credentialService.getPrivateKey());

            return ResponseEntity.ok(Map.of(
                    "credentialId", credential.getId(),
                    "disclosedClaims", disclosed,
                    "proof", proof
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/verification/logs")

    public ResponseEntity<?> getVerificationLogs() {
        List<Map<String, Object>> logs = credentialService.getAllVerificationLogs().stream()
                .map(log -> Map.<String, Object>of(
                        "credentialId", (Object) log.getCredentialId(),
                        "verifier",    (Object) log.getVerifier(),
                        "verificationResult", (Object) log.getVerificationResult(),
                        "timestamp",   (Object) log.getTimestamp()
                ))
                .collect(Collectors.toList());
        return ResponseEntity.ok(logs);
    }
}
