package com.trusthire.ai.service;

import com.trusthire.ai.domain.*;
import com.trusthire.ai.exception.DuplicateResourceException;
import com.trusthire.ai.exception.IneligibleException;
import com.trusthire.ai.exception.InvalidTransitionException;
import com.trusthire.ai.policy.*;
import com.trusthire.ai.repository.*;
import com.trusthire.ai.security.HashChain;
import com.trusthire.ai.security.ResultSigner;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Service-layer tests — no Spring context, no Ollama required.
 */
class ApplicationServiceTest {

    private ApplicationService applicationService;
    private AuditTrailService auditTrailService;
    private StudentRepository studentRepository;
    private DriveRepository driveRepository;
    private ApplicationRepository applicationRepository;

    private Student eligibleStudent;
    private PlacementDrive drive;

    @BeforeEach
    void setUp() {
        studentRepository = new InMemoryStudentRepository();
        DriveRepository driveRepo = new InMemoryDriveRepository();
        driveRepository = driveRepo;
        applicationRepository = new InMemoryApplicationRepository();
        AuditEventRepository auditEventRepository = new InMemoryAuditEventRepository();
        HashChain hashChain = new HashChain();
        auditTrailService = new AuditTrailService(auditEventRepository, hashChain);

        ResultSigner signer = new ResultSigner("test-secret");
        EligibilityPolicy policy = new CompositeEligibilityPolicy(List.of(
                new CgpaCriterion(), new BacklogCriterion(),
                new SkillCriterion(), new ProgrammeYearCriterion()
        ));
        EligibilityService eligibilityService = new EligibilityService(
                policy, studentRepository, driveRepo, signer);

        applicationService = new ApplicationService(
                applicationRepository, studentRepository, driveRepo,
                eligibilityService, auditTrailService);

        // Seed data
        eligibleStudent = new Student("STU-001", "Alice", "alice@test.com",
                "Computer Science", 2025, 8.5, 0, List.of("Java", "Spring Boot"));
        studentRepository.save(eligibleStudent);

        EligibilityCriteria criteria = new EligibilityCriteria(7.0, 1,
                List.of("Computer Science"), 2025);
        drive = new PlacementDrive("DRV-001", "CMP-001", "Software Engineer",
                "Bangalore", "12 LPA", Instant.now().plusSeconds(86400),
                List.of("Java", "Spring Boot"), criteria);
        driveRepository.save(drive);
    }

    @Test
    void eligibleStudentCanApply() {
        Application app = applicationService.apply("STU-001", "DRV-001");
        assertNotNull(app.getId());
        assertEquals(ApplicationStatus.SUBMITTED, app.getStatus());
        assertEquals("STU-001", app.getStudentId());
    }

    @Test
    void duplicateApplicationIsRejected() {
        applicationService.apply("STU-001", "DRV-001");
        assertThrows(DuplicateResourceException.class,
                () -> applicationService.apply("STU-001", "DRV-001"));
    }

    @Test
    void ineligibleStudentCannotApply() {
        Student ineligible = new Student("STU-002", "Bob", "bob@test.com",
                "Computer Science", 2025, 5.0, 5, List.of());
        studentRepository.save(ineligible);

        assertThrows(IneligibleException.class,
                () -> applicationService.apply("STU-002", "DRV-001"));
    }

    @Test
    void validStatusTransitionUpdatesAndRecordsAudit() {
        Application app = applicationService.apply("STU-001", "DRV-001");
        applicationService.updateStatus(app.getId(), ApplicationStatus.UNDER_REVIEW);

        Application updated = applicationService.getById(app.getId());
        assertEquals(ApplicationStatus.UNDER_REVIEW, updated.getStatus());

        List<AuditEvent> chain = auditTrailService.getChain(app.getId());
        assertEquals(1, chain.size());
        assertEquals(ApplicationStatus.SUBMITTED, chain.get(0).getFromStatus());
        assertEquals(ApplicationStatus.UNDER_REVIEW, chain.get(0).getToStatus());
    }

    @Test
    void invalidStatusTransitionIsRejected() {
        Application app = applicationService.apply("STU-001", "DRV-001");
        assertThrows(InvalidTransitionException.class,
                () -> applicationService.updateStatus(app.getId(), ApplicationStatus.SELECTED));
    }

    @Test
    void auditChainIsVerifiableAfterMultipleTransitions() {
        Application app = applicationService.apply("STU-001", "DRV-001");
        applicationService.updateStatus(app.getId(), ApplicationStatus.UNDER_REVIEW);
        applicationService.updateStatus(app.getId(), ApplicationStatus.SHORTLISTED);
        applicationService.updateStatus(app.getId(), ApplicationStatus.SELECTED);

        assertTrue(auditTrailService.verifyChain(app.getId()));
        assertEquals(3, auditTrailService.getChain(app.getId()).size());
    }
}
