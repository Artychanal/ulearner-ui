package com.ulearner.backend.dto;

public record UserSummaryDto(
        Long id,
        String email,
        String firstName,
        String lastName) {}
