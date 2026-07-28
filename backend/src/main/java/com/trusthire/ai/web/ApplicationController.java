package com.trusthire.ai.web;

import com.trusthire.ai.domain.ApplicationStatus;
import com.trusthire.ai.service.ApplicationService;
import com.trusthire.ai.service.AuditTrailService;
import com.trusthire.ai.service.ReceiptService;
import com.trusthire.ai.web.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class ApplicationController {

    private final ApplicationService applicationService;
    private final AuditTrailService auditTrailService;
    private final ReceiptService receiptService;

    public ApplicationController(ApplicationService applicationService,
                                 AuditTrailService auditTrailService,
                                 ReceiptService receiptService) {
        this.applicationService = applicationService;
        this.auditTrailService = auditTrailService;
        this.receiptService = receiptService;
    }

    // POST /api/drives/{driveId}/applications
    @PostMapping("/drives/{driveId}/applications")
    @ResponseStatus(HttpStatus.CREATED)
    public ApplicationResponse apply(@PathVariable String driveId,
                                     @Valid @RequestBody ApplicationCreateRequest request) {
        return ApplicationResponse.from(applicationService.apply(request.studentId(), driveId));
    }

    // GET /api/applications/{id}
    @GetMapping("/applications/{id}")
    public ApplicationResponse getById(@PathVariable String id) {
        return ApplicationResponse.from(applicationService.getById(id));
    }

    // GET /api/students/{studentId}/applications
    @GetMapping("/students/{studentId}/applications")
    public List<ApplicationResponse> getByStudent(@PathVariable String studentId) {
        return applicationService.getByStudentId(studentId).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    // GET /api/drives/{driveId}/applications (for coordinator)
    @GetMapping("/drives/{driveId}/applications")
    public List<ApplicationResponse> getByDrive(@PathVariable String driveId) {
        return applicationService.getByDriveId(driveId).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    // GET /api/applications (all — coordinator view)
    @GetMapping("/applications")
    public List<ApplicationResponse> getAll() {
        return applicationService.getAll().stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    // PATCH /api/applications/{id}/status
    @PatchMapping("/applications/{id}/status")
    public StatusUpdateResponse updateStatus(@PathVariable String id,
                                             @Valid @RequestBody StatusUpdateRequest request) {
        ApplicationStatus newStatus = parseStatus(request.newStatus());
        var before = applicationService.getById(id);
        var oldStatus = before.getStatus().name();
        applicationService.updateStatus(id, newStatus);
        return new StatusUpdateResponse(id, oldStatus, newStatus.name());
    }

    // GET /api/applications/{id}/audit
    @GetMapping("/applications/{id}/audit")
    public List<AuditEventResponse> getAuditChain(@PathVariable String id) {
        // ensure application exists
        applicationService.getById(id);
        return auditTrailService.getChain(id).stream()
                .map(AuditEventResponse::from)
                .collect(Collectors.toList());
    }

    // GET /api/applications/{id}/receipt
    @GetMapping("/applications/{id}/receipt")
    public ReceiptService.Receipt getReceipt(@PathVariable String id) {
        return receiptService.issue(id);
    }

    // POST /api/verify
    @PostMapping("/verify")
    public VerifyResponse verify(@RequestBody ReceiptService.Receipt receipt) {
        ReceiptService.VerificationResult result = receiptService.verify(receipt);
        return new VerifyResponse(result.valid(), result.reason());
    }

    private ApplicationStatus parseStatus(String raw) {
        try {
            return ApplicationStatus.valueOf(raw.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new com.trusthire.ai.exception.InvalidTransitionException(
                    "Unknown status: " + raw + ". Valid values: SUBMITTED, UNDER_REVIEW, SHORTLISTED, SELECTED, REJECTED, WITHDRAWN"
            );
        }
    }

    // Simple inline response records
    public record StatusUpdateResponse(String applicationId, String oldStatus, String newStatus) {}
    public record VerifyResponse(boolean valid, String reason) {}
}
