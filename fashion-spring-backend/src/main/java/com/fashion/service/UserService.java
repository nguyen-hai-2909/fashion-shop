package com.fashion.service;

import com.fashion.document.User;
import com.fashion.repository.UserRepository;
import com.fashion.security.JwtService;
import com.fashion.security.PasswordMatch;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class UserService {
    private static final Pattern STRONG_PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$");
    private static final String PASSWORD_RULE_MESSAGE =
            "Password must be at least 8 characters and include uppercase, lowercase, number and special character.";

    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final MailService mailService;
    private final RestTemplate restTemplate;

    @Value("${app.url.reset-password}")
    private String resetPassUrl;

    @Value("${google.client-id:}")
    private String googleClientId;

    public List<User> getAllUsers(String name, String phoneNumber, String email) {
        Stream<User> stream = userRepository.findAll().stream()
                .filter(u -> !"admin".equalsIgnoreCase(u.getRole()));
        if (name != null && !name.isBlank()) {
            String n = name.toLowerCase();
            stream = stream.filter(u -> u.getFullName() != null && u.getFullName().toLowerCase().contains(n));
        }
        if (phoneNumber != null && !phoneNumber.isBlank()) {
            stream = stream.filter(u -> u.getPhone() != null && u.getPhone().contains(phoneNumber));
        }
        if (email != null && !email.isBlank()) {
            String e = email.toLowerCase();
            stream = stream.filter(u -> u.getEmail() != null && u.getEmail().toLowerCase().contains(e));
        }
        return stream.toList();
    }

    public Map<String, Object> createUser(Map<String, Object> body) {
        User u = new User();
        u.setPhone((String) body.get("phoneNumber"));
        u.setEmail((String) body.get("email"));
        u.setFullName(body.get("name") != null ? (String) body.get("name") : (String) body.get("full_name"));
        u.setRole("customer");
        String raw = (String) body.get("password");
        if (!isStrongPassword(raw)) {
            return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
        }
        u.setPassword(raw != null && raw.length() > 5 ? passwordEncoder.encode(raw) : raw);
        try {
            userRepository.save(u);
        } catch (DuplicateKeyException ex) {
            String msg = ex.getMessage() != null && ex.getMessage().contains("email")
                    ? "Your email is existed"
                    : "Your phone number is existed";
            return Map.of("success", false, "message", msg);
        }
        return Map.of("success", true, "message", "Create account successfully🎉🎉🎉!");
    }

    public Object getSingleUser(String id) {
        return userRepository.findById(id)
                .<Object>map(u -> u)
                .orElseGet(() -> Map.of("errCode", 1, "msg", "user is not exist!!!"));
    }

    public Object updateUser(String id, Map<String, Object> body) {
        User user = userRepository.findById(id).orElse(null);
        if (user == null) {
            return Map.of("errCode", 1, "msg", "user is not exist!!!");
        }
        if (body.containsKey("phoneNumber")) user.setPhone((String) body.get("phoneNumber"));
        if (body.containsKey("name")) user.setFullName((String) body.get("name"));
        if (body.containsKey("full_name")) user.setFullName((String) body.get("full_name"));
        if (body.containsKey("email")) user.setEmail((String) body.get("email"));
        if (body.containsKey("password")) {
            String raw = (String) body.get("password");
            if (!isStrongPassword(raw)) {
                return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
            }
            user.setPassword(raw != null && raw.length() > 5 ? passwordEncoder.encode(raw) : raw);
        }
        return userRepository.save(user);
    }

    public Object deleteUser(String id) {
        return userRepository.findById(id)
                .<Object>map(u -> {
                    userRepository.delete(u);
                    return u;
                })
                .orElseGet(() -> Map.of("errCode", 1, "msg", "user is not exist!!!"));
    }

    /** Login: email-first (supports legacy phoneNumber fallback). */
    public Map<String, Object> login(Map<String, String> body) {
        String phone = trimOrNull(body.get("phoneNumber"));
        // Accept both `email` and legacy `username` fields for email login.
        String email = trimOrNull(body.get("email"));
        if (email == null) email = trimOrNull(body.get("username"));

        if (email == null && (phone == null || phone.isBlank())) {
            return Map.of("success", false, "message", "Email is required!");
        }

        var userOpt = email != null && !email.isBlank()
                ? userRepository.findByEmail(email)
                : userRepository.findByPhone(phone);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "Email is not existed!");
        }
        User user = userOpt.get();
        if (!isCustomerRole(user.getRole())) {
            return Map.of("success", false, "message", "user is not exist!!!");
        }
        if (!PasswordMatch.matches(passwordEncoder, body.get("password"), user.getPassword())) {
            return Map.of("success", false, "message", "Password is not true!");
        }
        if (user.getId() == null || user.getId().isBlank()) {
            return Map.of("success", false, "message", "Account misconfigured");
        }
        String token = jwtService.createAccessToken(user.getId());
        return Map.of(
                "success", true,
                "user", toClientUser(user),
                "accessToken", token,
                "message", "Welcome back 🎉🎉🎉!!!"
        );
    }

    public Map<String, Object> sendMailForgot(String email) {
        var userOpt = userRepository.findByEmail(email);
        if (userOpt.isEmpty()) {
            return Map.of("success", false, "message", "Email is not existed!");
        }
        String t = jwtService.createPasswordResetToken(userOpt.get().getEmail());
        String link = resetPassUrl + (resetPassUrl.contains("?") ? "&" : "?") + "token=" + t;
        mailService.send(email, "Reset Password!!!", "Reset your password: " + link);
        return Map.of("success", true, "message", "Successfully _ Pls check your EMAIL!!!");
    }

    public Map<String, Object> resetPassword(String email, Map<String, String> body) {
        String raw = body.get("password");
        if (!isStrongPassword(raw)) {
            return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
        }
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setPassword(raw != null && raw.length() > 5 ? passwordEncoder.encode(raw) : raw);
        userRepository.save(user);
        return Map.of("success", true, "message", "Success!");
    }

    public Map<String, Object> editUser(String userId, Map<String, String> body) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("statusCode", 404, "message", "User is not found!!!", "success", false);
        }
        if (body.get("name") != null) user.setFullName(body.get("name"));
        if (body.get("address") != null) {
            // legacy single address → first address or new
            if (user.getAddresses().isEmpty()) {
                var a = new com.fashion.document.UserAddress();
                a.setId(new org.bson.types.ObjectId().toHexString());
                a.setLabel("Nhà");
                a.setRecipientName(user.getFullName());
                a.setPhone(user.getPhone());
                a.setAddress(body.get("address"));
                a.setCity("");
                a.setDistrict("");
                a.setIsDefault(true);
                user.getAddresses().add(a);
            } else {
                user.getAddresses().get(0).setAddress(body.get("address"));
            }
        }
        userRepository.save(user);
        User updated = userRepository.findById(userId).orElseThrow();
        return Map.of("statusCode", 200, "message", "Updated successful!", "user", toClientUser(updated), "success", true);
    }

    public Map<String, Object> changePassword(String userId, Map<String, String> body) {
        String newPassword = body.get("newPassword");
        if (!isStrongPassword(newPassword)) {
            return Map.of("statusCode", 400, "success", false, "message", PASSWORD_RULE_MESSAGE);
        }
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("statusCode", 404, "message", "User is not found!!!", "success", false);
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return Map.of("statusCode", 200, "success", true, "message", "Update password user successful!");
    }

    public Map<String, Object> getProfile(String userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return Map.of("success", false, "message", "user is not exist!!!");
        }
        return Map.of("success", true, "user", toClientUser(user), "message", "Success!");
    }

    /**
     * Xác minh Google ID token qua Google tokeninfo API, sau đó tìm hoặc tạo user.
     * Trả về cùng cấu trúc với login thông thường: { success, user, accessToken, message }.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> googleLogin(Map<String, String> body) {
        String credential = body.get("credential");
        if (credential == null || credential.isBlank()) {
            return Map.of("success", false, "message", "Google credential is required");
        }

        // Verify token với Google tokeninfo endpoint
        Map<String, Object> googleInfo;
        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + credential;
            googleInfo = restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            return Map.of("success", false, "message", "Invalid Google token");
        }

        if (googleInfo == null || googleInfo.containsKey("error")) {
            return Map.of("success", false, "message", "Failed to verify Google token");
        }

        // Kiểm tra audience (client ID) nếu đã cấu hình
        if (!googleClientId.isBlank()) {
            String aud = (String) googleInfo.get("aud");
            if (!googleClientId.equals(aud)) {
                return Map.of("success", false, "message", "Token audience mismatch");
            }
        }

        String email = (String) googleInfo.get("email");
        String name = (String) googleInfo.get("name");
        String picture = (String) googleInfo.get("picture");
        String googleSub = (String) googleInfo.get("sub");

        if (email == null || email.isBlank()) {
            return Map.of("success", false, "message", "Google account must have an email");
        }

        // Tìm user theo email hoặc tạo mới
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) {
            user = new User();
            user.setEmail(email);
            user.setFullName(name != null ? name : email);
            user.setAvatarUrl(picture);
            user.setGoogleId(googleSub);
            user.setRole("customer");
            try {
                user = userRepository.save(user);
            } catch (DuplicateKeyException ex) {
                user = userRepository.findByEmail(email).orElse(null);
                if (user == null) {
                    return Map.of("success", false, "message", "Failed to create account");
                }
            }
        } else {
            if (!isCustomerRole(user.getRole())) {
                return Map.of("success", false, "message", "user is not exist!!!");
            }
            boolean changed = false;
            if (user.getGoogleId() == null && googleSub != null) {
                user.setGoogleId(googleSub);
                changed = true;
            }
            if (user.getAvatarUrl() == null && picture != null) {
                user.setAvatarUrl(picture);
                changed = true;
            }
            if (changed) {
                userRepository.save(user);
            }
        }

        String token = jwtService.createAccessToken(user.getId());
        return Map.of(
                "success", true,
                "user", toClientUser(user),
                "accessToken", token,
                "message", "Welcome 🎉🎉🎉!!!"
        );
    }

    private Map<String, Object> toClientUser(User user) {
        Map<String, Object> m = new HashMap<>();
        m.put("_id", user.getId());
        m.put("id", user.getId());
        m.put("email", user.getEmail());
        m.put("phoneNumber", user.getPhone());
        m.put("phone", user.getPhone());
        m.put("name", user.getFullName());
        m.put("full_name", user.getFullName());
        m.put("fullName", user.getFullName());
        m.put("role", user.getRole());
        m.put("avatar_url", user.getAvatarUrl());
        var addresses = user.getAddresses();
        if (addresses == null) addresses = new java.util.ArrayList<>();
        m.put("addresses", addresses);
        String addr0 = addresses.isEmpty() ? "" : addresses.get(0).getAddress();
        m.put("address", addr0 != null ? addr0 : "");
        m.put("bank", "");
        m.put("creditCardNumber", "");
        m.put("createdAt", user.getCreatedAt());
        m.put("updatedAt", user.getUpdatedAt());
        return m;
    }

    private static boolean isCustomerRole(String role) {
        return role == null || role.isBlank() || "customer".equalsIgnoreCase(role.trim());
    }

    private static String trimOrNull(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static boolean isStrongPassword(String password) {
        return password != null && STRONG_PASSWORD_PATTERN.matcher(password).matches();
    }
}
