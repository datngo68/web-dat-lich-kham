'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { 
  LayoutDashboard, 
  Users, 
  Stethoscope, 
  Calendar, 
  Building2, 
  Activity, 
  BarChart3,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  translationKey: string;
}

export function AdminSidebar() {
  const { t } = useTranslation('admin');
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const menuItems: MenuItem[] = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      href: '/admin',
      translationKey: 'menu.dashboard'
    },
    { 
      icon: Users, 
      label: 'Users', 
      href: '/admin/users',
      translationKey: 'menu.users'
    },
    { 
      icon: Stethoscope, 
      label: 'Doctors', 
      href: '/admin/doctors',
      translationKey: 'menu.doctors'
    },
    { 
      icon: Calendar, 
      label: 'Appointments', 
      href: '/admin/appointments',
      translationKey: 'menu.appointments'
    },
    { 
      icon: Building2, 
      label: 'Hospitals', 
      href: '/admin/hospitals',
      translationKey: 'menu.hospitals'
    },
    { 
      icon: Activity, 
      label: 'Specialties', 
      href: '/admin/specialties',
      translationKey: 'menu.specialties'
    },
    { 
      icon: BarChart3, 
      label: 'Statistics', 
      href: '/admin/statistics',
      translationKey: 'menu.statistics'
    },
  ];

  return (
    <div 
      className={cn(
        "relative flex flex-col h-screen bg-slate-900 text-slate-300 transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo Section */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <span className="font-bold text-white text-lg">Sunrise</span>
          </Link>
        )}
        {isCollapsed && (
          <Link href="/admin" className="flex items-center justify-center w-full">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
          </Link>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                    isActive 
                      ? "bg-primary/10 text-primary border-l-4 border-primary" 
                      : "hover:bg-slate-800 hover:text-white",
                    isCollapsed && "justify-center"
                  )}
                  title={isCollapsed ? t(item.translationKey) : undefined}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="text-sm font-medium">
                      {t(item.translationKey)}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Collapse Toggle Button */}
      <div className="p-4 border-t border-slate-800">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "w-full text-slate-400 hover:text-white hover:bg-slate-800",
            isCollapsed && "justify-center"
          )}
        >
          {isCollapsed ? (
            <ChevronRight size={20} />
          ) : (
            <>
              <ChevronLeft size={20} />
              <span className="ml-2 text-sm">{t('sidebar.collapse')}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
