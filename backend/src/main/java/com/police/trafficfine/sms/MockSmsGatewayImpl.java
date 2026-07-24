package com.police.trafficfine.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;


@Slf4j
@Component
@Profile("mock-sms")
public class MockSmsGatewayImpl implements SmsGateway {

    @Override
    public boolean sendSms(String toPhoneNumber, String message) {
        log.info("[SMS MOCK] To: {}", toPhoneNumber);
        log.info("[SMS MOCK] Message: {}", message);
        return true;
    }
}
