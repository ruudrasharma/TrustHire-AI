package com.trusthire.ai.service;

import com.trusthire.ai.domain.*;
import com.trusthire.ai.exception.DuplicateResourceException;
import com.trusthire.ai.exception.IneligibleException;
import com.trusthire.ai.exception.InvalidTransitionException;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.ApplicationRepository;
import com.trusthire.ai.repository.DriveRepository;
import com.trusthire.ai.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * ApplicationService — manages the full application lifecycle.
 * Every status change MUST go through updateStatus() to trigger AuditTrailService.record().
 */
@Service
public class ApplicationService {

    private static final Logger log = LoggerFactory.getLogger(ApplicationService.class);

    private final ApplicationRepository applicationRepository;
    private final StudentRepository studentRepository;
    private final DriveRepository driveRepository;
    private final EligibilityService eligibilityService;
    private final AuditTrailService auditTrailService;
    private final AtomicInteger idCounter = new AtomicInteger(1);

    public ApplicationService(ApplicationRepository applicationRepository,
                              StudentRepository studentRepository,
                              DriveRepository driveRepository,
                              EligibilityService eligibilityService,
                              AuditTrailService auditTrailService) {
        this.applicationRepository = applicationRepository;
        this.studentRepository = studentRepository;
        this.driveRepository = driveRepository;
        this.eligibilityService = eligibilityService;
        this.auditTrailService = auditTrailService;
    }

    public Application apply(String studentId, String driveId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));
        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new NotFoundException("Drive not found: " + driveId));

        // Deadline check
        if (Instant.now().isAfter(drive.getDeadline())) {
            throw new IneligibleException("Application deadline has passed for drive: " + driveId);
        }

        // Duplicate application check
        if (applicationRepository.existsByStudentIdAndDriveId(studentId, driveId)) {
            throw new DuplicateResourceException(
                    "Student " + studentId + " has already applied to drive " + driveId);
        }

        // Eligibility check
        EligibilityResult eligibility = eligibilityService.evaluate(student, drive);
        if (!eligibility.isEligible()) {
            throw new IneligibleException(
                    "Student " + studentId + " is not eligible for drive " + driveId
                            + ". Reasons: " + String.join("; ", eligibility.getReasons()));
        }

        String id = String.format("APP-%03d", idCounter.getAndIncrement());
        Application application = new Application(id, studentId, driveId);
        applicationRepository.save(application);
        log.info("Application {} created for student {} on drive {}", id, studentId, driveId);
        return application;
    }

    public Application updateStatus(String applicationId, ApplicationStatus newStatus) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new NotFoundException("Application not found: " + applicationId));

        ApplicationStatus oldStatus = application.getStatus();
        if (!oldStatus.canTransitionTo(newStatus)) {
            throw new InvalidTransitionException(
                    "Cannot transition application " + applicationId
                            + " from " + oldStatus + " to " + newStatus);
        }

        // Update status via the package-private setter
        application.setStatus(newStatus);
        applicationRepository.save(application);

        // Mandatory: record in the hash chain
        auditTrailService.record(applicationId, oldStatus, newStatus);

        log.info("Application {} status updated: {} → {}", applicationId, oldStatus, newStatus);
        return application;
    }

    public Application getById(String id) {
        return applicationRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Application not found: " + id));
    }

    public List<Application> getByStudentId(String studentId) {
        if (!studentRepository.existsById(studentId)) {
            throw new NotFoundException("Student not found: " + studentId);
        }
        return applicationRepository.findByStudentId(studentId);
    }

    public List<Application> getByDriveId(String driveId) {
        if (!driveRepository.existsById(driveId)) {
            throw new NotFoundException("Drive not found: " + driveId);
        }
        return applicationRepository.findByDriveId(driveId);
    }

    public List<Application> getAll() {
        return applicationRepository.findAll();
    }
}
