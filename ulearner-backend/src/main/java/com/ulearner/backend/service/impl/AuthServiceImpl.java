package com.ulearner.backend.service.impl;

import com.ulearner.backend.domain.Role;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.dto.request.UserRegistrationRequest;
import com.ulearner.backend.mapper.UserMapper;
import com.ulearner.backend.repository.RoleRepository;
import com.ulearner.backend.repository.UserRepository;
import com.ulearner.backend.service.AuthService;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import lombok.RequiredArgsConstructor;
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

    @Override
    @Transactional
    public UserDto registerUser(UserRegistrationRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered");
        }

        User user = User.builder()
                .email(request.email())
                .password(request.password())
                .firstName(request.firstName())
                .lastName(request.lastName())
                .phone(request.phone())
                .status(UserStatus.ACTIVE)
                .build();

        user.setRoles(resolveRoles(request.roleNames()));

        User saved = userRepository.save(user);
        return userMapper.toDto(saved);
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
}
