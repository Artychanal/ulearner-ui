package com.ulearner.backend.service.impl;

import com.ulearner.backend.domain.User;
import com.ulearner.backend.dto.UserDto;
import com.ulearner.backend.exception.ResourceNotFoundException;
import com.ulearner.backend.mapper.UserMapper;
import com.ulearner.backend.repository.UserRepository;
import com.ulearner.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;

    @Override
    public UserDto getUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return userMapper.toDto(user);
    }
}
