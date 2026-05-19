package com.trafficfine.controller;

import com.trafficfine.dto.PaymentDto;
import com.trafficfine.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/pay")
    public ResponseEntity<PaymentDto.PaymentResponse> processPayment(
            @RequestBody PaymentDto.PaymentRequest request) {
        return ResponseEntity.ok(paymentService.processPayment(request));
    }
}
