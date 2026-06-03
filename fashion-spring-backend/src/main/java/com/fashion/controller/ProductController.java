package com.fashion.controller;

import com.fashion.service.AdminAuthorizationService;
import com.fashion.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam Map<String, String> query) {
        return ResponseEntity.ok(productService.getAll(query));
    }

    /** Lean product catalog for the AI chatbot (public, no auth required). */
    @GetMapping("/chatbot-catalog")
    public ResponseEntity<?> chatbotCatalog() {
        return ResponseEntity.ok(productService.getChatbotCatalog());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable String id) {
        return ResponseEntity.ok(productService.getOne(id));
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestParam Map<String, String> form) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(productService.create(form));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestParam Map<String, String> form) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(productService.update(id, form));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    /** Toggle active ↔ draft (hidden from storefront GET /products). Requires Bearer token. */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable String id) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(productService.toggleActive(id));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(productService.delete(id));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/multiple")
    public ResponseEntity<?> deleteMulti(@RequestParam(value = "ids[]") List<String> ids) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(productService.deleteMulti(ids));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", message));
    }
}
