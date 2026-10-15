package com.example.expensetracker.dto;

import com.example.expensetracker.entity.TransactionType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record TransactionResponse(
        Long id,
        BigDecimal amount,
        String description,
        LocalDate date,
        TransactionType type,
        Long categoryId,
        String categoryName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
