package com.example.expensetracker.service.impl;

import com.example.expensetracker.dto.PageResponse;
import com.example.expensetracker.dto.TransactionRequest;
import com.example.expensetracker.dto.TransactionResponse;
import com.example.expensetracker.entity.Category;
import com.example.expensetracker.entity.Transaction;
import com.example.expensetracker.entity.TransactionType;
import com.example.expensetracker.entity.User;
import com.example.expensetracker.exception.InvalidRequestException;
import com.example.expensetracker.exception.ResourceNotFoundException;
import com.example.expensetracker.repository.CategoryRepository;
import com.example.expensetracker.repository.TransactionRepository;
import com.example.expensetracker.service.TransactionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final ServiceSupport serviceSupport;

    @Override
    @Transactional
    public TransactionResponse create(String email, TransactionRequest request) {
        User user = serviceSupport.requireUser(email);
        Transaction transaction = new Transaction();
        transaction.setUser(user);
        applyRequest(transaction, request, user.getId());
        return toResponse(transactionRepository.saveAndFlush(transaction));
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> search(String email, TransactionType type, Long categoryId,
                                            Integer month, Integer year, LocalDate startDate,
                                            LocalDate endDate, String search) {
        return search(email, type, categoryId, month, year, startDate, endDate, search, "date", "desc");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransactionResponse> search(String email, TransactionType type, Long categoryId,
                                            Integer month, Integer year, LocalDate startDate,
                                            LocalDate endDate, String search, String sortBy,
                                            String sortDirection) {
        User user = serviceSupport.requireUser(email);
        validateSearchDates(month, year, startDate, endDate);
        Specification<Transaction> specification = buildSpecification(user.getId(), type, categoryId, month, year, startDate, endDate, search);
        Sort sort = buildSort(sortBy, sortDirection);
        return transactionRepository.findAll(specification, sort).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<TransactionResponse> searchPaged(
            String email, TransactionType type, Long categoryId,
            Integer month, Integer year, LocalDate startDate,
            LocalDate endDate, String search, String sortBy,
            String sortDirection, int page, int size) {
        if (page < 0) page = 0;
        if (size <= 0) size = 10;
        if (size > 100) size = 100;

        User user = serviceSupport.requireUser(email);
        validateSearchDates(month, year, startDate, endDate);
        Specification<Transaction> specification = buildSpecification(user.getId(), type, categoryId, month, year, startDate, endDate, search);
        Sort sort = buildSort(sortBy, sortDirection);
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Transaction> pageResult = transactionRepository.findAll(specification, pageable);
        List<TransactionResponse> content = pageResult.getContent().stream().map(this::toResponse).toList();
        return new PageResponse<>(
                content,
                pageResult.getNumber(),
                pageResult.getSize(),
                pageResult.getTotalElements(),
                pageResult.getTotalPages(),
                pageResult.isFirst(),
                pageResult.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public TransactionResponse getById(String email, Long id) {
        Long userId = serviceSupport.requireUser(email).getId();
        return toResponse(requireTransaction(id, userId));
    }

    @Override
    @Transactional
    public TransactionResponse update(String email, Long id, TransactionRequest request) {
        User user = serviceSupport.requireUser(email);
        Transaction transaction = requireTransaction(id, user.getId());
        applyRequest(transaction, request, user.getId());
        return toResponse(transactionRepository.saveAndFlush(transaction));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        Long userId = serviceSupport.requireUser(email).getId();
        transactionRepository.delete(requireTransaction(id, userId));
    }

    private Specification<Transaction> buildSpecification(Long userId, TransactionType type, Long categoryId,
                                                          Integer month, Integer year, LocalDate startDate,
                                                          LocalDate endDate, String search) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(criteriaBuilder.equal(root.get("user").get("id"), userId));
            if (type != null) {
                predicates.add(criteriaBuilder.equal(root.get("type"), type));
            }
            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(root.get("category").get("id"), categoryId));
            }
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("date"), startDate));
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("date"), endDate));
            } else if (month != null) {
                LocalDate firstDay = LocalDate.of(year, month, 1);
                predicates.add(criteriaBuilder.between(root.get("date"), firstDay, firstDay.withDayOfMonth(
                        firstDay.lengthOfMonth())));
            }
            if (search != null && !search.isBlank()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("description")),
                        "%" + search.trim().toLowerCase(Locale.ROOT) + "%"));
            }
            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort buildSort(String sortBy, String sortDirection) {
        boolean asc = "asc".equalsIgnoreCase(sortDirection);
        if ("amount".equalsIgnoreCase(sortBy)) {
            return asc
                    ? Sort.by(Sort.Order.asc("amount"), Sort.Order.desc("date"))
                    : Sort.by(Sort.Order.desc("amount"), Sort.Order.desc("date"));
        }
        return asc
                ? Sort.by(Sort.Order.asc("date"), Sort.Order.asc("createdAt"))
                : Sort.by(Sort.Order.desc("date"), Sort.Order.desc("createdAt"));
    }

    private void applyRequest(Transaction transaction, TransactionRequest request, Long userId) {
        if (request.type() == TransactionType.EXPENSE && request.categoryId() == null) {
            throw new InvalidRequestException("A category is required for expense transactions");
        }
        Category category = null;
        if (request.categoryId() != null) {
            category = categoryRepository.findByIdAndUser_Id(request.categoryId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        }
        transaction.setAmount(request.amount());
        transaction.setDescription(request.description() == null ? null : request.description().trim());
        transaction.setDate(request.date());
        transaction.setType(request.type());
        transaction.setCategory(category);
    }

    private void validateSearchDates(Integer month, Integer year, LocalDate startDate, LocalDate endDate) {
        if ((month == null) != (year == null)) {
            throw new InvalidRequestException("Both month and year must be provided together");
        }
        if (month != null && (startDate != null || endDate != null)) {
            throw new InvalidRequestException("Use either month/year or startDate/endDate filters, not both");
        }
        if ((startDate == null) != (endDate == null)) {
            throw new InvalidRequestException("Both startDate and endDate must be provided together");
        }
        if (month != null && (month < 1 || month > 12)) {
            throw new InvalidRequestException("Month must be between 1 and 12");
        }
        if (startDate != null && endDate.isBefore(startDate)) {
            throw new InvalidRequestException("endDate must be on or after startDate");
        }
        if (month != null) {
            try {
                LocalDate.of(year, month, 1);
            } catch (DateTimeException exception) {
                throw new InvalidRequestException("Year must be between 1 and 999999");
            }
        }
    }

    private Transaction requireTransaction(Long id, Long userId) {
        return transactionRepository.findByIdAndUser_Id(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found"));
    }

    private TransactionResponse toResponse(Transaction transaction) {
        Category category = transaction.getCategory();
        return new TransactionResponse(
                transaction.getId(), transaction.getAmount(), transaction.getDescription(),
                transaction.getDate(), transaction.getType(),
                category == null ? null : category.getId(),
                category == null ? null : category.getName(),
                transaction.getCreatedAt(), transaction.getUpdatedAt());
    }
}
