package hospital.repository;

import hospital.domain.BankConfiguration;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BankConfigurationRepository extends JpaRepository<BankConfiguration, Long> {}
