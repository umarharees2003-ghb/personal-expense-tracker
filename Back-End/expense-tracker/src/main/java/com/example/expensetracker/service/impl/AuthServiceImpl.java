package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.LoginRequest;
import com.example.expensetracker.dto.LoginResponse;
import com.example.expensetracker.dto.RegisterRequest;
import com.example.expensetracker.dto.RegisterResponse;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.dto.UpdateProfileRequest;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.DuplicateEmailException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.security.JwtService;
import com.example.expensetracker.security.AppUserDetails;
import com.example.expensetracker.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    @Override
    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateEmailException("An account with this email already exists");
        }
        User user = new User();
        user.setName(request.name().trim());
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(request.password()));
        User savedUser = userRepository.save(user);
        return new RegisterResponse("Registration successful", toResponse(savedUser));
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(email, request.password()));
        User user = userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        AppUserDetails userDetails = (AppUserDetails) authentication.getPrincipal();
        return new LoginResponse(jwtService.generateToken(userDetails), toResponse(user));
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getCurrentUser(String email) {
        return toResponse(userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found")));
    }

    @Override
    @Transactional
    public LoginResponse updateCurrentUser(String currentEmail, UpdateProfileRequest request) {
        User user = userRepository.findByEmailIgnoreCase(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCaseAndIdNot(email, user.getId())) {
            throw new DuplicateEmailException("An account with this email already exists");
        }
        user.setName(request.name().trim());
        user.setEmail(email);
        User savedUser = userRepository.saveAndFlush(user);
        AppUserDetails updatedDetails = new AppUserDetails(savedUser);
        return new LoginResponse(jwtService.generateToken(updatedDetails), toResponse(savedUser));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail());
    }
}
