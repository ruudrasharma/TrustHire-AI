package com.trusthire.ai.domain;

import java.util.Objects;

/** Company entity. Immutable after creation — coordinators don't edit companies. */
public class Company {

    private final String id;
    private final String name;
    private final String sector;
    private final String description;

    public Company(String id, String name, String sector, String description) {
        if (id == null || id.isBlank()) throw new IllegalArgumentException("Company id must not be blank");
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Company name must not be blank");
        this.id = id;
        this.name = name;
        this.sector = sector != null ? sector : "";
        this.description = description != null ? description : "";
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getSector() { return sector; }
    public String getDescription() { return description; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Company)) return false;
        return Objects.equals(id, ((Company) o).id);
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return "Company{id='" + id + "', name='" + name + "'}";
    }
}
