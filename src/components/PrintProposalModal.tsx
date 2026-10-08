import React, { useState, useMemo } from 'react';
import { Activity, Village, Sector, ActivityStatus } from '../types';
import { FileText, X, Printer, FileDown, ShieldCheck, Mail, Building, Users, Coins, CheckSquare, BarChart3 } from 'lucide-react';
import { LOGO_BASE64 } from '../assets/logoBase64';

interface PrintProposalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activities: Activity[];
  villageBudgets: Record<string, number>;
  selectedYear?: number;
}

export default function PrintProposalModal({
  isOpen,
  onClose,
  activities,
  villageBudgets,
  selectedYear = 2026
}: PrintProposalModalProps) {
  const [proposalNo, setProposalNo] = useState('050 / PMD-WRU / VI / ' + selectedYear);
  const [targetSuperior, setTargetSuperior] = useState(() => localStorage.getItem('camat_title_rekap') || 'Camat Kecamatan Waru');
  const [targetSuperiorName, setTargetSuperiorName] = useState(() => localStorage.getItem('camat_name_rekap') || 'Ahmad Yani, S.STP');
  const [targetSuperiorNip, setTargetSuperiorNip] = useState(() => localStorage.getItem('camat_nip_rekap') || '19741210 200312 1 004');
  const [additionalNotes, setAdditionalNotes] = useState(
    'Seluruh kegiatan fisik yang telah mencapai 100% direkomendasikan untuk segera disahkan. Kegiatan di bawah 100% agar terus dimonitor oleh Tim Fasilitator Desa.'
  );

  const absoluteLogoUrl = LOGO_BASE64;

  React.useEffect(() => {
    localStorage.setItem('camat_title_rekap', targetSuperior);
  }, [targetSuperior]);

  React.useEffect(() => {
    localStorage.setItem('camat_name_rekap', targetSuperiorName);
  }, [targetSuperiorName]);

  React.useEffect(() => {
    localStorage.setItem('camat_nip_rekap', targetSuperiorNip);
  }, [targetSuperiorNip]);

  const evaluatorName = useMemo(() => {
    return localStorage.getItem('kecamatan_officer_name') || 'SIWANTO';
  }, []);

  const evaluatorNip = useMemo(() => {
    return localStorage.getItem('kecamatan_officer_nip') || '19781105 200702 1 002';
  }, []);

  const formattedDateIndo = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const d = new Date();
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }, []);

  // Compute stats across all villages
  const stats = useMemo(() => {
    const totalCount = activities.length;
    const paguTotal = activities.reduce((sum, a) => sum + a.budgetTotal, 0);
    const spjTotal = activities.reduce((sum, a) => sum + a.budgetSpent, 0);
    const approvedCount = activities.filter(a => a.isKecamatanApproved).length;
    const processCount = activities.filter(a => a.status === 'DALAM_PROSES').length;
    const pendingCount = activities.filter(a => !a.isKecamatanApproved && a.status === 'MENUNGGU_EVALUASI').length;
    
    const physical100Count = activities.filter(a => a.progressPhysical === 100).length;
    const physicalUnder100Count = activities.filter(a => a.progressPhysical < 100).length;

    const avgFisik = totalCount > 0 
      ? Math.round(activities.reduce((sum, a) => sum + a.progressPhysical, 0) / totalCount) 
      : 0;

    return {
      totalCount,
      paguTotal,
      spjTotal,
      approvedCount,
      processCount,
      pendingCount,
      physical100Count,
      physicalUnder100Count,
      avgFisik,
    };
  }, [activities]);

  // Statistics segmented by village
  const villageData = useMemo(() => {
    const villages: Village[] = ['Bangun Mulya', 'Sesulu', 'Api-api'];
    return villages.map(v => {
      const vActs = activities.filter(a => a.village === v);
      const totalActs = vActs.length;
      const pagu = vActs.reduce((sum, a) => sum + a.budgetTotal, 0);
      const spent = vActs.reduce((sum, a) => sum + a.budgetSpent, 0);
      const appActs = vActs.filter(a => a.isKecamatanApproved).length;
      const openActs = vActs.filter(a => !a.isKecamatanApproved).length;
      const avgFisik = totalActs > 0 ? Math.round(vActs.reduce((sum, a) => sum + a.progressPhysical, 0) / totalActs) : 0;
      return {
        name: v,
        totalActs,
        pagu,
        spent,
        appActs,
        openActs,
        avgFisik,
        paguAwal: villageBudgets[v] || pagu
      };
    });
  }, [activities, villageBudgets]);

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
      <div className="bg-white rounded-2xl w-full max-w-4xl h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Editor & Control Header (Hidden during print) */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between border-b border-slate-800 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-600/30 rounded-lg text-indigo-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight">Surat Verifikasi Lapangan Untuk Kegiatan Fisik 100% (PDF)</h2>
              <p className="text-[10px] text-slate-400">Sesuaikan data surat verifikasi di bawah sebelum dicetak atau disimpan sebagai PDF.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleTriggerPrint}
              className="bg-indigo-650 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all cursor-pointer"
            >
              <FileDown className="w-4 h-4" />
              Cetak / Simpan Surat Verifikasi
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Customization Inputs Panel - Collapsible or small (Hidden during print) */}
        <div className="bg-slate-50 p-4 border-b border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0 text-xs print:hidden">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nomor Surat Resmi</label>
            <input 
              type="text" 
              value={proposalNo}
              onChange={(e) => setProposalNo(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Jabatan Atasan (Penerima)</label>
            <input 
              type="text" 
              value={targetSuperior}
              onChange={(e) => setTargetSuperior(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Nama & NIP Atasan</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={targetSuperiorName}
                onChange={(e) => setTargetSuperiorName(e.target.value)}
                placeholder="Nama Atasan"
                className="w-1/2 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
              <input 
                type="text" 
                value={targetSuperiorNip}
                onChange={(e) => setTargetSuperiorNip(e.target.value)}
                placeholder="NIP Atasan"
                className="w-1/2 bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-mono text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
              />
            </div>
          </div>
          <div className="md:col-span-3 space-y-1">
            <label className="text-[10px] font-bold text-slate-500 uppercase">Rekomendasi Tambahan (Ditampilkan pada lembar kesimpulan)</label>
            <textarea 
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={2}
              className="w-full bg-white border border-slate-300 rounded-md px-2.5 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-grow p-8 overflow-y-auto bg-slate-100/50 print:bg-white print:p-0 select-text">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-[21cm] mx-auto p-12 text-slate-900 print:shadow-none print:border-none print:p-0 print:max-w-none text-xs leading-relaxed font-sans font-normal">
            
            {/* 1. OFFCIAL GOVERNMENT INDONESIAN KOP SURAT */}
            <div className="border-b-4 border-double border-slate-950 pb-4 text-center select-none mb-6">
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
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5">Situs Dashboard Real-Time: https://rudhie76.github.io/simonev-apbdes-v2/</p>
                </div>
              </div>
            </div>

            {/* 2. MEMORANDUM DETAILS */}
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-[11px]">
                <div className="space-y-0.5">
                  <p><span className="font-bold inline-block w-20">Nomor</span>: {proposalNo}</p>
                  <p><span className="font-bold inline-block w-20">Lampiran</span>: 1 (Satu) Berkas Lengkap</p>
                  <p><span className="font-bold inline-block w-20">Sifat</span>: Resmi / Penting</p>
                  <p><span className="font-bold inline-block w-20">Perihal</span>: <span className="font-extrabold text-slate-900">Surat Verifikasi Lapangan Untuk Kegiatan Fisik 100% TA {selectedYear}</span></p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-slate-700 font-mono">Waru, {formattedDateIndo}</p>
                </div>
              </div>

              <div className="pt-2 text-[11px]">
                <p className="font-semibold text-slate-800">Kepada Yth.</p>
                <p className="font-bold text-slate-950 text-xs">{targetSuperior}</p>
                <p className="text-slate-700 font-semibold leading-tight mt-0.5">Selaku Pembina Umum APBDes Kecamatan Waru</p>
                <p className="text-slate-500 italic mt-0.5">di - Tempat</p>
              </div>
            </div>

            {/* 3. INTRODUCTION BODY */}
            <div className="space-y-3 mb-6 text-slate-800 text-justify text-[11px] leading-relaxed">
              <p>
                Dengan hormat, berdasarkan hasil peninjauan dan verifikasi lapangan yang dilaksanakan oleh Tim Verifikasi Monitoring dan Evaluasi APBDes Kecamatan Waru terhadap pelaksanaan kegiatan pembangunan infrastruktur/fisik di desa-desa wilayah Kecamatan Waru, bersama ini disampaikan bahwa serangkaian kegiatan fisik telah diperiksa secara seksama dan dinyatakan mencapai progres pembangunan sebesar 100% (seratus persen) secara fungsional.
              </p>
              <p>
                Berdasarkan hasil analisis komparatif, pengawasan realisasi serapan anggaran, serta hasil peninjauan langsung di lapangan, berikut disampaikan laporan verifikasi lapangan kegiatan pembangunan fisik dengan capaian progres 105% / 100% Tahun Anggaran {selectedYear}:
              </p>
            </div>

            {/* 4. VISUAL METRICS / SUMMARY SECTION */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 border-l-4 border-indigo-600 pl-2 mb-3 text-xs uppercase tracking-wide select-none">
                I. Ringkasan Eksekutif Kegiatan Fisik 100% Kecamatan Waru
              </h4>
              <div className="grid grid-cols-4 border border-slate-300 rounded-lg divide-x divide-slate-350 text-center select-none bg-slate-50/50">
                <div className="p-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Total Usulan Kegiatan</p>
                  <p className="text-base font-bold text-indigo-950 mt-1 font-mono">{stats.totalCount}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Usulan Desa</p>
                </div>
                <div className="p-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Pagu Alokasi APBDes</p>
                  <p className="text-xs font-bold text-slate-900 mt-2 font-mono">{formatRupiah(stats.paguTotal)}</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Total Anggaran</p>
                </div>
                <div className="p-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Realisasi SPJ Lapangan</p>
                  <p className="text-xs font-bold text-emerald-800 mt-2 font-mono">{formatRupiah(stats.spjTotal)}</p>
                  <p className="text-[9px] text-emerald-600 font-bold mt-0.5">Serapan {stats.paguTotal > 0 ? Math.round((stats.spjTotal / stats.paguTotal) * 100) : 0}%</p>
                </div>
                <div className="p-3">
                  <p className="text-[9px] font-bold text-slate-500 uppercase">Rerata Progres Fisik</p>
                  <p className="text-base font-extrabold text-blue-700 mt-1 font-mono">{stats.avgFisik}%</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">Keseluruhan Kegiatan</p>
                </div>
              </div>
            </div>

            {/* 5. SEGMENTATION AND COMPARISONS */}
            <div className="space-y-2 mb-6 text-[10.5px]">
              <div className="grid grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
                  <span className="font-semibold text-slate-700 block mb-2 border-b border-slate-200 pb-1 text-[10px] uppercase">A. Verifikasi Kelayakan Teknis (Fisik)</span>
                  <ul className="space-y-1">
                    <li className="flex justify-between">
                      <span className="text-slate-600">Fisik 100% (Selesai Penuh)</span>
                      <span className="font-bold text-slate-900 font-mono">{stats.physical100Count} Kegiatan</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-slate-600">Dalam Pengerjaan (&lt; 100%)</span>
                      <span className="font-bold text-slate-900 font-mono">{stats.physicalUnder100Count} Kegiatan</span>
                    </li>
                  </ul>
                </div>
                <div className="border border-slate-200 rounded-lg p-3 bg-slate-50/40">
                  <span className="font-semibold text-slate-700 block mb-2 border-b border-slate-200 pb-1 text-[10px] uppercase">B. Status Evaluasi Kecamatan</span>
                  <ul className="space-y-1">
                    <li className="flex justify-between text-emerald-800">
                      <span>Sudah Disetujui (ACC / TTD)</span>
                      <span className="font-bold font-mono">{stats.approvedCount} Kegiatan</span>
                    </li>
                    <li className="flex justify-between text-blue-800">
                      <span>Dalam Proses Fisik Desa</span>
                      <span className="font-bold font-mono">{stats.processCount} Kegiatan</span>
                    </li>
                    <li className="flex justify-between text-amber-800">
                      <span>Menunggu Rekomendasi Baru</span>
                      <span className="font-bold font-mono">{stats.pendingCount} Kegiatan</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 6. TABLE DETAILS BY VILLAGE */}
            <div className="mb-6">
              <h4 className="font-bold text-slate-900 border-l-4 border-indigo-600 pl-2 mb-3 text-xs uppercase tracking-wide select-none">
                II. Laporan Analisis Segmentasi Realisasi per Desa
              </h4>
              <table className="w-full border-collapse border border-slate-400 text-[10px]">
                <thead>
                  <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-400 text-center uppercase">
                    <th className="border border-slate-400 p-2 w-[5%]">No</th>
                    <th className="border border-slate-400 p-2 w-[23%] text-left">Nama Desa</th>
                    <th className="border border-slate-400 p-2 w-[12%]">Usulan</th>
                    <th className="border border-slate-400 p-2 w-[22%]">Anggaran Pagu Belanja</th>
                    <th className="border border-slate-400 p-2 w-[22%]">Realisasi SPJ Lapangan</th>
                    <th className="border border-slate-400 p-2 w-[8%]">Serapan</th>
                    <th className="border border-slate-400 p-2 w-[8%]">Avg Fisik</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-400">
                  {villageData.map((v, i) => {
                    const absRatio = v.pagu > 0 ? Math.round((v.spent / v.pagu) * 100) : 0;
                    return (
                      <tr key={v.name} className="hover:bg-slate-50">
                        <td className="border border-slate-400 p-2 text-center font-mono font-bold">{i + 1}</td>
                        <td className="border border-slate-400 p-2 font-bold text-slate-800">Desa {v.name}</td>
                        <td className="border border-slate-400 p-2 text-center font-mono">{v.totalActs} usulan</td>
                        <td className="border border-slate-400 p-2 text-right font-mono">{formatRupiah(v.pagu)}</td>
                        <td className="border border-slate-400 p-2 text-right font-mono text-emerald-900">{formatRupiah(v.spent)}</td>
                        <td className="border border-slate-400 p-2 text-center font-bold font-mono">{absRatio}%</td>
                        <td className="border border-slate-400 p-2 text-center font-extrabold text-slate-900 font-mono">{v.avgFisik}%</td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-50 font-extrabold text-slate-950">
                    <td colSpan={2} className="border border-slate-400 p-2 text-left uppercase">TOTAL KECAMATAN</td>
                    <td className="border border-slate-400 p-2 text-center font-mono">{stats.totalCount} usulan</td>
                    <td className="border border-slate-400 p-2 text-right font-mono">{formatRupiah(stats.paguTotal)}</td>
                    <td className="border border-slate-400 p-2 text-right font-mono text-emerald-955">{formatRupiah(stats.spjTotal)}</td>
                    <td className="border border-slate-400 p-2 text-center font-mono">{stats.paguTotal > 0 ? Math.round((stats.spjTotal / stats.paguTotal) * 100) : 0}%</td>
                    <td className="border border-slate-400 p-2 text-center font-mono text-indigo-800">{stats.avgFisik}%</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 7. RECOMENDATION NOTES */}
            <div className="border border-slate-300 rounded-lg p-4 bg-slate-50/20 mb-6 text-[10.5px]">
              <span className="font-extrabold text-slate-900 uppercase block mb-1.5 text-xs">III. Rekomendasi Kelayakan Administratif & Teknis</span>
              <p className="text-justify leading-relaxed whitespace-pre-wrap">{additionalNotes}</p>
              <div className="mt-2 text-slate-500 text-[10px] leading-relaxed">
                <span className="font-bold text-slate-700">Catatan Pengawas:</span> Evaluasi dilakukan berpedoman pada Peraturan Bupati Penajam Paser Utara tentang Pedoman Penyusunan APBDes TA {selectedYear} serta hasil komparasi bukti fisik lapangan yang tervalidasi.
              </div>
            </div>

             {/* 8. FORMAL CLOSING */}
            <div className="mb-6 text-[11px] text-justify">
              <p>
                Demikian Surat Verifikasi Lapangan untuk kegiatan fisik dengan capaian progres 105% / 100% ini dibuat dengan sebenarnya untuk dapat dipergunakan sebagaimana mestinya sebagai bahan pertimbangan pengesahan dan pencairan dana tahap berikutnya. Atas perhatian serta kebijakan Bapak Camat, kami haturkan terima kasih.
              </p>
            </div>

            {/* 9. FORMAL DOUBLE SIGNATURES */}
            <div className="mt-8 pt-4 select-none text-[11px]">
              <div className="flex justify-between">
                {/* Prepare Signature */}
                <div className="text-center w-[220px]">
                  <p className="text-slate-500 font-medium">Disiapkan Oleh,</p>
                  <p className="font-bold text-slate-800 mt-0.5">Evaluator PMD Kecamatan Waru</p>
                  <p className="text-[9px] text-slate-500 leading-none mb-1 font-sans">Tim Monev Kec. Waru</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-950 underline">{evaluatorName}</p>
                  {evaluatorNip ? (
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">NIP. {evaluatorNip.replace(/^NIP\.?\s*/i, '').trim()}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP. -</p>
                  )}
                </div>

                {/* Approve Signature */}
                <div className="text-center w-[250px]">
                  <p className="text-slate-600 font-medium">Disetujui & Disahkan Oleh,</p>
                  <p className="font-bold text-slate-800 mt-0.5">{targetSuperior}</p>
                  <p className="text-[9px] text-slate-500 leading-none mb-1">Pemerintah Kabupaten Penajam Paser Utara</p>
                  <div className="h-16"></div>
                  <p className="font-bold text-slate-950 underline uppercase">{targetSuperiorName}</p>
                  {targetSuperiorNip ? (
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">NIP. {targetSuperiorNip.replace(/^NIP\.?\s*/i, '').trim()}</p>
                  ) : (
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5">NIP. -</p>
                  )}
                </div>
              </div>

              {/* Secure Token / Document Metadata */}
              <div className="mt-8 text-center text-[8px] text-slate-400">
                Dokumen Surat Verifikasi Lapangan ini diterbitkan secara otomatis oleh Simonev-PMD Kecamatan Waru TA {selectedYear} dan merupakan berkas resmi lampiran Kecamatan.
                <br />
                <span className="font-mono mt-1 inline-block text-slate-500 font-semibold tracking-wide uppercase">KODE VERIFIKASI DIGITAL: SEC-VER-FLD-{(Date.now() + 10000).toString(16).toUpperCase()}</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
