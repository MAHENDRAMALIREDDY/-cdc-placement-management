package com.cdcp.backend.controller;

import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.UserRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getUsername());

        if (userOpt.isPresent()) {
            User user = userOpt.get();
            if (authService.checkPassword(request.getPassword(), user.getPassword())) {
                String token = authService.generateToken(user.getId());
                return ResponseEntity.ok(new LoginResponse(token, user.getRole()));
            }
        }

        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("Invalid username or password"));
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody Map<String, String> body) {
        String email    = body.get("email");
        String password = body.get("password");
        String role     = body.get("role"); // "student" or "company"

        // Validate inputs
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(new ErrorResponse("Email is required"));
        if (password == null || password.isBlank())
            return ResponseEntity.badRequest().body(new ErrorResponse("Password is required"));
        if (!"student".equals(role) && !"company".equals(role))
            return ResponseEntity.badRequest().body(new ErrorResponse("Role must be 'student' or 'company'"));

        // Check for duplicate email
        if (userRepository.findByEmail(email).isPresent())
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(new ErrorResponse("An account with this email already exists"));

        // Create user with hashed password
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(authService.hashPassword(password)); // ← BCrypt hashed
        newUser.setRole(role);

        if (body.containsKey("firstName"))  newUser.setFirstName(body.get("firstName"));
        if (body.containsKey("lastName"))   newUser.setLastName(body.get("lastName"));
        if (body.containsKey("department")) newUser.setDepartment(body.get("department"));

        User saved = userRepository.save(newUser);

        // Return JWT immediately so user is logged in after registration
        String token = authService.generateToken(saved.getId());
        return ResponseEntity.ok(new LoginResponse(token, saved.getRole()));
    }
}
