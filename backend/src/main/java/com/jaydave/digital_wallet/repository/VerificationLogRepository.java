package com.jaydave.digital_wallet.repository;

import com.jaydave.digital_wallet.entity.VerificationLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VerificationLogRepository extends JpaRepository<VerificationLog, Long> {
}
