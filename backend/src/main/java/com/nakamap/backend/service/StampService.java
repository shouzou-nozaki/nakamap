package com.nakamap.backend.service;

import com.nakamap.backend.domain.entity.Circle;
import com.nakamap.backend.domain.entity.Encounter;
import com.nakamap.backend.domain.entity.User;
import com.nakamap.backend.domain.repository.CircleRepository;
import com.nakamap.backend.domain.repository.EncounterRepository;
import com.nakamap.backend.domain.repository.MembershipRepository;
import com.nakamap.backend.domain.repository.UserRepository;
import com.nakamap.backend.dto.response.EncounterHistoryResponse;
import com.nakamap.backend.dto.response.RankingEntryResponse;
import com.nakamap.backend.dto.response.ScanResultResponse;
import com.nakamap.backend.dto.response.StampQrResponse;
import com.nakamap.backend.exception.DuplicateResourceException;
import com.nakamap.backend.exception.ForbiddenException;
import com.nakamap.backend.exception.ResourceNotFoundException;
import com.nakamap.backend.exception.UnauthorizedException;
import com.nakamap.backend.security.StampTokenProvider;
import com.nakamap.backend.security.StampTokenProvider.StampClaims;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StampService {

    private static final int POINTS_FIRST_MEETING = 5;
    private static final int POINTS_REPEAT = 1;
    private static final int POINTS_ALL_MEMBERS_BONUS = 20;

    private final UserRepository userRepository;
    private final CircleRepository circleRepository;
    private final MembershipRepository membershipRepository;
    private final EncounterRepository encounterRepository;
    private final StampTokenProvider stampTokenProvider;

    @Transactional(readOnly = true)
    public StampQrResponse generateQr(String email, Long circleId) {
        User user = getUser(email);
        getCircleWithStampEnabled(circleId);
        requireMember(user.getUserId(), circleId);

        String token = stampTokenProvider.generateStampToken(user.getUserId(), circleId);
        return new StampQrResponse(token);
    }

    @Transactional
    public ScanResultResponse scan(String email, Long circleId, String token) {
        User scanner = getUser(email);
        getCircleWithStampEnabled(circleId);
        requireMember(scanner.getUserId(), circleId);

        StampClaims claims = stampTokenProvider.parseStampToken(token);

        if (!claims.circleId().equals(circleId)) {
            throw new IllegalArgumentException("QRコードのサークルが一致しません");
        }
        if (claims.userId().equals(scanner.getUserId())) {
            throw new IllegalArgumentException("自分のQRコードはスキャンできません");
        }

        requireMember(claims.userId(), circleId);

        User target = userRepository.findById(claims.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + claims.userId()));

        LocalDateTime startOfToday = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        if (!encounterRepository.findPairEncountersSince(circleId, scanner.getUserId(), target.getUserId(), startOfToday).isEmpty()) {
            throw new DuplicateResourceException("本日はすでにスキャン済みです");
        }

        boolean isFirst = encounterRepository.findPairEncounters(circleId, scanner.getUserId(), target.getUserId()).isEmpty();
        int points = isFirst ? POINTS_FIRST_MEETING : POINTS_REPEAT;

        Encounter encounter = new Encounter();
        encounter.setCircleId(circleId);
        encounter.setScannerUserId(scanner.getUserId());
        encounter.setTargetUserId(target.getUserId());
        encounterRepository.save(encounter);

        boolean allMembersBonus = checkAllMembersBonus(scanner.getUserId(), circleId);
        if (allMembersBonus) {
            points += POINTS_ALL_MEMBERS_BONUS;
        }

        return new ScanResultResponse(
                target.getName(),
                target.getPhotoUrl(),
                points,
                isFirst,
                allMembersBonus
        );
    }

    @Transactional(readOnly = true)
    public List<EncounterHistoryResponse> getHistory(String email, Long circleId) {
        User user = getUser(email);
        requireMember(user.getUserId(), circleId);

        LocalDateTime since = LocalDateTime.now().minusYears(1);
        List<Encounter> encounters = encounterRepository.findByCircleIdAndUserIdSince(circleId, user.getUserId(), since);

        Map<Long, User> userCache = new HashMap<>();

        return encounters.stream().map(e -> {
            Long partnerId = e.getScannerUserId().equals(user.getUserId())
                    ? e.getTargetUserId()
                    : e.getScannerUserId();
            User partner = userCache.computeIfAbsent(partnerId,
                    id -> userRepository.findById(id).orElse(null));
            if (partner == null) return null;

            boolean isFirst = encounters.stream()
                    .filter(prev -> prev.getMetAt().isBefore(e.getMetAt()) || prev.getEncounterId() < e.getEncounterId())
                    .noneMatch(prev -> {
                        Long prevPartner = prev.getScannerUserId().equals(user.getUserId())
                                ? prev.getTargetUserId() : prev.getScannerUserId();
                        return prevPartner.equals(partnerId);
                    });

            return new EncounterHistoryResponse(
                    e.getEncounterId(),
                    partner.getUserId(),
                    partner.getName(),
                    partner.getPhotoUrl(),
                    e.getMetAt(),
                    isFirst
            );
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EncounterHistoryResponse> getNewEncounters(String email, Long circleId, LocalDateTime since) {
        User user = getUser(email);
        requireMember(user.getUserId(), circleId);

        List<Encounter> encounters = encounterRepository.findNewEncountersForTarget(circleId, user.getUserId(), since);
        Map<Long, User> userCache = new HashMap<>();

        return encounters.stream().map(e -> {
            User scanner = userCache.computeIfAbsent(e.getScannerUserId(),
                    id -> userRepository.findById(id).orElse(null));
            if (scanner == null) return null;
            return new EncounterHistoryResponse(
                    e.getEncounterId(),
                    scanner.getUserId(),
                    scanner.getName(),
                    scanner.getPhotoUrl(),
                    e.getMetAt(),
                    false
            );
        }).filter(Objects::nonNull).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RankingEntryResponse> getRanking(String email, Long circleId) {
        User user = getUser(email);
        requireMember(user.getUserId(), circleId);

        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Encounter> monthlyEncounters = encounterRepository.findByCircleIdSince(circleId, startOfMonth);

        List<Long> memberIds = membershipRepository.findByCircleId(circleId).stream()
                .map(m -> m.getUserId())
                .toList();

        Map<Long, Integer> pointsMap = new HashMap<>();
        for (Long memberId : memberIds) {
            pointsMap.put(memberId, 0);
        }

        for (Long memberId : memberIds) {
            List<Encounter> userEncounters = monthlyEncounters.stream()
                    .filter(e -> e.getScannerUserId().equals(memberId) || e.getTargetUserId().equals(memberId))
                    .collect(Collectors.toList());

            Set<Long> metPartners = new HashSet<>();
            for (Encounter e : userEncounters) {
                Long partnerId = e.getScannerUserId().equals(memberId) ? e.getTargetUserId() : e.getScannerUserId();
                boolean alreadyCounted = metPartners.contains(partnerId);
                boolean isFirstEver = isFirstMeetingEver(circleId, memberId, partnerId, e.getMetAt());
                int pts = isFirstEver ? POINTS_FIRST_MEETING : POINTS_REPEAT;
                if (!alreadyCounted) {
                    pointsMap.merge(memberId, pts, Integer::sum);
                    metPartners.add(partnerId);
                }
            }

            boolean metAll = memberIds.stream()
                    .filter(id -> !id.equals(memberId))
                    .allMatch(metPartners::contains);
            if (metAll && !metPartners.isEmpty()) {
                pointsMap.merge(memberId, POINTS_ALL_MEMBERS_BONUS, Integer::sum);
            }
        }

        List<Map.Entry<Long, Integer>> sorted = pointsMap.entrySet().stream()
                .sorted(Map.Entry.<Long, Integer>comparingByValue().reversed())
                .toList();

        List<RankingEntryResponse> ranking = new ArrayList<>();
        int rank = 1;
        for (int i = 0; i < sorted.size(); i++) {
            if (i > 0 && !sorted.get(i).getValue().equals(sorted.get(i - 1).getValue())) {
                rank = i + 1;
            }
            Long memberId = sorted.get(i).getKey();
            User u = userRepository.findById(memberId).orElse(null);
            if (u != null) {
                ranking.add(new RankingEntryResponse(rank, u.getUserId(), u.getName(), u.getPhotoUrl(), sorted.get(i).getValue()));
            }
        }
        return ranking;
    }

    private boolean checkAllMembersBonus(Long userId, Long circleId) {
        LocalDateTime startOfMonth = LocalDateTime.now().withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        List<Long> otherMembers = membershipRepository.findByCircleId(circleId).stream()
                .map(m -> m.getUserId())
                .filter(id -> !id.equals(userId))
                .toList();
        if (otherMembers.isEmpty()) return false;

        List<Encounter> monthEncounters = encounterRepository.findByCircleIdAndUserIdSince(circleId, userId, startOfMonth);
        Set<Long> metThisMonth = monthEncounters.stream()
                .map(e -> e.getScannerUserId().equals(userId) ? e.getTargetUserId() : e.getScannerUserId())
                .collect(Collectors.toSet());

        return metThisMonth.containsAll(otherMembers);
    }

    private boolean isFirstMeetingEver(Long circleId, Long userA, Long userB, LocalDateTime before) {
        return encounterRepository.findPairEncounters(circleId, userA, userB).stream()
                .filter(e -> e.getMetAt().isBefore(before))
                .findAny()
                .isEmpty();
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("User not found"));
    }

    private Circle getCircleWithStampEnabled(Long circleId) {
        Circle circle = circleRepository.findById(circleId)
                .orElseThrow(() -> new ResourceNotFoundException("Circle not found: " + circleId));
        if (!circle.isStampEnabled()) {
            throw new ForbiddenException("スタンプ機能がこのサークルでは無効です");
        }
        return circle;
    }

    private void requireMember(Long userId, Long circleId) {
        if (!membershipRepository.existsByUserIdAndCircleId(userId, circleId)) {
            throw new ForbiddenException("You are not a member of this circle");
        }
    }
}
