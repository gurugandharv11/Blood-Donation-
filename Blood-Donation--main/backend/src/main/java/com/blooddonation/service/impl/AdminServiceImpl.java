package com.blooddonation.service.impl;

import com.blooddonation.dto.*;
import com.blooddonation.entity.*;
import com.blooddonation.exception.*;
import com.blooddonation.repository.*;
import com.blooddonation.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Implementation of AdminService providing dashboard stats and management actions.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final BloodRequestRepository requestRepository;
    private final DonationRepository donationRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalDonors = donorRepository.count();
        long availableDonors = donorRepository.countByAvailableTrue();
        long totalRequests = requestRepository.count();
        long pendingRequests = requestRepository.countByStatus(BloodRequest.RequestStatus.PENDING);
        long acceptedRequests = requestRepository.countByStatus(BloodRequest.RequestStatus.ACCEPTED);
        long completedDonations = requestRepository.countByStatus(BloodRequest.RequestStatus.COMPLETED);
        long rejectedRequests = requestRepository.countByStatus(BloodRequest.RequestStatus.REJECTED);
        long totalSeekers = userRepository.countByRoleName(Role.RoleName.ROLE_SEEKER);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalDonors(totalDonors)
                .availableDonors(availableDonors)
                .totalRequests(totalRequests)
                .pendingRequests(pendingRequests)
                .acceptedRequests(acceptedRequests)
                .completedDonations(completedDonations)
                .rejectedRequests(rejectedRequests)
                .totalSeekers(totalSeekers)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return userRepository.findAll(pageable).map(this::mapUserToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DonorResponse> getAllDonors(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        return donorRepository.findAll(pageable).map(this::mapDonorToResponse);
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        // Check not deleting last admin
        if (user.getRole().getName() == Role.RoleName.ROLE_ADMIN) {
            long adminCount = userRepository.countByRoleName(Role.RoleName.ROLE_ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Cannot delete the last admin user");
            }
        }
        userRepository.delete(user);
        log.info("Admin deleted user: {}", userId);
    }

    @Override
    @Transactional
    public void deleteDonor(Long donorId) {
        Donor donor = donorRepository.findById(donorId)
                .orElseThrow(() -> new ResourceNotFoundException("Donor", "id", donorId));
        donorRepository.delete(donor);
        log.info("Admin deleted donor: {}", donorId);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getAllRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return requestRepository.findAll(pageable).map(this::mapRequestToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<DonationResponse> getAllDonations(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return donationRepository.findAll(pageable).map(this::mapDonationToResponse);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setActive(!user.getActive());
        return mapUserToResponse(userRepository.save(user));
    }

    // --- Mapper helpers ---

    private UserResponse mapUserToResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().getName().name())
                .active(user.getActive())
                .profileImage(user.getProfileImage())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private DonorResponse mapDonorToResponse(Donor donor) {
        String profileImage = donor.getUser().getProfileImage();
        if (profileImage == null) profileImage = donor.getProfilePhoto();
        return DonorResponse.builder()
                .id(donor.getId())
                .userId(donor.getUser().getId())
                .name(donor.getUser().getName())
                .email(donor.getUser().getEmail())
                .phone(donor.getUser().getPhone())
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
                .build();
    }

    private BloodRequestResponse mapRequestToResponse(BloodRequest req) {
        return BloodRequestResponse.builder()
                .id(req.getId())
                .seekerId(req.getSeeker().getId())
                .seekerName(req.getSeeker().getName())
                .seekerImage(req.getSeeker().getProfileImage())
                .donorId(req.getDonor() != null ? req.getDonor().getId() : null)
                .donorName(req.getDonor() != null ? req.getDonor().getUser().getName() : null)
                .donorImage(req.getDonor() != null ? req.getDonor().getUser().getProfileImage() : null)
                .patientName(req.getPatientName())
                .bloodGroup(req.getBloodGroup())
                .unitsRequired(req.getUnitsRequired())
                .hospitalName(req.getHospitalName())
                .hospitalAddress(req.getHospitalAddress())
                .city(req.getCity())
                .contactNumber(req.getContactNumber())
                .urgency(req.getUrgency().name())
                .status(req.getStatus().name())
                .notes(req.getNotes())
                .createdAt(req.getCreatedAt())
                .updatedAt(req.getUpdatedAt())
                .build();
    }

    private DonationResponse mapDonationToResponse(Donation donation) {
        return DonationResponse.builder()
                .id(donation.getId())
                .donorId(donation.getDonor().getId())
                .donorName(donation.getDonor().getUser().getName())
                .bloodRequestId(donation.getBloodRequest().getId())
                .patientName(donation.getBloodRequest().getPatientName())
                .bloodGroup(donation.getBloodRequest().getBloodGroup())
                .hospitalName(donation.getBloodRequest().getHospitalName())
                .unitsDonated(donation.getUnitsDonated())
                .donationDate(donation.getDonationDate())
                .notes(donation.getNotes())
                .createdAt(donation.getCreatedAt())
                .build();
    }
}
