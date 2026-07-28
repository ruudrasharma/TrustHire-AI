package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.NotBlank;

public record StatusUpdateRequest(
        @NotBlank(message = "newStatus is required") String newStatus
) {}
