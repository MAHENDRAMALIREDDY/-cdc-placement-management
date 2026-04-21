package com.cdcp.backend.controller;

import com.cdcp.backend.entity.Job;
import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.JobRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/jobs")
public class JobController {

    @Autowired private JobRepository jobRepository;
    @Autowired private AuthService authService;
    @Autowired private com.cdcp.backend.repository.ApplicationRepository applicationRepository;
    @Autowired private com.cdcp.backend.repository.RecruitmentStageRepository recruitmentStageRepository;

    @GetMapping
    public ResponseEntity<List<Job>> getAllJobs() {
        return ResponseEntity.ok(jobRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createJob(@RequestHeader("Authorization") String authHeader, @RequestBody Job job) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can post jobs"));
        }
        job.setCompany(user.getEmail());
        return ResponseEntity.ok(jobRepository.save(job));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can delete jobs"));
        }

        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Job not found"));
        }

        // Mark all existing applications as JOB DELETED so students are informed
        List<com.cdcp.backend.entity.Application> applications = applicationRepository.findByJobId(id);
        applications.forEach(app -> app.setStatus("JOB DELETED"));
        applicationRepository.saveAll(applications);

        jobRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("Job deleted successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(@RequestHeader("Authorization") String authHeader,
                                       @PathVariable Long id,
                                       @RequestBody Job updatedJob) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can edit jobs"));
        }

        Optional<Job> jobOpt = jobRepository.findById(id);
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Job not found"));
        }

        Job job = jobOpt.get();
        if (updatedJob.getTitle()               != null) job.setTitle(updatedJob.getTitle());
        if (updatedJob.getDescription()         != null) job.setDescription(updatedJob.getDescription());
        if (updatedJob.getLocation()            != null) job.setLocation(updatedJob.getLocation());
        if (updatedJob.getSalary()              != null) job.setSalary(updatedJob.getSalary());
        if (updatedJob.getRequirements()        != null) job.setRequirements(updatedJob.getRequirements());
        if (updatedJob.getRequiredCgpa()        != null) job.setRequiredCgpa(updatedJob.getRequiredCgpa());
        if (updatedJob.getMaxBacklogs()         != null) job.setMaxBacklogs(updatedJob.getMaxBacklogs());
        if (updatedJob.getApplicationDeadline() != null) job.setApplicationDeadline(updatedJob.getApplicationDeadline());

        return ResponseEntity.ok(jobRepository.save(job));
    }

    @GetMapping("/{id}/stages")
    public ResponseEntity<?> getJobStages(@PathVariable Long id) {
        return ResponseEntity.ok(recruitmentStageRepository.findByJobIdOrderByStageOrderAsc(id));
    }

    @PostMapping("/{id}/stages")
    public ResponseEntity<?> addJobStage(@RequestHeader("Authorization") String authHeader,
                                         @PathVariable Long id,
                                         @RequestBody com.cdcp.backend.entity.RecruitmentStage stage) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can manage stages"));
        }
        if (jobRepository.findById(id).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Job not found"));
        }
        stage.setJobId(id);
        return ResponseEntity.ok(recruitmentStageRepository.save(stage));
    }

    @DeleteMapping("/stages/{stageId}")
    public ResponseEntity<?> deleteJobStage(@RequestHeader("Authorization") String authHeader, @PathVariable Long stageId) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can delete stages"));
        }
        if (!recruitmentStageRepository.existsById(stageId)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Stage not found"));
        }
        recruitmentStageRepository.deleteById(stageId);
        return ResponseEntity.ok(new MessageResponse("Stage deleted successfully"));
    }
}
