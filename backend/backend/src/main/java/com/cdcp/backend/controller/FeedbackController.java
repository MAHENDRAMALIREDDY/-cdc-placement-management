package com.cdcp.backend.controller;

import com.cdcp.backend.entity.Feedback;
import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.FeedbackRepository;
import com.cdcp.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;

@RestController
@RequestMapping("/feedback")
public class FeedbackController {

    @Autowired private FeedbackRepository feedbackRepository;
    @Autowired private AuthService authService;

    @PostMapping
    public ResponseEntity<?> submitFeedback(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody Feedback feedback) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Invalid token"));
        }

        feedback.setUserEmail(user.getEmail());
        feedback.setUserRole(user.getRole());
        feedback.setSubmittedAt(new Date());

        return ResponseEntity.ok(feedbackRepository.save(feedback));
    }

    @GetMapping
    public ResponseEntity<?> getAllFeedback(@RequestHeader("Authorization") String authHeader) {
        User user = authService.getUserFromToken(authHeader);
        if (user == null || !"admin".equals(user.getRole())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(new ErrorResponse("Admin only"));
        }

        List<Feedback> feedbacks = feedbackRepository.findAll();
        feedbacks.sort((a, b) -> b.getSubmittedAt().compareTo(a.getSubmittedAt()));
        return ResponseEntity.ok(feedbacks);
    }
}
