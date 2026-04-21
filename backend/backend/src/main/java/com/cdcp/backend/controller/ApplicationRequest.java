package com.cdcp.backend.controller;

import lombok.Data;

@Data
public class ApplicationRequest {
    private Long jobId;
    private String status;
    private String currentStage;
}
