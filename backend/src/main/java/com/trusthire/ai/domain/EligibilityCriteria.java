package com.trusthire.ai.domain;

/**
 * Embedded eligibility criteria inside a PlacementDrive.
 * Treated as a value object — not independently persisted.
 */
public class EligibilityCriteria {

    private final double minCgpa;
    private final int maxActiveBacklogs;
    private final java.util.List<String> eligibleProgrammes;
    private final int minGraduationYear;

    public EligibilityCriteria(double minCgpa, int maxActiveBacklogs,
                               java.util.List<String> eligibleProgrammes, int minGraduationYear) {
        if (minCgpa < 0 || minCgpa > 10) throw new IllegalArgumentException("minCgpa must be 0–10");
        if (maxActiveBacklogs < 0) throw new IllegalArgumentException("maxActiveBacklogs must be >= 0");
        this.minCgpa = minCgpa;
        this.maxActiveBacklogs = maxActiveBacklogs;
        this.eligibleProgrammes = eligibleProgrammes != null
                ? java.util.Collections.unmodifiableList(new java.util.ArrayList<>(eligibleProgrammes))
                : java.util.Collections.emptyList();
        this.minGraduationYear = minGraduationYear;
    }

    public double getMinCgpa() { return minCgpa; }
    public int getMaxActiveBacklogs() { return maxActiveBacklogs; }
    public java.util.List<String> getEligibleProgrammes() { return eligibleProgrammes; }
    public int getMinGraduationYear() { return minGraduationYear; }
}
