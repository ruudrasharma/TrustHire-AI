package com.trusthire.ai.policy;

import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

/** Checks programme and graduation year eligibility for the drive. */
@Component
public class ProgrammeYearCriterion implements Criterion {

    @Override
    public Optional<String> check(Student student, PlacementDrive drive) {
        List<String> eligibleProgrammes = drive.getEligibilityCriteria().getEligibleProgrammes();
        int minGradYear = drive.getEligibilityCriteria().getMinGraduationYear();

        if (eligibleProgrammes != null && !eligibleProgrammes.isEmpty()) {
            boolean programmeMatch = eligibleProgrammes.stream()
                    .anyMatch(p -> p.equalsIgnoreCase(student.getProgramme()));
            if (!programmeMatch) {
                return Optional.of(
                        "Programme '" + student.getProgramme() + "' is not eligible for this drive. "
                                + "Eligible programmes: " + String.join(", ", eligibleProgrammes)
                );
            }
        }

        if (minGradYear > 0 && student.getGraduationYear() < minGradYear) {
            return Optional.of(
                    "Graduation year " + student.getGraduationYear()
                            + " does not meet the minimum graduation year of " + minGradYear
            );
        }

        return Optional.empty();
    }
}
