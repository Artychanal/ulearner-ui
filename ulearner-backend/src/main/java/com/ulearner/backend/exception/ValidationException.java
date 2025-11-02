package com.ulearner.backend.exception;

import org.springframework.http.HttpStatus;

public class ValidationException extends ApiException {

    public ValidationException(String message) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, message);
    }

    public ValidationException(String message, Object details) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, message, details);
    }

    public ValidationException(String message, Throwable cause) {
        super(HttpStatus.UNPROCESSABLE_ENTITY, message, cause);
    }
}
