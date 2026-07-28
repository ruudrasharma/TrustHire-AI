package com.trusthire.ai.policy;

import com.trusthire.ai.domain.EligibilityResult;
import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.domain.Student;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

/**
 * Composite implementation that runs all Criterion strategies in order,
 * collects reasons, and produces a single aggregated EligibilityResult.
 *
 * Eligible only if ALL criteria pass. Returns unsigned result — signing
 * is done by EligibilityService before handing the result to any caller.
 */
@Component
public class CompositeEligibilityPolicy implements EligibilityPolicy {

    private final List<Criterion> criteria;

    public CompositeEligibilityPolicy(List<Criterion> criteria) {
        this.criteria = criteria;
    }

    @Override
    public EligibilityResult evaluate(Student student, PlacementDrive drive) {
        List<String> failureReasons = new ArrayList<>();

        for (Criterion criterion : criteria) {
            Optional<String> reason = criterion.check(student, drive);
            reason.ifPresent(failureReasons::add);
        }

        boolean eligible = failureReasons.isEmpty();

        List<String> allReasons = new ArrayList<>();
        if (eligible) {
            allReasons.add("Meets all eligibility criteria for this drive");
        } else {
            allReasons.addAll(failureReasons);
        }

        return new EligibilityResult(eligible, allReasons);
    }
}
