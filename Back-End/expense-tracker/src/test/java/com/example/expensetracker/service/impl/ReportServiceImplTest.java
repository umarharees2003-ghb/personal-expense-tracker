package com.example.expensetracker.service.impl;

import com.example.expensetracker.entity.TransactionType;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.InvalidRequestException;
import com.example.expensetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private ServiceSupport serviceSupport;
    @InjectMocks
    private ReportServiceImpl reportService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(7L);
        user.setEmail("analyst@example.com");
    }

    @Test
    void getMonthlyReportCalculatesIncomeExpenseAndBalance() {
        when(serviceSupport.requireUser("analyst@example.com")).thenReturn(user);
        when(transactionRepository.sumForUserAndTypeBetween(eq(7L), eq(TransactionType.INCOME), any(), any()))
                .thenReturn(new BigDecimal("5000.00"));
        when(transactionRepository.sumForUserAndTypeBetween(eq(7L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("3200.00"));

        var report = reportService.getMonthlyReport("analyst@example.com", 10, 2026);

        assertEquals(2026, report.year());
        assertEquals(10, report.month());
        assertEquals(new BigDecimal("5000.00"), report.income());
        assertEquals(new BigDecimal("3200.00"), report.expenses());
        assertEquals(new BigDecimal("1800.00"), report.balance());
    }

    @Test
    void getDateRangeReportRejectsReversedDates() {
        LocalDate start = LocalDate.of(2026, 10, 25);
        LocalDate end = LocalDate.of(2026, 10, 10);

        assertThrows(InvalidRequestException.class,
                () -> reportService.getDateRangeReport("analyst@example.com", start, end));
    }

    @Test
    void getCategoryReportAggregatesCategories() {
        when(serviceSupport.requireUser("analyst@example.com")).thenReturn(user);
        LocalDate start = LocalDate.of(2026, 10, 1);
        LocalDate end = LocalDate.of(2026, 10, 31);
        List<Object[]> raw = List.of(
                new Object[]{"Food", new BigDecimal("120.00")},
                new Object[]{"Utilities", new BigDecimal("85.50")}
        );
        when(transactionRepository.sumByCategoryBetween(7L, TransactionType.EXPENSE, start, end)).thenReturn(raw);

        var list = reportService.getCategoryReport("analyst@example.com", start, end);

        assertEquals(2, list.size());
        assertEquals("Food", list.get(0).category());
        assertEquals(new BigDecimal("120.00"), list.get(0).amount());
    }
}

