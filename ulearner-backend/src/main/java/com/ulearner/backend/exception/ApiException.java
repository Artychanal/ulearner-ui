package com.ulearner.backend.exception;

import org.springframework.http.HttpStatus;

public abstract class ApiException extends RuntimeException {

    private final HttpStatus status;
    private final Object details;

    protected ApiException(HttpStatus status, String message) {
        this(status, message, null, null);
    }

    protected ApiException(HttpStatus status, String message, Object details) {
        this(status, message, details, null);
    }

    protected ApiException(HttpStatus status, String message, Throwable cause) {
        this(status, message, null, cause);
    }

    protected ApiException(HttpStatus status, String message, Object details, Throwable cause) {
        super(message, cause);
        this.status = status;
        this.details = details;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public Object getDetails() {
        return details;
    }
}
