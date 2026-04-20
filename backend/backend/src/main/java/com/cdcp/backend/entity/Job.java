package com.cdcp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Job title is required")
    @Size(max = 200, message = "Title must not exceed 200 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    @Column(length = 2000)
    private String description;

    private String company;

    @Size(max = 200, message = "Location must not exceed 200 characters")
    private String location;

    @Min(value = 0, message = "Salary cannot be negative")
    private Integer salary;

    @Column(length = 1000)
    private String requirements;

    // Eligibility Criteria (from SRS FR-J2)
    @DecimalMin(value = "0.0", message = "Required CGPA must be at least 0")
    @DecimalMax(value = "10.0", message = "Required CGPA must not exceed 10")
    private Double requiredCgpa;

    @Min(value = 0, message = "Max backlogs cannot be negative")
    private Integer maxBacklogs;

    private String applicationDeadline;
}
