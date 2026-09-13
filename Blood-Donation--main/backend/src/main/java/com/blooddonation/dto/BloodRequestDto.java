package com.blooddonation.dto;

import jakarta.validation.constraints.*;
import lombok.*;

/**
 * DTO for creating or updating a BloodRequest.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BloodRequestDto {

    @NotBlank(message = "Patient name is required")
    @Size(min = 2, max = 100, message = "Patient name must be between 2 and 100 characters")
    private String patientName;

    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A\\+|A-|B\\+|B-|AB\\+|AB-|O\\+|O-)$",
             message = "Invalid blood group")
    private String bloodGroup;

    @NotNull(message = "Units required is mandatory")
    @Min(value = 1, message = "At least 1 unit is required")
    @Max(value = 10, message = "Maximum 10 units can be requested")
    private Integer unitsRequired;

    @NotBlank(message = "Hospital name is required")
    private String hospitalName;

    @NotBlank(message = "Hospital address is required")
    private String hospitalAddress;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "Contact number is required")
    @Pattern(regexp = "^[0-9]{10}$", message = "Contact number must be 10 digits")
    private String contactNumber;

    @NotBlank(message = "Urgency level is required")
    @Pattern(regexp = "^(CRITICAL|HIGH|MEDIUM|LOW)$", message = "Invalid urgency level")
    private String urgency;

    private String notes;
}
