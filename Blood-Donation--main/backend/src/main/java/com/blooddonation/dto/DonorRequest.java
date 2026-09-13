package com.blooddonation.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

/**
 * DTO for creating or updating a Donor profile.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DonorRequest {

    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-)$",
             message = "Invalid blood group. Valid values: A+, A-, B+, B-, AB+, AB-, O+, O-")
    private String bloodGroup;

    @NotNull(message = "Age is required")
    @Min(value = 18, message = "Donor must be at least 18 years old")
    @Max(value = 65, message = "Donor must be at most 65 years old")
    private Integer age;

    @NotBlank(message = "Gender is required")
    @Pattern(regexp = "^(Male|Female|Other)$", message = "Gender must be Male, Female, or Other")
    private String gender;

    @NotBlank(message = "City is required")
    private String city;

    private String address;

    private Boolean available = true;

    private LocalDate lastDonationDate;
}
