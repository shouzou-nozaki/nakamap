package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class RankingEntryResponse {
    private int rank;
    private Long userId;
    private String name;
    private String photoUrl;
    private int totalPoints;
}
