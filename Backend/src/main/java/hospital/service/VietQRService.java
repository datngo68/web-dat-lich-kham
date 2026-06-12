package hospital.service;

import hospital.domain.Appointment;
import hospital.domain.Payment;
import hospital.repository.AppointmentRepository;
import hospital.repository.PaymentRepository;
import hospital.service.dto.VietQRPaymentDTO;
import java.util.Base64;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for VietQR payment integration (Mock implementation)
 */
@Service
@Transactional
public class VietQRService {

    private static final String BANK_ACCOUNT = "1234567890";
    private static final String BANK_NAME = "Vietcombank";
    private static final String ACCOUNT_NAME = "BENH VIEN SUNRISE";

    private final PaymentRepository paymentRepository;
    private final AppointmentRepository appointmentRepository;

    public VietQRService(PaymentRepository paymentRepository, AppointmentRepository appointmentRepository) {
        this.paymentRepository = paymentRepository;
        this.appointmentRepository = appointmentRepository;
    }

    /**
     * Generate VietQR payment information for an appointment
     */
    public VietQRPaymentDTO generateQRPayment(Long appointmentId) {
        Appointment appointment = appointmentRepository
            .findById(appointmentId)
            .orElseThrow(() -> new IllegalStateException("Appointment not found"));

        // Check if already paid
        if ("PAID".equals(appointment.getPaymentStatus())) {
            throw new IllegalStateException("Appointment already paid");
        }

        // Generate transfer content with appointment ID
        String transferContent = String.format("BVSH%d", appointmentId);

        // Generate mock QR code data (Base64 encoded placeholder)
        String qrCodeData = generateMockQRCode(BANK_ACCOUNT, appointment.getPrice(), transferContent);

        return new VietQRPaymentDTO(
            appointmentId,
            BANK_NAME,
            BANK_ACCOUNT,
            ACCOUNT_NAME,
            appointment.getPrice(),
            transferContent,
            qrCodeData
        );
    }

    /**
     * Process VietQR payment (Mock implementation)
     * In real implementation, this would be called by webhook from payment gateway
     */
    public Payment processVietQRPayment(Long appointmentId, String transactionId) {
        Appointment appointment = appointmentRepository
            .findById(appointmentId)
            .orElseThrow(() -> new IllegalStateException("Appointment not found"));

        // Check if already paid
        if ("PAID".equals(appointment.getPaymentStatus())) {
            throw new IllegalStateException("Appointment already paid");
        }

        // Create payment record
        Payment payment = new Payment();
        payment.setAppointment(appointment);
        payment.setUser(appointment.getUser());
        payment.setAmount(appointment.getPrice());
        payment.setPaymentMethod("VIETQR");
        payment.setStatus("SUCCESS");
        payment.setTransactionId(transactionId != null ? transactionId : generateMockTransactionId());
        paymentRepository.save(payment);

        // Update appointment payment status
        appointment.setPaymentStatus("PAID");
        appointmentRepository.save(appointment);

        return payment;
    }

    /**
     * Mock QR code generation
     * In real implementation, this would use VietQR API to generate actual QR code
     */
    private String generateMockQRCode(String accountNumber, Long amount, String content) {
        // Generate a simple mock QR data (in real app, would call VietQR API)
        String qrData = String.format(
            "VIETQR|BANK=%s|ACC=%s|AMOUNT=%s|CONTENT=%s",
            BANK_NAME,
            accountNumber,
            amount.toString(),
            content
        );
        return Base64.getEncoder().encodeToString(qrData.getBytes());
    }

    /**
     * Generate mock transaction ID
     */
    private String generateMockTransactionId() {
        return "VQR" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
