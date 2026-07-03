package com.police.trafficfine.sms;

import java.time.Instant;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

public final class SmsMessageBuilder {

    private static final DateTimeFormatter DISPLAY_FORMAT =
            DateTimeFormatter.ofPattern("MMM d, yyyy, h:mm a", Locale.ENGLISH)
                             .withZone(ZoneId.of("Asia/Colombo"));

    private SmsMessageBuilder() {}

    public static String fineCreated(String refNumber, String categoryName,
                                     String categoryCode, Double amount) {
        return String.format(
                "Traffic Fine Notice: Ref #%s, Category: %s (%s), Amount: LKR %s. " +
                "Pay online via the Sri Lanka Police Traffic Fine Portal.",
                refNumber, categoryName, categoryCode, formatAmount(amount));
    }

    public static String paymentSettled(String refNumber, Double amount, String paymentReference) {
        return String.format(
                "Payment Confirmed: Ref #%s, Amount: LKR %s paid successfully. " +
                "Transaction ID: %s. Present this confirmation to retrieve your license.",
                refNumber, formatAmount(amount), paymentReference);
    }

    public static String officerPaymentAlert(String refNumber, String driverName,
                                              String vehicleNumber, Double amount, Instant paidAt) {
        return String.format(
                "Sri Lanka Police - Fine Payment Received\nRef: %s\nDriver: %s\nVehicle: %s\n" +
                "Amount: LKR %s\nPaid at: %s\nPlease release the driver's license.",
                refNumber, driverName, vehicleNumber, formatAmount(amount), formatDateTime(paidAt));
    }

    private static String formatAmount(Double amount) {
        return amount == null ? "0" : String.format(Locale.ENGLISH, "%,.0f", amount);
    }

    private static String formatDateTime(Instant instant) {
        return instant == null ? "N/A" : DISPLAY_FORMAT.format(instant);
    }
}
