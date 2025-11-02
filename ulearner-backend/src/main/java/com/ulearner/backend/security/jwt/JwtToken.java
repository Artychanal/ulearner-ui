package com.ulearner.backend.security.jwt;

import java.time.Instant;

public record JwtToken(String value, Instant expiresAt) {}
