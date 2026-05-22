package com.fashion.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Map;

public final class AuthUtil {

    private AuthUtil() {
    }

    public static String requireUserId() {
        String fromDetails = userIdFromDetails();
        if (fromDetails != null && !fromDetails.isBlank()) {
            return fromDetails;
        }
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getName() == null || auth.getName().isBlank()) {
            throw new IllegalStateException("Unauthorized");
        }
        return auth.getName();
    }

    @SuppressWarnings("unchecked")
    public static String userIdFromDetails() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || auth.getDetails() == null) {
            return auth != null ? auth.getName() : null;
        }
        if (auth.getDetails() instanceof Map<?, ?> m) {
            Object id = m.get("id");
            if (id != null && !id.toString().isBlank()) {
                return id.toString();
            }
        }
        return auth.getName();
    }
}
