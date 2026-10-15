package com.example.expensetracker.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

@Service
public class JwtService {

    private final String secret;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.expiration-ms}") long expirationMs) {
        this.secret = secret;
        this.expirationMs = expirationMs;
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalArgumentException("JWT secret must contain at least 32 UTF-8 bytes");
        }
        if (expirationMs <= 0) {
            throw new IllegalArgumentException("JWT expiration must be greater than 0 milliseconds");
        }
    }

    public String generateToken(AppUserDetails userDetails) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userDetails.getId().toString())
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(getSigningKey())
                .compact();
    }

    public boolean isTokenValid(String token, AppUserDetails userDetails) {
        Claims claims = extractClaims(token);
        return claims.getSubject().equals(userDetails.getId().toString())
                && claims.getExpiration().after(new Date());
    }

    public Long extractUserId(String token) {
        return Long.valueOf(extractClaims(token).getSubject());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
