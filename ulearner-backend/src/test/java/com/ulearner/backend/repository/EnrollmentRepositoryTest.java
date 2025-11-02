package com.ulearner.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Enrollment;
import com.ulearner.backend.domain.EnrollmentStatus;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class EnrollmentRepositoryTest {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByStudentAndCourse_shouldReturnEnrollment() {
        User student = userRepository.save(User.builder()
                .email("student@ulearner.com")
                .password("pwd")
                .firstName("Stu")
                .lastName("Dent")
                .status(UserStatus.ACTIVE)
                .build());
        User instructor = userRepository.save(User.builder()
                .email("instructor@ulearner.com")
                .password("pwd")
                .firstName("Ines")
                .lastName("Tructor")
                .status(UserStatus.ACTIVE)
                .build());

        Course course = courseRepository.save(Course.builder()
                .title("Spring Boot")
                .description("Intro")
                .instructor(instructor)
                .build());

        Enrollment enrollment = enrollmentRepository.save(Enrollment.builder()
                .course(course)
                .student(student)
                .status(EnrollmentStatus.ACTIVE)
                .build());

        Optional<Enrollment> found = enrollmentRepository.findByStudentAndCourse(student, course);

        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(enrollment.getId());
    }

    @Test
    void findAllByStudent_shouldReturnEnrollments() {
        User student = userRepository.save(User.builder()
                .email("student2@ulearner.com")
                .password("pwd")
                .firstName("Stu")
                .lastName("Dent")
                .status(UserStatus.ACTIVE)
                .build());
        User instructor = userRepository.save(User.builder()
                .email("instructor2@ulearner.com")
                .password("pwd")
                .firstName("Ines")
                .lastName("Tructor")
                .status(UserStatus.ACTIVE)
                .build());
        Course course = courseRepository.save(Course.builder()
                .title("Spring Advanced")
                .description("Advanced")
                .instructor(instructor)
                .build());
        enrollmentRepository.save(Enrollment.builder()
                .course(course)
                .student(student)
                .status(EnrollmentStatus.PENDING)
                .build());

        List<Enrollment> enrollments = enrollmentRepository.findAllByStudent(student);

        assertThat(enrollments).hasSize(1);
        assertThat(enrollments.get(0).getCourse().getId()).isEqualTo(course.getId());
    }
}
