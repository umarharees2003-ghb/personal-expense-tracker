package com.example.expensetracker.controller;

import com.example.expensetracker.dto.LoginRequest;
import com.example.expensetracker.dto.LoginResponse;
import com.example.expensetracker.dto.RegisterRequest;
import com.example.expensetracker.dto.RegisterResponse;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.dto.UpdateProfileRequest;
import com.example.expensetracker.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Register a new account", description = "Public endpoint; returns safe user details.")
    public RegisterResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Log in", description = "Public endpoint; returns a JWT bearer token.")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @GetMapping("/me")
    @Operation(summary = "Get the authenticated user", description = "Requires a valid JWT bearer token.")
    @SecurityRequirement(name = "bearerAuth")
    public UserResponse me(@AuthenticationPrincipal UserDetails userDetails) {
        return authService.getCurrentUser(userDetails.getUsername());
    }

    @PutMapping("/me")
    @Operation(summary = "Update the authenticated user's name and email", description = "Returns the updated profile and a fresh JWT.")
    @SecurityRequirement(name = "bearerAuth")
    public LoginResponse updateMe(@AuthenticationPrincipal UserDetails userDetails,
                                  @Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateCurrentUser(userDetails.getUsername(), request);
    }
}
