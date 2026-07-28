package com.trusthire.ai.repository;

import com.trusthire.ai.domain.Company;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryCompanyRepository implements CompanyRepository {

    private final ConcurrentHashMap<String, Company> store = new ConcurrentHashMap<>();

    @Override
    public Company save(Company company) {
        store.put(company.getId(), company);
        return company;
    }

    @Override
    public Optional<Company> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Company> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public boolean existsById(String id) {
        return store.containsKey(id);
    }
}
