package com.furniture.controller;

import com.furniture.service.OrderService;
import com.furniture.util.AuthUtil;
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

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, String> form) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.submitReview(userId, form));
    }
}
