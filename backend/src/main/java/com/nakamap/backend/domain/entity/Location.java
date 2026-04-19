package com.nakamap.backend.domain.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "locations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "circle_id"}))
@Getter
@Setter
@NoArgsConstructor
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "location_id")
    private Long locationId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "circle_id", nullable = false)
    private Long circleId;

    @Column(name = "display_latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal displayLatitude;

    @Column(name = "display_longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal displayLongitude;
}
