package com.pmp.sgdj.exception;

import java.time.LocalDateTime;
import java.util.Map;

public record ApiErrorResponse(
        LocalDateTime timestamp,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> fieldErrors,
        Long retryAfterSeconds
) {
    public ApiErrorResponse(int status, String error, String message, String path) {
        this(LocalDateTime.now(), status, error, message, path, null, null);
    }

    public ApiErrorResponse(int status, String error, String message, String path, Map<String, String> fieldErrors) {
        this(LocalDateTime.now(), status, error, message, path, fieldErrors, null);
    }

    public ApiErrorResponse(int status, String error, String message, String path, Long retryAfterSeconds) {
        this(LocalDateTime.now(), status, error, message, path, null, retryAfterSeconds);
    }
}
