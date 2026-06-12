'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Define translations inline to avoid import issues
const resources = {
  vi: {
    common: {
      welcome: "Chào mừng",
      loading: "Đang tải...",
      error: "Có lỗi xảy ra"
    },
    admin: {
      title: "Quản trị",
      dashboard: "Bảng điều khiển",
      header: {
        badge: "Administrator",
        title: "Trung tâm",
        subtitle: "Điều hành",
        description: "Giám sát hiệu suất và hoạt động của Bệnh viện Sunrise",
        searchPlaceholder: "Tìm kiếm...",
        exportButton: "Xuất phân tích"
      },
      metrics: {
        totalPatients: "Tổng bệnh nhân",
        totalAppointments: "Tổng lịch khám",
        platformRevenue: "Doanh thu nền tảng",
        doctorAvailability: "Bác sĩ sẵn sàng"
      },
      appointmentStatus: {
        pending: "Chờ xử lý",
        scheduled: "Đã lên lịch",
        completed: "Hoàn thành",
        cancelled: "Đã hủy"
      },
      charts: {
        revenueAnalytics: {
          title: "Phân tích doanh thu",
          description: "Tăng trưởng doanh thu hàng tháng và dự báo",
          monthly: "Hàng tháng",
          yearly: "Hàng năm"
        },
        appointmentStatus: {
          title: "Trạng thái lịch khám",
          description: "Phân bổ theo trạng thái hiện tại"
        },
        weeklyEngagement: {
          title: "Tương tác hàng tuần",
          description: "Số lượng lịch khám hàng ngày trong tuần hiện tại",
          peak: "Cao điểm: Thứ Sáu"
        }
      },
      operations: {
        title: "Quản lý vận hành",
        accessModule: "Truy cập mô-đun",
        modules: {
          userBase: {
            title: "Người dùng",
            description: "Bệnh nhân và nhân viên y tế"
          },
          specialists: {
            title: "Chuyên gia",
            description: "Hồ sơ và lịch bác sĩ"
          },
          specialtyHub: {
            title: "Trung tâm chuyên khoa",
            description: "Khoa và đơn vị y tế"
          },
          appointments: {
            title: "Lịch khám",
            description: "Nhật ký đặt khám và trạng thái"
          },
          analytics: {
            title: "Phân tích",
            description: "Báo cáo kinh doanh chi tiết"
          }
        }
      }
    }
  },
  en: {
    common: {
      welcome: "Welcome",
      loading: "Loading...",
      error: "An error occurred"
    },
    admin: {
      title: "Administration",
      dashboard: "Dashboard",
      header: {
        badge: "Administrator",
        title: "Command",
        subtitle: "Center",
        description: "Monitoring Sunrise Hospital performance and operations",
        searchPlaceholder: "Search everything...",
        exportButton: "Export Analytics"
      },
      metrics: {
        totalPatients: "Total Patients",
        totalAppointments: "Total Appointments",
        platformRevenue: "Platform Revenue",
        doctorAvailability: "Doctor Availability"
      },
      appointmentStatus: {
        pending: "Pending",
        scheduled: "Scheduled",
        completed: "Completed",
        cancelled: "Cancelled"
      },
      charts: {
        revenueAnalytics: {
          title: "Revenue Analytics",
          description: "Monthly revenue growth and projections",
          monthly: "Monthly",
          yearly: "Yearly"
        },
        appointmentStatus: {
          title: "Appointment Status",
          description: "Distribution by current state"
        },
        weeklyEngagement: {
          title: "Weekly Engagement",
          description: "Daily appointment volume for the current week",
          peak: "Peak: Friday"
        }
      },
      operations: {
        title: "Operations Management",
        accessModule: "Access Module",
        modules: {
          userBase: {
            title: "User Base",
            description: "Patients and medical staff"
          },
          specialists: {
            title: "Specialists",
            description: "Doctor profiles & schedules"
          },
          specialtyHub: {
            title: "Specialty Hub",
            description: "Medical departments & units"
          },
          appointments: {
            title: "Appointments",
            description: "Booking logs & status"
          },
          analytics: {
            title: "Analytics",
            description: "Detailed business reports"
          }
        }
      }
    }
  }
};

// Get initial locale from localStorage or default to 'vi'
const getInitialLocale = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('locale') || 'vi';
  }
  return 'vi';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLocale(),
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: ['common', 'admin'],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;

