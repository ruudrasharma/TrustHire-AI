package com.trusthire.ai.policy;

import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Checks that the student's CGPA meets the drive's minimum.
 * Reason string says "meets" or "does not meet" the requirement — never the raw number.
 */
@Component
public class CgpaCriterion implements Criterion {

    @Override
    public Optional<String> check(Student student, PlacementDrive drive) {
        double required = drive.getEligibilityCriteria().getMinCgpa();
        if (required <= 0) return Optional.empty(); // no CGPA requirement
        if (student.getCgpa() >= required) {
            return Optional.empty(); // criterion met
        }
        return Optional.of(
                String.format("CGPA does not meet the minimum requirement of %.1f", required)
        );
    }
}
