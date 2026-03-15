package com.jaydave.digital_wallet.controller;

import com.jaydave.digital_wallet.entity.Wallet;
import com.jaydave.digital_wallet.service.WalletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/wallet")
public class WalletController {

    @Autowired
    private WalletService walletService;

    @PostMapping("/create")
    public Wallet createWallet(@RequestParam String email) {

        return walletService.createWallet(email);
    }
}
