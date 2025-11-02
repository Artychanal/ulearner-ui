package com.ulearner.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CourseUpdateRequest(
        @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @Size(max = 500) String thumbnailUrl,
        Long instructorId,
        @Valid List<LessonRequest> lessons) {}
