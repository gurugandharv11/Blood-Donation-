package com.blooddonation.repository;

import com.blooddonation.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for User entity with custom queries.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.role.name = 'ROLE_DONOR'")
    List<User> findAllDonors();

    @Query("SELECT u FROM User u WHERE u.role.name = 'ROLE_SEEKER'")
    List<User> findAllSeekers();

    long countByRoleName(com.blooddonation.entity.Role.RoleName roleName);
}
