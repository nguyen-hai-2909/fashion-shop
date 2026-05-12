package com.furniture.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.furniture.document.FashionDiscount;
import com.furniture.document.Order;
import com.furniture.document.Product;
import com.furniture.document.User;
import com.furniture.repository.FashionDiscountRepository;
import com.furniture.repository.OrderRepository;
import com.furniture.repository.ProductRepository;
import com.furniture.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final FashionDiscountRepository discountRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;
    private final ObjectMapper objectMapper;
    private final OrderNumberService orderNumberService;

    public Map<String, Object> listForUser(String userId, int page, int perPage, String email) {
        Pattern emailPat = Pattern.compile(email != null && !email.isBlank() ? Pattern.quote(email) : ".*");
        Query q = new Query(Criteria.where("userId").is(userId).and("userEmail").regex(emailPat))
                .with(Sort.by(Sort.Direction.DESC, "updatedAt"))
                .with(PageRequest.of(Math.max(page - 1, 0), perPage));
        List<Order> data = mongoTemplate.find(q, Order.class);
        Query countQ = new Query(Criteria.where("userId").is(userId).and("userEmail").regex(emailPat));
        long count = mongoTemplate.count(countQ, Order.class);
        return Map.of(
                "success", true,
                "message", "Success",
                "data", data,
                "page", Map.of(
                        "totalPage", (int) Math.ceil(count / (double) perPage),
                        "currentPage", page
                )
        );
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> create(String userId, Map<String, String> form) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                return Map.of("success", false, "message", "User not found");
            }
            List<Map<String, Object>> cart = objectMapper.readValue(form.get("products"), new TypeReference<>() {
            });

            List<Order.OrderItem> items = new ArrayList<>();
            double subtotal = 0;

            for (Map<String, Object> line : cart) {
                String composite = (String) line.get("id");
                if (composite == null || !composite.contains("_")) {
                    continue;
                }
                String[] parts = composite.split("_", 2);
                Product product = productRepository.findById(parts[0]).orElse(null);
                if (product == null) {
                    return Map.of("success", false, "message", "Product not found: " + parts[0]);
                }
                Product.ProductVariant variant = resolveVariant(product, parts[1], line);
                if (variant == null) {
                    return Map.of("success", false, "message", "Variant not found for product: " + product.getName());
                }

                int qty = ((Number) line.get("amount")).intValue();
                int max = line.get("maxAmount") != null ? ((Number) line.get("maxAmount")).intValue() : qty;
                int useQty = Math.min(qty, max);
                double unit = line.get("price") != null ? ((Number) line.get("price")).doubleValue()
                        : (variant.getPrice() != null ? variant.getPrice() : 0);
                double lineSub = useQty * unit;
                subtotal += lineSub;

                Map<String, Object> img = (Map<String, Object>) line.get("image");
                String imgUrl = "";
                if (img != null && img.get("url") != null) {
                    imgUrl = img.get("url").toString();
                } else if (variant.getImageUrl() != null) {
                    imgUrl = variant.getImageUrl();
                } else if (!product.getImages().isEmpty()) {
                    imgUrl = product.getImages().get(0).getUrl();
                }

                String vTitle = (variant.getColor() != null ? variant.getColor().getName() : "")
                        + " / " + variant.getSize();

                Order.OrderItem oi = new Order.OrderItem();
                oi.setProductId(product.getId());
                oi.setVariantId(variant.getId());
                oi.setProductName(product.getName());
                oi.setVariantTitle(vTitle.trim());
                oi.setSku(variant.getSku());
                oi.setImageUrl(imgUrl);
                oi.setQuantity(useQty);
                oi.setUnitPrice(unit);
                oi.setSubtotal(lineSub);
                items.add(oi);

                decInventory(product.getId(), variant.getId(), useQty);
            }

            double shippingFee = Double.parseDouble(form.getOrDefault("shippingFee", "0"));
            String code = form.get("discountCode");
            FashionDiscount disc = null;
            if (code != null && !code.isBlank()) {
                disc = discountRepository.findByCodeIgnoreCase(code.trim().toUpperCase(Locale.ROOT)).orElse(null);
            }

            double discountAmount = 0;
            Map<String, Object> discountSnap = null;
            if (disc != null) {
                validateDiscount(disc, userId, subtotal);
                discountAmount = computeDiscount(disc, subtotal, shippingFee);
                if ("free_shipping".equals(disc.getType())) {
                    shippingFee = 0;
                }
                discountSnap = new HashMap<>();
                discountSnap.put("code", disc.getCode());
                discountSnap.put("amount", discountAmount);
            }

            double total = subtotal - discountAmount + shippingFee;

            Order order = new Order();
            order.setOrderNumber(orderNumberService.nextOrderNumber());
            order.setUserId(userId);
            order.setUserEmail(user.getEmail());
            order.setStatus("pending");
            Order.StatusLog log = new Order.StatusLog();
            log.setStatus("pending");
            log.setAt(Instant.now());
            log.setNote("Đặt hàng");
            order.setStatusLogs(new ArrayList<>(List.of(log)));

            Order.ShippingSnapshot ship = new Order.ShippingSnapshot();
            ship.setRecipientName(form.get("name"));
            ship.setPhone(form.get("phoneNumber"));
            ship.setAddress(form.get("address"));
            ship.setDistrict("");
            ship.setCity("");
            order.setShippingAddress(ship);

            order.setItems(items);
            order.setSubtotal(subtotal);
            order.setDiscountAmount(discountAmount);
            order.setShippingFee(shippingFee);
            order.setTotal(total);
            order.setNote(form.get("note"));
            Order.Payment pay = new Order.Payment();
            pay.setMethod(mapPayment(form.get("paymentMethod")));
            pay.setStatus("pending");
            pay.setPaidAt(null);
            order.setPayment(pay);
            order.setDiscount(discountSnap);

            Order saved = orderRepository.save(order);
            if (disc != null) {
                bumpDiscountUsage(disc);
            }
            return Map.of("success", true, "message", "Success", "order", toClientOrder(saved));
        } catch (Exception e) {
            return Map.of("success", false, "message", "Something went wrong", "error", e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private Product.ProductVariant resolveVariant(Product product, String variantId, Map<String, Object> line) {
        if (product == null || product.getVariants() == null || product.getVariants().isEmpty()) return null;

        Optional<Product.ProductVariant> byId = product.getVariants().stream()
                .filter(v -> Objects.equals(v.getId(), variantId))
                .findFirst();
        if (byId.isPresent()) return byId.get();

        String lineColor = Objects.toString(line.get("color"), "").trim();
        String lineSize = Objects.toString(line.get("size"), "").trim();
        if (!lineColor.isBlank() || !lineSize.isBlank()) {
            Optional<Product.ProductVariant> byColorSize = product.getVariants().stream()
                    .filter(v -> {
                        String variantColor = v.getColor() != null ? Objects.toString(v.getColor().getName(), "").trim() : "";
                        String variantSize = Objects.toString(v.getSize(), "").trim();
                        boolean colorMatch = lineColor.isBlank() || lineColor.equalsIgnoreCase(variantColor);
                        boolean sizeMatch = lineSize.isBlank() || lineSize.equalsIgnoreCase(variantSize);
                        return colorMatch && sizeMatch;
                    })
                    .findFirst();
            if (byColorSize.isPresent()) return byColorSize.get();
        }

        return product.getVariants().get(0);
    }

    private void validateDiscount(FashionDiscount d, String userId, double subtotal) {
        if (!Boolean.TRUE.equals(d.getIsActive())) {
            throw new IllegalStateException("Mã không hoạt động");
        }
        Instant now = Instant.now();
        if (d.getStartsAt() != null && now.isBefore(d.getStartsAt())) {
            throw new IllegalStateException("Mã chưa có hiệu lực");
        }
        if (d.getEndsAt() != null && now.isAfter(d.getEndsAt())) {
            throw new IllegalStateException("Mã đã hết hạn");
        }
        if (d.getMinOrderAmount() != null && subtotal < d.getMinOrderAmount()) {
            throw new IllegalStateException("Đơn chưa đạt giá trị tối thiểu");
        }
        if (d.getUsageLimit() != null && d.getUsageCount() != null && d.getUsageCount() >= d.getUsageLimit()) {
            throw new IllegalStateException("Mã đã hết lượt");
        }
        if (Boolean.TRUE.equals(d.getOncePerUser())) {
            Query q = new Query(Criteria.where("userId").is(userId).and("discount.code").is(d.getCode()));
            if (mongoTemplate.count(q, Order.class) > 0) {
                throw new IllegalStateException("Bạn đã dùng mã này");
            }
        }
    }

    private double computeDiscount(FashionDiscount d, double subtotal, double shipping) {
        return switch (d.getType()) {
            case "percentage" -> Math.round(subtotal * d.getValue() / 100.0);
            case "fixed_amount" -> Math.min(d.getValue(), subtotal);
            case "free_shipping" -> shipping;
            default -> 0d;
        };
    }

    private void bumpDiscountUsage(FashionDiscount d) {
        Query q = new Query(Criteria.where("_id").is(d.getId()));
        Update u = new Update().inc("usage_count", 1);
        mongoTemplate.updateFirst(q, u, FashionDiscount.class);
    }

    private String mapPayment(String m) {
        if (m == null) return "cod";
        return switch (m.toUpperCase(Locale.ROOT)) {
            case "COD" -> "cod";
            case "VNPAY" -> "vnpay";
            default -> m.toLowerCase(Locale.ROOT);
        };
    }

    private void decInventory(String productId, String variantId, int qty) {
        Query q = new Query(Criteria.where("_id").is(productId).and("variants._id").is(variantId));
        Update u = new Update().inc("variants.$.inventory", -qty);
        var res = mongoTemplate.updateFirst(q, u, Product.class);
        if (res.getModifiedCount() == 0) {
            throw new IllegalStateException("Không cập nhật được tồn kho");
        }
    }

    public Map<String, Object> detail(String id) {
        return orderRepository.findById(id)
                .map(o -> Map.<String, Object>of("success", true, "message", "Success!", "data", o))
                .orElse(Map.of("success", false, "message", "Not found"));
    }

    public Map<String, Object> reviewableForUser(String userId, String productId, String variantId) {
        List<Order> list = orderRepository.findAll().stream()
                .filter(o -> Objects.equals(o.getUserId(), userId))
                .filter(o -> "delivered".equals(o.getStatus()))
                .sorted(Comparator.comparing(Order::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .toList();
        for (Order o : list) {
            if (o.getItems() == null) continue;
            for (int i = 0; i < o.getItems().size(); i++) {
                Order.OrderItem it = o.getItems().get(i);
                if (!Objects.equals(it.getProductId(), productId)) continue;
                if (variantId != null && !variantId.isBlank() && !Objects.equals(it.getVariantId(), variantId)) continue;
                return Map.of(
                        "success", true,
                        "message", "Success",
                        "data", Map.of(
                                "orderId", o.getId(),
                                "itemIndex", i,
                                "rating", it.getRating(),
                                "comment", it.getComment()
                        )
                );
            }
        }
        return Map.of("success", false, "message", "You can only review delivered purchased items");
    }

    public Map<String, Object> submitReview(String userId, Map<String, String> body) {
        try {
            String productId = body.get("productId");
            String variantId = body.get("variantId");
            int rating = Integer.parseInt(body.getOrDefault("rating", "0"));
            String comment = Objects.toString(body.get("comment"), "").trim();
            if (productId == null || productId.isBlank()) return Map.of("success", false, "message", "Missing product");
            if (rating < 1 || rating > 5) return Map.of("success", false, "message", "Rating must be 1-5");

            List<Order> list = orderRepository.findAll().stream()
                    .filter(o -> Objects.equals(o.getUserId(), userId))
                    .filter(o -> "delivered".equals(o.getStatus()))
                    .sorted(Comparator.comparing(Order::getUpdatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                    .toList();
            for (Order o : list) {
                if (o.getItems() == null) continue;
                for (Order.OrderItem it : o.getItems()) {
                    if (!Objects.equals(it.getProductId(), productId)) continue;
                    if (variantId != null && !variantId.isBlank() && !Objects.equals(it.getVariantId(), variantId)) continue;
                    it.setRating(rating);
                    it.setComment(comment);
                    it.setReviewedAt(Instant.now());
                    orderRepository.save(o);
                    return Map.of("success", true, "message", "Review submitted successfully");
                }
            }
            return Map.of("success", false, "message", "You can only review delivered purchased items");
        } catch (Exception e) {
            return Map.of("success", false, "message", "Something went wrong!", "error", e.getMessage());
        }
    }

    public Map<String, Object> productReviews(String productId) {
        List<Map<String, Object>> rows = new ArrayList<>();
        for (Order o : orderRepository.findAll()) {
            if (o.getItems() == null) continue;
            for (Order.OrderItem it : o.getItems()) {
                if (!Objects.equals(it.getProductId(), productId)) continue;
                if (it.getRating() == null || it.getRating() <= 0) continue;
                Map<String, Object> row = new LinkedHashMap<>();
                row.put("orderId", o.getId());
                row.put("userEmail", o.getUserEmail());
                row.put("rating", it.getRating());
                row.put("comment", it.getComment());
                row.put("productId", it.getProductId());
                row.put("productName", it.getProductName());
                row.put("variantId", it.getVariantId());
                row.put("variantTitle", it.getVariantTitle());
                row.put("reviewedAt", it.getReviewedAt() != null ? it.getReviewedAt() : o.getUpdatedAt());
                rows.add(row);
            }
        }
        rows.sort((a, b) -> String.valueOf(b.get("reviewedAt")).compareTo(String.valueOf(a.get("reviewedAt"))));
        return Map.of("success", true, "message", "Success", "data", rows);
    }

    private Map<String, Object> toClientOrder(Order o) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("_id", o.getId());
        m.put("id", o.getId());
        m.put("order_number", o.getOrderNumber());
        m.put("idUser", o.getUserId());
        m.put("user_id", o.getUserId());
        m.put("email", o.getUserEmail());
        m.put("name", o.getShippingAddress() != null ? o.getShippingAddress().getRecipientName() : null);
        m.put("phoneNumber", o.getShippingAddress() != null ? o.getShippingAddress().getPhone() : null);
        m.put("address", o.getShippingAddress() != null ? o.getShippingAddress().getAddress() : null);
        m.put("note", o.getNote());
        m.put("status", o.getStatus());
        String ps = o.getPayment() != null ? o.getPayment().getStatus() : "pending";
        m.put("paymentStatus", "paid".equals(ps) ? "02" : "01");
        m.put("paymentType", o.getPayment() != null ? o.getPayment().getMethod() : null);
        m.put("totalPrice", o.getSubtotal());
        m.put("totalCurrentPrice", o.getTotal());
        m.put("shippingFee", o.getShippingFee());
        m.put("totalDiscount", o.getDiscountAmount());
        m.put("products", clientLineItems(o.getItems()));
        m.put("discount", o.getDiscount());
        m.put("createdAt", o.getCreatedAt());
        m.put("updatedAt", o.getUpdatedAt());
        return m;
    }

    private List<Map<String, Object>> clientLineItems(List<Order.OrderItem> items) {
        List<Map<String, Object>> out = new ArrayList<>();
        if (items == null) return out;
        for (Order.OrderItem it : items) {
            Map<String, Object> row = new HashMap<>();
            row.put("idProduct", it.getProductId() + "_" + it.getVariantId());
            row.put("amount", it.getQuantity());
            row.put("color", "");
            row.put("price", it.getUnitPrice());
            row.put("name", it.getProductName());
            Map<String, Object> img = new HashMap<>();
            img.put("url", it.getImageUrl());
            row.put("image", img);
            out.add(row);
        }
        return out;
    }
}
