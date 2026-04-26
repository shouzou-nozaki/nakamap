package com.nakamap.backend.service;

import com.nakamap.backend.domain.entity.Circle;
import com.nakamap.backend.domain.entity.Membership;
import com.nakamap.backend.domain.entity.User;
import com.nakamap.backend.domain.repository.CircleRepository;
import com.nakamap.backend.domain.repository.EncounterRepository;
import com.nakamap.backend.domain.repository.LocationRepository;
import com.nakamap.backend.domain.repository.MembershipRepository;
import com.nakamap.backend.domain.repository.ProfileRepository;
import com.nakamap.backend.domain.repository.UserRepository;
import com.nakamap.backend.dto.request.CreateCircleRequest;
import com.nakamap.backend.dto.request.JoinCircleRequest;
import com.nakamap.backend.dto.request.UpdateCircleRequest;
import com.nakamap.backend.dto.response.CircleDetailResponse;
import com.nakamap.backend.dto.response.CircleResponse;
import com.nakamap.backend.exception.DuplicateResourceException;
import com.nakamap.backend.exception.ForbiddenException;
import com.nakamap.backend.exception.ResourceNotFoundException;
import com.nakamap.backend.exception.UnauthorizedException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CircleServiceTest {

    @Mock private CircleRepository circleRepository;
    @Mock private MembershipRepository membershipRepository;
    @Mock private UserRepository userRepository;
    @Mock private LocationRepository locationRepository;
    @Mock private ProfileRepository profileRepository;
    @Mock private EncounterRepository encounterRepository;

    @InjectMocks
    private CircleService circleService;

    // --- create ---

    @Test
    void create_正常系_サークルとadminメンバーシップが作成される() {
        CreateCircleRequest request = new CreateCircleRequest();
        request.setName("テストサークル");

        User user = new User();
        user.setUserId(1L);
        user.setEmail("admin@example.com");

        Circle saved = new Circle();
        saved.setCircleId(10L);
        saved.setName("テストサークル");
        saved.setJoinCode("ABC123");

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(circleRepository.save(any(Circle.class))).thenReturn(saved);

        CircleResponse response = circleService.create("admin@example.com", request);

        assertThat(response.getName()).isEqualTo("テストサークル");
        assertThat(response.getJoinCode()).isEqualTo("ABC123");
        verify(membershipRepository).save(any(Membership.class));
    }

    @Test
    void create_異常系_ユーザー不存在でUnauthorizedException() {
        when(userRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> circleService.create("unknown@example.com", new CreateCircleRequest()))
                .isInstanceOf(UnauthorizedException.class);
    }

    // --- join ---

    @Test
    void join_正常系_メンバーシップが作成される() {
        JoinCircleRequest request = new JoinCircleRequest();
        request.setJoinCode("ABC123");

        User user = new User();
        user.setUserId(2L);

        Circle circle = new Circle();
        circle.setCircleId(10L);
        circle.setName("テストサークル");
        circle.setJoinCode("ABC123");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(circleRepository.findByJoinCode("ABC123")).thenReturn(Optional.of(circle));
        when(membershipRepository.existsByUserIdAndCircleId(2L, 10L)).thenReturn(false);

        CircleResponse response = circleService.join("user@example.com", request);

        assertThat(response.getName()).isEqualTo("テストサークル");
        verify(membershipRepository).save(any(Membership.class));
    }

    @Test
    void join_異常系_招待コード不存在でResourceNotFoundException() {
        User user = new User();
        user.setUserId(1L);

        JoinCircleRequest request = new JoinCircleRequest();
        request.setJoinCode("INVALID");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(circleRepository.findByJoinCode("INVALID")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> circleService.join("user@example.com", request))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void join_異常系_既にメンバーならDuplicateResourceException() {
        User user = new User();
        user.setUserId(1L);

        Circle circle = new Circle();
        circle.setCircleId(10L);
        circle.setJoinCode("ABC123");

        JoinCircleRequest request = new JoinCircleRequest();
        request.setJoinCode("ABC123");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(user));
        when(circleRepository.findByJoinCode("ABC123")).thenReturn(Optional.of(circle));
        when(membershipRepository.existsByUserIdAndCircleId(1L, 10L)).thenReturn(true);

        assertThatThrownBy(() -> circleService.join("user@example.com", request))
                .isInstanceOf(DuplicateResourceException.class);
    }

    // --- updateName ---

    @Test
    void updateName_正常系_adminはサークル名を変更できる() {
        User user = new User();
        user.setUserId(1L);

        Membership membership = new Membership();
        membership.setRole("admin");

        Circle circle = new Circle();
        circle.setCircleId(10L);
        circle.setName("旧名称");
        circle.setJoinCode("ABC123");

        UpdateCircleRequest request = new UpdateCircleRequest();
        request.setName("新名称");

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(membershipRepository.findByUserIdAndCircleId(1L, 10L)).thenReturn(Optional.of(membership));
        when(circleRepository.findById(10L)).thenReturn(Optional.of(circle));
        when(circleRepository.save(any(Circle.class))).thenReturn(circle);

        CircleDetailResponse response = circleService.updateName("admin@example.com", 10L, request);

        assertThat(response.getName()).isEqualTo("新名称");
    }

    @Test
    void updateName_異常系_memberはForbiddenException() {
        User user = new User();
        user.setUserId(2L);

        Membership membership = new Membership();
        membership.setRole("member");

        UpdateCircleRequest request = new UpdateCircleRequest();
        request.setName("新名称");

        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(membershipRepository.findByUserIdAndCircleId(2L, 10L)).thenReturn(Optional.of(membership));

        assertThatThrownBy(() -> circleService.updateName("member@example.com", 10L, request))
                .isInstanceOf(ForbiddenException.class);
    }

    // --- deleteCircle ---

    @Test
    void deleteCircle_正常系_関連データがすべて削除される() {
        User user = new User();
        user.setUserId(1L);

        Membership membership = new Membership();
        membership.setRole("admin");

        Circle circle = new Circle();
        circle.setCircleId(10L);

        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(user));
        when(membershipRepository.findByUserIdAndCircleId(1L, 10L)).thenReturn(Optional.of(membership));
        when(circleRepository.findById(10L)).thenReturn(Optional.of(circle));

        circleService.deleteCircle("admin@example.com", 10L);

        verify(encounterRepository).deleteByCircleId(10L);
        verify(locationRepository).deleteByCircleId(10L);
        verify(profileRepository).deleteByCircleId(10L);
        verify(membershipRepository).deleteByCircleId(10L);
        verify(circleRepository).deleteById(10L);
    }

    @Test
    void deleteCircle_異常系_memberはForbiddenException() {
        User user = new User();
        user.setUserId(2L);

        Membership membership = new Membership();
        membership.setRole("member");

        when(userRepository.findByEmail("member@example.com")).thenReturn(Optional.of(user));
        when(membershipRepository.findByUserIdAndCircleId(2L, 10L)).thenReturn(Optional.of(membership));

        assertThatThrownBy(() -> circleService.deleteCircle("member@example.com", 10L))
                .isInstanceOf(ForbiddenException.class);
    }
}
