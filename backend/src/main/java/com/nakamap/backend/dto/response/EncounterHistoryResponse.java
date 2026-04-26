package com.nakamap.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@AllArgsConstructor
public class EncounterHistoryResponse {
    private Long encounterId;
    private Long partnerUserId;
    private String partnerName;
    private String partnerPhotoUrl;
    private LocalDateTime metAt;
    private boolean firstMeeting;
}
