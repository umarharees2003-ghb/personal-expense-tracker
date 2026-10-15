package com.example.expensetracker.service;

import com.example.expensetracker.dto.CategoryExpenseResponse;
import com.example.expensetracker.dto.DateRangeReportResponse;
import com.example.expensetracker.dto.MonthlySummaryResponse;

import java.time.LocalDate;
import java.util.List;

public interface ReportService {
    MonthlySummaryResponse getMonthlyReport(String email, Integer month, Integer year);

    List<CategoryExpenseResponse> getCategoryReport(String email, LocalDate startDate, LocalDate endDate);

    DateRangeReportResponse getDateRangeReport(String email, LocalDate startDate, LocalDate endDate);
}
