package com.blooddonation.util;

/**
 * Application-wide constants.
 */
public final class AppConstants {

    private AppConstants() {}

    // Pagination
    public static final int DEFAULT_PAGE_NUMBER = 0;
    public static final int DEFAULT_PAGE_SIZE = 10;
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIR = "asc";

    // Blood Groups
    public static final String[] BLOOD_GROUPS = {"A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"};

    // Request Status
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_ACCEPTED = "ACCEPTED";
    public static final String STATUS_REJECTED = "REJECTED";
    public static final String STATUS_COMPLETED = "COMPLETED";

    // Urgency Levels
    public static final String URGENCY_CRITICAL = "CRITICAL";
    public static final String URGENCY_HIGH = "HIGH";
    public static final String URGENCY_MEDIUM = "MEDIUM";
    public static final String URGENCY_LOW = "LOW";

    // Upload
    public static final String UPLOAD_DIR = "uploads/profile-photos/";
    public static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
}
