package com.ulearner.backend.service;

import com.ulearner.backend.dto.UserDto;

public interface UserService {

    UserDto getUser(Long userId);
}
