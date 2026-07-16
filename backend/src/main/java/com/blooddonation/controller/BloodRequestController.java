package com.blooddonation.controller;

import com.blooddonation.dto.*;
import com.blooddonation.service.BloodRequestService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Blood Request operations.
 */
@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class BloodRequestController {

    private final BloodRequestService requestService;

    /**
     * POST /api/requests
     * Create a new blood request. Accessible by SEEKER role.
     */
    @PostMapping
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> createRequest(
            @Valid @RequestBody BloodRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Blood request created",
                        requestService.createRequest(dto, userDetails.getUsername())));
    }

    /**
     * GET /api/requests
     * Get all blood requests (Admin sees all; others see pending).
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<BloodRequestResponse>>> getAllRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Donors see pending requests; admin/seeker see all
        return ResponseEntity.ok(ApiResponse.success("Blood requests",
                requestService.getAllRequests(page, size)));
    }

    /**
     * GET /api/requests/pending
     * Get all PENDING requests (visible to donors).
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('DONOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<BloodRequestResponse>>> getPendingRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Pending requests",
                requestService.getPendingRequests(page, size)));
    }

    /**
     * GET /api/requests/my
     * Get requests created by the currently logged-in seeker.
     */
    @GetMapping("/my")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<ApiResponse<Page<BloodRequestResponse>>> getMyRequests(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Your requests",
                requestService.getRequestsBySeeker(userDetails.getUsername(), page, size)));
    }

    /**
     * GET /api/requests/{id}
     * Get a specific blood request by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> getRequestById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Blood request",
                requestService.getRequestById(id)));
    }

    /**
     * PUT /api/requests/{id}
     * Update a blood request (only if PENDING and owned by seeker).
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> updateRequest(
            @PathVariable Long id,
            @Valid @RequestBody BloodRequestDto dto,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Cancel existing and create new (simple update)
        requestService.cancelRequest(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Request updated",
                requestService.createRequest(dto, userDetails.getUsername())));
    }

    /**
     * DELETE /api/requests/{id}
     * Delete a blood request. Admin only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteRequest(@PathVariable Long id) {
        requestService.deleteRequest(id);
        return ResponseEntity.ok(ApiResponse.success("Blood request deleted"));
    }

    /**
     * PATCH /api/requests/{id}/accept
     * Donor accepts a blood request.
     */
    @PatchMapping("/{id}/accept")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Request accepted",
                requestService.acceptRequest(id, userDetails.getUsername())));
    }

    /**
     * PATCH /api/requests/{id}/reject
     * Donor rejects an accepted request (returns to PENDING).
     */
    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Request rejected",
                requestService.rejectRequest(id, userDetails.getUsername())));
    }

    /**
     * PATCH /api/requests/{id}/complete
     * Donor marks donation as completed.
     */
    @PatchMapping("/{id}/complete")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> completeRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Donation completed",
                requestService.completeRequest(id, userDetails.getUsername())));
    }

    /**
     * PATCH /api/requests/{id}/cancel
     * Seeker cancels their own PENDING request.
     */
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasRole('SEEKER')")
    public ResponseEntity<ApiResponse<BloodRequestResponse>> cancelRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Request cancelled",
                requestService.cancelRequest(id, userDetails.getUsername())));
    }
}
