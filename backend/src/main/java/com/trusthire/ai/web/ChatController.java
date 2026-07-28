package com.trusthire.ai.web;

import com.trusthire.ai.chat.OllamaProperties;
import com.trusthire.ai.service.CareerAssistantService;
import com.trusthire.ai.web.dto.ChatRequest;
import com.trusthire.ai.web.dto.ChatResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final CareerAssistantService careerAssistantService;
    private final OllamaProperties ollamaProperties;

    public ChatController(CareerAssistantService careerAssistantService,
                          OllamaProperties ollamaProperties) {
        this.careerAssistantService = careerAssistantService;
        this.ollamaProperties = ollamaProperties;
    }

    @PostMapping
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        String intent = request.intent() != null ? request.intent().toLowerCase() : "faq";
        String answer;

        switch (intent) {
            case "eligibility" -> {
                if (request.driveId() == null || request.driveId().isBlank()) {
                    throw new IllegalArgumentException("driveId is required for eligibility intent");
                }
                answer = careerAssistantService.explainEligibility(request.studentId(), request.driveId());
            }
            case "preparation" -> {
                if (request.driveId() == null || request.driveId().isBlank()) {
                    throw new IllegalArgumentException("driveId is required for preparation intent");
                }
                answer = careerAssistantService.suggestPreparation(
                        request.studentId(), request.driveId(), request.message());
            }
            case "profile" -> answer = careerAssistantService.summarizeProfile(
                    request.studentId(), request.message());
            default -> answer = careerAssistantService.answerFaq(request.message());
        }

        return new ChatResponse(answer, ollamaProperties.getModel(), true);
    }
}
