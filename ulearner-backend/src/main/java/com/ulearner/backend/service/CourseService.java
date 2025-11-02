package com.ulearner.backend.service;

import com.ulearner.backend.dto.CourseDto;
import com.ulearner.backend.dto.CourseSummaryDto;
import com.ulearner.backend.dto.LessonDto;
import com.ulearner.backend.dto.request.CourseCreateRequest;
import com.ulearner.backend.dto.request.CourseUpdateRequest;
import com.ulearner.backend.dto.request.LessonRequest;
import java.util.List;

public interface CourseService {

    CourseDto createCourse(CourseCreateRequest request);

    CourseDto updateCourse(Long courseId, CourseUpdateRequest request);

    void deleteCourse(Long courseId);

    CourseDto getCourse(Long courseId);

    List<CourseSummaryDto> listCourses();

    LessonDto addLesson(Long courseId, LessonRequest request);
}
