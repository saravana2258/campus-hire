package com.saravana.campus.controller;

import com.saravana.campus.model.Student;
import com.saravana.campus.repository.StudentRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "*")  // Allow frontend to call this API
public class StudentController {

    @Autowired
    private StudentRepository studentRepo;

    // GET all students
    @GetMapping
    public List<Student> getAllStudents() {
        return studentRepo.findAll();
    }

    // GET student by ID
    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudent(@PathVariable Long id) {
        return studentRepo.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    // POST create new student
    @PostMapping
    public ResponseEntity<Student> createStudent(@Valid @RequestBody Student student) {
        Student saved = studentRepo.save(student);
        return ResponseEntity.ok(saved);
    }

    // PUT update existing student
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id,
                                                  @Valid @RequestBody Student updatedStudent) {
        return studentRepo.findById(id).map(student -> {
            student.setName(updatedStudent.getName());
            student.setDepartment(updatedStudent.getDepartment());
            student.setCgpa(updatedStudent.getCgpa());
            student.setBacklogs(updatedStudent.getBacklogs());
            student.setEmail(updatedStudent.getEmail());
            student.setSkills(updatedStudent.getSkills());
            student.setStatus(updatedStudent.getStatus());
            return ResponseEntity.ok(studentRepo.save(student));
        }).orElse(ResponseEntity.notFound().build());
    }

    // DELETE student
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        if (!studentRepo.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        studentRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // GET students by status
    @GetMapping("/status/{status}")
    public List<Student> getByStatus(@PathVariable String status) {
        return studentRepo.findByStatus(status);
    }

    // GET students by CGPA threshold
    @GetMapping("/cgpa/{min}")
    public List<Student> getByCgpa(@PathVariable Double min) {
        return studentRepo.findByCgpaGreaterThanEqual(min);
    }

    // GET stats: count per status
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        long total = studentRepo.count();
        long available = studentRepo.countByStatus("Available");
        long placed = studentRepo.countByStatus("Placed");
        return ResponseEntity.ok(new long[]{total, available, placed});
    }
}
