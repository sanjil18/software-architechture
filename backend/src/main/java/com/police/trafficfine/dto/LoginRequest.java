package com.police.trafficfine.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Please provide email and password.")
    private String email;

    @NotBlank(message = "Please provide email and password.")
    private String password;
}
