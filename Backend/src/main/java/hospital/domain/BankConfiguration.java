package hospital.domain;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "bank_configuration")
public class BankConfiguration implements Serializable {

    @Id
    private Long id;

    @Column(name = "bank_code", nullable = false)
    private String bankCode;

    @Column(name = "bank_name", nullable = false)
    private String bankName;

    @Column(name = "account_number", nullable = false)
    private String accountNumber;

    @Column(name = "account_name", nullable = false)
    private String accountName;

    @Column(name = "transfer_template", nullable = false)
    private String transferTemplate;

    @Column(name = "vietqr_enabled", nullable = false)
    private boolean vietqrEnabled;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getBankCode() { return bankCode; }
    public void setBankCode(String bankCode) { this.bankCode = bankCode; }
    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }
    public String getAccountNumber() { return accountNumber; }
    public void setAccountNumber(String accountNumber) { this.accountNumber = accountNumber; }
    public String getAccountName() { return accountName; }
    public void setAccountName(String accountName) { this.accountName = accountName; }
    public String getTransferTemplate() { return transferTemplate; }
    public void setTransferTemplate(String transferTemplate) { this.transferTemplate = transferTemplate; }
    public boolean isVietqrEnabled() { return vietqrEnabled; }
    public void setVietqrEnabled(boolean vietqrEnabled) { this.vietqrEnabled = vietqrEnabled; }
}
