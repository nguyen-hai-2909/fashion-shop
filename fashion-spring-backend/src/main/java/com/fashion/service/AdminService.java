package com.fashion.service;

import com.fashion.document.Order;
import com.fashion.document.Product;
import com.fashion.document.User;
import com.fashion.repository.OrderRepository;
import com.fashion.repository.ProductRepository;
import com.fashion.repository.UserRepository;
import com.fashion.security.JwtService;
import com.fashion.security.PasswordMatch;
import com.fashion.util.AdminRoleUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class AdminService {

    private static final List<String> ENUM_STATUS = List.of("pending", "confirmed", "shipping", "delivered", "cancelled");
    private static final List<String> STAFF_ROLES = List.of("manager", "staff");
    private static final Pattern STRONG_PASSWORD_PATTERN =
            Pattern.compile("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z\\d]).{8,}$");
    private static final String PASSWORD_RULE_MESSAGE =
            "Password must be at least 8 characters and include uppercase, lowercase, number and special character.";

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public Map<String, Object> createAdmin(Map<String, Object> body) {
        User u = new User();
        u.setPhone((String) body.get("phoneNumber"));
        u.setEmail((String) body.get("email"));
        u.setFullName((String) body.get("name"));
        u.setRole("admin");
        String raw = (String) body.get("password");
        if (!isStrongPassword(raw)) {
            return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
        }
        u.setPassword(raw != null && raw.length() > 5 ? passwordEncoder.encode(raw) : raw);
        User saved = userRepository.save(u);
        return toAdminMap(saved);
    }

    public Map<String, Object> staffList(String actorId, String q) {
        return staffList(requireActor(actorId), q);
    }

    private Map<String, Object> staffList(User actor, String q) {
        requireStaffManagement(actor);
        String ql = q != null ? q.trim().toLowerCase(Locale.ROOT) : "";
        List<Map<String, Object>> rows = userRepository.findAll().stream()
                .filter(u -> STAFF_ROLES.contains(normalizeRole(u.getRole())))
                .filter(u -> ql.isBlank()
                        || contains(u.getEmail(), ql)
                        || contains(u.getFullName(), ql)
                        || contains(u.getPhone(), ql))
                .map(this::toStaffMap)
                .toList();
        return Map.of("success", true, "message", "Success", "data", rows);
    }

    public Map<String, Object> createStaff(String actorId, Map<String, Object> body) {
        requireStaffManagement(requireActor(actorId));
        String email = Objects.toString(body.get("email"), "").trim().toLowerCase(Locale.ROOT);
        String role = normalizeRole(Objects.toString(body.get("role"), "staff"));
        if (!STAFF_ROLES.contains(role)) {
            return Map.of("success", false, "message", "Invalid staff role");
        }
        if (email.isBlank()) {
            return Map.of("success", false, "message", "Email is required");
        }
        if (!userRepository.findAllByEmail(email).isEmpty()) {
            return Map.of("success", false, "message", "Email already exists");
        }
        String raw = Objects.toString(body.get("password"), "");
        if (!isStrongPassword(raw)) {
            return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
        }
        User u = new User();
        u.setEmail(email);
        u.setPhone(Objects.toString(body.get("phoneNumber"), "").trim());
        u.setFullName(Objects.toString(body.get("name"), "").trim());
        u.setRole(role);
        u.setLocked(Boolean.TRUE.equals(body.get("locked")));
        u.setPassword(passwordEncoder.encode(raw));
        User saved = userRepository.save(u);
        return Map.of("success", true, "message", "Staff created", "data", toStaffMap(saved));
    }

    public Map<String, Object> updateStaff(String actorId, String staffId, Map<String, Object> body) {
        requireStaffManagement(requireActor(actorId));
        User u = userRepository.findById(staffId).orElse(null);
        if (u == null || !STAFF_ROLES.contains(normalizeRole(u.getRole()))) {
            return Map.of("success", false, "message", "Staff not found");
        }
        if (body.containsKey("name")) {
            u.setFullName(Objects.toString(body.get("name"), "").trim());
        }
        if (body.containsKey("phoneNumber")) {
            u.setPhone(Objects.toString(body.get("phoneNumber"), "").trim());
        }
        if (body.containsKey("email")) {
            String email = Objects.toString(body.get("email"), "").trim().toLowerCase(Locale.ROOT);
            if (!email.isBlank() && !email.equalsIgnoreCase(u.getEmail())) {
                if (!userRepository.findAllByEmail(email).isEmpty()) {
                    return Map.of("success", false, "message", "Email already exists");
                }
                u.setEmail(email);
            }
        }
        if (body.containsKey("role")) {
            String role = normalizeRole(Objects.toString(body.get("role"), u.getRole()));
            if (!STAFF_ROLES.contains(role)) {
                return Map.of("success", false, "message", "Invalid staff role");
            }
            u.setRole(role);
        }
        if (body.containsKey("locked")) {
            u.setLocked(Boolean.TRUE.equals(body.get("locked")));
        }
        String raw = Objects.toString(body.get("password"), "").trim();
        if (!raw.isBlank()) {
            if (!isStrongPassword(raw)) {
                return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
            }
            u.setPassword(passwordEncoder.encode(raw));
        }
        userRepository.save(u);
        return Map.of("success", true, "message", "Staff updated", "data", toStaffMap(u));
    }

    public Map<String, Object> deleteStaff(String actorId, String staffId) {
        requireStaffManagement(requireActor(actorId));
        User u = userRepository.findById(staffId).orElse(null);
        if (u == null || !STAFF_ROLES.contains(normalizeRole(u.getRole()))) {
            return Map.of("success", false, "message", "Staff not found");
        }
        userRepository.deleteById(staffId);
        return Map.of("success", true, "message", "Staff deleted");
    }

    private User requireActor(String actorId) {
        return userRepository.findById(actorId)
                .orElseThrow(() -> new IllegalStateException("Unauthorized"));
    }

    private void requireStaffManagement(User actor) {
        AdminRoleUtil.requireAdmin(actor);
    }

    private static String normalizeRole(String role) {
        return role == null ? "" : role.trim().toLowerCase(Locale.ROOT);
    }

    private static boolean contains(String value, String ql) {
        return value != null && value.toLowerCase(Locale.ROOT).contains(ql);
    }

    private Map<String, Object> toStaffMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", u.getId());
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("phoneNumber", u.getPhone());
        m.put("name", u.getFullName());
        m.put("role", u.getRole());
        m.put("locked", Boolean.TRUE.equals(u.getLocked()));
        return m;
    }

    public Map<String, Object> createCustomer(Map<String, Object> body) {
        String email = Objects.toString(body.get("email"), "").trim().toLowerCase(Locale.ROOT);
        if (email.isBlank()) {
            return Map.of("success", false, "message", "Email is required");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return Map.of("success", false, "message", "Email already exists");
        }
        String raw = Objects.toString(body.get("password"), "").trim();
        if (!isStrongPassword(raw)) {
            return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
        }
        User u = new User();
        u.setEmail(email);
        u.setPhone(Objects.toString(body.get("phone"), Objects.toString(body.get("phoneNumber"), "")).trim());
        u.setFullName(Objects.toString(body.get("fullName"), Objects.toString(body.get("name"), "")).trim());
        u.setRole("customer");
        u.setLocked(Boolean.TRUE.equals(body.get("locked")));
        u.setPassword(passwordEncoder.encode(raw));
        User saved = userRepository.save(u);
        return Map.of("success", true, "message", "Customer created", "data", toCustomerMap(saved));
    }

    public Map<String, Object> updateUser(String userId, Map<String, Object> body) {
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) {
            return Map.of("success", false, "message", "User not found");
        }
        if (!isStorefrontCustomer(u)) {
            return Map.of("success", false, "message", "Cannot modify staff or admin accounts here");
        }
        if (body.containsKey("locked")) {
            u.setLocked(Boolean.TRUE.equals(body.get("locked")));
        }
        if (body.containsKey("fullName")) {
            u.setFullName(Objects.toString(body.get("fullName"), "").trim());
        }
        if (body.containsKey("phone")) {
            u.setPhone(Objects.toString(body.get("phone"), "").trim());
        }
        String raw = Objects.toString(body.get("password"), "").trim();
        if (!raw.isBlank()) {
            if (!isStrongPassword(raw)) {
                return Map.of("success", false, "message", PASSWORD_RULE_MESSAGE);
            }
            u.setPassword(passwordEncoder.encode(raw));
        }
        userRepository.save(u);
        return Map.of("success", true, "message", "Customer updated");
    }

    public Map<String, Object> lockUser(String userId, boolean lock) {
        return updateUser(userId, Map.of("locked", lock));
    }

    public Map<String, Object> deleteUser(String userId) {
        User u = userRepository.findById(userId).orElse(null);
        if (u == null) {
            return Map.of("success", false, "message", "User not found");
        }
        if (!isStorefrontCustomer(u)) {
            return Map.of("success", false, "message", "Cannot delete staff or admin accounts");
        }
        userRepository.deleteById(userId);
        return Map.of("success", true, "message", "Account deleted");
    }

    private static boolean isStorefrontCustomer(User u) {
        String role = u.getRole();
        return role == null || role.isBlank() || "customer".equalsIgnoreCase(role.trim());
    }

    private Map<String, Object> toCustomerMap(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", u.getId());
        m.put("id", u.getId());
        m.put("email", u.getEmail());
        m.put("phone", u.getPhone());
        m.put("phoneNumber", u.getPhone());
        m.put("fullName", u.getFullName());
        m.put("name", u.getFullName());
        m.put("role", u.getRole());
        m.put("locked", Boolean.TRUE.equals(u.getLocked()));
        m.put("createdAt", u.getCreatedAt());
        m.put("addresses", u.getAddresses() != null ? u.getAddresses() : List.of());
        return m;
    }

    public Map<String, Object> login(Map<String, String> body) {
        User admin = userRepository.findByEmail(body.get("email")).orElse(null);
        String role = admin != null ? Objects.toString(admin.getRole(), "") : "";
        if (admin == null || (!"admin".equalsIgnoreCase(role) && !"manager".equalsIgnoreCase(role) && !"staff".equalsIgnoreCase(role))) {
            return Map.of("success", false, "message", "User is not exist!!!");
        }
        if (admin.getId() == null || admin.getId().isBlank()) {
            return Map.of("success", false, "message", "Account misconfigured");
        }
        if (Boolean.TRUE.equals(admin.getLocked())) {
            return Map.of("success", false, "message", "Account is locked");
        }
        if (!PasswordMatch.matches(passwordEncoder, body.get("password"), admin.getPassword())) {
            return Map.of("success", false, "message", "Password is not true!!!");
        }
        String token = jwtService.createAdminToken(admin.getId());
        Map<String, Object> rest = toAdminMap(admin);
        rest.remove("password");
        return Map.of(
                "success", true,
                "message", "Login successfully!",
                "admin", rest,
                "token", token
        );
    }

    public Map<String, Object> products(int page, int perPage, String name, List<String> company, List<String> category) {
        boolean filterBrand = company != null && !company.isEmpty() && !company.contains("all");
        boolean filterCat = category != null && !category.isEmpty() && !category.contains("all");
        String q = name != null ? name : "";
        String ql = q.toLowerCase();
        List<Product> all = productRepository.findAll().stream()
                .filter(p -> q.isBlank() || (p.getName() != null && p.getName().toLowerCase().contains(ql)))
                .filter(p -> !filterBrand || company.stream().anyMatch(c -> c.equalsIgnoreCase(p.getBrand())))
                .filter(p -> !filterCat || category.contains(p.getCategory()))
                .toList();
        int from = Math.max(perPage * page - perPage, 0);
        int to = Math.min(from + perPage, all.size());
        List<Product> slice = from < all.size() ? all.subList(from, to) : List.of();
        return Map.of(
                "success", true,
                "message", "Success",
                "data", slice.stream().map(productService::toClientProduct).toList(),
                "page", Map.of(
                        "totalPage", (int) Math.ceil(all.size() / (double) perPage),
                        "currentPage", page
                )
        );
    }

    public Map<String, Object> users(int page, int perPage, String email, String name, String phoneNumber, String q) {
        boolean useQ = q != null && !q.isBlank();
        String ql = useQ ? q.trim().toLowerCase(Locale.ROOT) : "";
        Pattern ep = Pattern.compile(email != null && !email.isBlank() ? email : ".*", Pattern.CASE_INSENSITIVE);
        Pattern np = Pattern.compile(name != null && !name.isBlank() ? name : ".*", Pattern.CASE_INSENSITIVE);
        Pattern pp = Pattern.compile(phoneNumber != null && !phoneNumber.isBlank() ? phoneNumber : ".*", Pattern.CASE_INSENSITIVE);
        List<User> filtered = userRepository.findAll().stream()
                .filter(AdminService::isStorefrontCustomer)
                .filter(u -> {
                    if (useQ) {
                        String em = u.getEmail() != null ? u.getEmail().toLowerCase(Locale.ROOT) : "";
                        String nm = u.getFullName() != null ? u.getFullName().toLowerCase(Locale.ROOT) : "";
                        String ph = u.getPhone() != null ? u.getPhone().toLowerCase(Locale.ROOT) : "";
                        return em.contains(ql) || nm.contains(ql) || ph.contains(ql);
                    }
                    return u.getEmail() != null && ep.matcher(u.getEmail()).find()
                            && u.getFullName() != null && np.matcher(u.getFullName()).find()
                            && u.getPhone() != null && pp.matcher(u.getPhone()).find();
                })
                .toList();
        int from = Math.max(perPage * page - perPage, 0);
        int to = Math.min(from + perPage, filtered.size());
        List<User> slice = from < filtered.size() ? filtered.subList(from, to) : List.of();
        slice.forEach(u -> u.setPassword(null));
        return Map.of(
                "success", true,
                "message", "Success",
                "data", slice,
                "page", Map.of(
                        "totalPage", (int) Math.ceil(filtered.size() / (double) perPage),
                        "currentPage", page
                )
        );
    }

    public Map<String, Object> orders(int page, int perPage, String email, String name, String phoneNumber,
                                      List<String> status, String q, String sortBy, String sortDir) {
        List<String> statuses = status != null && !status.isEmpty() ? status : ENUM_STATUS;
        boolean useQ = q != null && !q.isBlank();
        String ql = useQ ? q.trim().toLowerCase(Locale.ROOT) : "";
        Pattern ep = Pattern.compile(email != null && !email.isBlank() ? email : ".*", Pattern.CASE_INSENSITIVE);
        Pattern np = Pattern.compile(name != null && !name.isBlank() ? name : ".*", Pattern.CASE_INSENSITIVE);
        Pattern pp = Pattern.compile(phoneNumber != null && !phoneNumber.isBlank() ? phoneNumber : ".*", Pattern.CASE_INSENSITIVE);

        Stream<Order> stream = orderRepository.findAll().stream()
                .filter(o -> o.getStatus() != null && statuses.contains(o.getStatus()));

        if (useQ) {
            stream = stream.filter(o -> {
                String em = o.getUserEmail() != null ? o.getUserEmail().toLowerCase(Locale.ROOT) : "";
                String nm = o.getShippingAddress() != null && o.getShippingAddress().getRecipientName() != null
                        ? o.getShippingAddress().getRecipientName().toLowerCase(Locale.ROOT) : "";
                String ph = o.getShippingAddress() != null && o.getShippingAddress().getPhone() != null
                        ? o.getShippingAddress().getPhone().toLowerCase(Locale.ROOT) : "";
                String oid = o.getOrderNumber() != null ? o.getOrderNumber().toLowerCase(Locale.ROOT) : "";
                String id = o.getId() != null ? o.getId().toLowerCase(Locale.ROOT) : "";
                return em.contains(ql) || nm.contains(ql) || ph.contains(ql) || oid.contains(ql) || id.contains(ql);
            });
        } else {
            stream = stream
                    .filter(o -> o.getUserEmail() != null && ep.matcher(o.getUserEmail()).find())
                    .filter(o -> o.getShippingAddress() != null && o.getShippingAddress().getRecipientName() != null
                            && np.matcher(o.getShippingAddress().getRecipientName()).find())
                    .filter(o -> o.getShippingAddress() != null && o.getShippingAddress().getPhone() != null
                            && pp.matcher(o.getShippingAddress().getPhone()).find());
        }

        String sb = sortBy != null ? sortBy : "updated_at";
        Comparator<Order> cmp = "created_at".equalsIgnoreCase(sb)
                ? Comparator.comparing(Order::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder()))
                : Comparator.comparing(Order::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder()));
        if (!"asc".equalsIgnoreCase(sortDir != null ? sortDir : "desc")) {
            cmp = cmp.reversed();
        }
        List<Order> filtered = stream.sorted(cmp).toList();
        int from = Math.max(perPage * page - perPage, 0);
        int to = Math.min(from + perPage, filtered.size());
        List<Order> slice = from < filtered.size() ? filtered.subList(from, to) : List.of();
        List<Map<String, Object>> client = slice.stream().map(this::orderToAdminRow).toList();
        return Map.of(
                "success", true,
                "message", "Success",
                "data", client,
                "page", Map.of(
                        "totalPage", (int) Math.ceil(filtered.size() / (double) perPage),
                        "currentPage", page
                )
        );
    }

    private Map<String, Object> orderToAdminRow(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", o.getId());
        m.put("id", o.getId());
        m.put("orderNumber", o.getOrderNumber());
        m.put("email", o.getUserEmail());
        m.put("name", o.getShippingAddress() != null ? o.getShippingAddress().getRecipientName() : "");
        m.put("phoneNumber", o.getShippingAddress() != null ? o.getShippingAddress().getPhone() : "");
        m.put("address", o.getShippingAddress() != null ? o.getShippingAddress().getAddress() : "");
        m.put("note", o.getNote());
        m.put("status", o.getStatus());
        m.put("paymentStatus", o.getPayment() != null && "paid".equals(o.getPayment().getStatus()) ? "02" : "01");
        m.put("paymentType", o.getPayment() != null ? o.getPayment().getMethod() : null);
        m.put("totalCurrentPrice", o.getTotal());
        m.put("totalPrice", o.getSubtotal());
        m.put("totalDiscount", o.getDiscountAmount() != null ? o.getDiscountAmount() : 0);
        m.put("shippingFee", o.getShippingFee() != null ? o.getShippingFee() : 0);
        m.put("products", orderItemsLegacy(o.getItems()));
        if (o.getDiscount() != null && !o.getDiscount().isEmpty()) {
            Map<String, Object> d = new LinkedHashMap<>();
            d.put("discountCode", o.getDiscount().get("code"));
            d.put("discountValue", o.getDiscount().get("amount"));
            m.put("discount", d);
        }
        m.put("createdAt", o.getCreatedAt());
        m.put("updatedAt", o.getUpdatedAt());
        return m;
    }

    private List<Map<String, Object>> orderItemsLegacy(List<Order.OrderItem> items) {
        if (items == null) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Order.OrderItem it : items) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("_id", it.getVariantId());
            row.put("img", it.getImageUrl());
            row.put("name", it.getProductName());
            row.put("price", it.getUnitPrice());
            row.put("color", it.getVariantTitle());
            row.put("amount", it.getQuantity());
            out.add(row);
        }
        return out;
    }

    public Map<String, Object> orderDetail(String id) {
        return orderRepository.findById(id)
                .map(o -> Map.<String, Object>of("success", true, "message", "Success!", "data", orderToAdminRow(o)))
                .orElse(Map.of("success", false, "message", "Not found"));
    }

    public Map<String, Object> updateOrder(String id, Map<String, Object> body) {
        Order o = orderRepository.findById(id).orElse(null);
        if (o == null) {
            return Map.of("success", false, "message", "Not found");
        }
        if (body.containsKey("status")) {
            String ns = String.valueOf(body.get("status"));
            if (!canTransition(o.getStatus(), ns)) {
                return Map.of("success", false, "message", "Chuyển trạng thái không hợp lệ");
            }
            Order.StatusLog log = new Order.StatusLog();
            log.setStatus(ns);
            log.setAt(Instant.now());
            log.setNote(Objects.toString(body.get("note"), "Cập nhật admin"));
            o.getStatusLogs().add(log);
            o.setStatus(ns);
        }
        if (body.containsKey("paymentStatus")) {
            String ps = String.valueOf(body.get("paymentStatus"));
            if (o.getPayment() == null) {
                o.setPayment(new Order.Payment());
            }
            o.getPayment().setStatus("02".equals(ps) ? "paid" : "pending");
            if ("paid".equals(o.getPayment().getStatus())) {
                o.getPayment().setPaidAt(Instant.now());
            }
        }
        orderRepository.save(o);
        return Map.of("success", true, "message", "Update Successfully!");
    }

    public Map<String, Object> reviews(String q, Integer rating, String sortDir) {
        String ql = q != null ? q.toLowerCase(Locale.ROOT) : "";
        List<Map<String, Object>> out = new ArrayList<>();
        for (Order o : orderRepository.findAll()) {
            if (o.getItems() == null) continue;
            for (int idx = 0; idx < o.getItems().size(); idx++) {
                Order.OrderItem it = o.getItems().get(idx);
                if (it.getRating() == null || it.getRating() <= 0) continue;
                if (rating != null && rating > 0 && !Objects.equals(it.getRating(), rating)) continue;
                String full = String.join(" ",
                        Objects.toString(o.getUserEmail(), ""),
                        Objects.toString(it.getProductName(), ""),
                        Objects.toString(it.getVariantTitle(), ""),
                        Objects.toString(it.getComment(), "")
                ).toLowerCase(Locale.ROOT);
                if (!ql.isBlank() && !full.contains(ql)) continue;
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("id", o.getId() + ":" + idx);
                row.put("orderId", o.getId());
                row.put("itemIndex", idx);
                row.put("userEmail", o.getUserEmail());
                row.put("productName", it.getProductName());
                row.put("variantTitle", it.getVariantTitle());
                row.put("rating", it.getRating());
                row.put("comment", it.getComment());
                Instant reviewedAt = it.getReviewedAt() != null ? it.getReviewedAt() : o.getUpdatedAt();
                row.put("reviewedAt", reviewedAt);
                out.add(row);
            }
        }
        Comparator<Map<String, Object>> byTime = Comparator.comparing(
                m -> (Instant) m.get("reviewedAt"),
                Comparator.nullsLast(Comparator.naturalOrder())
        );
        if (!"asc".equalsIgnoreCase(sortDir != null ? sortDir : "desc")) {
            byTime = byTime.reversed();
        }
        out.sort(byTime);
        return Map.of("success", true, "message", "Success", "data", out);
    }

    public Map<String, Object> deleteReview(String orderId, int itemIndex) {
        Order o = orderRepository.findById(orderId).orElse(null);
        if (o == null || o.getItems() == null || itemIndex < 0 || itemIndex >= o.getItems().size()) {
            return Map.of("success", false, "message", "Not found");
        }
        Order.OrderItem it = o.getItems().get(itemIndex);
        it.setRating(null);
        it.setComment(null);
        it.setReviewedAt(null);
        it.setReviewImages(new ArrayList<>());
        orderRepository.save(o);
        return Map.of("success", true, "message", "Delete review success");
    }

    private boolean canTransition(String from, String to) {
        if (from == null || to == null || from.equals(to)) return true;
        return switch (from) {
            case "pending" -> "confirmed".equals(to) || "cancelled".equals(to);
            case "confirmed" -> "shipping".equals(to) || "cancelled".equals(to);
            case "shipping" -> "delivered".equals(to);
            case "delivered", "cancelled" -> false;
            default -> false;
        };
    }

    private Map<String, Object> toAdminMap(User a) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", a.getId());
        m.put("id", a.getId());
        m.put("userName", a.getPhone());
        m.put("phoneNumber", a.getPhone());
        m.put("name", a.getFullName());
        m.put("address", "");
        m.put("email", a.getEmail());
        m.put("role", a.getRole());
        m.put("locked", Boolean.TRUE.equals(a.getLocked()));
        m.put("password", a.getPassword());
        return m;
    }

    private static boolean isStrongPassword(String password) {
        return password != null && STRONG_PASSWORD_PATTERN.matcher(password).matches();
    }
}
