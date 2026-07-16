package com.blooddonation.service;

import com.blooddonation.dto.*;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

    /**
     * Register a new user (DONOR or SEEKER).
     *
     * @param request registration details
     * @return AuthResponse with JWT token
     */
    AuthResponse register(RegisterRequest request);

    /**
     * Authenticate a user and return a JWT token.
     *
     * @param request login credentials
     * @return AuthResponse with JWT token
     */
    AuthResponse login(LoginRequest request);
}
