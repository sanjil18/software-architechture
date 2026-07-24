package com.police.trafficfine.sms;

import com.police.trafficfine.config.NotifyLkProperties;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Slf4j
@Component
@Profile("!mock-sms")
@RequiredArgsConstructor
public class NotifyLkSmsGatewayImpl implements SmsGateway {

    private static final String API_URL = "https://app.notify.lk/api/v1/send";

    private final NotifyLkProperties properties;
    private final RestTemplate restTemplate;

    @PostConstruct
    void logConfiguration() {
        boolean credentialsPresent = StringUtils.hasText(properties.getUserId())
                && StringUtils.hasText(properties.getApiKey())
                && StringUtils.hasText(properties.getSenderId());

        if (credentialsPresent) {
            log.info("notify.lk SMS gateway active — user_id={} sender_id={}",
                    properties.getUserId(), properties.getSenderId());
        } else {
            log.error("notify.lk credentials are missing! "
                    + "Check NOTIFYLK_USER_ID, NOTIFYLK_API_KEY, NOTIFYLK_SENDER_ID env vars. "
                    + "Current: user_id='{}' sender_id='{}'",
                    properties.getUserId(), properties.getSenderId());
        }
    }

    @Override
    public boolean sendSms(String toPhoneNumber, String message) {
        String normalized = normalizePhone(toPhoneNumber);
        if (normalized == null) {
            log.warn("SMS skipped — null or empty phone number");
            return false;
        }

        try {
            URI uri = UriComponentsBuilder.fromHttpUrl(API_URL)
                    .queryParam("user_id", properties.getUserId())
                    .queryParam("api_key", properties.getApiKey())
                    .queryParam("sender_id", properties.getSenderId())
                    .queryParam("to", normalized)
                    .queryParam("message", message)
                    .build().encode().toUri();

            ResponseEntity<String> response = restTemplate.getForEntity(uri, String.class);
            String body = response.getBody();

            // notify.lk ALWAYS returns HTTP 200 — success/failure is in the body:
            //   success → {"status":1,"message":"Message queued."}
            //   failure → {"status":0,"message":"Insufficient Balance."} (or similar)
            // We MUST check the body, not just the HTTP status code.
            log.info("notify.lk raw response to {}: {}", normalized, body);

            if (response.getStatusCode().is2xxSuccessful() && isApiSuccess(body)) {
                log.info("SMS sent to {}", normalized);
                return true;
            }

            log.error("notify.lk rejected SMS to {} — response body: {}", normalized, body);
            return false;

        } catch (Exception e) {
            log.error("SMS delivery failed to {}: {}", normalized, e.getMessage());
            return false;
        }
    }


    private static boolean isApiSuccess(String body) {
        if (body == null || body.isBlank()) return false;
        // Accept both {"status":1,...} and {"status": 1,...} (with optional space)
        return body.contains("\"status\":1") || body.contains("\"status\": 1");
    }

    /**
     * Converts any Sri Lankan phone format to the 94XXXXXXXXX format
     * required by notify.lk (no leading +, no leading 0).
     *
     *   0771234567   → 94771234567
     *   +94771234567 → 94771234567
     *   94771234567  → 94771234567 (unchanged)
     */
    static String normalizePhone(String phone) {
        if (phone == null || phone.isBlank()) return null;
        String digits = phone.replaceAll("[\\s\\-()+]", "");
        if (digits.startsWith("94")) return digits;
        if (digits.startsWith("0"))  return "94" + digits.substring(1);
        return "94" + digits;
    }
}
