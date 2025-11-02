package com.ulearner.backend.controller;

import com.ulearner.backend.dto.CourseDto;
import com.ulearner.backend.dto.LessonDto;
import com.ulearner.backend.dto.request.CourseCreateRequest;
import com.ulearner.backend.dto.request.CourseUpdateRequest;
import com.ulearner.backend.dto.request.LessonRequest;
import com.ulearner.backend.service.CourseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/courses")
@RequiredArgsConstructor
public class CourseManagementController {

    private final CourseService courseService;

    @PostMapping
    public ResponseEntity<CourseDto> createCourse(@Valid @RequestBody CourseCreateRequest request) {
        CourseDto created = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{courseId}")
    public ResponseEntity<CourseDto> updateCourse(
            @PathVariable Long courseId, @Valid @RequestBody CourseUpdateRequest request) {
        return ResponseEntity.ok(courseService.updateCourse(courseId, request));
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long courseId) {
        courseService.deleteCourse(courseId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{courseId}/lessons")
    public ResponseEntity<LessonDto> addLesson(
            @PathVariable Long courseId, @Valid @RequestBody LessonRequest request) {
        LessonDto created = courseService.addLesson(courseId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
