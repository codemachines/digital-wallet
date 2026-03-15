package com.jaydave.digital_wallet.service;

import com.jaydave.digital_wallet.entity.User;
import com.jaydave.digital_wallet.entity.Wallet;
import com.jaydave.digital_wallet.repository.UserRepository;
import com.jaydave.digital_wallet.repository.WalletRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WalletService {

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private UserRepository userRepository;

    public Wallet createWallet(String email) {

        User user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Wallet wallet = new Wallet();

        wallet.setHolder(user);

        return walletRepository.save(wallet);
    }
}
