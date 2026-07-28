package com.trusthire.ai.repository;

import com.trusthire.ai.domain.Student;
import java.util.List;
import java.util.Optional;

/** Storage-agnostic interface for Student persistence. Never depend on a concrete impl. */
public interface StudentRepository {
    Student save(Student student);
    Optional<Student> findById(String id);
    List<Student> findAll();
    boolean existsByEmail(String email);
    boolean existsById(String id);
}
