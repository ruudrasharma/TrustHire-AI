package com.trusthire.ai.domain;

import java.time.Instant;

/**
 * AuditEvent — one node in the hash chain per application.
 * Append-only; never mutated after construction.
 *
 * hash = SHA-256(prevHash + applicationId + fromStatus + toStatus + timestampIso)
 */
public class AuditEvent {

    private final String applicationId;
    private final ApplicationStatus fromStatus;
    private final ApplicationStatus toStatus;
    private final Instant timestamp;
    private final String prevHash;
    private final String hash;

    public AuditEvent(String applicationId, ApplicationStatus fromStatus,
                      ApplicationStatus toStatus, Instant timestamp,
                      String prevHash, String hash) {
        this.applicationId = applicationId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.timestamp = timestamp;
        this.prevHash = prevHash;
        this.hash = hash;
    }

    public String getApplicationId() { return applicationId; }
    public ApplicationStatus getFromStatus() { return fromStatus; }
    public ApplicationStatus getToStatus() { return toStatus; }
    public Instant getTimestamp() { return timestamp; }
    public String getPrevHash() { return prevHash; }
    public String getHash() { return hash; }

    @Override
    public String toString() {
        return "AuditEvent{applicationId='" + applicationId + "', " +
                fromStatus + " → " + toStatus + ", hash='" + hash + "'}";
    }
}
