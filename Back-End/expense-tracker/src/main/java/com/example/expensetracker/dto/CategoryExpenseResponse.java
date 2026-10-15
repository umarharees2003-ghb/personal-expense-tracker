package com.example.expensetracker.dto;

import java.math.BigDecimal;

public record CategoryExpenseResponse(String category, BigDecimal amount) {
}
