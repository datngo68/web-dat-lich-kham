package hospital.web.rest;

import hospital.domain.Doctor;
import hospital.domain.Hospital;
import hospital.repository.DoctorRepository;
import hospital.repository.HospitalRepository;
import hospital.service.dto.PageResponseDTO;
import hospital.service.dto.PaginationDTO;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HospitalResource {

    private final HospitalRepository hospitalRepository;
    private final DoctorRepository doctorRepository;

    public HospitalResource(HospitalRepository hospitalRepository, DoctorRepository doctorRepository) {
        this.hospitalRepository = hospitalRepository;
        this.doctorRepository = doctorRepository;
    }

    @GetMapping("/hospitals")
    public ResponseEntity<PageResponseDTO<Map<String, Object>>> listHospitals(
        @RequestParam(defaultValue = "1") int page,
        @RequestParam(defaultValue = "10") int limit,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "rating") String sortBy
    ) {
        Specification<Hospital> spec = Specification.where(null);
        if (search != null && !search.isBlank()) {
            String like = "%" + search.toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                cb.or(cb.like(cb.lower(root.get("name")), like), cb.like(cb.lower(root.get("address")), like))
            );
        }
        Page<Hospital> pageData = hospitalRepository.findAll(
            spec,
            PageRequest.of(Math.max(page - 1, 0), limit, Sort.by(Sort.Direction.DESC, sortBy))
        );
        List<Map<String, Object>> data = pageData.getContent().stream().map(this::toSummary).toList();
        return ResponseEntity.ok(
            new PageResponseDTO<>(data, new PaginationDTO(page, limit, pageData.getTotalElements(), pageData.getTotalPages()))
        );
    }

    @GetMapping("/hospitals/{id}")
    public ResponseEntity<Map<String, Object>> getHospital(@PathVariable Long id) {
        Hospital hospital = hospitalRepository.findById(id).orElseThrow(() -> new IllegalStateException("Hospital not found"));
        return ResponseEntity.ok(toDetail(hospital));
    }

    @PostMapping("/admin/hospitals")
    public ResponseEntity<Map<String, Object>> createHospital(@RequestBody HospitalRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Hospital name is required"));
        }
        Hospital hospital = new Hospital();
        applyRequest(hospital, request);
        hospital.setRating(request.rating() != null ? request.rating() : 0D);
        hospital.setReviewCount(request.reviewCount() != null ? request.reviewCount() : 0);
        return ResponseEntity.status(HttpStatus.CREATED).body(toSummary(hospitalRepository.save(hospital)));
    }

    @PutMapping("/admin/hospitals/{id}")
    public ResponseEntity<Map<String, Object>> updateHospital(@PathVariable Long id, @RequestBody HospitalRequest request) {
        return hospitalRepository.findById(id).map(hospital -> {
            if (request.name() == null || request.name().isBlank()) {
                return ResponseEntity.badRequest().body(Map.<String, Object>of("message", "Hospital name is required"));
            }
            applyRequest(hospital, request);
            return ResponseEntity.ok(toSummary(hospitalRepository.save(hospital)));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/admin/hospitals/{id}")
    public ResponseEntity<Void> deleteHospital(@PathVariable Long id) {
        if (!hospitalRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        boolean hasDoctors = doctorRepository.findAll().stream()
            .anyMatch(doctor -> doctor.getHospital() != null && id.equals(doctor.getHospital().getId()));
        if (hasDoctors) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        hospitalRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyRequest(Hospital hospital, HospitalRequest request) {
        hospital.setName(request.name().trim());
        hospital.setAddress(request.address());
        hospital.setPhone(request.phone());
        hospital.setEmail(request.email());
        hospital.setAvatar(request.avatar());
        hospital.setDescription(request.description());
        if (request.rating() != null) hospital.setRating(request.rating());
        if (request.reviewCount() != null) hospital.setReviewCount(request.reviewCount());
    }

    private record HospitalRequest(
        String name,
        String address,
        String phone,
        String email,
        String avatar,
        Double rating,
        Integer reviewCount,
        String description
    ) {}

    private Map<String, Object> toSummary(Hospital hospital) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", hospital.getId());
        map.put("name", hospital.getName());
        map.put("address", hospital.getAddress());
        map.put("phone", hospital.getPhone());
        map.put("email", hospital.getEmail());
        map.put("avatar", hospital.getAvatar());
        map.put("rating", hospital.getRating());
        map.put("reviewCount", hospital.getReviewCount());
        map.put("description", hospital.getDescription());
        List<Doctor> doctors = doctorRepository
            .findAll()
            .stream()
            .filter(d -> d.getHospital() != null && d.getHospital().getId().equals(hospital.getId()))
            .toList();
        map.put("doctorCount", doctors.size());
        map.put("serviceCount", 3);
        return map;
    }

    private Map<String, Object> toDetail(Hospital hospital) {
        Map<String, Object> map = toSummary(hospital);
        map.put("services", List.of("Khám tổng quát", "Chụp X-quang", "Siêu âm"));
        List<Map<String, Object>> doctors = doctorRepository
            .findAll()
            .stream()
            .filter(d -> d.getHospital() != null && d.getHospital().getId().equals(hospital.getId()))
            .map(this::doctorCard)
            .toList();
        map.put("doctors", doctors);
        return map;
    }

    private Map<String, Object> doctorCard(Doctor doctor) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("id", doctor.getId());
        map.put("fullName", doctor.getFullName());
        map.put("specialty", doctor.getSpecialty() != null ? doctor.getSpecialty().getName() : null);
        map.put("avatar", doctor.getAvatar());
        map.put("rating", doctor.getRating());
        return map;
    }
}
