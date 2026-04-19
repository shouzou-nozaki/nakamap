package com.nakamap.backend.service;

import com.nakamap.backend.domain.entity.User;
import com.nakamap.backend.domain.repository.UserRepository;
import com.nakamap.backend.dto.request.LoginRequest;
import com.nakamap.backend.dto.request.RegisterRequest;
import com.nakamap.backend.dto.response.AuthResponse;
import com.nakamap.backend.exception.DuplicateResourceException;
import com.nakamap.backend.exception.UnauthorizedException;
import com.nakamap.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        User saved = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(saved.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getUserId())
                .name(saved.getName())
                .photoUrl(saved.getPhotoUrl())
                .build();
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .photoUrl(user.getPhotoUrl())
                .build();
    }
}
