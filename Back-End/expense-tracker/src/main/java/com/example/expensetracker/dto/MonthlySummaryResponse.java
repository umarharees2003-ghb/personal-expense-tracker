package com.example.expensetracker.dto;

import java.math.BigDecimal;

public record MonthlySummaryResponse(
        int year,
        int month,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal balance
) {
}
