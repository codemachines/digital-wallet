package com.jaydave.digital_wallet.repository;

import com.jaydave.digital_wallet.entity.Credential;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CredentialRepository extends JpaRepository<Credential, UUID> {

    List<Credential> findByWallet_WalletId(UUID walletId);

    List<Credential> findBySubjectDid(String subjectDid);
    List<Credential> findByIssuerDid(String issuerDid);

    /** Covers both new credentials (wallet FK set) and old ones (wallet_id=null, matched by subjectDid) */
    @Query("SELECT DISTINCT c FROM Credential c WHERE c.wallet.walletId = :walletId OR c.subjectDid = :subjectDid")
    List<Credential> findByWalletIdOrSubjectDid(@Param("walletId") UUID walletId, @Param("subjectDid") String subjectDid);

    /** Direct column query — bypasses JPA first-level entity cache to always get fresh revoked status */
    @Query("SELECT c.revoked FROM Credential c WHERE c.id = :id")
    Optional<Boolean> findRevokedById(@Param("id") UUID id);
}
