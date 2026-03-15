package com.jaydave.digital_wallet.dto;

import com.jaydave.digital_wallet.entity.User;

public class UserResponse {

    private String email;
    private String name;
    private String didWalletId;

    public UserResponse(User user) {
        this.email = user.getEmail();
        this.name = user.getName();
        // Check if wallet exists
        this.didWalletId = user.getWallet() != null ? user.getWallet().getDidWalletId() : null;
    }

    // Getters
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getDidWalletId() { return didWalletId; }
}
