'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import viCommon from '@/public/locales/vi/common.json';
import viAdmin from '@/public/locales/vi/admin.json';
import viAuth from '@/public/locales/vi/auth.json';
import viDoctor from '@/public/locales/vi/doctor.json';
import viAppointment from '@/public/locales/vi/appointment.json';
import viPayment from '@/public/locales/vi/payment.json';
import enCommon from '@/public/locales/en/common.json';
import enAdmin from '@/public/locales/en/admin.json';
import enAuth from '@/public/locales/en/auth.json';
import enDoctor from '@/public/locales/en/doctor.json';
import enAppointment from '@/public/locales/en/appointment.json';
import enPayment from '@/public/locales/en/payment.json';

const namespaces = ['common', 'admin', 'auth', 'doctor', 'appointment', 'payment'];
const supportedLocales = ['vi', 'en'];

const resources = {
  vi: {
    common: viCommon,
    admin: viAdmin,
    auth: viAuth,
    doctor: viDoctor,
    appointment: viAppointment,
    payment: viPayment,
  },
  en: {
    common: enCommon,
    admin: enAdmin,
    auth: enAuth,
    doctor: enDoctor,
    appointment: enAppointment,
    payment: enPayment,
  },
};

const getInitialLocale = (): string => {
  if (typeof window === 'undefined') return 'vi';

  const savedLocale = localStorage.getItem('locale');
  return savedLocale && supportedLocales.includes(savedLocale) ? savedLocale : 'vi';
};

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getInitialLocale(),
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
