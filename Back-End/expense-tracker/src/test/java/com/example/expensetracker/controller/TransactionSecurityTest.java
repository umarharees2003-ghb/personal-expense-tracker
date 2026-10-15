package com.example.expensetracker.controller;

import com.example.expensetracker.security.JwtAuthenticationFilter;
import com.example.expensetracker.security.JwtService;
import com.example.expensetracker.security.JsonAccessDeniedHandler;
import com.example.expensetracker.security.JsonAuthenticationEntryPoint;
import com.example.expensetracker.security.ExpenseUserDetailsService;
import com.example.expensetracker.service.TransactionService;
import com.example.expensetracker.config.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(TransactionController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class,
        JsonAuthenticationEntryPoint.class, JsonAccessDeniedHandler.class})
class TransactionSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TransactionService transactionService;
    @MockitoBean
    private ExpenseUserDetailsService userDetailsService;
    @MockitoBean
    private JwtService jwtService;

    @Test
    void transactionApiRejectsUnauthenticatedRequests() throws Exception {
        mockMvc.perform(get("/api/transactions"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.path").value("/api/transactions"));
    }

    @Test
    void invalidTransactionRequestReturnsValidationErrors() throws Exception {
        mockMvc.perform(post("/api/transactions")
                        .with(org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user(
                                "jane@example.com"))
                        .contentType("application/json")
                        .content("{\"description\":\"Missing required fields\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Error"))
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/api/transactions"))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.errors.amount").exists())
                .andExpect(jsonPath("$.errors.date").exists())
                .andExpect(jsonPath("$.errors.type").exists());
    }
}
