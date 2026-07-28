package com.trusthire.ai.web;

import com.trusthire.ai.domain.EligibilityCriteria;
import com.trusthire.ai.service.DriveService;
import com.trusthire.ai.service.EligibilityService;
import com.trusthire.ai.web.dto.DriveCreateRequest;
import com.trusthire.ai.web.dto.DriveResponse;
import com.trusthire.ai.web.dto.EligibilityResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/drives")
public class DriveController {

    private final DriveService driveService;
    private final EligibilityService eligibilityService;

    public DriveController(DriveService driveService, EligibilityService eligibilityService) {
        this.driveService = driveService;
        this.eligibilityService = eligibilityService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DriveResponse create(@Valid @RequestBody DriveCreateRequest request) {
        EligibilityCriteria criteria = new EligibilityCriteria(
                request.minCgpa(), request.maxActiveBacklogs(),
                request.eligibleProgrammes(), request.minGraduationYear()
        );
        return DriveResponse.from(driveService.create(
                request.companyId(), request.role(), request.location(),
                request.packageOffered(), Instant.parse(request.deadline()),
                request.requiredSkills(), criteria
        ));
    }

    @GetMapping("/{id}")
    public DriveResponse getById(@PathVariable String id) {
        return DriveResponse.from(driveService.getById(id));
    }

    @GetMapping
    public List<DriveResponse> getAll(@RequestParam(required = false) String company,
                                      @RequestParam(required = false) String role) {
        return driveService.getAll().stream()
                .filter(d -> company == null || d.getCompanyId().equalsIgnoreCase(company))
                .filter(d -> role == null || d.getRole().toLowerCase().contains(role.toLowerCase()))
                .map(DriveResponse::from)
                .collect(Collectors.toList());
    }

    @GetMapping("/{driveId}/eligibility/{studentId}")
    public EligibilityResponse checkEligibility(@PathVariable String driveId,
                                                 @PathVariable String studentId) {
        return EligibilityResponse.from(eligibilityService.evaluate(studentId, driveId));
    }
}
