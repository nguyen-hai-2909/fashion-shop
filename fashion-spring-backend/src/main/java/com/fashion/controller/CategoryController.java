package com.fashion.controller;

import com.fashion.service.AdminAuthorizationService;
import com.fashion.service.CategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
public class CategoryController {
    private final CategoryService categoryService;
    private final AdminAuthorizationService adminAuthorizationService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(defaultValue = "false") boolean all) {
        return ResponseEntity.ok(categoryService.list(all));
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(categoryService.create(body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(categoryService.update(id, body));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @PatchMapping("/{id}/toggle")
    public ResponseEntity<?> toggle(@PathVariable String id) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(categoryService.toggle(id));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            adminAuthorizationService.requireAdminOrManager();
            return ResponseEntity.ok(categoryService.delete(id));
        } catch (IllegalStateException e) {
            return forbidden(e.getMessage());
        }
    }

    private ResponseEntity<Map<String, Object>> forbidden(String message) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("success", false, "message", message));
    }
}
