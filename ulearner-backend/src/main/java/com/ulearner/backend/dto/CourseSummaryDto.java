package com.ulearner.backend.dto;

import java.time.Instant;

public record CourseSummaryDto(
        Long id,
        String title,
        String thumbnailUrl,
        Instant createdAt) {}
