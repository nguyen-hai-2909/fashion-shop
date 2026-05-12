package com.furniture.security;

import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * BCrypt hashes start with {@code $2a$} / {@code $2b$} / {@code $2y$}. Legacy plain-text
 * passwords must not be passed to {@link PasswordEncoder#matches} or BCrypt throws.
 */
public final class PasswordMatch {

    private PasswordMatch() {}

    public static boolean matches(PasswordEncoder encoder, String raw, String stored) {
        if (raw == null || stored == null || stored.isBlank()) {
            return false;
        }
        if (stored.startsWith("$2")) {
            try {
                return encoder.matches(raw, stored);
            } catch (IllegalArgumentException e) {
                return false;
            }
        }
        return raw.equals(stored);
    }
}
