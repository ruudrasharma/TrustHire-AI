package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank(message = "studentId is required") String studentId,
        String driveId,  // optional
        @NotBlank(message = "message is required") String message,
        String intent    // optional: "faq" | "eligibility" | "preparation" | "profile"
) {}
