package com.ulearner.backend.dto.request;

import jakarta.validation.constraints.NotNull;

public record EnrollmentRequest(@NotNull Long courseId, @NotNull Long studentId) {}
