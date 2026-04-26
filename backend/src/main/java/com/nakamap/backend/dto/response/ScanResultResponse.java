package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ScanResultResponse {
    private String targetName;
    private String targetPhotoUrl;
    private int pointsEarned;
    private boolean firstMeeting;
    private boolean allMembersBonus;
}
