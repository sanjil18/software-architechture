package com.trafficfine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fine_id", nullable = false)
    private TrafficFine trafficFine;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentMethod paymentMethod;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PaymentStatus status;

    private String transactionId;

    @Column(nullable = false)
    private String payerName;

    private String payerEmail;

    private String payerPhone;

    @Column(nullable = false)
    private LocalDateTime paidAt;

    @Enumerated(EnumType.STRING)
    private PaymentChannel channel;

    public enum PaymentMethod {
        CARD, BANK_TRANSFER, CASH
    }

    public enum PaymentStatus {
        SUCCESS, FAILED, PENDING
    }

    public enum PaymentChannel {
        MOBILE_APP, WEB_PORTAL
    }
}
