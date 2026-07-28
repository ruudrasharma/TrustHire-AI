package com.trusthire.ai.service;

import com.trusthire.ai.domain.EligibilityResult;
import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.policy.EligibilityPolicy;
import com.trusthire.ai.repository.DriveRepository;
import com.trusthire.ai.repository.StudentRepository;
import com.trusthire.ai.security.ResultSigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * EligibilityService — the ONLY place that calls EligibilityPolicy.evaluate().
 * Signs every result before returning it. No controller or other service may
 * compute eligibility inline.
 */
@Service
public class EligibilityService {

    private static final Logger log = LoggerFactory.getLogger(EligibilityService.class);

    private final EligibilityPolicy eligibilityPolicy;
    private final StudentRepository studentRepository;
    private final DriveRepository driveRepository;
    private final ResultSigner resultSigner;

    public EligibilityService(EligibilityPolicy eligibilityPolicy,
                              StudentRepository studentRepository,
                              DriveRepository driveRepository,
                              ResultSigner resultSigner) {
        this.eligibilityPolicy = eligibilityPolicy;
        this.studentRepository = studentRepository;
        this.driveRepository = driveRepository;
        this.resultSigner = resultSigner;
    }

    /**
     * Evaluate and sign. Returns a signed EligibilityResult — signature is always present.
     */
    public EligibilityResult evaluate(String studentId, String driveId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));
        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new NotFoundException("Drive not found: " + driveId));

        EligibilityResult result = eligibilityPolicy.evaluate(student, drive);
        resultSigner.sign(result); // ALWAYS sign before returning

        log.info("Eligibility evaluated for student {} on drive {}: eligible={}",
                studentId, driveId, result.isEligible());
        return result;
    }

    /**
     * Overload that accepts already-fetched entities — used internally by ApplicationService.
     */
    public EligibilityResult evaluate(Student student, PlacementDrive drive) {
        EligibilityResult result = eligibilityPolicy.evaluate(student, drive);
        resultSigner.sign(result);
        return result;
    }
}
