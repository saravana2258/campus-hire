package com.saravana.campus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Industry is required")
    private String industry;

    @NotNull(message = "Package is required")
    @Min(0)
    private Double packageLpa;

    private String visitDate;

    private Double cgpaCutoff;

    // Roles stored as comma-separated string
    private String roles;

    // ---- Constructors ----
    public Company() {}

    public Company(String name, String industry, Double packageLpa,
                   String visitDate, Double cgpaCutoff, String roles) {
        this.name = name;
        this.industry = industry;
        this.packageLpa = packageLpa;
        this.visitDate = visitDate;
        this.cgpaCutoff = cgpaCutoff;
        this.roles = roles;
    }

    // ---- Getters & Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIndustry() { return industry; }
    public void setIndustry(String industry) { this.industry = industry; }

    public Double getPackageLpa() { return packageLpa; }
    public void setPackageLpa(Double packageLpa) { this.packageLpa = packageLpa; }

    public String getVisitDate() { return visitDate; }
    public void setVisitDate(String visitDate) { this.visitDate = visitDate; }

    public Double getCgpaCutoff() { return cgpaCutoff; }
    public void setCgpaCutoff(Double cgpaCutoff) { this.cgpaCutoff = cgpaCutoff; }

    public String getRoles() { return roles; }
    public void setRoles(String roles) { this.roles = roles; }
}
