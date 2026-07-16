package com.blooddonation.service;

import com.blooddonation.dto.*;
import org.springframework.data.domain.Page;

/**
 * Service interface for Donor operations.
 */
public interface DonorService {

    DonorResponse createDonorProfile(Long userId, DonorRequest request);

    DonorResponse createOrUpdateDonorProfileByEmail(String email, DonorRequest request);

    DonorResponse updateDonorProfile(Long donorId, DonorRequest request, String currentUserEmail);

    DonorResponse getDonorById(Long donorId);

    DonorResponse getDonorByUserId(Long userId);

    Page<DonorResponse> getAllDonors(int page, int size, String sortBy, String sortDir);

    Page<DonorResponse> searchDonors(String bloodGroup, String city, Boolean available, int page, int size);

    void toggleAvailability(Long donorId, String currentUserEmail);

    void deleteDonor(Long donorId);

    String uploadProfilePhoto(Long donorId, org.springframework.web.multipart.MultipartFile file, String currentUserEmail);

    String uploadProfilePhotoByEmail(String email, org.springframework.web.multipart.MultipartFile file);
}
