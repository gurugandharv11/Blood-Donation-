package com.blooddonation.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Role entity representing user roles in the system.
 * Roles: ADMIN, DONOR, SEEKER
 */
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "name", nullable = false, unique = true, length = 20)
    private RoleName name;

    public enum RoleName {
        ROLE_ADMIN,
        ROLE_DONOR,
        ROLE_SEEKER
    }
}
