package com.cdcp.backend.controller;

import com.cdcp.backend.entity.Application;
import com.cdcp.backend.entity.Job;
import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.ApplicationRepository;
import com.cdcp.backend.repository.JobRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/applications")
public class ApplicationController {

    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private AuthService authService;

    private static final List<String> ALLOWED_OFFER_TYPES = Arrays.asList(
            "application/pdf", "image/jpeg", "image/png"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L; // 5 MB

    @GetMapping
    public ResponseEntity<?> getApplications(@RequestHeader("Authorization") String authHeader,
                                             @RequestParam(required = false) Long jobId) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
        }

        if ("student".equals(user.getRole())) {
            return ResponseEntity.ok(applicationRepository.findByStudentId(user.getId()));
        } else if ("company".equals(user.getRole())) {
            if (jobId == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new ErrorResponse("jobId query parameter is required for company role"));
            }
            return ResponseEntity.ok(applicationRepository.findByJobId(jobId));
        } else if ("admin".equals(user.getRole())) {
            return ResponseEntity.ok(applicationRepository.findAll());
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ErrorResponse("Access denied"));
    }

    @PostMapping
    public ResponseEntity<?> applyToJob(@RequestHeader("Authorization") String authHeader,
                                        @RequestBody ApplicationRequest request) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"student".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only students can apply to jobs"));
        }

        Optional<Job> jobOpt = jobRepository.findById(request.getJobId());
        if (jobOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Job not found"));
        }

        if (applicationRepository.existsByStudentIdAndJobId(user.getId(), request.getJobId())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(new ErrorResponse("You have already applied to this job"));
        }

        Job job = jobOpt.get();

        // ── Deadline enforcement ────────────────────────────────────────────────
        if (job.getApplicationDeadline() != null && !job.getApplicationDeadline().isBlank()) {
            try {
                LocalDate deadline = LocalDate.parse(job.getApplicationDeadline());
                if (LocalDate.now().isAfter(deadline)) {
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(new ErrorResponse("Application deadline has passed (" + job.getApplicationDeadline() + ")"));
                }
            } catch (DateTimeParseException ignored) {
                // Unparseable deadline — allow application rather than blocking
            }
        }

        // ── Eligibility check (SRS FR-J2) ──────────────────────────────────────
        if (job.getRequiredCgpa() != null && user.getCgpa() != null && user.getCgpa() < job.getRequiredCgpa()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Not eligible: CGPA required is " + job.getRequiredCgpa() + " but yours is " + user.getCgpa()));
        }
        if (job.getMaxBacklogs() != null && user.getBacklogCount() != null && user.getBacklogCount() > job.getMaxBacklogs()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ErrorResponse("Not eligible: Max backlogs allowed is " + job.getMaxBacklogs() + " but you have " + user.getBacklogCount()));
        }

        // ── Build full name from firstName + lastName ──────────────────────────
        String fullName = buildFullName(user);

        Application application = new Application();
        application.setJobId(job.getId());
        application.setJobTitle(job.getTitle());
        application.setCompany(job.getCompany());
        application.setStudentId(user.getId());
        application.setStudentName(fullName);       // ← real name, not email
        application.setStudentEmail(user.getEmail());
        application.setAppliedDate(new Date());
        application.setStatus("PENDING");

        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateStatus(@RequestHeader("Authorization") String authHeader,
                                          @PathVariable Long id,
                                          @RequestBody ApplicationRequest request) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can update status"));
        }

        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Application not found"));
        }

        Application application = appOpt.get();
        if (request.getStatus() != null)       application.setStatus(request.getStatus());
        if (request.getCurrentStage() != null) application.setCurrentStage(request.getCurrentStage());

        return ResponseEntity.ok(applicationRepository.save(application));
    }

    @PostMapping("/{id}/offer")
    public ResponseEntity<?> uploadOfferLetter(@RequestHeader("Authorization") String authHeader,
                                               @PathVariable Long id,
                                               @RequestParam("file") MultipartFile file) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"company".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only companies can upload offer letters"));
        }

        // ── File validation ────────────────────────────────────────────────────
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("File is empty"));
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(new ErrorResponse("File exceeds the 5 MB size limit"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_OFFER_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Only PDF, JPEG, and PNG files are allowed"));
        }

        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("Application not found"));
        }

        try {
            Application application = appOpt.get();
            application.setOfferLetter(file.getBytes());
            application.setOfferLetterFilename(file.getOriginalFilename());
            return ResponseEntity.ok(applicationRepository.save(application));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to upload offer letter"));
        }
    }

    @GetMapping("/{id}/offer")
    public ResponseEntity<byte[]> downloadOfferLetter(@RequestHeader("Authorization") String authHeader,
                                                      @PathVariable Long id) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }

        Optional<Application> appOpt = applicationRepository.findById(id);
        if (appOpt.isEmpty() || appOpt.get().getOfferLetter() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        Application application = appOpt.get();
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + application.getOfferLetterFilename() + "\"")
                .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                .body(application.getOfferLetter());
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private String buildFullName(User user) {
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last  = user.getLastName()  != null ? user.getLastName().trim()  : "";
        String full  = (first + " " + last).trim();
        return full.isBlank() ? user.getEmail() : full;
    }
}
