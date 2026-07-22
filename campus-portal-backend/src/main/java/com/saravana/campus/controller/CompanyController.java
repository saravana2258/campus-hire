package com.saravana.campus.controller;

import com.saravana.campus.model.Company;
import com.saravana.campus.repository.CompanyRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/companies")
@CrossOrigin(origins = "*")
public class CompanyController {

    @Autowired
    private CompanyRepository companyRepo;

    // GET all companies
    @GetMapping
    public List<Company> getAllCompanies() {
        return companyRepo.findAll();
    }

    // GET company by ID
    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompany(@PathVariable Long id) {
        return companyRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST create new company
    @PostMapping
    public ResponseEntity<Company> createCompany(@Valid @RequestBody Company company) {
        Company saved = companyRepo.save(company);
        return ResponseEntity.ok(saved);
    }

    // PUT update existing company
    @PutMapping("/{id}")
    public ResponseEntity<Company> updateCompany(@PathVariable Long id,
                                                  @Valid @RequestBody Company updated) {
        return companyRepo.findById(id).map(company -> {
            company.setName(updated.getName());
            company.setIndustry(updated.getIndustry());
            company.setPackageLpa(updated.getPackageLpa());
            company.setVisitDate(updated.getVisitDate());
            company.setCgpaCutoff(updated.getCgpaCutoff());
            company.setRoles(updated.getRoles());
            return ResponseEntity.ok(companyRepo.save(company));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE company
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCompany(@PathVariable Long id) {
        if (!companyRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        companyRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
