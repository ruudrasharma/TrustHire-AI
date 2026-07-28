package com.trusthire.ai.repository;

import com.trusthire.ai.domain.PlacementDrive;
import java.util.List;
import java.util.Optional;

public interface DriveRepository {
    PlacementDrive save(PlacementDrive drive);
    Optional<PlacementDrive> findById(String id);
    List<PlacementDrive> findAll();
    List<PlacementDrive> findByCompanyId(String companyId);
    boolean existsById(String id);
}
