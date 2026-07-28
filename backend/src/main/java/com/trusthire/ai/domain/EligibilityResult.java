package com.trusthire.ai.domain;

import java.util.Collections;
import java.util.List;

/**
 * EligibilityResult value object.
 *
 * PRIVACY BOUNDARY: this object intentionally contains NO raw cgpa or
 * activeBacklogs values. Only boolean eligibility, human-readable reason
 * strings, and the HMAC signature cross the API boundary.
 */
public class EligibilityResult {

    private final boolean eligible;
    private final List<String> reasons;
    private String signature; // set by ResultSigner after construction

    public EligibilityResult(boolean eligible, List<String> reasons) {
        this.eligible = eligible;
        this.reasons = Collections.unmodifiableList(
                reasons != null ? new java.util.ArrayList<>(reasons) : java.util.Collections.emptyList()
        );
    }

    public boolean isEligible() { return eligible; }
    public List<String> getReasons() { return reasons; }
    public String getSignature() { return signature; }

    /** Called exclusively by ResultSigner — do not call from controllers or services. */
    public void setSignature(String signature) { this.signature = signature; }

    /**
     * Canonical string representation used for HMAC signing.
     * Deterministic: same eligible + same reasons list in same order → same string.
     */
    public String toCanonicalString() {
        return "eligible=" + eligible + ";reasons=" + String.join("|", reasons);
    }

    @Override
    public String toString() {
        return "EligibilityResult{eligible=" + eligible + ", reasons=" + reasons + ", signed=" + (signature != null) + "}";
    }
}
