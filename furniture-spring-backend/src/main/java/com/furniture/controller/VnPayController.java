package com.furniture.controller;

import com.furniture.service.VnPayService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/vnPay")
@RequiredArgsConstructor
public class VnPayController {

    private final VnPayService vnPayService;

    @GetMapping("/create_payment_url")
    public ResponseEntity<?> createGet(HttpServletRequest req) {
        return ResponseEntity.ok(Map.of("msg", "Use POST with form body (amount, orderDescription, ...)", "statusCode", 200));
    }

    @PostMapping("/create_payment_url")
    public ResponseEntity<?> createPost(HttpServletRequest req, @RequestParam Map<String, String> body) {
        return ResponseEntity.ok(vnPayService.createPaymentUrl(req, body));
    }

    @GetMapping("/vnpay_return")
    public ResponseEntity<?> returnUrl(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(Map.of("code", params.getOrDefault("vnp_ResponseCode", "unknown")));
    }

    @GetMapping("/vnpay_ipn")
    public ResponseEntity<?> ipn(@RequestParam Map<String, String> params) {
        return ResponseEntity.ok(vnPayService.ipn(params));
    }
}
