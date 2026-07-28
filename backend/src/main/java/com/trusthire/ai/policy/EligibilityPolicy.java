package com.trusthire.ai.policy;

import com.trusthire.ai.domain.EligibilityResult;
import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;

/**
 * Single entry point for all eligibility logic.
 * Controllers and services must use ONLY this interface — never compute eligibility inline.
 */
public interface EligibilityPolicy {
    /**
     * Evaluate the student's eligibility for the given drive.
     * Returns an unsigned EligibilityResult — the service layer signs it before returning.
     */
    EligibilityResult evaluate(Student student, PlacementDrive drive);
}
