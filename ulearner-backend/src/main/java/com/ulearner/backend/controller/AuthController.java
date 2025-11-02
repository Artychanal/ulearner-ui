package com.ulearner.backend.controller;

import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.dto.request.UserRegistrationRequest;
import com.ulearner.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserRegistrationRequest request) {
        UserDto created = authService.registerUser(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
