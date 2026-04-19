package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class CircleDetailResponse {
    private Long circleId;
    private String name;
    private LocalDateTime createdAt;
}
