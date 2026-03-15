package com.jaydave.digital_wallet.entity;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "wallet")
public class Wallet {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID walletId;

    @Column(unique = true)
    private String didWalletId;

    @OneToOne
    @JoinColumn(name = "id", columnDefinition = "uuid")
    private User holder;

    public Wallet() {
    }

    public UUID getWalletId() {
        return walletId;
    }

    public void setWalletId(UUID walletId) {
        this.walletId = walletId;
    }

    public User getHolder() {
        return holder;
    }

    public void setHolder(User holder) {
        this.holder = holder;
    }

    public String getDidWalletId() {
        return didWalletId;
    }

    public void setDidWalletId(String didWalletId) {
        this.didWalletId = didWalletId;
    }
}
