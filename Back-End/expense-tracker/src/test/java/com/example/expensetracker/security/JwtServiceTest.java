package com.example.expensetracker.security;

import com.example.expensetracker.entity.User;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    private final JwtService jwtService = new JwtService(
            "test-secret-with-at-least-32-bytes-long", 60_000);

    @Test
    void tokenIdentityUsesUserIdAndRemainsValidAfterEmailChange() {
        User original = user(25L, "old@example.com");
        String token = jwtService.generateToken(new AppUserDetails(original));

        User updated = user(25L, "new@example.com");

        assertEquals(25L, jwtService.extractUserId(token));
        assertTrue(jwtService.isTokenValid(token, new AppUserDetails(updated)));
    }

    @Test
    void tokenIsNotValidForAnotherUserId() {
        String token = jwtService.generateToken(new AppUserDetails(user(25L, "jane@example.com")));

        assertFalse(jwtService.isTokenValid(
                token, new AppUserDetails(user(26L, "jane@example.com"))));
    }

    private User user(Long id, String email) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setPassword("encoded-password");
        return user;
    }
}
