package com.blooddonation.dto;

import lombok.*;

/**
 * DTO for dashboard statistics returned to admin/users.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsResponse {

    private long totalUsers;
    private long totalDonors;
    private long availableDonors;
    private long totalRequests;
    private long pendingRequests;
    private long acceptedRequests;
    private long completedDonations;
    private long rejectedRequests;
    private long totalSeekers;
}
