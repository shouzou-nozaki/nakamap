package com.nakamap.backend.service;

import com.nakamap.backend.domain.entity.Circle;
import com.nakamap.backend.domain.entity.Membership;
import com.nakamap.backend.domain.entity.User;
import com.nakamap.backend.domain.repository.CircleRepository;
import com.nakamap.backend.domain.repository.MembershipRepository;
import com.nakamap.backend.domain.repository.UserRepository;
import com.nakamap.backend.dto.request.CreateCircleRequest;
import com.nakamap.backend.dto.request.JoinCircleRequest;
import com.nakamap.backend.dto.response.CircleDetailResponse;
import com.nakamap.backend.dto.response.CircleListItemResponse;
import com.nakamap.backend.dto.response.CircleResponse;
import com.nakamap.backend.exception.DuplicateResourceException;
import com.nakamap.backend.exception.ForbiddenException;
import com.nakamap.backend.exception.ResourceNotFoundException;
import com.nakamap.backend.exception.UnauthorizedException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CircleService {

    private final CircleRepository circleRepository;
    private final MembershipRepository membershipRepository;
    private final UserRepository userRepository;

    @Transactional
    public CircleResponse create(String email, CreateCircleRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        String joinCode = UUID.randomUUID().toString()
                .replace("-", "")
                .substring(0, 6)
                .toUpperCase();

        Circle circle = new Circle();
        circle.setName(request.getName());
        circle.setJoinCode(joinCode);
        Circle saved = circleRepository.save(circle);

        Membership membership = new Membership();
        membership.setUserId(user.getUserId());
        membership.setCircleId(saved.getCircleId());
        membership.setRole("admin");
        membershipRepository.save(membership);

        return CircleResponse.builder()
                .circleId(saved.getCircleId())
                .name(saved.getName())
                .joinCode(saved.getJoinCode())
                .build();
    }

    @Transactional
    public CircleResponse join(String email, JoinCircleRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Circle circle = circleRepository.findByJoinCode(request.getJoinCode())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Circle not found with join code: " + request.getJoinCode()));

        if (membershipRepository.existsByUserIdAndCircleId(user.getUserId(), circle.getCircleId())) {
            throw new DuplicateResourceException("Already a member of this circle");
        }

        Membership membership = new Membership();
        membership.setUserId(user.getUserId());
        membership.setCircleId(circle.getCircleId());
        membership.setRole("member");
        membershipRepository.save(membership);

        return CircleResponse.builder()
                .circleId(circle.getCircleId())
                .name(circle.getName())
                .joinCode(circle.getJoinCode())
                .build();
    }

    @Transactional(readOnly = true)
    public CircleDetailResponse getDetail(String email, Long circleId) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        Membership membership = membershipRepository.findByUserIdAndCircleId(user.getUserId(), circleId)
                .orElseThrow(() -> new ForbiddenException("You are not a member of this circle"));

        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new ResourceNotFoundException("Circle not found: " + circleId));

        String joinCode = "admin".equals(membership.getRole()) ? circle.getJoinCode() : null;

        return CircleDetailResponse.builder()
                .circleId(circle.getCircleId())
                .name(circle.getName())
                .createdAt(circle.getCreatedAt())
                .joinCode(joinCode)
                .build();
    }

    @Transactional(readOnly = true)
    public List<CircleListItemResponse> getMyCircles(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        List<Membership> memberships = membershipRepository.findByUserId(user.getUserId());

        return memberships.stream().map(membership -> {
            Circle circle = circleRepository.findById(membership.getCircleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Circle not found: " + membership.getCircleId()));
            long memberCount = membershipRepository.countByCircleId(circle.getCircleId());

            return CircleListItemResponse.builder()
                    .circleId(circle.getCircleId())
                    .name(circle.getName())
                    .role(membership.getRole())
                    .memberCount(memberCount)
                    .build();
        }).collect(Collectors.toList());
    }
}
