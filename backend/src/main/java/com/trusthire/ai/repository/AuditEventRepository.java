package com.trusthire.ai.repository;

import com.trusthire.ai.domain.AuditEvent;
import java.util.List;
import java.util.Optional;

public interface AuditEventRepository {
    AuditEvent save(AuditEvent event);
    List<AuditEvent> findByApplicationId(String applicationId);
    Optional<AuditEvent> findLatestByApplicationId(String applicationId);
}
