/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, Village, Sector, ActivityStatus } from '../types';
import { 
  Building2, 
  CheckCircle2, 
  MessageSquare, 
  MapPin, 
  FileCheck, 
  AlertCircle, 
  Award,
  ChevronDown,
  Search,
  Check,
  Send,
  Sparkles,
  FileText,
  Clock,
  Eye,
  Printer,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { handleDownloadFile, handleDownloadPhotoPdf } from '../lib/download';

interface KecamatanOperatorProps {
  activities: Activity[];
  onSetEvaluation: (id: string, recommendation: string, approve: boolean, officerName: string) => void;
  onTriggerPrintRecap?: () => void;
  onTriggerPrintProposal?: () => void;
}

function SafeThumbnail({ photo, title, onClick }: { photo: string; title: string; onClick: () => void }) {
  const [hasError, setHasError] = useState(false);
  const isPdf = photo.startsWith('data:application/pdf') || photo.includes('.pdf') || photo.includes('application/pdf');

  if (isPdf || hasError) {
    return (
      <button 
        type="button"
        onClick={onClick}
        className="w-10 h-10 flex flex-col items-center justify-center bg-red-50 hover:bg-red-100 transition-colors text-red-600 rounded border border-red-200 p-1 text-[8px] font-bold cursor-pointer shrink-0"
        title={title}
      >
        <FileText className="w-5 h-5 text-red-500" />
        <span className="truncate w-full text-center">PDF/File</span>
      </button>
    );
  }

  return (
    <img 
      src={photo} 
      alt="Berkas Realisasi" 
      className="w-10 h-10 object-cover rounded border border-slate-300 hover:scale-105 transition-transform cursor-pointer shrink-0" 
      onClick={onClick}
      onError={() => setHasError(true)}
      title={title}
    />
  );
}

export default function KecamatanOperator({ 
  activities, 
  onSetEvaluation,
  onTriggerPrintRecap,
  onTriggerPrintProposal
}: KecamatanOperatorProps) {
  const [selectedVillage, setSelectedVillage] = useState<Village | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'PROCESS' | 'ALL'>('PENDING');
  const [selectedPhysical, setSelectedPhysical] = useState<'ALL' | '100' | 'UNDER_100'>('ALL');
  const [selectedSector, setSelectedSector] = useState<Sector | 'ALL'>('ALL');
  const [officerName, setOfficerName] = useState(() => localStorage.getItem('kecamatan_officer_name') || '');
  const [officerNip, setOfficerNip] = useState(() => localStorage.getItem('kecamatan_officer_nip') || '');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    localStorage.setItem('kecamatan_officer_name', officerName);
  }, [officerName]);

  React.useEffect(() => {
    localStorage.setItem('kecamatan_officer_nip', officerNip);
  }, [officerNip]);

  // Local storage map of text inputs for recommendations based on activity ID
  const [recommendationsText, setRecommendationsText] = useState<Record<string, string>>({});
  
  // Selected activity to view photo in modal screen
  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchVillage = selectedVillage === 'ALL' || act.village === selectedVillage;
      const matchTab = 
        activeTab === 'PENDING' ? act.status === 'MENUNGGU_EVALUASI' :
        activeTab === 'APPROVED' ? act.isKecamatanApproved :
        activeTab === 'PROCESS' ? act.status === 'DALAM_PROSES' : true;
      const matchPhysical = 
        selectedPhysical === 'ALL' ? true :
        selectedPhysical === '100' ? act.progressPhysical === 100 :
        act.progressPhysical < 100;
      const matchSector = selectedSector === 'ALL' || act.sector === selectedSector;
      const matchSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchVillage && matchTab && matchPhysical && matchSector && matchSearch;
    });
  }, [activities, selectedVillage, activeTab, selectedPhysical, selectedSector, searchQuery]);

  // Statistics for Kecamatan Waru
  const stats = useMemo(() => {
    const total = activities.length;
    const waitingEvaluasi = activities.filter(a => a.status === 'MENUNGGU_EVALUASI').length;
    const approved = activities.filter(a => a.isKecamatanApproved).length;
    const underReview = activities.filter(a => a.status === 'DALAM_PROSES').length;

    const listByVillage = (['Bangun Mulya', 'Sesulu', 'Api-api'] as Village[]).map(v => {
      const vActs = activities.filter(a => a.village === v);
      const vApproved = vActs.filter(a => a.isKecamatanApproved).length;
      const vProses = vActs.filter(a => a.status === 'DALAM_PROSES').length;
      return {
        name: v,
        total: vActs.length,
        approved: vApproved,
        proses: vProses,
        percent: vActs.length > 0 ? Math.round((vApproved / vActs.length) * 100) : 0
      };
    });

    return { total, waitingEvaluasi, approved, underReview, listByVillage };
  }, [activities]);

  // Clear or handles recommendation change
  const handleRecTextChange = (id: string, text: string) => {
    setRecommendationsText(prev => ({
      ...prev,
      [id]: text
    }));
  };

  // Process evaluation
  const handleEvaluate = (id: string, approve: boolean) => {
    if (!officerName.trim()) {
      alert('Peringatan: Petugas evaluator belum diisi!');
      return;
    }
    const recText = recommendationsText[id] || '';
    const evaluatorSignature = officerNip.trim() ? `${officerName} (NIP. ${officerNip})` : officerName;
    
    if (approve) {
      if (confirm('Apakah Anda menyetujui laporan akhir kegiatan ini dan memberikan tanda tangan digital Kecamatan?')) {
        onSetEvaluation(id, recText || 'Laporan Akhir Terverifikasi Baik, disetujui secara digital oleh Kecamatan Waru.', true, evaluatorSignature);
        // Clean feedback
        handleRecTextChange(id, '');
      }
    } else {
      if (!recText.trim()) {
        alert('Harap isi catatan rekomendasi perbaikan/evaluasi terlebih dahulu agar operator desa dapat memperbaikinya.');
        return;
      }
      onSetEvaluation(id, recText, false, evaluatorSignature);
      alert('Rekomendasi evaluasi berhasil dikirim ke Desa terkait.');
    }
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="kecamatan-operator-root" className="space-y-6">
      {/* Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl text-white shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Award className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl md:text-2xl font-bold">Verifikator Kecamatan Waru</h2>
              <p className="text-slate-300 text-xs md:text-sm mt-0.5 leading-relaxed">
                Evaluasi realisasi lapangan & laporan pertanggungjawaban APBDes untuk Desa Bangun Mulya, Sesulu, dan Api-api.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 min-w-[300px] md:min-w-[420px]">
            <div className="space-y-1.5 flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Petugas Evaluator <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={officerName}
                onChange={(e) => setOfficerName(e.target.value)}
                className={`px-3 py-2 text-white rounded-lg text-xs font-semibold border w-full focus:outline-hidden focus:border-blue-500 transition-all ${
                  !officerName.trim()
                    ? 'bg-rose-950/20 border-rose-500/80 ring-2 ring-rose-500/10 placeholder-rose-300'
                    : 'bg-slate-800 border-slate-700'
                }`}
                placeholder="Masukkan Nama Petugas PMD..."
              />
              {!officerName.trim() && (
                <p className="text-[10px] text-rose-400 font-medium animate-pulse flex items-center gap-1">
                  ⚠️ Petugas evaluator wajib diisi!
                </p>
              )}
            </div>
            <div className="space-y-1.5 flex-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                NIP Petugas Evaluator
              </label>
              <input
                type="text"
                value={officerNip}
                onChange={(e) => setOfficerNip(e.target.value)}
                className="px-3 py-2 text-white rounded-lg text-xs font-mono font-semibold border border-slate-700 bg-slate-800 w-full focus:outline-hidden focus:border-blue-500 transition-all placeholder-slate-500"
                placeholder="NIP. 19781105..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Kecamatan High-Level Dashboard Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200">
        <div className="space-y-4">
          <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Persetujuan Per Desa</h4>
          <div className="space-y-3">
            {stats.listByVillage.map(v => (
              <div key={v.name} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Desa {v.name}</span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span className="text-blue-600 font-bold">{v.proses} Proses</span>
                    <span className="text-slate-300">|</span>
                    <span className="text-emerald-600 font-bold">{v.approved} / {v.total} ACC</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                    style={{ width: `${v.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic counters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 col-span-2">
          <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 flex flex-col justify-between">
            <div className="text-xs font-bold text-orange-700 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span> Menunggu Evaluasi
            </div>
            <div className="text-4xl font-bold font-mono text-orange-800 mt-4">{stats.waitingEvaluasi}</div>
            <p className="text-[10px] text-orange-600 mt-1">Kegiatan fisik 100% yang diajukan untuk dievaluasi oleh kecamatan.</p>
          </div>

          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col justify-between">
            <div className="text-xs font-bold text-blue-700 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span> Dalam Proses
            </div>
            <div className="text-4xl font-bold font-mono text-blue-800 mt-4">{stats.underReview}</div>
            <p className="text-[10px] text-blue-600 mt-1">Kegiatan berjalan / proses pengerjaan fisik desa.</p>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col justify-between">
            <div className="text-xs font-bold text-emerald-700 uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Telah Disetujui (ACC)
            </div>
            <div className="text-4xl font-bold font-mono text-emerald-800 mt-4">{stats.approved}</div>
            <p className="text-[10px] text-emerald-600 mt-1">Laporan akhir ditandatangani digital.</p>
          </div>
        </div>
      </div>

      {/* Tab controls */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg max-w-fit">
            <button
              onClick={() => setActiveTab('PENDING')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'PENDING'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Menunggu Evaluasi ({stats.waitingEvaluasi})
            </button>
            <button
              onClick={() => setActiveTab('PROCESS')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'PROCESS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dalam Proses ({stats.underReview})
            </button>
            <button
              onClick={() => setActiveTab('APPROVED')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'APPROVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Telah Disetujui ({stats.approved})
            </button>
            <button
              onClick={() => setActiveTab('ALL')}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all ${
                activeTab === 'ALL'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua Usulan ({stats.total})
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTriggerPrintRecap}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-lg transition-all border border-slate-300 cursor-pointer shadow-xs active:scale-95"
              type="button"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              Cetak Laporan Verifikasi Kec.
            </button>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value as Village | 'ALL')}
              className="text-xs bg-slate-50 border border-slate-300 font-semibold rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Semua Desa</option>
              <option value="Bangun Mulya">Desa Bangun Mulya</option>
              <option value="Sesulu">Desa Sesulu</option>
              <option value="Api-api">Desa Api-api</option>
            </select>
            <select
              value={selectedPhysical}
              onChange={(e) => setSelectedPhysical(e.target.value as 'ALL' | '100' | 'UNDER_100')}
              className="text-xs bg-slate-50 border border-slate-300 font-semibold rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden"
            >
              <option value="ALL">Semua Progres Fisik</option>
              <option value="100">Fisik 100%</option>
              <option value="UNDER_100">Fisik di Bawah 100%</option>
            </select>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as Sector | 'ALL')}
              className="text-xs bg-slate-50 border border-slate-300 font-semibold rounded-lg px-3 py-2 text-slate-700 focus:outline-hidden max-w-[200px] truncate"
            >
              <option value="ALL">Semua Bidang APBDes</option>
              <option value="Penyelenggaraan Pemerintahan">Penyelenggaraan Pemerintahan</option>
              <option value="Pembangunan Desa (Infrastruktur)">Pembangunan Desa (Infrastruktur)</option>
              <option value="Pembangunan Desa (Non Infrastruktur)">Pembangunan Desa (Non Infrastruktur)</option>
              <option value="Pembinaan Kemasyarakatan">Pembinaan Kemasyarakatan</option>
              <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
              <option value="Penanggulangan Bencana & Mendesak">Kebencanaan & Mendesak</option>
            </select>
          </div>
        </div>

        {/* Filter controls search option */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -smart-center -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari usulan kegiatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-300 rounded-lg"
            />
          </div>
        </div>

        {/* Evaluation contents */}
        {filteredActivities.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            Tidak ada kegiatan dalam kriteria tab ini.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredActivities.map((act) => {
              const absorptionPercent = act.budgetTotal > 0 ? Math.round((act.budgetSpent / act.budgetTotal) * 100) : 0;
              
              // Determine if updated by village after the last evaluation recommendation
              const latestRec = act.recommendationsHistory && act.recommendationsHistory.length > 0
                ? act.recommendationsHistory[act.recommendationsHistory.length - 1]
                : null;
              
              const isUpdatedAfterRevision = latestRec && !latestRec.isApproved && new Date(act.lastUpdated).getTime() > new Date(latestRec.timestamp).getTime();
              
              // A fresh submission that has not been approved or evaluated yet
              const isFreshSubmission = !act.isKecamatanApproved && !latestRec && act.status === 'MENUNGGU_EVALUASI';

              return (
                <div 
                  key={act.id} 
                  className={`p-6 hover:bg-slate-50/30 transition-all flex flex-col xl:flex-row gap-6 relative ${
                    isUpdatedAfterRevision 
                      ? 'border-l-[5px] border-l-emerald-500 bg-emerald-50/10' 
                      : isFreshSubmission 
                      ? 'border-l-[5px] border-l-blue-500 bg-blue-50/5' 
                      : ''
                  }`}
                >
                  {/* Left: General activity parameters */}
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-sm">
                        <MapPin className="w-3 h-3" />
                        Desa {act.village}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-150 text-slate-600 uppercase tracking-widest font-mono">
                        {act.sector}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider font-mono flex items-center gap-1">
                        <span>🪙</span> {act.sourceOfFunds || 'Dana Desa (DD)'}
                      </span>

                      {isUpdatedAfterRevision && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-sm border border-emerald-300 animate-pulse">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                          </span>
                          ✓ TELAH DIREVISI & DIUPDATE DESA
                        </span>
                      )}

                      {isFreshSubmission && (
                        <span className="inline-flex items-center gap-1.5 text-[10px] bg-blue-100 text-blue-800 font-bold px-2.5 py-0.5 rounded-sm border border-blue-300 animate-pulse">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                          </span>
                          ⭐ BARU DIUPDATE / AJUAN DESA
                        </span>
                      )}
                    </div>

                    <h4 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                      {act.name}
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-semibold text-slate-500 pt-1">
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Pagu Anggaran</div>
                        <div className="text-sm font-bold text-slate-900 font-mono mt-0.5">{formatRupiah(act.budgetTotal)}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Realisasi Keuangan</div>
                        <div className="text-sm font-bold text-emerald-700 font-mono mt-0.5">
                          {formatRupiah(act.budgetSpent)}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Realisasi Fisik</div>
                        <div className="text-sm font-bold text-blue-700 font-mono mt-0.5">
                          {act.progressPhysical}%
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-[10px] uppercase font-bold">Terakhir Diperbaharui</div>
                        <div className="text-slate-700 font-mono mt-0.5">
                          {new Date(act.lastUpdated).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    {/* Uploded documents & Photos preview row */}
                    <div className="flex flex-wrap gap-4 pt-2">
                      {act.photoUrl ? (
                        <div className="flex flex-col gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
                            <ImageIcon className="w-4 h-4 text-slate-500" />
                            <span className="font-bold text-slate-800">
                              Dokumen Realisasi Fisik ({act.photoUrl.split(';').filter(Boolean).length} Berkas)
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-0.5">
                            {act.photoUrl.split(';').filter(Boolean).map((photo, pIdx) => (
                              <SafeThumbnail 
                                key={pIdx} 
                                photo={photo} 
                                title={`Klik untuk unduh/lihat Berkas Realisasi Fisik ${pIdx + 1}`}
                                onClick={() => setPreviewPhoto(photo)}
                              />
                            ))}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadPhotoPdf(act)}
                            className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap mt-1 justify-center"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Dokumen Realisasi Fisik</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 p-3 bg-slate-100/70 rounded-lg border border-slate-200 text-xs text-slate-400">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <span>Belum ada Dokumen Realisasi Fisik</span>
                        </div>
                      )}

                      {act.budgetReportUrl ? (
                        <div className="flex flex-col gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-900 w-full sm:w-auto">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="font-bold text-slate-800">
                              Dokumen Realisasi Keuangan
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-xs font-semibold text-slate-700 truncate max-w-[180px] md:max-w-[220px]" title={act.budgetReportName || act.budgetReportUrl}>
                              {act.budgetReportName || act.budgetReportUrl}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDownloadFile(act)}
                            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap mt-1 justify-center"
                            title="Unduh Dokumen Realisasi Keuangan"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Dokumen Realisasi Keuangan</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 p-3 bg-slate-100/70 rounded-lg border border-slate-200 text-xs text-slate-400">
                          <AlertCircle className="w-4 h-4 text-slate-400" />
                          <span>Belum ada Dokumen Realisasi Keuangan</span>
                        </div>
                      )}
                    </div>

                    {/* Riwayat Alasan Belum Rampung */}
                    {act.incompleteReasonsHistory && act.incompleteReasonsHistory.length > 0 ? (
                      <div className="p-3.5 bg-rose-50/60 rounded-xl border-l-[4px] border-rose-500/70 space-y-2 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800 border-b border-rose-200/50 pb-1">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          Riwayat Alasan Belum Rampung (Input Desa - Awal ke Akhir):
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {act.incompleteReasonsHistory.map((inc, idx) => (
                            <div key={inc.id} className="bg-white/80 p-2 rounded border border-rose-100 space-y-0.5">
                              <div className="flex justify-between text-[9px] text-slate-500 font-semibold">
                                <span>{idx + 1}. Progress Fisik: {inc.progressPhysical}%</span>
                                <span className="font-mono">{new Date(inc.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                              <p className="text-slate-700 italic">"{inc.text}"</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : act.incompleteReason ? (
                      <div className="p-3.5 bg-rose-50/60 rounded-xl border-l-[4px] border-rose-500/70 space-y-1 text-xs">
                        <div className="flex items-center gap-1.5 font-bold text-rose-800">
                          <AlertCircle className="w-4 h-4 text-rose-500" />
                          Alasan Kegiatan Belum Rampung (Input Desa):
                        </div>
                        <p className="text-slate-700 italic pl-5.5 font-medium">
                          "{act.incompleteReason}"
                        </p>
                      </div>
                    ) : null}

                    {/* Riwayat Rekomendasi Kecamatan */}
                    {act.recommendationsHistory && act.recommendationsHistory.length > 0 ? (
                      <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div className="font-bold text-slate-700 border-b border-slate-200 pb-1">
                          Riwayat Catatan Evaluasi & Rekomendasi (Awal ke Akhir):
                        </div>
                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {act.recommendationsHistory.map((rec, idx) => (
                            <div key={rec.id} className="bg-white/90 p-2 rounded border border-slate-200/50 space-y-1">
                              <div className="flex justify-between text-[9px] text-slate-500">
                                <span className="font-bold">{idx + 1}. Oleh {rec.officerName}</span>
                                <span className="font-mono">{new Date(rec.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                              </div>
                              <p className="text-slate-600 italic">"{rec.text}"</p>
                              <div className="text-[9px] font-bold">
                                Status: {rec.isApproved ? (
                                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">Selesai (ACC)</span>
                                ) : (
                                  <span className="text-amber-705 font-semibold bg-amber-50 px-1 rounded">Perlu Perbaikan (Revisi)</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : act.recommendation ? (
                      <div className="p-3.5 bg-slate-100/80 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-700">Catatan Evaluasi Terdahulu:</span>
                        <p className="text-slate-600 mt-1 italic">"{act.recommendation}"</p>
                      </div>
                    ) : null}
                  </div>

                  {/* Right: Evaluation Form (Only available in pending, or general settings) */}
                  <div className="w-full xl:w-96 bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 flex flex-col justify-between">
                    {act.isKecamatanApproved ? (
                      <div className="space-y-4 text-center py-4">
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                          <Check className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-bold text-emerald-800 text-sm">Disetujui Digital</div>
                          <p className="text-xs text-slate-500 mt-1">
                            Disetujui oleh: {act.approvedBy || officerName}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                            {act.approvedAt ? new Date(act.approvedAt).toLocaleString('id-ID') : ''}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider block">
                            Catatan Rekomendasi / Arahan Camat
                          </label>
                          <textarea
                            value={recommendationsText[act.id] || ''}
                            onChange={(e) => handleRecTextChange(act.id, e.target.value)}
                            placeholder="Contoh: Pekerjaan fisik semenisasi jalan sudah 100% dan rapi. Harap tambahkan catatan pemeliharaan..."
                            rows={3}
                            className="w-full p-2.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => handleEvaluate(act.id, false)}
                            className="py-2.5 px-3 bg-white border border-slate-300 text-orange-700 font-bold text-xs rounded-lg hover:bg-orange-50 transition-colors flex items-center justify-center gap-1 shadow-xs"
                          >
                            <AlertCircle className="w-3.5 h-3.5" /> Catatan Revisi
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEvaluate(act.id, true)}
                            className="py-2.5 px-3 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-1 shadow-xs"
                          >
                            <FileCheck className="w-3.5 h-3.5" /> ACC & TTD Camat
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Image zoom modal */}
      {previewPhoto && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <span className="text-sm font-semibold">Bukti Fisik Lapangan</span>
              <div className="flex items-center gap-2">
                <a
                  href={previewPhoto}
                  target="_blank"
                  rel="noopener noreferrer"
                  download="Bukti_Fisik_Lapangan.jpg"
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" /> Unduh Foto
                </a>
                <button 
                  onClick={() => setPreviewPhoto(null)}
                  className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                >
                  Tutup [X]
                </button>
              </div>
            </div>
            <div className="p-4 flex justify-center bg-slate-100">
              <img 
                src={previewPhoto} 
                alt="Zoomed Realisasi" 
                className="max-h-[450px] object-contain rounded-lg border border-slate-300"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
