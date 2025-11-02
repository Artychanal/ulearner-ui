package com.ulearner.backend.service.impl;

import com.ulearner.backend.domain.RefreshToken;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.repository.RefreshTokenRepository;
import com.ulearner.backend.security.jwt.JwtToken;
import com.ulearner.backend.service.RefreshTokenService;
import java.time.Instant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RefreshTokenServiceImpl implements RefreshTokenService {

    private final RefreshTokenRepository refreshTokenRepository;

    @Override
    @Transactional
    public RefreshToken store(User user, JwtToken refreshToken) {
        RefreshToken entity = RefreshToken.builder()
                .token(refreshToken.value())
                .expiresAt(refreshToken.expiresAt())
                .user(user)
                .build();
        return refreshTokenRepository.save(entity);
    }

    @Override
    public RefreshToken getActiveToken(String token) {
        RefreshToken stored = refreshTokenRepository
                .findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token not found"));

        if (stored.isRevoked()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has been revoked");
        }

        if (stored.getExpiresAt().isBefore(Instant.now())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Refresh token has expired");
        }

        return stored;
    }

    @Override
    @Transactional
    public RefreshToken rotate(User user, RefreshToken currentToken, JwtToken newToken) {
        revoke(currentToken);
        return store(user, newToken);
    }

    @Override
    @Transactional
    public void revoke(RefreshToken token) {
        if (token.isRevoked()) {
            return;
        }
        token.setRevoked(true);
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);
    }

    @Override
    @Transactional
    public void revokeByTokenValue(String token) {
        refreshTokenRepository
                .findByToken(token)
                .ifPresent(this::revoke);
    }

}
