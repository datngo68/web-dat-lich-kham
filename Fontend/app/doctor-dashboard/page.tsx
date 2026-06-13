'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, CheckCircle, Clock, FileText, Loader2, Stethoscope, UserCheck, X } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/stores/authStore';
import { apiService } from '@/services/api';

interface DoctorAppointment {
  id: number;
  patientId?: number;
  appointmentDate?: string;
  appointmentTime?: string;
  status?: string;
  reason?: string;
  notes?: string;
  price?: number;
  paymentStatus?: string;
  hospitalName?: string;
}

const emptyRecord = { diagnosis: '', treatment: '', notes: '' };

export default function DoctorDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();
  const [appointments, setAppointments] = useState<DoctorAppointment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<DoctorAppointment | null>(null);
  const [recordForm, setRecordForm] = useState(emptyRecord);
  const [isRecordOpen, setIsRecordOpen] = useState(false);
  const [isSavingRecord, setIsSavingRecord] = useState(false);

  const isDoctor = useMemo(() => {
    const role = user?.role?.toUpperCase();
    return role === 'DOCTOR' || role === 'ROLE_DOCTOR';
  }, [user?.role]);

  const loadDoctorData = async () => {
    setIsLoading(true);
    try {
      const [appointmentData, statsData] = await Promise.all([
        apiService.getDoctorAppointments(),
        apiService.getDoctorStatistics().catch(() => null),
      ]);
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);
      setStats(statsData);
    } catch (error: any) {
      toast({ title: 'Không thể tải dữ liệu bác sĩ', description: error.response?.data?.message || 'Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    if (!isDoctor) return;
    void loadDoctorData();
  }, [isAuthenticated, isDoctor, router]);

  const handleConfirm = async (id: number) => {
    try {
      await apiService.confirmDoctorAppointment(id);
      toast({ title: 'Đã duyệt lịch khám' });
      await loadDoctorData();
    } catch (error: any) {
      toast({ title: 'Duyệt lịch thất bại', description: error.response?.data?.message || 'Không thể cập nhật lịch.', variant: 'destructive' });
    }
  };

  const handleComplete = async (id: number) => {
    try {
      const appointment = await apiService.completeDoctorAppointment(id);
      toast({ title: 'Đã hoàn tất lịch khám', description: 'Bạn có thể nhập hồ sơ bệnh án.' });
      setSelectedAppointment(appointment);
      setRecordForm(emptyRecord);
      setIsRecordOpen(true);
      await loadDoctorData();
    } catch (error: any) {
      toast({ title: 'Hoàn tất thất bại', description: error.response?.data?.message || 'Không thể cập nhật lịch.', variant: 'destructive' });
    }
  };

  const openRecordModal = (appointment: DoctorAppointment) => {
    setSelectedAppointment(appointment);
    setRecordForm(emptyRecord);
    setIsRecordOpen(true);
  };

  const handleCreateRecord = async (event: FormEvent) => {
    event.preventDefault();
    if (!selectedAppointment) return;
    if (!recordForm.diagnosis.trim() || !recordForm.treatment.trim()) {
      toast({ title: 'Thiếu thông tin', description: 'Chẩn đoán và phương pháp điều trị là bắt buộc.', variant: 'destructive' });
      return;
    }
    setIsSavingRecord(true);
    try {
      await apiService.createDoctorMedicalRecord({ appointmentId: selectedAppointment.id, ...recordForm });
      toast({ title: 'Đã lưu hồ sơ bệnh án' });
      setIsRecordOpen(false);
      await loadDoctorData();
    } catch (error: any) {
      toast({ title: 'Lưu hồ sơ thất bại', description: error.response?.data?.message || 'Vui lòng thử lại.', variant: 'destructive' });
    } finally {
      setIsSavingRecord(false);
    }
  };

  if (!isAuthenticated || !isDoctor) return null;

  const pending = appointments.filter((item) => item.status === 'PENDING');
  const confirmed = appointments.filter((item) => item.status === 'CONFIRMED');
  const completed = appointments.filter((item) => item.status === 'COMPLETED');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-slate-50">
        <section className="bg-linear-to-r from-blue-700 to-indigo-800 px-4 py-12 text-white">
          <div className="mx-auto max-w-7xl">
            <Badge className="mb-4 bg-white/20 text-white">Doctor Workspace</Badge>
            <h1 className="text-4xl font-black">Xin chào, {user?.fullName || user?.email}</h1>
            <p className="mt-2 text-blue-100">Xem lịch khám, duyệt lịch và nhập hồ sơ bệnh án.</p>
          </div>
        </section>

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-8">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: 'Tổng lịch', value: stats?.totalAppointments ?? appointments.length, icon: Calendar },
              { label: 'Chờ duyệt', value: stats?.pendingAppointments ?? pending.length, icon: Clock },
              { label: 'Đã duyệt', value: stats?.confirmedAppointments ?? confirmed.length, icon: UserCheck },
              { label: 'Hoàn tất', value: stats?.completedAppointments ?? completed.length, icon: CheckCircle },
            ].map((item) => (
              <Card key={item.label} className="rounded-2xl border-0 shadow-sm">
                <CardContent className="flex items-center justify-between p-6">
                  <div><p className="text-sm font-bold text-slate-500">{item.label}</p><p className="text-3xl font-black text-slate-900">{item.value}</p></div>
                  <item.icon className="text-blue-600" />
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="rounded-3xl border-0 shadow-sm">
            <CardHeader><CardTitle>Lịch khám của tôi</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
              ) : appointments.length === 0 ? (
                <div className="py-16 text-center text-slate-500">Chưa có lịch khám.</div>
              ) : (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-black text-slate-900">Bệnh nhân #{appointment.patientId || 'N/A'}</h3>
                          <Badge variant={appointment.status === 'PENDING' ? 'secondary' : 'outline'}>{appointment.status}</Badge>
                          {appointment.paymentStatus && <Badge variant="outline">{appointment.paymentStatus}</Badge>}
                        </div>
                        <p className="mt-2 text-sm text-slate-600"><Calendar className="mr-1 inline h-4 w-4" />{appointment.appointmentDate} {appointment.appointmentTime}</p>
                        <p className="mt-1 text-sm text-slate-500">Lý do: {appointment.reason || 'N/A'}</p>
                        {appointment.notes && <p className="mt-1 text-sm text-slate-500">Ghi chú: {appointment.notes}</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {appointment.status === 'PENDING' && <Button onClick={() => handleConfirm(appointment.id)} className="rounded-xl"><CheckCircle className="mr-2 h-4 w-4" />Duyệt</Button>}
                        {appointment.status === 'CONFIRMED' && <Button onClick={() => handleComplete(appointment.id)} className="rounded-xl bg-emerald-600 hover:bg-emerald-700"><Stethoscope className="mr-2 h-4 w-4" />Hoàn tất khám</Button>}
                        {appointment.status === 'COMPLETED' && <Button variant="outline" onClick={() => openRecordModal(appointment)} className="rounded-xl"><FileText className="mr-2 h-4 w-4" />Nhập hồ sơ</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Dialog open={isRecordOpen} onOpenChange={setIsRecordOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Nhập hồ sơ bệnh án</DialogTitle>
            <DialogDescription>Lịch khám #{selectedAppointment?.id}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRecord} className="space-y-4">
            <div className="space-y-2"><Label>Chẩn đoán</Label><Textarea required value={recordForm.diagnosis} onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })} /></div>
            <div className="space-y-2"><Label>Điều trị / kê đơn</Label><Textarea required value={recordForm.treatment} onChange={(e) => setRecordForm({ ...recordForm, treatment: e.target.value })} /></div>
            <div className="space-y-2"><Label>Ghi chú</Label><Textarea value={recordForm.notes} onChange={(e) => setRecordForm({ ...recordForm, notes: e.target.value })} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsRecordOpen(false)}><X className="mr-2 h-4 w-4" />Hủy</Button>
              <Button type="submit" disabled={isSavingRecord}>{isSavingRecord && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Lưu hồ sơ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
