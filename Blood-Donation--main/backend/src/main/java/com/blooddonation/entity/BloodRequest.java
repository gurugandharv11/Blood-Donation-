package com.blooddonation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * BloodRequest entity representing a blood request raised by a seeker.
 * Links the seeker (User) and optionally the donor who accepts it.
 */
@Entity
@Table(name = "blood_requests", indexes = {
        @Index(name = "idx_request_status", columnList = "status"),
        @Index(name = "idx_request_blood_group", columnList = "blood_group"),
        @Index(name = "idx_request_city", columnList = "city")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seeker_id", nullable = false)
    private User seeker;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id")
    private Donor donor;

    @Column(name = "patient_name", nullable = false, length = 100)
    private String patientName;

    @Column(name = "blood_group", nullable = false, length = 5)
    private String bloodGroup;

    @Column(name = "units_required", nullable = false)
    private Integer unitsRequired;

    @Column(name = "hospital_name", nullable = false, length = 150)
    private String hospitalName;

    @Column(name = "hospital_address", columnDefinition = "TEXT")
    private String hospitalAddress;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "contact_number", nullable = false, length = 15)
    private String contactNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "urgency", nullable = false, length = 10)
    @Builder.Default
    private Urgency urgency = Urgency.MEDIUM;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 15)
    @Builder.Default
    private RequestStatus status = RequestStatus.PENDING;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum RequestStatus {
        PENDING, ACCEPTED, REJECTED, COMPLETED
    }

    public enum Urgency {
        CRITICAL, HIGH, MEDIUM, LOW
    }
}
