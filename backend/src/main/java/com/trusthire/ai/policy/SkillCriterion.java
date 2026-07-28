package com.trusthire.ai.policy;

import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/** Checks that the student has at least one of the drive's required skills. */
@Component
public class SkillCriterion implements Criterion {

    @Override
    public Optional<String> check(Student student, PlacementDrive drive) {
        List<String> required = drive.getRequiredSkills();
        if (required == null || required.isEmpty()) return Optional.empty();

        List<String> studentSkillsLower = student.getSkills().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toList());

        List<String> missingSkills = required.stream()
                .filter(skill -> !studentSkillsLower.contains(skill.toLowerCase()))
                .collect(Collectors.toList());

        if (missingSkills.isEmpty()) return Optional.empty();

        return Optional.of(
                "Missing required skill(s): " + String.join(", ", missingSkills)
        );
    }
}
