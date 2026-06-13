# Hệ thống đặt lịch khám Sunrise

Dự án web đặt lịch khám gồm frontend Next.js và backend Spring Boot/JHipster. Hệ thống hỗ trợ bệnh nhân đặt lịch, bác sĩ quản lý lịch khám/hồ sơ bệnh án, quản trị viên quản lý dữ liệu vận hành và cấu hình thanh toán.

## Tính năng chính

### Người dùng / bệnh nhân
- Đăng ký, đăng nhập bằng JWT.
- Tìm kiếm bác sĩ theo chuyên khoa, đánh giá và thông tin bệnh viện.
- Đặt lịch khám, xem lịch khám, theo dõi trạng thái thanh toán.
- Xem hồ sơ bệnh án sau khi bác sĩ hoàn tất khám.
- Thanh toán qua các luồng thanh toán được cấu hình trong hệ thống.

### Bác sĩ
- Tài khoản bác sĩ được tạo từ màn quản trị kèm login/password và quyền `ROLE_DOCTOR`.
- Đăng nhập vào khu vực bác sĩ tại `/doctor-dashboard`.
- Xem lịch khám được gán cho bác sĩ đang đăng nhập.
- Duyệt lịch khám chờ xác nhận.
- Hoàn tất lịch khám đã xác nhận.
- Nhập hồ sơ bệnh án gồm chẩn đoán, điều trị/kê đơn và ghi chú.

### Quản trị viên
- Dashboard quản trị tổng quan.
- Quản lý người dùng, bác sĩ, bệnh viện, chuyên khoa và lịch khám.
- Tạo tài khoản bác sĩ đầy đủ thông tin đăng nhập.
- Cấu hình ngân hàng nhận thanh toán VietQR tại `/admin/settings`.
- Xem thống kê doanh thu, lịch khám, bác sĩ và bệnh nhân.

### Thanh toán
- Cấu hình tài khoản ngân hàng/VietQR lưu trong cơ sở dữ liệu.
- VietQR đọc cấu hình từ DB, không hardcode thông tin ngân hàng.
- Có nền tảng UI cho các phương thức như VNPay, MoMo, thẻ; các cổng thật có thể được tích hợp tiếp.

## Công nghệ sử dụng

### Frontend
- Next.js
- TypeScript
- Zustand
- Tailwind CSS
- shadcn/ui
- Axios
- i18next/react-i18next

### Backend
- Spring Boot 3
- JHipster 8
- Spring Security JWT
- Spring Data JPA
- Liquibase
- PostgreSQL

## Cấu trúc thư mục

```text
.
├── Backend/   # Spring Boot/JHipster API
└── Fontend/   # Next.js frontend
```

## Chạy dự án local

### 1. Chạy PostgreSQL bằng Docker

```bash
cd Backend
docker compose -f "src/main/docker/postgresql.yml" up -d
```

PostgreSQL dev chạy ở `localhost:5433`.

### 2. Chạy backend

```bash
cd Backend
./mvnw spring-boot:run "-Dspring-boot.run.jvmArguments=-Dspring.docker.compose.enabled=false"
```

Backend chạy ở `http://localhost:8080`.

### 3. Chạy frontend

```bash
cd Fontend
npm install
npm run dev
```

Frontend chạy ở `http://localhost:3000`.

## Luồng kiểm thử nhanh

1. Đăng nhập admin.
2. Vào `/admin/doctors` tạo bác sĩ mới, nhập `login` và `password`.
3. Đăng xuất admin, đăng nhập bằng tài khoản bác sĩ vừa tạo.
4. Vào `/doctor-dashboard` để xem lịch, duyệt lịch, hoàn tất khám và nhập hồ sơ bệnh án.
5. Vào `/admin/settings` để cấu hình tài khoản ngân hàng nhận thanh toán VietQR.

## Ghi chú phát triển

- Không commit thư mục build/cache như `Backend/target` hoặc `Fontend/.next`.
- Các thay đổi DB được quản lý bằng Liquibase trong `Backend/src/main/resources/config/liquibase/changelog`.
- Các API frontend tập trung trong `Fontend/services/api.ts`.
- File locale nằm trong `Fontend/public/locales`.
