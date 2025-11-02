package com.ulearner.backend.dto;

import java.time.Instant;
import java.util.List;

public record CourseDto(
        Long id,
        String title,
        String description,
        String thumbnailUrl,
        Instant createdAt,
        UserSummaryDto instructor,
        List<LessonDto> lessons) {}
