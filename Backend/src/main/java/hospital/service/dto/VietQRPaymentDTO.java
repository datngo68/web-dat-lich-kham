package hospital.service.dto;

/**
 * DTO for VietQR Payment Information
 */
public record VietQRPaymentDTO(
    Long appointmentId,
    String bankName,
    String accountNumber,
    String accountName,
    Long amount,
    String transferContent,
    String qrCodeData
) {}
