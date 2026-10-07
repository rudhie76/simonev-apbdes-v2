/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type Village = 'Bangun Mulya' | 'Sesulu' | 'Api-api';

export type Sector = 
  | 'Penyelenggaraan Pemerintahan'
  | 'Pembangunan Desa (Infrastruktur)'
  | 'Pembangunan Desa (Non Infrastruktur)'
  | 'Pembinaan Kemasyarakatan'
  | 'Pemberdayaan Masyarakat'
  | 'Penanggulangan Bencana & Mendesak';

export type ActivityStatus = 'BELUM_MULAI' | 'DALAM_PROSES' | 'MENUNGGU_EVALUASI' | 'SELESAI';

export type SourceOfFunds = 
  | 'Dana Desa (DD)'
  | 'Alokasi Dana Desa (ADD)'
  | 'Pendapatan Bagi Hasil (PBH)'
  | 'Bantuan Keuangan (Bankeu)'
  | 'Pendapatan Asli Desa (PAD)'
  | 'Sisa Lebih Perhitungan Anggaran (SiLPA)';

export interface Evaluation {
  recomendation: string;
  evaluatorName: string;
  evaluatedAt: string;
}

export interface RecommendationHistoryEntry {
  id: string;
  text: string;
  officerName: string;
  timestamp: string;
  isApproved: boolean;
}

export interface IncompleteReasonHistoryEntry {
  id: string;
  text: string;
  progressPhysical: number;
  timestamp: string;
}

export interface Activity {
  id: string;
  name: string;
  village: Village;
  sector: Sector;
  budgetTotal: number;
  budgetSpent: number;
  progressPhysical: number; // 0 - 100
  status: ActivityStatus;
  sourceOfFunds?: SourceOfFunds;
  photoUrl?: string; // Base64 or template placeholder
  photoName?: string; // Original filename of the physical realization document
  budgetReportUrl?: string; // Base64 or simulation name
  budgetReportName?: string; // Original filename of the budget report
  lastUpdated: string;
  createdAt: string;
  year?: number;
  // Kecamatan level evaluation fields
  recommendation?: string;
  isKecamatanApproved: boolean;
  approvedBy?: string;
  approvedAt?: string;
  incompleteReason?: string;
  // Historical logs
  recommendationsHistory?: RecommendationHistoryEntry[];
  incompleteReasonsHistory?: IncompleteReasonHistoryEntry[];
}

export interface NotificationLog {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  type: 'info' | 'success' | 'warn' | 'approval';
  village?: Village;
}

export interface SiskeudesPagu {
  id?: string;
  village: Village;
  year?: number;
  paguTotal: number;
  lastSynced: string;
  isSynced: boolean;
  fundsBreakdown?: {
    dd: number;
    add: number;
    pad: number;
    pbh?: number;
    bankeu?: number;
    silpa?: number;
  };
}

export type UserRole = 
  | 'PUBLIC' 
  | 'OP_BANGUN_MULYA' 
  | 'OP_SESULU' 
  | 'OP_API_API' 
  | 'OP_KECAMATAN';

export type UserStatus = 'Pending' | 'Aktif' | 'Ditolak';

export interface RegisteredAccount {
  id: string;
  fullName: string;
  role: UserRole;
  username: string;
  password?: string;
  phoneNip?: string;
  registeredAt: string;
  lastLogin?: string;
  status: UserStatus;
  approvedBy?: string;
  approvedAt?: string;
}

export interface Regulation {
  id: string;
  category: 'PUSAT' | 'PROVINSI' | 'KABUPATEN';
  title: string;
  numberAndYear: string;
  topic: string;
  description: string;
  publishDate: string;
  keyPoints: string[];
  referenceUrl?: string;
  downloadFilename: string;
  createdAt: string;
  lastUpdated: string;
}

// BUMDes Monev related types
export type BumdesLawStatus = 'Sudah Terbit' | 'Proses Pendaftaran' | 'Belum';
export type BumdesUnitStatus = 'Aktif Beroperasi' | 'Kurang Aktif' | 'Berhenti/Pailit';
export type BumdesUnitFinancial = 'Untung' | 'Impas' | 'Rugi';
export type BumdesUnitConstraint = 'Modal' | 'SDM' | 'Pasar' | 'Manajemen';
export type BumdesHealthScore = 'Sehat/Berkembang' | 'Tumbuh' | 'Dasar/Perlu Perhatian' | 'Sakit/Mangkrak';

export interface BumdesUnit {
  id: string;
  name: string;
  status: BumdesUnitStatus;
  financialCondition: BumdesUnitFinancial;
  mainConstraint: BumdesUnitConstraint;
}

// 1. Modul Rencana Kerja & Anggaran (RKT & RAB)
export type BumdesWorkPlanStatus = 'Rencana' | 'Berjalan' | 'Tercapai' | 'Tidak Tercapai';

export interface BumdesWorkPlan {
  id: string;
  programName: string; // Target Program / Kegiatan Unit Usaha
  targetDescription: string; // Target Output / Sasaran
  rabBudget: number; // Anggaran RAB (Rp)
  realizationAmount: number; // Realisasi Anggaran (Rp)
  status: BumdesWorkPlanStatus; // Status Kinerja
  notes?: string; // Catatan Singkat
}

// 2. Modul Inventaris & Pengamanan Aset Tetap
export type AssetItemType = 'Barang Bergerak' | 'Barang Tidak Bergerak' | 'Peralatan/Mesin' | 'Bangunan/Tanah';
export type AssetCondition = 'Baik' | 'Rusak Ringan' | 'Rusak Berat';
export type AssetOwnershipDoc = 'Sertifikat' | 'BPKB/STNK' | 'Kuitansi/Nota' | 'BAST' | 'Surat Perjanjian/Hibah' | 'Belum Ada';

export interface BumdesAssetItem {
  id: string;
  itemName: string; // Nama Barang / Aset
  itemType: AssetItemType; // Kategori Aset
  acquisitionYear?: number; // Tahun Perolehan
  acquisitionValue: number; // Nilai Perolehan (Rp)
  condition: AssetCondition; // Kondisi Fisik
  ownershipDoc: AssetOwnershipDoc; // Dokumen Kepemilikan & Pengamanan
  locationNotes?: string; // Lokasi / Penguasaan Lapangan
}

export interface BumdesMonev {
  id: string; // village_year
  village: Village;
  year: number;
  lastUpdated: string;
  updatedBy?: string;
  bumdesName?: string;
  establishedYear?: number;
  directorName?: string;

  // 1. Modul Dokumen Digital
  lawStatus: BumdesLawStatus;
  certificatePdfUrl?: string; // base64 or placeholder
  certificatePdfName?: string; // filename

  hasPerdesPendirian: boolean;
  perdesPdfUrl?: string;
  perdesPdfName?: string;

  hasAdArt: boolean;
  adArtPdfUrl?: string;
  adArtPdfName?: string;

  hasSkPengelola: boolean;
  skPengelolaPdfUrl?: string;
  skPengelolaPdfName?: string;

  musdesDate?: string;
  musdesBaPdfUrl?: string;
  musdesBaPdfName?: string;
  musdesPhotoUrl?: string;
  musdesPhotoName?: string;
  musdesPhotos?: string[]; // Array of up to 4 compressed photo Data URLs/URLs

  // 2. Modul Rencana Kerja & Anggaran (RKT & RAB)
  rktDocUrl?: string;
  rktDocName?: string;
  rabDocUrl?: string;
  rabDocName?: string;
  workPlans?: BumdesWorkPlan[];

  // 3. Modul Keuangan Utama (Rincian Tahun Sebelum + Tahun Berjalan -> Total Terjumlah)
  capitalParticipation: number; // Penyertaan Modal Desa (Kumulatif / Total Terjumlah)
  capitalParticipationPrevYear?: number; // Modal s.d. Tahun Sebelum
  capitalParticipationCurrentYear?: number; // Modal Tahun Berjalan

  // Dokumen Penyertaan Modal (Modul 3)
  feasibilityStudyPdfName?: string; // Dokumen Analisa Kelayakan Penyertaan Modal
  feasibilityStudyPdfUrl?: string;
  perdesCapitalPdfName?: string; // Dokumen Perdes Penyertaan Modal Sesuai Tahun Anggaran
  perdesCapitalPdfUrl?: string;
  skCapitalPdfName?: string; // Fallback legacy SK
  skCapitalPdfUrl?: string;

  totalAssets: number; // Total Aset (Kumulatif / Total Terjumlah)
  totalAssetsPrevYear?: number;
  totalAssetsCurrentYear?: number;

  totalRevenue: number; // Total Pendapatan
  totalRevenuePrevYear?: number;
  totalRevenueCurrentYear?: number;

  netProfit: number; // Laba Bersih
  netProfitPrevYear?: number;
  netProfitCurrentYear?: number;

  padesContribution: number; // Bagi Hasil untuk PADes
  padesContributionPrevYear?: number;
  padesContributionCurrentYear?: number;

  // Sub-Modul Inventaris & Pengamanan Aset Tetap
  assetItems?: BumdesAssetItem[];

  // 4. Modul Kinerja Unit Usaha (Input Dinamis/Tabel)
  units: BumdesUnit[];

  // 5. Modul Dampak Sosial & Ketenagakerjaan
  totalEmployees: number;
  localEmployees: number;
  assistedUmkm: number;

  // 6. Modul Catatan & Rekomendasi Tim Monev
  verificationNotes?: string;
  healthScore?: BumdesHealthScore;
  followUpRecommendation?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

