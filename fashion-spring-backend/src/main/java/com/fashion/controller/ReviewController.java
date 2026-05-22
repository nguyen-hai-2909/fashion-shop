package com.fashion.controller;

import com.fashion.service.OrderService;
import com.fashion.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

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
    public ResponseEntity<?> submit(@RequestBody Map<String, String> form) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.submitReview(userId, form));
    }

    @PostMapping("/order/{orderId}/{itemIndex}")
    public ResponseEntity<?> submitForOrderItem(
            @PathVariable String orderId,
            @PathVariable int itemIndex,
            @RequestBody Map<String, String> form
    ) {
        String userId = AuthUtil.requireUserId();
        int rating = Integer.parseInt(form.getOrDefault("rating", "0"));
        String comment = form.getOrDefault("comment", "");
        return ResponseEntity.ok(orderService.submitReviewForOrderItem(userId, orderId, itemIndex, rating, comment));
    }
}
