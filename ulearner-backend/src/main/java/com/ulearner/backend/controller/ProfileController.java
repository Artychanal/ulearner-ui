package com.ulearner.backend.controller;

import com.ulearner.backend.dto.EnrollmentDto;
import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.service.EnrollmentService;
import com.ulearner.backend.service.UserService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final UserService userService;
    private final EnrollmentService enrollmentService;

    @GetMapping("/users/{userId}")
    public ResponseEntity<UserDto> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(userService.getUser(userId));
    }

    @GetMapping("/users/{userId}/enrollments")
    public ResponseEntity<List<EnrollmentDto>> getEnrollments(@PathVariable Long userId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsForStudent(userId));
    }
}
