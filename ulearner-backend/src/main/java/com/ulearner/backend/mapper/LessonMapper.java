package com.ulearner.backend.mapper;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.domain.Lesson;
import com.ulearner.backend.dto.LessonDto;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    @Mapping(target = "courseId", source = "course.id")
    LessonDto toDto(Lesson lesson);

    @InheritInverseConfiguration
    Lesson toEntity(LessonDto dto);

    default Course map(Long courseId) {
        if (courseId == null) {
            return null;
        }
        Course course = new Course();
        course.setId(courseId);
        return course;
    }

    default Long map(Course course) {
        return course != null ? course.getId() : null;
    }
}
