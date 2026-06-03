package com.fashion.util;

import com.fashion.document.User;
import com.fashion.repository.UserRepository;

import java.util.Locale;

public final class AdminRoleUtil {

    public static final String ADMIN = "admin";
    public static final String MANAGER = "manager";
    public static final String STAFF = "staff";

    private AdminRoleUtil() {
    }

    public static User loadActor(UserRepository userRepository, String actorId) {
        return userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalStateException("Unauthorized"));
    }

    public static String normalizeRole(User user) {
        if (user == null || user.getRole() == null) {
            return "";
        }
        return user.getRole().trim().toLowerCase(Locale.ROOT);
    }

    public static String normalizeRole(String role) {
        return role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
    }

    public static boolean isAdmin(String role) {
        return ADMIN.equals(normalizeRole(role));
    }

    public static boolean isAdminOrManager(String role) {
        String r = normalizeRole(role);
        return ADMIN.equals(r) || MANAGER.equals(r);
    }

    public static void requireAdmin(User actor) {
        if (!isAdmin(normalizeRole(actor))) {
            throw new IllegalStateException("Only administrators can perform this action");
        }
    }

    public static void requireAdminOrManager(User actor) {
        if (!isAdminOrManager(normalizeRole(actor))) {
            throw new IllegalStateException("You do not have permission to perform this action");
        }
    }
}
