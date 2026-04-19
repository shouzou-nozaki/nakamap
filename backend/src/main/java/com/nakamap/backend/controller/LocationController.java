package com.nakamap.backend.controller;

import com.nakamap.backend.dto.request.LocationRequest;
import com.nakamap.backend.dto.response.LocationPinResponse;
import com.nakamap.backend.dto.response.LocationResponse;
import com.nakamap.backend.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/circles/{circleId}/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<LocationResponse> register(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @Valid @RequestBody LocationRequest request) {
        LocationResponse response = locationService.register(userDetails.getUsername(), circleId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<LocationPinResponse>> getCircleLocations(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        List<LocationPinResponse> response = locationService.getCircleLocations(userDetails.getUsername(), circleId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<LocationResponse> getMyLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId) {
        LocationResponse response = locationService.getMyLocation(userDetails.getUsername(), circleId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<LocationResponse> updateMyLocation(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @Valid @RequestBody LocationRequest request) {
        LocationResponse response = locationService.update(userDetails.getUsername(), circleId, request);
        return ResponseEntity.ok(response);
    }
}
