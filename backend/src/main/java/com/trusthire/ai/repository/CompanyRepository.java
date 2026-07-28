package com.trusthire.ai.repository;

import com.trusthire.ai.domain.Company;
import java.util.List;
import java.util.Optional;

public interface CompanyRepository {
    Company save(Company company);
    Optional<Company> findById(String id);
    List<Company> findAll();
    boolean existsById(String id);
}
