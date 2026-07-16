package com.blooddonation.config;

import com.blooddonation.entity.Role;
import com.blooddonation.entity.User;
import com.blooddonation.repository.RoleRepository;
import com.blooddonation.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * Application configuration and initialization.
 * Seeds roles and default admin user on first run.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
public class AppConfig {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Seeds the database with roles and default admin user if not already present.
     * Default admin credentials:
     *   Email: admin@blooddonation.com
     *   Password: Admin@123
     */
    @Bean
    public CommandLineRunner seedDatabase() {
        return args -> {
            // Create roles if they don't exist
            for (Role.RoleName roleName : Role.RoleName.values()) {
                if (roleRepository.findByName(roleName).isEmpty()) {
                    Role role = new Role();
                    role.setName(roleName);
                    roleRepository.save(role);
                    log.info("Created role: {}", roleName);
                }
            }

            // Create default admin if not present
            if (!userRepository.existsByEmail("admin@blooddonation.com")) {
                Role adminRole = roleRepository.findByName(Role.RoleName.ROLE_ADMIN)
                        .orElseThrow(() -> new RuntimeException("ROLE_ADMIN not found"));

                User admin = User.builder()
                        .name("System Administrator")
                        .email("admin@blooddonation.com")
                        .password(passwordEncoder.encode("Admin@123"))
                        .phone("9999999999")
                        .role(adminRole)
                        .active(true)
                        .build();

                userRepository.save(admin);
                log.info("Default admin created: admin@blooddonation.com / Admin@123");
            }

            log.info("Database initialization complete.");
        };
    }
}
