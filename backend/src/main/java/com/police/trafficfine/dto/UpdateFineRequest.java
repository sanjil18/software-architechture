package com.police.trafficfine.dto;

import com.police.trafficfine.model.FineStatus;
import com.police.trafficfine.model.VehicleType;
import lombok.Data;

/** All fields optional — only non-null fields get applied (matches the original's `allowed.forEach` patch logic). */
@Data
public class UpdateFineRequest {
    private String driverName;
    private String driverLicense;
    private String vehicleNumber;
    private VehicleType vehicleType;
    private String location;
    private String violation;
    private String district;
    private Double amount;
    private String driverPhone;
    private FineStatus status;
    private String categoryId;
}
