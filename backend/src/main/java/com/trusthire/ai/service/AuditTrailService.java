package com.trusthire.ai.service;

import com.trusthire.ai.domain.AuditEvent;
import com.trusthire.ai.domain.Application;
import com.trusthire.ai.domain.ApplicationStatus;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.AuditEventRepository;
import com.trusthire.ai.security.HashChain;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

/**
 * AuditTrailService — maintains the per-application hash chain.
 *
 * record() is called automatically by ApplicationService.updateStatus() on every
 * successful transition. No code path may change Application.status without
 * triggering record().
 */
@Service
public class AuditTrailService {

    private static final Logger log = LoggerFactory.getLogger(AuditTrailService.class);

    private final AuditEventRepository auditEventRepository;
    private final HashChain hashChain;

    public AuditTrailService(AuditEventRepository auditEventRepository, HashChain hashChain) {
        this.auditEventRepository = auditEventRepository;
        this.hashChain = hashChain;
    }

    /**
     * Appends a hash-chained AuditEvent for a status transition.
     * Must be called for every successful Application.status change.
     */
    public AuditEvent record(String applicationId, ApplicationStatus from, ApplicationStatus to) {
        String prevHash = auditEventRepository.findLatestByApplicationId(applicationId)
                .map(AuditEvent::getHash)
                .orElseGet(() -> hashChain.genesisHash(applicationId));

        Instant now = Instant.now();
        String timestampIso = now.toString();
        String hash = hashChain.computeHash(prevHash, applicationId, from.name(), to.name(), timestampIso);

        AuditEvent event = new AuditEvent(applicationId, from, to, now, prevHash, hash);
        auditEventRepository.save(event);

        log.info("Audit event recorded for application {}: {} → {} (hash: {}...)",
                applicationId, from, to, hash.substring(0, 8));
        return event;
    }

    public List<AuditEvent> getChain(String applicationId) {
        return auditEventRepository.findByApplicationId(applicationId);
    }

    public String getChainTipHash(String applicationId) {
        return auditEventRepository.findLatestByApplicationId(applicationId)
                .map(AuditEvent::getHash)
                .orElse(null);
    }

    /**
     * Recomputes the full chain from scratch and returns true if every link is valid.
     */
    public boolean verifyChain(String applicationId) {
        List<AuditEvent> events = auditEventRepository.findByApplicationId(applicationId);
        if (events.isEmpty()) return true;

        String expectedPrevHash = hashChain.genesisHash(applicationId);
        for (AuditEvent event : events) {
            if (!event.getPrevHash().equals(expectedPrevHash)) return false;
            boolean hashValid = hashChain.verify(
                    event.getPrevHash(), applicationId,
                    event.getFromStatus().name(), event.getToStatus().name(),
                    event.getTimestamp().toString(), event.getHash()
            );
            if (!hashValid) return false;
            expectedPrevHash = event.getHash();
        }
        return true;
    }
}
