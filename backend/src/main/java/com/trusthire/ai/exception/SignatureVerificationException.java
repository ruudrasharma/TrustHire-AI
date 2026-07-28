package com.trusthire.ai.exception;

/** Thrown when an eligibility result signature verification fails. Maps to HTTP 422. */
public class SignatureVerificationException extends RuntimeException {
    public SignatureVerificationException(String message) {
        super(message);
    }
}
