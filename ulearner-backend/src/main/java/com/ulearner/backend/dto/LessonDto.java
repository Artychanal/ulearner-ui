package com.ulearner.backend.dto;

public record LessonDto(
        Long id,
        String title,
        String content,
        Integer position,
        Long courseId) {}
