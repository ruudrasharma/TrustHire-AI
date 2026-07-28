package com.trusthire.ai.exception;

/** Thrown when a resource already exists (duplicate email, duplicate application). Maps to HTTP 409. */
public class DuplicateResourceException extends RuntimeException {
    public DuplicateResourceException(String message) {
        super(message);
    }
}
