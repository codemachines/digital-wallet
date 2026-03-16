package com.jaydave.digital_wallet.controller;

import com.jaydave.digital_wallet.dto.CredentialResponse;
import com.jaydave.digital_wallet.entity.Credential;
import com.jaydave.digital_wallet.entity.CredentialShareToken;
import com.jaydave.digital_wallet.entity.User;
import com.jaydave.digital_wallet.repository.UserRepository;
import com.jaydave.digital_wallet.service.CredentialService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private CredentialService credentialService;

    @Autowired
    private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String email = (String) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/credentials")
    public ResponseEntity<List<CredentialResponse>> getWalletCredentials() {
        User user = getAuthenticatedUser();
        java.util.UUID walletId = user.getWallet().getWalletId();
        String subjectDid = user.getWallet().getDidWalletId();
        return ResponseEntity.ok(credentialService.getCredentialsByWalletId(walletId, subjectDid));
    }

    @GetMapping("/credentials/{id}")
    public ResponseEntity<CredentialResponse> getCredential(@PathVariable String id) {
        return ResponseEntity.ok(credentialService.getCredentialById(id));
    }

    @PostMapping("/share/{id}")
    public ResponseEntity<?> shareCredential(@PathVariable String id) {
        CredentialShareToken token = credentialService.generateSharingToken(id, 3600); // 1 hour
        return ResponseEntity.ok(Map.of("presentationToken", token.getToken(), "expiresIn", 3600));
    }
}
