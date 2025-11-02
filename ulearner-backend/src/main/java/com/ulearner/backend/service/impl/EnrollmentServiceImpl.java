package com.ulearner.backend.service.impl;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Enrollment;
import com.ulearner.backend.domain.EnrollmentStatus;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.dto.EnrollmentDto;
import com.ulearner.backend.exception.ConflictException;
import com.ulearner.backend.exception.ResourceNotFoundException;
import com.ulearner.backend.mapper.EnrollmentMapper;
import com.ulearner.backend.repository.CourseRepository;
import com.ulearner.backend.repository.EnrollmentRepository;
import com.ulearner.backend.repository.UserRepository;
import com.ulearner.backend.service.EnrollmentService;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EnrollmentMapper enrollmentMapper;

    @Override
    @Transactional
    public EnrollmentDto enrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        enrollmentRepository.findByStudentAndCourse(student, course)
                .ifPresent(enrollment -> {
                    throw new ConflictException("Student already enrolled in course");
                });

        Enrollment enrollment = Enrollment.builder()
                .course(course)
                .student(student)
                .status(EnrollmentStatus.PENDING)
                .build();

        Enrollment saved = enrollmentRepository.save(enrollment);
        return enrollmentMapper.toDto(saved);
    }

    @Override
    @Transactional
    public EnrollmentDto updateStatus(Long enrollmentId, EnrollmentStatus status) {
        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found"));
        enrollment.setStatus(status);
        return enrollmentMapper.toDto(enrollment);
    }

    @Override
    public List<EnrollmentDto> getEnrollmentsForStudent(Long studentId) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        return enrollmentRepository.findAllByStudent(student).stream()
                .map(enrollmentMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<EnrollmentDto> getEnrollmentsForCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return enrollmentRepository.findAllByCourse(course).stream()
                .map(enrollmentMapper::toDto)
                .collect(Collectors.toList());
    }
}
