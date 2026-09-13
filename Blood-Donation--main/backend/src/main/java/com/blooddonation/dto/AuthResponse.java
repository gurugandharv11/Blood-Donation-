package com.blooddonation.dto;

import lombok.*;

/**
 * DTO for authentication response containing JWT token and user info.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponse {

    private String token;
    private String tokenType;
    private Long userId;
    private String name;
    private String email;
    private String role;
    private Long donorId;
    private String profileImage;

    public static AuthResponse of(String token, Long userId, String name, String email, String role, Long donorId, String profileImage) {
        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(userId)
                .name(name)
                .email(email)
                .role(role)
                .donorId(donorId)
                .profileImage(profileImage)
                .build();
    }
}
