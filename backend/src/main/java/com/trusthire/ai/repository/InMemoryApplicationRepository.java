package com.trusthire.ai.repository;

import com.trusthire.ai.domain.Application;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryApplicationRepository implements ApplicationRepository {

    private final ConcurrentHashMap<String, Application> store = new ConcurrentHashMap<>();

    @Override
    public Application save(Application application) {
        store.put(application.getId(), application);
        return application;
    }

    @Override
    public Optional<Application> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Application> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<Application> findByStudentId(String studentId) {
        return store.values().stream()
                .filter(a -> a.getStudentId().equals(studentId))
                .collect(Collectors.toList());
    }

    @Override
    public List<Application> findByDriveId(String driveId) {
        return store.values().stream()
                .filter(a -> a.getDriveId().equals(driveId))
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsByStudentIdAndDriveId(String studentId, String driveId) {
        return store.values().stream()
                .anyMatch(a -> a.getStudentId().equals(studentId) && a.getDriveId().equals(driveId));
    }

    @Override
    public boolean existsById(String id) {
        return store.containsKey(id);
    }
}
