package com.police.trafficfine.dto;

import com.police.trafficfine.model.Role;
import com.police.trafficfine.model.User;
import lombok.Builder;
import lombok.Data;


@Data
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
    private String badgeNumber;
    private String district;
    private String phone;

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .badgeNumber(user.getBadgeNumber())
                .district(user.getDistrict())
                .phone(user.getPhone())
                .build();
    }
}
