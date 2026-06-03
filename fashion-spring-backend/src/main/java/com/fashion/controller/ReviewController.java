package com.fashion.controller;

import com.fashion.service.OrderService;
import com.fashion.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {
    private final OrderService orderService;

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> listByProduct(@PathVariable String productId) {
        return ResponseEntity.ok(orderService.productReviews(productId));
    }

    @GetMapping("/reviewable")
    public ResponseEntity<?> reviewable(@RequestParam String productId, @RequestParam(required = false) String variantId) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.reviewableForUser(userId, productId, variantId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<?> orderItems(@PathVariable String orderId) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.orderReviewItems(userId, orderId));
    }

    @GetMapping("/order/{orderId}/{itemIndex}")
    public ResponseEntity<?> orderItem(@PathVariable String orderId, @PathVariable int itemIndex) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.orderReviewItem(userId, orderId, itemIndex));
    }

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, Object> body) {
        String userId = AuthUtil.requireUserId();
        List<String> images = parseReviewImages(body.get("reviewImages"));
        return ResponseEntity.ok(orderService.submitReview(userId, body, images));
    }

    @PostMapping("/order/{orderId}/{itemIndex}")
    public ResponseEntity<?> submitForOrderItem(
            @PathVariable String orderId,
            @PathVariable int itemIndex,
            @RequestBody Map<String, Object> body
    ) {
        String userId = AuthUtil.requireUserId();
        int rating = parseInt(body.get("rating"), 0);
        String comment = Objects.toString(body.get("comment"), "");
        List<String> images = parseReviewImages(body.get("reviewImages"));
        return ResponseEntity.ok(
                orderService.submitReviewForOrderItem(userId, orderId, itemIndex, rating, comment, images)
        );
    }

    @SuppressWarnings("unchecked")
    private static List<String> parseReviewImages(Object raw) {
        if (raw == null) {
            return List.of();
        }
        List<String> out = new ArrayList<>();
        if (raw instanceof List<?> list) {
            for (Object o : list) {
                if (o != null) {
                    String s = o.toString().trim();
                    if (!s.isBlank()) {
                        out.add(s);
                    }
                }
            }
        } else if (raw instanceof String s && !s.isBlank()) {
            out.add(s.trim());
        }
        return out.size() > 5 ? out.subList(0, 5) : out;
    }

    private static int parseInt(Object v, int def) {
        if (v == null) {
            return def;
        }
        try {
            return Integer.parseInt(v.toString());
        } catch (NumberFormatException e) {
            return def;
        }
    }

}
