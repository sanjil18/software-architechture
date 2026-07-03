package com.police.trafficfine.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Mirrors backend/src/models/TrafficFine.js.
 *
 * `category` and `officer` are DBRefs (equivalent of Mongoose's
 * ObjectId + ref + populate). `categoryId` and `officerPhone` are kept
 * denormalized on the document too, exactly like the original schema,
 * so lookups don't always need a populate/join.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "traffic_fines")
@CompoundIndexes({
        @CompoundIndex(name = "ref_category_idx", def = "{'referenceNumber': 1, 'categoryId': 1}"),
        @CompoundIndex(name = "status_district_idx", def = "{'status': 1, 'district': 1}")
})
public class TrafficFine {

    @Id
    private String id;

    /** e.g. "TF-2024-001234" */
    @Indexed(unique = true)
    @NotBlank
    private String referenceNumber;

    @DBRef
    @NotNull
    private FineCategory category;

    /** Denormalized copy of category.categoryId for quick lookup without a join. */
    @NotBlank
    private String categoryId;

    @DBRef
    @NotNull
    @Indexed
    private User officer;

    @NotBlank
    private String officerPhone;

    // Driver information
    @NotBlank
    private String driverName;

    @NotBlank
    private String driverLicense;

    @NotBlank
    private String vehicleNumber;

    @Builder.Default
    private VehicleType vehicleType = VehicleType.CAR;

    private String driverPhone;

    // Fine details
    @NotNull
    private Double amount;

    @NotBlank
    private String district;

    @NotBlank
    private String location;

    @NotBlank
    private String violation;

    @Builder.Default
    private Instant issuedAt = Instant.now();

    @NotNull
    private Instant dueDate;

    // Payment status
    @Builder.Default
    private FineStatus status = FineStatus.PENDING;

    private PaymentMethod paymentMethod;

    private String paymentReference;

    private Instant paidAt;

    // SMS notification flags
    @Builder.Default
    private boolean issuedSmsSent = false;

    @Builder.Default
    private boolean officerSmsSent = false;

    @Builder.Default
    private boolean driverSmsSent = false;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
