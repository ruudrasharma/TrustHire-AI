package com.trusthire.ai.exception;

/** Thrown when a resource (student, company, drive, application) is not found. Maps to HTTP 404. */
public class NotFoundException extends RuntimeException {
    public NotFoundException(String message) {
        super(message);
    }
}
