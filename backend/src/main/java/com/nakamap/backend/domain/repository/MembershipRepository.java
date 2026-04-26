package com.nakamap.backend.domain.repository;

import com.nakamap.backend.domain.entity.Membership;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserIdAndCircleId(Long userId, Long circleId);
    List<Membership> findByUserId(Long userId);
    List<Membership> findByCircleId(Long circleId);
    boolean existsByUserIdAndCircleId(Long userId, Long circleId);
    long countByCircleId(Long circleId);
    void deleteByCircleId(Long circleId);
}
