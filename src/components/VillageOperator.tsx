/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, Village, Sector, ActivityStatus, SourceOfFunds } from '../types';
import { 
  Building2, 
  Plus, 
  Trash2, 
  Edit3, 
  Upload, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  AlertTriangle, 
  AlertCircle,
  ArrowRight, 
  Save, 
  X,
  FileCheck,
  Coins,
  FileSpreadsheet,
  Printer,
  Download,
  Search,
  Filter,
  Camera
} from 'lucide-react';
import { handleDownloadFile, handleDownloadPhotoPdf } from '../lib/download';
import { uploadFileToStorage } from '../lib/sheetsApi';

// Client-side image compression helper
const compressImageFile = (
  file: File, 
  onCompressed?: (info: { fileName: string; originalSize: string; compressedSize: string; percentage: number }) => void
): Promise<File> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max dimension 1600px for balanced detail & space
        const maxDim = 1600;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + "_compressed.jpg", {
                type: 'image/jpeg',
                lastModified: Date.now(),
              });

              if (onCompressed) {
                const origSizeMB = (file.size / (1024 * 1024)).toFixed(2);
                const compSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
                const savings = Math.round(((file.size - compressedFile.size) / file.size) * 100);
                
                onCompressed({
                  fileName: file.name,
                  originalSize: `${origSizeMB} MB`,
                  compressedSize: `${compSizeMB} MB`,
                  percentage: savings
                });
              }

              resolve(compressedFile);
            } else {
              resolve(file);
            }
          },
          'image/jpeg',
          0.7
        );
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};

interface VillageOperatorProps {
  village: Village;
  activities: Activity[];
  onAddActivity: (activity: Omit<Activity, 'id' | 'createdAt' | 'lastUpdated' | 'isKecamatanApproved'>) => void;
  onUpdateActivity: (id: string, updates: Partial<Activity>) => void;
  onDeleteActivity: (id: string) => void;
  onTriggerPrintRecap?: () => void;
  selectedYear: number;
}

const SECTORS: Sector[] = [
  'Penyelenggaraan Pemerintahan',
  'Pembangunan Desa (Infrastruktur)',
  'Pembangunan Desa (Non Infrastruktur)',
  'Pembinaan Kemasyarakatan',
  'Pemberdayaan Masyarakat',
  'Penanggulangan Bencana & Mendesak'
];

export const SOURCES_OF_FUNDS: SourceOfFunds[] = [
  'Dana Desa (DD)',
  'Alokasi Dana Desa (ADD)',
  'Pendapatan Bagi Hasil (PBH)',
  'Bantuan Keuangan (Bankeu)',
  'Pendapatan Asli Desa (PAD)',
  'Sisa Lebih Perhitungan Anggaran (SiLPA)'
];

export default function VillageOperator({ 
  village, 
  activities, 
  onAddActivity, 
  onUpdateActivity, 
  onDeleteActivity,
  onTriggerPrintRecap,
  selectedYear
}: VillageOperatorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State for Adding / Editing
  const [newName, setNewName] = useState('');
  const [newSector, setNewSector] = useState<Sector>('Pembangunan Desa (Infrastruktur)');
  const [newSourceOfFunds, setNewSourceOfFunds] = useState<SourceOfFunds>('Dana Desa (DD)');
  const [newBudgetTotal, setNewBudgetTotal] = useState(0);
  const [newBudgetSpent, setNewBudgetSpent] = useState(0);
  const [newProgressPhysical, setNewProgressPhysical] = useState(0);
  const [newIncompleteReason, setNewIncompleteReason] = useState('');
  const [newPhotos, setNewPhotos] = useState<string[]>(['', '', '', '']);
  const [newReport, setNewReport] = useState<string>('');
  const [newReportName, setNewReportName] = useState<string>('');
  const [isPhotoUploading, setIsPhotoUploading] = useState(false);
  const [isReportUploading, setIsReportUploading] = useState(false);
  const [compressionFeedback, setCompressionFeedback] = useState<{
    fileName: string;
    originalSize: string;
    compressedSize: string;
    percentage: number;
  } | null>(null);

  // Active inputs inside custom editing modal
  const [editBudgetSpent, setEditBudgetSpent] = useState<number>(0);
  const [editProgressPhysical, setEditProgressPhysical] = useState<number>(0);
  const [editIncompleteReason, setEditIncompleteReason] = useState<string>('');
  const [editPhotos, setEditPhotos] = useState<string[]>(['', '', '', '']);
  const [editReport, setEditReport] = useState<string>('');
  const [editReportName, setEditReportName] = useState<string>('');
  const [editSourceOfFunds, setEditSourceOfFunds] = useState<SourceOfFunds>('Dana Desa (DD)');
  const [editSector, setEditSector] = useState<Sector>('Pembangunan Desa (Infrastruktur)');

  // Filter state variables matching the requested photo
  const [selectedSector, setSelectedSector] = useState<Sector | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | 'ALL'>('ALL');
  const [selectedSourceOfFunds, setSelectedSourceOfFunds] = useState<SourceOfFunds | 'ALL'>('ALL');
  const [selectedPhysical, setSelectedPhysical] = useState<'ALL' | '100' | 'UNDER_100'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'ALL' | 'PENDING' | 'PROCESS' | 'APPROVED'>('ALL');

  // Filter activities only for this operator's village
  const villageActivities = useMemo(() => {
    return activities.filter(act => act.village === village);
  }, [activities, village]);

  // Filter village activities by search and drop-downs
  const filteredVillageActivities = useMemo(() => {
    return villageActivities.filter(act => {
      const matchSector = selectedSector === 'ALL' || act.sector === selectedSector;
      const matchStatus = selectedStatus === 'ALL' || act.status === selectedStatus;
      const matchSource = selectedSourceOfFunds === 'ALL' || (act.sourceOfFunds || 'Dana Desa (DD)') === selectedSourceOfFunds;
      const matchPhysical = 
        selectedPhysical === 'ALL' ? true :
        selectedPhysical === '100' ? act.progressPhysical === 100 :
        act.progressPhysical < 100;
      const matchTab = 
        activeTab === 'PENDING' ? act.status === 'MENUNGGU_EVALUASI' :
        activeTab === 'PROCESS' ? act.status === 'DALAM_PROSES' :
        activeTab === 'APPROVED' ? act.isKecamatanApproved : true;
      const matchSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (act.sourceOfFunds || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (act.incompleteReason || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchSector && matchStatus && matchSource && matchPhysical && matchTab && matchSearch;
    });
  }, [villageActivities, selectedSector, selectedStatus, selectedSourceOfFunds, selectedPhysical, searchQuery, activeTab]);

  // Calculate quick stats
  const stats = useMemo(() => {
    const totalCount = villageActivities.length;
    const completedCount = villageActivities.filter(a => a.status === 'SELESAI').length;
    const waitingEvaluasiCount = villageActivities.filter(a => a.status === 'MENUNGGU_EVALUASI').length;
    const inProcessCount = villageActivities.filter(a => a.status === 'DALAM_PROSES').length;
    const approvedCount = villageActivities.filter(a => a.isKecamatanApproved).length;
    const currentSpent = villageActivities.reduce((sum, a) => sum + a.budgetSpent, 0);
    const totalPagu = villageActivities.reduce((sum, a) => sum + a.budgetTotal, 0);

    return { totalCount, completedCount, waitingEvaluasiCount, inProcessCount, approvedCount, currentSpent, totalPagu };
  }, [villageActivities]);

  // Handle Photo / Physical Realisasi File input (Firebase Cloud Storage Upload with Base64 fallback)
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean, index: number = -1) => {
    const rawFiles = e.target.files;
    if (!rawFiles || rawFiles.length === 0) return;

    setCompressionFeedback(null);
    setIsPhotoUploading(true);

    const fileList = Array.from(rawFiles);
    
    try {
      for (let i = 0; i < fileList.length; i++) {
        let file = fileList[i];
        if (file.type.startsWith('image/') && file.size > 1 * 1024 * 1024) {
          try {
            file = await compressImageFile(file, (info) => {
              setCompressionFeedback(info);
            });
          } catch (err) {
            console.error("Image compression error:", err);
          }
        }

        if (file.size > 15 * 1024 * 1024) {
          alert(`Ukuran berkas "${file.name}" melebihi batas (Maks. 15MB)`);
          continue;
        }

        let uploadedUrl = '';
        try {
          uploadedUrl = await uploadFileToStorage(file, 'photos');
        } catch (err) {
          console.error("Firebase Storage failed, trying local Base64 fallback if file < 1MB:", err);
          if (file.size <= 800 * 1024) {
            uploadedUrl = await new Promise<string>((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.readAsDataURL(file);
            });
          } else {
            alert(
              'Gagal mengunggah berkas ke Cloud Storage.\n\n' +
              'Penyebab: Layanan Firebase Storage belum aktif atau koneksi terputus.'
            );
            continue;
          }
        }

        if (uploadedUrl) {
          if (isEditMode) {
            setEditPhotos(prev => {
              const updated = [...prev];
              if (index >= 0) {
                updated[index] = uploadedUrl;
              } else {
                const emptyIdx = updated.findIndex(slot => !slot);
                if (emptyIdx !== -1) updated[emptyIdx] = uploadedUrl;
                else updated[0] = uploadedUrl;
              }
              return updated;
            });
          } else {
            setNewPhotos(prev => {
              const updated = [...prev];
              if (index >= 0) {
                updated[index] = uploadedUrl;
              } else {
                const emptyIdx = updated.findIndex(slot => !slot);
                if (emptyIdx !== -1) updated[emptyIdx] = uploadedUrl;
                else updated[0] = uploadedUrl;
              }
              return updated;
            });
          }
        }
      }
    } finally {
      setIsPhotoUploading(false);
      e.target.value = '';
    }
  };

  // Handle report file input (Firebase Cloud Storage Upload with Base64 fallback for small files)
  const handleReportFileChange = async (e: React.ChangeEvent<HTMLInputElement>, isEditMode: boolean) => {
    let file = e.target.files?.[0];
    if (file) {
      setCompressionFeedback(null);

      // Compress if it is an image exceeding 1MB
      if (file.type.startsWith('image/') && file.size > 1 * 1024 * 1024) {
        setIsReportUploading(true);
        try {
          file = await compressImageFile(file, (info) => {
            setCompressionFeedback(info);
          });
        } catch (err) {
          console.error("Image compression error:", err);
        }
      }

      if (file.size > 15 * 1024 * 1024) {
        alert('Ukuran berkas melebihi batas (Maks. 15MB)');
        setIsReportUploading(false);
        return;
      }
      
      setIsReportUploading(true);
      try {
        const downloadUrl = await uploadFileToStorage(file, 'reports');
        if (isEditMode) {
          setEditReport(downloadUrl);
          setEditReportName(file.name);
        } else {
          setNewReport(downloadUrl);
          setNewReportName(file.name);
        }
      } catch (err) {
        console.error("Firebase Storage failed, trying local Base64 fallback if file < 1MB:", err);
        if (file.size <= 800 * 1024) {
          const reader = new FileReader();
          reader.onloadend = () => {
            if (isEditMode) {
              setEditReport(reader.result as string);
              setEditReportName(file.name);
            } else {
              setNewReport(reader.result as string);
              setNewReportName(file.name);
            }
          };
          reader.readAsDataURL(file);
        } else {
          alert(
            'Gagal mengunggah berkas ke Cloud Storage.\n\n' +
            'Penyebab: Layanan Firebase Storage belum aktif atau koneksi terputus.\n' +
            'Untuk mengunggah berkas di atas 1MB, pastikan "Storage" di Firebase Console Anda sudah diaktifkan.'
          );
        }
      } finally {
        setIsReportUploading(false);
      }
    }
  };

  // Submit Add form
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      alert('Nama kegiatan tidak boleh kosong');
      return;
    }
    if (newBudgetTotal <= 0) {
      alert('Pagu anggaran total harus lebih besar dari Rp 0');
      return;
    }

    if (newProgressPhysical < 100 && !newIncompleteReason.trim()) {
      alert('Isi alasan Belum Rampung dan Jika sudah Rampung');
      return;
    }

    // Determine status automatically based on progress
    let calculatedStatus: ActivityStatus = 'BELUM_MULAI';
    if (newProgressPhysical > 0 && newProgressPhysical < 100) {
      calculatedStatus = 'DALAM_PROSES';
    } else if (newProgressPhysical === 100) {
      calculatedStatus = 'MENUNGGU_EVALUASI';
    }

     onAddActivity({
      name: newName,
      village,
      sector: newSector,
      sourceOfFunds: newSourceOfFunds,
      budgetTotal: Number(newBudgetTotal),
      budgetSpent: Number(newBudgetSpent),
      progressPhysical: Number(newProgressPhysical),
      status: calculatedStatus,
      photoUrl: newPhotos.filter(Boolean).join(';') || undefined,
      budgetReportUrl: newReport || undefined,
      budgetReportName: newReportName || undefined,
      incompleteReason: newProgressPhysical < 100 ? newIncompleteReason : undefined,
      year: selectedYear
    });

    // Reset Form
    setNewName('');
    setNewSector('Pembangunan Desa (Infrastruktur)');
    setNewSourceOfFunds('Dana Desa (DD)');
    setNewBudgetTotal(0);
    setNewBudgetSpent(0);
    setNewProgressPhysical(0);
    setNewIncompleteReason('');
    setNewPhotos(['', '', '', '']);
    setNewReport('');
    setNewReportName('');
    setShowAddForm(false);
    setCompressionFeedback(null);
  };

  const startEdit = (act: Activity) => {
    setEditingId(act.id);
    setEditBudgetSpent(act.budgetSpent);
    setEditProgressPhysical(act.progressPhysical);
    setEditIncompleteReason(act.incompleteReason || '');
    const initialPhotos = act.photoUrl ? act.photoUrl.split(';').filter(Boolean) : [];
    const paddedPhotos = [...initialPhotos, '', '', '', ''].slice(0, 4);
    setEditPhotos(paddedPhotos);
    setEditReport(act.budgetReportUrl || '');
    setEditReportName(act.budgetReportName || '');
    setEditSourceOfFunds(act.sourceOfFunds || 'Dana Desa (DD)');
    setEditSector(act.sector);
    setCompressionFeedback(null);
  };

  const handleUpdateSubmit = (id: string) => {
    const act = activities.find(a => a.id === id);
    if (!act) return;

    if (editBudgetSpent > act.budgetTotal) {
      alert(`Anggaran terpakai (${editBudgetSpent}) melebihi pagu total (${act.budgetTotal}).`);
      return;
    }

    if (editProgressPhysical < 100 && !editIncompleteReason.trim()) {
      alert('Isi alasan Belum Rampung dan Jika sudah Rampung');
      return;
    }

    // Determine state change
    let status: ActivityStatus = act.status;
    if (editProgressPhysical === 0) {
      status = 'BELUM_MULAI';
    } else if (editProgressPhysical > 0 && editProgressPhysical < 100) {
      status = 'DALAM_PROSES';
    } else if (editProgressPhysical === 100) {
      // If was previously complete or other, move to waiting evaluation
      status = 'MENUNGGU_EVALUASI';
    }

    onUpdateActivity(id, {
      budgetSpent: Number(editBudgetSpent),
      progressPhysical: Number(editProgressPhysical),
      photoUrl: editPhotos.filter(Boolean).join(';') || undefined,
      budgetReportUrl: editReport || undefined,
      budgetReportName: editReportName || undefined,
      sourceOfFunds: editSourceOfFunds,
      sector: editSector,
      status,
      incompleteReason: editProgressPhysical < 100 ? editIncompleteReason : (act.incompleteReason || ''),
      // If modified, clean kecamatan approved until re-evaluated
      isKecamatanApproved: false
    });

    setEditingId(null);
    setCompressionFeedback(null);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div id="village-operator-root" className="space-y-6">
      {/* Village Banner */}
      <div className="p-6 bg-linear-to-r from-slate-900 via-slate-950 to-slate-900 rounded-2xl text-white shadow-md border border-slate-800 relative">
        <div className="absolute top-4 right-4 text-[10px] font-mono uppercase bg-blue-600 text-white px-2.5 py-1 rounded-md font-extrabold shadow-sm">
          Role: Operator Desa
        </div>
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/10 rounded-xl">
            <Building2 className="w-8 h-8 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold font-sans">Panel Realisasi Desa {village}</h2>
            <p className="text-slate-300 text-xs md:text-sm mt-0.5 leading-relaxed">
              Anda berwenang menginput data APBDes, memperbarui serapan anggaran, mengunggah bukti fisik, dan mengajukan laporan ke Kecamatan Waru.
            </p>
          </div>
        </div>

        {/* Village Summary Horizontal Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Total Kegiatan</div>
            <div className="text-lg md:text-xl font-bold font-mono text-white mt-0.5">{stats.totalCount}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Pagu APBDes Terencana</div>
            <div className="text-sm md:text-base font-bold font-mono text-white mt-0.5 truncate">{formatRupiah(stats.totalPagu)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Total Dana Terserap</div>
            <div className="text-sm md:text-base font-bold font-mono text-emerald-400 mt-0.5 truncate">{formatRupiah(stats.currentSpent)}</div>
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-450">Selesai Realisasi</div>
            <div className="text-lg md:text-xl font-bold font-mono text-cyan-300 mt-0.5">
              {stats.completedCount} <span className="text-xs text-slate-400">kegiatan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Panel Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <h3 className="font-bold text-slate-800 text-sm md:text-base flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          Daftar Rencana Kerja Kegiatan APBDes ({villageActivities.length})
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTriggerPrintRecap}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs md:text-sm rounded-lg transition-all border border-slate-300 cursor-pointer shadow-xs active:scale-95"
            type="button"
          >
            <Printer className="w-4 h-4 text-slate-600" />
            Cetak Rekap APBDes ({village})
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold text-xs md:text-sm rounded-lg hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
          >
            {showAddForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showAddForm ? 'Batal Tambah' : 'Input Kegiatan Baru'}
          </button>
        </div>
      </div>

      {/* Insert Activity Form (Folds toggle) */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="bg-white p-6 rounded-2xl border border-blue-200 shadow-md space-y-6">
          <div className="border-b border-slate-100 pb-3 flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-600" />
            <h4 className="font-bold text-slate-900">Formulir Input Kegiatan APBDes Baru</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Nama Kegiatan / Program Kerja</label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Contoh: Semenisasi Jalan RT 03 Dusun Kenanga"
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Bidang APBDes (Kategori)</label>
              <select
                value={newSector}
                onChange={(e) => setNewSector(e.target.value as Sector)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              >
                {SECTORS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Sumber Dana</label>
              <select
                value={newSourceOfFunds}
                onChange={(e) => setNewSourceOfFunds(e.target.value as SourceOfFunds)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
              >
                {SOURCES_OF_FUNDS.map((source) => (
                  <option key={source} value={source}>{source}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Pagu Anggaran Total (IDR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">Rp</span>
                <input
                  type="number"
                  required
                  min={1}
                  value={newBudgetTotal || ''}
                  onChange={(e) => setNewBudgetTotal(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-mono font-bold"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Realisasi Keuangan (IDR)</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400 font-mono text-sm">Rp</span>
                <input
                  type="number"
                  min={0}
                  value={newBudgetSpent || ''}
                  onChange={(e) => setNewBudgetSpent(Number(e.target.value))}
                  placeholder="0"
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 font-mono text-slate-700"
                />
              </div>
              <p className="text-[10px] text-slate-400">Dapat diperbarui bertahap sesuai Surat Pertanggungjawaban (SPJ) Desa.</p>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">Progres Fisik Awal (%)</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={newProgressPhysical}
                  onChange={(e) => setNewProgressPhysical(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <span className="text-sm font-bold font-mono text-slate-800 bg-slate-100 px-2 py-1 rounded w-12 text-center">
                  {newProgressPhysical}%
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Slide ke 100% jika kegiatan di lapangan telah rampung.</p>
            </div>

            {newProgressPhysical < 100 && (
              <div className="space-y-2 md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase">
                  Alasan Kegiatan Belum Rampung <span className="text-rose-600">*</span>
                </label>
                <input
                  type="text"
                  value={newIncompleteReason}
                  onChange={(e) => setNewIncompleteReason(e.target.value)}
                  placeholder="Isi alasan jika pengerjaan fisik belum mencapai 100% (misal: Kendala cuaca hujan/kiriman material terlambat)"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10"
                />
              </div>
            )}

            {/* File Laporan Realisasi Fisik */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">File Laporan Realisasi Fisik (PDF / Docx / Xlsx / Gambar)</label>
              <input
                type="file"
                multiple
                accept="image/*, application/pdf, .docx, .xlsx, .doc, .xls"
                id="add-photo-file-bar"
                onChange={(e) => handlePhotoFileChange(e, false, -1)}
                className="hidden"
              />
              <label 
                htmlFor="add-photo-file-bar"
                className="flex items-center justify-center gap-2 border border-slate-300 border-dashed rounded-lg p-2.5 text-slate-600 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-center"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>
                  {isPhotoUploading 
                    ? 'Mengunggah ke Cloud Storage...' 
                    : (newPhotos.filter(Boolean).length > 0 
                        ? `${newPhotos.filter(Boolean).length} Berkas Fisik Terunggah (Pilih untuk Tambah/Ganti)` 
                        : 'Pilih Berkas Laporan Realisasi Fisik (PDF / Docx / Xlsx / Foto)'
                      )
                  }
                </span>
              </label>

              {/* Badges for uploaded physical files */}
              {newPhotos.filter(Boolean).length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {newPhotos.map((photo, idx) => {
                    if (!photo) return null;
                    const isPdf = photo.startsWith('data:application/pdf') || photo.includes('.pdf');
                    return (
                      <div key={idx} className="flex items-center gap-1.5 bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs shadow-xs">
                        {isPdf ? (
                          <FileText className="w-4 h-4 text-red-500 flex-shrink-0" />
                        ) : (
                          <img src={photo} alt={`Berkas ${idx + 1}`} className="w-5 h-5 object-cover rounded flex-shrink-0" />
                        )}
                        <span className="text-[11px] font-semibold text-slate-700 max-w-[140px] truncate">Berkas Fisik {idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewPhotos(prev => {
                              const updated = [...prev];
                              updated[idx] = '';
                              return updated;
                            });
                          }}
                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded transition-colors cursor-pointer ml-1"
                          title="Hapus Berkas"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">File Laporan Realisasi Keuangan (PDF / Docx / Xlsx / Gambar)</label>
              <input
                type="file"
                accept=".pdf, .docx, .xlsx, image/*"
                id="add-report-file"
                onChange={(e) => handleReportFileChange(e, false)}
                className="hidden"
              />
              <label 
                htmlFor="add-report-file"
                className="flex items-center justify-center gap-2 border border-slate-300 border-dashed rounded-lg p-2.5 text-slate-600 bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors text-xs font-semibold text-center"
              >
                <FileText className="w-4 h-4 text-slate-400" />
                <span>
                  {isReportUploading 
                    ? 'Mengunggah ke Cloud Storage...' 
                    : (newReportName 
                        ? `${newReportName.slice(0, 20)}...` 
                        : 'Pilih Berkas Laporan Keuangan (PDF / Docx / Xlsx / Foto)'
                      )
                  }
                </span>
              </label>
            </div>
          </div>

          {compressionFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg text-xs flex items-start gap-2.5 shadow-xs">
              <span className="text-base">⚡</span>
              <div className="space-y-0.5">
                <div className="font-bold text-emerald-950">Kompresi Otomatis Berhasil!</div>
                <p className="text-slate-600">
                  Berkas <span className="font-semibold">{compressionFeedback.fileName}</span> yang melebihi batas kapasitas telah otomatis dikompresi dari <strong>{compressionFeedback.originalSize}</strong> menjadi <strong>{compressionFeedback.compressedSize}</strong> (<span className="text-emerald-700 font-bold">{compressionFeedback.percentage}% lebih hemat penyimpanan!</span>).
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs md:text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isPhotoUploading || isReportUploading}
              className="px-5 py-2 bg-blue-600 rounded-lg text-xs md:text-sm font-bold text-white hover:bg-blue-700 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPhotoUploading || isReportUploading ? 'Sedang Mengunggah Berkas...' : 'Simpan & Daftarkan Kegiatan'}
            </button>
          </div>
        </form>
      )}

      {/* Search & Filters Row matching photo */}
      <div className="bg-slate-50 p-4 md:p-5 rounded-2xl border border-slate-200/80 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari kegiatan desa..."
              className="w-full pl-9 pr-4 py-2 text-xs md:text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder-slate-400 bg-white"
            />
          </div>
          <div className="text-[10px] md:text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-mono self-start md:self-center">
            Menampilkan: {filteredVillageActivities.length} dari {villageActivities.length} Kegiatan
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Filter Bidang APBDes */}
          <div className="relative">
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value as Sector | 'ALL')}
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-medium text-slate-700 truncate"
            >
              <option value="ALL">Semua Bidang APBDes</option>
              <option value="Penyelenggaraan Pemerintahan">Penyelenggaraan Pemerintahan</option>
              <option value="Pembangunan Desa (Infrastruktur)">Pembangunan Desa (Infrastruktur)</option>
              <option value="Pembangunan Desa (Non Infrastruktur)">Pembangunan Desa (Non Infrastruktur)</option>
              <option value="Pembinaan Kemasyarakatan">Pembinaan Kemasyarakatan</option>
              <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
              <option value="Penanggulangan Bencana & Mendesak">Kebencanaan & Mendesak</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Status */}
          <div className="relative">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as ActivityStatus | 'ALL')}
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Status Realisasi</option>
              <option value="BELUM_MULAI">Belum Mulai</option>
              <option value="DALAM_PROSES">Dalam Proses</option>
              <option value="MENUNGGU_EVALUASI">Menunggu Evaluasi</option>
              <option value="SELESAI">Selesai</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Sumber Dana */}
          <div className="relative">
            <select
              value={selectedSourceOfFunds}
              onChange={(e) => setSelectedSourceOfFunds(e.target.value as SourceOfFunds | 'ALL')}
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-medium text-slate-700 truncate"
            >
              <option value="ALL">Semua Sumber Dana</option>
              <option value="Dana Desa (DD)">Dana Desa (DD)</option>
              <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD)</option>
              <option value="Pendapatan Bagi Hasil (PBH)">Pendapatan Bagi Hasil (PBH)</option>
              <option value="Bantuan Keuangan (Bankeu)">Bantuan Keuangan (Bankeu)</option>
              <option value="Pendapatan Asli Desa (PAD)">Pendapatan Asli Desa (PAD)</option>
              <option value="Sisa Lebih Perhitungan Anggaran (SiLPA)">Sisa Lebih Perhitungan Anggaran (SiLPA)</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Filter Progres Fisik */}
          <div className="relative">
            <select
              value={selectedPhysical}
              onChange={(e) => setSelectedPhysical(e.target.value as 'ALL' | '100' | 'UNDER_100')}
              className="w-full pl-3.5 pr-10 py-2.5 text-xs bg-white border border-slate-250 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-medium text-slate-700"
            >
              <option value="ALL">Semua Progres Fisik</option>
              <option value="100">Fisik 100%</option>
              <option value="UNDER_100">Fisik di Bawah 100%</option>
            </select>
            <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Villages Activities List Widget */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {villageActivities.length > 0 && (
          <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex gap-2 p-1 bg-slate-100 rounded-lg max-w-fit flex-wrap">
              <button
                onClick={() => setActiveTab('PENDING')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'PENDING'
                    ? 'bg-orange-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Menunggu Evaluasi ({stats.waitingEvaluasiCount})
              </button>
              <button
                onClick={() => setActiveTab('PROCESS')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'PROCESS'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dalam Proses ({stats.inProcessCount})
              </button>
              <button
                onClick={() => setActiveTab('APPROVED')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'APPROVED'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Telah Disetujui ({stats.approvedCount})
              </button>
              <button
                onClick={() => setActiveTab('ALL')}
                className={`px-4 py-2 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  activeTab === 'ALL'
                    ? 'bg-slate-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua Usulan ({stats.totalCount})
              </button>
            </div>
          </div>
        )}
        {villageActivities.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Coins className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-semibold">Belum ada kegiatan yang terdaftar untuk Desa {village}.</p>
            <p className="text-slate-400 text-xs mt-1">Silakan klik tombol "Input Kegiatan Baru" di kanan atas.</p>
          </div>
        ) : filteredVillageActivities.length === 0 ? (
          <div className="text-center py-16 px-6">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 font-bold text-sm">Tidak ditemukan kegiatan yang cocok dengan kriteria pencarian atau filter.</p>
            <button 
              onClick={() => {
                setSelectedSector('ALL');
                setSelectedStatus('ALL');
                setSelectedSourceOfFunds('ALL');
                setSelectedPhysical('ALL');
                setActiveTab('ALL');
                setSearchQuery('');
              }}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors cursor-pointer"
              type="button"
            >
              Reset Semua Filter
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredVillageActivities.map((act) => {
              const isEditing = editingId === act.id;
              const hasRecommendation = act.recommendation && !act.isKecamatanApproved;

              return (
                <div 
                  key={act.id} 
                  className={`p-6 hover:bg-slate-50/50 transition-all relative ${
                    hasRecommendation 
                      ? 'border-l-[5px] border-l-rose-500 bg-rose-50/15' 
                      : ''
                  }`}
                >
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Activity Info left */}
                    <div className="space-y-3 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 uppercase tracking-wider font-mono">
                          {act.sector}
                        </span>

                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider font-mono flex items-center gap-1">
                          <span>🪙</span> {act.sourceOfFunds || 'Dana Desa (DD)'}
                        </span>
                        
                        {act.isKecamatanApproved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-sm border border-emerald-200">
                            ✓ Disetujui Kecamatan
                          </span>
                        ) : hasRecommendation ? (
                          <span className="inline-flex items-center gap-1.5 text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-sm border border-rose-200 animate-pulse">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                            </span>
                            ⚠ PERLU TINDAK LANJUT / REVISI DESA
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-sm">
                            Menunggu Persetujuan
                          </span>
                        )}
                      </div>

                      <h4 className="text-base md:text-lg font-bold text-slate-900 leading-snug">
                        {act.name}
                      </h4>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-500 pt-1">
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

                      {/* Photo / report file preview if uploaded */}
                      <div className="flex flex-wrap gap-4 pt-2">
                        {act.photoUrl && (
                          <div className="flex flex-col gap-2 p-3 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 w-full sm:w-auto">
                            <div className="flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-slate-500" />
                              <span className="font-semibold">
                                Berkas Realisasi Fisik ({act.photoUrl.split(';').filter(Boolean).length} Berkas)
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-0.5">
                              {act.photoUrl.split(';').filter(Boolean).map((photo, pIdx) => {
                                const isPdf = photo.startsWith('data:application/pdf') || photo.includes('.pdf');
                                return (
                                  <div key={pIdx} className="relative group/thumb">
                                    {isPdf ? (
                                      <div 
                                        onClick={() => handleDownloadPhotoPdf({ ...act, photoUrl: photo })}
                                        className="w-10 h-10 flex flex-col items-center justify-center bg-red-50 text-red-600 rounded border border-slate-300 p-1 text-[8px] font-bold cursor-pointer hover:bg-red-100 transition-colors"
                                        title="Unduh / Lihat File PDF"
                                      >
                                        <FileText className="w-5 h-5 text-red-500" />
                                        <span>PDF</span>
                                      </div>
                                    ) : (
                                      <img 
                                        src={photo} 
                                        alt={`Berkas Realisasi Fisik ${pIdx + 1}`} 
                                        className="w-10 h-10 object-cover rounded border border-slate-300 hover:scale-105 transition-transform cursor-pointer" 
                                        onClick={() => {
                                          handleDownloadPhotoPdf({ ...act, photoUrl: photo });
                                        }}
                                        title={`Klik untuk unduh/lihat Berkas Realisasi Fisik ${pIdx + 1}`}
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadPhotoPdf(act)}
                              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap mt-1 justify-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Unduh Semua Berkas Realisasi Fisik
                            </button>
                          </div>
                        )}
                        {act.budgetReportUrl && (
                          <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-100 rounded-lg border border-slate-200 text-xs text-slate-700 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                              <FileCheck className="w-4 h-4 text-slate-500" />
                              <span className="font-mono truncate max-w-[150px] md:max-w-[200px]" title={act.budgetReportName || act.budgetReportUrl}>{act.budgetReportName || act.budgetReportUrl}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleDownloadFile(act)}
                              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-[10px] px-2 py-1.5 rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-sm whitespace-nowrap"
                              title="Unduh Berkas Syarat Evaluasi"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Unduh Syarat Evaluasi
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Riwayat Rekomendasi Kecamatan */}
                      {act.recommendationsHistory && act.recommendationsHistory.length > 0 ? (
                        <div className="p-4 bg-amber-50/80 rounded-xl border-l-[4px] border-amber-500/80 mt-2 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800 border-b border-amber-200/50 pb-1">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Riwayat Catatan Rekomendasi / Evaluasi Kecamatan (Awal ke Akhir):
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {act.recommendationsHistory.map((rec, idx) => (
                              <div key={rec.id} className="text-[11px] text-slate-700 bg-white/60 p-2 rounded border border-amber-200/45 space-y-1">
                                <div className="flex justify-between items-center text-[9px] text-slate-500">
                                  <span className="font-bold">{idx + 1}. Oleh {rec.officerName}</span>
                                  <span className="font-mono">{new Date(rec.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                                <p className="italic">"{rec.text}"</p>
                                <div className="text-[9px] font-bold">
                                  Status: {rec.isApproved ? (
                                    <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 rounded">Selesai (ACC)</span>
                                  ) : (
                                    <span className="text-amber-700 font-semibold bg-amber-50 px-1 rounded">Perlu Perbaikan (Revisi)</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : act.recommendation ? (
                        <div className="p-4 bg-amber-50/80 rounded-xl border-l-[4px] border-amber-500/80 mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Rekomendasi Camat / Evaluator Kecamatan:
                          </div>
                          <p className="text-xs text-slate-700 italic pl-5">
                            "{act.recommendation}"
                          </p>
                        </div>
                      ) : null}

                      {/* Riwayat Alasan Belum Rampung */}
                      {act.incompleteReasonsHistory && act.incompleteReasonsHistory.length > 0 ? (
                        <div className="p-4 bg-rose-50/65 rounded-xl border-l-[4px] border-rose-500/75 mt-2 space-y-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800 border-b border-rose-200/50 pb-1">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Riwayat Alasan Belum Rampung & Progress (Awal ke Akhir):
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {act.incompleteReasonsHistory.map((inc, idx) => (
                              <div key={inc.id} className="text-[11px] text-slate-700 bg-white/60 p-2 rounded border border-rose-200/40 space-y-1">
                                <div className="flex justify-between items-center text-[9px] text-slate-500">
                                  <span className="font-bold">{idx + 1}. Progress Fisik: {inc.progressPhysical}%</span>
                                  <span className="font-mono">{new Date(inc.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                                </div>
                                <p className="italic">"{inc.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : act.incompleteReason ? (
                        <div className="p-3.5 bg-rose-50/60 rounded-xl border-l-[4px] border-rose-500/70 mt-2 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                            <AlertTriangle className="w-4 h-4 text-rose-500" />
                            Alasan Kegiatan Belum Rampung:
                          </div>
                          <p className="text-xs text-slate-700 italic pl-5 font-medium">
                            "{act.incompleteReason}"
                          </p>
                        </div>
                      ) : null}
                    </div>

                    {/* Editor Form Right Side or Progress slider display */}
                    <div className="w-full lg:w-80 bg-slate-50 p-4 rounded-xl border border-slate-200/60 transition-all flex flex-col justify-center">
                      {isEditing ? (
                        <div className="space-y-4">
                          <h5 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-100 pb-2 flex items-center justify-between">
                            <span>Perbarui Realisasi</span>
                            <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-rose-500">
                              <X className="w-4 h-4" />
                            </button>
                          </h5>

                          {hasRecommendation && (
                            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-900 font-bold space-y-1 animate-pulse">
                              <div className="flex items-center gap-1.5">
                                <span className="relative flex h-2 w-2">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                                </span>
                                <span>INSTRUKSI REVISI EVALUATOR</span>
                              </div>
                              <p className="font-medium text-slate-600 leading-normal font-sans normal-case">
                                Harap tindak lanjuti catatan Kecamatan di sebelah kiri. Sesuaikan anggaran/fisik/dokumen lalu klik "Simpan".
                              </p>
                            </div>
                          )}

                          {/* Budget spent field input */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 block">REALISASI KEUANGAN (IDR)</label>
                            <input
                              type="number"
                              min={0}
                              max={act.budgetTotal}
                              value={editBudgetSpent}
                              onChange={(e) => setEditBudgetSpent(Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-mono font-bold"
                            />
                            <p className="text-[9px] text-slate-400">Maks. Pagu {formatRupiah(act.budgetTotal)}</p>
                          </div>

                          {/* Sumber Dana selection */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 block">SUMBER DANA</label>
                            <select
                              value={editSourceOfFunds}
                              onChange={(e) => setEditSourceOfFunds(e.target.value as SourceOfFunds)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-bold text-slate-750"
                            >
                              {SOURCES_OF_FUNDS.map((source) => (
                                <option key={source} value={source}>{source}</option>
                              ))}
                            </select>
                          </div>

                          {/* Bidang APBDes selection */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-600 block">BIDANG APBDes</label>
                            <select
                              value={editSector}
                              onChange={(e) => setEditSector(e.target.value as Sector)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded font-bold text-slate-750"
                            >
                              {SECTORS.map((sector) => (
                                <option key={sector} value={sector}>{sector}</option>
                              ))}
                            </select>
                          </div>

                          {/* Physical slider */}
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-slate-600">
                              <span>PROGRES FISIK (%)</span>
                              <span className="text-blue-600 font-bold">{editProgressPhysical}%</span>
                            </div>
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={editProgressPhysical}
                              onChange={(e) => setEditProgressPhysical(Number(e.target.value))}
                              className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                          </div>

                          {/* Reason for not completed in Edit panel */}
                          {editProgressPhysical < 100 && (
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-slate-600 block">ALASAN KEGIATAN BELUM RAMPUNG <span className="text-rose-600">*</span></label>
                              <input
                                type="text"
                                value={editIncompleteReason}
                                onChange={(e) => setEditIncompleteReason(e.target.value)}
                                placeholder="Misal: Menunggu pengerjaan / material terlambat"
                                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          )}

                          {/* Always show Photo and Report upload options on update */}
                          <div className={`space-y-2 p-2 rounded-md text-[10px] ${
                            editProgressPhysical === 100 
                              ? 'bg-orange-50 border border-orange-200 text-orange-800' 
                              : 'bg-slate-100 border border-slate-200 text-slate-700'
                          }`}>
                            <span className="font-bold flex items-center gap-1">
                              {editProgressPhysical === 100 ? (
                                <>
                                  <AlertCircle className="w-3.5 h-3.5 text-orange-600 flex-shrink-0" />
                                  Dokumen Wajib (Syarat Evaluasi & ACC):
                                </>
                              ) : (
                                <>
                                  <Upload className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                  Unggah Dokumen Realisasi/Foto Terakhir:
                                </>
                              )}
                            </span>
                            
                            {/* Single Bar File picker for Realisasi Fisik */}
                            <div className="space-y-1">
                              <input
                                type="file"
                                multiple
                                accept="image/*, application/pdf, .docx, .xlsx, .doc, .xls"
                                id={`edit-photo-${act.id}`}
                                onChange={(e) => handlePhotoFileChange(e, true, -1)}
                                className="hidden"
                              />
                              <label 
                                htmlFor={`edit-photo-${act.id}`}
                                className="flex items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded p-2 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors text-[11px] font-semibold text-center"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {isPhotoUploading 
                                    ? 'Mengunggah...' 
                                    : (editPhotos.filter(Boolean).length > 0 
                                        ? `${editPhotos.filter(Boolean).length} Berkas Fisik Terunggah (Pilih untuk Tambah/Ganti)` 
                                        : 'Pilih Berkas Laporan Realisasi Fisik (PDF / Docx / Xlsx / Foto)'
                                      )
                                  }
                                </span>
                              </label>

                              {/* Badges for uploaded physical files */}
                              {editPhotos.filter(Boolean).length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {editPhotos.map((photo, pIdx) => {
                                    if (!photo) return null;
                                    const isPdf = photo.startsWith('data:application/pdf') || photo.includes('.pdf');
                                    return (
                                      <div key={pIdx} className="flex items-center gap-1 bg-white border border-slate-300 rounded px-2 py-0.5 text-[10px]">
                                        {isPdf ? (
                                          <FileText className="w-3 h-3 text-red-500 flex-shrink-0" />
                                        ) : (
                                          <img src={photo} alt={`Berkas ${pIdx + 1}`} className="w-4 h-4 object-cover rounded flex-shrink-0" />
                                        )}
                                        <span className="font-medium text-slate-700 max-w-[120px] truncate">Berkas {pIdx + 1}</span>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setEditPhotos(prev => {
                                              const updated = [...prev];
                                              updated[pIdx] = '';
                                              return updated;
                                            });
                                          }}
                                          className="text-slate-400 hover:text-rose-600 p-0.5 rounded cursor-pointer"
                                          title="Hapus"
                                        >
                                          <X className="w-3 h-3" />
                                        </button>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Single Bar File picker for Realisasi Keuangan */}
                            <div>
                              <input
                                type="file"
                                accept=".pdf, .docx, .xlsx, image/*"
                                id={`edit-report-${act.id}`}
                                onChange={(e) => handleReportFileChange(e, true)}
                                className="hidden"
                              />
                              <label 
                                htmlFor={`edit-report-${act.id}`}
                                className="flex items-center justify-center gap-1.5 border border-dashed border-slate-300 rounded p-2 text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-colors text-[11px] font-semibold text-center"
                              >
                                <FileText className="w-3.5 h-3.5 text-slate-400" />
                                <span>
                                  {isReportUploading 
                                    ? 'Mengunggah...' 
                                    : (editReportName 
                                        ? `${editReportName.slice(0, 20)}... (Ganti)` 
                                        : 'Pilih Berkas Laporan Keuangan (PDF / Docx / Xlsx / Foto)'
                                      )
                                  }
                                </span>
                              </label>
                            </div>
                          </div>

                          {compressionFeedback && (
                            <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-850 rounded-lg text-[10px] flex items-start gap-2 shadow-xs">
                              <span className="text-xs">⚡</span>
                              <div className="space-y-0.5">
                                <div className="font-bold text-emerald-950">Kompresi Berhasil!</div>
                                <p className="text-slate-600 leading-normal">
                                  Berkas <span className="font-semibold">{compressionFeedback.fileName}</span> telah otomatis dikompresi dari <strong>{compressionFeedback.originalSize}</strong> menjadi <strong>{compressionFeedback.compressedSize}</strong> (<span className="text-emerald-700 font-bold">-{compressionFeedback.percentage}%</span>).
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="flex-1 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              Batal
                            </button>
                            <button
                              type="button"
                              disabled={isPhotoUploading || isReportUploading}
                              onClick={() => handleUpdateSubmit(act.id)}
                              className="flex-1 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Save className="w-3 h-3" />
                              {isPhotoUploading || isReportUploading ? 'Mengunggah...' : 'Simpan'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">Progres Fisik</span>
                            <span className="text-xs font-bold text-slate-900 font-mono">{act.progressPhysical}%</span>
                          </div>
                          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden border border-slate-300/40">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                act.progressPhysical === 100 ? 'bg-emerald-500' :
                                act.progressPhysical > 50 ? 'bg-amber-400' : 'bg-rose-400'
                              }`} 
                              style={{ width: `${act.progressPhysical}%` }}
                            ></div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1.5">
                            <div className="relative w-full">
                              <button
                                onClick={() => startEdit(act)}
                                className={`w-full py-1.5 px-3 bg-white border font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                                  hasRecommendation 
                                    ? 'border-rose-300 text-rose-800 bg-rose-50/50 hover:bg-rose-100/70 ring-2 ring-rose-500/25 animate-pulse'
                                    : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                              >
                                <Edit3 className={`w-3.5 h-3.5 ${hasRecommendation ? 'text-rose-600' : 'text-blue-500'}`} />
                                <span>Update</span>
                                {hasRecommendation && (
                                  <span className="flex h-2 w-2 relative">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-600"></span>
                                  </span>
                                )}
                              </button>
                              {hasRecommendation && (
                                <div className="absolute -top-2.5 right-1.5 text-[8px] bg-rose-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider animate-bounce shadow-xs pointer-events-none">
                                  Revisi
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={() => {
                                if (confirm(`Apakah Anda yakin ingin menghapus kegiatan "${act.name}"?`)) {
                                  onDeleteActivity(act.id);
                                }
                              }}
                              className="py-1.5 px-3 bg-white border border-slate-300 text-rose-600 font-semibold text-xs rounded-lg hover:bg-rose-50 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                              Hapus
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
