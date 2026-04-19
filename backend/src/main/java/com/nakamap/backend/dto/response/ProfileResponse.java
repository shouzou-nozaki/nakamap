package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class ProfileResponse {
    private Long userId;
    private String name;
    private String photoUrl;
    private String hobby;
    private String comment;
}
