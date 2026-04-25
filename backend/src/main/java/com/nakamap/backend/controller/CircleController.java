package com.nakamap.backend.controller;

import com.nakamap.backend.dto.request.CreateCircleRequest;
import com.nakamap.backend.dto.request.JoinCircleRequest;
import com.nakamap.backend.dto.request.UpdateCircleRequest;
import com.nakamap.backend.dto.response.CircleDetailResponse;
import com.nakamap.backend.dto.response.CircleListItemResponse;
import com.nakamap.backend.dto.response.CircleResponse;
import com.nakamap.backend.service.CircleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/circles")
@RequiredArgsConstructor
public class CircleController {

    private final CircleService circleService;

    @PostMapping
    public ResponseEntity<CircleResponse> create(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody CreateCircleRequest request) {
        CircleResponse response = circleService.create(userDetails.getUsername(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/join")
    public ResponseEntity<CircleResponse> join(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody JoinCircleRequest request) {
        CircleResponse response = circleService.join(userDetails.getUsername(), request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{circleId}")
    public ResponseEntity<CircleDetailResponse> getDetail(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        CircleDetailResponse response = circleService.getDetail(userDetails.getUsername(), circleId);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<CircleListItemResponse>> getMyCircles(
            @AuthenticationPrincipal UserDetails userDetails) {
        List<CircleListItemResponse> response = circleService.getMyCircles(userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{circleId}")
    public ResponseEntity<CircleDetailResponse> updateName(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @Valid @RequestBody UpdateCircleRequest request) {
        CircleDetailResponse response = circleService.updateName(userDetails.getUsername(), circleId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{circleId}")
    public ResponseEntity<Void> deleteCircle(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        circleService.deleteCircle(userDetails.getUsername(), circleId);
        return ResponseEntity.noContent().build();
    }
}
