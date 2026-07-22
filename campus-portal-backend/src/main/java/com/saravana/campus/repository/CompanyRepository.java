package com.saravana.campus.repository;

import com.saravana.campus.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    List<Company> findByNameContainingIgnoreCase(String name);
    List<Company> findByIndustryIgnoreCase(String industry);
    List<Company> findByPackageLpaGreaterThanEqual(Double lpa);
}
