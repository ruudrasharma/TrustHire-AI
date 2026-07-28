package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record DriveCreateRequest(
        @NotBlank(message = "companyId is required") String companyId,
        @NotBlank(message = "role is required") String role,
        String location,
        String packageOffered,
        @NotNull(message = "deadline is required") String deadline, // ISO-8601 string
        List<String> requiredSkills,
        @DecimalMin("0.0") @DecimalMax("10.0") double minCgpa,
        @Min(0) int maxActiveBacklogs,
        List<String> eligibleProgrammes,
        int minGraduationYear
) {}
