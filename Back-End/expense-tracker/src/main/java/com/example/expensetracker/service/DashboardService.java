package com.example.expensetracker.service;

import com.example.expensetracker.dto.CategoryExpenseResponse;
import com.example.expensetracker.dto.DashboardSummaryResponse;
import com.example.expensetracker.dto.MonthlySummaryResponse;
import com.example.expensetracker.dto.TransactionResponse;

import java.util.List;

public interface DashboardService {
    DashboardSummaryResponse getSummary(String email);

    List<TransactionResponse> getRecentTransactions(String email);

    List<CategoryExpenseResponse> getCategoryExpenses(String email);

    MonthlySummaryResponse getMonthlySummary(String email, Integer month, Integer year);
}
