package com.ulearner.backend.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CourseCreateRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 2000) String description,
        @Size(max = 500) String thumbnailUrl,
        @NotNull Long instructorId,
        @Valid List<LessonRequest> lessons) {}
