package com.ulearner.backend.service.impl;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Lesson;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.dto.CourseDto;
import com.ulearner.backend.dto.CourseSummaryDto;
import com.ulearner.backend.dto.LessonDto;
import com.ulearner.backend.dto.request.CourseCreateRequest;
import com.ulearner.backend.dto.request.CourseUpdateRequest;
import com.ulearner.backend.dto.request.LessonRequest;
import com.ulearner.backend.exception.ResourceNotFoundException;
import com.ulearner.backend.mapper.CourseMapper;
import com.ulearner.backend.mapper.LessonMapper;
import com.ulearner.backend.repository.CourseRepository;
import com.ulearner.backend.repository.LessonRepository;
import com.ulearner.backend.repository.UserRepository;
import com.ulearner.backend.service.CourseService;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final LessonRepository lessonRepository;
    private final UserRepository userRepository;
    private final CourseMapper courseMapper;
    private final LessonMapper lessonMapper;

    @Override
    @Transactional
    public CourseDto createCourse(CourseCreateRequest request) {
        User instructor = userRepository.findById(request.instructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));

        Course course = Course.builder()
                .title(request.title())
                .description(request.description())
                .thumbnailUrl(request.thumbnailUrl())
                .instructor(instructor)
                .lessons(new ArrayList<>())
                .build();

        if (request.lessons() != null && !request.lessons().isEmpty()) {
            course.setLessons(buildLessons(request.lessons(), course));
        }

        Course saved = courseRepository.save(course);
        return courseMapper.toDto(saved);
    }

    @Override
    @Transactional
    public CourseDto updateCourse(Long courseId, CourseUpdateRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        if (request.title() != null) {
            course.setTitle(request.title());
        }
        if (request.description() != null) {
            course.setDescription(request.description());
        }
        if (request.thumbnailUrl() != null) {
            course.setThumbnailUrl(request.thumbnailUrl());
        }
        if (request.instructorId() != null) {
            User instructor = userRepository.findById(request.instructorId())
                    .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
            course.setInstructor(instructor);
        }
        if (request.lessons() != null) {
            course.getLessons().clear();
            course.getLessons().addAll(buildLessons(request.lessons(), course));
        }

        return courseMapper.toDto(course);
    }

    @Override
    @Transactional
    public void deleteCourse(Long courseId) {
        courseRepository.findById(courseId).ifPresent(courseRepository::delete);
    }

    @Override
    public CourseDto getCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
        return courseMapper.toDto(course);
    }

    @Override
    public List<CourseSummaryDto> listCourses() {
        return courseRepository.findAll().stream()
                .sorted(Comparator.comparing(Course::getCreatedAt).reversed())
                .map(courseMapper::toSummary)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public LessonDto addLesson(Long courseId, LessonRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found"));

        Lesson lesson = Lesson.builder()
                .title(request.title())
                .content(request.content())
                .position(request.position())
                .course(course)
                .build();

        Lesson saved = lessonRepository.save(lesson);
        course.getLessons().add(saved);
        return lessonMapper.toDto(saved);
    }

    private List<Lesson> buildLessons(List<LessonRequest> lessonRequests, Course course) {
        return lessonRequests.stream()
                .filter(Objects::nonNull)
                .sorted(Comparator.comparing(LessonRequest::position))
                .map(request -> Lesson.builder()
                        .title(request.title())
                        .content(request.content())
                        .position(request.position())
                        .course(course)
                        .build())
                .collect(Collectors.toCollection(ArrayList::new));
    }
}
