package hospital.service.dto;

import java.time.Instant;

/**
 * DTO for Medical Record information
 */
public record MedicalRecordDTO(
    Long id,
    Long appointmentId,
    Long doctorId,
    Long userId,
    String diagnosis,
    String treatment,
    String notes,
    Instant createdAt
) {}
