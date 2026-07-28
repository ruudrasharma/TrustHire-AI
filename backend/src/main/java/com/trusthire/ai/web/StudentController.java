package com.trusthire.ai.web;

import com.trusthire.ai.service.StudentService;
import com.trusthire.ai.web.dto.StudentCreateRequest;
import com.trusthire.ai.web.dto.StudentResponse;
import com.trusthire.ai.web.dto.StudentUpdateRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/students")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public StudentResponse create(@Valid @RequestBody StudentCreateRequest request) {
        return StudentResponse.from(studentService.create(
                request.name(), request.email(), request.programme(),
                request.graduationYear(), request.cgpa(), request.activeBacklogs(), request.skills()
        ));
    }

    @GetMapping("/{id}")
    public StudentResponse getById(@PathVariable String id) {
        return StudentResponse.from(studentService.getById(id));
    }

    @GetMapping
    public List<StudentResponse> getAll() {
        return studentService.getAll().stream()
                .map(StudentResponse::from)
                .collect(Collectors.toList());
    }

    @PutMapping("/{id}")
    public StudentResponse update(@PathVariable String id,
                                  @Valid @RequestBody StudentUpdateRequest request) {
        return StudentResponse.from(studentService.update(
                id, request.name(), request.programme(),
                request.graduationYear(), request.cgpa(), request.activeBacklogs(), request.skills()
        ));
    }
}
