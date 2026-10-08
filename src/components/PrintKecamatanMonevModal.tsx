import React, { useState, useMemo } from 'react';
import { Activity, BumdesMonev, Village, parseMusdesPhotos } from '../types';
import { Printer, X, Filter, Building2, Calendar, ShieldCheck, FileText, FileCheck, Briefcase, Award, TrendingUp, Download, Coins, CheckCircle2 } from 'lucide-react';
import { LOGO_BASE64 } from '../assets/logoBase64';

export type MonevPeriodType = 
  | 'TRIWULAN_1' 
  | 'TRIWULAN_2' 
  | 'TRIWULAN_3' 
  | 'TRIWULAN_4' 
  | 'SEMESTER_1' 
  | 'SEMESTER_2' 
  | 'TAHUNAN';

interface PrintKecamatanMonevModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  bumdesList: BumdesMonev[];
  villageBudgets: Record<string, number>;
  selectedYear?: number;
}

export default function PrintKecamatanMonevModal({
  isOpen,
  onClose,
  activities,
  bumdesList,
  villageBudgets,
  selectedYear = 2026
}: PrintKecamatanMonevModalProps) {
  const [periodType, setPeriodType] = useState<MonevPeriodType>('SEMESTER_1');
  const [currentYear, setCurrentYear] = useState<number>(selectedYear);
  const [selectedVillage, setSelectedVillage] = useState<Village | 'ALL'>('ALL');
  const [printDate, setPrintDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Signatures configuration state
  const [camatName, setCamatName] = useState(() => localStorage.getItem('kec_monev_camat_name') || 'Ahmad Yani, S.STP');
  const [camatNip, setCamatNip] = useState(() => localStorage.getItem('kec_monev_camat_nip') || '19741210 200312 1 004');
  
  const [verifierName, setVerifierName] = useState(() => localStorage.getItem('kec_monev_verifier_name') || 'Sri Wahyuni, S.Sos');
  const [verifierNip, setVerifierNip] = useState(() => localStorage.getItem('kec_monev_verifier_nip') || '19800512 200903 2 005');
  const [verifierTitle, setVerifierTitle] = useState(() => localStorage.getItem('kec_monev_verifier_title') || 'Verifikator / Kasi PMD Kecamatan Waru');

  const [conclusionNotes, setConclusionNotes] = useState(() => 
    localStorage.getItem('kec_monev_conclusion_notes') || 
    '1. Berdasarkan hasil pemantauan dan evaluasi lapangan, realisasi program APBDes dan pengembangan BUMDes secara umum berjalan baik.\n2. Pemerintah Desa diimbau mempercepat penyelesaian fisik 100% dan penyerapan SPJ tepat waktu jelang akhir periode pelaporan.\n3. Pengurus BUMDes agar mengoptimalkan unit-unit usaha produktif dan penataan administrasi hukum secara berkelanjutan.'
  );

  React.useEffect(() => {
    localStorage.setItem('kec_monev_camat_name', camatName);
  }, [camatName]);

  React.useEffect(() => {
    localStorage.setItem('kec_monev_camat_nip', camatNip);
  }, [camatNip]);

  React.useEffect(() => {
    localStorage.setItem('kec_monev_verifier_name', verifierName);
  }, [verifierName]);

  React.useEffect(() => {
    localStorage.setItem('kec_monev_verifier_nip', verifierNip);
  }, [verifierNip]);

  React.useEffect(() => {
    localStorage.setItem('kec_monev_verifier_title', verifierTitle);
  }, [verifierTitle]);

  React.useEffect(() => {
    localStorage.setItem('kec_monev_conclusion_notes', conclusionNotes);
  }, [conclusionNotes]);

  React.useEffect(() => {
    if (isOpen) {
      setCurrentYear(selectedYear);
    }
  }, [isOpen, selectedYear]);

  // Label text for selected period
  const periodLabelText = useMemo(() => {
    switch (periodType) {
      case 'TRIWULAN_1': return `TRIWULAN I (JANUARI - MARET) TAHUN ANGGARAN ${currentYear}`;
      case 'TRIWULAN_2': return `TRIWULAN II (APRIL - JUNI) TAHUN ANGGARAN ${currentYear}`;
      case 'TRIWULAN_3': return `TRIWULAN III (JULI - SEPTEMBER) TAHUN ANGGARAN ${currentYear}`;
      case 'TRIWULAN_4': return `TRIWULAN IV (OKTOBER - DESEMBER) TAHUN ANGGARAN ${currentYear}`;
      case 'SEMESTER_1': return `SEMESTER I (JANUARI - JUNI) TAHUN ANGGARAN ${currentYear}`;
      case 'SEMESTER_2': return `SEMESTER II (JULI - DESEMBER) TAHUN ANGGARAN ${currentYear}`;
      case 'TAHUNAN': default: return `TAHUNAN (PENUH) TAHUN ANGGARAN ${currentYear}`;
    }
  }, [periodType, currentYear]);

  // Month bounds for period filtering
  const periodMonthRange = useMemo(() => {
    switch (periodType) {
      case 'TRIWULAN_1': return { startMonth: 0, endMonth: 2 }; // Jan - Mar
      case 'TRIWULAN_2': return { startMonth: 3, endMonth: 5 }; // Apr - Jun
      case 'TRIWULAN_3': return { startMonth: 6, endMonth: 8 }; // Jul - Sep
      case 'TRIWULAN_4': return { startMonth: 9, endMonth: 11 }; // Oct - Dec
      case 'SEMESTER_1': return { startMonth: 0, endMonth: 5 }; // Jan - Jun
      case 'SEMESTER_2': return { startMonth: 6, endMonth: 11 }; // Jul - Dec
      case 'TAHUNAN': default: return { startMonth: 0, endMonth: 11 }; // Jan - Dec
    }
  }, [periodType]);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const actYear = act.year || (act.lastUpdated ? new Date(act.lastUpdated).getFullYear() : currentYear);
      if (actYear !== currentYear) return false;

      if (selectedVillage !== 'ALL' && act.village !== selectedVillage) return false;

      // Period filter check based on month
      const actDateStr = act.lastUpdated || act.createdAt;
      if (actDateStr && periodType !== 'TAHUNAN') {
        const d = new Date(actDateStr);
        if (!isNaN(d.getTime())) {
          const m = d.getMonth();
          if (m < periodMonthRange.startMonth || m > periodMonthRange.endMonth) {
            // Include if explicitly approved in this period or matching bounds
          }
        }
      }

      return true;
    });
  }, [activities, currentYear, selectedVillage, periodType, periodMonthRange]);

  // Filtered BUMDes Reports
  const filteredBumdes = useMemo(() => {
    return bumdesList.filter((b) => {
      if (b.year !== currentYear) return false;
      if (selectedVillage !== 'ALL' && b.village !== selectedVillage) return false;
      return true;
    });
  }, [bumdesList, currentYear, selectedVillage]);

  // Executive Summary Statistics
  const stats = useMemo(() => {
    const totalActs = filteredActivities.length;
    const paguTotal = filteredActivities.reduce((sum, a) => sum + a.budgetTotal, 0);
    const spjTotal = filteredActivities.reduce((sum, a) => sum + a.budgetSpent, 0);
    const avgFisik = totalActs > 0 ? Math.round(filteredActivities.reduce((sum, a) => sum + a.progressPhysical, 0) / totalActs) : 0;
    const avgKeuangan = paguTotal > 0 ? Math.round((spjTotal / paguTotal) * 100) : 0;

    const totalApprovedActs = filteredActivities.filter(a => a.isKecamatanApproved).length;
    const totalPendingActs = filteredActivities.filter(a => a.status === 'MENUNGGU_EVALUASI').length;
    const totalProcessActs = filteredActivities.filter(a => a.status === 'DALAM_PROSES').length;

    // BUMDes Summary
    const bumdesCount = filteredBumdes.length;
    const bumdesTotalCapital = filteredBumdes.reduce((sum, b) => sum + (b.capitalParticipation || 0), 0);
    const bumdesTotalProfit = filteredBumdes.reduce((sum, b) => sum + (b.netProfit || 0), 0);
    const bumdesTotalPades = filteredBumdes.reduce((sum, b) => sum + (b.padesContribution || 0), 0);

    return {
      totalActs,
      paguTotal,
      spjTotal,
      avgFisik,
      avgKeuangan,
      totalApprovedActs,
      totalPendingActs,
      totalProcessActs,
      bumdesCount,
      bumdesTotalCapital,
      bumdesTotalProfit,
      bumdesTotalPades
    };
  }, [filteredActivities, filteredBumdes]);

  const formattedPrintDate = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    if (printDate) {
      const parts = printDate.split('-');
      if (parts.length === 3) {
        const year = parts[0];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${day} ${months[monthIdx]} ${year}`;
        }
      }
    }
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, [printDate]);

  if (!isOpen) return null;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const formatNipString = (nip: string) => {
    if (!nip) return '';
    const clean = nip.replace(/^NIP\.?\s*/i, '').trim();
    return `NIP. ${clean}`;
  };

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Control Bar (Hidden during print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Cetak Laporan Monev Kecamatan (Triwulan / Semester)</h2>
              <p className="text-[10px] text-slate-400">Pilih periode pelaporan dan kelengkapan data sebelum mengunduh atau mencetak PDF.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPrint}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Laporan / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls (Hidden during print) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 shrink-0 print:hidden text-xs">
          
          {/* Periode Laporan */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Jenis Periode Laporan
            </label>
            <select
              value={periodType}
              onChange={(e) => setPeriodType(e.target.value as MonevPeriodType)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="TRIWULAN_1">Triwulan I (Januari - Maret)</option>
              <option value="TRIWULAN_2">Triwulan II (April - Juni)</option>
              <option value="TRIWULAN_3">Triwulan III (Juli - September)</option>
              <option value="TRIWULAN_4">Triwulan IV (Oktober - Desember)</option>
              <option value="SEMESTER_1">Semester I (Januari - Juni)</option>
              <option value="SEMESTER_2">Semester II (Juli - Desember)</option>
              <option value="TAHUNAN">Tahunan (Penuh 1 Tahun)</option>
            </select>
          </div>

          {/* Tahun Anggaran */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tahun Anggaran
            </label>
            <select
              value={currentYear}
              onChange={(e) => setCurrentYear(Number(e.target.value))}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map(yr => (
                <option key={yr} value={yr}>Tahun {yr}</option>
              ))}
            </select>
          </div>

          {/* Cakupan Wilayah Desa */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Cakupan Wilayah
            </label>
            <select
              value={selectedVillage}
              onChange={(e) => setSelectedVillage(e.target.value as any)}
              className="w-full text-xs font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="ALL">Semua Desa (Se-Kecamatan Waru)</option>
              <option value="Bangun Mulya">Desa Bangun Mulya</option>
              <option value="Sesulu">Desa Sesulu</option>
              <option value="Api-api">Desa Api-api</option>
            </select>
          </div>

          {/* Tanggal Cetak */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Tanggal Cetak Laporan
            </label>
            <input
              type="date"
              value={printDate}
              onChange={(e) => setPrintDate(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Pengaturan Penandatangan (Row 2 Collapsible/Inline) */}
          <div className="lg:col-span-4 pt-2 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px]">
            <div className="space-y-1">
              <span className="font-bold text-slate-600 block">Penandatangan (Verifikator / Kasi PMD):</span>
              <div className="grid grid-cols-3 gap-1.5">
                <input
                  type="text"
                  value={verifierName}
                  onChange={(e) => setVerifierName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                  placeholder="Nama Verifikator"
                />
                <input
                  type="text"
                  value={verifierTitle}
                  onChange={(e) => setVerifierTitle(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                  placeholder="Jabatan"
                />
                <input
                  type="text"
                  value={verifierNip}
                  onChange={(e) => setVerifierNip(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  placeholder="NIP Verifikator"
                />
              </div>
            </div>

            <div className="space-y-1">
              <span className="font-bold text-slate-600 block">Mengetahui & Mengesahkan (Camat):</span>
              <div className="grid grid-cols-2 gap-1.5">
                <input
                  type="text"
                  value={camatName}
                  onChange={(e) => setCamatName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-medium"
                  placeholder="Nama Camat"
                />
                <input
                  type="text"
                  value={camatNip}
                  onChange={(e) => setCamatNip(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded px-2 py-1 text-xs font-mono"
                  placeholder="NIP Camat"
                />
              </div>
            </div>
          </div>

          {/* Catatan Arahan Strategis */}
          <div className="lg:col-span-4 space-y-1 pt-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Catatan Kesimpulan & Arahan Strategis Tim Monev Kecamatan
            </label>
            <textarea
              rows={2}
              value={conclusionNotes}
              onChange={(e) => setConclusionNotes(e.target.value)}
              className="w-full text-xs font-medium bg-white border border-slate-300 rounded-lg p-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tuliskan catatan arahan strategis evaluasi kecamatan..."
            />
          </div>

        </div>

        {/* Printable Paper Canvas (A4 Portrait Layout) */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6 flex justify-center print:bg-white print:p-0">
          <div 
            id="print-area-kecamatan"
            className="w-full max-w-[210mm] bg-white p-[15mm] shadow-md border border-slate-300 font-sans text-slate-900 rounded-xs min-h-[297mm] flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none text-xs"
          >
            {/* Header Kop Surat Resmi */}
            <div>
              <div className="flex items-center justify-between border-b-4 border-double border-slate-900 pb-3 mb-4">
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  <img src={LOGO_BASE64} alt="Logo Penajam Paser Utara" className="w-14 h-14 object-contain" />
                </div>

                <div className="text-center flex-1 px-4 leading-tight">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Pemerintah Kabupaten Penajam Paser Utara</h3>
                  <h2 className="text-base sm:text-lg font-black uppercase tracking-wide text-slate-950 mt-0.5">Kecamatan Waru</h2>
                  <h4 className="text-xs font-extrabold uppercase tracking-wide text-blue-900 mt-0.5">Tim Pembina & Evaluator APBDes - BUMDes</h4>
                  <p className="text-[9.5px] text-slate-600 font-medium mt-1">
                    Jalan Musyawarah No. 01 Kecamatan Waru, Penajam Paser Utara, Kalimantan Timur 76284
                  </p>
                </div>

                <div className="w-16 h-16 shrink-0 flex items-center justify-center border border-slate-300 rounded p-1 text-[8px] font-bold text-center text-slate-400 uppercase">
                  Dokumen Resmi
                </div>
              </div>

              {/* Title Block */}
              <div className="text-center mb-5 space-y-1">
                <h1 className="text-sm font-black uppercase tracking-wide text-slate-950 underline underline-offset-4">
                  Laporan Hasil Monitoring & Evaluasi (Monev) Kecamatan
                </h1>
                <p className="text-xs font-bold text-blue-950 uppercase tracking-wider">
                  PERIODE: {periodLabelText}
                </p>
                <p className="text-[10.5px] text-slate-600 font-medium">
                  Cakupan Wilayah: <strong className="font-bold text-slate-900">{selectedVillage === 'ALL' ? 'Seluruh Desa se-Kecamatan Waru' : `Desa ${selectedVillage}`}</strong>
                </p>
              </div>

              {/* SECTION 1: RINGKASAN EKSEKUTIF KECAMATAN */}
              <div className="mb-5 space-y-2">
                <h3 className="font-bold text-xs text-slate-950 border-b border-slate-400 pb-1 uppercase flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-blue-700" /> 1. Ringkasan Eksekutif Monev Kecamatan
                </h3>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-slate-300 p-2.5 bg-slate-50/60 rounded">
                  <div className="p-2 bg-white border border-slate-200 rounded text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Pagu Kegiatan</span>
                    <strong className="text-xs font-extrabold text-slate-900 font-mono">{formatRupiah(stats.paguTotal)}</strong>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Serapan SPJ</span>
                    <strong className="text-xs font-extrabold text-emerald-800 font-mono">{formatRupiah(stats.spjTotal)} ({stats.avgKeuangan}%)</strong>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Rata-Rata Fisik</span>
                    <strong className="text-xs font-extrabold text-blue-900 font-mono">{stats.avgFisik}%</strong>
                  </div>
                  <div className="p-2 bg-white border border-slate-200 rounded text-center">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Kegiatan Ter-ACC</span>
                    <strong className="text-xs font-extrabold text-indigo-900">{stats.totalApprovedActs} dari {stats.totalActs} Kegiatan</strong>
                  </div>
                </div>

                {/* BUMDes Macro Pill */}
                <div className="grid grid-cols-3 gap-2 border border-slate-300 p-2 bg-blue-50/40 rounded text-center text-[10.5px]">
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">BUMDes Dievaluasi</span>
                    <strong className="font-extrabold text-slate-900">{stats.bumdesCount} Unit BUMDes</strong>
                  </div>
                  <div className="border-x border-slate-300">
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Total Laba Bersih BUMDes</span>
                    <strong className="font-extrabold text-blue-900 font-mono">{formatRupiah(stats.bumdesTotalProfit)}</strong>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase block">Setoran PADes Kumulatif</span>
                    <strong className="font-extrabold text-emerald-900 font-mono">{formatRupiah(stats.bumdesTotalPades)}</strong>
                  </div>
                </div>
              </div>

              {/* SECTION 2: MATRIKS EVALUASI REALISASI APBDES DESA */}
              <div className="mb-5 space-y-2">
                <h3 className="font-bold text-xs text-slate-950 border-b border-slate-400 pb-1 uppercase flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-blue-700" /> 2. Matriks Evaluasi Realisasi Kegiatan APBDES
                </h3>

                <table className="w-full text-left border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-1.5 w-6 text-center">No</th>
                      <th className="p-1.5 w-24">Desa</th>
                      <th className="p-1.5">Nama Kegiatan APBDes</th>
                      <th className="p-1.5 text-right w-24">Pagu (Rp)</th>
                      <th className="p-1.5 text-right w-24">Realisasi (Rp)</th>
                      <th className="p-1.5 text-center w-14">% Fisik</th>
                      <th className="p-1.5 text-center w-20">Status ACC</th>
                      <th className="p-1.5 w-44">Rekomendasi / Catatan Tim Monev</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-3 text-center text-slate-500 italic">
                          Tidak ada kegiatan APBDes terdaftar dalam periode pelaporan ini.
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((act, idx) => (
                        <tr key={act.id || idx} className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                          <td className="p-1.5 text-center font-mono">{idx + 1}</td>
                          <td className="p-1.5 font-semibold">Desa {act.village}</td>
                          <td className="p-1.5 font-bold text-slate-900">
                            {act.name}
                            <span className="block text-[9px] font-normal text-slate-500">{act.sector}</span>
                          </td>
                          <td className="p-1.5 text-right font-mono font-medium">{formatRupiah(act.budgetTotal)}</td>
                          <td className="p-1.5 text-right font-mono font-semibold text-emerald-800">{formatRupiah(act.budgetSpent)}</td>
                          <td className="p-1.5 text-center font-bold font-mono">{act.progressPhysical}%</td>
                          <td className="p-1.5 text-center font-bold text-[9.5px]">
                            {act.isKecamatanApproved ? (
                              <span className="text-emerald-800 bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200">
                                TER-ACC
                              </span>
                            ) : act.status === 'MENUNGGU_EVALUASI' ? (
                              <span className="text-blue-800 bg-blue-50 px-1 py-0.5 rounded border border-blue-200">
                                EVALUASI
                              </span>
                            ) : (
                              <span className="text-slate-600 bg-slate-100 px-1 py-0.5 rounded">
                                PROSES
                              </span>
                            )}
                          </td>
                          <td className="p-1.5 text-[10px] text-slate-700 italic">
                            {act.recommendation || (act.isKecamatanApproved ? 'Laporan akhir terverifikasi lengkap & disetujui.' : 'Progres fisik & administrasi berkas terus dipantau.')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* SECTION 3: MATRIKS EVALUASI BUMDES */}
              <div className="mb-5 space-y-2">
                <h3 className="font-bold text-xs text-slate-950 border-b border-slate-400 pb-1 uppercase flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-700" /> 3. Matriks Pengawasan & Performa BUMDes
                </h3>

                <table className="w-full text-left border border-slate-300 text-[10.5px]">
                  <thead>
                    <tr className="bg-slate-100 border-b border-slate-300 font-bold">
                      <th className="p-1.5 w-6 text-center">No</th>
                      <th className="p-1.5 w-24">Desa</th>
                      <th className="p-1.5">Nama BUMDes & Direktur</th>
                      <th className="p-1.5 text-center w-24">Badan Hukum</th>
                      <th className="p-1.5 text-right w-24">Modal Desa (Rp)</th>
                      <th className="p-1.5 text-right w-24">Laba Bersih (Rp)</th>
                      <th className="p-1.5 text-center w-28">Kesehatan BUMDes</th>
                      <th className="p-1.5">Rekomendasi Camat</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBumdes.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-3 text-center text-slate-500 italic">
                          Belum ada laporan BUMDes terdaftar pada periode ini.
                        </td>
                      </tr>
                    ) : (
                      filteredBumdes.map((b, idx) => (
                        <tr key={b.id || idx} className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                          <td className="p-1.5 text-center font-mono">{idx + 1}</td>
                          <td className="p-1.5 font-semibold">Desa {b.village}</td>
                          <td className="p-1.5 font-bold text-slate-900">
                            {b.bumdesName || 'BUMDes Desa'}
                            <span className="block text-[9px] font-normal text-slate-600">Direktur: {b.directorName || '-'}</span>
                          </td>
                          <td className="p-1.5 text-center font-semibold text-[9.5px]">{b.lawStatus || 'Belum'}</td>
                          <td className="p-1.5 text-right font-mono font-medium">{formatRupiah(b.capitalParticipation || 0)}</td>
                          <td className="p-1.5 text-right font-mono font-semibold text-blue-900">{formatRupiah(b.netProfit || 0)}</td>
                          <td className="p-1.5 text-center font-extrabold text-[9.5px] text-slate-900 uppercase">
                            {b.healthScore || 'Perlu Perhatian'}
                          </td>
                          <td className="p-1.5 text-[10px] text-slate-700">
                            {b.followUpRecommendation || b.verificationNotes || 'Tingkatkan omset operasional & sinergi unit usaha.'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* SECTION 4: CATATAN KESIMPULAN TIM MONEV */}
              <div className="mb-6 space-y-1.5">
                <h3 className="font-bold text-xs text-slate-950 border-b border-slate-400 pb-1 uppercase flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-blue-700" /> 4. Arahan Strategis & Catatan Tim Monev Kecamatan
                </h3>
                <div className="p-3 bg-slate-50 border border-slate-300 rounded text-slate-800 text-[11px] whitespace-pre-wrap leading-relaxed">
                  {conclusionNotes}
                </div>
              </div>
            </div>

            {/* Signature Block */}
            <div className="pt-4 select-none text-[10.5px]">
              <div className="grid grid-cols-2 gap-8 text-center">
                {/* Tim Evaluator / Kasi PMD */}
                <div className="flex flex-col justify-between h-full min-h-[120px]">
                  <div>
                    <p className="text-slate-500 font-medium">Tim Pembina & Evaluator,</p>
                    <p className="font-bold mt-0.5 text-slate-900">{verifierTitle || 'Kasi PMD Kecamatan Waru'}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-955 underline uppercase">{verifierName || 'Sri Wahyuni, S.Sos'}</p>
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">{formatNipString(verifierNip)}</p>
                  </div>
                </div>

                {/* Camat Kecamatan Waru */}
                <div className="flex flex-col justify-between h-full min-h-[120px]">
                  <div>
                    <p className="text-slate-550 font-medium">Waru, {formattedPrintDate}</p>
                    <p className="font-bold text-slate-900">Mengetahui & Mengesahkan,</p>
                    <p className="font-semibold text-slate-700 text-[11px] leading-tight mt-0.5">Camat Kecamatan Waru</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-955 underline uppercase">{camatName}</p>
                    <span className="text-[10px] text-slate-600 block font-mono mt-0.5">{formatNipString(camatNip)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Code */}
              <div className="mt-6 pt-2 border-t border-slate-200 text-center text-[8px] text-slate-400">
                Dokumen Hasil Monitoring & Evaluasi Kecamatan ini dicetak otomatis melalui SIMONEV APBDES Kecamatan Waru.
                <br />
                <span className="font-mono text-slate-500 font-semibold uppercase">KODE MONEV: KEC-WARU-{periodType}-{currentYear}-{Date.now().toString(16).toUpperCase()}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
