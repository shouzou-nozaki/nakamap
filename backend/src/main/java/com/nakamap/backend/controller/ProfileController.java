package com.nakamap.backend.controller;

import com.nakamap.backend.dto.request.ProfileRequest;
import com.nakamap.backend.dto.response.ProfileResponse;
import com.nakamap.backend.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/circles/{circleId}/users")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponse> getProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @PathVariable Long userId) {
        ProfileResponse response = profileService.getProfile(userDetails.getUsername(), circleId, userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/me")
    public ResponseEntity<ProfileResponse> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long circleId,
            @RequestBody ProfileRequest request) {
        ProfileResponse response = profileService.updateProfile(userDetails.getUsername(), circleId, request);
        return ResponseEntity.ok(response);
    }
}
