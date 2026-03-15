package com.jaydave.digital_wallet.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "credential")
public class Credential {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid")
    private UUID id;

    private String type;

    private String issuerDid;

    private String subjectDid;

    private String issuedAt;

    private String encryptedClaims;

    @Column(columnDefinition = "TEXT")
    private String signature;

    private String hash;

    @ManyToOne
    @JoinColumn(name = "walletId", columnDefinition = "uuid")
    private Wallet wallet;

    private LocalDateTime expiryAt;  // when the credential expires
    private boolean revoked = false; // revocation status

    public Credential() {
    }
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getIssuerDid() {
        return issuerDid;
    }

    public void setIssuerDid(String issuerDid) {
        this.issuerDid = issuerDid;
    }

    public String getSubjectDid() {
        return subjectDid;
    }

    public void setSubjectDid(String subjectDid) {
        this.subjectDid = subjectDid;
    }

    public String getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(String issuedAt) {
        this.issuedAt = issuedAt;
    }

    public String getEncryptedClaims() {
        return encryptedClaims;
    }

    public void setEncryptedClaims(String encryptedClaims) {
        this.encryptedClaims = encryptedClaims;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public Wallet getWallet() {
        return wallet;
    }

    public void setWallet(Wallet wallet) {
        this.wallet = wallet;
    }

    public LocalDateTime getExpiryAt() { return expiryAt; }
    public void setExpiryAt(LocalDateTime expiryAt) { this.expiryAt = expiryAt; }

    public boolean isRevoked() { return revoked; }
    public void setRevoked(boolean revoked) { this.revoked = revoked; }
}
