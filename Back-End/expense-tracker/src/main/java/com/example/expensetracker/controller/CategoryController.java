package com.example.expensetracker.controller;

import com.example.expensetracker.dto.CategoryRequest;
import com.example.expensetracker.dto.CategoryResponse;
import com.example.expensetracker.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a category")
    public CategoryResponse create(@AuthenticationPrincipal UserDetails user,
                                   @Valid @RequestBody CategoryRequest request) {
        return categoryService.create(user.getUsername(), request);
    }

    @GetMapping
    @Operation(summary = "List the authenticated user's categories")
    public List<CategoryResponse> getAll(@AuthenticationPrincipal UserDetails user) {
        return categoryService.getAll(user.getUsername());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a category")
    public CategoryResponse getById(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        return categoryService.getById(user.getUsername(), id);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a category")
    public CategoryResponse update(@AuthenticationPrincipal UserDetails user, @PathVariable Long id,
                                   @Valid @RequestBody CategoryRequest request) {
        return categoryService.update(user.getUsername(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a category not used by transactions")
    public void delete(@AuthenticationPrincipal UserDetails user, @PathVariable Long id) {
        categoryService.delete(user.getUsername(), id);
    }
}
