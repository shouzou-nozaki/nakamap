package com.nakamap.backend.domain.repository;

import com.nakamap.backend.domain.entity.Profile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    Optional<Profile> findByUserIdAndCircleId(Long userId, Long circleId);
    void deleteByCircleId(Long circleId);
}
