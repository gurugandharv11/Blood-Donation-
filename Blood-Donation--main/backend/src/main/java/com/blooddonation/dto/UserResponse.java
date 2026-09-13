package com.blooddonation.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for returning User information in API responses.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String role;
    private Boolean active;
    private String profileImage;
    private LocalDateTime createdAt;
}
