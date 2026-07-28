package com.trusthire.ai.service;

import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.ApplicationRepository;
import com.trusthire.ai.security.ResultSigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;

/**
 * ReceiptService — issues a portable, signed application receipt.
 *
 * Reuses ResultSigner (no second signing mechanism introduced).
 * POST /api/verify works statelessly from the receipt JSON alone.
 */
@Service
public class ReceiptService {

    private static final Logger log = LoggerFactory.getLogger(ReceiptService.class);

    private final ApplicationRepository applicationRepository;
    private final AuditTrailService auditTrailService;
    private final ResultSigner resultSigner;

    public ReceiptService(ApplicationRepository applicationRepository,
                          AuditTrailService auditTrailService,
                          ResultSigner resultSigner) {
        this.applicationRepository = applicationRepository;
        this.auditTrailService = auditTrailService;
        this.resultSigner = resultSigner;
    }

    public Receipt issue(String applicationId) {
        var application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));

        String chainTipHash = auditTrailService.getChainTipHash(applicationId);
        Instant issuedAt = Instant.now();

        String canonical = buildCanonical(applicationId, application.getStudentId(),
                application.getDriveId(), application.getStatus().name(),
                chainTipHash, issuedAt.toString());

        String signature = resultSigner.signPayload(canonical);

        log.info("Receipt issued for application {}", applicationId);
        return new Receipt(applicationId, application.getStudentId(), application.getDriveId(),
                application.getStatus().name(), chainTipHash, issuedAt.toString(), signature);
    }

    /**
     * Stateless verification — only the submitted JSON is used; no repository lookup.
     */
    public VerificationResult verify(Receipt receipt) {
        String canonical = buildCanonical(
                receipt.applicationId(), receipt.studentId(), receipt.driveId(),
                receipt.status(), receipt.chainTipHash(), receipt.issuedAt());

        boolean valid = resultSigner.verifyPayload(canonical, receipt.signature());
        String reason = valid ? null : "Signature mismatch — receipt may have been tampered with";
        return new VerificationResult(valid, reason);
    }

    private String buildCanonical(String applicationId, String studentId, String driveId,
                                   String status, String chainTipHash, String issuedAt) {
        return "applicationId=" + applicationId
                + ";studentId=" + studentId
                + ";driveId=" + driveId
                + ";status=" + status
                + ";chainTipHash=" + (chainTipHash != null ? chainTipHash : "NONE")
                + ";issuedAt=" + issuedAt;
    }

    // --- Nested records (small data carriers, no DTOs needed at this layer) ---

    public record Receipt(
            String applicationId,
            String studentId,
            String driveId,
            String status,
            String chainTipHash,
            String issuedAt,
            String signature
    ) {}

    public record VerificationResult(boolean valid, String reason) {}
}
