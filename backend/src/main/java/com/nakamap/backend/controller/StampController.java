package com.nakamap.backend.controller;

import com.nakamap.backend.dto.request.ScanStampRequest;
import com.nakamap.backend.dto.response.EncounterHistoryResponse;
import com.nakamap.backend.dto.response.RankingEntryResponse;
import com.nakamap.backend.dto.response.ScanResultResponse;
import com.nakamap.backend.dto.response.StampQrResponse;
import com.nakamap.backend.service.StampService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

import java.util.List;

@RestController
@RequestMapping("/circles/{circleId}/stamp")
@RequiredArgsConstructor
public class StampController {

    private final StampService stampService;

    @GetMapping("/qr")
    public ResponseEntity<StampQrResponse> generateQr(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        return ResponseEntity.ok(stampService.generateQr(userDetails.getUsername(), circleId));
    }

    @PostMapping("/scan")
    public ResponseEntity<ScanResultResponse> scan(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @Valid @RequestBody ScanStampRequest request) {
        return ResponseEntity.ok(stampService.scan(userDetails.getUsername(), circleId, request.getToken()));
    }

    @GetMapping("/history")
    public ResponseEntity<List<EncounterHistoryResponse>> getHistory(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        return ResponseEntity.ok(stampService.getHistory(userDetails.getUsername(), circleId));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<RankingEntryResponse>> getRanking(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        return ResponseEntity.ok(stampService.getRanking(userDetails.getUsername(), circleId));
    }

    @GetMapping("/new-encounters")
    public ResponseEntity<List<EncounterHistoryResponse>> getNewEncounters(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        return ResponseEntity.ok(stampService.getNewEncounters(userDetails.getUsername(), circleId, since));
    }
}
