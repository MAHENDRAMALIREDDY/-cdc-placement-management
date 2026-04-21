package com.cdcp.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long jobId;
    private String jobTitle;
    private String company;

    private Long studentId;
    private String studentName;
    private String studentEmail;

    private Date appliedDate;
    private String status; // PENDING, ACCEPTED, REJECTED, SELECTED, JOB DELETED

    // Recruitment Process Stage tracking
    private String currentStage;

    // Offer Letter Upload (SRS UC-08)
    @Lob
    @Column(length = 5000000)
    private byte[] offerLetter;
    private String offerLetterFilename;
}
