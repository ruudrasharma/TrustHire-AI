package com.trusthire.ai.exception;

/** Thrown when the Ollama service is unavailable or times out. Maps to HTTP 503. */
public class ChatServiceUnavailableException extends RuntimeException {
    public ChatServiceUnavailableException(String message, Throwable cause) {
        super(message, cause);
    }

    public ChatServiceUnavailableException(String message) {
        super(message);
    }
}
