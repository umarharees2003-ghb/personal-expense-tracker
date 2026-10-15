package com.example.expensetracker.controller;

import com.example.expensetracker.dto.CategoryExpenseResponse;
import com.example.expensetracker.dto.DateRangeReportResponse;
import com.example.expensetracker.dto.MonthlySummaryResponse;
import com.example.expensetracker.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class ReportController {

    private final ReportService reportService;

    @GetMapping("/monthly")
    @Operation(summary = "Get an income, expense, and balance report for a month")
    public MonthlySummaryResponse monthly(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) Integer month,
            @RequestParam(required = false) Integer year) {
        return reportService.getMonthlyReport(user.getUsername(), month, year);
    }

    @GetMapping("/category")
    @Operation(summary = "Get expense totals grouped by category")
    public List<CategoryExpenseResponse> category(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getCategoryReport(user.getUsername(), startDate, endDate);
    }

    @GetMapping("/date-range")
    @Operation(summary = "Get totals for an inclusive date range")
    public DateRangeReportResponse dateRange(
            @AuthenticationPrincipal UserDetails user,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reportService.getDateRangeReport(user.getUsername(), startDate, endDate);
    }
}
