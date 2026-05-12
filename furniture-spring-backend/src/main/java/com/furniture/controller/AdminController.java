package com.furniture.controller;

import com.furniture.service.AdminService;
import com.furniture.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ProductService productService;

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        Map<String, Object> res = new LinkedHashMap<>(adminService.createAdmin(body));
        res.remove("password");
        return ResponseEntity.ok(res);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        var res = adminService.login(body);
        if (Boolean.FALSE.equals(res.get("success"))) {
            return ResponseEntity.status(404).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/product")
    public ResponseEntity<?> products(
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) List<String> company,
            @RequestParam(required = false) List<String> category
    ) {
        return ResponseEntity.ok(adminService.products(page, perPage, name, company, category));
    }

    /** Product detail for admin form — includes draft/archived (not exposed on public GET /products/{id}). */
    @GetMapping("/product/{id}")
    public ResponseEntity<?> adminProductDetail(@PathVariable String id) {
        return ResponseEntity.ok(productService.getOneAnyStatus(id));
    }

    @GetMapping("/user")
    public ResponseEntity<?> users(
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(adminService.users(page, perPage, email, name, phoneNumber, q));
    }

    @GetMapping("/order")
    public ResponseEntity<?> orders(
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String phoneNumber,
            @RequestParam(required = false) List<String> status,
            @RequestParam(required = false) String q,
            @RequestParam(required = false, defaultValue = "updated_at") String sortBy,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(adminService.orders(page, perPage, email, name, phoneNumber, status, q, sortBy, sortDir));
    }

    @GetMapping("/order/{id}")
    public ResponseEntity<?> orderDetail(@PathVariable String id) {
        return ResponseEntity.ok(adminService.orderDetail(id));
    }

    @PatchMapping("/order/{id}")
    public ResponseEntity<?> orderUpdate(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(adminService.updateOrder(id, body));
    }

    @GetMapping("/reviews")
    public ResponseEntity<?> reviews(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false, defaultValue = "desc") String sortDir
    ) {
        return ResponseEntity.ok(adminService.reviews(q, rating, sortDir));
    }

    @DeleteMapping("/reviews/{orderId}/{itemIndex}")
    public ResponseEntity<?> deleteReview(@PathVariable String orderId, @PathVariable int itemIndex) {
        return ResponseEntity.ok(adminService.deleteReview(orderId, itemIndex));
    }
}
