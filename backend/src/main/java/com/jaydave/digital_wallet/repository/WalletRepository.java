package com.jaydave.digital_wallet.repository;

import com.jaydave.digital_wallet.entity.Wallet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, String> {

    Optional<Wallet> findByDidWalletId(String didWalletId);
}
