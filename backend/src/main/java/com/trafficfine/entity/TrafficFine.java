package com.trafficfine.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "traffic_fines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrafficFine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String referenceNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private FineCategory category;

    @Column(nullable = false)
    private String vehicleNumber;

    @Column(nullable = false)
    private String driverName;

    @Column(nullable = false)
    private String driverNic;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String district;

    @Column(nullable = false)
    private String location;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "officer_id", nullable = false)
    private Officer officer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FineStatus status;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    private LocalDateTime paidAt;

    @OneToOne(mappedBy = "trafficFine", cascade = CascadeType.ALL)
    private Payment payment;

    public enum FineStatus {
        PENDING, PAID, CANCELLED
    }
}
