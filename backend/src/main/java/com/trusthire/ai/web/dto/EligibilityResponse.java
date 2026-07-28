package com.trusthire.ai.web.dto;

import com.trusthire.ai.domain.EligibilityResult;
import java.util.List;

/**
 * PRIVACY: contains only eligible boolean, reasons, and signature — no raw CGPA/backlog values.
 */
public record EligibilityResponse(
        boolean eligible,
        List<String> reasons,
        String signature
) {
    public static EligibilityResponse from(EligibilityResult result) {
        return new EligibilityResponse(result.isEligible(), result.getReasons(), result.getSignature());
    }
}
