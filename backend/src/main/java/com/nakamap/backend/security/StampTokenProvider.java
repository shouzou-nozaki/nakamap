package com.nakamap.backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
@Slf4j
public class StampTokenProvider {

    private static final long STAMP_TOKEN_TTL_MS = 5 * 60 * 1000L; // 5 minutes
    private static final String CLAIM_USER_ID = "uid";
    private static final String CLAIM_CIRCLE_ID = "cid";

    private final SecretKey key;

    public StampTokenProvider(@Value("${jwt.secret}") String secret) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateStampToken(Long userId, Long circleId) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + STAMP_TOKEN_TTL_MS);
        return Jwts.builder()
                .claim(CLAIM_USER_ID, userId)
                .claim(CLAIM_CIRCLE_ID, circleId)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    public StampClaims parseStampToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            Long userId = claims.get(CLAIM_USER_ID, Long.class);
            Long circleId = claims.get(CLAIM_CIRCLE_ID, Long.class);
            if (userId == null || circleId == null) {
                throw new IllegalArgumentException("Missing claims in stamp token");
            }
            return new StampClaims(userId, circleId);
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("Invalid stamp token: {}", e.getMessage());
            throw new IllegalArgumentException("Invalid or expired stamp token");
        }
    }

    public record StampClaims(Long userId, Long circleId) {}
}
