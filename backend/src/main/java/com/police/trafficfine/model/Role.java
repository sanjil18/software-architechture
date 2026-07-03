package com.police.trafficfine.model;

public enum Role {
    ADMIN,
    OFFICER;

    public String toValue() {
        return name().toLowerCase();
    }
}
