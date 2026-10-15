package com.example.expensetracker.repository;

import com.example.expensetracker.entity.Transaction;
import com.example.expensetracker.entity.TransactionType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long>,
        JpaSpecificationExecutor<Transaction> {

    Optional<Transaction> findByIdAndUser_Id(Long id, Long userId);

    List<Transaction> findTop5ByUser_IdOrderByDateDescCreatedAtDesc(Long userId);

    List<Transaction> findAllByUser_IdAndDateBetweenOrderByDateDesc(Long userId, LocalDate start, LocalDate end);

    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.user.id = :userId and t.type = :type and t.date between :start and :end
            """)
    BigDecimal sumForUserAndTypeBetween(@Param("userId") Long userId,
                                        @Param("type") TransactionType type,
                                        @Param("start") LocalDate start,
                                        @Param("end") LocalDate end);

    @Query("""
            select coalesce(sum(t.amount), 0) from Transaction t
            where t.user.id = :userId and t.type = :type
            """)
    BigDecimal sumForUserAndType(@Param("userId") Long userId, @Param("type") TransactionType type);

    @Query("""
            select t.category.name, sum(t.amount) from Transaction t
            where t.user.id = :userId and t.type = :type and t.date between :start and :end
            group by t.category.name order by sum(t.amount) desc
            """)
    List<Object[]> sumByCategoryBetween(@Param("userId") Long userId,
                                        @Param("type") TransactionType type,
                                        @Param("start") LocalDate start,
                                        @Param("end") LocalDate end);

    long countByCategory_IdAndUser_Id(Long categoryId, Long userId);
}
