package com.fashion.controller;

import com.fashion.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam Map<String, String> query) {
        return ResponseEntity.ok(productService.getAll(query));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable String id) {
        return ResponseEntity.ok(productService.getOne(id));
    }

    @PostMapping("/create")
    public ResponseEntity<?> create(@RequestParam Map<String, String> form) {
        return ResponseEntity.ok(productService.create(form));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestParam Map<String, String> form) {
        return ResponseEntity.ok(productService.update(id, form));
    }

    /** Toggle active ↔ draft (hidden from storefront GET /products). Requires Bearer token. */
    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<?> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(productService.toggleActive(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        return ResponseEntity.ok(productService.delete(id));
    }

    @DeleteMapping("/multiple")
    public ResponseEntity<?> deleteMulti(@RequestParam(value = "ids[]") List<String> ids) {
        return ResponseEntity.ok(productService.deleteMulti(ids));
    }
}
