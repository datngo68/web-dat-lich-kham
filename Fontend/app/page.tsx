'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Shield, Users, Star, MapPin, Calendar, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const router = useRouter();
  const { t } = useTranslation('common');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-[#F8FAFC]">
        {/* Hero Section */}
        <section className="relative px-4 py-24 md:py-40 overflow-hidden bg-slate-900">
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[70%] bg-blue-600/20 blur-[150px] rounded-full animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[70%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" style={{ animationDelay: '2s' }}></div>
          </div>

          <div className="max-w-7xl mx-auto relative z-10">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                  <span className="flex h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,1)]"></span>
                  <span className="text-[10px] font-black text-blue-100 uppercase tracking-[0.2em]">{t('home.eyebrow')}</span>
                </div>
                <div>
                  <h1 className="text-6xl md:text-8xl font-black text-white mb-8 leading-[0.9] tracking-tighter">
                    {t('home.titleLine1')} <br />
                    <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                      {t('home.titleLine2')}
                    </span>
                  </h1>
                  <p className="text-xl md:text-2xl text-slate-400 leading-relaxed max-w-xl font-medium">
                    {t('home.subtitle')}
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-5">
                  <Button
                    size="lg"
                    onClick={() => router.push('/doctors')}
                    className="bg-blue-600 text-white hover:bg-blue-700 h-16 px-10 rounded-2xl font-black shadow-2xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95 text-lg"
                  >
                    {t('home.findSpecialist')}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    onClick={() => router.push('/register')}
                    className="border-white/20 bg-white/5 text-white hover:bg-white/10 h-16 px-10 rounded-2xl font-black backdrop-blur-md transition-all text-lg"
                  >
                    {t('home.joinSunrise')}
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-8 pt-10 border-t border-white/10">
                  {[
                    { label: t('home.stats.specialists'), val: '500+' },
                    { label: t('home.stats.patients'), val: '25K+' },
                    { label: t('home.stats.successRate'), val: '99%' }
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-3xl font-black text-white">{stat.val}</p>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 to-indigo-600/30 rounded-[3rem] blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                <div className="relative bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 p-12 aspect-square flex flex-col items-center justify-center shadow-2xl overflow-hidden">
                  <div className="w-64 h-64 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)] group-hover:scale-110 transition-transform duration-700">
                    <Calendar size={100} className="text-white animate-bounce" style={{ animationDuration: '3s' }} />
                  </div>
                  <div className="mt-12 text-center">
                    <h3 className="text-3xl font-black text-white mb-3 tracking-tight">{t('home.instantTitle')}</h3>
                    <p className="text-slate-400 font-medium text-lg">{t('home.instantSubtitle')}</p>
                  </div>
                  
                  {/* Decorative Floating Elements */}
                  <div className="absolute top-10 right-10 w-20 h-20 bg-white/5 rounded-2xl rotate-12 backdrop-blur-xl border border-white/10 animate-pulse"></div>
                  <div className="absolute bottom-10 left-10 w-16 h-16 bg-white/5 rounded-full -rotate-12 backdrop-blur-xl border border-white/10 animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="px-4 py-32 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24">
              <Badge className="mb-4 bg-blue-50 text-blue-700 border-blue-100 font-black uppercase tracking-widest">{t('home.why')}</Badge>
              <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">{t('home.excellence')}</h2>
              <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
                {t('home.excellenceDesc')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-10">
              {[
                { icon: Clock, title: t('home.features.waitTitle'), desc: t('home.features.waitDesc'), color: 'blue' },
                { icon: Shield, title: t('home.features.dataTitle'), desc: t('home.features.dataDesc'), color: 'emerald' },
                { icon: Users, title: t('home.features.specialistsTitle'), desc: t('home.features.specialistsDesc'), color: 'indigo' },
              ].map((f, i) => (
                <Card key={i} className="border-0 shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                  <CardContent className="p-12">
                    <div className={`bg-${f.color}-50 w-20 h-20 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                      <f.icon className={`w-10 h-10 text-${f.color}-600`} />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-4">{f.title}</h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {f.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-4 py-32 relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600 z-0">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-indigo-900 opacity-90"></div>
          </div>
          <div className="max-w-5xl mx-auto text-center relative z-10 text-white">
            <h2 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight">
              {t('home.ctaTitle')}
            </h2>
            <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto font-medium opacity-80">
              Join thousands of patients who trust Sunrise {t('home.hospital')} for their premium healthcare needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button
                size="lg"
                onClick={() => router.push('/doctors')}
                className="bg-white text-blue-600 hover:bg-blue-50 h-16 px-12 rounded-2xl font-black shadow-2xl shadow-black/20 text-lg"
              >
                {t('home.bookAppointment')}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/register')}
                className="border-white/30 bg-white/10 text-white hover:bg-white/20 h-16 px-12 rounded-2xl font-black backdrop-blur-md text-lg"
              >
                {t('home.createAccount')}
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 border-t border-white/5 px-4 py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-4 gap-12 mb-20">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black">S</div>
                  <span className="text-2xl font-black text-white">Sunrise</span>
                </div>
                <p className="text-lg font-medium leading-relaxed">
                  {t('home.footerDesc')}
                </p>
              </div>
              <div>
                <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">{t('home.resources')}</h4>
                <ul className="space-y-4 font-medium">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.ourDoctors')}</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">Specialties</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.labTests')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">{t('home.hospital')}</h4>
                <ul className="space-y-4 font-medium">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.aboutUs')}</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.careers')}</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.contact')}</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-black text-white mb-6 uppercase tracking-widest text-xs">{t('home.legal')}</h4>
                <ul className="space-y-4 font-medium">
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.privacy')}</a></li>
                  <li><a href="#" className="hover:text-blue-400 transition-colors">{t('home.terms')}</a></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-white/5 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="font-bold">&copy; 2024 Sunrise {t('home.hospital')}. All excellence reserved.</p>
              <div className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                  <Activity size={18} className="text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 cursor-pointer transition-colors">
                  <Shield size={18} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </>
  );
}


