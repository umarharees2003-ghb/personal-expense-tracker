package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.LoginRequest;
import com.example.expensetracker.dto.RegisterRequest;
import com.example.expensetracker.dto.UpdateProfileRequest;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.UserRepository;
import com.example.expensetracker.security.AppUserDetails;
import com.example.expensetracker.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @InjectMocks
    private AuthServiceImpl authService;

    @Test
    void registerStoresEncodedPasswordAndReturnsSafeUser() {
        when(userRepository.existsByEmailIgnoreCase("jane@example.com")).thenReturn(false);
        when(passwordEncoder.encode("secret123")).thenReturn("encoded-password");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User saved = invocation.getArgument(0);
            saved.setId(7L);
            return saved;
        });

        var response = authService.register(new RegisterRequest("Jane Doe", "Jane@Example.com", "secret123"));

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        assertEquals("encoded-password", userCaptor.getValue().getPassword());
        assertEquals("jane@example.com", userCaptor.getValue().getEmail());
        assertEquals(7L, response.user().id());
        assertFalse(response.toString().contains("encoded-password"));
    }

    @Test
    void loginReturnsJwtAndSafeUser() {
        User user = new User();
        user.setId(4L);
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        user.setPassword("encoded-password");
        AppUserDetails details = new AppUserDetails(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                details, null, details.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(jwtService.generateToken(details)).thenReturn("signed-token");

        var response = authService.login(new LoginRequest("Jane@Example.com", "secret123"));

        assertEquals("signed-token", response.token());
        assertEquals("jane@example.com", response.user().email());
        assertFalse(response.toString().contains("encoded-password"));
    }

    @Test
    void updateCurrentUserReturnsReplacementTokenAndNormalizedProfile() {
        User user = new User();
        user.setId(9L);
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        user.setPassword("encoded-password");
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("new@example.com", 9L)).thenReturn(false);
        when(userRepository.saveAndFlush(user)).thenReturn(user);
        when(jwtService.generateToken(any(AppUserDetails.class))).thenReturn("replacement-token");

        var response = authService.updateCurrentUser(
                "jane@example.com", new UpdateProfileRequest(" Jane Doe ", " New@Example.com "));

        assertEquals("replacement-token", response.token());
        assertEquals("Jane Doe", response.user().name());
        assertEquals("new@example.com", response.user().email());
    }

    @Test
    void updateCurrentUserRejectsEmailAlreadyOwnedByAnotherAccount() {
        User user = new User();
        user.setId(9L);
        user.setName("Jane Doe");
        user.setEmail("jane@example.com");
        when(userRepository.findByEmailIgnoreCase("jane@example.com")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailIgnoreCaseAndIdNot("taken@example.com", 9L)).thenReturn(true);

        org.junit.jupiter.api.Assertions.assertThrows(
                com.example.expensetracker.exception.DuplicateEmailException.class,
                () -> authService.updateCurrentUser(
                        "jane@example.com", new UpdateProfileRequest("Jane Doe", "taken@example.com")));
        verify(userRepository, never()).saveAndFlush(any(User.class));
    }
}
