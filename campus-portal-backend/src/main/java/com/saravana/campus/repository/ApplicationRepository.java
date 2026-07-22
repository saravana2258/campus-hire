package com.saravana.campus.repository;

import com.saravana.campus.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByStatus(String status);
    List<Application> findByStudentId(Long studentId);
    List<Application> findByCompanyId(Long companyId);
    long countByStatus(String status);
}
