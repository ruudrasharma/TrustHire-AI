package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ApplicationCreateRequest(
        @NotBlank(message = "studentId is required") String studentId
) {}
