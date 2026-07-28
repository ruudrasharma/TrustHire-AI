package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.*;
import java.util.List;

public record StudentUpdateRequest(
        String name,
        String programme,
        int graduationYear,
        @DecimalMin(value = "0.0") @DecimalMax(value = "10.0") double cgpa,
        @Min(0) int activeBacklogs,
        List<String> skills
) {}
