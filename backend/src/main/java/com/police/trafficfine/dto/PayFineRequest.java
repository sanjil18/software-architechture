package com.police.trafficfine.dto;

import com.police.trafficfine.model.PaymentMethod;
import lombok.Data;

@Data
public class PayFineRequest {
    private PaymentMethod paymentMethod;
    private String paymentReference;
    /** Driver's phone for SMS confirmation. Used if no phone was recorded on the fine. */
    private String notifyPhone;
}
