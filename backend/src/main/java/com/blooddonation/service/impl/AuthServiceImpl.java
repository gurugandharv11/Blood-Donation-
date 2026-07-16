package com.blooddonation.service.impl;

import com.blooddonation.dto.*;
import com.blooddonation.entity.*;
import com.blooddonation.exception.BadRequestException;
import com.blooddonation.repository.*;
import com.blooddonation.security.JwtTokenProvider;
import com.blooddonation.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AuthService handling user registration and login.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DonorRepository donorRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * Register a new user. If role is DONOR, also creates an empty donor profile.
     */
    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email address is already registered: " + request.getEmail());
        }

        // Determine role
        Role.RoleName roleName = request.getRole().equals("DONOR")
                ? Role.RoleName.ROLE_DONOR
                : Role.RoleName.ROLE_SEEKER;

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new BadRequestException("Role not found: " + roleName));

        // Create user
        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(role)
                .active(true)
                .build();

        user = userRepository.save(user);
        log.info("Registered new user: {} with role: {}", user.getEmail(), roleName);

        // If donor, create empty profile so they can complete it later
        Long donorId = null;
        if (roleName == Role.RoleName.ROLE_DONOR) {
            Donor donor = Donor.builder()
                    .user(user)
                    .bloodGroup("O+") // default, user must update
                    .available(false)
                    .totalDonations(0)
                    .build();
            donor = donorRepository.save(donor);
            donorId = donor.getId();
        }

        // Generate token
        String token = jwtTokenProvider.generateTokenFromEmail(user.getEmail());
        return AuthResponse.of(token, user.getId(), user.getName(),
                user.getEmail(), roleName.name(), donorId, user.getProfileImage());
    }

    /**
     * Authenticate user credentials and return JWT token.
     */
    @Override
    public AuthResponse login(LoginRequest request) {
        // Spring Security will throw BadCredentialsException if invalid
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        // Load the user from DB to get role and donor ID
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("User not found"));

        Long donorId = null;
        if (user.getRole().getName() == Role.RoleName.ROLE_DONOR) {
            donorId = donorRepository.findByUserId(user.getId())
                    .map(d -> d.getId())
                    .orElse(null);
        }

        String token = jwtTokenProvider.generateToken(authentication);
        log.info("User logged in: {}", user.getEmail());

        return AuthResponse.of(token, user.getId(), user.getName(),
                user.getEmail(), user.getRole().getName().name(), donorId, user.getProfileImage());
    }
}
