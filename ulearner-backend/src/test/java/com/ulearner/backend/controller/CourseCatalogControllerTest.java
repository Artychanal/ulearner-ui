package com.ulearner.backend.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Lesson;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import com.ulearner.backend.repository.CourseRepository;
import com.ulearner.backend.repository.UserRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CourseCatalogControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        courseRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void listCourses_shouldReturnSortedCatalog() throws Exception {
        User instructor = createInstructor("catalog@ulearner.com");

        Course older = Course.builder()
                .title("Legacy")
                .description("Old course")
                .thumbnailUrl("legacy.png")
                .instructor(instructor)
                .createdAt(Instant.parse("2023-01-01T00:00:00Z"))
                .build();
        Course newer = Course.builder()
                .title("Modern")
                .description("New course")
                .thumbnailUrl("modern.png")
                .instructor(instructor)
                .createdAt(Instant.parse("2024-01-01T00:00:00Z"))
                .build();
        courseRepository.saveAll(List.of(older, newer));

        mockMvc.perform(get("/api/catalog/courses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Modern"))
                .andExpect(jsonPath("$[1].title").value("Legacy"));
    }

    @Test
    void getCourse_shouldReturnCourseDetails() throws Exception {
        User instructor = createInstructor("details@ulearner.com");

        Course course = Course.builder()
                .title("Spring Boot")
                .description("Comprehensive guide")
                .thumbnailUrl("spring.png")
                .instructor(instructor)
                .lessons(new ArrayList<>())
                .build();
        Lesson intro = Lesson.builder()
                .title("Introduction")
                .content("Welcome")
                .position(1)
                .course(course)
                .build();
        course.getLessons().add(intro);
        course = courseRepository.save(course);

        mockMvc.perform(get("/api/catalog/courses/" + course.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring Boot"))
                .andExpect(jsonPath("$.lessons[0].title").value("Introduction"));
    }

    private User createInstructor(String email) {
        User instructor = User.builder()
                .email(email)
                .password("password")
                .firstName("Ines")
                .lastName("Tructor")
                .status(UserStatus.ACTIVE)
                .build();
        return userRepository.save(instructor);
    }
}
