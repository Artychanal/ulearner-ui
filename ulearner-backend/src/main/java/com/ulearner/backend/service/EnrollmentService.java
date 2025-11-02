package com.ulearner.backend.service;

import com.ulearner.backend.domain.EnrollmentStatus;
import com.ulearner.backend.dto.EnrollmentDto;
import java.util.List;

public interface EnrollmentService {

    EnrollmentDto enrollStudent(Long courseId, Long studentId);

    EnrollmentDto updateStatus(Long enrollmentId, EnrollmentStatus status);

    List<EnrollmentDto> getEnrollmentsForStudent(Long studentId);

    List<EnrollmentDto> getEnrollmentsForCourse(Long courseId);
}
