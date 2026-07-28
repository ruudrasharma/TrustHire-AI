package com.trusthire.ai.domain;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class ApplicationStatusTest {

    @Test
    void submittedCanTransitionToUnderReview() {
        assertTrue(ApplicationStatus.SUBMITTED.canTransitionTo(ApplicationStatus.UNDER_REVIEW));
    }

    @Test
    void submittedCanTransitionToWithdrawn() {
        assertTrue(ApplicationStatus.SUBMITTED.canTransitionTo(ApplicationStatus.WITHDRAWN));
    }

    @Test
    void submittedCannotTransitionToSelected() {
        assertFalse(ApplicationStatus.SUBMITTED.canTransitionTo(ApplicationStatus.SELECTED));
    }

    @Test
    void underReviewCanTransitionToShortlisted() {
        assertTrue(ApplicationStatus.UNDER_REVIEW.canTransitionTo(ApplicationStatus.SHORTLISTED));
    }

    @Test
    void shortlistedCanTransitionToSelected() {
        assertTrue(ApplicationStatus.SHORTLISTED.canTransitionTo(ApplicationStatus.SELECTED));
    }

    @Test
    void selectedIsTerminal() {
        for (ApplicationStatus target : ApplicationStatus.values()) {
            assertFalse(ApplicationStatus.SELECTED.canTransitionTo(target),
                    "SELECTED should not transition to " + target);
        }
    }

    @Test
    void rejectedIsTerminal() {
        for (ApplicationStatus target : ApplicationStatus.values()) {
            assertFalse(ApplicationStatus.REJECTED.canTransitionTo(target),
                    "REJECTED should not transition to " + target);
        }
    }

    @Test
    void withdrawnIsTerminal() {
        for (ApplicationStatus target : ApplicationStatus.values()) {
            assertFalse(ApplicationStatus.WITHDRAWN.canTransitionTo(target),
                    "WITHDRAWN should not transition to " + target);
        }
    }
}
