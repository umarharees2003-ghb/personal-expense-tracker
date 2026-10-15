package com.example.expensetracker.dto;

import com.example.expensetracker.entity.TransactionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record TransactionRequest(
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be greater than 0")
        @Digits(integer = 10, fraction = 2, message = "Amount can have at most 10 integer and 2 decimal places")
        BigDecimal amount,

        @Size(max = 500, message = "Description must not exceed 500 characters")
        String description,

        @NotNull(message = "Date is required")
        LocalDate date,

        @NotNull(message = "Transaction type is required")
        TransactionType type,

        Long categoryId
) {
}
