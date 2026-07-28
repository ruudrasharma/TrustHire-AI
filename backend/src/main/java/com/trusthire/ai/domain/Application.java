package com.trusthire.ai.domain;

import java.time.Instant;
import java.util.Objects;

/**
 * Application entity. Enforces unique (studentId, driveId) constraint at the service level.
 * Status transitions are guarded by ApplicationStatus.canTransitionTo().
 */
public class Application {

    private final String id;
    private final String studentId;
    private final String driveId;
    private final Instant submittedAt;
    private ApplicationStatus status;

    public Application(String id, String studentId, String driveId) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Application id must not be blank");
        if (studentId == null || studentId.isBlank()) throw new IllegalArgumentException("studentId must not be blank");
        if (driveId == null || driveId.isBlank()) throw new IllegalArgumentException("driveId must not be blank");

        this.id = id;
        this.studentId = studentId;
        this.driveId = driveId;
        this.submittedAt = Instant.now();
        this.status = ApplicationStatus.SUBMITTED;
    }

    public String getId() { return id; }
    public String getStudentId() { return studentId; }
    public String getDriveId() { return driveId; }
    public Instant getSubmittedAt() { return submittedAt; }
    public ApplicationStatus getStatus() { return status; }

    /**
     * Status may only be changed through ApplicationService.updateStatus(),
     * which validates the transition and records the audit event first.
     * Public here because service is in a separate package — the business
     * rule enforcement (canTransitionTo check + audit record) lives in the service.
     */
    public void setStatus(ApplicationStatus newStatus) {
        this.status = newStatus;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Application)) return false;
        return Objects.equals(id, ((Application) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Application{id='" + id + "', studentId='" + studentId + "', driveId='" + driveId + "', status=" + status + "}";
    }
}
