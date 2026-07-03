package com.police.trafficfine.dto;

import com.police.trafficfine.model.FineStatus;
import com.police.trafficfine.model.PaymentMethod;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class PayFineResponse {
    private String referenceNumber;
    private Double amount;
    private FineStatus status;
    private String paymentReference;
    private Instant paidAt;
    private boolean officerSmsSent;
    private boolean driverSmsSent;
}
