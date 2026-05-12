package com.furniture.service;

import com.furniture.document.FashionDiscount;
import com.furniture.repository.FashionDiscountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class DiscountService {

    private final FashionDiscountRepository discountRepository;
    private final MailService mailService;
    @Value("${app.url.client:http://localhost:3000}")
    private String urlClient;

    public Map<String, Object> list(int page, int perPage, String idDiscount, String valueDiscount, String q) {
        boolean useQ = q != null && !q.isBlank();
        String ql = useQ ? q.trim().toLowerCase(Locale.ROOT) : "";
        Pattern idP = Pattern.compile(idDiscount != null && !idDiscount.isBlank() ? idDiscount : ".*", Pattern.CASE_INSENSITIVE);
        Pattern valP = Pattern.compile(valueDiscount != null && !valueDiscount.isBlank() ? valueDiscount : ".*", Pattern.CASE_INSENSITIVE);
        List<FashionDiscount> all = discountRepository.findAll().stream()
                .filter(d -> {
                    if (useQ) {
                        String code = d.getCode() != null ? d.getCode().toLowerCase(Locale.ROOT) : "";
                        String desc = d.getDescription() != null ? d.getDescription().toLowerCase(Locale.ROOT) : "";
                        String valStr = d.getValue() != null ? d.getValue().toString().toLowerCase(Locale.ROOT) : "";
                        return code.contains(ql) || desc.contains(ql) || valStr.contains(ql);
                    }
                    return idP.matcher(d.getCode() != null ? d.getCode() : "").find();
                })
                .filter(d -> {
                    if (useQ) {
                        return true;
                    }
                    if (valueDiscount == null || valueDiscount.isBlank()) {
                        return true;
                    }
                    String valStr = d.getValue() != null ? d.getValue().toString() : "";
                    String desc = d.getDescription() != null ? d.getDescription() : "";
                    return valP.matcher(valStr).find() || valP.matcher(desc).find();
                })
                .sorted(Comparator.comparing(FashionDiscount::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
        int from = Math.max(perPage * page - perPage, 0);
        int to = Math.min(from + perPage, all.size());
        List<FashionDiscount> slice = from < all.size() ? all.subList(from, to) : List.of();
        long count = all.size();
        return Map.of(
                "success", true,
                "message", "Success!",
                "data", slice.stream().map(this::toClient).toList(),
                "page", Map.of(
                        "totalPage", (int) Math.ceil(count / (double) perPage),
                        "currentPage", page
                )
        );
    }

    public Map<String, Object> getByMongoId(String id) {
        return discountRepository.findById(id)
                .map(d -> Map.<String, Object>of("success", true, "message", "Success", "discount", toClient(d)))
                .orElse(Map.of("success", false, "message", "Not found"));
    }

    public Map<String, Object> create(Map<String, Object> body) {
        FashionDiscount d = new FashionDiscount();
        d.setCode(((String) body.getOrDefault("code", body.get("idDiscount"))).toUpperCase(Locale.ROOT).trim());
        d.setDescription((String) body.getOrDefault("description", ""));
        d.setType((String) body.getOrDefault("type", "percentage"));
        d.setValue(body.get("value") != null ? ((Number) body.get("value")).doubleValue()
                : Double.parseDouble(Objects.toString(body.get("valueDiscount"), "0").replace("%", "")));
        d.setMinOrderAmount(body.get("min_order_amount") != null ? ((Number) body.get("min_order_amount")).doubleValue() : null);
        d.setUsageLimit(resolveUsageLimit(body));
        d.setUsageCount(0);
        d.setOncePerUser(Boolean.TRUE.equals(body.get("once_per_user")));
        d.setIsActive(body.get("is_active") == null || Boolean.TRUE.equals(body.get("is_active")));
        d.setStartsAt(body.get("starts_at") != null ? Instant.parse(body.get("starts_at").toString()) : Instant.now());
        d.setEndsAt(body.get("ends_at") != null ? Instant.parse(body.get("ends_at").toString()) : null);
        FashionDiscount saved = discountRepository.save(d);
        return Map.of("success", true, "message", "Success!", "data", toClient(saved));
    }

    public Map<String, Object> createEmail(Map<String, Object> body) {
        String email = (String) body.get("email");
        if (email == null || email.isBlank()) {
            return Map.of("statusCode", 200, "message", "Email is not empty!", "success", false);
        }
        String code = "NEW" + System.currentTimeMillis();
        mailService.send(email, "Ưu đãi thành viên mới",
                "Mã giảm giá: " + code + " — " + urlClient);
        FashionDiscount d = new FashionDiscount();
        d.setCode(code);
        d.setDescription("Giảm 50% đơn đầu");
        d.setType("percentage");
        d.setValue(50d);
        d.setUsageLimit(1);
        d.setUsageCount(0);
        d.setIsActive(true);
        d.setStartsAt(Instant.now());
        FashionDiscount saved = discountRepository.save(d);
        return Map.of("statusCode", 200, "message", "Success!", "data", toClient(saved), "success", true);
    }

    public Map<String, Object> getByCode(String discountCode) {
        return discountRepository.findByCodeIgnoreCase(discountCode.trim().toUpperCase(Locale.ROOT))
                .map(d -> Map.<String, Object>of("statusCode", 200, "msg", "Success!", "data", toClient(d)))
                .orElse(Map.of("statusCode", 400, "msg", "Discount is not existed!"));
    }

    public Map<String, Object> checkCode(Map<String, String> body) {
        String code = body.get("discountCode");
        return discountRepository.findByCodeIgnoreCase(code.trim().toUpperCase(Locale.ROOT))
                .map(d -> {
                    if (!Boolean.TRUE.equals(d.getIsActive())) {
                        return Map.<String, Object>of("success", false, "message", "Discount is not existed!");
                    }
                    if (d.getEndsAt() != null && Instant.now().isAfter(d.getEndsAt())) {
                        return Map.<String, Object>of("success", false, "message", "Discount code has expired");
                    }
                    if (d.getUsageLimit() != null && d.getUsageCount() != null && d.getUsageCount() >= d.getUsageLimit()) {
                        return Map.<String, Object>of("success", false, "message", "Discount code has expired");
                    }
                    return Map.<String, Object>of("success", true, "message", "Apply discount code success!", "discount", toClient(d));
                })
                .orElse(Map.of("success", false, "message", "Discount is not existed!"));
    }

    public Map<String, Object> update(String id, Map<String, Object> body) {
        FashionDiscount d = discountRepository.findById(id).orElse(null);
        if (d == null) {
            return Map.of("success", false, "message", "Not found");
        }
        if (body.containsKey("code")) d.setCode(((String) body.get("code")).toUpperCase(Locale.ROOT));
        if (body.containsKey("idDiscount")) {
            d.setCode(((String) body.get("idDiscount")).toUpperCase(Locale.ROOT).trim());
        }
        if (body.containsKey("description")) d.setDescription((String) body.get("description"));
        if (body.containsKey("type")) d.setType((String) body.get("type"));
        if (body.containsKey("value")) d.setValue(((Number) body.get("value")).doubleValue());
        if (body.containsKey("valueDiscount")) {
            String vd = Objects.toString(body.get("valueDiscount"));
            double val = Double.parseDouble(vd.replace("%", "").trim());
            d.setValue(val);
            if (vd.contains("%")) {
                d.setType("percentage");
            } else if (body.containsKey("type")) {
                d.setType((String) body.get("type"));
            } else {
                d.setType("fixed_amount");
            }
        }
        if (body.containsKey("is_active")) d.setIsActive((Boolean) body.get("is_active"));
        if (body.containsKey("usage_limit")) {
            Object ulObj = body.get("usage_limit");
            if (ulObj == null) {
                d.setUsageLimit(null);
            } else {
                int ul = ((Number) ulObj).intValue();
                d.setUsageLimit(ul > 0 ? ul : null);
            }
        }
        if (body.containsKey("amountUse")) {
            Number au = (Number) body.get("amountUse");
            d.setUsageLimit(au != null && au.intValue() > 0 ? au.intValue() : null);
        }
        discountRepository.save(d);
        return Map.of("success", true, "message", "Update successfully!");
    }

    private static Integer resolveUsageLimit(Map<String, Object> body) {
        if (body.get("usage_limit") != null) {
            int ul = ((Number) body.get("usage_limit")).intValue();
            return ul > 0 ? ul : null;
        }
        if (body.get("amountUse") != null) {
            int au = ((Number) body.get("amountUse")).intValue();
            return au > 0 ? au : null;
        }
        return null;
    }

    public Map<String, Object> deleteMulti(List<String> ids) {
        if (ids != null) {
            discountRepository.deleteAllById(ids);
        }
        return Map.of("success", true, "message", "Delete successfully!");
    }

    private Map<String, Object> toClient(FashionDiscount d) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", d.getId());
        m.put("id", d.getId());
        m.put("idDiscount", d.getCode());
        m.put("code", d.getCode());
        m.put("description", d.getDescription());
        m.put("type", d.getType());
        m.put("value", d.getValue());
        m.put("valueDiscount", d.getType() != null && d.getType().equals("percentage") ? d.getValue() + "%" : String.valueOf(d.getValue()));
        m.put("amountUse", d.getUsageLimit() != null ? d.getUsageLimit() - (d.getUsageCount() != null ? d.getUsageCount() : 0) : 999);
        m.put("usage_limit", d.getUsageLimit());
        m.put("usage_count", d.getUsageCount());
        m.put("is_active", d.getIsActive());
        m.put("email", "");
        m.put("createdAt", d.getCreatedAt());
        return m;
    }
}
