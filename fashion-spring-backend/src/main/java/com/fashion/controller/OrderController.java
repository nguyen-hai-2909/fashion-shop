package com.fashion.controller;

import com.fashion.service.OrderService;
import com.fashion.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/order")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String email
    ) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.listForUser(userId, page, perPage, email));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestParam Map<String, String> form) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.create(userId, form));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> detail(@PathVariable String id) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(orderService.detail(id, userId));
    }
}
