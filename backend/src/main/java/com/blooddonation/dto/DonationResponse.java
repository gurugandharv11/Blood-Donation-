package com.blooddonation.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO for returning Donation history information.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DonationResponse {

    private Long id;
    private Long donorId;
    private String donorName;
    private Long bloodRequestId;
    private String patientName;
    private String bloodGroup;
    private String hospitalName;
    private Integer unitsDonated;
    private LocalDate donationDate;
    private String notes;
    private LocalDateTime createdAt;
}
