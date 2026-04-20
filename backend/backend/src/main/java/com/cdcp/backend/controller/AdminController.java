package com.cdcp.backend.controller;

import com.cdcp.backend.entity.Application;
import com.cdcp.backend.entity.Job;
import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.ApplicationRepository;
import com.cdcp.backend.repository.JobRepository;
import com.cdcp.backend.repository.UserRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
public class AdminController {

    @Autowired private UserRepository userRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private AuthService authService;

    private boolean isAdmin(String authHeader) {
        User u = authService.getUserFromToken(authHeader);
        return u != null && "admin".equals(u.getRole());
    }

    @GetMapping("/stats")
    public ResponseEntity<?> getStats(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));

        List<User> allUsers = userRepository.findAll();
        List<Job> allJobs = jobRepository.findAll();
        List<Application> allApps = applicationRepository.findAll();

        long students  = allUsers.stream().filter(u -> "student".equals(u.getRole())).count();
        long companies = allUsers.stream().filter(u -> "company".equals(u.getRole())).count();
        long accepted  = allApps.stream().filter(a -> "ACCEPTED".equals(a.getStatus()) || "SELECTED".equals(a.getStatus())).count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalStudents",     students);
        stats.put("totalCompanies",    companies);
        stats.put("totalJobs",         allJobs.size());
        stats.put("totalApplications", allApps.size());
        stats.put("totalPlacements",   accepted);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));

        List<Map<String, Object>> users = userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id",         u.getId());
            m.put("email",      u.getEmail());
            m.put("role",       u.getRole());
            m.put("firstName",  u.getFirstName());
            m.put("lastName",   u.getLastName());
            m.put("department", u.getDepartment());
            m.put("cgpa",       u.getCgpa());
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));
        if (!userRepository.existsById(id)) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ErrorResponse("User not found"));
        userRepository.deleteById(id);
        return ResponseEntity.ok(new MessageResponse("User deleted"));
    }

    @GetMapping("/applications")
    public ResponseEntity<?> getAllApplications(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));
        return ResponseEntity.ok(applicationRepository.findAll());
    }

    @GetMapping("/company-stats")
    public ResponseEntity<?> getCompanyStats(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));

        Map<String, Long> companyWise = applicationRepository.findAll().stream()
                .collect(Collectors.groupingBy(
                        a -> a.getCompany() != null ? a.getCompany() : "Unknown",
                        Collectors.counting()));

        return ResponseEntity.ok(companyWise);
    }

    @GetMapping("/reports/department")
    public ResponseEntity<?> getDepartmentReports(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));

        List<User> students = userRepository.findAll().stream()
                .filter(u -> "student".equals(u.getRole()))
                .collect(Collectors.toList());
        List<Application> apps = applicationRepository.findAll();

        Map<String, Map<String, Object>> deptStats = new HashMap<>();

        for (User student : students) {
            String dept = (student.getDepartment() == null || student.getDepartment().isBlank())
                    ? "Unknown" : student.getDepartment();

            deptStats.putIfAbsent(dept, new HashMap<>(Map.of("totalStudents", 0, "placedStudents", 0)));
            Map<String, Object> stats = deptStats.get(dept);
            stats.put("totalStudents", (int) stats.get("totalStudents") + 1);

            boolean placed = apps.stream().anyMatch(a ->
                    a.getStudentId().equals(student.getId()) &&
                    ("SELECTED".equals(a.getStatus()) || "ACCEPTED".equals(a.getStatus())));
            if (placed) stats.put("placedStudents", (int) stats.get("placedStudents") + 1);
        }

        for (Map.Entry<String, Map<String, Object>> entry : deptStats.entrySet()) {
            Map<String, Object> stats = entry.getValue();
            int total  = (int) stats.get("totalStudents");
            int placed = (int) stats.get("placedStudents");
            stats.put("placementPercentage", total == 0 ? 0.0 : ((double) placed / total) * 100.0);
            stats.put("department", entry.getKey());
        }

        return ResponseEntity.ok(deptStats.values());
    }

    @GetMapping("/reports/student")
    public ResponseEntity<?> getStudentReports(@RequestHeader("Authorization") String authHeader) {
        if (!isAdmin(authHeader)) return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));

        List<User> students = userRepository.findAll().stream()
                .filter(u -> "student".equals(u.getRole()))
                .collect(Collectors.toList());
        List<Application> apps = applicationRepository.findAll();

        List<Map<String, Object>> studentStats = students.stream().map(student -> {
            Map<String, Object> statsMap = new HashMap<>();
            statsMap.put("studentId",  student.getId());
            statsMap.put("name",       buildFullName(student));
            statsMap.put("department", student.getDepartment());

            List<Application> studentApps = apps.stream()
                    .filter(a -> a.getStudentId().equals(student.getId()))
                    .collect(Collectors.toList());
            statsMap.put("appsCount", studentApps.size());

            boolean placed = studentApps.stream().anyMatch(a ->
                    "SELECTED".equals(a.getStatus()) || "ACCEPTED".equals(a.getStatus()));
            statsMap.put("status", placed ? "Placed" : "Unplaced");

            return statsMap;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(studentStats);
    }

    private String buildFullName(User user) {
        String first = user.getFirstName() != null ? user.getFirstName().trim() : "";
        String last  = user.getLastName()  != null ? user.getLastName().trim()  : "";
        String full  = (first + " " + last).trim();
        return full.isBlank() ? user.getEmail() : full;
    }
}
