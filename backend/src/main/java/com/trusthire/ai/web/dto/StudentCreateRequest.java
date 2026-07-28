package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record StudentCreateRequest(
        @NotBlank(message = "name is required") String name,
        @NotBlank(message = "email is required") @Email(message = "email must be valid") String email,
        @NotBlank(message = "programme is required") String programme,
        @Min(value = 2020, message = "graduationYear must be 2020 or later") int graduationYear,
        @DecimalMin(value = "0.0") @DecimalMax(value = "10.0") double cgpa,
        @Min(0) int activeBacklogs,
        List<String> skills
) {}
