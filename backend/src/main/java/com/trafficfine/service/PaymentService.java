package com.trafficfine.service;

import com.trafficfine.dto.PaymentDto;
import com.trafficfine.entity.Payment;
import com.trafficfine.entity.TrafficFine;
import com.trafficfine.repository.PaymentRepository;
import com.trafficfine.repository.TrafficFineRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final TrafficFineRepository fineRepository;
    private final PaymentRepository paymentRepository;
    private final SmsService smsService;

    @Transactional
    public PaymentDto.PaymentResponse processPayment(PaymentDto.PaymentRequest request) {
        TrafficFine fine = fineRepository
                .findByReferenceNumberAndCategory_CategoryCode(
                        request.getReferenceNumber(), request.getCategoryCode())
                .orElseThrow(() -> new RuntimeException("Fine not found"));

        if (fine.getStatus() == TrafficFine.FineStatus.PAID) {
            throw new RuntimeException("Fine already paid");
        }

        // Simulate payment gateway processing
        String transactionId = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        boolean paymentSuccess = simulatePaymentGateway(request);

        if (!paymentSuccess) {
            return PaymentDto.PaymentResponse.builder()
                    .success(false)
                    .message("Payment failed. Please try again.")
                    .build();
        }

        Payment payment = Payment.builder()
                .trafficFine(fine)
                .amount(fine.getAmount())
                .paymentMethod(Payment.PaymentMethod.valueOf(request.getPaymentMethod()))
                .status(Payment.PaymentStatus.SUCCESS)
                .transactionId(transactionId)
                .payerName(request.getPayerName())
                .payerEmail(request.getPayerEmail())
                .payerPhone(request.getPayerPhone())
                .paidAt(LocalDateTime.now())
                .channel(Payment.PaymentChannel.valueOf(request.getChannel()))
                .build();

        paymentRepository.save(payment);

        fine.setStatus(TrafficFine.FineStatus.PAID);
        fine.setPaidAt(LocalDateTime.now());
        fine.setPayment(payment);
        fineRepository.save(fine);

        // Send SMS to officer
        if (fine.getOfficer() != null && fine.getOfficer().getPhoneNumber() != null) {
            smsService.sendPaymentConfirmation(
                    fine.getOfficer().getPhoneNumber(),
                    fine.getDriverName(),
                    fine.getReferenceNumber(),
                    fine.getAmount().toPlainString()
            );
        }

        log.info("Payment successful for fine: {} | Transaction: {}", fine.getReferenceNumber(), transactionId);

        return PaymentDto.PaymentResponse.builder()
                .success(true)
                .message("Payment successful! The traffic officer has been notified via SMS.")
                .transactionId(transactionId)
                .amount(fine.getAmount())
                .paidAt(payment.getPaidAt())
                .referenceNumber(fine.getReferenceNumber())
                .build();
    }

    private boolean simulatePaymentGateway(PaymentDto.PaymentRequest request) {
        // In production, integrate with a real payment gateway (PayHere, iPay, etc.)
        // For now, simulate success for all valid requests
        return request.getPayerName() != null && !request.getPayerName().isEmpty();
    }
}
