package com.example.expensetracker.service.impl;

import com.example.expensetracker.entity.TransactionType;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private ServiceSupport serviceSupport;
    @InjectMocks
    private DashboardServiceImpl dashboardService;

    private User user;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(2L);
        user.setEmail("dash@example.com");
    }

    @Test
    void getSummaryReturnsLifetimeAndMonthlyTotals() {
        when(serviceSupport.requireUser("dash@example.com")).thenReturn(user);
        when(transactionRepository.sumForUserAndType(2L, TransactionType.INCOME)).thenReturn(new BigDecimal("10000.00"));
        when(transactionRepository.sumForUserAndType(2L, TransactionType.EXPENSE)).thenReturn(new BigDecimal("4000.00"));
        when(transactionRepository.sumForUserAndTypeBetween(eq(2L), eq(TransactionType.INCOME), any(), any()))
                .thenReturn(new BigDecimal("2500.00"));
        when(transactionRepository.sumForUserAndTypeBetween(eq(2L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(new BigDecimal("1200.00"));

        var summary = dashboardService.getSummary("dash@example.com");

        assertNotNull(summary);
        assertEquals(new BigDecimal("10000.00"), summary.totalIncome());
        assertEquals(new BigDecimal("4000.00"), summary.totalExpense());
        assertEquals(new BigDecimal("6000.00"), summary.balance());
        assertEquals(new BigDecimal("2500.00"), summary.currentMonthIncome());
        assertEquals(new BigDecimal("1200.00"), summary.currentMonthExpenses());
    }

    @Test
    void getCategoryExpensesReturnsAggregatedList() {
        when(serviceSupport.requireUser("dash@example.com")).thenReturn(user);
        when(transactionRepository.sumByCategoryBetween(eq(2L), eq(TransactionType.EXPENSE), any(), any()))
                .thenReturn(List.of(
                        new Object[]{"Groceries", new BigDecimal("450.00")},
                        new Object[]{"Transit", new BigDecimal("120.00")}
                ));

        var expenses = dashboardService.getCategoryExpenses("dash@example.com");

        assertEquals(2, expenses.size());
        assertEquals("Groceries", expenses.get(0).category());
        assertEquals(new BigDecimal("450.00"), expenses.get(0).amount());
    }
}
