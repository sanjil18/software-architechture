package com.police.trafficfine.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Locale;

/**
 * Equivalent of backend/src/services/smsService.js.
 *
 * Calls the Twilio REST API directly (no SDK dependency needed) when
 * credentials are configured; otherwise logs a mock SMS, exactly like
 * the original `isTwilioConfigured()` fallback.
 */
@Slf4j
@Service
public class SmsService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${app.sms.twilio.account-sid:}")
    private String accountSid;

    @Value("${app.sms.twilio.auth-token:}")
    private String authToken;

    @Value("${app.sms.twilio.phone-number:}")
    private String fromNumber;

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a", Locale.ENGLISH);

    private boolean isTwilioConfigured() {
        return StringUtils.hasText(accountSid) && accountSid.startsWith("AC");
    }

    /** Sri Lankan numbers are typically local (0771234567); Twilio needs E.164 (+94771234567). */
    private String toE164(String phone) {
        if (phone == null) return null;
        String digits = phone.replaceAll("[\\s-]", "");
        if (digits.startsWith("+")) return digits;
        if (digits.startsWith("0")) return "+94" + digits.substring(1);
        return "+94" + digits;
    }

    public SmsResult sendSms(String to, String message) {
        String recipient = toE164(to);

        if (!isTwilioConfigured()) {
            log.info("📱 [SMS MOCK] To: {}", recipient);
            log.info("📱 [SMS MOCK] Message: {}", message);
            return new SmsResult(true, true, null, null);
        }

        try {
            String url = "https://api.twilio.com/2010-04-01/Accounts/" + accountSid + "/Messages.json";

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            String auth = accountSid + ":" + authToken;
            headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8)));

            MultiValueMap<String, String> form = new LinkedMultiValueMap<>();
            form.add("To", recipient);
            form.add("From", fromNumber);
            form.add("Body", message);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(form, headers);
            restTemplate.postForEntity(url, request, String.class);

            log.info("✅ SMS sent to {}", recipient);
            return new SmsResult(true, false, null, null);
        } catch (Exception e) {
            log.error("❌ SMS failed to {}: {}", recipient, e.getMessage());
            return new SmsResult(false, false, null, e.getMessage());
        }
    }

    public SmsResult sendFineIssuedSms(String driverPhone, String referenceNumber, String violation,
                                        String vehicleNumber, Double amount, String location,
                                        Instant dueDate, String categoryId) {
        String message = "Sri Lanka Police - Traffic Fine Issued\n" +
                "Ref: " + referenceNumber + "\n" +
                "Violation: " + violation + "\n" +
                "Vehicle: " + vehicleNumber + "\n" +
                "Amount: LKR " + formatAmount(amount) + "\n" +
                "Location: " + location + "\n" +
                "Due Date: " + formatDate(dueDate) + "\n" +
                "Pay online using Ref " + referenceNumber + " and Category " + categoryId + ".";

        return sendSms(driverPhone, message);
    }

    public SmsResult sendPaymentConfirmationSms(String officerPhone, String referenceNumber, String driverName,
                                                 String vehicleNumber, Double amount, Instant paidAt) {
        String message = "Sri Lanka Police - Fine Payment Confirmed\n" +
                "Ref: " + referenceNumber + "\n" +
                "Driver: " + driverName + "\n" +
                "Vehicle: " + vehicleNumber + "\n" +
                "Amount: LKR " + formatAmount(amount) + "\n" +
                "Paid at: " + formatDateTime(paidAt) + "\n" +
                "Please release the driver's license.";

        return sendSms(officerPhone, message);
    }

    public SmsResult sendDriverPaymentConfirmationSms(String driverPhone, String referenceNumber,
                                                        Double amount, Instant paidAt) {
        String message = "Sri Lanka Police - Payment Confirmed\n" +
                "Ref: " + referenceNumber + "\n" +
                "Amount Paid: LKR " + formatAmount(amount) + "\n" +
                "Paid at: " + formatDateTime(paidAt) + "\n" +
                "Thank you. Please collect your license from the issuing officer.";

        return sendSms(driverPhone, message);
    }

    private String formatAmount(Double amount) {
        return amount == null ? "0" : String.format(Locale.ENGLISH, "%,.0f", amount);
    }

    private String formatDate(Instant instant) {
        return instant == null ? "" :
                instant.atZone(ZoneId.of("Asia/Colombo")).format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
    }

    private String formatDateTime(Instant instant) {
        return instant == null ? "" : instant.atZone(ZoneId.of("Asia/Colombo")).format(DISPLAY_FORMAT);
    }

    public record SmsResult(boolean success, boolean mock, String sid, String error) {}
}
