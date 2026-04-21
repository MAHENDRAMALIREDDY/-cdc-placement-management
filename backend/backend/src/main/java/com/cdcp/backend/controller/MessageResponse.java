package com.cdcp.backend.controller;

import lombok.AllArgsConstructor;
import lombok.Data;

/** Used for success confirmations (e.g. "Job deleted", "Resume uploaded"). */
@Data
@AllArgsConstructor
public class MessageResponse {
    private String message;
}
