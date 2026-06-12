package hospital.web.rest;

import hospital.domain.Appointment;
import hospital.domain.Doctor;
import hospital.domain.MedicalRecord;
import hospital.domain.User;
import hospital.domain.enumeration.AppointmentStatus;
import hospital.repository.AppointmentRepository;
import hospital.repository.DoctorRepository;
import hospital.repository.MedicalRecordRepository;
import hospital.repository.UserRepository;
import hospital.security.AuthoritiesConstants;
import hospital.security.SecurityUtils;
import hospital.service.dto.AppointmentDTO;
import hospital.service.dto.DoctorStatsDTO;
import hospital.service.dto.MedicalRecordDTO;
import jakarta.annotation.security.RolesAllowed;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Doctor Dashboard operations.
 * Handles doctor-specific functionalities including appointment management,
 * medical records, and statistics.
 */
@RestController
@RequestMapping("/api/doctor")
@RolesAllowed(AuthoritiesConstants.DOCTOR)
public class DoctorDashboardResource {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final MedicalRecordRepository medicalRecordRepository;
    private final UserRepository userRepository;

    public DoctorDashboardResource(
        AppointmentRepository appointmentRepository,
        DoctorRepository doctorRepository,
        MedicalRecordRepository medicalRecordRepository,
        UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.medicalRecordRepository = medicalRecordRepository;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/doctor/appointments : Get all appointments for current doctor
     */
    @GetMapping("/appointments")
    public ResponseEntity<List<AppointmentDTO>> getDoctorAppointments(
        @RequestParam(required = false) String status,
        @RequestParam(required = false) LocalDate date
    ) {
        Doctor doctor = getCurrentDoctor();
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctor.getId());

        // Filter by status if provided
        if (status != null && !status.isBlank()) {
            appointments = appointments
                .stream()
                .filter(a -> a.getStatus() != null && a.getStatus().name().equalsIgnoreCase(status))
                .toList();
        }

        // Filter by date if provided
        if (date != null) {
            appointments = appointments.stream().filter(a -> a.getAppointmentDate().equals(date)).toList();
        }

        List<AppointmentDTO> dtos = appointments.stream().map(this::toDto).toList();
        return ResponseEntity.ok(dtos);
    }

    /**
     * PUT /api/doctor/appointments/{id}/confirm : Confirm an appointment
     */
    @PutMapping("/appointments/{id}/confirm")
    public ResponseEntity<AppointmentDTO> confirmAppointment(@PathVariable Long id) {
        Doctor doctor = getCurrentDoctor();
        Appointment appointment = appointmentRepository
            .findById(id)
            .orElseThrow(() -> new IllegalStateException("Appointment not found"));

        // Verify the appointment belongs to this doctor
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Only pending appointments can be confirmed
        if (appointment.getStatus() != AppointmentStatus.PENDING) {
            throw new IllegalStateException("Only pending appointments can be confirmed");
        }

        appointment.setStatus(AppointmentStatus.CONFIRMED);
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(toDto(appointment));
    }

    /**
     * PUT /api/doctor/appointments/{id}/complete : Mark appointment as completed
     */
    @PutMapping("/appointments/{id}/complete")
    public ResponseEntity<AppointmentDTO> completeAppointment(@PathVariable Long id) {
        Doctor doctor = getCurrentDoctor();
        Appointment appointment = appointmentRepository
            .findById(id)
            .orElseThrow(() -> new IllegalStateException("Appointment not found"));

        // Verify the appointment belongs to this doctor
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Only confirmed appointments can be completed
        if (appointment.getStatus() != AppointmentStatus.CONFIRMED) {
            throw new IllegalStateException("Only confirmed appointments can be completed");
        }

        appointment.setStatus(AppointmentStatus.COMPLETED);
        appointmentRepository.save(appointment);
        return ResponseEntity.ok(toDto(appointment));
    }

    /**
     * POST /api/doctor/medical-records : Create a medical record for a completed appointment
     */
    @PostMapping("/medical-records")
    public ResponseEntity<MedicalRecordDTO> createMedicalRecord(@RequestBody CreateMedicalRecordRequest request) {
        Doctor doctor = getCurrentDoctor();
        Appointment appointment = appointmentRepository
            .findById(request.appointmentId())
            .orElseThrow(() -> new IllegalStateException("Appointment not found"));

        // Verify the appointment belongs to this doctor
        if (!appointment.getDoctor().getId().equals(doctor.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Only completed appointments can have medical records
        if (appointment.getStatus() != AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Medical records can only be created for completed appointments");
        }

        MedicalRecord record = new MedicalRecord();
        record.setAppointment(appointment);
        record.setDoctor(doctor);
        record.setUser(appointment.getUser());
        record.setDiagnosis(request.diagnosis());
        record.setTreatment(request.treatment());
        record.setNotes(request.notes());
        medicalRecordRepository.save(record);

        return ResponseEntity.status(HttpStatus.CREATED).body(toMedicalRecordDto(record));
    }

    /**
     * GET /api/doctor/statistics : Get statistics for current doctor
     */
    @GetMapping("/statistics")
    public ResponseEntity<DoctorStatsDTO> getDoctorStatistics() {
        Doctor doctor = getCurrentDoctor();
        List<Appointment> appointments = appointmentRepository.findByDoctorId(doctor.getId());

        long totalAppointments = appointments.size();
        long pendingAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.PENDING).count();
        long confirmedAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED).count();
        long completedAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();

        // Today's appointments
        LocalDate today = LocalDate.now();
        long todayAppointments = appointments.stream().filter(a -> a.getAppointmentDate().equals(today)).count();

        DoctorStatsDTO stats = new DoctorStatsDTO(
            totalAppointments,
            pendingAppointments,
            confirmedAppointments,
            completedAppointments,
            todayAppointments
        );

        return ResponseEntity.ok(stats);
    }

    // Helper methods

    private Doctor getCurrentDoctor() {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new IllegalStateException("User not authenticated"));
        User user = userRepository.findOneByLogin(login).orElseThrow(() -> new IllegalStateException("User not found"));
        return doctorRepository.findByEmail(user.getEmail()).orElseThrow(() -> new IllegalStateException("Doctor profile not found for user: " + login));
    }

    private AppointmentDTO toDto(Appointment appointment) {
        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(appointment.getId());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setAppointmentTime(appointment.getAppointmentTime());
        dto.setStatus(appointment.getStatus() != null ? appointment.getStatus().name() : null);
        dto.setReason(appointment.getReason());
        dto.setNotes(appointment.getNotes());
        dto.setPrice(appointment.getPrice());
        dto.setPaymentStatus(appointment.getPaymentStatus());
        dto.setCreatedAt(appointment.getCreatedAt());

        // Set patient info
        if (appointment.getUser() != null) {
            dto.setPatientId(appointment.getUser().getId());
        }

        // Set doctor info
        if (appointment.getDoctor() != null) {
            dto.setDoctorId(appointment.getDoctor().getId());
            dto.setDoctorName(appointment.getDoctor().getFullName());
            dto.setDoctorPhone(appointment.getDoctor().getPhoneNumber());
        }

        // Set hospital info
        if (appointment.getHospital() != null) {
            dto.setHospitalId(appointment.getHospital().getId());
            dto.setHospitalName(appointment.getHospital().getName());
            dto.setHospitalAddress(appointment.getHospital().getAddress());
        }

        return dto;
    }

    private MedicalRecordDTO toMedicalRecordDto(MedicalRecord record) {
        return new MedicalRecordDTO(
            record.getId(),
            record.getAppointment() != null ? record.getAppointment().getId() : null,
            record.getDoctor() != null ? record.getDoctor().getId() : null,
            record.getUser() != null ? record.getUser().getId() : null,
            record.getDiagnosis(),
            record.getTreatment(),
            record.getNotes(),
            record.getCreatedAt()
        );
    }

    // Request DTOs

    public record CreateMedicalRecordRequest(
        Long appointmentId,
        String diagnosis,
        String treatment,
        String prescription,
        String notes
    ) {}
}
