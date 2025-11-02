package com.ulearner.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Enrollment;
import com.ulearner.backend.domain.EnrollmentStatus;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import com.ulearner.backend.dto.CourseSummaryDto;
import com.ulearner.backend.dto.EnrollmentDto;
import com.ulearner.backend.dto.UserSummaryDto;
import com.ulearner.backend.exception.ConflictException;
import com.ulearner.backend.exception.ResourceNotFoundException;
import com.ulearner.backend.mapper.EnrollmentMapper;
import com.ulearner.backend.repository.CourseRepository;
import com.ulearner.backend.repository.EnrollmentRepository;
import com.ulearner.backend.repository.UserRepository;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class EnrollmentServiceImplTest {

    @Mock
    private EnrollmentRepository enrollmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EnrollmentMapper enrollmentMapper;

    private EnrollmentServiceImpl enrollmentService;

    @BeforeEach
    void setUp() {
        enrollmentService = new EnrollmentServiceImpl(
                enrollmentRepository,
                courseRepository,
                userRepository,
                enrollmentMapper);
    }

    @Test
    void enrollStudent_shouldPersistEnrollment() {
        Course course = Course.builder()
                .id(10L)
                .title("Java")
                .createdAt(Instant.parse("2024-01-01T00:00:00Z"))
                .build();
        User student = User.builder()
                .id(20L)
                .email("student@ulearner.com")
                .password("pwd")
                .firstName("Stu")
                .lastName("Dent")
                .status(UserStatus.ACTIVE)
                .build();
        when(courseRepository.findById(10L)).thenReturn(Optional.of(course));
        when(userRepository.findById(20L)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudentAndCourse(student, course)).thenReturn(Optional.empty());

        Enrollment savedEnrollment = Enrollment.builder()
                .id(100L)
                .course(course)
                .student(student)
                .status(EnrollmentStatus.PENDING)
                .build();
        when(enrollmentRepository.save(any(Enrollment.class))).thenReturn(savedEnrollment);

        EnrollmentDto dto = new EnrollmentDto(
                100L,
                EnrollmentStatus.PENDING,
                Instant.parse("2024-01-01T00:00:00Z"),
                new UserSummaryDto(student.getId(), student.getEmail(), student.getFirstName(), student.getLastName()),
                new CourseSummaryDto(course.getId(), course.getTitle(), course.getThumbnailUrl(), course.getCreatedAt()));
        when(enrollmentMapper.toDto(savedEnrollment)).thenReturn(dto);

        EnrollmentDto result = enrollmentService.enrollStudent(10L, 20L);

        assertThat(result).isEqualTo(dto);
        verify(enrollmentRepository).save(any(Enrollment.class));
    }

    @Test
    void enrollStudent_whenAlreadyEnrolled_shouldThrowConflict() {
        Course course = Course.builder().id(1L).title("Java").build();
        User student = User.builder().id(2L).email("student@ulearner.com").password("pwd").status(UserStatus.ACTIVE).build();
        when(courseRepository.findById(1L)).thenReturn(Optional.of(course));
        when(userRepository.findById(2L)).thenReturn(Optional.of(student));
        when(enrollmentRepository.findByStudentAndCourse(student, course))
                .thenReturn(Optional.of(Enrollment.builder().id(5L).build()));

        assertThatThrownBy(() -> enrollmentService.enrollStudent(1L, 2L))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Student already enrolled in course");
    }

    @Test
    void updateStatus_shouldPersistAndMap() {
        Course course = Course.builder()
                .id(9L)
                .title("Java")
                .createdAt(Instant.parse("2024-02-01T00:00:00Z"))
                .build();
        User student = User.builder()
                .id(8L)
                .email("student@ulearner.com")
                .firstName("Stu")
                .lastName("Dent")
                .password("pwd")
                .status(UserStatus.ACTIVE)
                .build();
        Enrollment enrollment = Enrollment.builder()
                .id(55L)
                .course(course)
                .student(student)
                .status(EnrollmentStatus.PENDING)
                .build();
        when(enrollmentRepository.findById(55L)).thenReturn(Optional.of(enrollment));

        EnrollmentDto dto = new EnrollmentDto(
                55L,
                EnrollmentStatus.ACTIVE,
                Instant.parse("2024-02-01T00:00:00Z"),
                new UserSummaryDto(student.getId(), student.getEmail(), student.getFirstName(), student.getLastName()),
                new CourseSummaryDto(course.getId(), course.getTitle(), course.getThumbnailUrl(), course.getCreatedAt()));
        when(enrollmentMapper.toDto(enrollment)).thenReturn(dto);

        EnrollmentDto result = enrollmentService.updateStatus(55L, EnrollmentStatus.ACTIVE);

        assertThat(enrollment.getStatus()).isEqualTo(EnrollmentStatus.ACTIVE);
        assertThat(result).isEqualTo(dto);
    }

    @Test
    void getEnrollmentsForStudent_shouldReturnMappedResults() {
        User student = User.builder()
                .id(9L)
                .email("student@ulearner.com")
                .password("pwd")
                .firstName("Stu")
                .lastName("Dent")
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(9L)).thenReturn(Optional.of(student));

        Course course = Course.builder()
                .id(33L)
                .title("Test Course")
                .createdAt(Instant.parse("2024-03-01T00:00:00Z"))
                .build();
        Enrollment enrollment = Enrollment.builder()
                .id(7L)
                .student(student)
                .course(course)
                .status(EnrollmentStatus.PENDING)
                .build();
        when(enrollmentRepository.findAllByStudent(student)).thenReturn(List.of(enrollment));
        when(enrollmentMapper.toDto(enrollment))
                .thenReturn(new EnrollmentDto(
                        7L,
                        EnrollmentStatus.PENDING,
                        Instant.parse("2024-03-01T00:00:00Z"),
                        new UserSummaryDto(student.getId(), student.getEmail(), student.getFirstName(), student.getLastName()),
                        new CourseSummaryDto(course.getId(), course.getTitle(), course.getThumbnailUrl(), course.getCreatedAt())));

        List<EnrollmentDto> results = enrollmentService.getEnrollmentsForStudent(9L);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).id()).isEqualTo(7L);
    }

    @Test
    void getEnrollmentsForCourse_whenCourseMissing_shouldThrow() {
        when(courseRepository.findById(404L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> enrollmentService.getEnrollmentsForCourse(404L))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Course not found");
    }
}
