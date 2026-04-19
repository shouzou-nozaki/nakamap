package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class CircleListItemResponse {
    private Long circleId;
    private String name;
    private String role;
    private long memberCount;
}
