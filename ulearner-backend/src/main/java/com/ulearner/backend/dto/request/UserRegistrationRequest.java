package com.ulearner.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.Set;

public record UserRegistrationRequest(
        @Email @NotBlank String email,
        @NotBlank @Size(min = 6, max = 120) String password,
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @Size(max = 20) String phone,
        Set<@NotBlank String> roleNames) {}
