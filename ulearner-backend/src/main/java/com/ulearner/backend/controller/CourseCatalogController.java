package com.ulearner.backend.controller;

import com.ulearner.backend.dto.CourseDto;
import com.ulearner.backend.dto.CourseSummaryDto;
import com.ulearner.backend.service.CourseService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/courses")
@RequiredArgsConstructor
public class CourseCatalogController {

    private final CourseService courseService;

    @GetMapping
    public ResponseEntity<List<CourseSummaryDto>> listCourses() {
        return ResponseEntity.ok(courseService.listCourses());
    }

    @GetMapping("/{courseId}")
    public ResponseEntity<CourseDto> getCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseService.getCourse(courseId));
    }
}
