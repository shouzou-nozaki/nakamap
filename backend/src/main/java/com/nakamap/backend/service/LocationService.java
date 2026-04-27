package com.nakamap.backend.service;

import com.nakamap.backend.domain.entity.Location;
import com.nakamap.backend.domain.entity.Profile;
import com.nakamap.backend.domain.entity.User;
import com.nakamap.backend.domain.repository.LocationRepository;
import com.nakamap.backend.domain.repository.MembershipRepository;
import com.nakamap.backend.domain.repository.ProfileRepository;
import com.nakamap.backend.domain.repository.UserRepository;
import com.nakamap.backend.dto.request.LocationRequest;
import com.nakamap.backend.dto.response.LocationPinResponse;
import com.nakamap.backend.dto.response.LocationResponse;
import com.nakamap.backend.exception.DuplicateResourceException;
import com.nakamap.backend.exception.ForbiddenException;
import com.nakamap.backend.exception.ResourceNotFoundException;
import com.nakamap.backend.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationService {

    private static final double OFFSET_RANGE = 0.005;
    private final Random random = new Random();

    private final LocationRepository locationRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;

    @Transactional
    public LocationResponse register(String email, Long circleId, LocationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!membershipRepository.existsByUserIdAndCircleId(user.getUserId(), circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }

        if (locationRepository.findByUserIdAndCircleId(user.getUserId(), circleId).isPresent()) {
            throw new DuplicateResourceException("Location already registered for this circle");
        }

        BigDecimal offsetLat = applyOffset(request.getLatitude());
        BigDecimal offsetLon = applyOffset(request.getLongitude());

        Location location = new Location();
        location.setUserId(user.getUserId());
        location.setCircleId(circleId);
        location.setDisplayLatitude(offsetLat);
        location.setDisplayLongitude(offsetLon);
        Location saved = locationRepository.save(location);

        return LocationResponse.builder()
                .locationId(saved.getLocationId())
                .displayLatitude(saved.getDisplayLatitude())
                .displayLongitude(saved.getDisplayLongitude())
                .build();
    }

    @Transactional(readOnly = true)
    public LocationResponse getMyLocation(String email, Long circleId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!membershipRepository.existsByUserIdAndCircleId(user.getUserId(), circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }

        Location location = locationRepository.findByUserIdAndCircleId(user.getUserId(), circleId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        return LocationResponse.builder()
                .locationId(location.getLocationId())
                .displayLatitude(location.getDisplayLatitude())
                .displayLongitude(location.getDisplayLongitude())
                .build();
    }

    @Transactional
    public LocationResponse update(String email, Long circleId, LocationRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!membershipRepository.existsByUserIdAndCircleId(user.getUserId(), circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }

        Location location = locationRepository.findByUserIdAndCircleId(user.getUserId(), circleId)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        BigDecimal offsetLat = applyOffset(request.getLatitude());
        BigDecimal offsetLon = applyOffset(request.getLongitude());

        location.setDisplayLatitude(offsetLat);
        location.setDisplayLongitude(offsetLon);
        Location saved = locationRepository.save(location);

        return LocationResponse.builder()
                .locationId(saved.getLocationId())
                .displayLatitude(saved.getDisplayLatitude())
                .displayLongitude(saved.getDisplayLongitude())
                .build();
    }

    @Transactional(readOnly = true)
    public List<LocationPinResponse> getCircleLocations(String email, Long circleId) {
        User currentUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!membershipRepository.existsByUserIdAndCircleId(currentUser.getUserId(), circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }

        List<Location> locations = locationRepository.findByCircleId(circleId);

        List<Long> userIds = locations.stream().map(Location::getUserId).toList();
        Map<Long, User> userMap = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(User::getUserId, u -> u));

        return locations.stream().map(location -> {
            User user = userMap.get(location.getUserId());
            if (user == null) throw new ResourceNotFoundException("User not found: " + location.getUserId());
            return LocationPinResponse.builder()
                    .userId(user.getUserId())
                    .name(user.getName())
                    .photoUrl(user.getPhotoUrl())
                    .displayLatitude(location.getDisplayLatitude())
                    .displayLongitude(location.getDisplayLongitude())
                    .build();
        }).collect(Collectors.toList());
    }

    private BigDecimal applyOffset(BigDecimal value) {
        double offset = (random.nextDouble() * 2 - 1) * OFFSET_RANGE;
        return value.add(BigDecimal.valueOf(offset)).setScale(7, RoundingMode.HALF_UP);
    }
}
