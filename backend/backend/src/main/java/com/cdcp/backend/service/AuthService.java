package com.cdcp.backend.service;

import com.cdcp.backend.entity.User;
import com.cdcp.backend.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Value("${jwt.secret}")
    private String jwtSecret;

    private static final long JWT_EXPIRY_MS = 24 * 60 * 60 * 1000L; // 24 hours

    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ── Password helpers ────────────────────────────────────────────────────────

    public String hashPassword(String rawPassword) {
        return passwordEncoder.encode(rawPassword);
    }

    public boolean checkPassword(String rawPassword, String hashedPassword) {
        // Support legacy plain-text passwords during transition: if the stored value
        // does not look like a BCrypt hash, fall back to plain comparison.
        if (hashedPassword != null && hashedPassword.startsWith("$2")) {
            return passwordEncoder.matches(rawPassword, hashedPassword);
        }
        return rawPassword.equals(hashedPassword); // legacy fallback
    }

    // ── JWT helpers ─────────────────────────────────────────────────────────────

    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(Long userId) {
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + JWT_EXPIRY_MS))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts the authenticated User from the Authorization header.
     * Returns null if the token is missing, malformed, expired, or the user no longer exists.
     */
    public User getUserFromToken(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        String token = authHeader.substring(7);
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Long userId = Long.parseLong(claims.getSubject());
            return userRepository.findById(userId).orElse(null);
        } catch (JwtException | NumberFormatException e) {
            return null;
        }
    }
}
