package com.trusthire.ai.exception;

/** Thrown when an application status transition is illegal per the state machine. Maps to HTTP 409. */
public class InvalidTransitionException extends RuntimeException {
    public InvalidTransitionException(String message) {
        super(message);
    }
}
