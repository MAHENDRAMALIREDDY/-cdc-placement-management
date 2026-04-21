package com.cdcp.backend.repository;

import com.cdcp.backend.entity.RecruitmentStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RecruitmentStageRepository extends JpaRepository<RecruitmentStage, Long> {
    List<RecruitmentStage> findByJobIdOrderByStageOrderAsc(Long jobId);
}
