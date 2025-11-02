package com.ulearner.backend.service.impl;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.ulearner.backend.domain.Role;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import com.ulearner.backend.dto.AuthResponse;
import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.dto.request.LoginRequest;
import com.ulearner.backend.dto.request.RefreshTokenRequest;
import com.ulearner.backend.dto.request.UserRegistrationRequest;
import com.ulearner.backend.exception.ConflictException;
import com.ulearner.backend.exception.UnauthorizedException;
import com.ulearner.backend.exception.ValidationException;
import com.ulearner.backend.mapper.UserMapper;
import com.ulearner.backend.repository.RoleRepository;
import com.ulearner.backend.repository.UserRepository;
import com.ulearner.backend.security.UserPrincipal;
import com.ulearner.backend.security.jwt.JwtToken;
import com.ulearner.backend.security.jwt.JwtTokenService;
import com.ulearner.backend.service.RefreshTokenService;
import io.jsonwebtoken.JwtException;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    private static final Instant ACCESS_EXPIRES_AT = Instant.parse("2030-01-01T00:00:00Z");
    private static final Instant REFRESH_EXPIRES_AT = Instant.parse("2030-01-02T00:00:00Z");

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoleRepository roleRepository;

    @Mock
    private UserMapper userMapper;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenService jwtTokenService;

    @Mock
    private RefreshTokenService refreshTokenService;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(
                userRepository,
                roleRepository,
                userMapper,
                passwordEncoder,
                authenticationManager,
                jwtTokenService,
                refreshTokenService);
    }

    @Test
    void registerUser_shouldPersistUserAndReturnTokens() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "new@ulearner.com",
                "password",
                "Jane",
                "Doe",
                "+1234567",
                Set.of("STUDENT"));

        when(userRepository.existsByEmail("new@ulearner.com")).thenReturn(false);

        Role studentRole = Role.builder().id(1L).name("STUDENT").build();
        when(roleRepository.findByName("STUDENT")).thenReturn(Optional.of(studentRole));

        when(passwordEncoder.encode("password")).thenReturn("encoded");

        User savedUser = User.builder()
                .id(42L)
                .email("new@ulearner.com")
                .password("encoded")
                .firstName("Jane")
                .lastName("Doe")
                .phone("+1234567")
                .status(UserStatus.ACTIVE)
                .build();
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        JwtToken accessToken = new JwtToken("access", ACCESS_EXPIRES_AT);
        JwtToken refreshToken = new JwtToken("refresh", REFRESH_EXPIRES_AT);
        when(jwtTokenService.generateAccessToken(any(UserPrincipal.class))).thenReturn(accessToken);
        when(jwtTokenService.generateRefreshToken(any(UserPrincipal.class))).thenReturn(refreshToken);

        UserDto userDto = new UserDto(
                42L,
                "new@ulearner.com",
                "Jane",
                "Doe",
                "+1234567",
                UserStatus.ACTIVE,
                savedUser.getCreatedAt(),
                Set.of());
        when(userMapper.toDto(savedUser)).thenReturn(userDto);

        AuthResponse response = authService.registerUser(request);

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.refreshToken()).isEqualTo("refresh");
        assertThat(response.user()).isEqualTo(userDto);

        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        User createdUser = userCaptor.getValue();
        assertThat(createdUser.getRoles()).containsExactly(studentRole);
        assertThat(createdUser.getPassword()).isEqualTo("encoded");
        verify(refreshTokenService).store(savedUser, refreshToken);
    }

    @Test
    void registerUser_whenEmailExists_shouldThrowConflict() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "exists@ulearner.com",
                "password",
                "John",
                "Doe",
                null,
                null);

        when(userRepository.existsByEmail("exists@ulearner.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.registerUser(request))
                .isInstanceOf(ConflictException.class)
                .hasMessageContaining("Email is already registered");
    }

    @Test
    void registerUser_whenRoleMissing_shouldThrowValidationException() {
        UserRegistrationRequest request = new UserRegistrationRequest(
                "new@ulearner.com",
                "password",
                "Jane",
                "Doe",
                null,
                Set.of("MENTOR"));

        when(userRepository.existsByEmail("new@ulearner.com")).thenReturn(false);
        when(roleRepository.findByName("MENTOR")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.registerUser(request))
                .isInstanceOf(ValidationException.class)
                .hasMessageContaining("Role 'MENTOR' was not found");
    }

    @Test
    void login_withValidCredentials_shouldReturnTokens() {
        LoginRequest request = new LoginRequest("user@ulearner.com", "password");

        User user = User.builder()
                .id(100L)
                .email("user@ulearner.com")
                .password("encoded")
                .firstName("Test")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .build();

        UserPrincipal principal = UserPrincipal.fromUser(user);
        Authentication authentication = new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
        when(authenticationManager.authenticate(any())).thenReturn(authentication);
        when(userRepository.findOneWithRolesByEmail("user@ulearner.com")).thenReturn(Optional.of(user));

        JwtToken accessToken = new JwtToken("access", ACCESS_EXPIRES_AT);
        JwtToken refreshToken = new JwtToken("refresh", REFRESH_EXPIRES_AT);
        when(jwtTokenService.generateAccessToken(principal)).thenReturn(accessToken);
        when(jwtTokenService.generateRefreshToken(principal)).thenReturn(refreshToken);

        UserDto userDto = new UserDto(
                100L,
                "user@ulearner.com",
                "Test",
                "User",
                null,
                UserStatus.ACTIVE,
                user.getCreatedAt(),
                Set.of());
        when(userMapper.toDto(user)).thenReturn(userDto);

        AuthResponse response = authService.login(request);

        assertThat(response.accessToken()).isEqualTo("access");
        assertThat(response.refreshToken()).isEqualTo("refresh");
        assertThat(response.user()).isEqualTo(userDto);
        verify(refreshTokenService).store(user, refreshToken);
    }

    @Test
    void refreshTokens_whenJwtInvalid_shouldRevokeAndThrowUnauthorized() {
        RefreshTokenRequest request = new RefreshTokenRequest("invalid-token");
        JwtException exception = new JwtException("bad");
        doThrow(exception).when(jwtTokenService).validateRefreshTokenOrThrow("invalid-token");

        assertThatThrownBy(() -> authService.refreshTokens(request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Invalid refresh token");

        verify(refreshTokenService).revokeByTokenValue("invalid-token");
    }
}
