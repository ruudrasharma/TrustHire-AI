package com.trusthire.ai.domain;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Core Student entity. cgpa and activeBacklogs are stored internally but
 * NEVER exposed in eligibility responses — they cross no API boundary.
 */
public class Student {

    private final String id;
    private String name;
    private String email;
    private String programme;
    private int graduationYear;
    private double cgpa;
    private int activeBacklogs;
    private List<String> skills;

    public Student(String id, String name, String email, String programme,
                   int graduationYear, double cgpa, int activeBacklogs, List<String> skills) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Student id must not be blank");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Student name must not be blank");
        if (email == null || email.isBlank()) throw new IllegalArgumentException("Student email must not be blank");
        if (cgpa < 0 || cgpa > 10) throw new IllegalArgumentException("CGPA must be between 0 and 10");
        if (activeBacklogs < 0) throw new IllegalArgumentException("activeBacklogs must not be negative");

        this.id = id;
        this.name = name;
        this.email = email;
        this.programme = programme;
        this.graduationYear = graduationYear;
        this.cgpa = cgpa;
        this.activeBacklogs = activeBacklogs;
        this.skills = new ArrayList<>(skills != null ? skills : Collections.emptyList());
    }

    // --- Getters ---

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getProgramme() { return programme; }
    public int getGraduationYear() { return graduationYear; }
    public double getCgpa() { return cgpa; }
    public int getActiveBacklogs() { return activeBacklogs; }
    public List<String> getSkills() { return Collections.unmodifiableList(skills); }

    // --- Mutators (for profile updates) ---

    public void setName(String name) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("name must not be blank");
        this.name = name;
    }

    public void setProgramme(String programme) { this.programme = programme; }
    public void setGraduationYear(int graduationYear) { this.graduationYear = graduationYear; }

    public void setCgpa(double cgpa) {
        if (cgpa < 0 || cgpa > 10) throw new IllegalArgumentException("CGPA must be 0–10");
        this.cgpa = cgpa;
    }

    public void setActiveBacklogs(int activeBacklogs) {
        if (activeBacklogs < 0) throw new IllegalArgumentException("activeBacklogs must not be negative");
        this.activeBacklogs = activeBacklogs;
    }

    public void setSkills(List<String> skills) {
        this.skills = new ArrayList<>(skills != null ? skills : Collections.emptyList());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student)) return false;
        return Objects.equals(id, ((Student) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Student{id='" + id + "', name='" + name + "', email='" + email + "'}";
    }
}
