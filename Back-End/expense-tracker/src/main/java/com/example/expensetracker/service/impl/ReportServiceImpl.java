package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.CategoryExpenseResponse;
import com.example.expensetracker.dto.DateRangeReportResponse;
import com.example.expensetracker.dto.MonthlySummaryResponse;
import com.example.expensetracker.entity.TransactionType;
import com.example.expensetracker.exception.InvalidRequestException;
import com.example.expensetracker.repository.TransactionRepository;
import com.example.expensetracker.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReportServiceImpl implements ReportService {

    private final TransactionRepository transactionRepository;
    private final ServiceSupport serviceSupport;

    @Override
    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlyReport(String email, Integer month, Integer year) {
        if ((month == null) != (year == null)) {
            throw new InvalidRequestException("Both month and year must be provided together");
        }
        YearMonth period = month == null ? YearMonth.now() : resolvePeriod(month, year);
        Long userId = serviceSupport.requireUser(email).getId();
        BigDecimal income = total(userId, TransactionType.INCOME, period.atDay(1), period.atEndOfMonth());
        BigDecimal expenses = total(userId, TransactionType.EXPENSE, period.atDay(1), period.atEndOfMonth());
        return new MonthlySummaryResponse(period.getYear(), period.getMonthValue(),
                income, expenses, income.subtract(expenses));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryExpenseResponse> getCategoryReport(String email, LocalDate startDate, LocalDate endDate) {
        if ((startDate == null) != (endDate == null)) {
            throw new InvalidRequestException("Both startDate and endDate must be provided together");
        }
        if (startDate == null) {
            YearMonth currentMonth = YearMonth.now();
            startDate = currentMonth.atDay(1);
            endDate = currentMonth.atEndOfMonth();
        }
        validateRange(startDate, endDate);
        Long userId = serviceSupport.requireUser(email).getId();
        return transactionRepository.sumByCategoryBetween(userId, TransactionType.EXPENSE, startDate, endDate)
                .stream()
                .map(row -> new CategoryExpenseResponse((String) row[0], (BigDecimal) row[1]))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DateRangeReportResponse getDateRangeReport(String email, LocalDate startDate, LocalDate endDate) {
        validateRange(startDate, endDate);
        Long userId = serviceSupport.requireUser(email).getId();
        BigDecimal income = total(userId, TransactionType.INCOME, startDate, endDate);
        BigDecimal expenses = total(userId, TransactionType.EXPENSE, startDate, endDate);
        return new DateRangeReportResponse(startDate, endDate, income, expenses, income.subtract(expenses));
    }

    private BigDecimal total(Long userId, TransactionType type, LocalDate start, LocalDate end) {
        return transactionRepository.sumForUserAndTypeBetween(userId, type, start, end);
    }

    private YearMonth resolvePeriod(int month, int year) {
        try {
            return YearMonth.of(year, month);
        } catch (DateTimeException exception) {
            throw new InvalidRequestException("Month must be between 1 and 12 and year must be valid");
        }
    }

    private void validateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new InvalidRequestException("startDate and endDate are required");
        }
        if (endDate.isBefore(startDate)) {
            throw new InvalidRequestException("endDate must be on or after startDate");
        }
    }
}
