package com.ulearner.backend.service;

import com.ulearner.backend.domain.RefreshToken;
import com.ulearner.backend.domain.User;
import com.ulearner.backend.security.jwt.JwtToken;

public interface RefreshTokenService {

    RefreshToken store(User user, JwtToken refreshToken);

    RefreshToken getActiveToken(String token);

    RefreshToken rotate(User user, RefreshToken currentToken, JwtToken newToken);

    void revoke(RefreshToken token);

    void revokeByTokenValue(String token);
}
