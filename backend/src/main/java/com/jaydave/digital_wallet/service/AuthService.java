package com.jaydave.digital_wallet.service;

import com.jaydave.digital_wallet.dto.AuthResponse;
import com.jaydave.digital_wallet.dto.LoginRequest;
import com.jaydave.digital_wallet.dto.RegisterRequest;
import com.jaydave.digital_wallet.entity.User;
import com.jaydave.digital_wallet.entity.Wallet;
import com.jaydave.digital_wallet.repository.UserRepository;
import com.jaydave.digital_wallet.repository.WalletRepository;
import com.jaydave.digital_wallet.security.JwtUtil;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WalletRepository walletRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;
    @Transactional
    public AuthResponse register(RegisterRequest request) {

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        Wallet wallet = new Wallet();
        wallet.setDidWalletId("did:wallet:" + UUID.randomUUID().toString().replace("-", ""));
        wallet.setHolder(user);
        walletRepository.save(wallet);

        user.setWallet(wallet);

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, user.getName(), user.getEmail(), wallet.getDidWalletId(), user.getRole());
    }

    public AuthResponse login(LoginRequest request) {

        User user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return new AuthResponse(token, user.getName(), user.getEmail(), user.getWallet().getDidWalletId(), user.getRole());
    }
}
