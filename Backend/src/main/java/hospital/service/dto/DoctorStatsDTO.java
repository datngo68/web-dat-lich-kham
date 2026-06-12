package hospital.service.dto;

/**
 * DTO for Doctor Statistics
 */
public record DoctorStatsDTO(
    long totalAppointments,
    long pendingAppointments,
    long confirmedAppointments,
    long completedAppointments,
    long todayAppointments
) {}
