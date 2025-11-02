package com.ulearner.backend.service;

import com.ulearner.backend.dto.AuthResponse;
import com.ulearner.backend.dto.request.LoginRequest;
import com.ulearner.backend.dto.request.RefreshTokenRequest;
import com.ulearner.backend.dto.request.UserRegistrationRequest;

public interface AuthService {

    AuthResponse registerUser(UserRegistrationRequest request);

    AuthResponse login(LoginRequest request);

    AuthResponse refreshTokens(RefreshTokenRequest request);

    void logout(RefreshTokenRequest request);
}
