package com.jaydave.digital_wallet.controller;

import com.jaydave.digital_wallet.dto.CredentialResponse;
import com.jaydave.digital_wallet.dto.IssueCredentialRequest;
import com.jaydave.digital_wallet.entity.Credential;
import com.jaydave.digital_wallet.entity.User;
import com.jaydave.digital_wallet.repository.UserRepository;
import com.jaydave.digital_wallet.service.CredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/issuer")
public class IssuerController {

    @Autowired
    private CredentialService credentialService;

    @Autowired
    private UserRepository userRepository;

    private String getAuthenticatedIssuerDid() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        return user.getWallet().getDidWalletId();
    }

    @GetMapping("/credentials")
    public ResponseEntity<List<CredentialResponse>> getIssuedCredentials() {
        String issuerDid = getAuthenticatedIssuerDid();
        return ResponseEntity.ok(credentialService.getCredentialsByIssuer(issuerDid));
    }

    @PostMapping("/credential")
    public Credential issueCredential(@RequestBody IssueCredentialRequest request) {
        // Always derive issuerDid from the authenticated JWT token, never trust the client
        request.setIssuerDid(getAuthenticatedIssuerDid());
        return credentialService.issueCredential(request);
    }

    @PostMapping("/revoke/{id}")
    public ResponseEntity<?> revokeCredential(@PathVariable String id) {
        credentialService.revokeCredential(id);
        return ResponseEntity.ok(Map.of("status", "REVOKED", "message", "Credential has been revoked"));
    }
}
