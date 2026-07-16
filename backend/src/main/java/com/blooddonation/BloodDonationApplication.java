package com.blooddonation;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Main entry point for the Blood Donation Platform application.
 * Spring Boot auto-configures the application context based on the classpath and annotations.
 */
@SpringBootApplication
public class BloodDonationApplication {

    public static void main(String[] args) {
        SpringApplication.run(BloodDonationApplication.class, args);
        System.out.println("=========================================");
        System.out.println("  Blood Donation Platform Started");
        System.out.println("  API Base URL: http://localhost:8080/api");
        System.out.println("=========================================");
    }
}
