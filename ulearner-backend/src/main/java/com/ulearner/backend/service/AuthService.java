package com.ulearner.backend.service;

import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.dto.request.UserRegistrationRequest;

public interface AuthService {

    UserDto registerUser(UserRegistrationRequest request);
}
