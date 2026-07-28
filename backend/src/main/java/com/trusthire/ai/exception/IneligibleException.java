package com.trusthire.ai.exception;

/** Thrown when a student applies to an ineligible drive. Maps to HTTP 422 Unprocessable Entity. */
public class IneligibleException extends RuntimeException {
    public IneligibleException(String message) {
        super(message);
    }
}
