'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type Locale = 'vi' | 'en';

interface Language {
  code: Locale;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [currentLocale, setCurrentLocale] = useState<Locale>('vi');

  useEffect(() => {
    const savedLocale = localStorage.getItem('locale') as Locale;
    const initialLocale = savedLocale === 'vi' || savedLocale === 'en' ? savedLocale : (i18n.language as Locale);

    if (initialLocale === 'vi' || initialLocale === 'en') {
      setCurrentLocale(initialLocale);
      void i18n.changeLanguage(initialLocale);
      document.documentElement.lang = initialLocale;
    }
  }, [i18n]);

  const handleLanguageChange = (locale: Locale) => {
    setCurrentLocale(locale);
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
    void i18n.changeLanguage(locale);
  };

  const currentLanguage = languages.find(lang => lang.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="gap-2 hover:bg-slate-100 transition-colors"
        >
          <Globe size={18} className="text-slate-600" />
          <span className="text-sm font-medium text-slate-700">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[160px]">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${
              currentLocale === language.code ? 'bg-blue-50 text-blue-700 font-bold' : ''
            }`}
          >
            <span className="mr-2 text-lg">{language.flag}</span>
            <span className="text-sm">{language.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
