package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.CategoryExpenseResponse;
import com.example.expensetracker.dto.DashboardSummaryResponse;
import com.example.expensetracker.dto.MonthlySummaryResponse;
import com.example.expensetracker.dto.TransactionResponse;
import com.example.expensetracker.entity.TransactionType;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.InvalidRequestException;
import com.example.expensetracker.repository.TransactionRepository;
import com.example.expensetracker.service.DashboardService;
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
public class DashboardServiceImpl implements DashboardService {

    private final TransactionRepository transactionRepository;
    private final ServiceSupport serviceSupport;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(String email) {
        Long userId = serviceSupport.requireUser(email).getId();
        BigDecimal income = total(userId, TransactionType.INCOME);
        BigDecimal expenses = total(userId, TransactionType.EXPENSE);
        YearMonth currentMonth = YearMonth.now();
        BigDecimal monthlyIncome = totalBetween(userId, TransactionType.INCOME,
                currentMonth.atDay(1), currentMonth.atEndOfMonth());
        BigDecimal monthlyExpenses = totalBetween(userId, TransactionType.EXPENSE,
                currentMonth.atDay(1), currentMonth.atEndOfMonth());
        return new DashboardSummaryResponse(income, expenses, income.subtract(expenses),
                monthlyIncome, monthlyExpenses);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> getRecentTransactions(String email) {
        User user = serviceSupport.requireUser(email);
        return transactionRepository.findTop5ByUser_IdOrderByDateDescCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryExpenseResponse> getCategoryExpenses(String email) {
        Long userId = serviceSupport.requireUser(email).getId();
        YearMonth currentMonth = YearMonth.now();
        return toCategoryExpenses(transactionRepository.sumByCategoryBetween(
                userId, TransactionType.EXPENSE, currentMonth.atDay(1), currentMonth.atEndOfMonth()));
    }

    @Override
    @Transactional(readOnly = true)
    public MonthlySummaryResponse getMonthlySummary(String email, Integer month, Integer year) {
        YearMonth period = resolvePeriod(month, year);
        Long userId = serviceSupport.requireUser(email).getId();
        return monthlySummary(userId, period);
    }

    private MonthlySummaryResponse monthlySummary(Long userId, YearMonth period) {
        BigDecimal income = totalBetween(userId, TransactionType.INCOME, period.atDay(1), period.atEndOfMonth());
        BigDecimal expenses = totalBetween(userId, TransactionType.EXPENSE, period.atDay(1), period.atEndOfMonth());
        return new MonthlySummaryResponse(period.getYear(), period.getMonthValue(),
                income, expenses, income.subtract(expenses));
    }

    private BigDecimal total(Long userId, TransactionType type) {
        return transactionRepository.sumForUserAndType(userId, type);
    }

    private BigDecimal totalBetween(Long userId, TransactionType type, LocalDate start, LocalDate end) {
        return transactionRepository.sumForUserAndTypeBetween(userId, type, start, end);
    }

    private YearMonth resolvePeriod(Integer month, Integer year) {
        if ((month == null) != (year == null)) {
            throw new InvalidRequestException("Both month and year must be provided together");
        }
        if (month == null) {
            return YearMonth.now();
        }
        try {
            return YearMonth.of(year, month);
        } catch (DateTimeException exception) {
            throw new InvalidRequestException("Month must be between 1 and 12 and year must be valid");
        }
    }

    private List<CategoryExpenseResponse> toCategoryExpenses(List<Object[]> results) {
        return results.stream()
                .map(row -> new CategoryExpenseResponse((String) row[0], (BigDecimal) row[1]))
                .toList();
    }

    private TransactionResponse toResponse(com.example.expensetracker.entity.Transaction transaction) {
        var category = transaction.getCategory();
        return new TransactionResponse(
                transaction.getId(), transaction.getAmount(), transaction.getDescription(),
                transaction.getDate(), transaction.getType(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                transaction.getCreatedAt(), transaction.getUpdatedAt());
    }
}
