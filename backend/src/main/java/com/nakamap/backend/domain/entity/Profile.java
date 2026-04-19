package com.nakamap.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "profiles",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "circle_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "circle_id", nullable = false)
    private Long circleId;

    @Column(length = 500)
    private String hobby;

    @Column(length = 1000)
    private String comment;
}
