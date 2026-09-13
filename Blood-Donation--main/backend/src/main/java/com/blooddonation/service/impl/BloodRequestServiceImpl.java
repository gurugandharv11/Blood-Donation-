package com.blooddonation.service.impl;

import com.blooddonation.dto.*;
import com.blooddonation.entity.*;
import com.blooddonation.exception.*;
import com.blooddonation.repository.*;
import com.blooddonation.service.BloodRequestService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Implementation of BloodRequestService managing the full request lifecycle.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class BloodRequestServiceImpl implements BloodRequestService {

    private final BloodRequestRepository requestRepository;
    private final UserRepository userRepository;
    private final DonorRepository donorRepository;
    private final DonationRepository donationRepository;

    // Helper: map BloodRequest entity to DTO
    private BloodRequestResponse mapToResponse(BloodRequest req) {
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

    @Override
    @Transactional
    public BloodRequestResponse createRequest(BloodRequestDto dto, String seekerEmail) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", seekerEmail));

        BloodRequest request = BloodRequest.builder()
                .seeker(seeker)
                .patientName(dto.getPatientName())
                .bloodGroup(dto.getBloodGroup())
                .unitsRequired(dto.getUnitsRequired())
                .hospitalName(dto.getHospitalName())
                .hospitalAddress(dto.getHospitalAddress())
                .city(dto.getCity())
                .contactNumber(dto.getContactNumber())
                .urgency(BloodRequest.Urgency.valueOf(dto.getUrgency()))
                .status(BloodRequest.RequestStatus.PENDING)
                .notes(dto.getNotes())
                .build();

        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional(readOnly = true)
    public BloodRequestResponse getRequestById(Long id) {
        return mapToResponse(requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood Request", "id", id)));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getAllRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return requestRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getRequestsBySeeker(String seekerEmail, int page, int size) {
        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", seekerEmail));
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return requestRepository.findBySeekerId(seeker.getId(), pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getRequestsByDonor(Long donorId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return requestRepository.findByDonorId(donorId, pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<BloodRequestResponse> getPendingRequests(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return requestRepository.findPendingRequests(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional
    public BloodRequestResponse acceptRequest(Long requestId, String donorEmail) {
        BloodRequest request = getRequestOrThrow(requestId);
        validateStatus(request, BloodRequest.RequestStatus.PENDING, "accept");

        User donorUser = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", donorEmail));
        Donor donor = donorRepository.findByUserId(donorUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile for user", "email", donorEmail));

        request.setDonor(donor);
        request.setStatus(BloodRequest.RequestStatus.ACCEPTED);
        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public BloodRequestResponse rejectRequest(Long requestId, String donorEmail) {
        BloodRequest request = getRequestOrThrow(requestId);
        validateStatus(request, BloodRequest.RequestStatus.ACCEPTED, "reject");

        User donorUser = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", donorEmail));
        Donor donor = donorRepository.findByUserId(donorUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile", "email", donorEmail));

        // Only the assigned donor can reject
        if (!request.getDonor().getId().equals(donor.getId())) {
            throw new UnauthorizedException("Only the assigned donor can reject this request");
        }

        request.setDonor(null);
        request.setStatus(BloodRequest.RequestStatus.PENDING);
        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public BloodRequestResponse approveByAdmin(Long requestId) {
        BloodRequest request = getRequestOrThrow(requestId);
        if (request.getStatus() == BloodRequest.RequestStatus.COMPLETED) {
            throw new BadRequestException("Request is already completed");
        }
        request.setStatus(BloodRequest.RequestStatus.ACCEPTED);
        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public BloodRequestResponse rejectByAdmin(Long requestId) {
        BloodRequest request = getRequestOrThrow(requestId);
        request.setStatus(BloodRequest.RequestStatus.REJECTED);
        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public BloodRequestResponse completeRequest(Long requestId, String donorEmail) {
        BloodRequest request = getRequestOrThrow(requestId);
        validateStatus(request, BloodRequest.RequestStatus.ACCEPTED, "complete");

        User donorUser = userRepository.findByEmail(donorEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", donorEmail));
        Donor donor = donorRepository.findByUserId(donorUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Donor profile", "email", donorEmail));

        // Create a donation record
        if (!donationRepository.existsByBloodRequestId(requestId)) {
            Donation donation = Donation.builder()
                    .donor(donor)
                    .bloodRequest(request)
                    .donationDate(LocalDate.now())
                    .unitsDonated(request.getUnitsRequired())
                    .build();
            donationRepository.save(donation);

            // Update donor's stats
            donor.setLastDonationDate(LocalDate.now());
            donor.setTotalDonations(donor.getTotalDonations() + 1);
            donorRepository.save(donor);
        }

        request.setStatus(BloodRequest.RequestStatus.COMPLETED);
        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public BloodRequestResponse cancelRequest(Long requestId, String seekerEmail) {
        BloodRequest request = getRequestOrThrow(requestId);

        User seeker = userRepository.findByEmail(seekerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", seekerEmail));

        if (!request.getSeeker().getId().equals(seeker.getId())) {
            throw new UnauthorizedException("You can only cancel your own requests");
        }

        if (request.getStatus() != BloodRequest.RequestStatus.PENDING) {
            throw new BadRequestException("Only PENDING requests can be cancelled");
        }

        request.setStatus(BloodRequest.RequestStatus.REJECTED);
        return mapToResponse(requestRepository.save(request));
    }

    @Override
    @Transactional
    public void deleteRequest(Long requestId) {
        BloodRequest request = getRequestOrThrow(requestId);
        requestRepository.delete(request);
    }

    private BloodRequest getRequestOrThrow(Long id) {
        return requestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blood Request", "id", id));
    }

    private void validateStatus(BloodRequest request,
                                BloodRequest.RequestStatus required, String action) {
        if (request.getStatus() != required) {
            throw new BadRequestException(
                    String.format("Cannot %s a request with status: %s", action, request.getStatus()));
        }
    }
}
