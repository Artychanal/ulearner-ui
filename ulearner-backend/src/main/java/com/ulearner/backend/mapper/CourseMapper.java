package com.ulearner.backend.mapper;

import com.ulearner.backend.domain.Course;
import com.ulearner.backend.dto.CourseDto;
import com.ulearner.backend.dto.CourseSummaryDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = {UserMapper.class, LessonMapper.class})
public interface CourseMapper {

    @Mapping(target = "instructor", source = "instructor")
    @Mapping(target = "lessons", source = "lessons")
    CourseDto toDto(Course course);

    CourseSummaryDto toSummary(Course course);

    @InheritInverseConfiguration(name = "toDto")
    @Mapping(target = "enrollments", ignore = true)
    Course toEntity(CourseDto dto);

    @Mapping(target = "lessons", ignore = true)
    @Mapping(target = "enrollments", ignore = true)
    Course toEntity(CourseSummaryDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "enrollments", ignore = true)
    void updateEntityFromDto(CourseDto dto, @MappingTarget Course course);
}
