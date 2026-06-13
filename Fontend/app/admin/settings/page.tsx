'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Building2, CreditCard, Loader2, Save, ShieldCheck } from 'lucide-react';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

interface BankConfiguration {
  bankCode: string;
  bankName: string;
  accountNumber: string;
  accountName: string;
  transferTemplate: string;
  vietqrEnabled: boolean;
}

const initialConfiguration: BankConfiguration = {
  bankCode: '',
  bankName: '',
  accountNumber: '',
  accountName: '',
  transferTemplate: 'BVSH{appointmentId}',
  vietqrEnabled: true,
};

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [configuration, setConfiguration] = useState(initialConfiguration);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    apiService
      .getBankConfiguration()
      .then((data) => setConfiguration(data))
      .catch(() => toast({ title: 'Không thể tải cấu hình', description: 'Vui lòng thử lại.', variant: 'destructive' }))
      .finally(() => setIsLoading(false));
  }, [toast]);

  const updateField = (field: keyof BankConfiguration, value: string | boolean) => {
    setConfiguration((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      const saved = await apiService.updateBankConfiguration(configuration);
      setConfiguration(saved);
      toast({ title: 'Đã lưu cấu hình ngân hàng', description: 'VietQR sẽ dùng thông tin mới ngay lập tức.' });
    } catch (error: any) {
      toast({ title: 'Lưu thất bại', description: error.response?.data?.message || 'Vui lòng kiểm tra dữ liệu.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Cài đặt hệ thống</h1>
        <p className="mt-2 text-slate-500">Quản lý tài khoản nhận thanh toán VietQR.</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="max-w-4xl rounded-3xl border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-blue-50 p-3 text-blue-600"><Building2 size={24} /></div>
              <div>
                <CardTitle>Cấu hình ngân hàng</CardTitle>
                <CardDescription>Thông tin này xuất hiện khi bệnh nhân chọn thanh toán VietQR.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bankCode">Mã ngân hàng</Label>
                <Input id="bankCode" required value={configuration.bankCode} onChange={(e) => updateField('bankCode', e.target.value.toUpperCase())} placeholder="VCB" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Tên ngân hàng</Label>
                <Input id="bankName" required value={configuration.bankName} onChange={(e) => updateField('bankName', e.target.value)} placeholder="Vietcombank" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountNumber">Số tài khoản</Label>
                <Input id="accountNumber" required value={configuration.accountNumber} onChange={(e) => updateField('accountNumber', e.target.value.replace(/\s/g, ''))} inputMode="numeric" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountName">Tên chủ tài khoản</Label>
                <Input id="accountName" required value={configuration.accountName} onChange={(e) => updateField('accountName', e.target.value.toUpperCase())} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="transferTemplate">Mẫu nội dung chuyển khoản</Label>
              <Input id="transferTemplate" required value={configuration.transferTemplate} onChange={(e) => updateField('transferTemplate', e.target.value)} />
              <p className="text-xs text-slate-500">Dùng <code>{'{appointmentId}'}</code> để chèn mã lịch khám, ví dụ: BVSH{'{appointmentId}'}.</p>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 p-4">
              <span className="flex items-center gap-3">
                <CreditCard className="text-blue-600" size={22} />
                <span><span className="block font-bold text-slate-900">Cho phép thanh toán VietQR</span><span className="text-sm text-slate-500">Tắt để ngừng tạo thông tin chuyển khoản mới.</span></span>
              </span>
              <input type="checkbox" checked={configuration.vietqrEnabled} onChange={(e) => updateField('vietqrEnabled', e.target.checked)} className="h-5 w-5 accent-blue-600" />
            </label>

            <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2 text-sm text-emerald-700"><ShieldCheck size={18} /> Chỉ quản trị viên có quyền thay đổi.</div>
              <Button type="submit" disabled={isSaving} className="rounded-xl px-6">
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Lưu cấu hình
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
