package com.blooddonation.repository;

import com.blooddonation.entity.Donation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Repository for Donation entity.
 */
@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {

    // Find donations by donor
    Page<Donation> findByDonorId(Long donorId, Pageable pageable);

    // Count total donations
    long countByDonorId(Long donorId);

    boolean existsByBloodRequestId(Long bloodRequestId);
}
