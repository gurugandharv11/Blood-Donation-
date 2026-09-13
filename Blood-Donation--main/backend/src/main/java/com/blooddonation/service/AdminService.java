package com.blooddonation.service;

import com.blooddonation.dto.*;
import org.springframework.data.domain.Page;

/**
 * Service interface for Admin operations.
 */
public interface AdminService {

    DashboardStatsResponse getDashboardStats();

    Page<UserResponse> getAllUsers(int page, int size);

    Page<DonorResponse> getAllDonors(int page, int size);

    void deleteUser(Long userId);

    void deleteDonor(Long donorId);

    Page<BloodRequestResponse> getAllRequests(int page, int size);

    Page<DonationResponse> getAllDonations(int page, int size);

    UserResponse toggleUserStatus(Long userId);
}
