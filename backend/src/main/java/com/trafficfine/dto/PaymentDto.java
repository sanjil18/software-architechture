package com.trafficfine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentRequest {
        private String referenceNumber;
        private String categoryCode;
        private String payerName;
        private String payerEmail;
        private String payerPhone;
        private String paymentMethod;
        private String channel; // MOBILE_APP or WEB_PORTAL
        // Card details (in real app, use payment gateway token)
        private String cardNumber;
        private String cardExpiry;
        private String cardCvv;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PaymentResponse {
        private boolean success;
        private String message;
        private String transactionId;
        private BigDecimal amount;
        private LocalDateTime paidAt;
        private String referenceNumber;
    }
}
