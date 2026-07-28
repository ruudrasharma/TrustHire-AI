package com.trusthire.ai.service;

import com.trusthire.ai.domain.EligibilityCriteria;
import com.trusthire.ai.domain.PlacementDrive;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.CompanyRepository;
import com.trusthire.ai.repository.DriveRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class DriveService {

    private static final Logger log = LoggerFactory.getLogger(DriveService.class);
    private final DriveRepository driveRepository;
    private final CompanyRepository companyRepository;
    private final AtomicInteger idCounter = new AtomicInteger(1);

    public DriveService(DriveRepository driveRepository, CompanyRepository companyRepository) {
        this.driveRepository = driveRepository;
        this.companyRepository = companyRepository;
    }

    public PlacementDrive create(String companyId, String role, String location,
                                 String packageOffered, Instant deadline,
                                 List<String> requiredSkills, EligibilityCriteria eligibilityCriteria) {
        if (!companyRepository.existsById(companyId)) {
            throw new NotFoundException("Company not found: " + companyId);
        }
        String id = String.format("DRV-%03d", idCounter.getAndIncrement());
        PlacementDrive drive = new PlacementDrive(id, companyId, role, location,
                packageOffered, deadline, requiredSkills, eligibilityCriteria);
        driveRepository.save(drive);
        log.info("Drive {} '{}' created for company {}", id, role, companyId);
        return drive;
    }

    public PlacementDrive getById(String id) {
        return driveRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Drive not found: " + id));
    }

    public List<PlacementDrive> getAll() {
        return driveRepository.findAll();
    }

    public List<PlacementDrive> getByCompanyId(String companyId) {
        return driveRepository.findByCompanyId(companyId);
    }
}
