package com.nakamap.backend.domain.repository;

import com.nakamap.backend.domain.entity.Circle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CircleRepository extends JpaRepository<Circle, Long> {
    Optional<Circle> findByJoinCode(String joinCode);
}
