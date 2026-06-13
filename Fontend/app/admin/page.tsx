'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Stethoscope,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { apiService } from '@/services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';

export default function AdminDashboard() {
  const router = useRouter();
  const { t, i18n } = useTranslation('admin');
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [pendingAppointments, setPendingAppointments] = useState<any[]>([]);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isApproving, setIsApproving] = useState<string | null>(null);

  useEffect(() => {
    const role = user?.role?.toUpperCase();
    const hasAccess = role === 'ADMIN' || role === 'ROLE_ADMIN';

    if (!isInitialized) return;

    if (!isAuthenticated || !hasAccess) {
      router.push('/');
      return;
    }

    fetchDashboardData();
  }, [isAuthenticated, user?.role, router, isInitialized]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch stats
      const statsResponse = await apiService.getAdminDashboard();
      setStats(statsResponse);

      // Fetch pending appointments
      const pendingResponse = await apiService.getAllAppointments(1, 5, 'PENDING');
      const appointments = pendingResponse?.data?.content || [];
      setPendingAppointments(appointments);

      // Generate recent activities from various sources
      const activities = await generateRecentActivities();
      setRecentActivities(activities);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateRecentActivities = async () => {
    try {
      const [appointmentsRes, usersRes, doctorsRes] = await Promise.all([
        apiService.getAllAppointments(1, 3).catch(() => ({ data: { content: [] } })),
        apiService.getAllUsers(1, 2).catch(() => ({ data: { content: [] } })),
        apiService.getAllDoctors(1, 2).catch(() => ({ data: { content: [] } })),
      ]);

      const activities: any[] = [];

      // Add appointment activities
      const appointments = appointmentsRes?.data?.content || [];
      appointments.forEach((apt: any) => {
        activities.push({
          id: `apt-${apt.id}`,
          userName: apt.patientName || 'Unknown',
          action: 'booked',
          entity: `Appointment with ${apt.doctorName || 'Doctor'}`,
          timestamp: apt.createdDate || apt.appointmentDate,
        });
      });

      // Add user activities
      const users = usersRes?.data?.content || [];
      users.forEach((u: any) => {
        activities.push({
          id: `user-${u.id}`,
          userName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.login,
          action: 'registered',
          entity: 'User account',
          timestamp: u.createdDate,
        });
      });

      // Add doctor activities
      const doctors = doctorsRes?.data?.content || [];
      doctors.forEach((d: any) => {
        activities.push({
          id: `doc-${d.id}`,
          userName: d.fullName || 'Doctor',
          action: 'created',
          entity: 'Doctor profile',
          timestamp: d.createdDate,
        });
      });

      // Sort by timestamp descending
      return activities
        .filter(a => a.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);
    } catch (error) {
      console.error('Failed to generate activities:', error);
      return [];
    }
  };

  const handleApproveAppointment = async (id: string) => {
    try {
      setIsApproving(id);
      await apiService.updateAppointmentStatus(id, 'CONFIRMED');
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to approve appointment:', error);
    } finally {
      setIsApproving(null);
    }
  };

  const handleRejectAppointment = async (id: string) => {
    try {
      setIsApproving(id);
      await apiService.updateAppointmentStatus(id, 'CANCELLED');
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to reject appointment:', error);
    } finally {
      setIsApproving(null);
    }
  };

  const formatActivityTime = (timestamp: string) => {
    try {
      const locale = i18n.language === 'vi' ? vi : enUS;
      return format(new Date(timestamp), 'MMM dd, HH:mm', { locale });
    } catch {
      return timestamp;
    }
  };

  const role = user?.role?.toUpperCase();
  const hasAccess = role === 'ADMIN' || role === 'ROLE_ADMIN';

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated || !hasAccess) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            label: t('metrics.totalPatients'), 
            value: stats?.totalUsers || 0, 
            icon: Users, 
            trend: '+12%', 
            isUp: true, 
            color: 'blue' 
          },
          { 
            label: t('metrics.totalAppointments'), 
            value: stats?.totalAppointments || 0, 
            icon: Calendar, 
            trend: '+8%', 
            isUp: true, 
            color: 'emerald' 
          },
          { 
            label: t('metrics.platformRevenue'), 
            value: `$${((stats?.totalRevenue || 0) / 1000).toFixed(1)}K`, 
            icon: DollarSign, 
            trend: '-2%', 
            isUp: false, 
            color: 'amber' 
          },
          { 
            label: t('metrics.doctorAvailability'), 
            value: stats?.totalDoctors || 0, 
            icon: Stethoscope, 
            trend: '+5%', 
            isUp: true, 
            color: 'violet' 
          },
        ].map((metric, i) => (
          <Card key={i} className="border-0 shadow-sm hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-${metric.color}-50 text-${metric.color}-600`}>
                  <metric.icon size={24} />
                </div>
                <Badge 
                  variant="outline" 
                  className={`border-none ${
                    metric.isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                  } flex items-center gap-1`}
                >
                  {metric.isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {metric.trend}
                </Badge>
              </div>
              <h3 className="text-slate-500 text-sm font-medium mb-1">{metric.label}</h3>
              <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pending Approvals Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('pendingApprovals.title')}</CardTitle>
          <CardDescription>{t('pendingApprovals.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : pendingAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t('pendingApprovals.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('pendingApprovals.patient')}</TableHead>
                  <TableHead>{t('pendingApprovals.doctor')}</TableHead>
                  <TableHead>{t('pendingApprovals.date')}</TableHead>
                  <TableHead className="text-right">{t('pendingApprovals.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingAppointments.map((apt: any) => (
                  <TableRow key={apt.id}>
                    <TableCell className="font-medium">{apt.patientName || 'N/A'}</TableCell>
                    <TableCell>{apt.doctorName || 'N/A'}</TableCell>
                    <TableCell>{apt.appointmentDate || 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleApproveAppointment(apt.id)}
                          disabled={isApproving === apt.id}
                          className="bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isApproving === apt.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle className="h-4 w-4 mr-1" />
                              {t('pendingApprovals.approve')}
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectAppointment(apt.id)}
                          disabled={isApproving === apt.id}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          {t('pendingApprovals.reject')}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Activities Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>{t('recentActivities.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="h-64 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : recentActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              {t('recentActivities.noData')}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('recentActivities.user')}</TableHead>
                  <TableHead>{t('recentActivities.action')}</TableHead>
                  <TableHead>{t('recentActivities.entity')}</TableHead>
                  <TableHead className="text-right">{t('recentActivities.time')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentActivities.map((activity: any) => (
                  <TableRow key={activity.id}>
                    <TableCell className="font-medium">{activity.userName}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {t(`recentActivities.actions.${activity.action}`)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">{activity.entity}</TableCell>
                    <TableCell className="text-right text-slate-500 text-sm">
                      {formatActivityTime(activity.timestamp)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Mini Charts - Reduced size */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Revenue Chart - Smaller */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('charts.revenueAnalytics.title')}</CardTitle>
            <CardDescription className="text-sm">{t('charts.revenueAnalytics.description')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueStats || []}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Weekly Appointments Bar Chart - Smaller */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{t('charts.weeklyEngagement.title')}</CardTitle>
            <CardDescription className="text-sm">{t('charts.weeklyEngagement.description')}</CardDescription>
          </CardHeader>
          <CardContent className="h-[250px]">
            {isLoading ? (
              <div className="w-full h-full bg-slate-50 rounded-xl animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats?.dailyStats || []}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="appointments" fill="#3B82F6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

