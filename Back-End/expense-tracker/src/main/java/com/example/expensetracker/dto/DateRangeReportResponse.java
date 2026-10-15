package com.example.expensetracker.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DateRangeReportResponse(
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal income,
        BigDecimal expenses,
        BigDecimal balance
) {
}
