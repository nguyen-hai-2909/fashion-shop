package com.fashion.controller;

import com.fashion.security.JwtService;
import com.fashion.service.UserService;
import com.fashion.util.AuthUtil;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<?> list(@RequestParam(required = false) String name,
                                  @RequestParam(required = false) String phoneNumber,
                                  @RequestParam(required = false) String email) {
        var users = userService.getAllUsers(name, phoneNumber, email);
        if (users.isEmpty()) {
            return ResponseEntity.ok(Map.of("errCode", 1, "msg", "User is empty!!"));
        }
        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody Map<String, Object> body) {
        var res = userService.createUser(body);
        if (Boolean.FALSE.equals(res.get("success"))) {
            return ResponseEntity.badRequest().body(res);
        }
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> one(@PathVariable String id) {
        Object o = userService.getSingleUser(id);
        return ResponseEntity.ok(o);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> patch(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(userService.updateUser(id, body));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        Object o = userService.deleteUser(id);
        if (o instanceof Map<?, ?> m && m.containsKey("errCode")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(o);
        }
        return ResponseEntity.ok(o);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> body) {
        var res = userService.login(body);
        if (Boolean.FALSE.equals(res.get("success"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/google-login")
    public ResponseEntity<?> googleLogin(@RequestBody Map<String, String> body) {
        var res = userService.googleLogin(body);
        if (Boolean.FALSE.equals(res.get("success"))) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PostMapping("/send-mail")
    public ResponseEntity<?> sendMail(@RequestBody Map<String, String> body) {
        var res = userService.sendMailForgot(body.get("email"));
        if (Boolean.FALSE.equals(res.get("success"))) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(res);
        }
        return ResponseEntity.ok(res);
    }

    @PutMapping("/reset-password")
    public ResponseEntity<?> reset(@RequestHeader("Authorization") String authorization,
                                   @RequestBody Map<String, String> body) {
        String token = authorization.replace("Bearer ", "").trim();
        Claims c = jwtService.parse(token);
        String email = c.get("email", String.class);
        return ResponseEntity.ok(userService.resetPassword(email, body));
    }

    @PutMapping("/edit")
    public ResponseEntity<?> edit(@RequestBody Map<String, String> body) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(userService.editUser(userId, body));
    }

    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody Map<String, String> body) {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(userService.changePassword(userId, body));
    }

    @GetMapping("/profile/me")
    public ResponseEntity<?> profile() {
        String userId = AuthUtil.requireUserId();
        return ResponseEntity.ok(userService.getProfile(userId));
    }
}
