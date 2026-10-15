package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findAllByUser_IdOrderByNameAsc(Long userId);

    Optional<Category> findByIdAndUser_Id(Long id, Long userId);
}
