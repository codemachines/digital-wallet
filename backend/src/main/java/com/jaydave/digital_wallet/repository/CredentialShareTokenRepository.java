package com.jaydave.digital_wallet.repository;

import com.jaydave.digital_wallet.entity.CredentialShareToken;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CredentialShareTokenRepository extends JpaRepository<CredentialShareToken, UUID> {

    Optional<CredentialShareToken> findByToken(UUID token);
}
