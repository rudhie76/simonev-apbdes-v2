/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity } from '../types';

export function handleDownloadFile(activity: Activity) {
  // 1. Check if the budgetReportUrl is a Base64 data URL
  if (activity.budgetReportUrl?.startsWith('data:')) {
    try {
      const dataUrl = activity.budgetReportUrl;
      const originalFilename = activity.budgetReportName || 'SYARAT_EVALUASI.pdf';
      
      // Split the metadata and content parts of the Base64 Data URL
      const parts = dataUrl.split(',');
      if (parts.length === 2) {
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
        const bstr = atob(parts[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        
        const blob = new Blob([u8arr], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = originalFilename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
    } catch (e) {
      console.error("Gagal mendecode Base64 berkas, menggunakan fallback ringkasan teks", e);
    }
  }

  // -------------------------------------------------------------
  // 2. Fallback: Generate an elegant text evaluation summary document
  // -------------------------------------------------------------
  let rawFilename = activity.budgetReportName || activity.budgetReportUrl || `SYARAT_EVALUASI_${activity.name.toUpperCase().replace(/\s+/g, '_')}`;
  
  // Clean up any existing binary extension (e.g. .pdf, .xlsx) for the fallback and enforce .txt
  const baseName = rawFilename.replace(/\.(pdf|xlsx|docx|xls)$/i, '');
  const filename = `${baseName}_detail_evaluasi.txt`;

  // Format numeric values to Rupiah format
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Create a clean text summary layout
  const docContent = `========================================================================
             SIMONEV APBDES KECAMATAN WARU - BERKAS EVALUASI
========================================================================

DETAIL LAPORAN KEGIATAN & SYARAT EVALUASI (SIMULASI RINGKASAN TEKS)
------------------------------------------------------------------------
Nama Kegiatan     : ${activity.name}
Desa              : Desa ${activity.village}
Kecamatan         : Kecamatan Waru
Sektor / Bidang   : ${activity.sector}

INFORMASI ANGGARAN & REALISASI
------------------------------------------------------------------------
Pagu Total (PAGU) : ${formatRupiah(activity.budgetTotal)}
Realisasi (SPJ)   : ${formatRupiah(activity.budgetSpent)}
Persentase Serap  : ${activity.budgetTotal > 0 ? ((activity.budgetSpent / activity.budgetTotal) * 100).toFixed(2) : '0'}%
Realisasi Fisik   : ${activity.progressPhysical}%
Alasan Belum Rampung: ${activity.incompleteReason || '-'}
Status Monitoring : ${activity.status.replace('_', ' ')}

STATUS EVALUASI & PERSETUJUAN KECAMATAN
------------------------------------------------------------------------
Disetujui Camat   : ${activity.isKecamatanApproved ? 'YA / DISETUJUI' : 'BELUM DISETUJUI / DALAM PROSES'}
Petugas Penyetuju : ${activity.approvedBy || '-'}
Waktu Persetujuan : ${activity.approvedAt ? new Date(activity.approvedAt).toLocaleString('id-ID') : '-'}

Rekomendasi Camat / Tim PMD:
"${activity.recommendation || 'Belum ada rekomendasi dari kecamatan.'}"

------------------------------------------------------------------------
Dokumen ini diterbitkan secara resmi melalui Sistem Informasi Monitoring & Evaluasi (Simonev) APBDes Kecamatan Waru.
Unduh Berkas Pada : ${currentDate}
Catatan Sistem     : Berkas ini diunduh sebagai ringkasan karena belum diunggah ulang
                    oleh Desa menggunakan fungsionalitas unggah berkas riil.
========================================================================`;

  // Create text/plain blob for simulated file
  const blob = new Blob([docContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Trigger browser download workflow
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function handleDownloadPhotoPdf(activity: Activity) {
  if (!activity.photoUrl) return;
  
  const urls = activity.photoUrl.split(';').filter(Boolean);
  
  urls.forEach((url, index) => {
    const filenameSuffix = urls.length > 1 ? `_FOTO_${index + 1}` : '';
    if (url.startsWith('data:')) {
      try {
        const dataUrl = url;
        const isPdf = dataUrl.startsWith('data:application/pdf');
        const ext = isPdf ? '.pdf' : '.png';
        const originalFilename = `DOKUMEN_BUKTI_FISIK_${activity.name.toUpperCase().replace(/\s+/g, '_')}${filenameSuffix}${ext}`;
        
        const parts = dataUrl.split(',');
        if (parts.length === 2) {
          const mimeMatch = parts[0].match(/:(.*?);/);
          const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
          const bstr = atob(parts[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          
          const blob = new Blob([u8arr], { type: mimeType });
          const objectUrl = URL.createObjectURL(blob);
          
          const link = document.createElement('a');
          link.href = objectUrl;
          link.download = originalFilename;
          document.body.appendChild(link);
          link.click();
          
          document.body.removeChild(link);
          URL.revokeObjectURL(objectUrl);
        }
      } catch (e) {
        console.error("Gagal mendecode Base64 berkas bukti fisik", e);
      }
    } else {
      // Fallback for relative paths or Unsplash templates
      const link = document.createElement('a');
      link.href = url;
      link.target = "_blank";
      link.download = `DOKUMEN_BUKTI_FISIK_${activity.name.toUpperCase().replace(/\s+/g, '_')}${filenameSuffix}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  });
}

/**
 * Downloads a standard format / template for BUMDes RKT & RAB (CSV format)
 */
export function handleDownloadRktRabTemplate() {
  const csvContent = `NO,NAMA PROGRAM / KEGIATAN RKT,TARGET OUTPUT / SASARAN,ANGGARAN RAB (RP),STATUS KINERJA
1,Pengembangan Unit Usaha Perdagangan & Jasa,Terwujudnya 1 unit toko kelontong BUMDes,50000000,Rencana
2,Pengadaan Sarana & Prasarana Usaha,2 Unit Mesin Pemproses Pangan Desa,35000000,Rencana
3,Pelatihan Manajemen Pengelola BUMDes,Pelatihan 5 orang pengurus & pengelola,15000000,Rencana
`;

  const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'FORMAT_TEMPLATE_RKT_RAB_BUMDES.csv';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Modul 2 (RKT & RAB) report details to CSV / TXT format
 */
export function handleDownloadRktRabReport(
  village: string,
  year: number,
  workPlans: Array<{
    id: string;
    programName: string;
    targetDescription: string;
    rabBudget: number;
    realizationAmount: number;
    status: string;
  }>,
  rktDocName?: string,
  rabDocName?: string
) {
  const formatRp = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);

  let content = `========================================================================
           SIMONEV BUMDES - MODUL 2: RENCANA KERJA & ANGGARAN (RKT & RAB)
========================================================================
Desa               : Desa ${village}
Kecamatan          : Kecamatan Waru, Kabupaten Penajam Paser Utara
Tahun Anggaran     : ${year}
Dokumen RKT        : ${rktDocName || 'Belum diunggah'}
Dokumen RAB        : ${rabDocName || 'Belum diunggah'}
Tanggal Unduh      : ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
========================================================================

RINCIAN TARGET PROGRAM KERJA & ANGGARAN RAB:
------------------------------------------------------------------------
`;

  if (workPlans.length === 0) {
    content += `(Belum ada target program / RKT yang dimasukkan)\n`;
  } else {
    workPlans.forEach((plan, idx) => {
      content += `${idx + 1}. Program       : ${plan.programName || '-'}\n`;
      content += `   Target Output : ${plan.targetDescription || '-'}\n`;
      content += `   Anggaran RAB  : ${formatRp(plan.rabBudget || 0)}\n`;
      content += `   Realisasi     : ${formatRp(plan.realizationAmount || 0)}\n`;
      content += `   Status        : ${plan.status || 'Rencana'}\n`;
      content += `------------------------------------------------------------------------\n`;
    });

    const totalBudget = workPlans.reduce((sum, p) => sum + (p.rabBudget || 0), 0);
    const totalRealization = workPlans.reduce((sum, p) => sum + (p.realizationAmount || 0), 0);
    const tercapaiCount = workPlans.filter(p => p.status === 'Tercapai').length;

    content += `
REKAPITULASI EVALUASI MODUL 2:
- Total Program Kerja        : ${workPlans.length} Program
- Total Anggaran RAB         : ${formatRp(totalBudget)}
- Total Realisasi Anggaran   : ${formatRp(totalRealization)}
- Program Status Tercapai    : ${tercapaiCount} dari ${workPlans.length} (${Math.round((tercapaiCount / workPlans.length) * 100)}%)
========================================================================
`;
  }

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `REKAP_MODUL_2_RKT_RAB_${village.toUpperCase().replace(/\s+/g, '_')}_${year}.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


