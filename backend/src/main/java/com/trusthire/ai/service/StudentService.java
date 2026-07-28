package com.trusthire.ai.service;

import com.trusthire.ai.domain.Student;
import com.trusthire.ai.exception.DuplicateResourceException;
import com.trusthire.ai.exception.NotFoundException;
import com.trusthire.ai.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class StudentService {

    private static final Logger log = LoggerFactory.getLogger(StudentService.class);
    private final StudentRepository studentRepository;
    private final AtomicInteger idCounter = new AtomicInteger(1);

    public StudentService(StudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    public Student create(String name, String email, String programme,
                          int graduationYear, double cgpa, int activeBacklogs,
                          List<String> skills) {
        if (studentRepository.existsByEmail(email)) {
            throw new DuplicateResourceException("Student with email '" + email + "' already exists");
        }
        String id = String.format("STU-%03d", idCounter.getAndIncrement());
        Student student = new Student(id, name, email, programme, graduationYear, cgpa, activeBacklogs, skills);
        studentRepository.save(student);
        log.info("Student {} created for email {}", id, email);
        return student;
    }

    public Student getById(String id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Student not found: " + id));
    }

    public List<Student> getAll() {
        return studentRepository.findAll();
    }

    public Student update(String id, String name, String programme,
                          int graduationYear, double cgpa, int activeBacklogs,
                          List<String> skills) {
        Student student = getById(id);
        if (name != null && !name.isBlank()) student.setName(name);
        if (programme != null) student.setProgramme(programme);
        if (graduationYear > 0) student.setGraduationYear(graduationYear);
        if (cgpa >= 0) student.setCgpa(cgpa);
        if (activeBacklogs >= 0) student.setActiveBacklogs(activeBacklogs);
        if (skills != null) student.setSkills(skills);
        studentRepository.save(student);
        log.info("Student {} profile updated", id);
        return student;
    }
}
