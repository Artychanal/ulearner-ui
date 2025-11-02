package com.ulearner.backend.mapper;

import com.ulearner.backend.domain.User;
import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.dto.UserSummaryDto;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", uses = RoleMapper.class)
public interface UserMapper {

    UserDto toDto(User user);

    UserSummaryDto toSummary(User user);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "enrollments", ignore = true)
    @Mapping(target = "courses", ignore = true)
    User toEntity(UserDto dto);

    @Mapping(target = "password", ignore = true)
    @Mapping(target = "enrollments", ignore = true)
    @Mapping(target = "courses", ignore = true)
    User toEntity(UserSummaryDto dto);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "enrollments", ignore = true)
    @Mapping(target = "courses", ignore = true)
    void updateEntityFromDto(UserDto dto, @MappingTarget User user);
}
