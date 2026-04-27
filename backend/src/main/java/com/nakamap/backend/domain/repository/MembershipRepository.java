package com.nakamap.backend.domain.repository;

import com.nakamap.backend.domain.entity.Membership;
import com.nakamap.backend.dto.response.CircleListItemResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MembershipRepository extends JpaRepository<Membership, Long> {
    Optional<Membership> findByUserIdAndCircleId(Long userId, Long circleId);
    List<Membership> findByUserId(Long userId);
    boolean existsByUserIdAndCircleId(Long userId, Long circleId);
    long countByCircleId(Long circleId);
    void deleteByCircleId(Long circleId);

    @Query("""
            SELECT new com.nakamap.backend.dto.response.CircleListItemResponse(
                c.circleId, c.name, m.role,
                (SELECT COUNT(m2) FROM Membership m2 WHERE m2.circleId = c.circleId)
            )
            FROM Membership m JOIN Circle c ON m.circleId = c.circleId
            WHERE m.userId = :userId
            """)
    List<CircleListItemResponse> findCircleListByUserId(@Param("userId") Long userId);
}
