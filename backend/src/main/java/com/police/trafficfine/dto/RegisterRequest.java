package com.police.trafficfine.dto;

import com.police.trafficfine.model.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String name;

    @NotBlank
    private String email;

    @NotBlank
    private String password;

    private Role role;

    private String badgeNumber;

    @NotBlank
    private String phone;

    @NotBlank
    private String district;
}
