package com.example.expensetracker.service;

import com.example.expensetracker.dto.LoginRequest;
import com.example.expensetracker.dto.LoginResponse;
import com.example.expensetracker.dto.RegisterRequest;
import com.example.expensetracker.dto.RegisterResponse;
import com.example.expensetracker.dto.UserResponse;
import com.example.expensetracker.dto.UpdateProfileRequest;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);

    UserResponse getCurrentUser(String email);

    LoginResponse updateCurrentUser(String currentEmail, UpdateProfileRequest request);
}
