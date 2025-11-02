package com.ulearner.backend.dto.request;

import com.ulearner.backend.domain.EnrollmentStatus;
import jakarta.validation.constraints.NotNull;

public record EnrollmentStatusUpdateRequest(@NotNull EnrollmentStatus status) {}
