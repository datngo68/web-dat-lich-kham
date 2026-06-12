package hospital.web.rest;

import hospital.domain.Appointment;
import hospital.domain.Doctor;
import hospital.domain.Payment;
import hospital.domain.User;
import hospital.domain.enumeration.AppointmentStatus;
import hospital.repository.AppointmentRepository;
import hospital.repository.DoctorRepository;
import hospital.repository.PaymentRepository;
import hospital.repository.UserRepository;
import hospital.security.AuthoritiesConstants;
import jakarta.annotation.security.RolesAllowed;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for Statistics endpoints.
 * Provides aggregated data for revenue, appointments, doctors, and patients.
 */
@RestController
@RequestMapping("/api/statistics")
@RolesAllowed(AuthoritiesConstants.ADMIN)
public class StatisticsResource {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    public StatisticsResource(
        AppointmentRepository appointmentRepository,
        DoctorRepository doctorRepository,
        PaymentRepository paymentRepository,
        UserRepository userRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.paymentRepository = paymentRepository;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/statistics/revenue : Get revenue statistics
     */
    @GetMapping("/revenue")
    public ResponseEntity<Map<String, Object>> getRevenueStatistics(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {
        List<Payment> payments = paymentRepository.findAll();

        // Filter by date range if provided
        if (startDate != null || endDate != null) {
            payments = payments
                .stream()
                .filter(p -> {
                    if (p.getCreatedAt() == null) return false;
                    LocalDate paymentDate = p.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toLocalDate();
                    if (startDate != null && paymentDate.isBefore(startDate)) return false;
                    if (endDate != null && paymentDate.isAfter(endDate)) return false;
                    return true;
                })
                .toList();
        }

        // Calculate statistics
        BigDecimal totalRevenue = payments
            .stream()
            .filter(p -> "SUCCESS".equals(p.getStatus()))
            .map(p -> BigDecimal.valueOf(p.getAmount() != null ? p.getAmount() : 0))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        long totalTransactions = payments.stream().filter(p -> "SUCCESS".equals(p.getStatus())).count();

        // Revenue by payment method
        Map<String, BigDecimal> revenueByMethod = new HashMap<>();
        payments
            .stream()
            .filter(p -> "SUCCESS".equals(p.getStatus()))
            .forEach(p -> {
                String method = p.getPaymentMethod() != null ? p.getPaymentMethod() : "UNKNOWN";
                BigDecimal amount = BigDecimal.valueOf(p.getAmount() != null ? p.getAmount() : 0);
                revenueByMethod.merge(method, amount, BigDecimal::add);
            });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalRevenue", totalRevenue);
        response.put("totalTransactions", totalTransactions);
        response.put("revenueByMethod", revenueByMethod);
        response.put("averageTransactionValue", totalTransactions > 0 ? totalRevenue.divide(BigDecimal.valueOf(totalTransactions), 2, java.math.RoundingMode.HALF_UP) : BigDecimal.ZERO);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/statistics/appointments : Get appointment statistics
     */
    @GetMapping("/appointments")
    public ResponseEntity<Map<String, Object>> getAppointmentStatistics(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {
        List<Appointment> appointments = appointmentRepository.findAll();

        // Filter by date range if provided
        if (startDate != null || endDate != null) {
            appointments = appointments
                .stream()
                .filter(a -> {
                    LocalDate appointmentDate = a.getAppointmentDate();
                    if (startDate != null && appointmentDate.isBefore(startDate)) return false;
                    if (endDate != null && appointmentDate.isAfter(endDate)) return false;
                    return true;
                })
                .toList();
        }

        // Calculate statistics
        long totalAppointments = appointments.size();
        long pendingAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.PENDING).count();
        long confirmedAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CONFIRMED).count();
        long completedAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.COMPLETED).count();
        long cancelledAppointments = appointments.stream().filter(a -> a.getStatus() == AppointmentStatus.CANCELLED).count();

        // Appointments by date
        Map<String, Long> appointmentsByDate = new TreeMap<>();
        appointments.forEach(a -> {
            String dateKey = a.getAppointmentDate().toString();
            appointmentsByDate.merge(dateKey, 1L, Long::sum);
        });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalAppointments", totalAppointments);
        response.put("pendingAppointments", pendingAppointments);
        response.put("confirmedAppointments", confirmedAppointments);
        response.put("completedAppointments", completedAppointments);
        response.put("cancelledAppointments", cancelledAppointments);
        response.put("appointmentsByDate", appointmentsByDate);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/statistics/doctors : Get doctor statistics
     */
    @GetMapping("/doctors")
    public ResponseEntity<Map<String, Object>> getDoctorStatistics() {
        List<Doctor> doctors = doctorRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();

        // Calculate statistics
        long totalDoctors = doctors.size();

        // Appointments by doctor
        Map<String, Long> appointmentsByDoctor = new LinkedHashMap<>();
        Map<String, BigDecimal> revenueByDoctor = new LinkedHashMap<>();
        
        doctors.forEach(doctor -> {
            String doctorName = doctor.getFullName() != null ? doctor.getFullName() : "Doctor " + doctor.getId();
            long appointmentCount = appointments.stream().filter(a -> a.getDoctor() != null && a.getDoctor().getId().equals(doctor.getId())).count();
            appointmentsByDoctor.put(doctorName, appointmentCount);

            BigDecimal revenue = appointments
                .stream()
                .filter(a -> a.getDoctor() != null && a.getDoctor().getId().equals(doctor.getId()) && "PAID".equals(a.getPaymentStatus()))
                .map(a -> BigDecimal.valueOf(a.getPrice() != null ? a.getPrice() : 0))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            revenueByDoctor.put(doctorName, revenue);
        });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalDoctors", totalDoctors);
        response.put("appointmentsByDoctor", appointmentsByDoctor);
        response.put("revenueByDoctor", revenueByDoctor);

        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/statistics/patients : Get patient statistics
     */
    @GetMapping("/patients")
    public ResponseEntity<Map<String, Object>> getPatientStatistics(
        @RequestParam(required = false) LocalDate startDate,
        @RequestParam(required = false) LocalDate endDate
    ) {
        List<User> users = userRepository.findAll();
        List<Appointment> appointments = appointmentRepository.findAll();

        // Filter appointments by date range if provided
        if (startDate != null || endDate != null) {
            appointments = appointments
                .stream()
                .filter(a -> {
                    LocalDate appointmentDate = a.getAppointmentDate();
                    if (startDate != null && appointmentDate.isBefore(startDate)) return false;
                    if (endDate != null && appointmentDate.isAfter(endDate)) return false;
                    return true;
                })
                .toList();
        }

        // Calculate statistics
        long totalPatients = users
            .stream()
            .filter(u ->
                u.getAuthorities() != null &&
                u.getAuthorities().stream().anyMatch(a -> AuthoritiesConstants.USER.equals(a.getName()))
            )
            .count();

        // Active patients (those with appointments)
        Set<Long> activePatientsIds = appointments.stream().map(a -> a.getUser() != null ? a.getUser().getId() : null).filter(Objects::nonNull).collect(java.util.stream.Collectors.toSet());
        long activePatients = activePatientsIds.size();

        // New patients registration trend (by creation date)
        Map<String, Long> newPatientsByMonth = new TreeMap<>();
        users
            .stream()
            .filter(u ->
                u.getAuthorities() != null &&
                u.getAuthorities().stream().anyMatch(a -> AuthoritiesConstants.USER.equals(a.getName())) &&
                u.getCreatedDate() != null
            )
            .forEach(u -> {
                String monthKey = u
                    .getCreatedDate()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDate()
                    .withDayOfMonth(1)
                    .toString();
                newPatientsByMonth.merge(monthKey, 1L, Long::sum);
            });

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("totalPatients", totalPatients);
        response.put("activePatients", activePatients);
        response.put("newPatientsByMonth", newPatientsByMonth);

        return ResponseEntity.ok(response);
    }
}
