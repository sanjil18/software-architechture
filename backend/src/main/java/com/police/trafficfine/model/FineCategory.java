package com.police.trafficfine.model;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

/**
 * Mirrors backend/src/models/FineCategory.js.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "fine_categories")
public class FineCategory {

    @Id
    private String id;

    /** e.g. "TF001", "TF002" — stored uppercase, unique. */
    @Indexed(unique = true)
    @NotBlank
    private String categoryId;

    @NotBlank
    private String name;

    @NotBlank
    private String description;

    @NotNull
    @Min(0)
    private Double amount;

    /** Demerit points. */
    @Builder.Default
    private Integer points = 0;

    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}
