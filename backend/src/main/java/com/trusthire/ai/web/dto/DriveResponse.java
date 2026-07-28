package com.trusthire.ai.web.dto;

import com.trusthire.ai.domain.PlacementDrive;
import java.util.List;

public record DriveResponse(
        String id,
        String companyId,
        String role,
        String location,
        String packageOffered,
        String deadline,
        String status,
        List<String> requiredSkills,
        double minCgpa,
        int maxActiveBacklogs,
        List<String> eligibleProgrammes,
        int minGraduationYear
) {
    public static DriveResponse from(PlacementDrive d) {
        return new DriveResponse(
                d.getId(),
                d.getCompanyId(),
                d.getRole(),
                d.getLocation(),
                d.getPackageOffered(),
                d.getDeadline().toString(),
                d.getStatus().name(),
                d.getRequiredSkills(),
                d.getEligibilityCriteria().getMinCgpa(),
                d.getEligibilityCriteria().getMaxActiveBacklogs(),
                d.getEligibilityCriteria().getEligibleProgrammes(),
                d.getEligibilityCriteria().getMinGraduationYear()
        );
    }
}
