package com.fashion.controller;

import com.fashion.service.AdminAuthorizationService;
import com.fashion.service.AdminService;
import com.fashion.service.ProductService;
import com.fashion.util.AuthUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final AdminAuthorizationService adminAuthorizationService;

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

    @PostMapping("/user")
    public ResponseEntity<?> createUser(@RequestBody Map<String, Object> body) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(adminService.createCustomer(body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
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

    @PatchMapping("/user/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(adminService.updateUser(id, body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/user/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(adminService.deleteUser(id));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
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
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(adminService.deleteReview(orderId, itemIndex));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @GetMapping("/staff")
    public ResponseEntity<?> staffList(@RequestParam(required = false) String q) {
        try {
            return ResponseEntity.ok(adminService.staffList(AuthUtil.requireUserId(), q));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PostMapping("/staff")
    public ResponseEntity<?> createStaff(@RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(adminService.createStaff(AuthUtil.requireUserId(), body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PatchMapping("/staff/{id}")
    public ResponseEntity<?> updateStaff(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            return ResponseEntity.ok(adminService.updateStaff(AuthUtil.requireUserId(), id, body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/staff/{id}")
    public ResponseEntity<?> deleteStaff(@PathVariable String id) {
        try {
            return ResponseEntity.ok(adminService.deleteStaff(AuthUtil.requireUserId(), id));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", message));
    }
}
