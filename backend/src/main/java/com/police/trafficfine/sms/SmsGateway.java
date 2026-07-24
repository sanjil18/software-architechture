package com.police.trafficfine.sms;

public interface SmsGateway {


    boolean sendSms(String toPhoneNumber, String message);
}
