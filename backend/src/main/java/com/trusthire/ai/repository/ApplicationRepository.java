package com.trusthire.ai.repository;

import com.trusthire.ai.domain.Application;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository {
    Application save(Application application);
    Optional<Application> findById(String id);
    List<Application> findAll();
    List<Application> findByStudentId(String studentId);
    List<Application> findByDriveId(String driveId);
    boolean existsByStudentIdAndDriveId(String studentId, String driveId);
    boolean existsById(String id);
}
