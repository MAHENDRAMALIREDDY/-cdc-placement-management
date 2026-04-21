package com.cdcp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Job ID cannot be null")
    private Long jobId;

    @NotBlank(message = "Job title cannot be blank")
    private String jobTitle;

    @NotBlank(message = "Company name cannot be blank")
    private String company;

    @NotNull(message = "Student ID cannot be null")
    private Long studentId;

    @NotBlank(message = "Student name cannot be blank")
    private String studentName;

    @Email(message = "Student email should be valid")
    @NotBlank(message = "Student email cannot be blank")
    private String studentEmail;

    @NotNull(message = "Applied date cannot be null")
    private LocalDateTime appliedDate;

    @Enumerated(EnumType.STRING)
    @NotNull(message = "Status cannot be null")
    private ApplicationStatus status;

    // Audit Trail Fields
    @NotNull(message = "Created date cannot be null")
    private LocalDateTime createdAt;

    @NotNull(message = "Updated date cannot be null")
    private LocalDateTime updatedAt;

    // Offer Letter Upload (SRS UC-08)
    @Lob
    @Column(length = 5000000)
    private byte[] offerLetter;

    @NotBlank(message = "Offer letter filename cannot be blank")
    @javax.persistence.Column(length = 255)
    private String offerLetterFilename;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}