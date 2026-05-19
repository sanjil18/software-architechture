package com.trafficfine.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FineDto {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LookupRequest {
        private String referenceNumber;
        private String categoryCode;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FineResponse {
        private Long id;
        private String referenceNumber;
        private String categoryCode;
        private String categoryName;
        private String vehicleNumber;
        private String driverName;
        private BigDecimal amount;
        private String district;
        private String location;
        private String officerName;
        private String status;
        private LocalDateTime issuedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFineRequest {
        private String categoryCode;
        private String vehicleNumber;
        private String driverName;
        private String driverNic;
        private String district;
        private String location;
    }
}
