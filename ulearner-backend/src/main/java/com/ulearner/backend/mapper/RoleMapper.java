package com.ulearner.backend.mapper;

import com.ulearner.backend.domain.Role;
import com.ulearner.backend.dto.RoleDto;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface RoleMapper {
    RoleDto toDto(Role role);

    Role toEntity(RoleDto dto);
}
