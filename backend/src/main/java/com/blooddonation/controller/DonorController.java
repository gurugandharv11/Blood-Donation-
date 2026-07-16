package com.blooddonation.controller;

import com.blooddonation.dto.*;
import com.blooddonation.service.DonorService;
import com.blooddonation.util.AppConstants;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/**
 * REST controller for Donor operations.
 * GET /api/donors and /api/donors/search are public.
 * All mutations require authentication.
 */
@RestController
@RequestMapping("/api/donors")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    /**
     * GET /api/donors
     * Retrieve all donors with pagination and sorting.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<DonorResponse>>> getAllDonors(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success("Donors retrieved",
                donorService.getAllDonors(page, size, sortBy, sortDir)));
    }

    /**
     * GET /api/donors/search?bloodGroup=A+&city=Delhi&available=true
     * Search donors with filters.
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<DonorResponse>>> searchDonors(
            @RequestParam(required = false) String bloodGroup,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean available,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(ApiResponse.success("Search results",
                donorService.searchDonors(bloodGroup, city, available, page, size)));
    }

    /**
     * GET /api/donors/{id}
     * Get a specific donor by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DonorResponse>> getDonorById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Donor found", donorService.getDonorById(id)));
    }

    /**
     * GET /api/donors/user/{userId}
     * Get donor profile by user ID.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<DonorResponse>> getDonorByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(ApiResponse.success("Donor profile",
                donorService.getDonorByUserId(userId)));
    }

    /**
     * POST /api/donors
     * Create or update donor profile for the currently authenticated donor user.
     */
    @PostMapping
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<DonorResponse>> createDonorProfile(
            @Valid @RequestBody DonorRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Donor profile created",
                        donorService.createOrUpdateDonorProfileByEmail(userDetails.getUsername(), request)));
    }

    /**
     * PUT /api/donors/{id}
     * Update a donor profile. Donor can only update their own; admin can update any.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('DONOR') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<DonorResponse>> updateDonorProfile(
            @PathVariable Long id,
            @Valid @RequestBody DonorRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.success("Donor profile updated",
                donorService.updateDonorProfile(id, request, userDetails.getUsername())));
    }

    /**
     * PATCH /api/donors/{id}/availability
     * Toggle donor availability status.
     */
    @PatchMapping("/{id}/availability")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<Void>> toggleAvailability(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        donorService.toggleAvailability(id, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Availability status updated"));
    }

    /**
     * DELETE /api/donors/{id}
     * Delete a donor profile. Admin only.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteDonor(@PathVariable Long id) {
        donorService.deleteDonor(id);
        return ResponseEntity.ok(ApiResponse.success("Donor deleted successfully"));
    }

    /**
     * POST /api/donors/{id}/photo
     * Upload profile photo.
     */
    @PostMapping("/{id}/photo")
    @PreAuthorize("hasRole('DONOR')")
    public ResponseEntity<ApiResponse<String>> uploadPhoto(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserDetails userDetails) {
        String photoUrl = donorService.uploadProfilePhoto(id, file, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Photo uploaded", photoUrl));
    }
}
