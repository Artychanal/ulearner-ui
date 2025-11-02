package com.ulearner.backend.dto;

import com.ulearner.backend.domain.EnrollmentStatus;
import java.time.Instant;

public record EnrollmentDto(
        Long id,
        EnrollmentStatus status,
        Instant enrolledAt,
        UserSummaryDto student,
        CourseSummaryDto course) {}
