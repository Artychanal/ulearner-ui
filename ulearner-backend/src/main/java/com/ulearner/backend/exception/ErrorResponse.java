package com.ulearner.backend.exception;

public record ErrorResponse(int code, String message, Object details) {
}
