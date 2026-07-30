# LLD — Sequence Diagram: Ask AI Assistant

```mermaid
sequenceDiagram
    actor Student
    participant Controller as ChatController
    participant Assistant as CareerAssistantService
    participant Elig as EligibilityService
    participant Signer as ResultSigner
    participant Client as ChatClient
    participant Adapter as OllamaChatClient
    participant Ollama as Ollama HTTP API

    Student->>Controller: POST /api/chat {studentId, driveId, message}
    Controller->>Assistant: explainEligibility(studentId, driveId, message)
    Assistant->>Elig: evaluate(studentId, driveId)
    Elig-->>Assistant: signed EligibilityResult
    Assistant->>Signer: verify(result, signature)
    alt signature invalid
        Signer-->>Assistant: false
        Assistant-->>Controller: refuse to answer (integrity check failed)
        Controller-->>Student: 500 Internal error (should not occur in normal operation)
    else signature valid
        Signer-->>Assistant: true
        Assistant->>Client: send(systemPrompt, verifiedContext + userMessage)
        Client->>Adapter: send(...)
        Adapter->>Ollama: POST /api/chat {model, messages, stream:false}
        alt Ollama reachable, responds in time
            Ollama-->>Adapter: generated answer
            Adapter-->>Client: answer text
            Client-->>Assistant: answer text
            Assistant-->>Controller: {answer, model, advisory:true}
            Controller-->>Student: 200 OK
        else Ollama down / connection refused
            Ollama--xAdapter: connection error
            Adapter-->>Client: ChatServiceUnavailableException
            Client-->>Assistant: ChatServiceUnavailableException
            Assistant-->>Controller: ChatServiceUnavailableException
            Controller-->>Student: 503 Service Unavailable
        else timeout exceeded
            Ollama--xAdapter: no response within read-timeout
            Adapter-->>Client: ChatServiceUnavailableException (timeout)
            Client-->>Assistant: ChatServiceUnavailableException
            Assistant-->>Controller: ChatServiceUnavailableException
            Controller-->>Student: 503 Service Unavailable
        end
    end
```

**Note:** all non-chat endpoints (`/api/students`, `/api/drives`, `/api/applications`, etc.) are entirely unaffected by any branch in this diagram — this is what NFR-05 (Availability) requires and what the `ollama-unavailable.png` screenshot must demonstrate.
