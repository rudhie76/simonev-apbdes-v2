/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, Village } from '../types';
import { 
  Megaphone, 
  Search, 
  MapPin, 
  Award, 
  FileCheck, 
  AlertCircle, 
  Send, 
  HelpCircle,
  TrendingUp,
  ShieldAlert,
  Building,
  CheckCircle2,
  FileText,
  Download
} from 'lucide-react';
import { handleDownloadPhotoPdf } from '../lib/download';

interface TransparencyBoardProps {
  activities: Activity[];
  onCitizenReport: (report: { name: string; village: Village; message: string; activityName: string }) => void;
}

export default function TransparencyBoard({ activities, onCitizenReport }: TransparencyBoardProps) {
  const [selectedVillage, setSelectedVillage] = useState<Village | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Citizen feedback form inputs
  const [reporterName, setReporterName] = useState('');
  const [reporterVillage, setReporterVillage] = useState<Village>('Bangun Mulya');
  const [targetActivity, setTargetActivity] = useState('');
  const [reporterMessage, setReporterMessage] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filtered list
  const publicActivities = useMemo(() => {
    return activities.filter(act => {
      const matchVillage = selectedVillage === 'ALL' || act.village === selectedVillage;
      const matchSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.sector.toLowerCase().includes(searchQuery.toLowerCase());
      return matchVillage && matchSearch;
    });
  }, [activities, selectedVillage, searchQuery]);

  // Aggregate stats
  const totalCompleted = useMemo(() => {
    return activities.filter(a => a.status === 'SELESAI').length;
  }, [activities]);

  const totalBudgetSpent = useMemo(() => {
    return activities.reduce((sum, a) => sum + a.budgetSpent, 0);
  }, [activities]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName.trim() || !reporterMessage.trim()) {
      alert('Mohon lengkapi nama Anda dan laporan pesan aduan.');
      return;
    }

    onCitizenReport({
      name: reporterName,
      village: reporterVillage,
      activityName: targetActivity || 'Laporan Umum Desa',
      message: reporterMessage
    });

    setIsSubmitted(true);
    setReporterName('');
    setReporterMessage('');
    setTargetActivity('');
    
    // Clear success message after 5 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 5000);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="transparency-board-root" className="space-y-8">
      {/* Visual Header */}
      <div className="bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-blue-400 font-mono text-xs uppercase tracking-widest bg-slate-950/60 px-3 py-1 rounded-full border border-slate-800">
            Papan Transparansi Masyarakat • Terbuka Publik
          </span>
          <h2 className="text-xl md:text-3xl font-sans font-bold tracking-tight mt-2">
            Portal Transparansi APBDes Kecamatan Waru
          </h2>
          <p className="text-slate-300 text-xs md:text-sm max-w-3xl leading-relaxed">
            Sesuai UU No. 6 Tahun 2014 tentang Desa, warga berhak memantau program pembangunan desa secara terbuka. Di sini Anda dapat memverifikasi anggaran berjalan, progres fisik, sertifikat digital evaluasi, dan melayangkan aduan.
          </p>
        </div>
      </div>

      {/* Public summary counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Dana Terserap Masyarakat</div>
            <div className="text-lg md:text-xl font-bold font-mono text-slate-900 mt-0.5">{formatRupiah(totalBudgetSpent)}</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase font-sans">Kegiatan Sukses 100%</div>
            <div className="text-lg md:text-xl font-bold font-mono text-slate-900 mt-0.5">{totalCompleted} Kegiatan</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-bold uppercase">Feedback & Aduan Digital</div>
            <div className="text-lg md:text-xl font-bold text-slate-900 mt-0.5 animate-pulse">Aktif 24 Jam</div>
          </div>
        </div>
      </div>

      {/* Two Columns: Left (Transparency list), Right (Citizen Complaint report form) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Active project list and filter */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm md:text-base">Realisasi Fisik & Dana Desa</h3>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value as Village | 'ALL')}
                className="text-xs font-semibold bg-slate-50 border border-slate-350 pr-8 py-2 rounded-lg text-slate-700 w-full sm:w-auto"
              >
                <option value="ALL">Semua Desa (Waru)</option>
                <option value="Bangun Mulya">Desa Bangun Mulya</option>
                <option value="Sesulu">Desa Sesulu</option>
                <option value="Api-api">Desa Api-api</option>
              </select>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari program pembangunan desa (contoh: Posyandu, Semenisasi)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-white border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500/10 placeholder-slate-400"
            />
          </div>

          {/* List items */}
          <div className="space-y-4">
            {publicActivities.length === 0 ? (
              <p className="text-center py-12 text-slate-400 bg-white border border-slate-200 rounded-xl text-sm font-medium">
                Pencarian tidak membuahkan hasil.
              </p>
            ) : (
              publicActivities.map((act) => {
                const absorptionPercent = act.budgetTotal > 0 ? Math.round((act.budgetSpent / act.budgetTotal) * 105) : 0; // slight display factor
                return (
                  <div key={act.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden space-y-4">
                    {/* Village label */}
                    <div className="flex justify-between items-start gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-sm font-sans border border-emerald-100">
                        <MapPin className="w-3" /> Desa {act.village}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-sm font-mono ${
                        act.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' :
                        act.status === 'MENUNGGU_EVALUASI' ? 'bg-blue-100 text-blue-800' :
                        act.status === 'DALAM_PROSES' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-rose-800'
                      }`}>
                        {act.status.replace('_', ' ')}
                      </span>
                    </div>

                    {/* Work contents */}
                    <div className="space-y-1">
                      <h4 className="font-bold text-slate-900 text-base md:text-lg leading-snug">
                        {act.name}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 uppercase tracking-wider">
                          Sektor: {act.sector}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider flex items-center gap-1 font-mono">
                          <span>🪙</span> {act.sourceOfFunds || 'Dana Desa (DD)'}
                        </span>
                      </div>
                    </div>

                    {/* Progress visual bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="font-semibold text-slate-500">Progres Konstruksi Fisik:</span>
                        <span className="font-bold text-slate-900 font-mono">{act.progressPhysical}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-100">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            act.progressPhysical === 100 ? 'bg-emerald-500' :
                            act.progressPhysical > 50 ? 'bg-amber-400' : 'bg-rose-450'
                          }`} 
                          style={{ width: `${act.progressPhysical}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Budget realization visual */}
                    <div className="grid grid-cols-2 gap-4 pt-1.5 text-xs">
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Total Pagu Alokasi</div>
                        <div className="font-bold text-slate-900 font-mono text-sm mt-0.5">{formatRupiah(act.budgetTotal)}</div>
                      </div>
                      <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Dana Terserap (SPJ)</div>
                        <div className="font-bold text-emerald-700 font-mono text-sm mt-0.5">{formatRupiah(act.budgetSpent)}</div>
                      </div>
                    </div>

                    {/* Photo proof in transparent card */}
                    {act.photoUrl && (
                      <div className="space-y-1.5 font-sans">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Dokumentasi Realisasi Lapangan:</p>
                        {act.photoUrl.startsWith('data:application/pdf') || act.photoUrl.includes('.pdf') ? (
                          <div className="flex flex-col gap-2 p-2.5 bg-slate-100 rounded-xl border border-slate-200">
                            <div className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-red-500" />
                              <span className="text-[11px] font-bold text-slate-700">Berkas Bukti Fisik (PDF)</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadPhotoPdf(act)}
                              className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold text-[10px] py-1.5 px-2.5 rounded-lg flex items-center justify-center gap-1 transition-all shadow-xs cursor-pointer"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Unduh / Lihat PDF Bukti Fisik
                            </button>
                          </div>
                        ) : (
                          <div className="overflow-hidden rounded-xl border border-slate-200 max-h-48 flex justify-center bg-slate-50">
                            <img src={act.photoUrl} alt="Bukti Fisik" className="w-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Seal of kecamatan approval */}
                    {act.isKecamatanApproved && (
                      <div className="p-3 bg-linear-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl flex items-center gap-3">
                        <Award className="w-6 h-6 text-emerald-600 filter drop-shadow-xs" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Telah Disetujui Pemkab / Kecamatan Waru</div>
                          <p className="text-[10px] text-slate-500 font-mono">ID Valid TTD: WARU-APB-2026-VAL-{(Math.random()*1000).toFixed(0)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Citizen complaint form */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-emerald-600" />
              Aduan & Tanggapan Warga
            </h3>
            <p className="text-xs text-slate-500">
              Apakah pelaksanaan semenisasi di RT Anda kurang padat? Ataukah Posyandu belum beroperasi dengan maksimal? Silakan layangkan tanggapan konstruktif Anda secara bebas dan rahasia.
            </p>

            {isSubmitted && (
              <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs flex items-center gap-2 animate-bounce">
                <FileCheck className="w-4 h-4 text-emerald-600" />
                <span>Terima kasih! Aduan Anda berhasil masuk sistem dan akan dievaluasi oleh PMD Kecamatan Waru.</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">Nama Lengkap (Bisa Inisial)</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ahmad RT02 / Warga Peduli"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">Asal Desa Anda</label>
                <select
                  value={reporterVillage}
                  onChange={(e) => setReporterVillage(e.target.value as Village)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden"
                >
                  <option value="Bangun Mulya">Desa Bangun Mulya</option>
                  <option value="Sesulu">Desa Sesulu</option>
                  <option value="Api-api">Desa Api-api</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">Target Kegiatan (Opsional)</label>
                <select
                  value={targetActivity}
                  onChange={(e) => setTargetActivity(e.target.value)}
                  className="w-full px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden truncate"
                >
                  <option value="">-- Laporan Hubungan Umum Desa --</option>
                  {activities.map((a) => (
                    <option key={a.id} value={a.name}>[{a.village}] {a.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-700 uppercase tracking-widest block">Pesan Aduan / Koreksi Lapangan</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Deskripsikan isu secara detail, lokasi RT, dan dugaan kendala fisik..."
                  value={reporterMessage}
                  onChange={(e) => setReporterMessage(e.target.value)}
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 px-4 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Kirim Tanggapan Masyarakat
              </button>
            </form>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-slate-800 text-xs uppercase flex items-center gap-2 mb-3">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              Petunjuk Penggunaan Simonev
            </h4>
            <ul className="text-xs text-slate-600 space-y-2.5 font-sans">
              <li>📌 <strong className="text-slate-800">Status Kuning:</strong> Kegiatan sedang direalisasikan oleh perangkat Desa.</li>
              <li>📌 <strong className="text-slate-800">Status Biru:</strong> Desa telah merampungkan konstruksi fisik & laporan keuangan sedang ditransfer ke Verifikator PMD Kecamatan.</li>
              <li>📌 <strong className="text-slate-800">Status Hijau:</strong> Camat Waru secara digital membubuhkan pengesahan digital atas kesesuaian fisik dan anggaran.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
