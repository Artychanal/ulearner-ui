package com.ulearner.backend.repository;

import static org.assertj.core.api.Assertions.assertThat;

import com.ulearner.backend.domain.Role;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.domain.UserStatus;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Test
    void existsByEmail_shouldReturnTrueWhenEmailRegistered() {
        userRepository.save(User.builder()
                .email("test@ulearner.com")
                .password("pwd")
                .firstName("Test")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .build());

        assertThat(userRepository.existsByEmail("test@ulearner.com")).isTrue();
    }

    @Test
    void findOneWithRolesByEmail_shouldLoadRoles() {
        Role role = roleRepository.save(Role.builder().name("STUDENT").description("Student role").build());

        User user = User.builder()
                .email("role@ulearner.com")
                .password("pwd")
                .firstName("Role")
                .lastName("User")
                .status(UserStatus.ACTIVE)
                .roles(Set.of(role))
                .build();
        user = userRepository.save(user);

        User found = userRepository.findOneWithRolesByEmail("role@ulearner.com").orElseThrow();

        assertThat(found.getId()).isEqualTo(user.getId());
        assertThat(found.getRoles()).extracting(Role::getName).containsExactly("STUDENT");
    }
}
