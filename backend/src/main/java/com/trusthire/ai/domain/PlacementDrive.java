package com.trusthire.ai.domain;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * PlacementDrive entity. Holds the full drive configuration including embedded
 * EligibilityCriteria and required skills.
 */
public class PlacementDrive {

    private final String id;
    private final String companyId;
    private final String role;
    private final String location;
    private final String packageOffered;
    private final Instant deadline;
    private final List<String> requiredSkills;
    private final EligibilityCriteria eligibilityCriteria;
    private final Instant createdAt;
    private DriveStatus status;

    public PlacementDrive(String id, String companyId, String role, String location,
                          String packageOffered, Instant deadline,
                          List<String> requiredSkills, EligibilityCriteria eligibilityCriteria) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Drive id must not be blank");
        if (companyId == null || companyId.isBlank()) throw new IllegalArgumentException("companyId must not be blank");
        if (role == null || role.isBlank()) throw new IllegalArgumentException("role must not be blank");
        if (deadline == null) throw new IllegalArgumentException("deadline must not be null");

        this.id = id;
        this.companyId = companyId;
        this.role = role;
        this.location = location != null ? location : "";
        this.packageOffered = packageOffered != null ? packageOffered : "";
        this.createdAt = Instant.now();
        if (deadline.isBefore(this.createdAt)) {
            throw new IllegalArgumentException("Deadline must be in the future");
        }
        this.deadline = deadline;
        this.requiredSkills = new ArrayList<>(requiredSkills != null ? requiredSkills : Collections.emptyList());
        this.eligibilityCriteria = eligibilityCriteria;
        this.status = DriveStatus.OPEN;
    }

    public String getId() { return id; }
    public String getCompanyId() { return companyId; }
    public String getRole() { return role; }
    public String getLocation() { return location; }
    public String getPackageOffered() { return packageOffered; }
    public Instant getDeadline() { return deadline; }
    public List<String> getRequiredSkills() { return Collections.unmodifiableList(requiredSkills); }
    public EligibilityCriteria getEligibilityCriteria() { return eligibilityCriteria; }
    public Instant getCreatedAt() { return createdAt; }
    public DriveStatus getStatus() { return status; }

    public boolean isOpen() { return status == DriveStatus.OPEN && Instant.now().isBefore(deadline); }

    public void close() { this.status = DriveStatus.CLOSED; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PlacementDrive)) return false;
        return Objects.equals(id, ((PlacementDrive) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "PlacementDrive{id='" + id + "', role='" + role + "', companyId='" + companyId + "'}";
    }
}
