package com.ulearner.backend.dto;

import com.ulearner.backend.domain.UserStatus;
import java.time.Instant;
import java.util.Set;

public record UserDto(
        Long id,
        String email,
        String firstName,
        String lastName,
        String phone,
        UserStatus status,
        Instant createdAt,
        Set<RoleDto> roles) {}
