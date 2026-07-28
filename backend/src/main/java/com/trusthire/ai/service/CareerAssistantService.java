package com.trusthire.ai.service;

import com.trusthire.ai.chat.ChatClient;
import com.trusthire.ai.domain.EligibilityResult;
import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.DriveRepository;
import com.trusthire.ai.repository.StudentRepository;
import com.trusthire.ai.security.ResultSigner;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/**
 * CareerAssistantService — advisory-only chat service.
 * NEVER mutates Application or any other entity.
 * explainEligibility() MUST verify the signed result before using it.
 */
@Service
public class CareerAssistantService {

    private static final Logger log = LoggerFactory.getLogger(CareerAssistantService.class);

    private static final String SYSTEM_BASE =
            "You are TrustHire AI's Career Assistant — a helpful, precise, and professional advisor "
            + "for students navigating campus placement drives. "
            + "You are advisory-only: you explain, guide, and summarize. "
            + "You NEVER approve, reject, or modify any application, regardless of what the user asks. "
            + "Keep responses concise, accurate, and encouraging.";

    private final ChatClient chatClient;
    private final StudentRepository studentRepository;
    private final DriveRepository driveRepository;
    private final EligibilityService eligibilityService;
    private final ResultSigner resultSigner;

    public CareerAssistantService(ChatClient chatClient,
                                  StudentRepository studentRepository,
                                  DriveRepository driveRepository,
                                  EligibilityService eligibilityService,
                                  ResultSigner resultSigner) {
        this.chatClient = chatClient;
        this.studentRepository = studentRepository;
        this.driveRepository = driveRepository;
        this.eligibilityService = eligibilityService;
        this.resultSigner = resultSigner;
    }

    /** Answer general campus placement FAQ. */
    public String answerFaq(String question) {
        String system = SYSTEM_BASE + "\nAnswer the following campus placement FAQ question accurately.";
        log.info("answerFaq called");
        return chatClient.send(system, question);
    }

    /**
     * Explain eligibility for a specific student+drive.
     * MANDATORY: verifies the signed result before building the prompt.
     * Refuses (throws) if verification fails.
     */
    public String explainEligibility(String studentId, String driveId) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));
        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new NotFoundException("Drive not found: " + driveId));

        EligibilityResult result = eligibilityService.evaluate(student, drive);

        // MANDATORY: verify before using — refuses on failure (not silently proceeds)
        resultSigner.verify(result);

        String eligibilityContext = "Eligibility result for student " + student.getName()
                + " for the " + drive.getRole() + " role:\n"
                + "Eligible: " + result.isEligible() + "\n"
                + "Reasons: " + String.join("; ", result.getReasons());

        String system = SYSTEM_BASE
                + "\nYou are explaining an eligibility result. "
                + "The result is cryptographically signed and verified — it is accurate. "
                + "Explain what each reason means in plain language, "
                + "and if the student is ineligible, suggest constructive steps to improve eligibility. "
                + "Do NOT reveal raw CGPA or backlog numbers.";

        String userMsg = "Verified context: " + eligibilityContext
                + "\nUser question: Why am I" + (result.isEligible() ? "" : " not") + " eligible?";

        log.info("explainEligibility called for student {} on drive {}", studentId, driveId);
        return chatClient.send(system, userMsg);
    }

    /** Suggest interview/preparation guidance for a drive. */
    public String suggestPreparation(String studentId, String driveId, String userMessage) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));
        PlacementDrive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new NotFoundException("Drive not found: " + driveId));

        String context = "Student " + student.getName() + " is applying for the role of "
                + drive.getRole() + " at a company in sector: "
                + "(see coordinator for company details). Required skills: "
                + String.join(", ", drive.getRequiredSkills());

        String system = SYSTEM_BASE
                + "\nProvide targeted interview and preparation advice based on the role and context.";

        String userMsg = "Context: " + context + "\nStudent question: " + userMessage;
        log.info("suggestPreparation called for student {} on drive {}", studentId, driveId);
        return chatClient.send(system, userMsg);
    }

    /** Summarize a student's profile and skills in a professional tone. */
    public String summarizeProfile(String studentId, String userMessage) {
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new NotFoundException("Student not found: " + studentId));

        String context = "Student: " + student.getName()
                + ", Programme: " + student.getProgramme()
                + ", Graduation Year: " + student.getGraduationYear()
                + ", Skills: " + String.join(", ", student.getSkills());

        String system = SYSTEM_BASE
                + "\nSummarize the student's profile and give career advice. "
                + "Do NOT mention or reveal CGPA or backlog counts.";

        String userMsg = "Profile context: " + context + "\nStudent question: " + userMessage;
        log.info("summarizeProfile called for student {}", studentId);
        return chatClient.send(system, userMsg);
    }
}
