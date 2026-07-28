package com.trusthire.ai.domain;

/**
 * State machine for application status transitions.
 * Encodes the full allowed transition graph; all callers must go through canTransitionTo().
 */
public enum ApplicationStatus {

    SUBMITTED {
        @Override
        public boolean canTransitionTo(ApplicationStatus target) {
            return target == UNDER_REVIEW || target == WITHDRAWN || target == REJECTED;
        }
    },
    UNDER_REVIEW {
        @Override
        public boolean canTransitionTo(ApplicationStatus target) {
            return target == SHORTLISTED || target == REJECTED || target == WITHDRAWN;
        }
    },
    SHORTLISTED {
        @Override
        public boolean canTransitionTo(ApplicationStatus target) {
            return target == SELECTED || target == REJECTED;
        }
    },
    SELECTED {
        @Override
        public boolean canTransitionTo(ApplicationStatus target) {
            return false; // terminal state
        }
    },
    REJECTED {
        @Override
        public boolean canTransitionTo(ApplicationStatus target) {
            return false; // terminal state
        }
    },
    WITHDRAWN {
        @Override
        public boolean canTransitionTo(ApplicationStatus target) {
            return false; // terminal state
        }
    };

    /** Returns true if transitioning from this status to target is a legal move. */
    public abstract boolean canTransitionTo(ApplicationStatus target);
}
