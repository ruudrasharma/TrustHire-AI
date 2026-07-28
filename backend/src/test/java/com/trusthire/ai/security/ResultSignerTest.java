package com.trusthire.ai.security;

import com.trusthire.ai.domain.EligibilityResult;
import com.trusthire.ai.exception.SignatureVerificationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ResultSignerTest {

    private ResultSigner signer;

    @BeforeEach
    void setUp() {
        signer = new ResultSigner("test-secret-key-for-unit-tests");
    }

    @Test
    void signedResultVerifiesSuccessfully() {
        EligibilityResult result = new EligibilityResult(true, List.of("Meets all criteria"));
        signer.sign(result);

        assertNotNull(result.getSignature());
        assertDoesNotThrow(() -> signer.verify(result));
    }

    @Test
    void tamperedResultFailsVerification() {
        EligibilityResult result = new EligibilityResult(true, List.of("Meets all criteria"));
        signer.sign(result);
        String originalSignature = result.getSignature();

        // Tamper: create a new result with different data but keep old signature
        EligibilityResult tampered = new EligibilityResult(false, List.of("Tampered reason"));
        tampered.setSignature(originalSignature); // apply old signature to different data

        assertThrows(SignatureVerificationException.class, () -> signer.verify(tampered));
    }

    @Test
    void unsignedResultFailsVerification() {
        EligibilityResult result = new EligibilityResult(true, List.of("Meets all criteria"));
        // deliberately do NOT sign

        assertThrows(SignatureVerificationException.class, () -> signer.verify(result));
    }

    @Test
    void signPayloadAndVerifyPayloadWorkTogether() {
        String payload = "applicationId=APP-001;status=SHORTLISTED;chainTipHash=abc123";
        String signature = signer.signPayload(payload);

        assertTrue(signer.verifyPayload(payload, signature));
        assertFalse(signer.verifyPayload(payload + "tampered", signature));
    }

    @Test
    void differentSecretsProduceDifferentSignatures() {
        ResultSigner signer2 = new ResultSigner("different-secret");
        EligibilityResult result = new EligibilityResult(true, List.of("Meets all criteria"));
        signer.sign(result);
        String originalSignature = result.getSignature();

        assertFalse(signer2.verifyPayload(result.toCanonicalString(), originalSignature));
    }
}
