package com.trusthire.ai.policy;

import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import org.springframework.stereotype.Component;

import java.util.Optional;

/** Checks that the student's active backlogs do not exceed the drive's maximum. */
@Component
public class BacklogCriterion implements Criterion {

    @Override
    public Optional<String> check(Student student, PlacementDrive drive) {
        int maxAllowed = drive.getEligibilityCriteria().getMaxActiveBacklogs();
        if (student.getActiveBacklogs() <= maxAllowed) {
            return Optional.empty();
        }
        return Optional.of(
                String.format("Active backlogs exceed the maximum allowed (%d)", maxAllowed)
        );
    }
}
