package com.fashion.controller;

import com.fashion.service.AdminAuthorizationService;
import com.fashion.service.DiscountService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/discount")
@RequiredArgsConstructor
public class DiscountController {

    private final DiscountService discountService;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping
    public ResponseEntity<?> list(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int perPage,
            @RequestParam(required = false) String discountCode,
            @RequestParam(required = false) String valueDiscount,
            @RequestParam(required = false) String q
    ) {
        return ResponseEntity.ok(discountService.list(page, perPage, discountCode, valueDiscount, q));
    }

    @GetMapping("/code/{discountCode}")
    public ResponseEntity<?> byCode(@PathVariable String discountCode) {
        var res = discountService.getByCode(discountCode);
        if (res.containsKey("statusCode") && Integer.valueOf(400).equals(res.get("statusCode"))) {
            return ResponseEntity.badRequest().body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/code")
    public ResponseEntity<?> check(@RequestBody Map<String, String> body) {
        var res = discountService.checkCode(body);
        if (Boolean.FALSE.equals(res.get("success"))) {
            HttpStatus st = res.get("message") != null && res.get("message").toString().contains("expired")
                    ? HttpStatus.BAD_REQUEST
                    : HttpStatus.NOT_FOUND;
            return ResponseEntity.status(st).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/email")
    public ResponseEntity<?> email(@RequestBody Map<String, Object> body) {
        var res = discountService.createEmail(body);
        if (Boolean.FALSE.equals(res.get("success"))) {
            int sc = res.containsKey("statusCode") ? ((Number) res.get("statusCode")).intValue() : 400;
            return ResponseEntity.status(sc).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable String id) {
        return ResponseEntity.ok(discountService.getByMongoId(id));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(discountService.create(body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(discountService.update(id, body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/multi")
    public ResponseEntity<?> deleteMulti(@RequestParam(value = "ids[]") List<String> ids) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(discountService.deleteMulti(ids));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", message));
    }
}
