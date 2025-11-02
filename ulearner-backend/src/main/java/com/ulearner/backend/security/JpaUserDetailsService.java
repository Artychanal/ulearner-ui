package com.ulearner.backend.security;

import com.ulearner.backend.domain.User;
import com.ulearner.backend.exception.ForbiddenException;
import com.ulearner.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class JpaUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository
                .findOneWithRolesByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        if (user.getStatus() == null) {
            throw new ForbiddenException("User status is not defined");
        }

        return UserPrincipal.fromUser(user);
    }
}
