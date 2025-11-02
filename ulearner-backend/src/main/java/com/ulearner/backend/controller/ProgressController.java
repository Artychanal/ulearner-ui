package com.ulearner.backend.controller;

import com.ulearner.backend.domain.EnrollmentStatus;
import com.ulearner.backend.dto.EnrollmentDto;
import com.ulearner.backend.dto.request.EnrollmentRequest;
import com.ulearner.backend.dto.request.EnrollmentStatusUpdateRequest;
import com.ulearner.backend.service.EnrollmentService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
@RequiredArgsConstructor
public class ProgressController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/enrollments")
    public ResponseEntity<EnrollmentDto> enroll(@Valid @RequestBody EnrollmentRequest request) {
        EnrollmentDto created = enrollmentService.enrollStudent(request.courseId(), request.studentId());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PatchMapping("/enrollments/{enrollmentId}/status")
    public ResponseEntity<EnrollmentDto> updateStatus(
            @PathVariable Long enrollmentId, @Valid @RequestBody EnrollmentStatusUpdateRequest request) {
        EnrollmentStatus status = request.status();
        EnrollmentDto updated = enrollmentService.updateStatus(enrollmentId, status);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/courses/{courseId}/enrollments")
    public ResponseEntity<List<EnrollmentDto>> getCourseEnrollments(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForCourse(courseId));
    }
}
