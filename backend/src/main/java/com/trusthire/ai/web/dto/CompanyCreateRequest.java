package com.trusthire.ai.web.dto;

import jakarta.validation.constraints.NotBlank;

public record CompanyCreateRequest(
        @NotBlank(message = "name is required") String name,
        String sector,
        String description
) {}
