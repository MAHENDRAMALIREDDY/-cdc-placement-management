package com.cdcp.backend.controller;

import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.UserRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired private UserRepository userRepository;
    @Autowired private AuthService authService;

    private static final List<String> ALLOWED_RESUME_TYPES = Arrays.asList(
            "application/pdf", "image/jpeg", "image/png"
    );
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024L; // 5 MB

    @PostMapping("/resume")
    public ResponseEntity<?> uploadResume(@RequestHeader("Authorization") String authHeader,
                                          @RequestParam("file") MultipartFile file) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"student".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Only students can upload a resume"));
        }

        // ── File validation ────────────────────────────────────────────────────
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(new ErrorResponse("File is empty"));
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            return ResponseEntity.badRequest().body(new ErrorResponse("File exceeds the 5 MB size limit"));
        }
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_RESUME_TYPES.contains(contentType)) {
            return ResponseEntity.badRequest().body(new ErrorResponse("Only PDF, JPEG, and PNG files are allowed"));
        }

        try {
            user.setResume(file.getBytes());
            user.setResumeFilename(file.getOriginalFilename());
            userRepository.save(user);
            return ResponseEntity.ok(new MessageResponse("Resume uploaded successfully"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ErrorResponse("Failed to upload resume"));
        }
    }

    @GetMapping("/resume/{studentId}")
    public ResponseEntity<byte[]> getResume(@RequestHeader("Authorization") String authHeader,
                                            @PathVariable Long studentId) {
        // ── Auth check (was completely missing before) ─────────────────────────
        User caller = authService.getUserFromToken(authHeader);
        if (caller == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        // Only the student themselves, a company, or an admin may download
        boolean isSelf    = caller.getId().equals(studentId);
        boolean isCompany = "company".equals(caller.getRole());
        boolean isAdmin   = "admin".equals(caller.getRole());
        if (!isSelf && !isCompany && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        Optional<User> userOpt = userRepository.findById(studentId);
        if (userOpt.isEmpty() || userOpt.get().getResume() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }

        User student = userOpt.get();
        if (!"student".equals(student.getRole())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + student.getResumeFilename() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(student.getResume());
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
        }
        // Return profile without password or binary resume blob
        Map<String, Object> profile = new LinkedHashMap<>();
        profile.put("id",           user.getId());
        profile.put("email",        user.getEmail());
        profile.put("role",         user.getRole());
        profile.put("firstName",    user.getFirstName());
        profile.put("lastName",     user.getLastName());
        profile.put("department",   user.getDepartment());
        profile.put("cgpa",         user.getCgpa());
        profile.put("backlogCount", user.getBacklogCount());
        profile.put("skills",       user.getSkills());
        profile.put("hasResume",    user.getResume() != null);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader,
                                           @RequestBody Map<String, Object> updates) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
        }
        if (updates.containsKey("firstName")) user.setFirstName((String) updates.get("firstName"));
        if (updates.containsKey("lastName"))  user.setLastName((String) updates.get("lastName"));
        if (updates.containsKey("department")) user.setDepartment((String) updates.get("department"));
        if (updates.containsKey("cgpa") && updates.get("cgpa") != null)
            user.setCgpa(Double.parseDouble(updates.get("cgpa").toString()));
        if (updates.containsKey("backlogCount") && updates.get("backlogCount") != null)
            user.setBacklogCount(Integer.parseInt(updates.get("backlogCount").toString()));
        if (updates.containsKey("skills")) user.setSkills((String) updates.get("skills"));
        userRepository.save(user);
        return ResponseEntity.ok(new MessageResponse("Profile updated successfully"));
    }
}
