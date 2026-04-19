package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class LocationResponse {
    private Long locationId;
    private BigDecimal displayLatitude;
    private BigDecimal displayLongitude;
}
