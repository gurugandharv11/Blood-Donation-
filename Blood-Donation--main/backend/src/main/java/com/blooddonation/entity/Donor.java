package com.blooddonation.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Donor entity containing blood donation-related information.
 * Has a OneToOne relationship with User entity.
 */
@Entity
@Table(name = "donors", indexes = {
        @Index(name = "idx_donor_blood_group", columnList = "blood_group"),
        @Index(name = "idx_donor_city", columnList = "city"),
        @Index(name = "idx_donor_available", columnList = "available")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Donor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "blood_group", nullable = false, length = 5)
    private String bloodGroup;

    @Column(name = "age")
    private Integer age;

    @Column(name = "gender", length = 10)
    private String gender;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "available", nullable = false)
    @Builder.Default
    private Boolean available = true;

    @Column(name = "last_donation_date")
    private LocalDate lastDonationDate;

    @Column(name = "profile_photo")
    private String profilePhoto;

    @Column(name = "total_donations")
    @Builder.Default
    private Integer totalDonations = 0;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
