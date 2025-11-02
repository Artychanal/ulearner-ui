package com.ulearner.backend.security.jwt;

import com.ulearner.backend.security.UserPrincipal;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;
import java.util.Optional;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {

    private static final String DEFAULT_SECRET = "Wm1Kc2d2N3B5QnR4c0pDbE1uU3ZQdXJ5dE1LbE5TS1Q=";
    private static final Duration DEFAULT_ACCESS_TOKEN_EXPIRATION = Duration.ofMinutes(15);
    private static final Duration DEFAULT_REFRESH_TOKEN_EXPIRATION = Duration.ofDays(7);

    private final JwtProperties properties;
    private final Key signingKey;

    public JwtTokenService(JwtProperties properties) {
        this.properties = properties;
        String secret = Optional.ofNullable(properties.secret())
                .filter(value -> !value.isBlank())
                .orElse(DEFAULT_SECRET);
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public JwtToken generateAccessToken(UserPrincipal principal) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", principal.getRoleNames());
        return buildToken(claims, principal.getUsername(), getAccessTokenExpiration(), JwtTokenType.ACCESS);
    }

    public JwtToken generateRefreshToken(UserPrincipal principal) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", principal.getRoleNames());
        return buildToken(claims, principal.getUsername(), getRefreshTokenExpiration(), JwtTokenType.REFRESH);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Instant extractExpiration(String token) {
        return extractClaim(token, claims -> claims.getExpiration().toInstant());
    }

    public boolean isTokenValid(String token, UserPrincipal principal) {
        String username = extractUsername(token);
        return username.equals(principal.getUsername())
                && !isTokenExpired(token)
                && JwtTokenType.ACCESS.name().equalsIgnoreCase(extractTokenType(token));
    }

    public boolean isRefreshToken(String token) {
        return JwtTokenType.REFRESH.name().equalsIgnoreCase(extractTokenType(token));
    }

    public boolean isTokenExpired(String token) {
        return extractExpiration(token).isBefore(Instant.now());
    }

    public void validateRefreshTokenOrThrow(String token) {
        if (!isRefreshToken(token)) {
            throw new JwtException("Token is not a refresh token");
        }
        if (isTokenExpired(token)) {
            throw new JwtException("Refresh token has expired");
        }
    }

    private JwtToken buildToken(
            Map<String, Object> extraClaims,
            String subject,
            Duration expiration,
            JwtTokenType tokenType) {
        Instant now = Instant.now();
        Instant expiresAt = now.plus(expiration);
        Map<String, Object> claims = new HashMap<>(extraClaims);
        claims.put("type", tokenType.name());
        Date issuedAt = Date.from(now);
        Date expiryDate = Date.from(expiresAt);
        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setId(UUID.randomUUID().toString())
                .setIssuedAt(issuedAt)
                .setExpiration(expiryDate)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
        return new JwtToken(token, expiresAt);
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = parseToken(token).getBody();
        return claimsResolver.apply(claims);
    }

    private String extractTokenType(String token) {
        return extractClaim(token, claims -> claims.get("type", String.class));
    }

    private Jws<Claims> parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token);
    }

    private Duration getAccessTokenExpiration() {
        return Optional.ofNullable(properties.accessTokenExpiration()).orElse(DEFAULT_ACCESS_TOKEN_EXPIRATION);
    }

    private Duration getRefreshTokenExpiration() {
        return Optional.ofNullable(properties.refreshTokenExpiration()).orElse(DEFAULT_REFRESH_TOKEN_EXPIRATION);
    }
}
