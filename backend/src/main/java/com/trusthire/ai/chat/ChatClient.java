package com.trusthire.ai.chat;

/**
 * Adapter interface for the LLM backend.
 * OllamaChatClient is the ONLY implementation that knows Ollama's request/response shape.
 * Never construct Ollama JSON payloads outside this interface's implementation.
 */
public interface ChatClient {
    /**
     * Sends a chat request with a system prompt and user message.
     * @return the model's reply text
     * @throws com.trusthire.ai.exception.ChatServiceUnavailableException if Ollama is down/timeout
     */
    String send(String systemPrompt, String userMessage);
}
