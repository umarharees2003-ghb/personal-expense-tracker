package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.CategoryRequest;
import com.example.expensetracker.dto.CategoryResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.ConflictException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.TransactionRepository;
import com.example.expensetracker.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final TransactionRepository transactionRepository;
    private final ServiceSupport serviceSupport;

    @Override
    @Transactional
    public CategoryResponse create(String email, CategoryRequest request) {
        Category category = new Category();
        category.setName(request.name().trim());
        category.setUser(serviceSupport.requireUser(email));
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAll(String email) {
        User user = serviceSupport.requireUser(email);
        return categoryRepository.findAllByUser_IdOrderByNameAsc(user.getId()).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getById(String email, Long id) {
        return toResponse(requireCategory(id, serviceSupport.requireUser(email).getId()));
    }

    @Override
    @Transactional
    public CategoryResponse update(String email, Long id, CategoryRequest request) {
        Category category = requireCategory(id, serviceSupport.requireUser(email).getId());
        category.setName(request.name().trim());
        return toResponse(categoryRepository.save(category));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        Long userId = serviceSupport.requireUser(email).getId();
        Category category = requireCategory(id, userId);
        if (transactionRepository.countByCategory_IdAndUser_Id(id, userId) > 0) {
            throw new ConflictException("Category cannot be deleted while transactions use it");
        }
        categoryRepository.delete(category);
    }

    private Category requireCategory(Long id, Long userId) {
        return categoryRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    private CategoryResponse toResponse(Category category) {
        return new CategoryResponse(category.getId(), category.getName(), category.getCreatedAt());
    }
}
