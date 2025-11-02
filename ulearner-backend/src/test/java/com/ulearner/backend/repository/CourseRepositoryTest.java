package com.ulearner.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class CourseRepositoryTest {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Test
    void findByInstructor_shouldReturnCoursesForInstructor() {
        User instructor = userRepository.save(User.builder()
                .email("instructor@ulearner.com")
                .password("pwd")
                .firstName("Ines")
                .lastName("Tructor")
                .status(UserStatus.ACTIVE)
                .build());

        Course courseOne = Course.builder()
                .title("Spring Basics")
                .description("Intro")
                .createdAt(Instant.parse("2024-01-01T00:00:00Z"))
                .instructor(instructor)
                .build();
        Course courseTwo = Course.builder()
                .title("Advanced Spring")
                .description("Deep dive")
                .createdAt(Instant.parse("2024-02-01T00:00:00Z"))
                .instructor(instructor)
                .build();
        courseRepository.saveAll(List.of(courseOne, courseTwo));

        List<Course> courses = courseRepository.findByInstructor(instructor);

        assertThat(courses).hasSize(2);
        assertThat(courses)
                .extracting(Course::getTitle)
                .containsExactlyInAnyOrder("Spring Basics", "Advanced Spring");
    }
}
