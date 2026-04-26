package com.nakamap.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.ZoneId;

@Entity
@Table(name = "encounters")
@Getter
@Setter
@NoArgsConstructor
public class Encounter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "encounter_id")
    private Long encounterId;

    @Column(name = "circle_id", nullable = false)
    private Long circleId;

    @Column(name = "scanner_user_id", nullable = false)
    private Long scannerUserId;

    @Column(name = "target_user_id", nullable = false)
    private Long targetUserId;

    @Column(name = "met_at", nullable = false, updatable = false)
    private LocalDateTime metAt = LocalDateTime.now(ZoneId.of("Asia/Tokyo"));
}
