package com.police.trafficfine.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * No-op gateway activated by the "mock-sms" Spring profile.
 * Logs the message instead of calling the real notify.lk API so that
 * tests never burn SMS credits.
 *
 * Usage in tests: @ActiveProfiles("mock-sms")
 * Usage in application.yml / env: spring.profiles.active=mock-sms
 */
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
