package com.trusthire.ai.security;

import com.trusthire.ai.domain.EligibilityResult;
import com.trusthire.ai.exception.SignatureVerificationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

/**
 * HMAC-SHA256 signing utility for EligibilityResult and ReceiptService payloads.
 *
 * Single crypto primitive — ReceiptService reuses this; no second signing class.
 * Secret is injected from config (app.signing.secret) — never committed.
 * NEVER log the secret, CGPA, or activeBacklogs.
 */
@Component
public class ResultSigner {

    private static final Logger log = LoggerFactory.getLogger(ResultSigner.class);
    private static final String ALGORITHM = "HmacSHA256";

    private final byte[] secretKey;

    public ResultSigner(@Value("${app.signing.secret:default-dev-secret-change-in-prod}") String secret) {
        this.secretKey = secret.getBytes(StandardCharsets.UTF_8);
    }

    /**
     * Signs an EligibilityResult in-place. Sets the signature field and returns it.
     * Must be called before any EligibilityResult leaves EligibilityService.
     */
    public EligibilityResult sign(EligibilityResult result) {
        String payload = result.toCanonicalString();
        String signature = computeHmac(payload);
        result.setSignature(signature);
        log.debug("EligibilityResult signed successfully (eligible={})", result.isEligible());
        return result;
    }

    /**
     * Verifies an EligibilityResult's signature.
     * Throws SignatureVerificationException (not silently proceeds) on mismatch.
     */
    public void verify(EligibilityResult result) {
        if (result.getSignature() == null || result.getSignature().isBlank()) {
            throw new SignatureVerificationException("EligibilityResult has no signature — cannot verify");
        }
        String expected = computeHmac(result.toCanonicalString());
        if (!expected.equals(result.getSignature())) {
            log.warn("EligibilityResult signature verification FAILED");
            throw new SignatureVerificationException(
                    "EligibilityResult signature verification failed — result may have been tampered with"
            );
        }
        log.debug("EligibilityResult signature verified successfully");
    }

    /**
     * Signs an arbitrary canonical string payload (used by ReceiptService).
     * @return hex-encoded HMAC-SHA256 signature
     */
    public String signPayload(String canonicalPayload) {
        return computeHmac(canonicalPayload);
    }

    /**
     * Verifies an arbitrary payload against a provided signature.
     * @return true if valid, false otherwise (caller decides how to surface this)
     */
    public boolean verifyPayload(String canonicalPayload, String signature) {
        if (signature == null || signature.isBlank()) return false;
        String expected = computeHmac(canonicalPayload);
        return expected.equals(signature);
    }

    private String computeHmac(String payload) {
        try {
            Mac mac = Mac.getInstance(ALGORITHM);
            mac.init(new SecretKeySpec(secretKey, ALGORITHM));
            byte[] raw = mac.doFinal(payload.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(raw);
        } catch (Exception e) {
            throw new IllegalStateException("HMAC computation failed", e);
        }
    }
}
