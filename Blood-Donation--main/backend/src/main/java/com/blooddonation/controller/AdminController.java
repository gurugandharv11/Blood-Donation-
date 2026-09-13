package com.blooddonation.controller;

import com.blooddonation.dto.*;
import com.blooddonation.service.AdminService;
import com.blooddonation.service.BloodRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Admin-specific operations.
 * All endpoints require ADMIN role.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;
    private final BloodRequestService bloodRequestService;

    /**
     * GET /api/admin/dashboard
     * Get system statistics for the admin dashboard.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        return ResponseEntity.ok(ApiResponse.success("Dashboard statistics",
                adminService.getDashboardStats()));
    }

    /**
     * GET /api/admin/users
     * Get all users with pagination.
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("All users",
                adminService.getAllUsers(page, size)));
    }

    /**
     * DELETE /api/admin/users/{id}
     * Delete a user.
     */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("User deleted"));
    }

    /**
     * PATCH /api/admin/users/{id}/toggle-status
     * Toggle user active/inactive status.
     */
    @PatchMapping("/users/{id}/toggle-status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserStatus(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("User status updated",
                adminService.toggleUserStatus(id)));
    }

    /**
     * GET /api/admin/donors
     * Get all donors with pagination.
     */
    @GetMapping("/donors")
    public ResponseEntity<ApiResponse<Page<DonorResponse>>> getAllDonors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("All donors",
                adminService.getAllDonors(page, size)));
    }

    /**
     * DELETE /api/admin/donors/{id}
     * Delete a donor.
     */
    @DeleteMapping("/donors/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDonor(@PathVariable Long id) {
        adminService.deleteDonor(id);
        return ResponseEntity.ok(ApiResponse.success("Donor deleted"));
    }

    /**
     * GET /api/admin/requests
     * Get all blood requests with pagination.
     */
    @GetMapping("/requests")
    public ResponseEntity<ApiResponse<Page<BloodRequestResponse>>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("All requests",
                adminService.getAllRequests(page, size)));
    }

    /**
     * PATCH /api/admin/requests/{id}/approve
     * Admin approves a blood request.
     */
    @PatchMapping("/requests/{id}/approve")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> approveRequest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request approved",
                bloodRequestService.approveByAdmin(id)));
    }

    /**
     * PATCH /api/admin/requests/{id}/reject
     * Admin rejects a blood request.
     */
    @PatchMapping("/requests/{id}/reject")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> rejectRequest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Request rejected",
                bloodRequestService.rejectByAdmin(id)));
    }

    /**
     * GET /api/admin/donations
     * Get all completed donations.
     */
    @GetMapping("/donations")
    public ResponseEntity<ApiResponse<Page<DonationResponse>>> getAllDonations(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("All donations",
                adminService.getAllDonations(page, size)));
    }
}
