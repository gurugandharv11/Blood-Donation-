package com.blooddonation.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Configures static resource serving for uploaded files (profile photos).
 * Maps URL path /uploads/** to the physical upload directory on disk.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded profile photos at /uploads/profile-photos/filename.jpg
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + uploadDir + "/../");
    }
}
