package com.jaydave.digital_wallet.repository;

import com.jaydave.digital_wallet.entity.Credential;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CredentialRepository extends JpaRepository<Credential, String> {

    List<Credential> findByWallet_WalletId(UUID walletId);

    List<Credential> findBySubjectDid(String subjectDid);
}
