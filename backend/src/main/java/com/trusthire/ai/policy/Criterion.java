package com.trusthire.ai.policy;

import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;

import java.util.Optional;

/**
 * Strategy contract for a single eligibility criterion.
 * Each implementation checks one rule and returns a human-readable failure
 * reason (empty = criterion met).
 *
 * PRIVACY NOTE: implementations may read student.getCgpa() / getActiveBacklogs()
 * internally but must NEVER expose those values in the returned reason string.
 */
public interface Criterion {
    /**
     * @return empty Optional if student meets this criterion for the given drive,
     *         or a non-empty Optional containing a human-readable reason why not.
     */
    Optional<String> check(Student student, PlacementDrive drive);
}
