package com.saravana.campus.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "students")
public class Student {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name is required")
    @Column(nullable = false)
    private String name;

    @NotBlank(message = "Department is required")
    private String department;

    @NotNull(message = "CGPA is required")
    @Min(0) @Max(10)
    private Double cgpa;

    @Min(0)
    private Integer backlogs = 0;

    @Email(message = "Valid email is required")
    @Column(unique = true)
    private String email;

    // Skills stored as comma-separated string
    private String skills;

    @Column(nullable = false)
    private String status = "Available"; // Available, Applied, Placed

    // ---- Constructors ----
    public Student() {}

    public Student(String name, String department, Double cgpa, Integer backlogs,
                   String email, String skills, String status) {
        this.name = name;
        this.department = department;
        this.cgpa = cgpa;
        this.backlogs = backlogs;
        this.email = email;
        this.skills = skills;
        this.status = status;
    }

    // ---- Getters & Setters ----
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public Double getCgpa() { return cgpa; }
    public void setCgpa(Double cgpa) { this.cgpa = cgpa; }

    public Integer getBacklogs() { return backlogs; }
    public void setBacklogs(Integer backlogs) { this.backlogs = backlogs; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSkills() { return skills; }
    public void setSkills(String skills) { this.skills = skills; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
