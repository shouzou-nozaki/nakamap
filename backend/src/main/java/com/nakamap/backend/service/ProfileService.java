package com.nakamap.backend.service;

import com.nakamap.backend.domain.entity.Profile;
import com.nakamap.backend.domain.entity.User;
import com.nakamap.backend.domain.repository.MembershipRepository;
import com.nakamap.backend.domain.repository.ProfileRepository;
import com.nakamap.backend.domain.repository.UserRepository;
import com.nakamap.backend.dto.request.ProfileRequest;
import com.nakamap.backend.dto.response.ProfileResponse;
import com.nakamap.backend.exception.ForbiddenException;
import com.nakamap.backend.exception.ResourceNotFoundException;
import com.nakamap.backend.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final MembershipRepository membershipRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email, Long circleId, Long targetUserId) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!membershipRepository.existsByUserIdAndCircleId(currentUser.getUserId(), circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }

        if (!membershipRepository.existsByUserIdAndCircleId(targetUserId, circleId)) {
            throw new ForbiddenException("Target user is not a member of this circle");
        }

        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + targetUserId));

        Profile profile = profileRepository.findByUserIdAndCircleId(targetUserId, circleId)
                .orElse(null);

        String hobby = profile != null ? profile.getHobby() : null;
        String comment = profile != null ? profile.getComment() : null;

        return ProfileResponse.builder()
                .userId(targetUser.getUserId())
                .name(targetUser.getName())
                .photoUrl(targetUser.getPhotoUrl())
                .hobby(hobby)
                .comment(comment)
                .build();
    }

    @Transactional
    public ProfileResponse updateProfile(String email, Long circleId, ProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!membershipRepository.existsByUserIdAndCircleId(user.getUserId(), circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }

        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhotoUrl() != null) {
            user.setPhotoUrl(request.getPhotoUrl());
        }
        userRepository.save(user);

        Profile profile = profileRepository.findByUserIdAndCircleId(user.getUserId(), circleId)
                .orElseGet(() -> {
                    Profile p = new Profile();
                    p.setUserId(user.getUserId());
                    p.setCircleId(circleId);
                    return p;
                });

        if (request.getHobby() != null) {
            profile.setHobby(request.getHobby());
        }
        if (request.getComment() != null) {
            profile.setComment(request.getComment());
        }
        profileRepository.save(profile);

        return ProfileResponse.builder()
                .userId(user.getUserId())
                .name(user.getName())
                .photoUrl(user.getPhotoUrl())
                .hobby(profile.getHobby())
                .comment(profile.getComment())
                .build();
    }
}
