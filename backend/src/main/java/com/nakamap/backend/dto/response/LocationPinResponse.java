package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class LocationPinResponse {
    private Long userId;
    private String name;
    private String photoUrl;
    private BigDecimal displayLatitude;
    private BigDecimal displayLongitude;
}
