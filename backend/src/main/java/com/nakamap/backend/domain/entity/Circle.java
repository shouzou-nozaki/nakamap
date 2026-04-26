package com.nakamap.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "circles")
@Getter
@Setter
@NoArgsConstructor
public class Circle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "circle_id")
    private Long circleId;

    @Column(nullable = false)
    private String name;

    @Column(name = "join_code", nullable = false, unique = true)
    private String joinCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));

    @Column(name = "stamp_enabled", nullable = false)
    private boolean stampEnabled = false;
}
