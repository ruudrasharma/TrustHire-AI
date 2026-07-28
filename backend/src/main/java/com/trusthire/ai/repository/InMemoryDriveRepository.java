package com.trusthire.ai.repository;

import com.trusthire.ai.domain.PlacementDrive;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Repository
public class InMemoryDriveRepository implements DriveRepository {

    private final ConcurrentHashMap<String, PlacementDrive> store = new ConcurrentHashMap<>();

    @Override
    public PlacementDrive save(PlacementDrive drive) {
        store.put(drive.getId(), drive);
        return drive;
    }

    @Override
    public Optional<PlacementDrive> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<PlacementDrive> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public List<PlacementDrive> findByCompanyId(String companyId) {
        return store.values().stream()
                .filter(d -> d.getCompanyId().equals(companyId))
                .collect(Collectors.toList());
    }

    @Override
    public boolean existsById(String id) {
        return store.containsKey(id);
    }
}
