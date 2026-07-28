package com.trusthire.ai.web.dto;

import com.trusthire.ai.domain.AuditEvent;

public record AuditEventResponse(
        String applicationId,
        String fromStatus,
        String toStatus,
        String timestamp,
        String prevHash,
        String hash
) {
    public static AuditEventResponse from(AuditEvent e) {
        return new AuditEventResponse(
                e.getApplicationId(),
                e.getFromStatus().name(),
                e.getToStatus().name(),
                e.getTimestamp().toString(),
                e.getPrevHash(),
                e.getHash()
        );
    }
}
