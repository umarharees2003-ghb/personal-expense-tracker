package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.CategoryRequest;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ConflictException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.TransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CategoryServiceImplTest {

    @Mock
    private CategoryRepository categoryRepository;
    @Mock
    private TransactionRepository transactionRepository;
    @Mock
    private ServiceSupport serviceSupport;
    @InjectMocks
    private CategoryServiceImpl categoryService;

    private User user;
    private Category category;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setId(5L);
        user.setEmail("user@example.com");

        category = new Category();
        category.setId(10L);
        category.setName("Groceries");
        category.setUser(user);
    }

    @Test
    void createSavesNewCategoryForUser() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.existsByNameIgnoreCaseAndUser_Id("Groceries", 5L)).thenReturn(false);
        when(categoryRepository.save(any(Category.class))).thenAnswer(inv -> {
            Category c = inv.getArgument(0);
            c.setId(10L);
            return c;
        });

        var response = categoryService.create("user@example.com", new CategoryRequest("Groceries"));

        assertNotNull(response);
        assertEquals(10L, response.id());
        assertEquals("Groceries", response.name());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    void createRejectsDuplicateCategoryNameForSameUser() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.existsByNameIgnoreCaseAndUser_Id("Groceries", 5L)).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class,
                () -> categoryService.create("user@example.com", new CategoryRequest("Groceries")));

        assertEquals("Category with name 'Groceries' already exists", ex.getMessage());
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void getAllReturnsCategoriesForAuthenticatedUser() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findAllByUser_IdOrderByNameAsc(5L)).thenReturn(List.of(category));

        List<?> list = categoryService.getAll("user@example.com");

        assertEquals(1, list.size());
        verify(categoryRepository).findAllByUser_IdOrderByNameAsc(5L);
    }

    @Test
    void getByIdReturnsCategoryWhenOwned() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findByIdAndUser_Id(10L, 5L)).thenReturn(Optional.of(category));

        var response = categoryService.getById("user@example.com", 10L);

        assertEquals("Groceries", response.name());
    }

    @Test
    void getByIdThrowsNotFoundWhenCategoryBelongsToAnotherUser() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findByIdAndUser_Id(99L, 5L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> categoryService.getById("user@example.com", 99L));
    }

    @Test
    void updateRenamesCategoryWhenNameIsUnique() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findByIdAndUser_Id(10L, 5L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByNameIgnoreCaseAndUser_IdAndIdNot("Supermarket", 5L, 10L)).thenReturn(false);
        when(categoryRepository.save(category)).thenReturn(category);

        var response = categoryService.update("user@example.com", 10L, new CategoryRequest("Supermarket"));

        assertEquals("Supermarket", response.name());
        verify(categoryRepository).save(category);
    }

    @Test
    void updateRejectsDuplicateNameForSameUser() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findByIdAndUser_Id(10L, 5L)).thenReturn(Optional.of(category));
        when(categoryRepository.existsByNameIgnoreCaseAndUser_IdAndIdNot("Dining", 5L, 10L)).thenReturn(true);

        assertThrows(ConflictException.class,
                () -> categoryService.update("user@example.com", 10L, new CategoryRequest("Dining")));
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    void deleteRemovesCategoryWhenNoTransactionsUseIt() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findByIdAndUser_Id(10L, 5L)).thenReturn(Optional.of(category));
        when(transactionRepository.countByCategory_IdAndUser_Id(10L, 5L)).thenReturn(0L);

        categoryService.delete("user@example.com", 10L);

        verify(categoryRepository).delete(category);
    }

    @Test
    void deleteRejectsWhenCategoryIsUsedByTransactions() {
        when(serviceSupport.requireUser("user@example.com")).thenReturn(user);
        when(categoryRepository.findByIdAndUser_Id(10L, 5L)).thenReturn(Optional.of(category));
        when(transactionRepository.countByCategory_IdAndUser_Id(10L, 5L)).thenReturn(3L);

        ConflictException ex = assertThrows(ConflictException.class,
                () -> categoryService.delete("user@example.com", 10L));

        assertEquals("Category cannot be deleted while transactions use it", ex.getMessage());
        verify(categoryRepository, never()).delete(any(Category.class));
    }
}

