/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  BumdesMonev, 
  Village, 
  BumdesLawStatus, 
  BumdesUnitStatus, 
  BumdesUnitFinancial, 
  BumdesUnitConstraint, 
  BumdesHealthScore, 
  BumdesUnit,
  BumdesWorkPlan,
  BumdesWorkPlanStatus,
  BumdesAssetItem,
  AssetItemType,
  AssetCondition,
  AssetOwnershipDoc
} from '../types';
import { 
  Building2, 
  FileText, 
  TrendingUp, 
  Users, 
  ClipboardList, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Upload, 
  Calendar, 
  DollarSign, 
  Activity,
  Award,
  ShieldCheck,
  FileCheck,
  X,
  Info,
  AlertCircle,
  Printer,
  Zap,
  Image as ImageIcon,
  FileSpreadsheet,
  Layers,
  Box,
  PackageCheck,
  ClipboardCheck,
  Calculator,
  Download,
  Save
} from 'lucide-react';
import { uploadFileToStorage } from '../lib/sheetsApi';
import { compressPdfFile } from '../lib/pdfCompressor';
import { handleDownloadRktRabTemplate, handleDownloadRktRabReport } from '../lib/download';
import PrintBumdesMonevModal from './PrintBumdesMonevModal';

interface BumdesMonevBoardProps {
  bumdesList: BumdesMonev[];
  onUpdateBumdes: (bumdesData: BumdesMonev) => Promise<void>;
  activeRole: string;
}

export default function BumdesMonevBoard({
  bumdesList,
  onUpdateBumdes,
  activeRole
}: BumdesMonevBoardProps) {
  const isOperatorDesa = activeRole === 'OP_BANGUN_MULYA' || activeRole === 'OP_SESULU' || activeRole === 'OP_API_API';
  const isOperatorKecamatan = activeRole === 'OP_KECAMATAN';

  // Get active village based on operator role
  const getDefaultVillage = (): Village => {
    if (activeRole === 'OP_BANGUN_MULYA') return 'Bangun Mulya';
    if (activeRole === 'OP_SESULU') return 'Sesulu';
    if (activeRole === 'OP_API_API') return 'Api-api';
    return 'Bangun Mulya'; // Default for admin/kecamatan/public
  };

  const [selectedVillage, setSelectedVillage] = useState<Village>(getDefaultVillage());
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [activeReport, setActiveReport] = useState<BumdesMonev | null>(null);

  // Form State
  const [bumdesName, setBumdesName] = useState('');
  const [establishedYear, setEstablishedYear] = useState('');
  const [directorName, setDirectorName] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const [lawStatus, setLawStatus] = useState<BumdesLawStatus>('Belum');
  const [certificatePdfName, setCertificatePdfName] = useState('');
  const [certificatePdfUrl, setCertificatePdfUrl] = useState('');

  const [hasPerdesPendirian, setHasPerdesPendirian] = useState(false);
  const [perdesPdfName, setPerdesPdfName] = useState('');
  const [perdesPdfUrl, setPerdesPdfUrl] = useState('');

  const [hasAdArt, setHasAdArt] = useState(false);
  const [adArtPdfName, setAdArtPdfName] = useState('');
  const [adArtPdfUrl, setAdArtPdfUrl] = useState('');

  const [hasSkPengelola, setHasSkPengelola] = useState(false);
  const [skPengelolaPdfName, setSkPengelolaPdfName] = useState('');
  const [skPengelolaPdfUrl, setSkPengelolaPdfUrl] = useState('');

  const [musdesDate, setMusdesDate] = useState('');
  const [musdesBaPdfName, setMusdesBaPdfName] = useState('');
  const [musdesBaPdfUrl, setMusdesBaPdfUrl] = useState('');
  const [musdesPhotoName, setMusdesPhotoName] = useState('');
  const [musdesPhotoUrl, setMusdesPhotoUrl] = useState('');
  const [musdesPhotos, setMusdesPhotos] = useState<string[]>([]);

  // Modul 2: Rencana Kerja & Anggaran (RKT & RAB)
  const [rktDocName, setRktDocName] = useState('');
  const [rktDocUrl, setRktDocUrl] = useState('');
  const [rabDocName, setRabDocName] = useState('');
  const [rabDocUrl, setRabDocUrl] = useState('');
  const [workPlans, setWorkPlans] = useState<BumdesWorkPlan[]>([]);

  // Modul 3 Sub-bagian: Inventaris & Pengamanan Aset Tetap
  const [assetItems, setAssetItems] = useState<BumdesAssetItem[]>([]);

  const [capitalParticipationPrevYear, setCapitalParticipationPrevYear] = useState<number>(0);
  const [capitalParticipationCurrentYear, setCapitalParticipationCurrentYear] = useState<number>(0);
  const [capitalParticipation, setCapitalParticipation] = useState<number>(0);

  const [totalAssetsPrevYear, setTotalAssetsPrevYear] = useState<number>(0);
  const [totalAssetsCurrentYear, setTotalAssetsCurrentYear] = useState<number>(0);
  const [totalAssets, setTotalAssets] = useState<number>(0);

  const [totalRevenuePrevYear, setTotalRevenuePrevYear] = useState<number>(0);
  const [totalRevenueCurrentYear, setTotalRevenueCurrentYear] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);

  const [netProfitPrevYear, setNetProfitPrevYear] = useState<number>(0);
  const [netProfitCurrentYear, setNetProfitCurrentYear] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);

  const [padesContributionPrevYear, setPadesContributionPrevYear] = useState<number>(0);
  const [padesContributionCurrentYear, setPadesContributionCurrentYear] = useState<number>(0);
  const [padesContribution, setPadesContribution] = useState<number>(0);

  const [units, setUnits] = useState<BumdesUnit[]>([]);

  const [totalEmployees, setTotalEmployees] = useState<number>(0);
  const [localEmployees, setLocalEmployees] = useState<number>(0);
  const [assistedUmkm, setAssistedUmkm] = useState<number>(0);

  const [verificationNotes, setVerificationNotes] = useState('');
  const [healthScore, setHealthScore] = useState<BumdesHealthScore>('Dasar/Perlu Perhatian');
  const [followUpRecommendation, setFollowUpRecommendation] = useState('');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Lock gating logic:
  // Village operators can only select and edit their own village report
  // Kecamatan can select any village and edit reviewed fields
  // Public can select any village but only view (all edits locked)
  const canEditVillageModules = isOperatorDesa && getDefaultVillage() === selectedVillage;
  const canEditReviewerModule = isOperatorKecamatan;

  // Load active report based on chosen village & year
  useEffect(() => {
    const reportId = `${selectedVillage}_${selectedYear}`;
    const report = bumdesList.find(b => b.id === reportId);

    if (report) {
      setActiveReport(report);
      setBumdesName(report.bumdesName || '');
      setEstablishedYear(report.establishedYear ? String(report.establishedYear) : '');
      setDirectorName(report.directorName || '');
      setLawStatus(report.lawStatus || 'Belum');
      setCertificatePdfName(report.certificatePdfName || '');
      setCertificatePdfUrl(report.certificatePdfUrl || '');
      setHasPerdesPendirian(!!report.hasPerdesPendirian);
      setPerdesPdfName(report.perdesPdfName || '');
      setPerdesPdfUrl(report.perdesPdfUrl || '');
      setHasAdArt(!!report.hasAdArt);
      setAdArtPdfName(report.adArtPdfName || '');
      setAdArtPdfUrl(report.adArtPdfUrl || '');
      setHasSkPengelola(!!report.hasSkPengelola);
      setSkPengelolaPdfName(report.skPengelolaPdfName || '');
      setSkPengelolaPdfUrl(report.skPengelolaPdfUrl || '');
      setMusdesDate(report.musdesDate || '');
      setMusdesBaPdfName(report.musdesBaPdfName || '');
      setMusdesBaPdfUrl(report.musdesBaPdfUrl || '');
      setMusdesPhotoName(report.musdesPhotoName || '');
      setMusdesPhotoUrl(report.musdesPhotoUrl || '');
      const loadedPhotos = report.musdesPhotos && report.musdesPhotos.length > 0 
        ? report.musdesPhotos 
        : (report.musdesPhotoUrl ? [report.musdesPhotoUrl] : []);
      setMusdesPhotos(loadedPhotos);

      setRktDocName(report.rktDocName || '');
      setRktDocUrl(report.rktDocUrl || '');
      setRabDocName(report.rabDocName || '');
      setRabDocUrl(report.rabDocUrl || '');
      setWorkPlans(report.workPlans || []);

      setAssetItems(report.assetItems || []);

      const capPrev = report.capitalParticipationPrevYear ?? 0;
      const capCurr = report.capitalParticipationCurrentYear ?? (report.capitalParticipation || 0);
      setCapitalParticipationPrevYear(capPrev);
      setCapitalParticipationCurrentYear(capCurr);
      setCapitalParticipation(capPrev + capCurr);

      const astPrev = report.totalAssetsPrevYear ?? 0;
      const astCurr = report.totalAssetsCurrentYear ?? (report.totalAssets || 0);
      setTotalAssetsPrevYear(astPrev);
      setTotalAssetsCurrentYear(astCurr);
      setTotalAssets(astPrev + astCurr);

      const revPrev = report.totalRevenuePrevYear ?? 0;
      const revCurr = report.totalRevenueCurrentYear ?? (report.totalRevenue || 0);
      setTotalRevenuePrevYear(revPrev);
      setTotalRevenueCurrentYear(revCurr);
      setTotalRevenue(revPrev + revCurr);

      const prfPrev = report.netProfitPrevYear ?? 0;
      const prfCurr = report.netProfitCurrentYear ?? (report.netProfit || 0);
      setNetProfitPrevYear(prfPrev);
      setNetProfitCurrentYear(prfCurr);
      setNetProfit(prfPrev + prfCurr);

      const padPrev = report.padesContributionPrevYear ?? 0;
      const padCurr = report.padesContributionCurrentYear ?? (report.padesContribution || 0);
      setPadesContributionPrevYear(padPrev);
      setPadesContributionCurrentYear(padCurr);
      setPadesContribution(padPrev + padCurr);

      setUnits(report.units || []);
      setTotalEmployees(report.totalEmployees || 0);
      setLocalEmployees(report.localEmployees || 0);
      setAssistedUmkm(report.assistedUmkm || 0);
      setVerificationNotes(report.verificationNotes || '');
      setHealthScore(report.healthScore || 'Dasar/Perlu Perhatian');
      setFollowUpRecommendation(report.followUpRecommendation || '');
    } else {
      // Clean slate default state
      setActiveReport(null);
      setBumdesName('');
      setEstablishedYear('');
      setDirectorName('');
      setLawStatus('Belum');
      setCertificatePdfName('');
      setCertificatePdfUrl('');
      setHasPerdesPendirian(false);
      setPerdesPdfName('');
      setPerdesPdfUrl('');
      setHasAdArt(false);
      setAdArtPdfName('');
      setAdArtPdfUrl('');
      setHasSkPengelola(false);
      setSkPengelolaPdfName('');
      setSkPengelolaPdfUrl('');
      setMusdesDate('');
      setMusdesBaPdfName('');
      setMusdesBaPdfUrl('');
      setMusdesPhotoName('');
      setMusdesPhotoUrl('');
      setMusdesPhotos([]);

      setRktDocName('');
      setRktDocUrl('');
      setRabDocName('');
      setRabDocUrl('');
      setWorkPlans([]);

      setAssetItems([]);

      setCapitalParticipationPrevYear(0);
      setCapitalParticipationCurrentYear(0);
      setCapitalParticipation(0);

      setTotalAssetsPrevYear(0);
      setTotalAssetsCurrentYear(0);
      setTotalAssets(0);

      setTotalRevenuePrevYear(0);
      setTotalRevenueCurrentYear(0);
      setTotalRevenue(0);

      setNetProfitPrevYear(0);
      setNetProfitCurrentYear(0);
      setNetProfit(0);

      setPadesContributionPrevYear(0);
      setPadesContributionCurrentYear(0);
      setPadesContribution(0);
      setUnits([]);
      setTotalEmployees(0);
      setLocalEmployees(0);
      setAssistedUmkm(0);
      setVerificationNotes('');
      setHealthScore('Dasar/Perlu Perhatian');
      setFollowUpRecommendation('');
    }
    setSaveSuccess(false);
    setErrorMessage('');
  }, [selectedVillage, selectedYear, bumdesList]);

  // Handle village role lock enforcement
  useEffect(() => {
    if (isOperatorDesa) {
      setSelectedVillage(getDefaultVillage());
    }
  }, [activeRole]);

  // Helper to format file sizes nicely (KB / MB)
  const formatFileSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) {
      return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    return Math.round(bytes / 1024) + ' KB';
  };

  // Client-side image compression helper
  const compressImageFile = (
    file: File, 
    onCompressed?: (info: { fileName: string; originalSize: string; compressedSize: string; percentage: number }) => void,
    maxDimension: number = 900,
    quality: number = 0.68
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

          // Max dimension 900px for ultra-fast upload & lightweight storage fit (<1MB limit)
          const maxDim = maxDimension;
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

                const origSizeStr = formatFileSize(file.size);
                const compSizeStr = formatFileSize(compressedFile.size);
                const savings = file.size > compressedFile.size 
                  ? Math.round(((file.size - compressedFile.size) / file.size) * 100)
                  : 0;
                
                if (onCompressed) {
                  onCompressed({
                    fileName: file.name,
                    originalSize: origSizeStr,
                    compressedSize: compSizeStr,
                    percentage: savings
                  });
                }

                resolve(compressedFile.size < file.size ? compressedFile : file);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            quality
          );
        };
        img.onerror = () => resolve(file);
      };
      reader.onerror = () => resolve(file);
    });
  };

  const [uploadingStatus, setUploadingStatus] = useState<Record<string, boolean>>({});
  const [compressionFeedback, setCompressionFeedback] = useState<{
    fileName: string;
    originalSize: string;
    compressedSize: string;
    percentage: number;
    fileType?: string;
  } | null>(null);

  // Auto-save helper for immediate persistence upon file/photo uploads
  const autoSaveWithOverrides = async (overrides?: Partial<BumdesMonev>) => {
    try {
      setIsSaving(true);
      const targetMusdesPhotos = overrides?.musdesPhotos ?? musdesPhotos;
      const targetMusdesPhotoUrl = overrides?.musdesPhotoUrl ?? (targetMusdesPhotos[0] || musdesPhotoUrl);
      const targetMusdesPhotoName = overrides?.musdesPhotoName ?? (targetMusdesPhotos.length > 0 ? `${targetMusdesPhotos.length} Foto Musdes` : musdesPhotoName);

      const targetRktDocName = overrides?.rktDocName ?? rktDocName;
      const targetRktDocUrl = overrides?.rktDocUrl ?? rktDocUrl;
      const targetRabDocName = overrides?.rabDocName ?? rabDocName;
      const targetRabDocUrl = overrides?.rabDocUrl ?? rabDocUrl;
      const targetWorkPlans = overrides?.workPlans ?? workPlans;

      const updatedReport: BumdesMonev = {
        id: `${selectedVillage}_${selectedYear}`,
        village: selectedVillage,
        year: selectedYear,
        lastUpdated: new Date().toISOString(),
        updatedBy: activeRole,
        bumdesName: bumdesName || undefined,
        establishedYear: establishedYear ? Number(establishedYear) : undefined,
        directorName: directorName || undefined,

        lawStatus,
        certificatePdfName: overrides?.certificatePdfName ?? certificatePdfName,
        certificatePdfUrl: overrides?.certificatePdfUrl ?? certificatePdfUrl,

        hasPerdesPendirian,
        perdesPdfName: overrides?.perdesPdfName ?? perdesPdfName,
        perdesPdfUrl: overrides?.perdesPdfUrl ?? perdesPdfUrl,

        hasAdArt,
        adArtPdfName: overrides?.adArtPdfName ?? adArtPdfName,
        adArtPdfUrl: overrides?.adArtPdfUrl ?? adArtPdfUrl,

        hasSkPengelola,
        skPengelolaPdfName: overrides?.skPengelolaPdfName ?? skPengelolaPdfName,
        skPengelolaPdfUrl: overrides?.skPengelolaPdfUrl ?? skPengelolaPdfUrl,

        musdesDate,
        musdesBaPdfName: overrides?.musdesBaPdfName ?? musdesBaPdfName,
        musdesBaPdfUrl: overrides?.musdesBaPdfUrl ?? musdesBaPdfUrl,
        musdesPhotoName: targetMusdesPhotoName,
        musdesPhotoUrl: targetMusdesPhotoUrl,
        musdesPhotos: targetMusdesPhotos,

        // RKT & RAB
        rktDocName: targetRktDocName,
        rktDocUrl: targetRktDocUrl,
        rabDocName: targetRabDocName,
        rabDocUrl: targetRabDocUrl,
        workPlans: targetWorkPlans,

        // Financial & Assets
        capitalParticipationPrevYear,
        capitalParticipationCurrentYear,
        capitalParticipation: capitalParticipationPrevYear + capitalParticipationCurrentYear,

        totalAssetsPrevYear,
        totalAssetsCurrentYear,
        totalAssets: totalAssetsPrevYear + totalAssetsCurrentYear,

        totalRevenuePrevYear,
        totalRevenueCurrentYear,
        totalRevenue: totalRevenuePrevYear + totalRevenueCurrentYear,

        netProfitPrevYear,
        netProfitCurrentYear,
        netProfit: netProfitPrevYear + netProfitCurrentYear,

        padesContributionPrevYear,
        padesContributionCurrentYear,
        padesContribution: padesContributionPrevYear + padesContributionCurrentYear,
        assetItems,

        units,

        totalEmployees,
        localEmployees,
        assistedUmkm,

        // For Kecamatan Reviewer
        verificationNotes: isOperatorKecamatan ? verificationNotes : (activeReport?.verificationNotes || ''),
        healthScore: isOperatorKecamatan ? healthScore : (activeReport?.healthScore || 'Dasar/Perlu Perhatian'),
        followUpRecommendation: isOperatorKecamatan ? followUpRecommendation : (activeReport?.followUpRecommendation || ''),
        reviewedBy: isOperatorKecamatan ? 'Bpk. Siswanto (Kasi PMD)' : (activeReport?.reviewedBy || ''),
        reviewedAt: isOperatorKecamatan ? new Date().toISOString() : (activeReport?.reviewedAt || ''),
        ...overrides
      };

      await onUpdateBumdes(updatedReport);
      setActiveReport(updatedReport);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error("Auto-save error upon upload:", err);
      setErrorMessage("Gagal menyimpan data ke Cloud Firestore. Silakan coba lagi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleBumdesFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setName: (name: string) => void,
    setUrl: (url: string) => void,
    fieldKey: string
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setCompressionFeedback(null);
      setUploadingStatus(prev => ({ ...prev, [fieldKey]: true }));

      let fileToUpload = file;

      // Automatically compress if it's an image file
      if (file.type.startsWith('image/')) {
        try {
          fileToUpload = await compressImageFile(file, (info) => {
            setCompressionFeedback({ ...info, fileType: 'Gambar/Foto' });
          });
        } catch (err) {
          console.error("Compression failed, using original file:", err);
        }
      } else if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        try {
          const pdfResult = await compressPdfFile(file);
          fileToUpload = pdfResult.compressedFile;
          setCompressionFeedback({
            fileName: file.name,
            originalSize: formatFileSize(pdfResult.originalSize),
            compressedSize: formatFileSize(pdfResult.compressedSize),
            percentage: pdfResult.savingsPercentage,
            fileType: 'Dokumen PDF'
          });
        } catch (pdfErr) {
          console.error("PDF compression failed, using original PDF:", pdfErr);
          setCompressionFeedback({
            fileName: file.name,
            originalSize: formatFileSize(file.size),
            compressedSize: formatFileSize(file.size),
            percentage: 0,
            fileType: 'Dokumen PDF'
          });
        }
      }

      setName(fileToUpload.name);
      let uploadedUrl = '';

      try {
        const downloadUrl = await uploadFileToStorage(fileToUpload, 'bumdes_monev');
        setUrl(downloadUrl);
        uploadedUrl = downloadUrl;
      } catch (err) {
        console.warn("Firebase Storage timeout/failed, using fast local DataURL fallback:", err);
        try {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (e) => reject(e);
            reader.readAsDataURL(fileToUpload);
          });
          
          if (dataUrl.length > 980000) {
            alert("Ukuran berkas terlalu besar untuk disimpan dalam database Firestore. Mohon kompresi atau pilih berkas PDF/Dokumen di bawah 700 KB.");
            setUploadingStatus(prev => ({ ...prev, [fieldKey]: false }));
            return;
          }

          setUrl(dataUrl);
          uploadedUrl = dataUrl;
        } catch (readErr) {
          console.error("FileReader failed:", readErr);
          alert("Gagal membaca berkas. Silakan coba pilih berkas lain.");
          setUploadingStatus(prev => ({ ...prev, [fieldKey]: false }));
          return;
        }
      } finally {
        setUploadingStatus(prev => ({ ...prev, [fieldKey]: false }));
      }

      // Auto-save instantly so the document is persisted in Cloud Firestore
      if (uploadedUrl) {
        const overrides: Partial<BumdesMonev> = {};
        if (fieldKey === 'cert') {
          overrides.certificatePdfName = fileToUpload.name;
          overrides.certificatePdfUrl = uploadedUrl;
          setCertificatePdfName(fileToUpload.name);
          setCertificatePdfUrl(uploadedUrl);
        } else if (fieldKey === 'perdes') {
          overrides.perdesPdfName = fileToUpload.name;
          overrides.perdesPdfUrl = uploadedUrl;
          setPerdesPdfName(fileToUpload.name);
          setPerdesPdfUrl(uploadedUrl);
        } else if (fieldKey === 'adart') {
          overrides.adArtPdfName = fileToUpload.name;
          overrides.adArtPdfUrl = uploadedUrl;
          setAdArtPdfName(fileToUpload.name);
          setAdArtPdfUrl(uploadedUrl);
        } else if (fieldKey === 'sk') {
          overrides.skPengelolaPdfName = fileToUpload.name;
          overrides.skPengelolaPdfUrl = uploadedUrl;
          setSkPengelolaPdfName(fileToUpload.name);
          setSkPengelolaPdfUrl(uploadedUrl);
        } else if (fieldKey === 'musdes_ba') {
          overrides.musdesBaPdfName = fileToUpload.name;
          overrides.musdesBaPdfUrl = uploadedUrl;
          setMusdesBaPdfName(fileToUpload.name);
          setMusdesBaPdfUrl(uploadedUrl);
        } else if (fieldKey === 'rkt_doc') {
          overrides.rktDocName = fileToUpload.name;
          overrides.rktDocUrl = uploadedUrl;
          setRktDocName(fileToUpload.name);
          setRktDocUrl(uploadedUrl);
        } else if (fieldKey === 'rab_doc') {
          overrides.rabDocName = fileToUpload.name;
          overrides.rabDocUrl = uploadedUrl;
          setRabDocName(fileToUpload.name);
          setRabDocUrl(uploadedUrl);
        }
        await autoSaveWithOverrides(overrides);
      }
    }
  };

  // Handle batch upload for Musdes activity photos with automatic compression (Max 2 photos)
  const handleMultipleMusdesPhotosChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList: File[] = (Array.from(files) as File[]).filter(f => f.type.startsWith('image/'));
    if (fileList.length === 0) {
      alert("Harap pilih berkas foto/gambar (JPG, PNG, WEBP).");
      return;
    }

    const currentCount = musdesPhotos.length;
    const remainingSlots = 2 - currentCount;

    if (remainingSlots <= 0) {
      alert("Batas maksimum 2 foto kegiatan Musdes telah tercapai. Hapus salah satu foto terlebih dahulu jika ingin mengganti.");
      e.target.value = '';
      return;
    }

    let filesToProcess = fileList;
    if (fileList.length > remainingSlots) {
      alert(`Anda memilih ${fileList.length} foto. Karena batas maksimum adalah 2 foto, hanya ${remainingSlots} foto pertama yang akan diproses.`);
      filesToProcess = fileList.slice(0, remainingSlots);
    }

    setUploadingStatus(prev => ({ ...prev, 'musdes_photos_batch': true }));

    let totalOrigBytes = 0;
    let totalCompBytes = 0;
    const newCompressedPhotos: string[] = [];

    for (const file of filesToProcess) {
      totalOrigBytes += file.size;
      try {
        const compressedFile = await compressImageFile(file, undefined, 800, 0.65);
        totalCompBytes += compressedFile.size;

        try {
          const downloadUrl = await uploadFileToStorage(compressedFile, 'bumdes_monev_photos');
          newCompressedPhotos.push(downloadUrl);
        } catch {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(compressedFile);
          });
          newCompressedPhotos.push(dataUrl);
        }
      } catch (err) {
        console.error("Error compressing photo:", err);
      }
    }

    if (newCompressedPhotos.length > 0) {
      const updatedList = [...musdesPhotos, ...newCompressedPhotos].slice(0, 4);
      setMusdesPhotos(updatedList);
      setMusdesPhotoUrl(updatedList[0] || '');
      setMusdesPhotoName(`${updatedList.length} Foto Musdes`);

      const origSizeStr = formatFileSize(totalOrigBytes);
      const compSizeStr = formatFileSize(totalCompBytes);
      const savings = totalOrigBytes > totalCompBytes 
        ? Math.round(((totalOrigBytes - totalCompBytes) / totalOrigBytes) * 100)
        : 0;

      setCompressionFeedback({
        fileName: `${newCompressedPhotos.length} Foto Kegiatan Musdes`,
        originalSize: origSizeStr,
        compressedSize: compSizeStr,
        percentage: savings,
        fileType: `${newCompressedPhotos.length} Foto Musdes (Batch)`
      });

      // Auto-save photo batch
      await autoSaveWithOverrides({
        musdesPhotos: updatedList,
        musdesPhotoUrl: updatedList[0] || '',
        musdesPhotoName: `${updatedList.length} Foto Musdes`
      });
    }

    setUploadingStatus(prev => ({ ...prev, 'musdes_photos_batch': false }));
    e.target.value = '';
  };

  const handleRemoveMusdesPhoto = async (indexToRemove: number) => {
    const updated = musdesPhotos.filter((_, idx) => idx !== indexToRemove);
    setMusdesPhotos(updated);
    setMusdesPhotoUrl(updated[0] || '');
    setMusdesPhotoName(updated.length > 0 ? `${updated.length} Foto Musdes` : '');
    await autoSaveWithOverrides({
      musdesPhotos: updated,
      musdesPhotoUrl: updated[0] || '',
      musdesPhotoName: updated.length > 0 ? `${updated.length} Foto Musdes` : ''
    });
  };

  // Handlers for Modul 2: Rencana Kerja & Anggaran (RKT & RAB)
  const handleAddWorkPlan = () => {
    const newPlan: BumdesWorkPlan = {
      id: `wp-${Date.now()}`,
      programName: '',
      targetDescription: '',
      rabBudget: 0,
      realizationAmount: 0,
      status: 'Rencana',
      notes: ''
    };
    const updated = [...workPlans, newPlan];
    setWorkPlans(updated);
    autoSaveWithOverrides({ workPlans: updated });
  };

  const handleUpdateWorkPlanField = (planId: string, field: keyof BumdesWorkPlan, value: any) => {
    const updated = workPlans.map(wp => wp.id === planId ? { ...wp, [field]: value } : wp);
    setWorkPlans(updated);
  };

  const handleRemoveWorkPlan = (planId: string) => {
    const updated = workPlans.filter(wp => wp.id !== planId);
    setWorkPlans(updated);
    autoSaveWithOverrides({ workPlans: updated });
  };

  const handleSaveModule2 = async () => {
    await autoSaveWithOverrides({ workPlans, rktDocName, rktDocUrl, rabDocName, rabDocUrl });
  };

  // Handlers for Sub-Modul Inventaris & Pengamanan Aset Tetap
  const handleAddAssetItem = () => {
    const newItem: BumdesAssetItem = {
      id: `ast-${Date.now()}`,
      itemName: '',
      itemType: 'Peralatan/Mesin',
      acquisitionYear: new Date().getFullYear(),
      acquisitionValue: 0,
      condition: 'Baik',
      ownershipDoc: 'Sertifikat',
      locationNotes: ''
    };
    setAssetItems([...assetItems, newItem]);
  };

  const handleUpdateAssetField = (assetId: string, field: keyof BumdesAssetItem, value: any) => {
    setAssetItems(
      assetItems.map(ast => ast.id === assetId ? { ...ast, [field]: value } : ast)
    );
  };

  const handleRemoveAsset = (assetId: string) => {
    setAssetItems(assetItems.filter(ast => ast.id !== assetId));
  };

  // Add a dynamic unit usaha row
  const handleAddUnit = () => {
    const newUnit: BumdesUnit = {
      id: `unit-${Date.now()}`,
      name: '',
      status: 'Aktif Beroperasi',
      financialCondition: 'Impas',
      mainConstraint: 'Modal'
    };
    setUnits([...units, newUnit]);
  };

  // Update specific field inside unit usaha
  const handleUpdateUnitField = (unitId: string, field: keyof BumdesUnit, value: any) => {
    setUnits(
      units.map(u => u.id === unitId ? { ...u, [field]: value } : u)
    );
  };

  // Remove unit usaha row
  const handleRemoveUnit = (unitId: string) => {
    setUnits(units.filter(u => u.id !== unitId));
  };

  // Save changes to Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setErrorMessage('');

    try {
      // Validate inputs
      if (isOperatorDesa && !canEditVillageModules) {
        throw new Error('Anda tidak memiliki hak akses untuk menyunting data desa ini.');
      }

      const updatedReport: BumdesMonev = {
        id: `${selectedVillage}_${selectedYear}`,
        village: selectedVillage,
        year: selectedYear,
        lastUpdated: new Date().toISOString(),
        updatedBy: activeRole,
        bumdesName: bumdesName || undefined,
        establishedYear: establishedYear ? Number(establishedYear) : undefined,
        directorName: directorName || undefined,

        lawStatus,
        certificatePdfName,
        certificatePdfUrl,

        hasPerdesPendirian,
        perdesPdfName,
        perdesPdfUrl,

        hasAdArt,
        adArtPdfName,
        adArtPdfUrl,

        hasSkPengelola,
        skPengelolaPdfName,
        skPengelolaPdfUrl,

        musdesDate,
        musdesBaPdfName,
        musdesBaPdfUrl,
        musdesPhotoName: musdesPhotos.length > 0 ? `${musdesPhotos.length} Foto Musdes` : musdesPhotoName,
        musdesPhotoUrl: musdesPhotos[0] || musdesPhotoUrl,
        musdesPhotos,

        // RKT & RAB
        rktDocName,
        rktDocUrl,
        rabDocName,
        rabDocUrl,
        workPlans,

        // Financial & Assets
        capitalParticipationPrevYear,
        capitalParticipationCurrentYear,
        capitalParticipation: capitalParticipationPrevYear + capitalParticipationCurrentYear,

        totalAssetsPrevYear,
        totalAssetsCurrentYear,
        totalAssets: totalAssetsPrevYear + totalAssetsCurrentYear,

        totalRevenuePrevYear,
        totalRevenueCurrentYear,
        totalRevenue: totalRevenuePrevYear + totalRevenueCurrentYear,

        netProfitPrevYear,
        netProfitCurrentYear,
        netProfit: netProfitPrevYear + netProfitCurrentYear,

        padesContributionPrevYear,
        padesContributionCurrentYear,
        padesContribution: padesContributionPrevYear + padesContributionCurrentYear,
        assetItems,

        units,

        totalEmployees,
        localEmployees,
        assistedUmkm,

        // For Kecamatan Reviewer
        verificationNotes: isOperatorKecamatan ? verificationNotes : (activeReport?.verificationNotes || ''),
        healthScore: isOperatorKecamatan ? healthScore : (activeReport?.healthScore || 'Dasar/Perlu Perhatian'),
        followUpRecommendation: isOperatorKecamatan ? followUpRecommendation : (activeReport?.followUpRecommendation || ''),
        reviewedBy: isOperatorKecamatan ? 'Bpk. Siswanto (Kasi PMD)' : (activeReport?.reviewedBy || ''),
        reviewedAt: isOperatorKecamatan ? new Date().toISOString() : (activeReport?.reviewedAt || '')
      };

      await onUpdateBumdes(updatedReport);
      setSaveSuccess(true);
    } catch (err: any) {
      console.error("Failed saving BUMDes: ", err);
      setErrorMessage(err.message || 'Gagal menyimpan data BUMDes.');
    } finally {
      setIsSaving(false);
    }
  };

  // Rupiah currency formatter
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Helper for status badge styling
  const getHealthScoreColor = (score?: BumdesHealthScore) => {
    switch (score) {
      case 'Sehat/Berkembang':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Tumbuh':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Dasar/Perlu Perhatian':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Sakit/Mangkrak':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner Header */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-blue-400 font-mono text-xs uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              Evaluasi Kinerja & Pemberdayaan BUMDes
            </span>
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight mt-2 flex items-center gap-2">
              <Building2 className="w-7 h-7 text-blue-400" />
              Monev BUMDes (Badan Usaha Milik Desa)
            </h1>
            <p className="text-slate-350 text-xs md:text-sm max-w-2xl leading-relaxed">
              Modul monitoring dan pelaporan performa BUMDes terintegrasi. Mencakup verifikasi hukum, pelaporan keuangan, kinerja unit usaha dinamis, dampak pemberdayaan lokal, dan rekomendasi tim penilai Kecamatan.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-blue-950/50 border border-blue-500/30 px-3.5 py-2 rounded-xl text-blue-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Tahun Berjalan: {selectedYear}
          </div>
        </div>
      </div>

      {/* Target Village Selector and Core Information */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pilih Sasaran Desa:</span>
          {isOperatorDesa ? (
            <span className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-700 font-bold rounded-xl text-sm">
              Desa {selectedVillage} (Sesuai Akun Operator)
            </span>
          ) : (
            <div className="flex gap-2">
              {(['Bangun Mulya', 'Sesulu', 'Api-api'] as Village[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setSelectedVillage(v)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    selectedVillage === v
                      ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Desa {v}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tahun Laporan:</span>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="text-xs font-bold text-blue-700 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-100 cursor-pointer"
            >
              {[2024, 2025, 2026, 2027, 2028].map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>
          
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            Cetak Laporan
          </button>
        </div>
      </div>

      {/* Profil BUMDes Info Bar (if available) */}
      {activeReport?.bumdesName && (
        <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex flex-wrap items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-lg text-white">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] text-blue-500 font-extrabold uppercase tracking-wider block">Identitas BUMDes Terdaftar</span>
              <h3 className="text-sm font-bold text-slate-900">{activeReport.bumdesName}</h3>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {activeReport.directorName && (
              <div>
                <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Direktur</span>
                <span className="text-xs font-bold text-slate-700">{activeReport.directorName}</span>
              </div>
            )}
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Tahun Pendirian</span>
              <span className="text-xs font-bold text-slate-700">{activeReport.establishedYear || '-'}</span>
            </div>
            <div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Desa Wilayah</span>
              <span className="text-xs font-bold text-slate-700">Desa {activeReport.village}</span>
            </div>
          </div>
        </div>
      )}

      {/* Status Warning & Visual Score Alert */}
      {activeReport?.healthScore && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`md:col-span-2 p-4 rounded-xl border flex gap-3 text-xs leading-relaxed ${getHealthScoreColor(activeReport.healthScore)}`}>
            <Award className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold block text-sm uppercase tracking-wide mb-1">
                Kesehatan BUMDes: {activeReport.healthScore}
              </span>
              <p className="font-medium text-slate-700">
                <strong>Catatan Tim Monev:</strong> {activeReport.verificationNotes || 'Belum ada verifikasi fisik lapangan dari Tim Kecamatan.'}
              </p>
              {activeReport.followUpRecommendation && (
                <p className="mt-2 text-slate-800 bg-white/45 p-2 rounded-lg border border-current/10">
                  <strong>Rekomendasi Tindak Lanjut:</strong> {activeReport.followUpRecommendation}
                </p>
              )}
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col justify-between">
            <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Status Sertifikasi Hukum</div>
            <div className="mt-1 flex items-center gap-2">
              <span className={`w-2.5 h-2.5 rounded-full ${
                lawStatus === 'Sudah Terbit' ? 'bg-emerald-500' : lawStatus === 'Proses Pendaftaran' ? 'bg-amber-500 animate-pulse' : 'bg-slate-400'
              }`}></span>
              <span className="text-lg font-extrabold text-slate-900">{lawStatus}</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              {certificatePdfName ? `Sertifikat: ${certificatePdfName}` : 'Belum mengunggah Berkas Hukum Kemenkumham.'}
            </p>
          </div>
        </div>
      )}

      {/* Form Workspace */}
      <form onSubmit={handleSave} className="space-y-6">

        {/* Compression Feedback Notification */}
        {compressionFeedback && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-xs text-emerald-800 shadow-xs animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="p-1.5 bg-emerald-600 rounded-lg text-white shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-emerald-950 block">
                  {compressionFeedback.percentage > 0 
                    ? `⚡ Kompresi File ${compressionFeedback.fileType || ''} Otomatis Berhasil!`
                    : `📄 Berkas ${compressionFeedback.fileType || ''} Berhasil Diunggah & Dioptimalkan`}
                </span>
                {compressionFeedback.percentage > 0 && (
                  <span className="bg-emerald-600 text-white font-bold text-[9px] px-2 py-0.5 rounded-full">
                    Hemat {compressionFeedback.percentage}%
                  </span>
                )}
              </div>
              <p className="font-medium text-emerald-700 mt-0.5">
                Berkas <strong className="font-bold text-slate-900">{compressionFeedback.fileName}</strong> telah diproses dan dioptimalkan secara otomatis untuk penghematan penyimpanan dan kestabilan sistem.
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 font-mono text-[10px] text-emerald-900 bg-white/80 px-3 py-1.5 rounded-lg border border-emerald-200/60 inline-flex">
                <span>Ukuran Asli: <strong className="font-bold">{compressionFeedback.originalSize}</strong></span>
                {compressionFeedback.percentage > 0 && (
                  <>
                    <span>➔</span>
                    <span>Hasil Kompresi: <strong className="font-bold text-emerald-700">{compressionFeedback.compressedSize}</strong></span>
                    <span>•</span>
                    <span>Hemat: <strong className="font-bold text-emerald-700">{compressionFeedback.percentage}%</strong></span>
                  </>
                )}
              </div>
            </div>
            <button 
              type="button" 
              onClick={() => setCompressionFeedback(null)} 
              className="text-emerald-500 hover:text-emerald-700 p-1 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        
        {/* Profil BUMDes */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              Profil BUMDes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola informasi dasar identitas Badan Usaha Milik Desa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Nama BUMDes <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!canEditVillageModules}
                value={bumdesName}
                onChange={(e) => setBumdesName(e.target.value)}
                placeholder="Contoh: BUMDes Maju Bersama"
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Tahun Pendirian <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                disabled={!canEditVillageModules}
                value={establishedYear}
                onChange={(e) => setEstablishedYear(e.target.value)}
                placeholder="Contoh: 2021"
                min="1945"
                max={new Date().getFullYear()}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Nama Direktur <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                disabled={!canEditVillageModules}
                value={directorName}
                onChange={(e) => setDirectorName(e.target.value)}
                placeholder="Contoh: Budi Santoso, S.E."
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Module 1: Dokumen Digital */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                1. Modul Dokumen Digital (Status & Legalitas)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Kelola legalitas formal BUMDes. Diunggah secara berkala di awal tahun atau saat terjadi perubahan struktur pengurus / regulasi.
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-[11px] font-bold">
              <Zap className="w-3.5 h-3.5 text-emerald-600 fill-emerald-600" />
              Kompresi Otomatis Aktif
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Hukum */}
            <div className="space-y-3 p-4 bg-slate-50/50 rounded-xl border border-slate-150">
              <label className="text-xs font-bold text-slate-700 block">
                Status Badan Hukum (Kemenkumham)
              </label>
              <select
                disabled={!canEditVillageModules}
                value={lawStatus}
                onChange={(e) => setLawStatus(e.target.value as BumdesLawStatus)}
                className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
              >
                <option value="Sudah Terbit">Sudah Terbit</option>
                <option value="Proses Pendaftaran">Proses Pendaftaran</option>
                <option value="Belum">Belum</option>
              </select>

              {lawStatus !== 'Belum' && (
                <div className="space-y-1.5 mt-2">
                  <label className="text-[11px] font-bold text-slate-500 block">
                    Upload PDF Sertifikat Kemenkumham
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    {canEditVillageModules ? (
                      <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none">
                        <Upload className="w-3.5 h-3.5" />
                        {uploadingStatus['cert'] ? 'Mengunggah...' : 'Pilih Berkas'}
                        <input
                          type="file"
                          accept=".pdf, image/*"
                          onChange={(e) => handleBumdesFileChange(e, setCertificatePdfName, setCertificatePdfUrl, 'cert')}
                          className="hidden"
                          disabled={uploadingStatus['cert']}
                        />
                      </label>
                    ) : null}
                    <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[180px]">
                      {certificatePdfName || 'Belum ada berkas'}
                    </span>
                    {certificatePdfUrl && (
                      <a
                        href={certificatePdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={certificatePdfName || 'Sertifikat_Kemenkumham'}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1 rounded-md text-[10px] shadow-2xs transition-colors"
                        title="Lihat / Unduh Sertifikat Kemenkumham"
                      >
                        <Download className="w-3 h-3" /> Unduh Dokumen
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Regulasi Desa */}
            <div className="space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-150">
              <span className="text-xs font-bold text-slate-700 block">Regulasi Desa & Landasan Operasional</span>
              
              <div className="space-y-3 text-xs">
                {/* Perdes Pendirian */}
                <div className="flex flex-col gap-1.5">
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      disabled={!canEditVillageModules}
                      type="checkbox"
                      checked={hasPerdesPendirian}
                      onChange={(e) => setHasPerdesPendirian(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-100"
                    />
                    Perdes Pendirian BUMDes
                  </label>
                  {hasPerdesPendirian && (
                    <div className="pl-6 flex flex-wrap items-center gap-2">
                      {canEditVillageModules && (
                        <label className="bg-slate-200 hover:bg-slate-250 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none">
                          <Upload className="w-3 h-3" /> {uploadingStatus['perdes'] ? 'Mengunggah...' : 'Unggah File'}
                          <input
                            type="file"
                            accept=".pdf, image/*"
                            onChange={(e) => handleBumdesFileChange(e, setPerdesPdfName, setPerdesPdfUrl, 'perdes')}
                            className="hidden"
                            disabled={uploadingStatus['perdes']}
                          />
                        </label>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                        {perdesPdfName || 'Belum ada file'}
                      </span>
                      {perdesPdfUrl && (
                        <a
                          href={perdesPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={perdesPdfName || 'Perdes_Pendirian_BUMDes'}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs transition-colors"
                          title="Lihat / Unduh Dokumen Perdes Pendirian"
                        >
                          <Download className="w-3 h-3" /> Unduh
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* AD/ART */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200/50">
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      disabled={!canEditVillageModules}
                      type="checkbox"
                      checked={hasAdArt}
                      onChange={(e) => setHasAdArt(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-100"
                    />
                    Dokumen AD / ART BUMDes
                  </label>
                  {hasAdArt && (
                    <div className="pl-6 flex flex-wrap items-center gap-2">
                      {canEditVillageModules && (
                        <label className="bg-slate-200 hover:bg-slate-250 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none">
                          <Upload className="w-3 h-3" /> {uploadingStatus['adart'] ? 'Mengunggah...' : 'Unggah File'}
                          <input
                            type="file"
                            accept=".pdf, image/*"
                            onChange={(e) => handleBumdesFileChange(e, setAdArtPdfName, setAdArtPdfUrl, 'adart')}
                            className="hidden"
                            disabled={uploadingStatus['adart']}
                          />
                        </label>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                        {adArtPdfName || 'Belum ada file'}
                      </span>
                      {adArtPdfUrl && (
                        <a
                          href={adArtPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={adArtPdfName || 'AD_ART_BUMDes'}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs transition-colors"
                          title="Lihat / Unduh Dokumen AD/ART"
                        >
                          <Download className="w-3 h-3" /> Unduh
                        </a>
                      )}
                    </div>
                  )}
                </div>

                {/* SK Pengelola */}
                <div className="flex flex-col gap-1.5 pt-1 border-t border-slate-200/50">
                  <label className="flex items-center gap-2 font-semibold text-slate-700">
                    <input
                      disabled={!canEditVillageModules}
                      type="checkbox"
                      checked={hasSkPengelola}
                      onChange={(e) => setHasSkPengelola(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-100"
                    />
                    SK Pengelola BUMDes Terbaru
                  </label>
                  {hasSkPengelola && (
                    <div className="pl-6 flex flex-wrap items-center gap-2">
                      {canEditVillageModules && (
                        <label className="bg-slate-200 hover:bg-slate-250 text-slate-700 px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none">
                          <Upload className="w-3 h-3" /> {uploadingStatus['sk'] ? 'Mengunggah...' : 'Unggah File'}
                          <input
                            type="file"
                            accept=".pdf, image/*"
                            onChange={(e) => handleBumdesFileChange(e, setSkPengelolaPdfName, setSkPengelolaPdfUrl, 'sk')}
                            className="hidden"
                            disabled={uploadingStatus['sk']}
                          />
                        </label>
                      )}
                      <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px]">
                        {skPengelolaPdfName || 'Belum ada file'}
                      </span>
                      {skPengelolaPdfUrl && (
                        <a
                          href={skPengelolaPdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={skPengelolaPdfName || 'SK_Pengelola_BUMDes'}
                          className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-0.5 rounded-md text-[10px] shadow-2xs transition-colors"
                          title="Lihat / Unduh SK Pengelola"
                        >
                          <Download className="w-3 h-3" /> Unduh
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Musdes LPJ Pelaksanaan */}
            <div className="md:col-span-2 space-y-4 p-4 bg-slate-50/50 rounded-xl border border-slate-150">
              <span className="text-xs font-bold text-slate-700 block">Laporan Musyawarah Desa (Musdes) LPJ Terakhir</span>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* Tanggal Musdes */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Tanggal Pelaksanaan Musdes LPJ</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      disabled={!canEditVillageModules}
                      type="date"
                      value={musdesDate}
                      onChange={(e) => setMusdesDate(e.target.value)}
                      className="w-full bg-white border border-slate-250 rounded-lg pl-9 pr-3 py-2 text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                    />
                  </div>
                </div>

                 {/* Upload Berita Acara (BA) */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-600">Unggah BA Musdes LPJ (PDF/Gambar)</label>
                  <div className="flex flex-wrap items-center gap-2">
                    {canEditVillageModules && (
                      <label className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer select-none whitespace-nowrap">
                        <Upload className="w-3.5 h-3.5" /> {uploadingStatus['musdes_ba'] ? 'Mengunggah...' : 'Pilih BA'}
                        <input
                          type="file"
                          accept=".pdf, image/*"
                          onChange={(e) => handleBumdesFileChange(e, setMusdesBaPdfName, setMusdesBaPdfUrl, 'musdes_ba')}
                          className="hidden"
                          disabled={uploadingStatus['musdes_ba']}
                        />
                      </label>
                    )}
                    <span className="text-[10px] text-slate-500 truncate max-w-[120px] font-semibold">
                      {musdesBaPdfName || 'Belum ada BA'}
                    </span>
                    {musdesBaPdfUrl && (
                      <a
                        href={musdesBaPdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        download={musdesBaPdfName || 'Berita_Acara_Musdes'}
                        className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 py-1 rounded-md text-[10px] shadow-2xs transition-colors"
                        title="Lihat / Unduh Berita Acara Musdes"
                      >
                        <Download className="w-3 h-3" /> Unduh BA
                      </a>
                    )}
                  </div>
                </div>

                 {/* Upload Multi-Foto Kegiatan Musdes (Maks 2 Foto) */}
                <div className="space-y-1.5 md:col-span-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                      <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                      Foto Kegiatan Musdes (Maks. 2 Foto)
                    </label>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      {musdesPhotos.length} / 2 Foto
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEditVillageModules && (
                      <label className={`bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-[10px] font-bold flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap transition-all shadow-xs ${
                        musdesPhotos.length >= 2 || uploadingStatus['musdes_photos_batch'] ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
                      }`}>
                        <Upload className="w-3.5 h-3.5" /> 
                        {uploadingStatus['musdes_photos_batch'] ? 'Mengompres & Mengunggah...' : 'Pilih Foto (Bisa Sekaligus)'}
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleMultipleMusdesPhotosChange}
                          className="hidden"
                          disabled={musdesPhotos.length >= 2 || uploadingStatus['musdes_photos_batch']}
                        />
                      </label>
                    )}
                    {musdesPhotos.length === 0 && (
                      <span className="text-[10px] text-slate-400 font-medium italic">
                        Belum ada foto terunggah
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* Musdes Multi-Photo Gallery & Previews */}
              {musdesPhotos.length > 0 && (
                <div className="mt-3 p-3 bg-white border border-slate-200/80 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-emerald-600" />
                      Galeri Dokumentasi Foto Musdes Terkompres ({musdesPhotos.length} Foto):
                    </p>
                    {canEditVillageModules && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Hapus seluruh foto kegiatan Musdes?')) {
                            setMusdesPhotos([]);
                            setMusdesPhotoUrl('');
                            setMusdesPhotoName('');
                          }
                        }}
                        className="text-[10px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Trash2 className="w-3 h-3" /> Hapus Semua Foto
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {musdesPhotos.map((photoUrl, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-900 aspect-4/3 shadow-2xs">
                        <img
                          src={photoUrl}
                          alt={`Foto Musdes ${idx + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        <div className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white font-bold text-[9px] px-2 py-0.5 rounded-full backdrop-blur-xs border border-white/20">
                          #{idx + 1}
                        </div>
                        <a
                          href={photoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          download={`Foto_Musdes_${idx + 1}.jpg`}
                          className="absolute bottom-1.5 right-1.5 bg-emerald-600 hover:bg-emerald-500 text-white p-1 rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-md flex items-center justify-center"
                          title="Lihat / Unduh Foto Ukuran Penuh"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                        {canEditVillageModules && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMusdesPhoto(idx)}
                            className="absolute top-1.5 right-1.5 bg-rose-600 text-white p-1 rounded-full opacity-90 hover:opacity-100 hover:scale-110 transition-all cursor-pointer shadow-md"
                            title="Hapus foto ini"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Action Save Bar for Modul 1 */}
          {canEditVillageModules && (
            <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-500 font-medium italic">
                * Upload file & foto tersimpan otomatis ke Cloud Firestore saat diunggah
              </span>
              <button
                type="button"
                onClick={() => autoSaveWithOverrides()}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Modul 1 (Dokumen & Legalitas)'}
              </button>
            </div>
          )}
        </div>

        {/* Module 2: Modul Rencana Kerja & Anggaran (RKT & RAB) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                2. Modul Rencana Kerja & Anggaran (RKT & RAB)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Dokumen RKT & RAB hasil unggahan Desa yang disetujui Musdes, serta evaluasi target program kerja tahunan oleh Kecamatan.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => handleDownloadRktRabReport(selectedVillage, selectedYear, workPlans, rktDocName, rabDocName)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                title="Unduh rekapitulasi data Modul 2 RKT & RAB untuk Monev Kecamatan"
              >
                <Download className="w-3.5 h-3.5" />
                Unduh Rekap Monev Modul 2
              </button>

              <button
                type="button"
                onClick={handleDownloadRktRabTemplate}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-300"
                title="Unduh format / template Excel/CSV RKT & RAB"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                Format Template
              </button>

              {rktDocUrl && (
                <a
                  href={rktDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={rktDocName || `Dokumen_RKT_Desa_${selectedVillage}.pdf`}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  title="Unduh dokumen RKT yang diunggah oleh Desa"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh RKT Desa
                </a>
              )}
              {rabDocUrl && (
                <a
                  href={rabDocUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={rabDocName || `Dokumen_RAB_Desa_${selectedVillage}.pdf`}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer transition-colors shadow-xs"
                  title="Unduh dokumen RAB yang diunggah oleh Desa"
                >
                  <Download className="w-3.5 h-3.5" />
                  Unduh RAB Desa
                </a>
              )}

              {canEditVillageModules && (
                <button
                  type="button"
                  onClick={handleAddWorkPlan}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-3.5 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Target Program / RKT
                </button>
              )}
            </div>
          </div>

          {/* Berkas RKT & RAB Upload Section with Automatic Compression Notice */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-slate-50/70 rounded-xl border border-slate-200">
            {/* Dokumen RKT */}
            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>1. Dokumen Rencana Kerja Tahunan (RKT)</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> Kompresi Otomatis
                </span>
              </label>
              <p className="text-[10px] text-slate-500">
                PDF unggahan Desa akan dikompresi otomatis agar ukuran hemat memori & cepat disimpan ke Cloud.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {canEditVillageModules && (
                  <label className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingStatus['rkt_doc'] ? 'Mengompresi & Mengunggah...' : 'Unggah RKT'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleBumdesFileChange(e, setRktDocName, setRktDocUrl, 'rkt_doc')}
                      className="hidden"
                      disabled={uploadingStatus['rkt_doc']}
                    />
                  </label>
                )}
                <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                  {rktDocName ? `📄 ${rktDocName}` : 'Belum diunggah oleh desa'}
                </span>
                {rktDocUrl ? (
                  <a
                    href={rktDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={rktDocName || `Dokumen_RKT_Desa_${selectedVillage}.pdf`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition-colors"
                    title="Unduh Dokumen RKT Hasil Unggahan Desa"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh RKT Unggahan Desa
                  </a>
                ) : (
                  <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
                    ⚠️ Belum diunggah oleh Desa
                  </span>
                )}
              </div>
            </div>

            {/* Dokumen RAB */}
            <div className="space-y-2 p-3 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>2. Dokumen Rencana Anggaran Biaya (RAB)</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono font-medium flex items-center gap-1">
                  <Zap className="w-3 h-3 text-emerald-600" /> Kompresi Otomatis
                </span>
              </label>
              <p className="text-[10px] text-slate-500">
                PDF unggahan Desa akan dikompresi otomatis agar ukuran hemat memori & cepat disimpan ke Cloud.
              </p>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {canEditVillageModules && (
                  <label className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer select-none">
                    <Upload className="w-3.5 h-3.5" />
                    {uploadingStatus['rab_doc'] ? 'Mengompresi & Mengunggah...' : 'Unggah RAB'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                      onChange={(e) => handleBumdesFileChange(e, setRabDocName, setRabDocUrl, 'rab_doc')}
                      className="hidden"
                      disabled={uploadingStatus['rab_doc']}
                    />
                  </label>
                )}
                <span className="text-xs font-medium text-slate-600 truncate max-w-[200px]">
                  {rabDocName ? `📄 ${rabDocName}` : 'Belum diunggah oleh desa'}
                </span>
                {rabDocUrl ? (
                  <a
                    href={rabDocUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={rabDocName || `Dokumen_RAB_Desa_${selectedVillage}.pdf`}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-2xs transition-colors"
                    title="Unduh Dokumen RAB Hasil Unggahan Desa"
                  >
                    <Download className="w-3.5 h-3.5" /> Unduh RAB Unggahan Desa
                  </a>
                ) : (
                  <span className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-md font-medium">
                    ⚠️ Belum diunggah oleh Desa
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Table Target Program Kerja & RAB */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                Tabel Rincian Target Program & Anggaran RAB Tahun {selectedYear}
              </h3>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadRktRabReport(selectedVillage, selectedYear, workPlans, rktDocName, rabDocName)}
                  className="inline-flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold border border-indigo-200 px-2.5 py-1 rounded-lg text-[11px] transition-colors cursor-pointer"
                  title="Unduh tabel data program kerja ke format rekapitulasi"
                >
                  <Download className="w-3 h-3" /> Unduh Data Program
                </button>
                <span className="text-[11px] font-bold text-indigo-900 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full">
                  {workPlans.length} Program Kerja Terdaftar
                </span>
              </div>
            </div>

            {workPlans.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-250 rounded-xl space-y-2">
                <FileSpreadsheet className="w-8 h-8 text-slate-350 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Belum Ada Target Program / RKT Ditambahkan</p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Klik tombol &quot;Tambah Target Program / RKT&quot; di atas untuk memasukkan program kerja BUMDes beserta alokasi anggaran RAB.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-3 w-1/4">Nama Program / Kegiatan</th>
                      <th className="p-3 w-1/4">Target Output / Sasaran</th>
                      <th className="p-3 w-1/6 text-right">Anggaran RAB (Rp)</th>
                      <th className="p-3 w-1/6 text-right">Realisasi (Rp)</th>
                      <th className="p-3 w-1/6 text-center">Status Kinerja</th>
                      {canEditVillageModules && <th className="p-3 w-12 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workPlans.map((plan) => (
                      <tr key={plan.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <input
                            type="text"
                            disabled={!canEditVillageModules}
                            value={plan.programName}
                            onChange={(e) => handleUpdateWorkPlanField(plan.id, 'programName', e.target.value)}
                            placeholder="Nama kegiatan RKT..."
                            className="w-full border border-slate-250 rounded-md px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="text"
                            disabled={!canEditVillageModules}
                            value={plan.targetDescription}
                            onChange={(e) => handleUpdateWorkPlanField(plan.id, 'targetDescription', e.target.value)}
                            placeholder="Target sasaran output..."
                            className="w-full border border-slate-250 rounded-md px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            disabled={!canEditVillageModules}
                            value={plan.rabBudget || ''}
                            onChange={(e) => handleUpdateWorkPlanField(plan.id, 'rabBudget', Math.max(0, parseInt(e.target.value) || 0))}
                            placeholder="0"
                            className="w-full text-right border border-slate-250 rounded-md px-2.5 py-1.5 font-semibold text-indigo-900 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 font-mono"
                          />
                          <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                            {formatRupiah(plan.rabBudget)}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            disabled={!canEditVillageModules}
                            value={plan.realizationAmount || ''}
                            onChange={(e) => handleUpdateWorkPlanField(plan.id, 'realizationAmount', Math.max(0, parseInt(e.target.value) || 0))}
                            placeholder="0"
                            className="w-full text-right border border-slate-250 rounded-md px-2.5 py-1.5 font-semibold text-emerald-900 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100 font-mono"
                          />
                          <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                            {formatRupiah(plan.realizationAmount)}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <select
                            disabled={!canEditVillageModules}
                            value={plan.status}
                            onChange={(e) => handleUpdateWorkPlanField(plan.id, 'status', e.target.value as BumdesWorkPlanStatus)}
                            className="w-full border border-slate-250 rounded-md px-2 py-1.5 font-bold text-center text-xs focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-100"
                          >
                            <option value="Rencana">Rencana</option>
                            <option value="Berjalan">Berjalan</option>
                            <option value="Tercapai">Tercapai</option>
                            <option value="Tidak Tercapai">Tidak Tercapai</option>
                          </select>
                        </td>
                        {canEditVillageModules && (
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveWorkPlan(plan.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Program"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Summary & Monev Evaluation Insight */}
            {workPlans.length > 0 && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">Total Anggaran RAB Disetujui</span>
                  <strong className="text-sm font-extrabold text-indigo-950 font-mono">
                    {formatRupiah(workPlans.reduce((sum, p) => sum + (p.rabBudget || 0), 0))}
                  </strong>
                </div>
                <div className="border-y md:border-y-0 md:border-x border-indigo-200/60 py-2 md:py-0 md:px-4">
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">Total Realisasi Anggaran</span>
                  <strong className="text-sm font-extrabold text-emerald-800 font-mono">
                    {formatRupiah(workPlans.reduce((sum, p) => sum + (p.realizationAmount || 0), 0))}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block text-[10px] uppercase">Persentase Capaian Program</span>
                  <strong className="text-sm font-extrabold text-blue-900">
                    {workPlans.filter(p => p.status === 'Tercapai').length} dari {workPlans.length} Program Tercapai ({Math.round((workPlans.filter(p => p.status === 'Tercapai').length / workPlans.length) * 100)}%)
                  </strong>
                </div>
              </div>
            )}

            {/* Action Save Bar for Modul 2 */}
            {canEditVillageModules && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={handleSaveModule2}
                  disabled={isSaving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Modul 2 (RKT & RAB)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Module 3: Keuangan Utama & Inventaris Aset Tetap */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              3. Modul Keuangan Utama & Inventaris Aset Tetap
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Input data finansial makro BUMDes dan rincian inventaris aset tetap fisik (barang bergerak/tidak bergerak) beserta kepemilikan dokumen hukum.
            </p>
          </div>

          {/* 3.1 Finansial Makro */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-600" />
                3.1 Parameter Neraca & Finansial Makro
              </h3>
              <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
                Perbandingan Tahun {selectedYear - 1} vs {selectedYear} & Accumulation
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-200 font-extrabold text-slate-800">
                    <th className="p-3 w-2/5">Parameter Neraca / Keuangan</th>
                    <th className="p-3 text-right w-1/5">s.d. Tahun Sebelum ({selectedYear - 1})</th>
                    <th className="p-3 text-right w-1/5">Tahun Berjalan ({selectedYear})</th>
                    <th className="p-3 text-right w-1/5 bg-slate-200/60 font-black text-slate-900">Total Terjumlah (Akumulasi)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {/* Row 1: Modal Desa */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>Penyertaan Modal Desa</div>
                      <span className="text-[10px] text-slate-400 font-normal block">Total modal disetor dari APBDes</span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={capitalParticipationPrevYear || ''}
                          onChange={(e) => setCapitalParticipationPrevYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(capitalParticipationPrevYear)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={capitalParticipationCurrentYear || ''}
                          onChange={(e) => setCapitalParticipationCurrentYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 font-bold text-slate-900"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(capitalParticipationCurrentYear)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold font-mono text-slate-900 bg-slate-50/80">
                      <div className="text-sm text-slate-950 font-black">
                        {formatRupiah(capitalParticipationPrevYear + capitalParticipationCurrentYear)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium uppercase block">Accumulated Total</span>
                    </td>
                  </tr>

                  {/* Row 2: Total Aset */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>Total Aset (Lancar & Tetap)</div>
                      <span className="text-[10px] text-slate-400 font-normal block">Kas, tanah, gedung, peralatan & kendaraan</span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={totalAssetsPrevYear || ''}
                          onChange={(e) => setTotalAssetsPrevYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(totalAssetsPrevYear)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={totalAssetsCurrentYear || ''}
                          onChange={(e) => setTotalAssetsCurrentYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 font-bold text-slate-900"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(totalAssetsCurrentYear)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold font-mono text-slate-900 bg-slate-50/80">
                      <div className="text-sm text-slate-950 font-black">
                        {formatRupiah(totalAssetsPrevYear + totalAssetsCurrentYear)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium uppercase block">Accumulated Total</span>
                    </td>
                  </tr>

                  {/* Row 3: Total Pendapatan / Omset */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>Total Pendapatan (Omset)</div>
                      <span className="text-[10px] text-slate-400 font-normal block">Pendapatan kotor seluruh unit usaha</span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={totalRevenuePrevYear || ''}
                          onChange={(e) => setTotalRevenuePrevYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(totalRevenuePrevYear)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={totalRevenueCurrentYear || ''}
                          onChange={(e) => setTotalRevenueCurrentYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 font-bold text-slate-900"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(totalRevenueCurrentYear)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold font-mono text-slate-900 bg-slate-50/80">
                      <div className="text-sm text-slate-950 font-black">
                        {formatRupiah(totalRevenuePrevYear + totalRevenueCurrentYear)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium uppercase block">Accumulated Total</span>
                    </td>
                  </tr>

                  {/* Row 4: Laba Bersih */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>Laba Bersih Operasional</div>
                      <span className="text-[10px] text-slate-400 font-normal block">Pendapatan bersih setelah beban operasional</span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={netProfitPrevYear || ''}
                          onChange={(e) => setNetProfitPrevYear(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 text-blue-900"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(netProfitPrevYear)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={netProfitCurrentYear || ''}
                          onChange={(e) => setNetProfitCurrentYear(parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 font-bold text-blue-950"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(netProfitCurrentYear)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold font-mono text-blue-950 bg-slate-50/80">
                      <div className="text-sm font-black text-blue-950">
                        {formatRupiah(netProfitPrevYear + netProfitCurrentYear)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium uppercase block">Accumulated Total</span>
                    </td>
                  </tr>

                  {/* Row 5: Bagi Hasil untuk PADes */}
                  <tr className="hover:bg-slate-50/70">
                    <td className="p-3 font-semibold text-slate-800">
                      <div>Bagi Hasil untuk PADes</div>
                      <span className="text-[10px] text-slate-400 font-normal block">Setoran bagian laba ke Rekening Kas Desa</span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={padesContributionPrevYear || ''}
                          onChange={(e) => setPadesContributionPrevYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 text-emerald-800"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(padesContributionPrevYear)}
                      </span>
                    </td>
                    <td className="p-2.5 text-right">
                      <div className="relative">
                        <span className="absolute left-2.5 top-1.5 text-[10px] font-bold text-slate-400 font-mono">Rp</span>
                        <input
                          disabled={!canEditVillageModules}
                          type="number"
                          value={padesContributionCurrentYear || ''}
                          onChange={(e) => setPadesContributionCurrentYear(Math.max(0, parseInt(e.target.value) || 0))}
                          placeholder="0"
                          className="w-full text-right pl-7 pr-2 py-1.5 border border-slate-250 rounded-md font-mono text-xs focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-100 font-bold text-emerald-950"
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                        {formatRupiah(padesContributionCurrentYear)}
                      </span>
                    </td>
                    <td className="p-3 text-right font-extrabold font-mono text-emerald-950 bg-slate-50/80">
                      <div className="text-sm font-black text-emerald-950">
                        {formatRupiah(padesContributionPrevYear + padesContributionCurrentYear)}
                      </div>
                      <span className="text-[9px] text-slate-400 font-medium uppercase block">Accumulated Total</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3.2 Sub-Modul Inventaris & Pengamanan Aset Tetap */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wide">
                  <Box className="w-4 h-4 text-amber-600" />
                  3.2 Sub-Modul Inventaris & Pengamanan Aset Tetap (Barang Bergerak & Tidak Bergerak)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Rincian tabel inventaris barang bergerak/tidak bergerak, peralatan, dan tanah/bangunan beserta status kondisi fisik (Baik/Rusak) dan pengamanan dokumen hukum.
                </p>
              </div>
              {canEditVillageModules && (
                <button
                  type="button"
                  onClick={handleAddAssetItem}
                  className="bg-amber-600 hover:bg-amber-500 text-white font-bold py-1.5 px-3 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs self-start"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Inventaris Aset
                </button>
              )}
            </div>

            {assetItems.length === 0 ? (
              <div className="p-6 text-center bg-amber-50/40 border border-dashed border-amber-200 rounded-xl space-y-1">
                <PackageCheck className="w-7 h-7 text-amber-500/70 mx-auto" />
                <p className="text-xs font-bold text-amber-900">Belum Ada Inventaris Aset Terdaftar</p>
                <p className="text-[11px] text-slate-500 max-w-md mx-auto">
                  Klik &quot;Tambah Inventaris Aset&quot; untuk memasukkan rincian barang bergerak/tidak bergerak, peralatan, dan status sertifikat/BPKB/BAST.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                      <th className="p-3 w-1/4">Nama Barang / Aset</th>
                      <th className="p-3 w-1/6">Kategori Aset</th>
                      <th className="p-3 w-20 text-center">Thn Perolehan</th>
                      <th className="p-3 w-1/6 text-right">Nilai Perolehan (Rp)</th>
                      <th className="p-3 w-28 text-center">Kondisi Fisik</th>
                      <th className="p-3 w-1/6">Dokumen Pengamanan</th>
                      {canEditVillageModules && <th className="p-3 w-12 text-center">Aksi</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {assetItems.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="p-2.5">
                          <input
                            type="text"
                            disabled={!canEditVillageModules}
                            value={item.itemName}
                            onChange={(e) => handleUpdateAssetField(item.id, 'itemName', e.target.value)}
                            placeholder="Nama barang / aset BUMDes..."
                            className="w-full border border-slate-250 rounded-md px-2.5 py-1.5 font-medium focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-2.5">
                          <select
                            disabled={!canEditVillageModules}
                            value={item.itemType}
                            onChange={(e) => handleUpdateAssetField(item.id, 'itemType', e.target.value as AssetItemType)}
                            className="w-full border border-slate-250 rounded-md px-2 py-1.5 font-semibold text-xs focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100"
                          >
                            <option value="Barang Bergerak">Barang Bergerak</option>
                            <option value="Barang Tidak Bergerak">Barang Tidak Bergerak</option>
                            <option value="Peralatan/Mesin">Peralatan/Mesin</option>
                            <option value="Bangunan/Tanah">Bangunan/Tanah</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            disabled={!canEditVillageModules}
                            value={item.acquisitionYear || ''}
                            onChange={(e) => handleUpdateAssetField(item.id, 'acquisitionYear', parseInt(e.target.value) || new Date().getFullYear())}
                            placeholder="2022"
                            className="w-full text-center border border-slate-250 rounded-md px-1.5 py-1.5 font-mono focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100"
                          />
                        </td>
                        <td className="p-2.5">
                          <input
                            type="number"
                            disabled={!canEditVillageModules}
                            value={item.acquisitionValue || ''}
                            onChange={(e) => handleUpdateAssetField(item.id, 'acquisitionValue', Math.max(0, parseInt(e.target.value) || 0))}
                            placeholder="0"
                            className="w-full text-right border border-slate-250 rounded-md px-2.5 py-1.5 font-semibold text-amber-950 focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100 font-mono"
                          />
                          <span className="text-[9px] text-slate-400 block text-right mt-0.5 font-mono">
                            {formatRupiah(item.acquisitionValue)}
                          </span>
                        </td>
                        <td className="p-2.5">
                          <select
                            disabled={!canEditVillageModules}
                            value={item.condition}
                            onChange={(e) => handleUpdateAssetField(item.id, 'condition', e.target.value as AssetCondition)}
                            className="w-full border border-slate-250 rounded-md px-2 py-1.5 font-bold text-center text-xs focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100"
                          >
                            <option value="Baik">Baik</option>
                            <option value="Rusak Ringan">Rusak Ringan</option>
                            <option value="Rusak Berat">Rusak Berat</option>
                          </select>
                        </td>
                        <td className="p-2.5">
                          <select
                            disabled={!canEditVillageModules}
                            value={item.ownershipDoc}
                            onChange={(e) => handleUpdateAssetField(item.id, 'ownershipDoc', e.target.value as AssetOwnershipDoc)}
                            className="w-full border border-slate-250 rounded-md px-2 py-1.5 font-semibold text-xs focus:ring-2 focus:ring-amber-100 disabled:bg-slate-100"
                          >
                            <option value="Sertifikat">Sertifikat</option>
                            <option value="BPKB/STNK">BPKB/STNK</option>
                            <option value="BAST">BAST</option>
                            <option value="Kuitansi/Nota">Kuitansi/Nota</option>
                            <option value="Surat Perjanjian/Hibah">Surat Perjanjian/Hibah</option>
                            <option value="Belum Ada">Belum Ada</option>
                          </select>
                        </td>
                        {canEditVillageModules && (
                          <td className="p-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => handleRemoveAsset(item.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Hapus Aset"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {assetItems.length > 0 && (
              <div className="p-3.5 bg-amber-50/60 rounded-xl border border-amber-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-amber-800 font-medium block text-[10px] uppercase">Total Nilai Perolehan Inventaris Aset Terdaftar</span>
                  <strong className="text-sm font-extrabold text-amber-950 font-mono">
                    {formatRupiah(assetItems.reduce((sum, item) => sum + (item.acquisitionValue || 0), 0))}
                  </strong>
                </div>
                <div className="text-right text-[11px] text-slate-600">
                  Status Kondisi Fisik: <span className="font-bold text-emerald-700">{assetItems.filter(i => i.condition === 'Baik').length} Baik</span> • <span className="font-bold text-amber-700">{assetItems.filter(i => i.condition === 'Rusak Ringan').length} Rusak Ringan</span> • <span className="font-bold text-rose-700">{assetItems.filter(i => i.condition === 'Rusak Berat').length} Rusak Berat</span>
                </div>
              </div>
            )}

            {/* Action Save Bar for Modul 3 */}
            {canEditVillageModules && (
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => autoSaveWithOverrides()}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Menyimpan...' : 'Simpan Modul 3 (Keuangan & Inventaris Aset)'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Module 4: Kinerja Unit Usaha */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Activity className="w-5 h-5 text-indigo-500" />
                4. Modul Kinerja Unit Usaha (Dinamis & Terperinci)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Tambahkan dan kelola unit-unit usaha yang dikelola oleh BUMDes. Sesuaikan status, performa finansial, dan kendala utama unit secara dinamis.
              </p>
            </div>
            {canEditVillageModules && (
              <button
                type="button"
                onClick={handleAddUnit}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-sm shadow-indigo-500/10 self-start"
              >
                <Plus className="w-4 h-4" />
                Tambah Unit Usaha
              </button>
            )}
          </div>

          {/* Units Table */}
          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-650 font-mono">
                  <th className="p-4 w-1/3">Nama Unit Usaha</th>
                  <th className="p-4">Status Unit</th>
                  <th className="p-4">Kondisi Finansial</th>
                  <th className="p-4">Kendala Utama</th>
                  {canEditVillageModules && <th className="p-4 text-center w-20">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={canEditVillageModules ? 5 : 4} className="p-8 text-center text-slate-400 font-medium">
                      Belum ada unit usaha terdaftar. {canEditVillageModules ? 'Silakan tambah unit usaha baru di atas.' : ''}
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/50">
                      
                      {/* Nama Unit */}
                      <td className="p-3">
                        <input
                          disabled={!canEditVillageModules}
                          type="text"
                          required
                          value={unit.name}
                          onChange={(e) => handleUpdateUnitField(unit.id, 'name', e.target.value)}
                          placeholder="Contoh: Unit Air Bersih Pamsimas, Kios Desa..."
                          className="w-full bg-white border border-slate-250 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-transparent disabled:border-transparent disabled:font-bold disabled:text-slate-900"
                        />
                      </td>

                      {/* Status Unit */}
                      <td className="p-3">
                        <select
                          disabled={!canEditVillageModules}
                          value={unit.status}
                          onChange={(e) => handleUpdateUnitField(unit.id, 'status', e.target.value as BumdesUnitStatus)}
                          className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-transparent disabled:border-transparent disabled:font-bold"
                        >
                          <option value="Aktif Beroperasi">Aktif Beroperasi</option>
                          <option value="Kurang Aktif">Kurang Aktif</option>
                          <option value="Berhenti/Pailit">Berhenti/Pailit</option>
                        </select>
                      </td>

                      {/* Kondisi Finansial */}
                      <td className="p-3">
                        <select
                          disabled={!canEditVillageModules}
                          value={unit.financialCondition}
                          onChange={(e) => handleUpdateUnitField(unit.id, 'financialCondition', e.target.value as BumdesUnitFinancial)}
                          className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-transparent disabled:border-transparent disabled:font-bold"
                        >
                          <option value="Untung">Untung</option>
                          <option value="Impas">Impas</option>
                          <option value="Rugi">Rugi</option>
                        </select>
                      </td>

                      {/* Kendala Utama */}
                      <td className="p-3">
                        <select
                          disabled={!canEditVillageModules}
                          value={unit.mainConstraint}
                          onChange={(e) => handleUpdateUnitField(unit.id, 'mainConstraint', e.target.value as BumdesUnitConstraint)}
                          className="w-full bg-white border border-slate-250 rounded-lg px-2 py-1.5 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-transparent disabled:border-transparent disabled:font-bold"
                        >
                          <option value="Modal">Modal / Pembiayaan</option>
                          <option value="SDM">SDM / Keterampilan</option>
                          <option value="Pasar">Pasar / Pemasaran</option>
                          <option value="Manajemen">Manajemen / Keuangan</option>
                        </select>
                      </td>

                      {/* Aksi Delete */}
                      {canEditVillageModules && (
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveUnit(unit.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Hapus Unit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Module 5: Dampak Sosial & Ketenagakerjaan */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-500" />
              5. Modul Dampak Sosial & Ketenagakerjaan (Pemberdayaan)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ukur manfaat sosial kehadiran BUMDes dalam penyerapan tenaga kerja lokal desa dan pembinaan UMKM / mitra lokal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Jumlah Pengelola/Karyawan Total */}
            <div className="space-y-1.5">
              <label htmlFor="input-employees" className="text-xs font-bold text-slate-700 block">
                Jumlah Pengelola / Karyawan Total
              </label>
              <div className="relative">
                <input
                  id="input-employees"
                  disabled={!canEditVillageModules}
                  type="number"
                  value={totalEmployees || ''}
                  onChange={(e) => setTotalEmployees(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full pr-12 pl-3 py-2 text-xs font-semibold rounded-lg border border-slate-250 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:bg-slate-100"
                />
                <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-slate-400">Orang</span>
              </div>
            </div>

            {/* Jumlah Karyawan dari Warga Lokal */}
            <div className="space-y-1.5">
              <label htmlFor="input-local" className="text-xs font-bold text-slate-700 block">
                Jumlah Karyawan Warga Lokal Desa
              </label>
              <div className="relative">
                <input
                  id="input-local"
                  disabled={!canEditVillageModules}
                  type="number"
                  value={localEmployees || ''}
                  onChange={(e) => setLocalEmployees(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full pr-12 pl-3 py-2 text-xs font-semibold rounded-lg border border-slate-250 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:bg-slate-100"
                />
                <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-slate-400">Orang</span>
              </div>
            </div>

            {/* Jumlah UMKM/Mitra Lokal */}
            <div className="space-y-1.5">
              <label htmlFor="input-umkm" className="text-xs font-bold text-slate-700 block">
                Jumlah UMKM / Mitra Lokal Dibina
              </label>
              <div className="relative">
                <input
                  id="input-umkm"
                  disabled={!canEditVillageModules}
                  type="number"
                  value={assistedUmkm || ''}
                  onChange={(e) => setAssistedUmkm(Math.max(0, parseInt(e.target.value) || 0))}
                  placeholder="0"
                  className="w-full pr-12 pl-3 py-2 text-xs font-semibold rounded-lg border border-slate-250 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden disabled:bg-slate-100"
                />
                <span className="absolute right-3.5 top-2.5 text-[10px] font-bold text-slate-400">Unit</span>
              </div>
            </div>

          </div>

          {/* Action Save Bar for Modul 4 */}
          {canEditVillageModules && (
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => autoSaveWithOverrides()}
                disabled={isSaving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Modul 4 (Kinerja Unit Usaha)'}
              </button>
            </div>
          )}
        </div>

        {/* Module 6: Catatan & Rekomendasi Tim Monev */}
        <div className="bg-slate-55 shadow-xs p-6 rounded-2xl border border-slate-200 space-y-6">
          <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-amber-500" />
                6. Modul Verifikasi & Rekomendasi Tim Monev (Kecamatan / Reviewer)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Bagian evaluasi verifikasi kelayakan fisik dan pengklasifikasian tingkat perkembangan kesehatan BUMDes. Hanya dapat diisi oleh perwakilan Kecamatan Waru / Pendamping Desa.
              </p>
            </div>
            {!canEditReviewerModule && (
              <span className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 uppercase font-mono border border-slate-300">
                <Lock className="w-3.5 h-3.5" /> Terkunci untuk Desa
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Hasil Verifikasi Fisik */}
            <div className="md:col-span-2 space-y-1.5">
              <label htmlFor="input-verif" className="text-xs font-bold text-slate-700 block">
                Hasil Verifikasi Fisik & Kesesuaian Laporan
              </label>
              <textarea
                id="input-verif"
                disabled={!canEditReviewerModule}
                rows={4}
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                placeholder="Tuliskan catatan hasil pemantauan lapangan langsung, kesesuaian administrasi, dan ketepatan tata laksana keuangan..."
                className="w-full bg-white border border-slate-250 rounded-lg p-3 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

            {/* Skor Kesehatan BUMDes */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  Klasifikasi Tingkat Kesehatan BUMDes
                </label>
                <select
                  disabled={!canEditReviewerModule}
                  value={healthScore}
                  onChange={(e) => setHealthScore(e.target.value as BumdesHealthScore)}
                  className="w-full bg-white border border-slate-250 rounded-lg px-3 py-2 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:cursor-not-allowed"
                >
                  <option value="Sehat/Berkembang">Sehat / Berkembang</option>
                  <option value="Tumbuh">Tumbuh</option>
                  <option value="Dasar/Perlu Perhatian">Dasar / Perlu Perhatian</option>
                  <option value="Sakit/Mangkrak">Sakit / Mangkrak</option>
                </select>
              </div>

              <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-1.5 text-[11px] leading-relaxed text-slate-500">
                <span className="font-extrabold text-slate-700 block uppercase font-mono">Pedoman Klasifikasi:</span>
                <p>● <strong>Sehat/Berkembang:</strong> Legalitas lengkap, unit menghasilkan laba bersih positif, ada kontribusi PADes, dan pengurus aktif.</p>
                <p>● <strong>Dasar/Perlu Perhatian:</strong> Legalitas pendaftaran, laba sangat kecil / impas, salah satu unit macet.</p>
                <p>● <strong>Sakit/Mangkrak:</strong> Unit pailit / berhenti total, administrasi tidak dilaporkan.</p>
              </div>
            </div>

            {/* Rekomendasi Tindak Lanjut */}
            <div className="md:col-span-3 space-y-1.5">
              <label htmlFor="input-recom" className="text-xs font-bold text-slate-700 block">
                Rekomendasi Tindak Lanjut Tim Pembina Kecamatan
              </label>
              <textarea
                id="input-recom"
                disabled={!canEditReviewerModule}
                rows={3}
                value={followUpRecommendation}
                onChange={(e) => setFollowUpRecommendation(e.target.value)}
                placeholder="Langkah taktis yang harus segera dilakukan pengurus BUMDes atau pemerintah desa..."
                className="w-full bg-white border border-slate-250 rounded-lg p-3 text-xs font-semibold focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600 disabled:cursor-not-allowed"
              />
            </div>

          </div>

          {/* Action Save Bar for Modul 6 Kecamatan */}
          {canEditReviewerModule && (
            <div className="pt-4 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => autoSaveWithOverrides()}
                disabled={isSaving}
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 px-5 rounded-xl text-xs flex items-center gap-2 shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Menyimpan...' : 'Simpan Evaluasi Pembinaan Kecamatan'}
              </button>
            </div>
          )}
        </div>

        {/* Sticky Floating Save Bar for quick access */}
        {(canEditVillageModules || canEditReviewerModule) && (
          <div className="sticky bottom-4 z-40 bg-slate-900/95 backdrop-blur-md text-white p-3.5 px-6 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-3 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div>
                <span className="text-xs font-extrabold text-slate-100 block">
                  Pembaruan Monev Desa {selectedVillage} ({selectedYear})
                </span>
                <p className="text-[10px] text-slate-350">
                  Data & file yang diunggah tersimpan otomatis. Gunakan tombol simpan di tiap modul atau tombol simpan utama.
                </p>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSaving}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 px-6 rounded-xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer whitespace-nowrap active:scale-95"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan Monev'}
            </button>
          </div>
        )}

        {/* Feedback Messages */}
        {saveSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in animate-pulse">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="font-bold block text-sm">Data Monev BUMDes Sukses Disimpan!</span>
              Data pemantauan kinerja BUMDes {selectedVillage} tahun {selectedYear} telah tersinkronisasi di server cloud.
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2.5 animate-fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <span className="font-bold block">Gagal Menyimpan:</span>
              {errorMessage}
            </div>
          </div>
        )}

        {/* Submit Actions */}
        {(canEditVillageModules || canEditReviewerModule) && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-8 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Pembaruan Monev BUMDes'}
            </button>
          </div>
        )}

        {/* Non-editable Public Alert */}
        {!canEditVillageModules && !canEditReviewerModule && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex gap-3 text-xs leading-relaxed text-amber-850">
            <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-amber-900 mb-0.5">Mode Pratinjau Terkunci (Hanya Lihat):</span>
              Anda sedang masuk sebagai <strong>{activeRole === 'PUBLIC' ? 'Tamu Publik' : activeRole}</strong>. Pengeditan laporan fisik/finansial hanya dapat dilakukan oleh operator resmi dari <strong>Desa {selectedVillage}</strong>, sedangkan rekomendasi pembinaan hanya dapat diisi oleh <strong>Kecamatan operator</strong>.
            </div>
          </div>
        )}

      </form>

      {/* Printable evaluation report modal */}
      <PrintBumdesMonevModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        report={activeReport}
        selectedVillage={selectedVillage}
        selectedYear={selectedYear}
      />
    </div>
  );
}
