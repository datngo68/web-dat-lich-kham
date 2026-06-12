'use client';

import { useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Sync locale on mount
    const savedLocale = localStorage.getItem('locale');
    if (savedLocale && i18n.language !== savedLocale) {
      i18n.changeLanguage(savedLocale);
    }
  }, []);

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
