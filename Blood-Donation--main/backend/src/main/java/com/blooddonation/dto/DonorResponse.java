package com.blooddonation.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for returning Donor information in API responses.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonorResponse {

    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String bloodGroup;
    private Integer age;
    private String gender;
    private String city;
    private String address;
    private Boolean available;
    private LocalDate lastDonationDate;
    private String profilePhoto;
    private String profileImage;
    private Integer totalDonations;
    private LocalDateTime updatedAt;
}
