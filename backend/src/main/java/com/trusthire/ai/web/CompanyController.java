package com.trusthire.ai.web;

import com.trusthire.ai.service.CompanyService;
import com.trusthire.ai.web.dto.CompanyCreateRequest;
import com.trusthire.ai.web.dto.CompanyResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/companies")
public class CompanyController {

    private final CompanyService companyService;

    public CompanyController(CompanyService companyService) {
        this.companyService = companyService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompanyResponse create(@Valid @RequestBody CompanyCreateRequest request) {
        return CompanyResponse.from(companyService.create(
                request.name(), request.sector(), request.description()
        ));
    }

    @GetMapping("/{id}")
    public CompanyResponse getById(@PathVariable String id) {
        return CompanyResponse.from(companyService.getById(id));
    }

    @GetMapping
    public List<CompanyResponse> getAll() {
        return companyService.getAll().stream()
                .map(CompanyResponse::from)
                .collect(Collectors.toList());
    }
}
