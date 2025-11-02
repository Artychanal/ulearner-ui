package com.ulearner.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Lesson;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import com.ulearner.backend.dto.CourseDto;
import com.ulearner.backend.dto.CourseSummaryDto;
import com.ulearner.backend.dto.LessonDto;
import com.ulearner.backend.dto.UserSummaryDto;
import com.ulearner.backend.dto.request.CourseCreateRequest;
import com.ulearner.backend.dto.request.LessonRequest;
import com.ulearner.backend.exception.ResourceNotFoundException;
import com.ulearner.backend.mapper.CourseMapper;
import com.ulearner.backend.mapper.LessonMapper;
import com.ulearner.backend.repository.CourseRepository;
import com.ulearner.backend.repository.LessonRepository;
import com.ulearner.backend.repository.UserRepository;
import java.time.Instant;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CourseServiceImplTest {

    @Mock
    private CourseRepository courseRepository;

    @Mock
    private LessonRepository lessonRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CourseMapper courseMapper;

    @Mock
    private LessonMapper lessonMapper;

    private CourseServiceImpl courseService;

    @BeforeEach
    void setUp() {
        courseService = new CourseServiceImpl(
                courseRepository,
                lessonRepository,
                userRepository,
                courseMapper,
                lessonMapper);
    }

    @Test
    void createCourse_shouldPersistWithSortedLessons() {
        CourseCreateRequest request = new CourseCreateRequest(
                "Spring Boot",
                "Learn Spring Boot",
                null,
                5L,
                List.of(
                        new LessonRequest("Intro", "Basics", 2),
                        new LessonRequest("Setup", "Env", 1)));

        User instructor = User.builder()
                .id(5L)
                .email("instructor@ulearner.com")
                .password("pwd")
                .firstName("Ines")
                .lastName("Tructor")
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.findById(5L)).thenReturn(Optional.of(instructor));

        Course savedCourse = Course.builder()
                .id(10L)
                .title("Spring Boot")
                .description("Learn Spring Boot")
                .instructor(instructor)
                .build();
        when(courseRepository.save(any(Course.class))).thenReturn(savedCourse);

        CourseDto dto = new CourseDto(
                10L,
                "Spring Boot",
                "Learn Spring Boot",
                null,
                savedCourse.getCreatedAt(),
                new UserSummaryDto(5L, "instructor@ulearner.com", "Ines", "Tructor"),
                List.of(
                        new LessonDto(1L, "Setup", "Env", 1, 10L),
                        new LessonDto(2L, "Intro", "Basics", 2, 10L)));
        when(courseMapper.toDto(savedCourse)).thenReturn(dto);

        CourseDto response = courseService.createCourse(request);

        assertThat(response).isEqualTo(dto);
        ArgumentCaptor<Course> courseCaptor = ArgumentCaptor.forClass(Course.class);
        verify(courseRepository).save(courseCaptor.capture());
        Course created = courseCaptor.getValue();
        assertThat(created.getLessons())
                .extracting(Lesson::getTitle)
                .containsExactly("Setup", "Intro");
        assertThat(created.getLessons())
                .extracting(Lesson::getPosition)
                .containsExactly(1, 2);
    }

    @Test
    void createCourse_whenInstructorMissing_shouldThrowNotFound() {
        CourseCreateRequest request = new CourseCreateRequest(
                "Spring Boot",
                "Learn Spring Boot",
                null,
                99L,
                null);
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> courseService.createCourse(request))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("Instructor not found");
    }

    @Test
    void listCourses_shouldReturnNewestFirst() {
        User instructor = User.builder()
                .id(1L)
                .email("inst@ulearner.com")
                .password("pwd")
                .firstName("Ines")
                .lastName("Tructor")
                .status(UserStatus.ACTIVE)
                .build();

        Course older = Course.builder()
                .id(11L)
                .title("Legacy")
                .createdAt(Instant.parse("2023-01-01T00:00:00Z"))
                .instructor(instructor)
                .build();
        Course newer = Course.builder()
                .id(12L)
                .title("Modern")
                .createdAt(Instant.parse("2024-01-01T00:00:00Z"))
                .instructor(instructor)
                .build();

        when(courseRepository.findAll()).thenReturn(Arrays.asList(older, newer));
        when(courseMapper.toSummary(any(Course.class))).thenAnswer(invocation -> {
            Course course = invocation.getArgument(0);
            return new CourseSummaryDto(course.getId(), course.getTitle(), course.getThumbnailUrl(), course.getCreatedAt());
        });

        List<CourseSummaryDto> summaries = courseService.listCourses();

        assertThat(summaries).extracting(CourseSummaryDto::id).containsExactly(12L, 11L);
        verify(courseRepository, times(1)).findAll();
    }
}
