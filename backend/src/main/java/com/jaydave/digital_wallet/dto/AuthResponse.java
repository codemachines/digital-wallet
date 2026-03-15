package com.jaydave.digital_wallet.dto;

import com.jaydave.digital_wallet.entity.User;
import org.springframework.stereotype.Component;

public class AuthResponse {

    private String token;
    private String name;
    private String email;
    private String didWalletId;

    private String role;

    public AuthResponse(String token, String name, String email, String didWalletId, String role) {
        this.token = token;
        this.name = name;
        this.email = email;
        this.didWalletId = didWalletId;
        this.role = role;
    }

    public String getToken() { return token; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getDidWalletId() { return didWalletId; }
    public String getRole() { return role; }
}
