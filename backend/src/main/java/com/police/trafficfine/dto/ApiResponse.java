package com.police.trafficfine.dto;

import lombok.Builder;
import lombok.Data;

/** Generic { success, message } envelope used across simple responses. */
@Data
@Builder
public class ApiResponse {
    private boolean success;
    private String message;

    public static ApiResponse of(boolean success, String message) {
        return ApiResponse.builder().success(success).message(message).build();
    }
}
