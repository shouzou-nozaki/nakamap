package com.nakamap.backend.domain.repository;

import com.nakamap.backend.domain.entity.Encounter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface EncounterRepository extends JpaRepository<Encounter, Long> {

    List<Encounter> findByCircleIdAndScannerUserIdOrderByMetAtDesc(Long circleId, Long scannerUserId);

    List<Encounter> findByCircleIdAndTargetUserIdOrderByMetAtDesc(Long circleId, Long targetUserId);

    @Query("""
        SELECT e FROM Encounter e
        WHERE e.circleId = :circleId
          AND ((e.scannerUserId = :userId) OR (e.targetUserId = :userId))
          AND e.metAt >= :since
        ORDER BY e.metAt DESC
        """)
    List<Encounter> findByCircleIdAndUserIdSince(
            @Param("circleId") Long circleId,
            @Param("userId") Long userId,
            @Param("since") LocalDateTime since);

    @Query("""
        SELECT e FROM Encounter e
        WHERE e.circleId = :circleId
          AND ((e.scannerUserId = :userA AND e.targetUserId = :userB)
            OR (e.scannerUserId = :userB AND e.targetUserId = :userA))
        """)
    List<Encounter> findPairEncounters(
            @Param("circleId") Long circleId,
            @Param("userA") Long userA,
            @Param("userB") Long userB);

    @Query("""
        SELECT e FROM Encounter e
        WHERE e.circleId = :circleId
          AND e.metAt >= :since
        """)
    List<Encounter> findByCircleIdSince(
            @Param("circleId") Long circleId,
            @Param("since") LocalDateTime since);

    void deleteByCircleId(Long circleId);
}
