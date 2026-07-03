package com.police.trafficfine.dto;

import com.police.trafficfine.model.FineCategory;
import com.police.trafficfine.model.FineStatus;
import com.police.trafficfine.model.PaymentMethod;
import com.police.trafficfine.model.TrafficFine;
import com.police.trafficfine.model.VehicleType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

/**
 * Public lookup response — deliberately excludes officer info,
 * equivalent of the field allowlist built in controllers/fineController.js#lookupFine.
 */
@Data
@Builder
public class FineLookupResponse {
    private String id;
    private String referenceNumber;
    private FineCategory category;
    private String categoryId;
    private String driverName;
    private String driverLicense;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private Double amount;
    private String district;
    private String location;
    private String violation;
    private FineStatus status;
    private Instant issuedAt;
    private Instant dueDate;
    private PaymentMethod paymentMethod;
    private String paymentReference;
    private Instant paidAt;

    public static FineLookupResponse from(TrafficFine fine) {
        return FineLookupResponse.builder()
                .id(fine.getId())
                .referenceNumber(fine.getReferenceNumber())
                .category(fine.getCategory())
                .categoryId(fine.getCategoryId())
                .driverName(fine.getDriverName())
                .driverLicense(fine.getDriverLicense())
                .vehicleNumber(fine.getVehicleNumber())
                .vehicleType(fine.getVehicleType())
                .amount(fine.getAmount())
                .district(fine.getDistrict())
                .location(fine.getLocation())
                .violation(fine.getViolation())
                .status(fine.getStatus())
                .issuedAt(fine.getIssuedAt())
                .dueDate(fine.getDueDate())
                .paymentMethod(fine.getPaymentMethod())
                .paymentReference(fine.getPaymentReference())
                .paidAt(fine.getPaidAt())
                .build();
    }
}
