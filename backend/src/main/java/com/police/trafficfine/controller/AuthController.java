package com.police.trafficfine.controller;

import com.police.trafficfine.dto.LoginRequest;
import com.police.trafficfine.dto.LoginResponse;
import com.police.trafficfine.dto.RegisterRequest;
import com.police.trafficfine.dto.UserResponse;
import com.police.trafficfine.security.UserPrincipal;
import com.police.trafficfine.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Equivalent of routes/authRoutes.js:
 *   POST /api/auth/login     -> public
 *   POST /api/auth/register  -> protect + authorize('admin')  (enforced in SecurityConfig)
 *   GET  /api/auth/me        -> protect
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request) {
        UserResponse user = authService.register(request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "User created successfully.");
        body.put("user", user);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMe(@AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("user", UserResponse.from(principal.getUser()));
        return ResponseEntity.ok(body);
    }
}
