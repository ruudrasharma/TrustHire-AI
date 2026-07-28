package com.trusthire.ai.repository;

import com.trusthire.ai.domain.Student;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class InMemoryStudentRepository implements StudentRepository {

    private final ConcurrentHashMap<String, Student> store = new ConcurrentHashMap<>();

    @Override
    public Student save(Student student) {
        store.put(student.getId(), student);
        return student;
    }

    @Override
    public Optional<Student> findById(String id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Student> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public boolean existsByEmail(String email) {
        return store.values().stream()
                .anyMatch(s -> s.getEmail().equalsIgnoreCase(email));
    }

    @Override
    public boolean existsById(String id) {
        return store.containsKey(id);
    }
}
