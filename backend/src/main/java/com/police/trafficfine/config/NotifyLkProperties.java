package com.police.trafficfine.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties("app.sms.notifylk")
public class NotifyLkProperties {
    private String userId;
    private String apiKey;
    private String senderId;
}
