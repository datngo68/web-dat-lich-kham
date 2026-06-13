package hospital.web.rest;

import hospital.domain.BankConfiguration;
import hospital.repository.BankConfigurationRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/bank-configuration")
public class BankConfigurationResource {

    private static final long CONFIGURATION_ID = 1L;
    private final BankConfigurationRepository repository;

    public BankConfigurationResource(BankConfigurationRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<BankConfiguration> get() {
        return ResponseEntity.ok(repository.findById(CONFIGURATION_ID).orElseGet(this::defaultConfiguration));
    }

    @PutMapping
    public ResponseEntity<BankConfiguration> update(@Valid @RequestBody BankConfigurationRequest request) {
        BankConfiguration configuration = repository.findById(CONFIGURATION_ID).orElseGet(this::defaultConfiguration);
        configuration.setBankCode(request.bankCode().trim());
        configuration.setBankName(request.bankName().trim());
        configuration.setAccountNumber(request.accountNumber().trim());
        configuration.setAccountName(request.accountName().trim());
        configuration.setTransferTemplate(request.transferTemplate().trim());
        configuration.setVietqrEnabled(request.vietqrEnabled());
        return ResponseEntity.ok(repository.save(configuration));
    }

    private BankConfiguration defaultConfiguration() {
        BankConfiguration configuration = new BankConfiguration();
        configuration.setId(CONFIGURATION_ID);
        configuration.setBankCode("VCB");
        configuration.setBankName("Vietcombank");
        configuration.setAccountNumber("1234567890");
        configuration.setAccountName("BENH VIEN SUNRISE");
        configuration.setTransferTemplate("BVSH{appointmentId}");
        configuration.setVietqrEnabled(true);
        return configuration;
    }

    public record BankConfigurationRequest(
        @NotBlank String bankCode,
        @NotBlank String bankName,
        @NotBlank String accountNumber,
        @NotBlank String accountName,
        @NotBlank String transferTemplate,
        boolean vietqrEnabled
    ) {}
}
