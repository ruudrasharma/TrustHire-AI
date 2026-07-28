package com.trusthire.ai.web.dto;

import com.trusthire.ai.domain.Student;
import java.util.List;

/**
 * PRIVACY: no cgpa or activeBacklogs in this response — those never cross the API boundary.
 */
public record StudentResponse(
        String id,
        String name,
        String email,
        String programme,
        int graduationYear,
        List<String> skills
) {
    public static StudentResponse from(Student student) {
        return new StudentResponse(
                student.getId(),
                student.getName(),
                student.getEmail(),
                student.getProgramme(),
                student.getGraduationYear(),
                student.getSkills()
        );
    }
}
