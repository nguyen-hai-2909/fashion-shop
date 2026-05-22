package com.fashion.controller;

import com.fashion.service.ContactService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService contactService;

    @PostMapping
    public ResponseEntity<?> submit(@RequestBody Map<String, String> body) {
        return ResponseEntity.ok(contactService.submit(body));
    }
}
