package com.trusthire.ai.web.dto;

import com.trusthire.ai.domain.Application;

public record ApplicationResponse(
        String id,
        String studentId,
        String driveId,
        String status,
        String submittedAt
) {
    public static ApplicationResponse from(Application a) {
        return new ApplicationResponse(
                a.getId(), a.getStudentId(), a.getDriveId(),
                a.getStatus().name(), a.getSubmittedAt().toString()
        );
    }
}
