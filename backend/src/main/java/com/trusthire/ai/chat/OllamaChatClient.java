package com.trusthire.ai.chat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.trusthire.ai.exception.ChatServiceUnavailableException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.net.ConnectException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * OllamaChatClient — the ONLY class that knows Ollama's HTTP request/response shape.
 * Maps connection errors and timeouts to ChatServiceUnavailableException (→ 503).
 * Never logs the full prompt or raw student data per AGENTS.md rule.
 */
@Component
public class OllamaChatClient implements ChatClient {

    private static final Logger log = LoggerFactory.getLogger(OllamaChatClient.class);
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final OllamaProperties properties;
    private final HttpClient httpClient;

    public OllamaChatClient(OllamaProperties properties) {
        this.properties = properties;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(properties.getConnectTimeoutSeconds()))
                .build();
    }

    @Override
    public String send(String systemPrompt, String userMessage) {
        String url = properties.getBaseUrl() + "/api/chat";

        ObjectNode body = MAPPER.createObjectNode();
        body.put("model", properties.getModel());
        body.put("stream", false);

        ArrayNode messages = body.putArray("messages");

        ObjectNode systemMsg = messages.addObject();
        systemMsg.put("role", "system");
        systemMsg.put("content", systemPrompt);

        ObjectNode userMsg = messages.addObject();
        userMsg.put("role", "user");
        userMsg.put("content", userMessage);

        try {
            String requestBody = MAPPER.writeValueAsString(body);
            log.debug("Sending chat request to Ollama model={}", properties.getModel());

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(properties.getReadTimeoutSeconds()))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = httpClient.send(request,
                    HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.warn("Ollama returned non-200 status: {}", response.statusCode());
                throw new ChatServiceUnavailableException(
                        "Ollama returned status " + response.statusCode());
            }

            JsonNode responseJson = MAPPER.readTree(response.body());
            String content = responseJson
                    .path("message")
                    .path("content")
                    .asText(null);

            if (content == null || content.isBlank()) {
                log.warn("Ollama returned empty response body");
                throw new ChatServiceUnavailableException("Ollama returned an empty response");
            }

            log.debug("Chat response received from Ollama (length={})", content.length());
            return content;

        } catch (ConnectException e) {
            log.error("Cannot connect to Ollama at {}: {}", url, e.getMessage());
            throw new ChatServiceUnavailableException("Cannot connect to Ollama: " + e.getMessage(), e);
        } catch (java.net.http.HttpTimeoutException e) {
            log.error("Ollama request timed out: {}", e.getMessage());
            throw new ChatServiceUnavailableException("Ollama request timed out", e);
        } catch (ChatServiceUnavailableException e) {
            throw e; // re-throw, don't wrap again
        } catch (Exception e) {
            log.error("Unexpected error communicating with Ollama: {}", e.getMessage());
            throw new ChatServiceUnavailableException("Unexpected Ollama error: " + e.getMessage(), e);
        }
    }
}
