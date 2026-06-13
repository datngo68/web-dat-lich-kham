'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Building2, Edit, Mail, MapPin, Phone, Plus, Search, Star, Stethoscope, Trash2 } from 'lucide-react';
import { apiService } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';

interface Hospital {
  id?: number;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  avatar?: string;
  rating?: number;
  reviewCount?: number;
  description?: string;
  doctorCount?: number;
  serviceCount?: number;
}

const emptyHospital: Hospital = { name: '', address: '', phone: '', email: '', description: '', rating: 0, reviewCount: 0 };

export default function AdminHospitalsPage() {
  const { toast } = useToast();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital>(emptyHospital);

  const loadHospitals = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.getHospitals();
      const list = Array.isArray(response) ? response : response?.data;
      setHospitals(Array.isArray(list) ? list : []);
    } catch (loadError) {
      console.error('Failed to fetch hospitals:', loadError);
      setError('Unable to load hospitals. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadHospitals();
  }, [loadHospitals]);

  const filteredHospitals = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return hospitals;
    return hospitals.filter((hospital) =>
      [hospital.name, hospital.address, hospital.email, hospital.phone]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query))
    );
  }, [hospitals, searchTerm]);

  const openCreate = () => {
    setEditingHospital({ ...emptyHospital });
    setIsModalOpen(true);
  };

  const openEdit = (hospital: Hospital) => {
    setEditingHospital({ ...hospital });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!editingHospital.name.trim()) {
      toast({ title: 'Validation Error', description: 'Hospital name is required.', variant: 'destructive' });
      return;
    }
    setIsSaving(true);
    try {
      if (editingHospital.id) {
        await apiService.updateHospital(editingHospital.id, editingHospital);
        toast({ title: 'Success', description: 'Hospital updated successfully.' });
      } else {
        await apiService.createHospital(editingHospital);
        toast({ title: 'Success', description: 'Hospital created successfully.' });
      }
      setIsModalOpen(false);
      await loadHospitals();
    } catch (saveError: any) {
      toast({ title: 'Save Failed', description: saveError.response?.data?.message || 'Unable to save hospital.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (hospital: Hospital) => {
    if (!hospital.id || !window.confirm(`Delete ${hospital.name}?`)) return;
    try {
      await apiService.deleteHospital(hospital.id);
      setHospitals((current) => current.filter((item) => item.id !== hospital.id));
      toast({ title: 'Success', description: 'Hospital deleted successfully.' });
    } catch (deleteError: any) {
      const message = deleteError.response?.status === 409
        ? 'This hospital still has doctors and cannot be deleted.'
        : 'Unable to delete hospital.';
      toast({ title: 'Delete Failed', description: message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Hospital network</p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Hospitals</h1>
          <p className="mt-1 text-slate-500">Manage hospitals available across the booking system.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-600 px-4 py-3 text-white">
            <span className="text-2xl font-black">{hospitals.length}</span>
            <span className="ml-2 text-sm font-medium text-blue-100">hospitals</span>
          </div>
          <Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Add Hospital</Button>
        </div>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardContent className="flex items-center gap-3 p-4">
          <Search className="h-5 w-5 text-slate-400" />
          <Input aria-label="Search hospitals" placeholder="Search by name, address, email, or phone..." value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} className="border-0 shadow-none focus-visible:ring-0" />
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((item) => <Card key={item} className="h-64 animate-pulse border-0 bg-slate-100" />)}</div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50"><CardContent className="p-8 text-center font-medium text-red-700">{error}</CardContent></Card>
      ) : filteredHospitals.length === 0 ? (
        <Card className="border-dashed"><CardContent className="p-12 text-center"><Building2 className="mx-auto mb-3 h-10 w-10 text-slate-300" /><p className="font-semibold text-slate-700">No hospitals found</p><p className="mt-1 text-sm text-slate-500">Try a different search term.</p></CardContent></Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredHospitals.map((hospital) => (
            <Card key={hospital.id} className="overflow-hidden border-slate-200 shadow-sm transition-shadow hover:shadow-md">
              <div className="h-1.5 bg-blue-600" />
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600"><Building2 /></div>
                  <div className="min-w-0 flex-1"><h2 className="truncate text-lg font-black text-slate-900">{hospital.name}</h2><div className="mt-1 flex items-center gap-1 text-sm font-semibold text-amber-600"><Star className="h-4 w-4 fill-current" />{Number(hospital.rating || 0).toFixed(1)} <span className="font-normal text-slate-400">({hospital.reviewCount || 0} reviews)</span></div></div>
                  <div className="flex gap-1"><Button size="icon" variant="ghost" onClick={() => openEdit(hospital)}><Edit className="h-4 w-4" /></Button><Button size="icon" variant="ghost" className="text-red-600" onClick={() => handleDelete(hospital)}><Trash2 className="h-4 w-4" /></Button></div>
                </div>
                <p className="line-clamp-2 min-h-10 text-sm text-slate-500">{hospital.description || 'No description available.'}</p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span className="line-clamp-2">{hospital.address || 'Address unavailable'}</span></p>
                  <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-slate-400" />{hospital.phone || 'Phone unavailable'}</p>
                  <p className="flex items-center gap-2 truncate"><Mail className="h-4 w-4 shrink-0 text-slate-400" />{hospital.email || 'Email unavailable'}</p>
                </div>
                <div className="flex gap-4 border-t border-slate-100 pt-4 text-sm font-semibold text-slate-700"><span className="flex items-center gap-1.5"><Stethoscope className="h-4 w-4 text-blue-600" />{hospital.doctorCount || 0} doctors</span><span>{hospital.serviceCount || 0} services</span></div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader><DialogTitle>{editingHospital.id ? 'Edit Hospital' : 'Add Hospital'}</DialogTitle><DialogDescription>Enter hospital contact and profile information.</DialogDescription></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label htmlFor="hospital-name">Name</Label><Input id="hospital-name" value={editingHospital.name} onChange={(e) => setEditingHospital({ ...editingHospital, name: e.target.value })} /></div>
            <div className="grid gap-2"><Label htmlFor="hospital-address">Address</Label><Input id="hospital-address" value={editingHospital.address || ''} onChange={(e) => setEditingHospital({ ...editingHospital, address: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4"><div className="grid gap-2"><Label htmlFor="hospital-phone">Phone</Label><Input id="hospital-phone" value={editingHospital.phone || ''} onChange={(e) => setEditingHospital({ ...editingHospital, phone: e.target.value })} /></div><div className="grid gap-2"><Label htmlFor="hospital-email">Email</Label><Input id="hospital-email" type="email" value={editingHospital.email || ''} onChange={(e) => setEditingHospital({ ...editingHospital, email: e.target.value })} /></div></div>
            <div className="grid gap-2"><Label htmlFor="hospital-description">Description</Label><Textarea id="hospital-description" value={editingHospital.description || ''} onChange={(e) => setEditingHospital({ ...editingHospital, description: e.target.value })} /></div>
          </div>
          <DialogFooter><Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : editingHospital.id ? 'Save Changes' : 'Create Hospital'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
