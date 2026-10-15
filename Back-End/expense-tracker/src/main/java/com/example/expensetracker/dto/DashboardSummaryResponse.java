package com.example.expensetracker.dto;

import java.math.BigDecimal;

public record DashboardSummaryResponse(
        BigDecimal totalIncome,
        BigDecimal totalExpense,
        BigDecimal balance,
        BigDecimal currentMonthIncome,
        BigDecimal currentMonthExpenses
) {
}
