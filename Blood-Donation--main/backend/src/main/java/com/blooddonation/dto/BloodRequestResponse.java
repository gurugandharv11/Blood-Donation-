package com.blooddonation.dto;

import lombok.*;

import java.time.LocalDateTime;

/**
 * DTO for returning BloodRequest information in API responses.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodRequestResponse {

    private Long id;
    private Long seekerId;
    private String seekerName;
    private String seekerImage;
    private Long donorId;
    private String donorName;
    private String donorImage;
    private String patientName;
    private String bloodGroup;
    private Integer unitsRequired;
    private String hospitalName;
    private String hospitalAddress;
    private String city;
    private String contactNumber;
    private String urgency;
    private String status;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
