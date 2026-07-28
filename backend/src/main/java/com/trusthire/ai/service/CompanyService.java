package com.trusthire.ai.service;

import com.trusthire.ai.domain.Company;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.CompanyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class CompanyService {

    private static final Logger log = LoggerFactory.getLogger(CompanyService.class);
    private final CompanyRepository companyRepository;
    private final AtomicInteger idCounter = new AtomicInteger(1);

    public CompanyService(CompanyRepository companyRepository) {
        this.companyRepository = companyRepository;
    }

    public Company create(String name, String sector, String description) {
        String id = String.format("CMP-%03d", idCounter.getAndIncrement());
        Company company = new Company(id, name, sector, description);
        companyRepository.save(company);
        log.info("Company {} '{}' created", id, name);
        return company;
    }

    public Company getById(String id) {
        return companyRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Company not found: " + id));
    }

    public List<Company> getAll() {
        return companyRepository.findAll();
    }
}
