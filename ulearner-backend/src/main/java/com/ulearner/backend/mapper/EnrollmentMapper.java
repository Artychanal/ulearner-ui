package com.ulearner.backend.mapper;

import com.ulearner.backend.domain.Enrollment;
import com.ulearner.backend.dto.EnrollmentDto;
import org.mapstruct.InheritInverseConfiguration;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class, CourseMapper.class})
public interface EnrollmentMapper {

    @Mapping(target = "student", source = "student")
    @Mapping(target = "course", source = "course")
    EnrollmentDto toDto(Enrollment enrollment);

    @InheritInverseConfiguration
    Enrollment toEntity(EnrollmentDto dto);
}
