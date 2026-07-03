package com.police.trafficfine.dto;

import com.police.trafficfine.model.VehicleType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IssueFineRequest {
    @NotBlank
    private String categoryId;

    @NotBlank
    private String driverName;

    @NotBlank
    private String driverLicense;

    private String driverPhone;

    @NotBlank
    private String vehicleNumber;

    private VehicleType vehicleType;

    @NotBlank
    private String location;

    @NotBlank
    private String violation;
}
