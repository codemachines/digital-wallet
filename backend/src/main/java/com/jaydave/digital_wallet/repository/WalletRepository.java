package com.jaydave.digital_wallet.repository;

import com.jaydave.digital_wallet.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface WalletRepository extends JpaRepository<Wallet, UUID> {

    Optional<Wallet> findByDidWalletId(String didWalletId);
}
