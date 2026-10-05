import React, { useState, useMemo } from 'react';
import { Activity, Village, Sector, ActivityStatus, SourceOfFunds } from '../types';
import { Printer, X, Filter, FileSpreadsheet, Building2, CheckSquare, Calendar, ShieldCheck, Coins } from 'lucide-react';
import { LOGO_BASE64 } from '../assets/logoBase64';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  villageBudgets: Record<string, number>;
  initialVillage?: Village | 'ALL';
  selectedYear?: number;
}

export default function PrintReportModal({ 
  isOpen, 
  onClose, 
  activities, 
  villageBudgets,
  initialVillage = 'ALL',
  selectedYear = 2026
}: PrintReportModalProps) {
  const [selectedVillage, setSelectedVillage] = useState<Village | 'ALL'>(initialVillage);
  const [selectedSector, setSelectedSector] = useState<Sector | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | 'ALL' | 'FISIK_100_BELUM_ACC'>('ALL');
  const [selectedSource, setSelectedSource] = useState<SourceOfFunds | 'ALL'>('ALL');

  const absoluteLogoUrl = LOGO_BASE64;

  const [camatName, setCamatName] = useState(() => localStorage.getItem('camat_name_rekap') || 'Ahmad Yani, S.STP');
  const [camatNip, setCamatNip] = useState(() => localStorage.getItem('camat_nip_rekap') || '19741210 200312 1 004');
  const [camatTitle, setCamatTitle] = useState(() => localStorage.getItem('camat_title_rekap') || 'Tim Pembina PMD Kecamatan Waru');

  const [verifierName, setVerifierName] = useState(() => localStorage.getItem('verifier_name_rekap') || 'Sri Wahyuni, S.Sos');
  const [verifierNip, setVerifierNip] = useState(() => localStorage.getItem('verifier_nip_rekap') || '19800512 200903 2 005');
  const [verifierTitle, setVerifierTitle] = useState(() => localStorage.getItem('verifier_title_rekap') || 'Verifikator / Kasi PMD');

  const [generalNotes, setGeneralNotes] = useState(() => localStorage.getItem('general_notes_rekap') || '1. Pelaksanaan fisik dan penyerapan anggaran secara umum telah berjalan dengan baik sesuai target prioritas.\n2. Agar jajaran Pemerintahan Desa tetap mempertahankan tertib administrasi SPJ dan penyampaian berkas tepat waktu.\n3. Pertahankan sinergitas antara Desa dengan Tim Monev PMD Kecamatan Waru.');

  React.useEffect(() => {
    localStorage.setItem('camat_name_rekap', camatName);
  }, [camatName]);

  React.useEffect(() => {
    localStorage.setItem('camat_nip_rekap', camatNip);
  }, [camatNip]);

  React.useEffect(() => {
    localStorage.setItem('camat_title_rekap', camatTitle);
  }, [camatTitle]);

  React.useEffect(() => {
    localStorage.setItem('verifier_name_rekap', verifierName);
  }, [verifierName]);

  React.useEffect(() => {
    localStorage.setItem('verifier_nip_rekap', verifierNip);
  }, [verifierNip]);

  React.useEffect(() => {
    localStorage.setItem('verifier_title_rekap', verifierTitle);
  }, [verifierTitle]);

  React.useEffect(() => {
    localStorage.setItem('general_notes_rekap', generalNotes);
  }, [generalNotes]);

  // Synchronize when modal opens or initialVillage changes
  React.useEffect(() => {
    if (isOpen) {
      setSelectedVillage(initialVillage);
    }
  }, [isOpen, initialVillage]);

  // 1. Filtered data for report
  const reportActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchVillage = selectedVillage === 'ALL' || act.village === selectedVillage;
      const matchSector = selectedSector === 'ALL' || act.sector === selectedSector;
      const matchStatus = selectedStatus === 'ALL' 
        ? true 
        : selectedStatus === 'FISIK_100_BELUM_ACC'
          ? ((act.progressPhysical === 100 || act.status === 'SELESAI') && !act.isKecamatanApproved)
          : selectedStatus === 'SELESAI'
            ? (act.isKecamatanApproved === true)
            : act.status === selectedStatus;
      const matchSource = selectedSource === 'ALL' || (act.sourceOfFunds || 'Dana Desa (DD)') === selectedSource;
      return matchVillage && matchSector && matchStatus && matchSource;
    });
  }, [activities, selectedVillage, selectedSector, selectedStatus, selectedSource]);

  // 2. Calculations based on filtered data
  const summary = useMemo(() => {
    const totalCount = reportActivities.length;
    const paguTotal = reportActivities.reduce((sum, a) => sum + a.budgetTotal, 0);
    const spjTotal = reportActivities.reduce((sum, a) => sum + a.budgetSpent, 0);
    const avgFisik = totalCount > 0 
      ? Math.round(reportActivities.reduce((sum, a) => sum + a.progressPhysical, 0) / totalCount) 
      : 0;
    const avgKeuangan = paguTotal > 0 
      ? Math.round((spjTotal / paguTotal) * 100) 
      : 0;

    return {
      totalCount,
      paguTotal,
      spjTotal,
      avgFisik,
      avgKeuangan,
    };
  }, [reportActivities]);

  // Current Indonesian Date formatted beautifully
  const formattedDateIndo = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  // Find the evaluator name from the selected/filtered activities or history
  const activeEvaluatorName = useMemo(() => {
    // Look in currently filtered report activities first
    for (const act of reportActivities) {
      if (act.approvedBy && act.approvedBy.trim()) {
        return act.approvedBy;
      }
    }
    // Look in recommendations history of filtered activities
    for (const act of reportActivities) {
      if (act.recommendationsHistory && act.recommendationsHistory.length > 0) {
        for (const rec of act.recommendationsHistory) {
          if (rec.officerName && rec.officerName.trim()) {
            return rec.officerName;
          }
        }
      }
    }
    // Also check all activities globally
    for (const act of activities) {
      if (act.approvedBy && act.approvedBy.trim()) {
        return act.approvedBy;
      }
    }
    // Default fallback
    return 'Bpk. Siswanto (Kasi PMD Kec. Waru)';
  }, [reportActivities, activities]);

  const formatNipString = (nip: string) => {
    if (!nip) return '';
    const clean = nip.replace(/^NIP\.?\s*/i, '').trim();
    return `NIP. ${clean}`;
  };

  const evaluatorInfo = useMemo(() => {
    const fullNameWithNip = activeEvaluatorName;
    if (fullNameWithNip.includes('(NIP.')) {
      const parts = fullNameWithNip.split('(NIP.');
      const name = parts[0].trim();
      const nip = parts[1].replace(')', '').trim();
      return { name, nip: formatNipString(nip) };
    }
    if (fullNameWithNip.includes('NIP.')) {
      const parts = fullNameWithNip.split('NIP.');
      const name = parts[0].trim();
      const nip = parts[1].trim();
      return { name, nip: formatNipString(nip) };
    }
    return { name: fullNameWithNip, nip: '' };
  }, [activeEvaluatorName]);

  if (!isOpen) return null;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Container */}
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Modal Header Controls (Hidden during print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-600/30 rounded-lg text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Cetak Rekapitulasi Realisasi APBDes</h2>
              <p className="text-[10px] text-slate-400">Pilih rentang wilayah dan bidang sebelum melakukan pencetakan fisik atau eskpor PDF.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPrint}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configurations & Quick Filter Controls (Hidden during print) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0 print:hidden">
          {/* Desa Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Building2 className="w-3 h-3 text-slate-400" /> Wilayah Administrasi Desa
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value as any)}
              disabled={initialVillage !== 'ALL'}
              className="w-full text-xs font-semibold bg-white disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {initialVillage === 'ALL' && <option value="ALL">Semua Desa (Bangun Mulya, Sesulu, Api-api)</option>}
              <option value="Bangun Mulya">Desa Bangun Mulya</option>
              <option value="Sesulu">Desa Sesulu</option>
              <option value="Api-api">Desa Api-api</option>
            </select>
          </div>

          {/* Bidang/Sector Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Filter className="w-3 h-3 text-slate-400" /> Bidang Prioritas APBDes
            </label>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as any)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 truncate"
            >
              <option value="ALL">Semua Bidang Anggaran</option>
              <option value="Penyelenggaraan Pemerintahan">Penyelenggaraan Pemerintahan</option>
              <option value="Pembangunan Desa (Infrastruktur)">Pembangunan Desa (Infrastruktur)</option>
              <option value="Pembangunan Desa (Non Infrastruktur)">Pembangunan Desa (Non Infrastruktur)</option>
              <option value="Pembinaan Kemasyarakatan">Pembinaan Kemasyarakatan</option>
              <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
              <option value="Penanggulangan Bencana & Mendesak">Kebencanaan & Mendesak</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-slate-400" /> Status Realisasi Fisik
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Status Fisik</option>
              <option value="BELUM_MULAI">Belum Mulai</option>
              <option value="DALAM_PROSES">Dalam Proses</option>
              <option value="SELESAI">Selesai (Sudah TTD / ACC PMD)</option>
              <option value="FISIK_100_BELUM_ACC">Fisik 100% Belum ACC/TTD</option>
            </select>
          </div>

          {/* Sumber Dana Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Coins className="w-3 h-3 text-slate-400" /> Sumber Dana APBDes
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value as any)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ALL">Semua Sumber Dana</option>
              <option value="Dana Desa (DD)">Dana Desa (DD)</option>
              <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD)</option>
              <option value="Pendapatan Bagi Hasil (PBH)">Pendapatan Bagi Hasil (PBH)</option>
              <option value="Bantuan Keuangan (Bankeu)">Bantuan Keuangan (Bankeu)</option>
              <option value="Pendapatan Asli Desa (PAD)">Pendapatan Asli Desa (PAD)</option>
              <option value="Sisa Lebih Perhitungan Anggaran (SiLPA)">Sisa Lebih Perhitungan Anggaran (SiLPA)</option>
            </select>
          </div>
        </div>

        {/* Input Nama Camat, NIP & Verifikator (Hidden during print) */}
        <div className="bg-slate-50/75 px-4 py-3 border-b border-slate-200 flex flex-col gap-3 shrink-0 print:hidden text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Penandatangan / Camat */}
            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
              <h5 className="font-bold text-slate-700 border-b pb-1 text-[10px] tracking-wider uppercase flex items-center gap-1">
                <span>👤</span> PENANDATANGAN / CAMAT ATASAN
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Jabatan</label>
                  <input
                    type="text"
                    value={camatTitle}
                    onChange={(e) => setCamatTitle(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Camat Kecamatan Waru"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nama Atasan</label>
                  <input
                    type="text"
                    value={camatName}
                    onChange={(e) => setCamatName(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="AHMAD YANI, S.STP"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">NIP Atasan</label>
                  <input
                    type="text"
                    value={camatNip}
                    onChange={(e) => setCamatNip(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="19741210 200312 1 004"
                  />
                </div>
              </div>
            </div>

            {/* Verifikator Laporan */}
            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 shadow-xs">
              <h5 className="font-bold text-slate-700 border-b pb-1 text-[10px] tracking-wider uppercase flex items-center gap-1">
                <span>🔍</span> VERIFIKATOR LAPORAN
              </h5>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Jabatan Verifikator</label>
                  <input
                    type="text"
                    value={verifierTitle}
                    onChange={(e) => setVerifierTitle(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Verifikator / Kasi PMD"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Nama Verifikator</label>
                  <input
                    type="text"
                    value={verifierName}
                    onChange={(e) => setVerifierName(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Sri Wahyuni, S.Sos"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">NIP Verifikator</label>
                  <input
                    type="text"
                    value={verifierNip}
                    onChange={(e) => setVerifierNip(e.target.value)}
                    className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                    placeholder="19800512 200903 2 005"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Catatan / Rekomendasi Input */}
          <div className="p-3 bg-white rounded-lg border border-slate-200 shadow-xs space-y-1.5">
            <h5 className="font-bold text-slate-700 border-b pb-1 text-[10px] tracking-wider uppercase flex items-center gap-1">
              <span>📝</span> CATATAN / REKOMENDASI HASIL REKAPITULASI (MONEV KECAMATAN)
            </h5>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="w-full h-16 text-xs font-semibold bg-slate-50 focus:bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 font-sans"
              placeholder="Masukkan catatan evaluasi atau rekomendasi umum untuk desa-desa di sini (akan dicetak di bawah tabel)..."
            />
          </div>
        </div>

        {/* Scrollable Printable Document Layout */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center print:bg-white print:p-0">
          
          {/* Paper Canvas (Simulating A4 portrait document) */}
          <div 
            id="print-area" 
            className="w-full max-w-[210mm] bg-white p-[15mm] shadow-md border border-slate-300 font-sans text-slate-900 rounded-xs min-h-[297mm] flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none"
          >
            {/* Header / Kop Dinas Resmi (Standard Indonesia Government Format) */}
            <div className="border-b-4 border-double border-slate-950 pb-4 text-center select-none">
              <div className="flex items-center justify-center gap-4">
                {/* Lambang Kabupaten Penajam Paser Utara */}
                <img 
                  src={absoluteLogoUrl} 
                  alt="Logo Kabupaten Penajam Paser Utara" 
                  className="w-14 h-16 object-contain shrink-0"
                />
                
                <div>
                  <h3 className="text-sm font-bold tracking-widest uppercase text-slate-950">PEMERINTAH KABUPATEN PENAJAM PASER UTARA</h3>
                  <h2 className="text-lg font-extrabold uppercase text-slate-950 tracking-tight leading-normal">KECAMATAN WARU</h2>
                  <p className="text-[10px] text-slate-600 font-medium">Jl. Negara Propinsi Km. 25 RT. 04, Kode Pos 76282, Waru, Penajam Paser Utara, Kalimantan Timur</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">Situs Dashboard Real-Time: https://simonev-apbdes.waru.go.id</p>
                </div>
              </div>
            </div>

            {/* Document Title / Perihal */}
            <div className="my-6 text-center space-y-1">
              <h2 className="text-sm font-bold tracking-wide uppercase text-slate-950 decoration-1">
                REKAPITULASI REALISASI PELAKSANAAN ANGGARAN & FISIK APBDES
              </h2>
              <div className="text-xs font-semibold text-slate-800 uppercase">
                TAHUN ANGGARAN {selectedYear} • KECAMATAN WARU
              </div>
              <div className="w-32 h-0.5 bg-slate-900 mx-auto mt-2"></div>
            </div>

            {/* Meta-information Grid */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-slate-50/70 p-3 rounded-lg border border-slate-200 mb-6 select-none print:bg-white">
              <div className="space-y-1">
                <div>
                  <span className="font-semibold text-slate-500">Ruang Lingkup / Desa:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {selectedVillage === 'ALL' ? 'Gabungan Se-Kecamatan (3 Desa)' : `Pemerintah Desa ${selectedVillage}`}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Klasifikasi Bidang:</span>{' '}
                  <span className="font-bold text-slate-900 truncate">
                    {selectedSector === 'ALL' ? 'Seluruh Bidang APBDes' : selectedSector}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Sumber Anggaran:</span>{' '}
                  <span className="font-bold text-slate-900">
                    {selectedSource === 'ALL' ? 'Semua Sumber Dana' : selectedSource}
                  </span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <div>
                  <span className="font-semibold text-slate-500">Tanggal Rekapitulasi:</span>{' '}
                  <span className="font-mono font-bold text-slate-900">{formattedDateIndo}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">Status Filter:</span>{' '}
                  <span className="font-mono font-bold text-slate-900">
                    {selectedStatus === 'ALL' 
                      ? 'Semua Kinerja Fisik' 
                      : selectedStatus === 'FISIK_100_BELUM_ACC'
                        ? 'Fisik 100% Belum ACC/TTD'
                        : selectedStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Summary Block for Government officials */}
            <div className="grid grid-cols-4 border border-slate-350 rounded-lg overflow-hidden text-center divide-x divide-slate-350 mb-6 select-none">
              <div className="p-3 bg-slate-50/50">
                <p className="text-[9px] font-bold text-slate-550 uppercase tracking-wide">Jumlah Kegiatan</p>
                <p className="text-base font-bold text-slate-900 mt-1 font-mono">{summary.totalCount} Usulan</p>
              </div>
              <div className="p-3 bg-slate-50/50">
                <p className="text-[9px] font-bold text-slate-550 uppercase tracking-wide">Pagu Pagu Belanja</p>
                <p className="text-xs font-bold text-slate-900 mt-2 font-mono">{formatRupiah(summary.paguTotal)}</p>
              </div>
              <div className="p-3 bg-slate-50/50">
                <p className="text-[9px] font-bold text-slate-550 uppercase tracking-wide">SPJ Realisasi Belanja</p>
                <p className="text-xs font-bold text-slate-900 mt-2 font-mono">{formatRupiah(summary.spjTotal)}</p>
              </div>
              <div className="p-3 bg-slate-50/50">
                <p className="text-[9px] font-bold text-slate-550 uppercase tracking-wide">Rata-Rata Fisik / SPJ</p>
                <p className="text-xs font-semibold text-slate-950 mt-1.5 font-mono">
                  Fisik: <span className="font-bold text-blue-600">{summary.avgFisik}%</span>
                  <br />
                  SPJ: <span className="font-bold text-emerald-600">{summary.avgKeuangan}%</span>
                </p>
              </div>
            </div>            {/* Formal Government style Table */}
            <div className="flex-grow">
              <table className="w-full text-left border-collapse border border-slate-400 table-fixed text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 text-center uppercase tracking-tight select-none">
                    <th className="border border-slate-400 p-2 w-[4%]">No</th>
                    <th className="border border-slate-400 p-2 w-[31%] text-left">Deskripsi Program & Lokasi Dusun</th>
                    <th className="border border-slate-400 p-2 w-[11%]">Desa</th>
                    <th className="border border-slate-400 p-2 w-[14%]">Anggaran Belanja (Pagu)</th>
                    <th className="border border-slate-400 p-2 w-[14%]">Realisasi SPJ</th>
                    <th className="border border-slate-400 p-2 w-[6%]">Serap Keu.</th>
                    <th className="border border-slate-400 p-2 w-[6%]">Fisik (%)</th>
                    <th className="border border-slate-400 p-2 w-[14%]">Rekomendasi / Catatan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {reportActivities.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="border border-slate-400 text-center py-6 text-slate-400 font-medium italic">
                        Belum ada data program kegiatan untuk pencarian / filter ini.
                      </td>
                    </tr>
                  ) : (
                    reportActivities.map((act, index) => {
                      const spendPercent = act.budgetTotal > 0 ? Math.round((act.budgetSpent / act.budgetTotal) * 100) : 0;
                      return (
                        <tr key={act.id} className="hover:bg-slate-55 border-b border-slate-400 align-top">
                          <td className="border border-slate-400 p-2 text-center font-mono font-bold">{index + 1}</td>
                          <td className="border border-slate-400 p-2 space-y-1">
                            <div className="font-bold text-slate-955 leading-tight">{act.name}</div>
                            <div className="text-[8px] text-slate-500 font-semibold tracking-wide uppercase">
                              {act.sector} | <span className="text-blue-800 font-bold">💰 {act.sourceOfFunds || 'Dana Desa (DD)'}</span>
                            </div>
                          </td>
                          <td className="border border-slate-400 p-2 text-center font-medium">Desa {act.village}</td>
                          <td className="border border-slate-400 p-2 text-right font-mono">{formatRupiah(act.budgetTotal)}</td>
                          <td className="border border-slate-400 p-2 text-right font-mono text-emerald-950">{formatRupiah(act.budgetSpent)}</td>
                          <td className="border border-slate-400 p-2 text-center font-mono font-bold text-slate-800">{spendPercent}%</td>
                          <td className="border border-slate-400 p-2 text-center font-mono font-bold text-slate-950">{act.progressPhysical}%</td>
                          <td className="border border-slate-400 p-2 text-left text-slate-850 font-normal leading-normal whitespace-pre-wrap break-words">
                            {act.isKecamatanApproved ? (
                              <div className="text-emerald-700 font-extrabold text-[8px] uppercase tracking-wider mb-1 flex items-center gap-0.5 select-none">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Sudah TTD / ACC PMD
                              </div>
                            ) : act.progressPhysical === 100 ? (
                              <div className="text-amber-700 font-extrabold text-[8px] uppercase tracking-wider mb-1 flex items-center gap-0.5 select-none">
                                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Belum ACC (Fisik 100%)
                              </div>
                            ) : null}
                            {act.recommendation ? (
                              <div>{act.recommendation}</div>
                            ) : act.incompleteReason ? (
                              <div className="text-amber-800 italic">Kendala: {act.incompleteReason}</div>
                            ) : (
                              <span className="text-slate-400 italic font-mono">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Catatan & Rekomendasi Rekapitulasi */}
            {generalNotes && generalNotes.trim() && (
              <div className="mt-4 p-3 bg-slate-50/50 border border-slate-400 rounded-lg text-[10px] text-left">
                <h5 className="font-bold text-slate-900 border-b border-slate-300 pb-1 mb-1.5 uppercase tracking-wide flex items-center gap-1.5 select-none">
                  <span>📝</span> Catatan / Rekomendasi Tim Pembina & Pengawas Kecamatan:
                </h5>
                <p className="text-slate-800 leading-relaxed font-sans whitespace-pre-line font-medium">
                  {generalNotes}
                </p>
              </div>
            )}

            {/* Indonesian Signatures Block (Legitimacy section) */}
            <div className="mt-8 pt-6 select-none text-[10.5px]">
              <div className="grid grid-cols-2 gap-4 text-center text-xs">
                {/* Verifier Sign */}
                <div className="flex flex-col justify-between h-full min-h-[140px]">
                  <div>
                    <p className="text-slate-500 font-medium">Diverifikasi Oleh,</p>
                    <p className="font-bold mt-1 text-slate-900">{verifierTitle || 'Verifikator'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-955 underline uppercase">{verifierName || 'NAMA VERIFIKATOR'}</p>
                    {verifierNip ? (
                      <p className="text-[10px] text-slate-600 font-mono mt-0.5">{formatNipString(verifierNip)}</p>
                    ) : (
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5 font-mono">NIP. -</p>
                    )}
                  </div>
                </div>

                {/* Kecamatan Approval Sign */}
                <div className="flex flex-col justify-between h-full min-h-[140px]">
                  <div>
                    <p className="text-slate-550 font-medium">Waru, {formattedDateIndo}</p>
                    <p className="font-bold text-slate-900 font-bold">Mengetahui & Mengesahkan,</p>
                    <p className="font-semibold text-slate-700 text-[11px] leading-tight mt-0.5">{camatTitle}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-955 underline uppercase">{camatName}</p>
                    {camatNip ? (
                      <span className="text-[10px] text-slate-600 block font-mono mt-0.5">{formatNipString(camatNip)}</span>
                    ) : (
                      <span className="text-[10px] text-slate-450 block font-mono mt-0.5">NIP. -</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Informative footer */}
              <div className="mt-8 text-center text-[8px] text-slate-400 leading-none">
                Dokumen ini merupakan cetak rekapitulasi data resmi terintegrasi dengan Cloud Firestore melalui Portal Simonev APBDes Penilai-Kecamatan Waru. 
                <br />
                <span className="font-mono mt-1 inline-block text-slate-500 font-semibold uppercase">ID TRANSAKSI: TX-PPU-{Date.now().toString(16)}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
