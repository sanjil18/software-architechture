package com.police.trafficfine.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoginResponse {
    private boolean success;
    private String token;
    private UserResponse user;
}
