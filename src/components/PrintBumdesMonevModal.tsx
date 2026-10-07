import React, { useState, useMemo } from 'react';
import { BumdesMonev, Village, BumdesHealthScore } from '../types';
import { Printer, X, Building2, Calendar, ShieldCheck, FileText, Briefcase, Users, Coins, Image as ImageIcon, FileSpreadsheet, Box, Download } from 'lucide-react';
import { LOGO_BASE64 } from '../assets/logoBase64';

interface PrintBumdesMonevModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: BumdesMonev | null;
  selectedVillage: Village;
  selectedYear: number;
}

export default function PrintBumdesMonevModal({
  isOpen,
  onClose,
  report,
  selectedVillage,
  selectedYear
}: PrintBumdesMonevModalProps) {
  const absoluteLogoUrl = LOGO_BASE64;

  // Signatures configuration state (hidden during print)
  const [directorName, setDirectorName] = useState(() => report?.directorName || '');
  const [camatName, setCamatName] = useState(() => localStorage.getItem('camat_name_bumdes') || 'Ahmad Yani, S.STP');
  const [camatNip, setCamatNip] = useState(() => localStorage.getItem('camat_nip_bumdes') || '19741210 200312 1 004');
  
  const [verifierName, setVerifierName] = useState(() => localStorage.getItem('verifier_name_bumdes') || 'Bpk. Siswanto');
  const [verifierNip, setVerifierNip] = useState(() => localStorage.getItem('verifier_nip_bumdes') || '19790812 200604 1 012');
  const [verifierTitle, setVerifierTitle] = useState(() => localStorage.getItem('verifier_title_bumdes') || 'Kasi PMD Kecamatan Waru');

  // Synchronize when report or modal open changes
  React.useEffect(() => {
    if (isOpen && report) {
      setDirectorName(report.directorName || '');
    }
  }, [isOpen, report]);

  React.useEffect(() => {
    localStorage.setItem('camat_name_bumdes', camatName);
  }, [camatName]);

  React.useEffect(() => {
    localStorage.setItem('camat_nip_bumdes', camatNip);
  }, [camatNip]);

  React.useEffect(() => {
    localStorage.setItem('verifier_name_bumdes', verifierName);
  }, [verifierName]);

  React.useEffect(() => {
    localStorage.setItem('verifier_nip_bumdes', verifierNip);
  }, [verifierNip]);

  React.useEffect(() => {
    localStorage.setItem('verifier_title_bumdes', verifierTitle);
  }, [verifierTitle]);

  const formattedDateIndo = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

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

  // Status/Health score helper labels
  const getHealthLabel = (score?: BumdesHealthScore) => {
    return score || 'Dasar/Perlu Perhatian';
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
              <h2 className="text-sm font-bold tracking-tight">Cetak Laporan Evaluasi & Monev BUMDes</h2>
              <p className="text-[10px] text-slate-400">Verifikasi tanda tangan sebelum mencetak fisik atau ekspor ke PDF.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPrint}
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak Sekarang / Simpan PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Configurations & Quick Signers (Hidden during print) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 print:hidden text-xs">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Direktur BUMDes
            </label>
            <input
              type="text"
              value={directorName}
              onChange={(e) => setDirectorName(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Contoh: Budi Santoso, S.E."
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Nama Verifikator / Jabatan / NIP (Kecamatan)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <input
                type="text"
                value={verifierName}
                onChange={(e) => setVerifierName(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Verifikator"
              />
              <input
                type="text"
                value={verifierTitle}
                onChange={(e) => setVerifierTitle(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Jabatan"
              />
              <input
                type="text"
                value={verifierNip}
                onChange={(e) => setVerifierNip(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="NIP Verifikator"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Camat Atasan (Kecamatan)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="text"
                value={camatName}
                onChange={(e) => setCamatName(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nama Camat"
              />
              <input
                type="text"
                value={camatNip}
                onChange={(e) => setCamatNip(e.target.value)}
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                placeholder="NIP Camat"
              />
            </div>
          </div>
        </div>

        {/* Scrollable Printable Document Layout */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center print:bg-white print:p-0">
          
          {/* Paper Canvas (Simulating A4 portrait document) */}
          <div 
            id="print-area" 
            className="w-full max-w-[210mm] bg-white p-[15mm] shadow-md border border-slate-300 font-sans text-slate-900 rounded-xs min-h-[297mm] flex flex-col justify-between print:shadow-none print:border-none print:p-0 print:w-full print:max-w-none"
          >
            <div>
              {/* Header / Kop Dinas Resmi */}
              <div className="border-b-4 border-double border-slate-950 pb-4 text-center select-none">
                <div className="flex items-center justify-center gap-4">
                  <img 
                    src={absoluteLogoUrl} 
                    alt="Logo Kabupaten Penajam Paser Utara" 
                    className="w-14 h-16 object-contain shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold tracking-widest uppercase text-slate-950">PEMERINTAH KABUPATEN PENAJAM PASER UTARA</h3>
                    <h2 className="text-lg font-extrabold uppercase text-slate-950 tracking-tight leading-normal">KECAMATAN WARU</h2>
                    <p className="text-[10px] text-slate-600 font-medium">Jl. Negara Propinsi Km. 25 RT. 04, Kode Pos 76282, Waru, Penajam Paser Utara, Kalimantan Timur</p>
                    <p className="text-[9px] text-slate-500 font-mono mt-0.5">Laporan Resmi Sistem Monitoring & Evaluasi Kinerja Desa Terpadu</p>
                  </div>
                </div>
              </div>

              {/* Document Title */}
              <div className="my-6 text-center space-y-1">
                <h2 className="text-sm font-bold tracking-wide uppercase text-slate-950 underline decoration-1 decoration-slate-950">
                  LAPORAN MONITORING & EVALUASI KINERJA BUMDES
                </h2>
                <div className="text-xs font-semibold text-slate-800 uppercase">
                  TAHUN LAPORAN / BUKU: {selectedYear} • DESA {selectedVillage}
                </div>
                <div className="w-32 h-0.5 bg-slate-900 mx-auto mt-2"></div>
              </div>

              {!report ? (
                <div className="text-center py-12 text-slate-500 border border-dashed border-slate-300 rounded-xl my-6">
                  <p className="font-bold text-sm">Belum Ada Pengisian Data Monev BUMDes</p>
                  <p className="text-xs mt-1">Data evaluasi untuk tahun {selectedYear} di Desa {selectedVillage} belum pernah diunggah atau disimpan oleh Operator Desa.</p>
                </div>
              ) : (
                <div className="space-y-6 text-xs">
                  
                  {/* SECTION 1: IDENTITAS BUMDES */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" /> 1. Identitas Badan Usaha (Profil BUMDes)
                    </h4>
                    <table className="w-full text-left border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-bold w-1/3">Nama BUMDes</td>
                          <td className="p-2">{report.bumdesName || 'Belum diisi'}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold">Nama Direktur</td>
                          <td className="p-2">{directorName || report.directorName || 'Belum diisi'}</td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-bold">Tahun Pendirian</td>
                          <td className="p-2">{report.establishedYear || 'Belum diisi'}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold">Desa Wilayah</td>
                          <td className="p-2">Desa {selectedVillage}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 2: STATUS HUKUM & ADMINISTRASI DIGITAL */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5" /> 2. Status Hukum & Dokumen Digital
                    </h4>
                    <table className="w-full text-left border border-slate-300">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                          <th className="p-2 w-1/2">Elemen Penilaian Hukum</th>
                          <th className="p-2 w-1/4 text-center">Status / Ketersediaan</th>
                          <th className="p-2 w-1/4">Keterangan Dokumen</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold">Status Badan Hukum di Kemendesa</td>
                          <td className="p-2 text-center">
                            <span className="font-semibold">{report.lawStatus}</span>
                          </td>
                          <td className="p-2 italic text-slate-600">
                            <div className="flex items-center justify-between gap-2">
                              <span>{report.certificatePdfName ? `Berkas: ${report.certificatePdfName}` : 'Tidak ada berkas'}</span>
                              {report.certificatePdfUrl && (
                                <a
                                  href={report.certificatePdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={report.certificatePdfName || 'Sertifikat_Kemendesa'}
                                  className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0 not-italic"
                                  title="Unduh Berkas Sertifikat"
                                >
                                  <Download className="w-3 h-3" /> Unduh
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-bold">Perdes Pendirian BUMDes</td>
                          <td className="p-2 text-center font-bold text-slate-800">
                            {report.hasPerdesPendirian ? 'ADA' : 'BELUM ADA'}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            <div className="flex items-center justify-between gap-2">
                              <span>{report.perdesPdfName ? `Berkas: ${report.perdesPdfName}` : '-'}</span>
                              {report.perdesPdfUrl && (
                                <a
                                  href={report.perdesPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={report.perdesPdfName || 'Perdes_Pendirian'}
                                  className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0 not-italic"
                                  title="Unduh Perdes Pendirian"
                                >
                                  <Download className="w-3 h-3" /> Unduh
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold">Anggaran Dasar & Anggaran Rumah Tangga (AD/ART)</td>
                          <td className="p-2 text-center font-bold text-slate-800">
                            {report.hasAdArt ? 'ADA' : 'BELUM ADA'}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            <div className="flex items-center justify-between gap-2">
                              <span>{report.adArtPdfName ? `Berkas: ${report.adArtPdfName}` : '-'}</span>
                              {report.adArtPdfUrl && (
                                <a
                                  href={report.adArtPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={report.adArtPdfName || 'AD_ART_BUMDes'}
                                  className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0 not-italic"
                                  title="Unduh AD/ART"
                                >
                                  <Download className="w-3 h-3" /> Unduh
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-bold">Surat Keputusan (SK) Struktur Pengelola</td>
                          <td className="p-2 text-center font-bold text-slate-800">
                            {report.hasSkPengelola ? 'ADA' : 'BELUM ADA'}
                          </td>
                          <td className="p-2 italic text-slate-600">
                            <div className="flex items-center justify-between gap-2">
                              <span>{report.skPengelolaPdfName ? `Berkas: ${report.skPengelolaPdfName}` : '-'}</span>
                              {report.skPengelolaPdfUrl && (
                                <a
                                  href={report.skPengelolaPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={report.skPengelolaPdfName || 'SK_Pengelola'}
                                  className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0 not-italic"
                                  title="Unduh SK Pengelola"
                                >
                                  <Download className="w-3 h-3" /> Unduh
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold">Musyawarah Desa (Musdes) LPJ Pertanggungjawaban</td>
                          <td className="p-2 text-center">
                            <span className="font-semibold">{report.musdesDate ? `Dilaksanakan (${report.musdesDate})` : 'BELUM LAPOR'}</span>
                          </td>
                          <td className="p-2 italic text-slate-600">
                            <div className="flex items-center justify-between gap-2">
                              <span>{report.musdesBaPdfName ? `Berita Acara: ${report.musdesBaPdfName}` : '-'}</span>
                              {report.musdesBaPdfUrl && (
                                <a
                                  href={report.musdesBaPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={report.musdesBaPdfName || 'Berita_Acara_Musdes'}
                                  className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0 not-italic"
                                  title="Unduh Berita Acara Musdes"
                                >
                                  <Download className="w-3 h-3" /> Unduh
                                </a>
                              )}
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 3: RENCANA KERJA & ANGGARAN (RKT & RAB) */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <FileSpreadsheet className="w-3.5 h-3.5" /> 3. Rencana Kerja & Anggaran (RKT & RAB)
                    </h4>
                    
                    <div className="mb-2 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 border border-slate-300 p-2 rounded">
                      <div className="flex items-center justify-between gap-2">
                        <span><strong>Dokumen RKT:</strong> {report.rktDocName ? `📄 ${report.rktDocName}` : 'Belum diunggah oleh Desa'}</span>
                        {report.rktDocUrl && (
                          <a
                            href={report.rktDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={report.rktDocName || 'Dokumen_RKT_Unggahan_Desa'}
                            className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0"
                            title="Unduh Dokumen RKT Hasil Unggahan Desa"
                          >
                            <Download className="w-3 h-3" /> Unduh RKT Unggahan Desa
                          </a>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span><strong>Dokumen RAB:</strong> {report.rabDocName ? `📄 ${report.rabDocName}` : 'Belum diunggah oleh Desa'}</span>
                        {report.rabDocUrl && (
                          <a
                            href={report.rabDocUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={report.rabDocName || 'Dokumen_RAB_Unggahan_Desa'}
                            className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0"
                            title="Unduh Dokumen RAB Hasil Unggahan Desa"
                          >
                            <Download className="w-3 h-3" /> Unduh RAB Unggahan Desa
                          </a>
                        )}
                      </div>
                    </div>

                    <table className="w-full text-left border border-slate-300">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                          <th className="p-2 w-8 text-center">No</th>
                          <th className="p-2">Program / Kegiatan Kerja</th>
                          <th className="p-2">Target Output</th>
                          <th className="p-2 text-right">Anggaran RAB (Rp)</th>
                          <th className="p-2 text-right">Realisasi (Rp)</th>
                          <th className="p-2 text-center w-24">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!report.workPlans || report.workPlans.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-3 text-center text-slate-500 italic">Belum ada rincian target program kerja RKT/RAB terdaftar.</td>
                          </tr>
                        ) : (
                          report.workPlans.map((plan, idx) => (
                            <tr key={plan.id || idx} className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                              <td className="p-2 text-center">{idx + 1}</td>
                              <td className="p-2 font-semibold">{plan.programName}</td>
                              <td className="p-2">{plan.targetDescription}</td>
                              <td className="p-2 text-right font-mono">{formatRupiah(plan.rabBudget || 0)}</td>
                              <td className="p-2 text-right font-mono font-semibold text-emerald-800">{formatRupiah(plan.realizationAmount || 0)}</td>
                              <td className="p-2 text-center font-bold text-[10px]">{plan.status}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 4: KEUANGAN UTAMA & INVENTARIS ASET TETAP */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <Coins className="w-3.5 h-3.5" /> 4. Laporan Keuangan Utama & Inventaris Aset Tetap
                    </h4>
                    
                    <p className="font-bold text-[11px] text-slate-800 mb-1.5 uppercase">4.1 Ringkasan Finansial Makro & Dokumen Penyertaan Modal</p>
                    
                    <div className="mb-2.5 grid grid-cols-2 gap-2 text-[11px] bg-slate-50 border border-slate-300 p-2 rounded">
                      <div className="flex items-center justify-between gap-2">
                        <span><strong>Analisa Kelayakan Modal:</strong> {report.feasibilityStudyPdfName ? `📄 ${report.feasibilityStudyPdfName}` : 'Belum diunggah oleh Desa'}</span>
                        {report.feasibilityStudyPdfUrl && (
                          <a
                            href={report.feasibilityStudyPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={report.feasibilityStudyPdfName || 'Dokumen_Analisa_Kelayakan'}
                            className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0"
                            title="Unduh Dokumen Analisa Kelayakan Modal"
                          >
                            <Download className="w-3 h-3" /> Unduh
                          </a>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span><strong>Perdes Penyertaan Modal ({report.year}):</strong> {(report.perdesCapitalPdfName || report.skCapitalPdfName) ? `📄 ${report.perdesCapitalPdfName || report.skCapitalPdfName}` : 'Belum diunggah oleh Desa'}</span>
                        {(report.perdesCapitalPdfUrl || report.skCapitalPdfUrl) && (
                          <a
                            href={report.perdesCapitalPdfUrl || report.skCapitalPdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={report.perdesCapitalPdfName || report.skCapitalPdfName || 'Perdes_Penyertaan_Modal'}
                            className="print:hidden inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-2xs transition-colors shrink-0"
                            title="Unduh Perdes Penyertaan Modal"
                          >
                            <Download className="w-3 h-3" /> Unduh
                          </a>
                        )}
                      </div>
                    </div>
                    <table className="w-full text-left border border-slate-300 mb-3 text-[10.5px]">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                          <th className="p-2">Parameter Neraca / Keuangan</th>
                          <th className="p-2 text-right">s.d. Thn Sebelum ({report.year - 1})</th>
                          <th className="p-2 text-right">Thn Berjalan ({report.year})</th>
                          <th className="p-2 text-right bg-slate-200/80">Total Terjumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-semibold">Penyertaan Modal Desa (Kumulatif Desa)</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.capitalParticipationPrevYear || 0)}</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.capitalParticipationCurrentYear ?? (report.capitalParticipation || 0))}</td>
                          <td className="p-2 text-right font-bold font-mono bg-slate-50">{formatRupiah((report.capitalParticipationPrevYear || 0) + (report.capitalParticipationCurrentYear ?? (report.capitalParticipation || 0)))}</td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-semibold">Total Aset (Aktiva Lancar & Tetap)</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.totalAssetsPrevYear || 0)}</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.totalAssetsCurrentYear ?? (report.totalAssets || 0))}</td>
                          <td className="p-2 text-right font-bold font-mono bg-slate-100/60">{formatRupiah((report.totalAssetsPrevYear || 0) + (report.totalAssetsCurrentYear ?? (report.totalAssets || 0)))}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-semibold">Total Pendapatan Usaha (Omset)</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.totalRevenuePrevYear || 0)}</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.totalRevenueCurrentYear ?? (report.totalRevenue || 0))}</td>
                          <td className="p-2 text-right font-bold font-mono bg-slate-50">{formatRupiah((report.totalRevenuePrevYear || 0) + (report.totalRevenueCurrentYear ?? (report.totalRevenue || 0)))}</td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-semibold">Laba Bersih Operasional</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.netProfitPrevYear || 0)}</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.netProfitCurrentYear ?? (report.netProfit || 0))}</td>
                          <td className="p-2 text-right font-bold font-mono text-blue-900 bg-slate-100/60">{formatRupiah((report.netProfitPrevYear || 0) + (report.netProfitCurrentYear ?? (report.netProfit || 0)))}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-semibold">Kontribusi ke Pendapatan Asli Desa (PADes)</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.padesContributionPrevYear || 0)}</td>
                          <td className="p-2 text-right font-mono">{formatRupiah(report.padesContributionCurrentYear ?? (report.padesContribution || 0))}</td>
                          <td className="p-2 text-right font-bold font-mono text-emerald-900 bg-slate-50">{formatRupiah((report.padesContributionPrevYear || 0) + (report.padesContributionCurrentYear ?? (report.padesContribution || 0)))}</td>
                        </tr>
                      </tbody>
                    </table>

                    <p className="font-bold text-[11px] text-slate-800 mb-1.5 uppercase">4.2 Inventaris & Pengamanan Aset Tetap Fisik</p>
                    <table className="w-full text-left border border-slate-300">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 font-bold text-[10.5px]">
                          <th className="p-1.5 w-8 text-center">No</th>
                          <th className="p-1.5">Nama Barang / Aset</th>
                          <th className="p-1.5">Kategori</th>
                          <th className="p-1.5 text-center">Thn</th>
                          <th className="p-1.5 text-right">Nilai Perolehan (Rp)</th>
                          <th className="p-1.5 text-center">Kondisi</th>
                          <th className="p-1.5">Dokumen Pengamanan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!report.assetItems || report.assetItems.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="p-3 text-center text-slate-500 italic">Belum ada inventaris aset fisik terdaftar.</td>
                          </tr>
                        ) : (
                          report.assetItems.map((asset, idx) => (
                            <tr key={asset.id || idx} className={`border-b border-slate-300 text-[10.5px] ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                              <td className="p-1.5 text-center">{idx + 1}</td>
                              <td className="p-1.5 font-semibold">{asset.itemName}</td>
                              <td className="p-1.5">{asset.itemType}</td>
                              <td className="p-1.5 text-center font-mono">{asset.acquisitionYear || '-'}</td>
                              <td className="p-1.5 text-right font-mono font-semibold">{formatRupiah(asset.acquisitionValue || 0)}</td>
                              <td className="p-1.5 text-center font-bold">{asset.condition}</td>
                              <td className="p-1.5 font-medium">{asset.ownershipDoc}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 5: KINERJA UNIT USAHA */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <Briefcase className="w-3.5 h-3.5" /> 5. Performa Unit Usaha Dinamis
                    </h4>
                    <table className="w-full text-left border border-slate-300">
                      <thead>
                        <tr className="border-b border-slate-300 bg-slate-100 font-bold">
                          <th className="p-2 w-10 text-center">No</th>
                          <th className="p-2">Nama Unit Usaha</th>
                          <th className="p-2 w-1/4 text-center">Status Operasional</th>
                          <th className="p-2 w-1/5 text-center">Kondisi Keuangan</th>
                          <th className="p-2 w-1/4">Kendala Utama</th>
                        </tr>
                      </thead>
                      <tbody>
                        {!report.units || report.units.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-3 text-center text-slate-500 italic">Tidak ada unit usaha terdaftar.</td>
                          </tr>
                        ) : (
                          report.units.map((unit, idx) => (
                            <tr key={unit.id || idx} className={`border-b border-slate-300 ${idx % 2 === 1 ? 'bg-slate-50/50' : ''}`}>
                              <td className="p-2 text-center">{idx + 1}</td>
                              <td className="p-2 font-semibold">{unit.name}</td>
                              <td className="p-2 text-center font-medium">{unit.status}</td>
                              <td className="p-2 text-center font-medium">{unit.financialCondition}</td>
                              <td className="p-2">{unit.mainConstraint}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 6: DAMPAK SOSIAL */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" /> 6. Dampak Sosial & Ketenagakerjaan Lokal
                    </h4>
                    <div className="grid grid-cols-3 gap-4 border border-slate-300 p-3 bg-slate-50/35 rounded">
                      <div className="text-center">
                        <span className="text-slate-500 font-medium block text-[9px] uppercase tracking-wider">Total Karyawan</span>
                        <strong className="text-sm font-extrabold text-slate-900">{report.totalEmployees || 0} Orang</strong>
                      </div>
                      <div className="text-center border-x border-slate-300">
                        <span className="text-slate-500 font-medium block text-[9px] uppercase tracking-wider">Karyawan Warga Lokal</span>
                        <strong className="text-sm font-extrabold text-slate-900">{report.localEmployees || 0} Orang</strong>
                      </div>
                      <div className="text-center">
                        <span className="text-slate-500 font-medium block text-[9px] uppercase tracking-wider">UMKM Binaan / Mitra</span>
                        <strong className="text-sm font-extrabold text-slate-900">{report.assistedUmkm || 0} Unit</strong>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 7: PENILAIAN DAN REKOMENDASI KECAMATAN */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> 7. Hasil Penilaian & Rekomendasi Tim Evaluator Kecamatan
                    </h4>
                    <table className="w-full text-left border border-slate-300">
                      <tbody>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold w-1/3">Skor Kelayakan Kesehatan BUMDes</td>
                          <td className="p-2 font-extrabold text-blue-900 uppercase tracking-wide">
                            {getHealthLabel(report.healthScore)}
                          </td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-bold">Catatan Verifikasi Berkas</td>
                          <td className="p-2 font-medium text-slate-800 whitespace-pre-wrap leading-relaxed">{report.verificationNotes || 'Tidak ada catatan khusus.'}</td>
                        </tr>
                        <tr className="border-b border-slate-300">
                          <td className="p-2 font-bold">Rekomendasi Tindak Lanjut Camat</td>
                          <td className="p-2 font-semibold text-slate-800 whitespace-pre-wrap leading-relaxed">{report.followUpRecommendation || 'Belum diterbitkan rekomendasi.'}</td>
                        </tr>
                        <tr className="border-b border-slate-300 bg-slate-50/50">
                          <td className="p-2 font-bold">Petugas Penilai Kecamatan</td>
                          <td className="p-2 font-medium">{report.reviewedBy || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* SECTION 8: DOKUMENTASI FOTO KEGIATAN MUSDES */}
                  {((report.musdesPhotos && report.musdesPhotos.length > 0) || report.musdesPhotoUrl) && (
                    <div className="pt-2">
                      <h4 className="text-xs font-bold text-slate-950 border-b border-slate-400 pb-1 mb-2 uppercase flex items-center gap-1.5">
                        <ImageIcon className="w-3.5 h-3.5" /> 8. Lampiran Dokumentasi Foto Kegiatan Musdes (Maks 4 Foto)
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 border border-slate-300 p-2 bg-slate-50/40 rounded">
                        {(report.musdesPhotos && report.musdesPhotos.length > 0 
                          ? report.musdesPhotos 
                          : [report.musdesPhotoUrl!]).slice(0, 4).map((photoUrl, idx) => (
                          <div key={idx} className="border border-slate-300 bg-white p-1 rounded text-center space-y-1">
                            <img 
                              src={photoUrl} 
                              alt={`Dokumentasi Musdes ${idx + 1}`} 
                              className="w-full h-24 object-cover rounded border border-slate-200"
                            />
                            <div className="flex items-center justify-between px-0.5">
                              <span className="text-[9px] font-bold text-slate-700">Dokumentasi #{idx + 1}</span>
                              <a
                                href={photoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={`Foto_Musdes_${idx + 1}.jpg`}
                                className="print:hidden inline-flex items-center gap-0.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-2xs transition-colors"
                                title="Unduh Foto Musdes"
                              >
                                <Download className="w-2.5 h-2.5" /> Unduh
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>

            {/* Signature Block */}
            {report && (
              <div className="mt-8 pt-6 select-none text-[10.5px]">
                <div className="grid grid-cols-3 gap-4 text-center text-xs">
                  {/* Direktur BUMDes */}
                  <div className="flex flex-col justify-between h-full min-h-[140px]">
                    <div>
                      <p className="text-slate-500 font-medium">Pengurus BUMDes,</p>
                      <p className="font-bold mt-1 text-slate-900">Direktur Utama BUMDes</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-955 underline uppercase">{directorName || report.directorName || 'NAMA DIREKTUR'}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">BUMDes Desa {selectedVillage}</p>
                    </div>
                  </div>

                  {/* Verifikator */}
                  <div className="flex flex-col justify-between h-full min-h-[140px]">
                    <div>
                      <p className="text-slate-500 font-medium">Diverifikasi Oleh,</p>
                      <p className="font-bold mt-1 text-slate-900">{verifierTitle || 'Verifikator Kecamatan'}</p>
                    </div>
                    <div>
                      <p className="font-bold text-slate-955 underline uppercase">{verifierName || 'Sri Wahyuni, S.Sos'}</p>
                      {verifierNip ? (
                        <p className="text-[10px] text-slate-600 font-mono mt-0.5">{formatNipString(verifierNip)}</p>
                      ) : (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP. -</p>
                      )}
                    </div>
                  </div>

                  {/* Camat */}
                  <div className="flex flex-col justify-between h-full min-h-[140px]">
                    <div>
                      <p className="text-slate-550 font-medium">Waru, {formattedDateIndo}</p>
                      <p className="font-bold text-slate-900">Mengetahui & Mengesahkan,</p>
                      <p className="font-semibold text-slate-700 text-[11px] leading-tight mt-0.5">Camat Kecamatan Waru</p>
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

                {/* Informative Footer */}
                <div className="mt-8 text-center text-[8px] text-slate-400 leading-none">
                  Dokumen evaluasi ini dicetak dari Dashboard Simonev APBDes Terpadu Kecamatan Waru.
                  <br />
                  <span className="font-mono mt-1 inline-block text-slate-500 font-semibold uppercase">KODE CETAK: BUMDES-{selectedVillage.toUpperCase().replace(/\s/g, '-')}-{selectedYear}-{Date.now().toString(16).toUpperCase()}</span>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
