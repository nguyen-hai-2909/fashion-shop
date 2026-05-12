package com.furniture.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-hours:8}") long expirationHours
    ) {
        byte[] raw = secret.getBytes(StandardCharsets.UTF_8);
        if (raw.length < 32) {
            raw = Arrays.copyOf(raw, 32);
        }
        this.key = Keys.hmacShaKeyFor(raw);
        this.expirationMs = expirationHours * 3600_000L;
    }

    public String createAccessToken(String userId) {
        String id = normalizeId(userId);
        if (id == null || id.isBlank()) {
            throw new IllegalStateException("Cannot issue JWT: missing user id");
        }
        Map<String, Object> claims = new HashMap<>();
        claims.put("id", id);
        return Jwts.builder()
                .claims(claims)
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    /** Admin tokens in Node used JSON.stringify(ObjectId); normalize to raw hex id. */
    public String createAdminToken(String adminId) {
        return createAccessToken(adminId);
    }

    public String createPasswordResetToken(String email) {
        return Jwts.builder()
                .claims(Map.of("email", email))
                .issuedAt(Date.from(Instant.now()))
                .expiration(Date.from(Instant.now().plusMillis(3600_000L)))
                .signWith(key)
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static String normalizeId(Object raw) {
        if (raw == null) {
            return null;
        }
        String s = raw.toString().trim();
        if (s.startsWith("\"") && s.endsWith("\"") && s.length() >= 2) {
            s = s.substring(1, s.length() - 1);
        }
        return s;
    }
}
