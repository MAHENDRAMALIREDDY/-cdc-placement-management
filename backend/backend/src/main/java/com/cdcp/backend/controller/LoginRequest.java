package com.cdcp.backend.controller;

import lombok.Data;

@Data
public class LoginRequest {
    private String username;
    private String password;
}
