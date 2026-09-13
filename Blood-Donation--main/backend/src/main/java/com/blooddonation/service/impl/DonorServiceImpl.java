package com.blooddonation.service.impl;

import com.blooddonation.dto.*;
import com.blooddonation.entity.*;
import com.blooddonation.exception.*;
import com.blooddonation.repository.*;
import com.blooddonation.service.DonorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Implementation of DonorService with full CRUD, search, and photo upload.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DonorServiceImpl implements DonorService {

    private final DonorRepository donorRepository;
    private final UserRepository userRepository;

    @Value("${app.upload.dir}")
    private String uploadDir;

    // Helper: map Donor entity to DonorResponse DTO
    private DonorResponse mapToResponse(Donor donor) {
        User user = donor.getUser();
        // profileImage is canonically stored on the User entity
        String profileImage = user.getProfileImage();
        // fallback to donor-level photo for backward compat
        if (profileImage == null) profileImage = donor.getProfilePhoto();
        return DonorResponse.builder()
                .id(donor.getId())
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .bloodGroup(donor.getBloodGroup())
                .age(donor.getAge())
                .gender(donor.getGender())
                .city(donor.getCity())
                .address(donor.getAddress())
                .available(donor.getAvailable())
                .lastDonationDate(donor.getLastDonationDate())
                .profilePhoto(profileImage)
                .profileImage(profileImage)
                .totalDonations(donor.getTotalDonations())
                .updatedAt(donor.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public DonorResponse createDonorProfile(Long userId, DonorRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (donorRepository.existsByUserId(userId)) {
            throw new BadRequestException("Donor profile already exists for this user");
        }

        Donor donor = Donor.builder()
                .user(user)
                .bloodGroup(request.getBloodGroup())
                .age(request.getAge())
                .gender(request.getGender())
                .city(request.getCity())
                .address(request.getAddress())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .lastDonationDate(request.getLastDonationDate())
                .totalDonations(0)
                .build();

        return mapToResponse(donorRepository.save(donor));
    }

    @Override
    @Transactional
    public DonorResponse createOrUpdateDonorProfileByEmail(String email, DonorRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        Donor donor = donorRepository.findByUserId(user.getId()).orElse(null);
        if (donor != null) {
            donor.setBloodGroup(request.getBloodGroup());
            donor.setAge(request.getAge());
            donor.setGender(request.getGender());
            donor.setCity(request.getCity());
            donor.setAddress(request.getAddress());
            if (request.getAvailable() != null) donor.setAvailable(request.getAvailable());
            if (request.getLastDonationDate() != null) donor.setLastDonationDate(request.getLastDonationDate());
        } else {
            donor = Donor.builder()
                    .user(user).bloodGroup(request.getBloodGroup()).age(request.getAge())
                    .gender(request.getGender()).city(request.getCity()).address(request.getAddress())
                    .available(request.getAvailable() != null ? request.getAvailable() : true)
                    .lastDonationDate(request.getLastDonationDate()).totalDonations(0).build();
        }
        return mapToResponse(donorRepository.save(donor));
    }

    @Override
    @Transactional
    public DonorResponse updateDonorProfile(Long donorId, DonorRequest request, String currentUserEmail) {

        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "id", donorId));

        // Verify ownership or admin
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        boolean isAdmin = currentUser.getRole().getName() == Role.RoleName.ROLE_ADMIN;
        boolean isOwner = donor.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new UnauthorizedException("You are not authorized to update this donor profile");
        }

        donor.setBloodGroup(request.getBloodGroup());
        donor.setAge(request.getAge());
        donor.setGender(request.getGender());
        donor.setCity(request.getCity());
        donor.setAddress(request.getAddress());
        if (request.getAvailable() != null) {
            donor.setAvailable(request.getAvailable());
        }
        if (request.getLastDonationDate() != null) {
            donor.setLastDonationDate(request.getLastDonationDate());
        }

        return mapToResponse(donorRepository.save(donor));
    }

    @Override
    @Transactional(readOnly = true)
    public DonorResponse getDonorById(Long donorId) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "id", donorId));
        return mapToResponse(donor);
    }

    @Override
    @Transactional(readOnly = true)
    public DonorResponse getDonorByUserId(Long userId) {
        Donor donor = donorRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile", "userId", userId));
        return mapToResponse(donor);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DonorResponse> getAllDonors(int page, int size, String sortBy, String sortDir) {
        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        return donorRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DonorResponse> searchDonors(String bloodGroup, String city, Boolean available,
                                             int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        // Null out empty strings so JPQL IS NULL check works
        String bg = (bloodGroup != null && bloodGroup.isBlank()) ? null : bloodGroup;
        String ct = (city != null && city.isBlank()) ? null : city;
        return donorRepository.searchDonors(bg, ct, available, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void toggleAvailability(Long donorId, String currentUserEmail) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "id", donorId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        if (!donor.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only change your own availability");
        }

        donor.setAvailable(!donor.getAvailable());
        donorRepository.save(donor);
        log.info("Donor {} availability toggled to: {}", donorId, donor.getAvailable());
    }

    @Override
    @Transactional
    public void deleteDonor(Long donorId) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "id", donorId));
        donorRepository.delete(donor);
        log.info("Donor {} deleted", donorId);
    }

    @Override
    @Transactional
    public String uploadProfilePhoto(Long donorId, MultipartFile file, String currentUserEmail) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "id", donorId));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", currentUserEmail));

        if (!donor.getUser().getId().equals(currentUser.getId())) {
            throw new UnauthorizedException("You can only upload your own profile photo");
        }

        // Validate file type — only JPG, JPEG, PNG, WEBP allowed
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png")
                && !contentType.equals("image/webp"))) {
            throw new BadRequestException("Only JPG, JPEG, PNG, or WEBP images are allowed");
        }

        // Validate file size — max 5 MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 5 MB");
        }

        try {
            // Create upload directory if not exists
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Generate unique filename
            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : ".jpg";
            String filename = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/uploads/profile-photos/" + filename;

            // Save on donor (backward compat) AND on user (canonical source for all users)
            donor.setProfilePhoto(photoUrl);
            donorRepository.save(donor);

            currentUser.setProfileImage(photoUrl);
            userRepository.save(currentUser);

            log.info("Profile photo uploaded for user: {} -> {}", currentUserEmail, photoUrl);
            return photoUrl;
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload photo: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public String uploadProfilePhotoByEmail(String email, MultipartFile file) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Validate file type
        String contentType = file.getContentType();
        if (contentType == null || (!contentType.equals("image/jpeg") && !contentType.equals("image/png")
                && !contentType.equals("image/webp"))) {
            throw new BadRequestException("Only JPG, JPEG, PNG, or WEBP images are allowed");
        }

        // Validate file size — max 5 MB
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size must not exceed 5 MB");
        }

        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalFilename = file.getOriginalFilename();
            String extension = (originalFilename != null && originalFilename.contains("."))
                    ? originalFilename.substring(originalFilename.lastIndexOf('.'))
                    : ".jpg";
            String filename = UUID.randomUUID() + extension;
            Path filePath = uploadPath.resolve(filename);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            String photoUrl = "/uploads/profile-photos/" + filename;
            user.setProfileImage(photoUrl);
            userRepository.save(user);

            // Also update donor record if user is a donor
            donorRepository.findByUserId(user.getId()).ifPresent(donor -> {
                donor.setProfilePhoto(photoUrl);
                donorRepository.save(donor);
            });

            log.info("Profile photo uploaded for all-user endpoint: {} -> {}", email, photoUrl);
            return photoUrl;
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload photo: " + e.getMessage());
        }
    }
}
