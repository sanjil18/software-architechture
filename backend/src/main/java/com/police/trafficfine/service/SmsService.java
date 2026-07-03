package com.police.trafficfine.service;

import com.police.trafficfine.sms.SmsGateway;
import com.police.trafficfine.sms.SmsMessageBuilder;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Slf4j
@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsGateway smsGateway;

    public SmsResult sendFineIssuedSms(String driverPhone, String referenceNumber,
                                        String categoryName, String categoryCode, Double amount) {
        String message = SmsMessageBuilder.fineCreated(referenceNumber, categoryName, categoryCode, amount);
        boolean sent = smsGateway.sendSms(driverPhone, message);
        return new SmsResult(sent, false, null, sent ? null : "SMS delivery failed");
    }

    public SmsResult sendPaymentConfirmationSms(String officerPhone, String referenceNumber,
                                                 String driverName, String vehicleNumber,
                                                 Double amount, Instant paidAt) {
        String message = SmsMessageBuilder.officerPaymentAlert(
                referenceNumber, driverName, vehicleNumber, amount, paidAt);
        boolean sent = smsGateway.sendSms(officerPhone, message);
        return new SmsResult(sent, false, null, sent ? null : "SMS delivery failed");
    }

    public SmsResult sendDriverPaymentConfirmationSms(String driverPhone, String referenceNumber,
                                                       Double amount, String paymentReference) {
        String message = SmsMessageBuilder.paymentSettled(referenceNumber, amount, paymentReference);
        boolean sent = smsGateway.sendSms(driverPhone, message);
        return new SmsResult(sent, false, null, sent ? null : "SMS delivery failed");
    }

    public record SmsResult(boolean success, boolean mock, String sid, String error) {}
}
