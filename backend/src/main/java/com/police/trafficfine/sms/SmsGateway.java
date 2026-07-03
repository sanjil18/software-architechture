package com.police.trafficfine.sms;

public interface SmsGateway {

    /**
     * Dispatch an SMS. Returns true if the message was accepted for delivery
     * (or mock-logged); false if an error occurred. Implementations must
     * never throw — failures are logged internally and signalled via the
     * return value so callers can record the outcome without crashing.
     */
    boolean sendSms(String toPhoneNumber, String message);
}
