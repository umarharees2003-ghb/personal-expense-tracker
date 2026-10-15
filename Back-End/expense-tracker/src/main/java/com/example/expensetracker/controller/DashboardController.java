package com.example.expensetracker.controller;

import com.example.expensetracker.dto.CategoryExpenseResponse;
import com.example.expensetracker.dto.DashboardSummaryResponse;
import com.example.expensetracker.dto.MonthlySummaryResponse;
import com.example.expensetracker.dto.TransactionResponse;
import com.example.expensetracker.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    @Operation(summary = "Get lifetime and current month totals")
    public DashboardSummaryResponse summary(@AuthenticationPrincipal UserDetails user) {
        return dashboardService.getSummary(user.getUsername());
    }

    @GetMapping("/recent-transactions")
    @Operation(summary = "Get the five most recent transactions")
    public List<TransactionResponse> recentTransactions(@AuthenticationPrincipal UserDetails user) {
        return dashboardService.getRecentTransactions(user.getUsername());
    }

    @GetMapping("/category-expenses")
    @Operation(summary = "Get current month's expenses by category")
    public List<CategoryExpenseResponse> categoryExpenses(@AuthenticationPrincipal UserDetails user) {
        return dashboardService.getCategoryExpenses(user.getUsername());
    }

    @GetMapping("/monthly-summary")
    @Operation(summary = "Get a monthly income, expense, and balance summary")
    public MonthlySummaryResponse monthlySummary(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return dashboardService.getMonthlySummary(user.getUsername(), month, year);
    }
}
