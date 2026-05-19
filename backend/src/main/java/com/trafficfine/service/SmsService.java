package com.trafficfine.service;

import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.phone.number}")
    private String fromNumber;

    public void sendPaymentConfirmation(String toPhoneNumber, String driverName,
                                        String referenceNumber, String amount) {
        try {
            Twilio.init(accountSid, authToken);

            String messageBody = String.format(
                    "TRAFFIC FINE PAID\n" +
                    "Driver: %s\n" +
                    "Reference: %s\n" +
                    "Amount: LKR %s\n" +
                    "Please release the driving licence.",
                    driverName, referenceNumber, amount
            );

            Message message = Message.creator(
                    new PhoneNumber(toPhoneNumber),
                    new PhoneNumber(fromNumber),
                    messageBody
            ).create();

            log.info("SMS sent to officer: {} | SID: {}", toPhoneNumber, message.getSid());

        } catch (Exception e) {
            log.error("Failed to send SMS to {}: {}", toPhoneNumber, e.getMessage());
            // Don't throw - payment was already successful, SMS failure is non-critical
        }
    }
}
