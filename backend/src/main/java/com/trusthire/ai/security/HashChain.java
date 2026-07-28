package com.trusthire.ai.security;

import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * SHA-256 hash-chaining utility for AuditEvent sequences.
 *
 * Genesis hash for each application is a deterministic constant derived from the applicationId,
 * so the first event's prevHash is always reproducible without storing anything extra.
 */
@Component
public class HashChain {

    private static final String GENESIS_PREFIX = "GENESIS:";

    /**
     * Computes the genesis (first) prevHash for a new application.
     * Deterministic: sha256("GENESIS:" + applicationId)
     */
    public String genesisHash(String applicationId) {
        return sha256(GENESIS_PREFIX + applicationId);
    }

    /**
     * Computes the hash for a new AuditEvent node.
     * payload = prevHash + applicationId + fromStatus + toStatus + timestampIso
     */
    public String computeHash(String prevHash, String applicationId,
                              String fromStatus, String toStatus, String timestampIso) {
        String payload = prevHash + applicationId + fromStatus + toStatus + timestampIso;
        return sha256(payload);
    }

    /** Convenience: verify a hash matches its expected re-computation. */
    public boolean verify(String prevHash, String applicationId,
                          String fromStatus, String toStatus,
                          String timestampIso, String storedHash) {
        String recomputed = computeHash(prevHash, applicationId, fromStatus, toStatus, timestampIso);
        return recomputed.equals(storedHash);
    }

    private String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] raw = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(raw);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
