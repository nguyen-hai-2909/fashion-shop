package com.fashion.service;

import com.fashion.document.User;
import com.fashion.repository.UserRepository;
import com.fashion.util.AdminRoleUtil;
import com.fashion.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAuthorizationService {

    private final UserRepository userRepository;

    public User requireActor() {
        return AdminRoleUtil.loadActor(userRepository, AuthUtil.requireUserId());
    }

    public User requireAdmin() {
        User actor = requireActor();
        AdminRoleUtil.requireAdmin(actor);
        return actor;
    }

    public User requireAdminOrManager() {
        User actor = requireActor();
        AdminRoleUtil.requireAdminOrManager(actor);
        return actor;
    }
}
