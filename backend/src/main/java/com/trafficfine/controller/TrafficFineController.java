package com.trafficfine.controller;

import com.trafficfine.dto.FineDto;
import com.trafficfine.service.TrafficFineService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TrafficFineController {

    private final TrafficFineService fineService;

    // Public - lookup fine by reference + category (for payment portals)
    @GetMapping("/lookup")
    public ResponseEntity<FineDto.FineResponse> lookupFine(
            @RequestParam String referenceNumber,
            @RequestParam String categoryCode) {
        return ResponseEntity.ok(fineService.lookupFine(referenceNumber, categoryCode));
    }

    // Officer-only - create a new fine
    @PostMapping
    @PreAuthorize("hasRole('OFFICER') or hasRole('ADMIN')")
    public ResponseEntity<FineDto.FineResponse> createFine(@RequestBody FineDto.CreateFineRequest request) {
        return ResponseEntity.ok(fineService.createFine(request));
    }

    // Admin-only - list all fines
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<FineDto.FineResponse>> getAllFines() {
        return ResponseEntity.ok(fineService.getAllFines());
    }
}
