package com.ulearner.backend.service.impl;

import com.ulearner.backend.domain.RefreshToken;
import com.ulearner.backend.domain.Role;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import com.ulearner.backend.dto.AuthResponse;
import com.ulearner.backend.dto.request.LoginRequest;
import com.ulearner.backend.dto.request.RefreshTokenRequest;
import com.ulearner.backend.dto.request.UserRegistrationRequest;
import com.ulearner.backend.mapper.UserMapper;
import com.ulearner.backend.repository.RoleRepository;
import com.ulearner.backend.repository.UserRepository;
import com.ulearner.backend.security.UserPrincipal;
import com.ulearner.backend.security.jwt.JwtToken;
import com.ulearner.backend.security.jwt.JwtTokenService;
import com.ulearner.backend.service.AuthService;
import com.ulearner.backend.service.RefreshTokenService;
import io.jsonwebtoken.JwtException;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private static final String DEFAULT_ROLE = "STUDENT";

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenService jwtTokenService;
    private final RefreshTokenService refreshTokenService;

    @Override
    @Transactional
    public AuthResponse registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = User.builder()
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .status(UserStatus.ACTIVE)
                .build();

        user.setRoles(resolveRoles(request.roleNames()));

        User saved = userRepository.save(user);
        UserPrincipal principal = UserPrincipal.fromUser(saved);
        JwtToken accessToken = jwtTokenService.generateAccessToken(principal);
        JwtToken refreshToken = jwtTokenService.generateRefreshToken(principal);
        refreshTokenService.store(saved, refreshToken);
        return buildAuthResponse(saved, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        if (!(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication failed");
        }

        User user = loadActiveUser(principal.getUsername());
        JwtToken accessToken = jwtTokenService.generateAccessToken(principal);
        JwtToken refreshToken = jwtTokenService.generateRefreshToken(principal);
        refreshTokenService.store(user, refreshToken);
        return buildAuthResponse(user, accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse refreshTokens(RefreshTokenRequest request) {
        String refreshTokenValue = request.refreshToken();
        try {
            jwtTokenService.validateRefreshTokenOrThrow(refreshTokenValue);
        } catch (JwtException ex) {
            refreshTokenService.revokeByTokenValue(refreshTokenValue);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", ex);
        }

        RefreshToken storedToken = refreshTokenService.getActiveToken(refreshTokenValue);

        String email;
        try {
            email = jwtTokenService.extractUsername(refreshTokenValue);
        } catch (JwtException ex) {
            refreshTokenService.revoke(storedToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", ex);
        }

        User user = loadActiveUser(email);
        if (!storedToken.getUser().getId().equals(user.getId())) {
            refreshTokenService.revoke(storedToken);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token does not belong to the user");
        }

        UserPrincipal principal = UserPrincipal.fromUser(user);
        JwtToken accessToken = jwtTokenService.generateAccessToken(principal);
        JwtToken newRefreshToken = jwtTokenService.generateRefreshToken(principal);
        refreshTokenService.rotate(user, storedToken, newRefreshToken);
        return buildAuthResponse(user, accessToken, newRefreshToken);
    }

    @Override
    @Transactional
    public void logout(RefreshTokenRequest request) {
        String token = request.refreshToken();
        try {
            jwtTokenService.validateRefreshTokenOrThrow(token);
        } catch (JwtException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token", ex);
        }
        RefreshToken storedToken = refreshTokenService.getActiveToken(token);
        refreshTokenService.revoke(storedToken);
    }

    private Set<Role> resolveRoles(Set<String> roleNames) {
        Set<String> resolvedNames = (roleNames == null || roleNames.isEmpty())
                ? Set.of(DEFAULT_ROLE)
                : roleNames;

        Set<Role> roles = new HashSet<>();
        for (String name : resolvedNames) {
            Optional<Role> role = roleRepository.findByName(name);
            if (role.isEmpty()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Role '%s' was not found".formatted(name));
            }
            roles.add(role.get());
        }
        return roles;
    }

    private User loadActiveUser(String email) {
        User user = userRepository
                .findOneWithRolesByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));

        if (user.getStatus() == UserStatus.BLOCKED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is blocked");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User account is not active");
        }

        return user;
    }

    private AuthResponse buildAuthResponse(User user, JwtToken accessToken, JwtToken refreshToken) {
        return new AuthResponse(
                "Bearer",
                accessToken.value(),
                accessToken.expiresAt(),
                refreshToken.value(),
                refreshToken.expiresAt(),
                userMapper.toDto(user));
    }
}
