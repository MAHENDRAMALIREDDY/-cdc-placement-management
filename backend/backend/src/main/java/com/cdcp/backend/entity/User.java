package com.cdcp.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "users")
@Data
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be a valid address")
    @Column(unique = true)
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @Pattern(regexp = "student|company|admin", message = "Role must be student, company, or admin")
    private String role;

    @Lob
    @Column(length = 100000)
    private byte[] resume;
    private String resumeFilename;

    // Extended Student Profile Fields
    @Size(max = 100, message = "First name must not exceed 100 characters")
    private String firstName;

    @Size(max = 100, message = "Last name must not exceed 100 characters")
    private String lastName;

    @Size(max = 200, message = "Department must not exceed 200 characters")
    private String department;

    @DecimalMin(value = "0.0", message = "CGPA must be at least 0")
    @DecimalMax(value = "10.0", message = "CGPA must not exceed 10")
    private Double cgpa;

    @Min(value = 0, message = "Backlog count cannot be negative")
    private Integer backlogCount;

    @Column(length = 1000)
    private String skills;
}