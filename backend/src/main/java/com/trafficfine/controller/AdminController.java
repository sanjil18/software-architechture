package com.trafficfine.controller;

import com.trafficfine.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    @GetMapping("/collections/district")
    public ResponseEntity<List<Map<String, Object>>> getDistrictCollections() {
        return ResponseEntity.ok(adminService.getDistrictCollections());
    }

    @GetMapping("/collections/category")
    public ResponseEntity<List<Map<String, Object>>> getCategoryCollections() {
        return ResponseEntity.ok(adminService.getCategoryCollections());
    }
}
