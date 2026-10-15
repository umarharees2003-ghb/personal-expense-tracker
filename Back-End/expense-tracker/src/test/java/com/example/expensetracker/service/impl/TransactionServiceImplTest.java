package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.TransactionRequest;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Transaction;
import com.example.expensetracker.entity.TransactionType;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TransactionServiceImplTest {

    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private ServiceSupport serviceSupport;
    @InjectMocks
    private TransactionServiceImpl transactionService;

    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(3L);
        user.setEmail("jane@example.com");
        category = new Category();
        category.setId(9L);
        category.setName("Food");
        category.setUser(user);
        when(serviceSupport.requireUser("jane@example.com")).thenReturn(user);
    }

    @Test
    void createSavesExpenseForAuthenticatedUser() {
        when(categoryRepository.findByIdAndUser_Id(9L, 3L)).thenReturn(Optional.of(category));
        when(transactionRepository.saveAndFlush(any(Transaction.class))).thenAnswer(invocation -> {
            Transaction transaction = invocation.getArgument(0);
            transaction.setId(12L);
            return transaction;
        });

        var response = transactionService.create("jane@example.com", request());

        assertEquals(12L, response.id());
        assertEquals(9L, response.categoryId());
        assertEquals(new BigDecimal("23.50"), response.amount());
    }

    @Test
    void getByIdOnlyReturnsAuthenticatedUsersTransaction() {
        Transaction transaction = persistedTransaction();
        when(transactionRepository.findByIdAndUser_Id(12L, 3L)).thenReturn(Optional.of(transaction));

        var response = transactionService.getById("jane@example.com", 12L);

        assertEquals("Lunch", response.description());
        verify(transactionRepository).findByIdAndUser_Id(12L, 3L);
    }

    @Test
    void updateChangesOwnedTransaction() {
        Transaction transaction = persistedTransaction();
        when(transactionRepository.findByIdAndUser_Id(12L, 3L)).thenReturn(Optional.of(transaction));
        when(categoryRepository.findByIdAndUser_Id(9L, 3L)).thenReturn(Optional.of(category));
        when(transactionRepository.saveAndFlush(any(Transaction.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var response = transactionService.update("jane@example.com", 12L, request());

        assertEquals(new BigDecimal("23.50"), response.amount());
    }

    @Test
    void deleteRemovesOwnedTransaction() {
        Transaction transaction = persistedTransaction();
        when(transactionRepository.findByIdAndUser_Id(12L, 3L)).thenReturn(Optional.of(transaction));
        doNothing().when(transactionRepository).delete(transaction);

        transactionService.delete("jane@example.com", 12L);

        verify(transactionRepository).delete(transaction);
    }

    @Test
    void getByIdDoesNotExposeAnotherUsersTransaction() {
        when(transactionRepository.findByIdAndUser_Id(eq(12L), eq(3L))).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> transactionService.getById("jane@example.com", 12L));
    }

    private TransactionRequest request() {
        return new TransactionRequest(new BigDecimal("23.50"), "Lunch",
                LocalDate.of(2026, 10, 5), TransactionType.EXPENSE, 9L);
    }

    private Transaction persistedTransaction() {
        Transaction transaction = new Transaction();
        transaction.setId(12L);
        transaction.setAmount(new BigDecimal("18.00"));
        transaction.setDescription("Lunch");
        transaction.setDate(LocalDate.of(2026, 10, 5));
        transaction.setType(TransactionType.EXPENSE);
        transaction.setUser(user);
        transaction.setCategory(category);
        return transaction;
    }
}
