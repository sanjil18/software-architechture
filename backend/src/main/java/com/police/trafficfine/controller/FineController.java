package com.police.trafficfine.controller;

import com.police.trafficfine.dto.*;
import com.police.trafficfine.model.FineStatus;
import com.police.trafficfine.model.TrafficFine;
import com.police.trafficfine.security.UserPrincipal;
import com.police.trafficfine.service.FineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Equivalent of routes/fineRoutes.js:
 *   GET  /api/fines/lookup      -> public
 *   POST /api/fines/:id/pay     -> public
 *   POST /api/fines             -> protect + authorize('officer','admin')
 *   GET  /api/fines/my-fines    -> protect + authorize('officer')
 *   GET  /api/fines/analytics   -> protect + authorize('admin')
 *   GET  /api/fines             -> protect + authorize('admin')
 *   PUT  /api/fines/:id         -> protect + authorize('admin','officer')
 */
@RestController
@RequestMapping("/api/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineService fineService;

    @GetMapping("/lookup")
    public ResponseEntity<Map<String, Object>> lookupFine(@RequestParam String referenceNumber,
                                                            @RequestParam String categoryId) {
        FineLookupResponse fine = fineService.lookupFine(referenceNumber, categoryId);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("fine", fine);
        return ResponseEntity.ok(body);
    }

    @PostMapping("/{id}/pay")
    public ResponseEntity<Map<String, Object>> payFine(@PathVariable String id,
                                                         @RequestBody(required = false) PayFineRequest request) {
        PayFineResponse fine = fineService.payFine(id, request != null ? request : new PayFineRequest());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Fine paid successfully. SMS notification sent.");
        body.put("fine", fine);
        return ResponseEntity.ok(body);
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> issueFine(@Valid @RequestBody IssueFineRequest request,
                                                           @AuthenticationPrincipal UserPrincipal principal) {
        TrafficFine fine = fineService.issueFine(request, principal.getUser());
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Traffic fine issued successfully.");
        body.put("fine", fine);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/my-fines")
    public ResponseEntity<PagedFinesResponse> getMyFines(@AuthenticationPrincipal UserPrincipal principal,
                                                           @RequestParam(required = false) FineStatus status,
                                                           @RequestParam(defaultValue = "1") int page,
                                                           @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(fineService.getMyFines(principal.getUser(), status, page, limit));
    }

    @GetMapping("/analytics")
    public ResponseEntity<Map<String, Object>> getAnalytics() {
        return ResponseEntity.ok(fineService.getAnalytics());
    }

    @GetMapping
    public ResponseEntity<PagedFinesResponse> getAllFines(@RequestParam(required = false) FineStatus status,
                                                            @RequestParam(required = false) String district,
                                                            @RequestParam(required = false) String categoryId,
                                                            @RequestParam(defaultValue = "1") int page,
                                                            @RequestParam(defaultValue = "20") int limit) {
        return ResponseEntity.ok(fineService.getAllFines(status, district, categoryId, page, limit));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateFine(@PathVariable String id,
                                                            @RequestBody UpdateFineRequest request) {
        TrafficFine fine = fineService.updateFine(id, request);
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("success", true);
        body.put("message", "Fine updated successfully.");
        body.put("fine", fine);
        return ResponseEntity.ok(body);
    }
}
