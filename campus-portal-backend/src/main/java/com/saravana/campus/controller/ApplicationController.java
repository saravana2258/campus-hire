package com.saravana.campus.controller;

import com.saravana.campus.model.Application;
import com.saravana.campus.model.Student;
import com.saravana.campus.model.Company;
import com.saravana.campus.repository.ApplicationRepository;
import com.saravana.campus.repository.StudentRepository;
import com.saravana.campus.repository.CompanyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    @Autowired
    private ApplicationRepository appRepo;

    @Autowired
    private StudentRepository studentRepo;

    @Autowired
    private CompanyRepository companyRepo;

    // GET all applications
    @GetMapping
    public List<Application> getAllApplications() {
        return appRepo.findAll();
    }

    // GET applications by status
    @GetMapping("/status/{status}")
    public List<Application> getByStatus(@PathVariable String status) {
        return appRepo.findByStatus(status);
    }

    // GET applications by student
    @GetMapping("/student/{studentId}")
    public List<Application> getByStudent(@PathVariable Long studentId) {
        return appRepo.findByStudentId(studentId);
    }

    // POST create application
    @PostMapping
    public ResponseEntity<?> createApplication(@RequestBody Map<String, Object> payload) {
        Long studentId = Long.valueOf(payload.get("studentId").toString());
        Long companyId = Long.valueOf(payload.get("companyId").toString());
        String role = payload.getOrDefault("role", "Software Engineer").toString();
        String date = payload.getOrDefault("applicationDate", "").toString();

        Student student = studentRepo.findById(studentId).orElse(null);
        Company company = companyRepo.findById(companyId).orElse(null);

        if (student == null || company == null) {
            return ResponseEntity.badRequest().body("Student or Company not found");
        }

        Application app = new Application(student, company, role, date, "Applied");
        // Update student status
        student.setStatus("Applied");
        studentRepo.save(student);

        return ResponseEntity.ok(appRepo.save(app));
    }

    // PUT update application status (drag and drop kanban)
    @PutMapping("/{id}/status")
    public ResponseEntity<Application> updateStatus(@PathVariable Long id,
                                                     @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        return appRepo.findById(id).map(app -> {
            app.setStatus(newStatus);
            // If placed, update student status too
            if ("Offer".equals(newStatus)) {
                Student s = app.getStudent();
                s.setStatus("Placed");
                studentRepo.save(s);
            }
            return ResponseEntity.ok(appRepo.save(app));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE application
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteApplication(@PathVariable Long id) {
        if (!appRepo.existsById(id)) return ResponseEntity.notFound().build();
        appRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET dashboard stats
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("total", appRepo.count());
        stats.put("applied", appRepo.countByStatus("Applied"));
        stats.put("interview", appRepo.countByStatus("Interview"));
        stats.put("offer", appRepo.countByStatus("Offer"));
        stats.put("rejected", appRepo.countByStatus("Rejected"));
        return ResponseEntity.ok(stats);
    }
}
