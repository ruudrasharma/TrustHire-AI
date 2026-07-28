package com.trusthire.ai.repository;

import com.trusthire.ai.domain.AuditEvent;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * Append-only in-memory store for AuditEvents.
 * Uses CopyOnWriteArrayList per applicationId for thread-safe ordered reads.
 */
@Repository
public class InMemoryAuditEventRepository implements AuditEventRepository {

    private final ConcurrentHashMap<String, CopyOnWriteArrayList<AuditEvent>> store =
            new ConcurrentHashMap<>();

    @Override
    public AuditEvent save(AuditEvent event) {
        store.computeIfAbsent(event.getApplicationId(), k -> new CopyOnWriteArrayList<>())
                .add(event);
        return event;
    }

    @Override
    public List<AuditEvent> findByApplicationId(String applicationId) {
        return new ArrayList<>(store.getOrDefault(applicationId, new CopyOnWriteArrayList<>()));
    }

    @Override
    public Optional<AuditEvent> findLatestByApplicationId(String applicationId) {
        List<AuditEvent> events = findByApplicationId(applicationId);
        if (events.isEmpty()) return Optional.empty();
        return Optional.of(events.get(events.size() - 1));
    }
}
