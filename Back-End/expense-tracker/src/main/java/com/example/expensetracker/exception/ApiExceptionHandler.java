package com.example.expensetracker.exception;

import com.example.expensetracker.dto.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.beans.TypeMismatchException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.ServletRequestBindingException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public org.springframework.http.ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException exception, HttpServletRequest request) {
        return create(HttpStatus.NOT_FOUND, exception.getMessage(), request, Map.of());
    }

    @ExceptionHandler({
            InvalidRequestException.class,
            HttpMessageNotReadableException.class,
            ServletRequestBindingException.class,
            TypeMismatchException.class
    })
    public org.springframework.http.ResponseEntity<ErrorResponse> handleBadRequest(
            Exception exception, HttpServletRequest request) {
        String message = exception instanceof HttpMessageNotReadableException
                ? "Request body contains invalid or missing values"
                : exception.getMessage();
        return create(HttpStatus.BAD_REQUEST, message, request, Map.of());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public org.springframework.http.ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors()
                .forEach(error -> errors.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return create(HttpStatus.BAD_REQUEST, "Validation failed", request, errors);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public org.springframework.http.ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException exception, HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        exception.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage()));
        return create(HttpStatus.BAD_REQUEST, "Validation failed", request, errors);
    }

    @ExceptionHandler({DuplicateEmailException.class, ConflictException.class, DataIntegrityViolationException.class})
    public org.springframework.http.ResponseEntity<ErrorResponse> handleConflict(
            Exception exception, HttpServletRequest request) {
        String message = exception instanceof DataIntegrityViolationException
                ? "The request conflicts with existing data"
                : exception.getMessage();
        return create(HttpStatus.CONFLICT, message, request, Map.of());
    }

    @ExceptionHandler(BadCredentialsException.class)
    public org.springframework.http.ResponseEntity<ErrorResponse> handleBadCredentials(
            BadCredentialsException exception, HttpServletRequest request) {
        return create(HttpStatus.UNAUTHORIZED, "Invalid email or password", request, Map.of());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public org.springframework.http.ResponseEntity<ErrorResponse> handleForbidden(
            AccessDeniedException exception, HttpServletRequest request) {
        return create(HttpStatus.FORBIDDEN, "Access is forbidden", request, Map.of());
    }

    @ExceptionHandler(Exception.class)
    public org.springframework.http.ResponseEntity<ErrorResponse> handleUnexpected(
            Exception exception, HttpServletRequest request) {
        return create(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", request, Map.of());
    }

    private org.springframework.http.ResponseEntity<ErrorResponse> create(
            HttpStatus status, String message, HttpServletRequest request, Map<String, String> errors) {
        String error = errors.isEmpty() ? status.getReasonPhrase() : "Validation Error";
        ErrorResponse response = new ErrorResponse(
                Instant.now(), status.value(), error, message, request.getRequestURI(), errors);
        return org.springframework.http.ResponseEntity.status(status).body(response);
    }
}
