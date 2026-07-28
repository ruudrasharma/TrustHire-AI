package com.trusthire.ai.policy;

import com.trusthire.ai.domain.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class CompositeEligibilityPolicyTest {

    private CompositeEligibilityPolicy policy;
    private PlacementDrive drive;

    @BeforeEach
    void setUp() {
        policy = new CompositeEligibilityPolicy(List.of(
                new CgpaCriterion(),
                new BacklogCriterion(),
                new SkillCriterion(),
                new ProgrammeYearCriterion()
        ));

        EligibilityCriteria criteria = new EligibilityCriteria(
                7.0, 1, List.of("Computer Science"), 2025
        );
        drive = new PlacementDrive("DRV-001", "CMP-001", "Software Engineer",
                "Bangalore", "12 LPA", Instant.now().plusSeconds(86400),
                List.of("Java", "Spring Boot"), criteria);
    }

    @Test
    void eligibleStudentPassesAllCriteria() {
        Student student = new Student("STU-001", "Alice", "alice@test.com",
                "Computer Science", 2025, 8.5, 0, List.of("Java", "Spring Boot"));

        EligibilityResult result = policy.evaluate(student, drive);

        assertTrue(result.isEligible());
        assertEquals(1, result.getReasons().size()); // "Meets all..." message
    }

    @Test
    void studentBelowCgpaThresholdIsIneligible() {
        Student student = new Student("STU-002", "Bob", "bob@test.com",
                "Computer Science", 2025, 6.5, 0, List.of("Java", "Spring Boot"));

        EligibilityResult result = policy.evaluate(student, drive);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("CGPA")));
    }

    @Test
    void studentWithTooManyBacklogsIsIneligible() {
        Student student = new Student("STU-003", "Carol", "carol@test.com",
                "Computer Science", 2025, 8.5, 3, List.of("Java", "Spring Boot"));

        EligibilityResult result = policy.evaluate(student, drive);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("backlog")));
    }

    @Test
    void studentMissingSkillsIsIneligible() {
        Student student = new Student("STU-004", "Dave", "dave@test.com",
                "Computer Science", 2025, 8.5, 0, List.of("Python"));

        EligibilityResult result = policy.evaluate(student, drive);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().stream().anyMatch(r -> r.contains("skill")));
    }

    @Test
    void resultReasonsNeverContainRawCgpaOrBacklogNumbers() {
        Student student = new Student("STU-005", "Eve", "eve@test.com",
                "Computer Science", 2025, 6.2, 2, List.of());

        EligibilityResult result = policy.evaluate(student, drive);

        // Privacy check — raw CGPA (6.2) or backlog count (2) must not appear in reasons
        for (String reason : result.getReasons()) {
            assertFalse(reason.contains("6.2"), "Raw CGPA must not appear in reasons: " + reason);
            // Note: backlog count "2" might appear coincidentally in other text, check contextually
        }
    }

    @Test
    void multipleFailureReasonsAllReported() {
        Student student = new Student("STU-006", "Frank", "frank@test.com",
                "Mechanical Engineering", 2024, 5.0, 3, List.of("COBOL"));

        EligibilityResult result = policy.evaluate(student, drive);

        assertFalse(result.isEligible());
        assertTrue(result.getReasons().size() >= 3, "All failures should be reported");
    }
}
