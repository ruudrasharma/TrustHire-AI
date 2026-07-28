package com.trusthire.ai.web.dto;

import com.trusthire.ai.domain.Company;

public record CompanyResponse(String id, String name, String sector, String description) {
    public static CompanyResponse from(Company c) {
        return new CompanyResponse(c.getId(), c.getName(), c.getSector(), c.getDescription());
    }
}
