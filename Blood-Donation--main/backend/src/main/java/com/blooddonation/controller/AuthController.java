package com.blooddonation.controller;

import com.blooddonation.dto.*;
import com.blooddonation.service.AuthService;
import com.blooddonation.service.DonorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for authentication endpoints.
 * Public endpoints: no JWT required for login/register.
 * Profile image upload requires authentication.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final DonorService donorService;

    /**
     * POST /api/auth/register
     * Register a new user as DONOR or SEEKER.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(
            @Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    /**
     * POST /api/auth/login
     * Authenticate user and return JWT token.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    /**
     * POST /api/auth/profile-image
     * Upload profile image for the currently authenticated user (any role).
     */
    @PostMapping("/profile-image")
    public ResponseEntity<ApiResponse<String>> uploadProfileImage(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        String photoUrl = donorService.uploadProfilePhotoByEmail(userDetails.getUsername(), file);
        return ResponseEntity.ok(ApiResponse.success("Profile image uploaded", photoUrl));
    }
}
