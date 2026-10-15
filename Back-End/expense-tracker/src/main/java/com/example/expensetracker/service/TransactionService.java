package com.example.expensetracker.service;

import com.example.expensetracker.dto.TransactionRequest;
import com.example.expensetracker.dto.TransactionResponse;
import com.example.expensetracker.entity.TransactionType;

import java.time.LocalDate;
import java.util.List;

public interface TransactionService {
    TransactionResponse create(String email, TransactionRequest request);

    List<TransactionResponse> search(String email, TransactionType type, Long categoryId,
                                     Integer month, Integer year, LocalDate startDate,
                                     LocalDate endDate, String search);

    TransactionResponse getById(String email, Long id);

    TransactionResponse update(String email, Long id, TransactionRequest request);

    void delete(String email, Long id);
}
