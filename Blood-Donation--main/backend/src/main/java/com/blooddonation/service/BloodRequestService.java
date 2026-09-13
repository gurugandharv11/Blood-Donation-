package com.blooddonation.service;

import com.blooddonation.dto.*;
import org.springframework.data.domain.Page;

/**
 * Service interface for BloodRequest operations.
 */
public interface BloodRequestService {

    BloodRequestResponse createRequest(BloodRequestDto dto, String seekerEmail);

    BloodRequestResponse getRequestById(Long id);

    Page<BloodRequestResponse> getAllRequests(int page, int size);

    Page<BloodRequestResponse> getRequestsBySeeker(String seekerEmail, int page, int size);

    Page<BloodRequestResponse> getRequestsByDonor(Long donorId, int page, int size);

    Page<BloodRequestResponse> getPendingRequests(int page, int size);

    BloodRequestResponse acceptRequest(Long requestId, String donorEmail);

    BloodRequestResponse rejectRequest(Long requestId, String donorEmail);

    BloodRequestResponse approveByAdmin(Long requestId);

    BloodRequestResponse rejectByAdmin(Long requestId);

    BloodRequestResponse completeRequest(Long requestId, String donorEmail);

    BloodRequestResponse cancelRequest(Long requestId, String seekerEmail);

    void deleteRequest(Long requestId);
}
