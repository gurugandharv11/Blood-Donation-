package com.blooddonation.repository;

import com.blooddonation.entity.BloodRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for BloodRequest entity.
 */
@Repository
public interface BloodRequestRepository extends JpaRepository<BloodRequest, Long> {

    // Find requests by seeker
    Page<BloodRequest> findBySeekerId(Long seekerId, Pageable pageable);

    // Find requests by donor
    Page<BloodRequest> findByDonorId(Long donorId, Pageable pageable);

    // Find requests by status
    Page<BloodRequest> findByStatus(BloodRequest.RequestStatus status, Pageable pageable);

    // Find pending requests visible to donors
    @Query("SELECT r FROM BloodRequest r WHERE r.status = 'PENDING' ORDER BY r.createdAt DESC")
    Page<BloodRequest> findPendingRequests(Pageable pageable);

    // Count by status
    long countByStatus(BloodRequest.RequestStatus status);

    // Find requests by seeker and status
    List<BloodRequest> findBySeekerIdAndStatus(Long seekerId, BloodRequest.RequestStatus status);
}
