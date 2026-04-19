package com.nakamap.backend.domain.repository;

import com.nakamap.backend.domain.entity.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LocationRepository extends JpaRepository<Location, Long> {
    List<Location> findByCircleId(Long circleId);
    Optional<Location> findByUserIdAndCircleId(Long userId, Long circleId);
}
