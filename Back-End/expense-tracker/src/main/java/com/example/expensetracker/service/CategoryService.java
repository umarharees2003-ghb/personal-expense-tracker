package com.example.expensetracker.service;

import com.example.expensetracker.dto.CategoryRequest;
import com.example.expensetracker.dto.CategoryResponse;

import java.util.List;

public interface CategoryService {
    CategoryResponse create(String email, CategoryRequest request);

    List<CategoryResponse> getAll(String email);

    CategoryResponse getById(String email, Long id);

    CategoryResponse update(String email, Long id, CategoryRequest request);

    void delete(String email, Long id);
}
