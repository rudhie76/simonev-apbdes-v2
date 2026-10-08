/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Activity, NotificationLog, BumdesMonev } from '../types';

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    name: 'Semenisasi Jalan Usaha Tani RT 05 Dusun Harapan',
    village: 'Bangun Mulya',
    sector: 'Pembangunan Desa (Infrastruktur)',
    budgetTotal: 125000000,
    budgetSpent: 90000000,
    progressPhysical: 75,
    status: 'DALAM_PROSES',
    sourceOfFunds: 'Dana Desa (DD)',
    photoUrl: '/assets/images/semenisasi_jalan.jpg',
    lastUpdated: '2026-06-12T10:30:00Z',
    createdAt: '2026-04-10T08:00:00Z',
    isKecamatanApproved: false
  },
  {
    id: 'act-2',
    name: 'Pembangunan Posyandu Terintegrasi Kasih Ibu',
    village: 'Bangun Mulya',
    sector: 'Pembangunan Desa (Infrastruktur)',
    budgetTotal: 85000000,
    budgetSpent: 85000000,
    progressPhysical: 100,
    status: 'SELESAI',
    sourceOfFunds: 'Alokasi Dana Desa (ADD)',
    photoUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&q=80&w=600',
    budgetReportUrl: 'LAPORAN_REALISASI_POSYANDU_BANGUN_MULYA.pdf',
    recommendation: 'Laporan fisik sangat baik. Sesuai dengan spesifikasi teknis rencana kerja. Teruskan program pemeliharaan berkala.',
    isKecamatanApproved: true,
    approvedBy: 'Bpk. Siswanto (Kasi PMD Kec. Waru)',
    approvedAt: '2026-06-05T14:20:00Z',
    lastUpdated: '2026-06-05T14:20:00Z',
    createdAt: '2026-02-15T09:00:00Z'
  },
  {
    id: 'act-3',
    name: 'Penyaluran Bantuan Langsung Tunai (BLT) Dana Desa Triwulan II',
    village: 'Bangun Mulya',
    sector: 'Penanggulangan Bencana & Mendesak',
    budgetTotal: 54000000,
    budgetSpent: 54000000,
    progressPhysical: 100,
    status: 'SELESAI',
    sourceOfFunds: 'Dana Desa (DD)',
    budgetReportUrl: 'SPJ_BLT_TRIWULAN_II_BANGUN_MULYA.pdf',
    // No photo yet or default
    recommendation: 'Penyaluran tepat sasaran untuk 60 KPM. Harap unggah dokumentasi penyerahan.',
    isKecamatanApproved: false,
    lastUpdated: '2026-06-11T16:45:00Z',
    createdAt: '2026-05-01T08:30:00Z'
  },
  {
    id: 'act-4',
    name: 'Rehabilitasi Jembatan Penghubung Desa Sesulu RT 02',
    village: 'Sesulu',
    sector: 'Pembangunan Desa (Infrastruktur)',
    budgetTotal: 180000000,
    budgetSpent: 135000000,
    progressPhysical: 60,
    status: 'DALAM_PROSES',
    sourceOfFunds: 'Bantuan Keuangan (Bankeu)',
    photoUrl: 'https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&q=80&w=600',
    lastUpdated: '2026-06-13T09:15:00Z',
    createdAt: '2026-03-20T10:00:00Z',
    isKecamatanApproved: false
  },
  {
    id: 'act-5',
    name: 'Pelatihan Pemberdayaan Kerajinan Anyaman Lidi Kelapa',
    village: 'Sesulu',
    sector: 'Pemberdayaan Masyarakat',
    budgetTotal: 30000000,
    budgetSpent: 30000000,
    progressPhysical: 100,
    status: 'MENUNGGU_EVALUASI',
    sourceOfFunds: 'Pendapatan Bagi Hasil (PBH)',
    photoUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=600',
    budgetReportUrl: 'LAP_KEGIATAN_ANYAMAN_SESULU_2026.pdf',
    lastUpdated: '2026-06-13T11:00:00Z',
    createdAt: '2026-05-10T11:00:00Z',
    isKecamatanApproved: false
  },
  {
    id: 'act-6',
    name: 'Pengadaan Bibit Sawit dan Pupuk Organik bagi Kelompok Tani',
    village: 'Sesulu',
    sector: 'Pemberdayaan Masyarakat',
    budgetTotal: 95000000,
    budgetSpent: 0,
    progressPhysical: 0,
    status: 'BELUM_MULAI',
    sourceOfFunds: 'Dana Desa (DD)',
    lastUpdated: '2026-06-01T08:00:00Z',
    createdAt: '2026-05-25T08:00:00Z',
    isKecamatanApproved: false
  },
  {
    id: 'act-7',
    name: 'Normalisasi Drainase Utama Penanggulangan Banjir RT 08',
    village: 'Api-api',
    sector: 'Pembangunan Desa (Infrastruktur)',
    budgetTotal: 150000000,
    budgetSpent: 150000000,
    progressPhysical: 100,
    status: 'SELESAI',
    sourceOfFunds: 'Bantuan Keuangan (Bankeu)',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600',
    budgetReportUrl: 'LPJ_NORMALISASI_DRAINASE_API_API.pdf',
    recommendation: 'Rehabilitasi saluran air berfungsi dengan baik saat intensitas hujan tinggi. Menunggu peninjauan lapangan tambahan.',
    isKecamatanApproved: true,
    approvedBy: 'Bpk. Siswanto (Kasi PMD Kec. Waru)',
    approvedAt: '2026-06-10T10:00:00Z',
    lastUpdated: '2026-06-10T10:00:00Z',
    createdAt: '2026-03-01T09:00:00Z'
  },
  {
    id: 'act-8',
    name: 'Penyelenggaraan Pos Layanan Teknis Desa (Posyantek)',
    village: 'Api-api',
    sector: 'Pembinaan Kemasyarakatan',
    budgetTotal: 25000000,
    budgetSpent: 12500000,
    progressPhysical: 50,
    status: 'DALAM_PROSES',
    sourceOfFunds: 'Pendapatan Asli Desa (PAD)',
    lastUpdated: '2026-06-12T15:20:00Z',
    createdAt: '2026-04-15T08:00:00Z',
    isKecamatanApproved: false
  },
  {
    id: 'act-9',
    name: 'Pengadaan Insentif Guru PAUD dan Guru Mengaji Desa Api-api',
    village: 'Api-api',
    sector: 'Pembinaan Kemasyarakatan',
    budgetTotal: 48000000,
    budgetSpent: 24000000,
    progressPhysical: 50,
    status: 'DALAM_PROSES',
    sourceOfFunds: 'Alokasi Dana Desa (ADD)',
    lastUpdated: '2026-06-13T16:00:00Z',
    createdAt: '2026-01-10T08:00:00Z',
    isKecamatanApproved: false
  },
  {
    id: 'act-10',
    name: 'Pengadaan Sarana Perpustakaan Desa dan Buku Literasi Masyarakat',
    village: 'Sesulu',
    sector: 'Pembangunan Desa (Non Infrastruktur)',
    budgetTotal: 35000000,
    budgetSpent: 35000000,
    progressPhysical: 100,
    status: 'SELESAI',
    sourceOfFunds: 'Dana Desa (DD)',
    photoUrl: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&q=80&w=600',
    budgetReportUrl: 'SPJ_PERPUSTAKAAN_SESULU_2026.pdf',
    recommendation: 'Sarana literasi sudah lengkap dan tersalurkan dengan baik ke perpustakaan desa. Pertahankan.',
    isKecamatanApproved: true,
    approvedBy: 'Bpk. Siswanto (Kasi PMD Kec. Waru)',
    approvedAt: '2026-06-12T11:00:00Z',
    lastUpdated: '2026-06-12T11:00:00Z',
    createdAt: '2026-03-10T10:00:00Z'
  },
  {
    id: 'act-11',
    name: 'Pengadaan Layanan Internet Desa untuk Keterbukaan Informasi Publik',
    village: 'Bangun Mulya',
    sector: 'Pembangunan Desa (Non Infrastruktur)',
    budgetTotal: 42000000,
    budgetSpent: 31500000,
    progressPhysical: 75,
    status: 'DALAM_PROSES',
    sourceOfFunds: 'Alokasi Dana Desa (ADD)',
    lastUpdated: '2026-06-14T09:00:00Z',
    createdAt: '2026-04-05T09:00:00Z',
    isKecamatanApproved: false
  }
];

export const INITIAL_LOGS: NotificationLog[] = [
  {
    id: 'log-1',
    title: 'Evaluasi Disetujui',
    description: 'Pembangunan Posyandu Terintegrasi Kasih Ibu (Bangun Mulya) disetujui digital oleh Kecamatan.',
    timestamp: '2026-06-05T14:20:00Z',
    type: 'approval',
    village: 'Bangun Mulya'
  },
  {
    id: 'log-2',
    title: 'Pengajuan Evaluasi Baru',
    description: 'Desa Sesulu mengajukan evaluasi akhir untuk Pelatihan Pemberdayaan Kerajinan Anyaman.',
    timestamp: '2026-06-13T11:00:00Z',
    type: 'info',
    village: 'Sesulu'
  },
  {
    id: 'log-3',
    title: 'Update Progres Fisik',
    description: 'Semenisasi Jalan Usaha Tani RT 05 (Bangun Mulya) diperbarui hingga mencapai progres 75%.',
    timestamp: '2026-06-12T10:30:00Z',
    type: 'success',
    village: 'Bangun Mulya'
  }
];

export const VILLAGE_BUDGETS: Record<string, number> = {
  'Bangun Mulya': 1250000000, // Total APBDes
  'Sesulu': 1480000000,
  'Api-api': 1150000000
};

export const INITIAL_BUMDES_MONEV: BumdesMonev[] = [
  {
    id: 'Bangun Mulya_2026',
    village: 'Bangun Mulya',
    year: 2026,
    lastUpdated: '2026-07-10T12:00:00Z',
    bumdesName: 'BUMDes Karya Mandiri',
    establishedYear: 2018,
    directorName: 'Sudirman, S.H.',
    lawStatus: 'Sudah Terbit',
    certificatePdfName: 'SERTIFIKAT_KEMENKUMHAM_BM_2026.pdf',
    certificatePdfUrl: 'simulation_pdf_url',
    hasPerdesPendirian: true,
    perdesPdfName: 'PERDES_PENDIRIAN_BUMDES_BM.pdf',
    perdesPdfUrl: 'simulation_pdf_url',
    hasAdArt: true,
    adArtPdfName: 'AD_ART_BUMDES_BM.pdf',
    adArtPdfUrl: 'simulation_pdf_url',
    hasSkPengelola: true,
    skPengelolaPdfName: 'SK_PENGELOLA_BUMDES_BM_2026.pdf',
    skPengelolaPdfUrl: 'simulation_pdf_url',
    musdesDate: '2026-01-15',
    musdesBaPdfName: 'BA_MUSDES_LPJ_BM_2025.pdf',
    musdesBaPdfUrl: 'simulation_pdf_url',
    musdesPhotoUrl: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80&w=600',
    musdesPhotoName: 'FOTO_MUSDES_BUMDES_BM.jpg',
    rktDocName: 'RKT_BUMDES_BANGUN_MULYA_2026.pdf',
    rktDocUrl: 'simulation_pdf_url',
    rabDocName: 'RAB_OPERASIONAL_2026.pdf',
    rabDocUrl: 'simulation_pdf_url',
    workPlans: [
      {
        id: 'wp-bm-1',
        programName: 'Pengembangan Jaringan Pipanisasi Pamsimas Dusun 2',
        targetDescription: 'Penambahan 120 Sambungan Rumah (SR) Baru',
        rabBudget: 60000000,
        realizationAmount: 58500000,
        status: 'Tercapai',
        notes: 'Selesai 100% dan sudah beroperasi'
      },
      {
        id: 'wp-bm-2',
        programName: 'Pengadaan Paket Alat Pesta & Tenda Premium',
        targetDescription: 'Pembelian 2 Unit Tenda Sarnavil & 100 Kursi',
        rabBudget: 35000000,
        realizationAmount: 35000000,
        status: 'Tercapai',
        notes: 'Aset telah diserahterimakan dan disewakan'
      }
    ],
    capitalParticipation: 150000000,
    capitalParticipationPrevYear: 100000000,
    capitalParticipationCurrentYear: 50000000,

    totalAssets: 285000000,
    totalAssetsPrevYear: 200000000,
    totalAssetsCurrentYear: 85000000,

    totalRevenue: 120000000,
    totalRevenuePrevYear: 70000000,
    totalRevenueCurrentYear: 50000000,

    netProfit: 45000000,
    netProfitPrevYear: 25000000,
    netProfitCurrentYear: 20000000,

    padesContribution: 15000000,
    padesContributionPrevYear: 10000000,
    padesContributionCurrentYear: 5000000,
    assetItems: [
      {
        id: 'ast-bm-1',
        itemName: 'Tanah Kantor & Bangunan Gudang BUMDes',
        itemType: 'Bangunan/Tanah',
        acquisitionYear: 2021,
        acquisitionValue: 150000000,
        condition: 'Baik',
        ownershipDoc: 'Sertifikat',
        locationNotes: 'RT 03 Dusun 1 Bangun Mulya'
      },
      {
        id: 'ast-bm-2',
        itemName: 'Mesin Pompa Utama Pamsimas & Panel Solar',
        itemType: 'Peralatan/Mesin',
        acquisitionYear: 2022,
        acquisitionValue: 85000000,
        condition: 'Baik',
        ownershipDoc: 'BAST',
        locationNotes: 'Sumber Air Dusun 2'
      },
      {
        id: 'ast-bm-3',
        itemName: 'Motor Roda Tiga Operasional Usaha',
        itemType: 'Barang Bergerak',
        acquisitionYear: 2023,
        acquisitionValue: 32000000,
        condition: 'Baik',
        ownershipDoc: 'BPKB/STNK',
        locationNotes: 'Di bawah penguasaan Unit Usaha'
      }
    ],
    units: [
      {
        id: 'unit-bm-1',
        name: 'Pengelolaan Air Bersih (Pamsimas)',
        status: 'Aktif Beroperasi',
        financialCondition: 'Untung',
        mainConstraint: 'Manajemen'
      },
      {
        id: 'unit-bm-2',
        name: 'Unit Jasa Penyewaan Alat Pesta',
        status: 'Aktif Beroperasi',
        financialCondition: 'Untung',
        mainConstraint: 'Modal'
      }
    ],
    totalEmployees: 8,
    localEmployees: 8,
    assistedUmkm: 5,
    verificationNotes: 'Pengelolaan Pamsimas berjalan stabil dan memberikan kontribusi nyata bagi air bersih warga. Administrasi keuangan lengkap.',
    healthScore: 'Sehat/Berkembang',
    followUpRecommendation: 'Perluas jangkauan layanan Pamsimas ke dusun sebelah yang belum teraliri air bersih dan tingkatkan kapasitas SDM pengelola keuangan.',
    reviewedBy: 'Bpk. Siswanto (Kasi PMD)',
    reviewedAt: '2026-07-11T14:30:00Z'
  },
  {
    id: 'Sesulu_2026',
    village: 'Sesulu',
    year: 2026,
    lastUpdated: '2026-07-05T10:00:00Z',
    bumdesName: 'BUMDes Sesulu Sejahtera',
    establishedYear: 2020,
    directorName: 'Kartini, S.Ak.',
    lawStatus: 'Proses Pendaftaran',
    certificatePdfName: '',
    certificatePdfUrl: '',
    hasPerdesPendirian: true,
    perdesPdfName: 'PERDES_PENDIRIAN_BUMDES_SESULU.pdf',
    perdesPdfUrl: 'simulation_pdf_url',
    hasAdArt: true,
    adArtPdfName: 'AD_ART_SESULU.pdf',
    adArtPdfUrl: 'simulation_pdf_url',
    hasSkPengelola: true,
    skPengelolaPdfName: 'SK_PENGURUS_SESULU_BARU.pdf',
    skPengelolaPdfUrl: 'simulation_pdf_url',
    musdesDate: '2026-02-10',
    musdesBaPdfName: 'BA_MUSDES_LPJ_SESULU_2025.pdf',
    musdesBaPdfUrl: 'simulation_pdf_url',
    musdesPhotoUrl: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&q=80&w=600',
    musdesPhotoName: 'FOTO_MUSDES_SESULU.jpg',
    capitalParticipation: 200000000,
    capitalParticipationPrevYear: 150000000,
    capitalParticipationCurrentYear: 50000000,

    totalAssets: 180000000,
    totalAssetsPrevYear: 130000000,
    totalAssetsCurrentYear: 50000000,

    totalRevenue: 60000000,
    totalRevenuePrevYear: 40000000,
    totalRevenueCurrentYear: 20000000,

    netProfit: 10000000,
    netProfitPrevYear: 6000000,
    netProfitCurrentYear: 4000000,

    padesContribution: 3000000,
    padesContributionPrevYear: 2000000,
    padesContributionCurrentYear: 1000000,
    units: [
      {
        id: 'unit-ss-1',
        name: 'Pengolahan Sampah Lingkungan',
        status: 'Aktif Beroperasi',
        financialCondition: 'Impas',
        mainConstraint: 'SDM'
      },
      {
        id: 'unit-ss-2',
        name: 'Penyewaan Kios Desa',
        status: 'Kurang Aktif',
        financialCondition: 'Rugi',
        mainConstraint: 'Pasar'
      }
    ],
    totalEmployees: 5,
    localEmployees: 5,
    assistedUmkm: 2,
    verificationNotes: 'Badan hukum Kemenkumham masih berstatus pendaftaran. Unit kios desa kurang aktif karena minimnya promosi.',
    healthScore: 'Dasar/Perlu Perhatian',
    followUpRecommendation: 'Segera selesaikan sertifikasi badan hukum Kemenkumham, lakukan renovasi/rebranding kios desa agar menarik minat pedagang baru.',
    reviewedBy: 'Bpk. Siswanto (Kasi PMD)',
    reviewedAt: '2026-07-06T15:00:00Z'
  },
  {
    id: 'Api-api_2026',
    village: 'Api-api',
    year: 2026,
    lastUpdated: '2026-07-12T09:00:00Z',
    bumdesName: 'BUMDes Api-api Bahari',
    establishedYear: 2022,
    directorName: 'Mulyadi, S.E.',
    lawStatus: 'Belum',
    certificatePdfName: '',
    certificatePdfUrl: '',
    hasPerdesPendirian: true,
    perdesPdfName: 'PERDES_PENDIRIAN_API_API.pdf',
    perdesPdfUrl: 'simulation_pdf_url',
    hasAdArt: false,
    adArtPdfName: '',
    adArtPdfUrl: '',
    hasSkPengelola: true,
    skPengelolaPdfName: 'SK_PENGELOLA_APIAPI.pdf',
    skPengelolaPdfUrl: 'simulation_pdf_url',
    musdesDate: '',
    musdesBaPdfName: '',
    musdesBaPdfUrl: '',
    musdesPhotoUrl: '',
    musdesPhotoName: '',
    capitalParticipation: 50000000,
    totalAssets: 45000000,
    totalRevenue: 25000000,
    netProfit: -5000000,
    padesContribution: 0,
    units: [
      {
        id: 'unit-aa-1',
        name: 'Budidaya Perikanan Tambak',
        status: 'Berhenti/Pailit',
        financialCondition: 'Rugi',
        mainConstraint: 'SDM'
      }
    ],
    totalEmployees: 3,
    localEmployees: 3,
    assistedUmkm: 0,
    verificationNotes: 'Kegiatan tambak mengalami kegagalan karena kurangnya keahlian teknis pengelola dan serangan penyakit ikan.',
    healthScore: 'Sakit/Mangkrak',
    followUpRecommendation: 'Lakukan Musyawarah Desa khusus untuk merestrukturisasi kepengurusan BUMDes dan lakukan studi kelayakan unit usaha baru sebelum memulai kembali.',
    reviewedBy: 'Bpk. Siswanto (Kasi PMD)',
    reviewedAt: '2026-07-12T16:00:00Z'
  },
  {
    id: 'Bangun Mulya_2027',
    village: 'Bangun Mulya',
    year: 2027,
    lastUpdated: '2027-01-10T12:00:00Z',
    bumdesName: 'BUMDes Karya Mandiri',
    establishedYear: 2018,
    directorName: 'Sudirman, S.H.',
    lawStatus: 'Sudah Terbit',
    certificatePdfName: 'SERTIFIKAT_KEMENKUMHAM_BM_2027.pdf',
    certificatePdfUrl: 'simulation_pdf_url',
    hasPerdesPendirian: true,
    perdesPdfName: 'PERDES_PENDIRIAN_BUMDES_BM_2027.pdf',
    perdesPdfUrl: 'simulation_pdf_url',
    hasAdArt: true,
    adArtPdfName: 'AD_ART_BUMDES_BM_2027.pdf',
    adArtPdfUrl: 'simulation_pdf_url',
    hasSkPengelola: true,
    skPengelolaPdfName: 'SK_PENGELOLA_BUMDES_BM_2027.pdf',
    skPengelolaPdfUrl: 'simulation_pdf_url',
    musdesDate: '2027-01-20',
    musdesBaPdfName: 'BA_MUSDES_LPJ_BM_2026.pdf',
    musdesBaPdfUrl: 'simulation_pdf_url',
    rktDocName: 'RKT_BUMDES_BANGUN_MULYA_2027.pdf',
    rktDocUrl: 'simulation_pdf_url',
    rabDocName: 'RAB_OPERASIONAL_2027.pdf',
    rabDocUrl: 'simulation_pdf_url',
    feasibilityStudyPdfName: 'ANALISA_KELAYAKAN_MODAL_BM_2027.pdf',
    feasibilityStudyPdfUrl: 'simulation_pdf_url',
    perdesCapitalPdfName: 'PERDES_PENYERTAAN_MODAL_BM_2027.pdf',
    perdesCapitalPdfUrl: 'simulation_pdf_url',
    workPlans: [
      {
        id: 'wp-bm-2027-1',
        programName: 'Pengembangan Unit Usaha Pengolahan Hasil Tani Desa',
        targetDescription: 'Pembelian 1 Unit Mesin Pengering Gabah & Packaging',
        rabBudget: 75000000,
        realizationAmount: 75000000,
        status: 'Tercapai',
        notes: 'Selesai dan membantu petani lokal'
      }
    ],
    capitalParticipation: 200000000,
    capitalParticipationPrevYear: 150000000,
    capitalParticipationCurrentYear: 50000000,

    totalAssets: 350000000,
    totalAssetsPrevYear: 285000000,
    totalAssetsCurrentYear: 65000000,

    totalRevenue: 150000000,
    totalRevenuePrevYear: 120000000,
    totalRevenueCurrentYear: 30000000,

    netProfit: 60000000,
    netProfitPrevYear: 45000000,
    netProfitCurrentYear: 15000000,

    padesContribution: 20000000,
    padesContributionPrevYear: 15000000,
    padesContributionCurrentYear: 5000000,
    units: [
      {
        id: 'unit-bm-1',
        name: 'Pengelolaan Air Bersih (Pamsimas)',
        status: 'Aktif Beroperasi',
        financialCondition: 'Untung',
        mainConstraint: 'Manajemen'
      },
      {
        id: 'unit-bm-2',
        name: 'Unit Jasa Penyewaan Alat Pesta',
        status: 'Aktif Beroperasi',
        financialCondition: 'Untung',
        mainConstraint: 'Modal'
      }
    ],
    totalEmployees: 9,
    localEmployees: 9,
    assistedUmkm: 7,
    verificationNotes: 'Laporan Monev BUMDes TA 2027 berjalan dengan peningkatan unit pengolahan hasil tani.',
    healthScore: 'Sehat/Berkembang',
    followUpRecommendation: 'Pertahankan kinerja keuangan dan tingkatkan kontribusi PADes.',
    reviewedBy: 'Bpk. Siswanto (Kasi PMD)'
  }
];

