package com.example.expensetracker.service.impl;

import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceSupport {

    private final UserRepository userRepository;

    public User requireUser(String email) {
        return userRepository.findByEmailIgnoreCase(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
