package com.cdcp.backend.entity;

/**
 * Enum for Application Status
 * Represents the different states an application can be in during the placement process
 */
public enum ApplicationStatus {
    PENDING("Pending Review"),
    ACCEPTED("Accepted"),
    REJECTED("Rejected"),
    SELECTED("Selected for Interview"),
    JOB_DELETED("Job Deleted");

    private final String displayName;

    ApplicationStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}