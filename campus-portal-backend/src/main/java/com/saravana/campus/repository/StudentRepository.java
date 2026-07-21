package com.saravana.campus.repository;

import com.saravana.campus.model.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    List<Student> findByNameContainingIgnoreCase(String name);
    List<Student> findByDepartmentIgnoreCase(String department);
    List<Student> findByCgpaGreaterThanEqual(Double cgpa);
    List<Student> findByStatus(String status);
    long countByStatus(String status);
}
