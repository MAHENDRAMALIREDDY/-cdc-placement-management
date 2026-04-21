package com.cdcp.backend.config;

import com.cdcp.backend.entity.Job;
import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.JobRepository;
import com.cdcp.backend.repository.UserRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataSeeder {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JobRepository jobRepository;

    @Autowired
    private AuthService authService;

    @Bean
    public CommandLineRunner initData() {
        return args -> {
            if (userRepository.count() == 0) {
                User student = new User();
                student.setEmail("student@cdcp.edu");
                student.setPassword(authService.hashPassword("Student@123"));
                student.setRole("student");
                student.setFirstName("Alice");
                student.setLastName("Sample");
                student.setDepartment("Computer Science and Engineering");
                student.setCgpa(8.5);
                student.setBacklogCount(0);

                User company = new User();
                company.setEmail("hr@techcorp.com");
                company.setPassword(authService.hashPassword("Company@123"));
                company.setRole("company");
                company.setFirstName("TechCorp");

                User admin = new User();
                admin.setEmail("admin@cdcp.edu");
                admin.setPassword(authService.hashPassword("Admin@123"));
                admin.setRole("admin");
                admin.setFirstName("Admin");
                admin.setLastName("User");

                userRepository.saveAll(Arrays.asList(student, company, admin));

                System.out.println("==========================================================");
                System.out.println("  Seeded demo accounts (passwords are BCrypt hashed):");
                System.out.println("  Student:  student@cdcp.edu  /  Student@123");
                System.out.println("  Company:  hr@techcorp.com   /  Company@123");
                System.out.println("  Admin:    admin@cdcp.edu    /  Admin@123");
                System.out.println("==========================================================");
            }

            if (jobRepository.count() == 0) {
                Job job1 = new Job();
                job1.setTitle("Software Engineer");
                job1.setDescription("Develop scalable backend systems using Spring Boot and Java.");
                job1.setCompany("hr@techcorp.com");
                job1.setLocation("Bangalore");
                job1.setSalary(800000);
                job1.setRequirements("Java, Spring Boot, SQL");
                job1.setRequiredCgpa(7.0);
                job1.setMaxBacklogs(0);
                job1.setApplicationDeadline("2025-12-31");

                Job job2 = new Job();
                job2.setTitle("Frontend Developer");
                job2.setDescription("Build amazing user interfaces using React and TypeScript.");
                job2.setCompany("hr@techcorp.com");
                job2.setLocation("Remote");
                job2.setSalary(600000);
                job2.setRequirements("React, TypeScript, CSS");
                job2.setRequiredCgpa(6.5);
                job2.setMaxBacklogs(1);
                job2.setApplicationDeadline("2025-12-31");

                jobRepository.saveAll(Arrays.asList(job1, job2));
                System.out.println("Seeded sample jobs.");
            }
        };
    }
}
