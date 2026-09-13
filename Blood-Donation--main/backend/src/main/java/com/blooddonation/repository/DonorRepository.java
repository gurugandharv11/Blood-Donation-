package com.blooddonation.repository;

import com.blooddonation.entity.Donor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Donor entity with search and filter queries.
 */
@Repository
public interface DonorRepository extends JpaRepository<Donor, Long> {

    Optional<Donor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    // Search donors by blood group, city, and availability
    @Query("SELECT d FROM Donor d WHERE " +
           "(:bloodGroup IS NULL OR d.bloodGroup = :bloodGroup) AND " +
           "(:city IS NULL OR LOWER(d.city) LIKE LOWER(CONCAT('%', :city, '%'))) AND " +
           "(:available IS NULL OR d.available = :available)")
    Page<Donor> searchDonors(
            @Param("bloodGroup") String bloodGroup,
            @Param("city") String city,
            @Param("available") Boolean available,
            Pageable pageable
    );

    // Count available donors
    long countByAvailableTrue();

    // Count all donors
    long countByAvailable(Boolean available);

    // Find all available donors for a specific blood group
    List<Donor> findByBloodGroupAndAvailableTrue(String bloodGroup);
}
