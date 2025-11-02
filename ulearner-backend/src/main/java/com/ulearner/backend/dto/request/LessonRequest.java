package com.ulearner.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LessonRequest(
        @NotBlank @Size(max = 200) String title,
        @Size(max = 10000) String content,
        @NotNull Integer position) {}
