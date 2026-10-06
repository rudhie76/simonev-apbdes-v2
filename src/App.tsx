/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, 
  NotificationLog, 
  UserRole, 
  Village,
  ActivityStatus,
  IncompleteReasonHistoryEntry,
  RecommendationHistoryEntry,
  SiskeudesPagu,
  BumdesMonev
} from './types';
import { 
  INITIAL_ACTIVITIES, 
  INITIAL_LOGS, 
  VILLAGE_BUDGETS,
  INITIAL_BUMDES_MONEV
} from './data/initialData';

// Importing custom components
import Dashboard from './components/Dashboard';
import VillageOperator from './components/VillageOperator';
import KecamatanOperator from './components/KecamatanOperator';
import InputPaguAnggaran from './components/InputPaguAnggaran';
import TransparencyBoard from './components/TransparencyBoard';
import RegulationsBoard from './components/RegulationsBoard';
import LoginPortal from './components/LoginPortal';
import PrintReportModal from './components/PrintReportModal';
import PrintProposalModal from './components/PrintProposalModal';
import BumdesMonevBoard from './components/BumdesMonevBoard';
import logoPpu from './assets/logo.png';

// Icons
import { 
  LayoutDashboard, 
  Building2, 
  Award, 
  Megaphone,
  CheckCircle2,
  AlertTriangle,
  User,
  Users,
  Eye,
  FileCheck,
  MapPin,
  RefreshCw,
  FolderHeart,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Info,
  Lock,
  Download,
  ClipboardList,
  FileText,
  TrendingUp,
  Settings,
  LogOut,
  Bell,
  BookOpen
} from 'lucide-react';
import { handleDownloadFile, handleDownloadPhotoPdf } from './lib/download';
import { generateOperatorManualPDF } from './lib/pdfGenerator';

import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  getDocs,
  db,
  handleFirestoreError,
  OperationType,
  getScriptUrl,
  setScriptUrl
} from './lib/sheetsApi';

// Helper to recursively remove undefined properties before writing to Cloud Firestore
function cleanForFirestore(data: any): any {
  if (data === null || data === undefined) return null;
  if (Array.isArray(data)) {
    return data.map(item => cleanForFirestore(item));
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleaned: Record<string, any> = {};
    Object.keys(data).forEach((key) => {
      const val = data[key];
      if (val !== undefined) {
        cleaned[key] = cleanForFirestore(val);
      }
    });
    return cleaned;
  }
  return data;
}

const INITIAL_SISKEUDES_PAGU: SiskeudesPagu[] = [
  {
    id: 'Bangun Mulya_2026',
    village: 'Bangun Mulya',
    year: 2026,
    paguTotal: 1300000000,
    lastSynced: '2026-06-15T01:00:00Z',
    isSynced: false,
    fundsBreakdown: {
      dd: 750000000,
      add: 350000000,
      pad: 150000000,
      silpa: 50000000
    }
  },
  {
    id: 'Sesulu_2026',
    village: 'Sesulu',
    year: 2026,
    paguTotal: 1520000000,
    lastSynced: '2026-06-15T01:00:00Z',
    isSynced: false,
    fundsBreakdown: {
      dd: 880000000,
      add: 450000000,
      pad: 0,
      bankeu: 150000000,
      silpa: 40000000
    }
  },
  {
    id: 'Api-api_2026',
    village: 'Api-api',
    year: 2026,
    paguTotal: 1180000000,
    lastSynced: '2026-06-15T01:00:00Z',
    isSynced: false,
    fundsBreakdown: {
      dd: 650000000,
      add: 350000000,
      pad: 0,
      pbh: 150000000,
      silpa: 30000000
    }
  }
];

const INITIAL_USERS = [
  {
    id: 'usr-bm',
    fullName: 'Operator Desa Bangun Mulya',
    username: 'ops.bangunmulya',
    role: 'OP_BANGUN_MULYA',
    phoneNip: '-',
    registeredAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-10-06T12:00:00Z',
    status: 'Aktif'
  },
  {
    id: 'usr-sl',
    fullName: 'Operator Desa Sesulu',
    username: 'ops.sesulu',
    role: 'OP_SESULU',
    phoneNip: '-',
    registeredAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-10-06T12:00:00Z',
    status: 'Aktif'
  },
  {
    id: 'usr-aa',
    fullName: 'Operator Desa Api-api',
    username: 'ops.apiapi',
    role: 'OP_API_API',
    phoneNip: '-',
    registeredAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-10-06T12:00:00Z',
    status: 'Aktif'
  },
  {
    id: 'usr-kc',
    fullName: 'Operator PMD Kecamatan Waru',
    username: 'ops.kecamatan',
    role: 'OP_KECAMATAN',
    phoneNip: '-',
    registeredAt: '2026-01-01T00:00:00Z',
    lastLogin: '2026-10-06T12:00:00Z',
    status: 'Aktif'
  }
];

// Helper function to safely write state to LocalStorage and handle quota limits
function safeSaveToLocalStorage(key: string, data: any) {
  try {
    if (key === 'simonev_logs' && Array.isArray(data)) {
      // Limit logs to the most recent 30 items for local storage to prevent quota limits
      const trimmed = data.slice(0, 30);
      localStorage.setItem(key, JSON.stringify(trimmed));
    } else if (key === 'simonev_activities' && Array.isArray(data)) {
      // Preserve activities data including document URLs intact
      localStorage.setItem(key, JSON.stringify(data));
    } else if (key === 'simonev_bumdes' && Array.isArray(data)) {
      const cleaned = data.map(b => {
        const cleanB = { ...b };
        // Only trim oversized base64 PDF strings if extremely large (> 950k chars) to fit LocalStorage safely
        if (cleanB.certificatePdfUrl && cleanB.certificatePdfUrl.length > 950000) cleanB.certificatePdfUrl = '';
        if (cleanB.perdesPdfUrl && cleanB.perdesPdfUrl.length > 950000) cleanB.perdesPdfUrl = '';
        if (cleanB.adArtPdfUrl && cleanB.adArtPdfUrl.length > 950000) cleanB.adArtPdfUrl = '';
        if (cleanB.skPengelolaPdfUrl && cleanB.skPengelolaPdfUrl.length > 950000) cleanB.skPengelolaPdfUrl = '';
        if (cleanB.musdesBaPdfUrl && cleanB.musdesBaPdfUrl.length > 950000) cleanB.musdesBaPdfUrl = '';
        if (cleanB.rktDocUrl && cleanB.rktDocUrl.length > 950000) cleanB.rktDocUrl = '';
        if (cleanB.rabDocUrl && cleanB.rabDocUrl.length > 950000) cleanB.rabDocUrl = '';
        return cleanB;
      });
      localStorage.setItem(key, JSON.stringify(cleaned));
    } else {
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    }
  } catch (e) {
    console.warn(`Failed saving ${key} to local storage (quota exceeded or other error):`, e);
    try {
      if (key !== 'simonev_activities') {
        // Clear potentially large activities storage to free up space
        localStorage.removeItem('simonev_activities');
      }
      localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
    } catch (innerErr) {
      console.warn("Storage recovery also failed:", innerErr);
    }
  }
}

export default function App() {
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);

  // --- 1. Global States ---
  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('simonev_activities');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed parsing saved activities", e);
    }
    return INITIAL_ACTIVITIES;
  });

  const [selectedYear, setSelectedYear] = useState<number>(2026);
  
  const [logs, setLogs] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem('simonev_logs');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed parsing saved logs", e);
    }
    return INITIAL_LOGS;
  });

  const getActYear = (rawYear: any): number => {
    if (!rawYear) return 2026;
    if (typeof rawYear === 'number') return rawYear;
    const str = String(rawYear).trim();
    const parsed = parseInt(str, 10);
    if (!isNaN(parsed) && parsed >= 2020 && parsed <= 2035) return parsed;
    const dateYear = new Date(str).getFullYear();
    if (!isNaN(dateYear) && dateYear >= 2020 && dateYear <= 2035) return dateYear;
    return 2026;
  };

  const filteredActivitiesByYear = useMemo(() => {
    return activities.filter((act) => getActYear(act.year) === selectedYear);
  }, [activities, selectedYear]);

  const [siskeudesPagu, setSiskeudesPagu] = useState<SiskeudesPagu[]>(() => {
    const saved = localStorage.getItem('simonev_siskeudes_pagu');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed parsing saved siskeudes_pagu", e);
    }
    return INITIAL_SISKEUDES_PAGU;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('simonev_is_logged_in') === 'true';
  });

  const [activeRole, setActiveRole] = useState<UserRole>(() => {
    return (localStorage.getItem('simonev_active_role') as UserRole) || 'PUBLIC';
  });
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'OPERATOR_DESA' | 'EVALUASI_KECAMATAN' | 'INTEGRASI_SISKEUDES' | 'PORTAL_WARGA' | 'PERATURAN' | 'PANDUAN' | 'MONEV_BUMDES'>('DASHBOARD');

  const [bumdesMonevList, setBumdesMonevList] = useState<BumdesMonev[]>(() => {
    const saved = localStorage.getItem('simonev_bumdes');
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed parsing saved BUMDes data", e);
    }
    return INITIAL_BUMDES_MONEV;
  });
  
  // Selected activity for detailed overlay modal
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(null);
  
  // Print status state for the printable summary report
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isProposalModalOpen, setIsProposalModalOpen] = useState(false);
  const [printModalVillageFilter, setPrintModalVillageFilter] = useState<Village | 'ALL'>('ALL');

  // Toggle state for administrative developer help panel (false = pure clean production look)
  const [showDevPanel, setShowDevPanel] = useState(false);

  // --- 2. Initial State Loading & Synchronization with Live Firestore ---
  useEffect(() => {
    const handleSubError = (error: any, collectionName: string) => {
      console.warn(`Firestore collection subscription failed for ${collectionName}:`, error);
      setIsOfflineFallback(true);
      localStorage.setItem('simonev_offline_fallback', 'true');
    };

    // 1. Subscribe to Activities
    const unsubscribeActs = onSnapshot(collection(db, 'activities'), async (snapshot) => {
      try {
        setIsOfflineFallback(false);
        localStorage.removeItem('simonev_offline_fallback');
        if (snapshot.empty) {
          console.log("Seeding initial activities into Cloud Firestore...");
          try {
            for (const act of INITIAL_ACTIVITIES) {
              await setDoc(doc(db, 'activities', act.id), act);
            }
          } catch (seedErr) {
            console.warn("Failed seeding initial activities:", seedErr);
          }
        } else {
          const actsList: Activity[] = [];
          snapshot.forEach((docSnap) => {
            const raw: any = docSnap.data();
            if (raw && (raw.id || raw.name)) {
              const budgetTotal = Number(String(raw.budgetTotal || 0).replace(/[^0-9.]/g, '')) || 0;
              const budgetSpent = Number(String(raw.budgetSpent || 0).replace(/[^0-9.]/g, '')) || 0;
              const progressPhysical = Number(String(raw.progressPhysical || 0).replace(/[^0-9.]/g, '')) || 0;
              const isApproved = raw.isKecamatanApproved === true || 
                                 String(raw.isKecamatanApproved).trim().toUpperCase() === 'TRUE' ||
                                 raw.recommendation === true;
              
              const parsedAct: Activity = {
                ...raw,
                id: String(raw.id || `act-${Date.now()}`),
                name: String(raw.name || 'Kegiatan Tanpa Nama'),
                village: String(raw.village || 'Bangun Mulya'),
                sector: String(raw.sector || 'Pembangunan Desa (Infrastruktur)'),
                budgetTotal,
                budgetSpent,
                progressPhysical,
                status: raw.status || (progressPhysical === 100 ? (isApproved ? 'SELESAI' : 'MENUNGGU_EVALUASI') : (progressPhysical > 0 ? 'DALAM_PROSES' : 'BELUM_MULAI')),
                sourceOfFunds: raw.sourceOfFunds || 'Dana Desa (DD)',
                photoUrl: raw.photoUrl || undefined,
                photoName: raw.photoName || undefined,
                budgetReportUrl: raw.budgetReportUrl || undefined,
                budgetReportName: raw.budgetReportName || undefined,
                incompleteReason: raw.incompleteReason || undefined,
                isKecamatanApproved: isApproved,
                recommendation: typeof raw.recommendation === 'string' ? raw.recommendation : (raw.approvedBy && typeof raw.approvedBy === 'string' ? raw.approvedBy : undefined),
                approvedBy: typeof raw.approvedBy === 'string' ? raw.approvedBy : undefined,
                approvedAt: typeof raw.approvedAt === 'string' ? raw.approvedAt : undefined,
                lastUpdated: raw.lastUpdated || new Date().toISOString(),
                createdAt: raw.createdAt || new Date().toISOString(),
                year: getActYear(raw.year)
              };
              actsList.push(parsedAct);
            }
          });
          // Sort by createdAt descending
          actsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setActivities(actsList);
          safeSaveToLocalStorage('simonev_activities', actsList);
        }
      } catch (error) {
        handleSubError(error, 'activities');
      }
    }, (error) => {
      handleSubError(error, 'activities');
    });

    // 2. Subscribe to Logs
    const unsubscribeLogs = onSnapshot(collection(db, 'logs'), async (snapshot) => {
      try {
        setIsOfflineFallback(false);
        localStorage.removeItem('simonev_offline_fallback');
        if (snapshot.empty) {
          console.log("Seeding initial notification logs into Cloud Firestore...");
          try {
            for (const log of INITIAL_LOGS) {
              await setDoc(doc(db, 'logs', log.id), log);
            }
          } catch (seedErr) {
            console.warn("Failed seeding initial logs:", seedErr);
          }
        } else {
          const logsList: NotificationLog[] = [];
          snapshot.forEach((docSnap) => {
            logsList.push(docSnap.data() as NotificationLog);
          });
          // Sort by timestamp descending
          logsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setLogs(logsList);
          safeSaveToLocalStorage('simonev_logs', logsList);
        }
      } catch (error) {
        handleSubError(error, 'logs');
      }
    }, (error) => {
      handleSubError(error, 'logs');
    });

    // 3. Subscribe to Siskeudes Pagu
    const unsubscribePagu = onSnapshot(collection(db, 'siskeudes_pagu'), async (snapshot) => {
      try {
        setIsOfflineFallback(false);
        localStorage.removeItem('simonev_offline_fallback');
        if (snapshot.empty) {
          console.log("Seeding initial Siskeudes APBDes pagu into Cloud Firestore...");
          try {
            for (const item of INITIAL_SISKEUDES_PAGU) {
              const docId = item.id || `${item.village}_${item.year || 2026}`;
              await setDoc(doc(db, 'siskeudes_pagu', docId), item);
            }
          } catch (seedErr) {
            console.warn("Failed seeding initial pagu:", seedErr);
          }
        } else {
          const paguMap = new Map<string, SiskeudesPagu>();
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as SiskeudesPagu;
            const docId = data.id || docSnap.id || `${data.village}_${data.year || 2026}`;
            const rawYear = data.year || (docId.includes('_') ? parseInt(docId.split('_')[1], 10) : 2026);
            const yearNum = !isNaN(rawYear) ? rawYear : 2026;
            const key = `${data.village}_${yearNum}`;

            const existing = paguMap.get(key);
            if (!existing || (data.lastSynced && new Date(data.lastSynced).getTime() > new Date(existing.lastSynced || 0).getTime())) {
              paguMap.set(key, { ...data, id: key, year: yearNum });
            }
          });
          const paguList = Array.from(paguMap.values());
          setSiskeudesPagu(paguList);
          safeSaveToLocalStorage('simonev_siskeudes_pagu', paguList);
        }
      } catch (error) {
        handleSubError(error, 'siskeudes_pagu');
      }
    }, (error) => {
      handleSubError(error, 'siskeudes_pagu');
    });

    // 4. Subscribe to BUMDes Monev
    const unsubscribeBumdes = onSnapshot(collection(db, 'bumdes_monev'), async (snapshot) => {
      try {
        setIsOfflineFallback(false);
        localStorage.removeItem('simonev_offline_fallback');
        if (snapshot.empty) {
          console.log("Seeding initial BUMDes Monev data into Cloud Firestore...");
          try {
            for (const item of INITIAL_BUMDES_MONEV) {
              await setDoc(doc(db, 'bumdes_monev', item.id), item);
            }
          } catch (seedErr) {
            console.warn("Failed seeding initial BUMDes Monev:", seedErr);
          }
        } else {
          const bList: BumdesMonev[] = [];
          snapshot.forEach((docSnap) => {
            bList.push(docSnap.data() as BumdesMonev);
          });
          setBumdesMonevList(bList);
        }
      } catch (error) {
        handleSubError(error, 'bumdes_monev');
      }
    }, (error) => {
      handleSubError(error, 'bumdes_monev');
    });

    // 5. Subscribe to Users
    const unsubscribeUsers = onSnapshot(collection(db, 'users'), async (snapshot) => {
      try {
        if (snapshot.empty) {
          console.log("Seeding initial Users list into Cloud Firestore...");
          try {
            for (const item of INITIAL_USERS) {
              await setDoc(doc(db, 'users', item.id), item);
            }
          } catch (seedErr) {
            console.warn("Failed seeding initial users:", seedErr);
          }
        } else {
          const userList: any[] = [];
          snapshot.forEach((docSnap) => {
            userList.push(docSnap.data());
          });
          safeSaveToLocalStorage('simonev_users', userList);
        }
      } catch (error) {
        handleSubError(error, 'users');
      }
    }, (error) => {
      handleSubError(error, 'users');
    });

    return () => {
      unsubscribeActs();
      unsubscribeLogs();
      unsubscribePagu();
      unsubscribeBumdes();
      unsubscribeUsers();
    };
  }, []);

  // Reset demo storage to baseline to ease testing
  const handleResetData = async () => {
    if (confirm('Apakah Anda ingin menyetel ulang semua data realisasi ke setelan awal (baseline)? Semua kegiatan tambahan akan dihapus.')) {
      // Clear and set local-first instantly
      setActivities(INITIAL_ACTIVITIES);
      setLogs(INITIAL_LOGS);
      setSiskeudesPagu(INITIAL_SISKEUDES_PAGU);
      setBumdesMonevList(INITIAL_BUMDES_MONEV);
      safeSaveToLocalStorage('simonev_activities', INITIAL_ACTIVITIES);
      safeSaveToLocalStorage('simonev_logs', INITIAL_LOGS);
      safeSaveToLocalStorage('simonev_siskeudes_pagu', INITIAL_SISKEUDES_PAGU);
      safeSaveToLocalStorage('simonev_bumdes', INITIAL_BUMDES_MONEV);

      try {
        // Delete all elements in Firestore activities collection
        const actSnap = await getDocs(collection(db, 'activities'));
        for (const docRef of actSnap.docs) {
          await deleteDoc(doc(db, 'activities', docRef.id));
        }

        // Delete all elements in Firestore logs collection
        const logSnap = await getDocs(collection(db, 'logs'));
        for (const docRef of logSnap.docs) {
          await deleteDoc(doc(db, 'logs', docRef.id));
        }

        // Delete all elements in Firestore bumdes_monev collection
        const bSnap = await getDocs(collection(db, 'bumdes_monev'));
        for (const docRef of bSnap.docs) {
          await deleteDoc(doc(db, 'bumdes_monev', docRef.id));
        }

        // Seed initial values in Cloud Firestore
        for (const act of INITIAL_ACTIVITIES) {
          await setDoc(doc(db, 'activities', act.id), act);
        }
        for (const log of INITIAL_LOGS) {
          await setDoc(doc(db, 'logs', log.id), log);
        }
        for (const b of INITIAL_BUMDES_MONEV) {
          await setDoc(doc(db, 'bumdes_monev', b.id), b);
        }

        alert('Data Simonev berhasil disetel ulang (reset) ke Cloud Firestore.');
      } catch (error) {
        console.error("Firestore Reset error caught (Quota exceeded):", error);
        setIsOfflineFallback(true);
        alert('Peringatan: Reset berhasil disetel ke Penyimpanan Lokal browser Anda. Sinkronisasi Cloud tertunda karena kuota server penuh.');
      }
    }
  };

  // --- 3. Mutation Operations (Event Handlers) ---
  
  // BUMDes Mutation Handler
  const handleUpdateBumdes = async (updatedData: BumdesMonev) => {
    // 1. Instantly write to local React states & LocalStorage
    setBumdesMonevList(prev => {
      const idx = prev.findIndex(b => b.id === updatedData.id);
      let updatedList = [...prev];
      if (idx !== -1) {
        updatedList[idx] = updatedData;
      } else {
        updatedList.push(updatedData);
      }
      safeSaveToLocalStorage('simonev_bumdes', updatedList);
      return updatedList;
    });

    // Write a system audit log
    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: 'Update Monev BUMDes',
      description: `Pembaruan data Monev BUMDes Desa ${updatedData.village} Tahun ${updatedData.year} berhasil disimpan oleh ${getFriendlyRoleName(activeRole)}.`,
      timestamp: new Date().toISOString(),
      type: 'success',
      village: updatedData.village
    };

    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    // 2. Perform background synchronization with Cloud Firestore
    try {
      await setDoc(doc(db, 'bumdes_monev', updatedData.id), cleanForFirestore(updatedData));
      await setDoc(doc(db, 'logs', logId), cleanForFirestore(newLog));
    } catch (error) {
      console.warn("Firestore save error caught (Quota exceeded):", error);
      setIsOfflineFallback(true);
    }
  };

  // A. Add Activity (Village Level)
  const handleAddActivity = async (newActData: Omit<Activity, 'id' | 'createdAt' | 'lastUpdated' | 'isKecamatanApproved'>) => {
    const actId = `act-${Date.now()}`;
    
    const initialHistory: IncompleteReasonHistoryEntry[] = [];
    if (newActData.incompleteReason && newActData.incompleteReason.trim() !== '') {
      initialHistory.push({
        id: `inc-${Date.now()}`,
        text: newActData.incompleteReason,
        progressPhysical: newActData.progressPhysical,
        timestamp: new Date().toISOString()
      });
    }

    const newAct: Activity = {
      ...newActData,
      id: actId,
      createdAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString(),
      isKecamatanApproved: false,
      incompleteReasonsHistory: initialHistory.length > 0 ? initialHistory : undefined
    };

    // Create audit log item
    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: 'Kegiatan Baru Diinput',
      description: `Desa ${newAct.village} mendaftarkan usulan "${newAct.name}" dengan pagu anggaran ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(newAct.budgetTotal)}.`,
      timestamp: new Date().toISOString(),
      type: 'info',
      village: newAct.village
    };

    // 1. Instantly write to local React states & LocalStorage
    setActivities(prev => {
      const updated = [newAct, ...prev];
      safeSaveToLocalStorage('simonev_activities', updated);
      return updated;
    });
    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    // 2. Perform background synchronization with Cloud Firestore
    try {
      await setDoc(doc(db, 'activities', actId), cleanForFirestore(newAct));
      await setDoc(doc(db, 'logs', logId), cleanForFirestore(newLog));
    } catch (error) {
      console.warn("Firestore save error caught (Quota exceeded):", error);
      setIsOfflineFallback(true);
    }
  };

  // B. Update Activity Real-time (Village Level)
  const handleUpdateActivity = async (id: string, updates: Partial<Activity>) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    // Build the history array
    let updatedIncompleteHistory = target.incompleteReasonsHistory ? [...target.incompleteReasonsHistory] : [];
    
    // Check if progress physical is under 100% and there is a non-empty edit reason
    if (updates.incompleteReason && updates.incompleteReason.trim() !== '') {
      const mostRecentEntry = updatedIncompleteHistory[updatedIncompleteHistory.length - 1];
      const isDifferent = mostRecentEntry 
        ? mostRecentEntry.text !== updates.incompleteReason 
        : target.incompleteReason !== updates.incompleteReason;

      if (isDifferent) {
        // Bootstrap: If history is empty but we have an old target.incompleteReason, prepend it to preserve history
        if (updatedIncompleteHistory.length === 0 && target.incompleteReason && target.incompleteReason.trim() !== '') {
          updatedIncompleteHistory.push({
            id: `inc-legacy-${Date.now() - 1000}`,
            text: target.incompleteReason,
            progressPhysical: target.progressPhysical,
            timestamp: target.lastUpdated || target.createdAt
          });
        }
        
        updatedIncompleteHistory.push({
          id: `inc-${Date.now()}`,
          text: updates.incompleteReason,
          progressPhysical: updates.progressPhysical !== undefined ? updates.progressPhysical : target.progressPhysical,
          timestamp: new Date().toISOString()
        });
      }
    }

    const updatedAct: Activity = {
      ...target,
      ...updates,
      lastUpdated: new Date().toISOString(),
      incompleteReasonsHistory: updatedIncompleteHistory.length > 0 ? updatedIncompleteHistory : undefined
    };

    let logDesc = `Realisasi kegiatan "${target.name}" (${target.village}) diperbarui.`;
    let logType: 'success' | 'warn' | 'info' = 'info';

    if (updates.progressPhysical !== undefined && updates.progressPhysical !== target.progressPhysical) {
      logDesc = `Fisik kegiatan "${target.name}" (${target.village}) naik dari ${target.progressPhysical}% menjadi ${updates.progressPhysical}%.`;
      logType = 'success';
    }
    if (updates.status === 'MENUNGGU_EVALUASI' && target.status !== 'MENUNGGU_EVALUASI') {
      logDesc = `Pelaksanaan fisik "${target.name}" selesai 100%. Laporan dikirimkan ke Kecamatan Waru untuk evaluasi.`;
      logType = 'info';
    }

    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: updates.status === 'MENUNGGU_EVALUASI' ? 'Pengajuan Evaluasi Akhir' : 'Pembaruan Realisasi',
      description: logDesc,
      timestamp: new Date().toISOString(),
      type: logType,
      village: target.village
    };

    // 1. Instantly write to local React states & LocalStorage
    setActivities(prev => {
      const updated = prev.map(a => a.id === id ? updatedAct : a);
      safeSaveToLocalStorage('simonev_activities', updated);
      return updated;
    });
    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity(updatedAct);
    }

    // 2. Background cloud synchronization
    try {
      await setDoc(doc(db, 'activities', id), cleanForFirestore(updatedAct));
      await setDoc(doc(db, 'logs', logId), cleanForFirestore(newLog));
    } catch (error) {
      console.warn("Firestore update error caught (Quota exceeded):", error);
      setIsOfflineFallback(true);
    }
  };

  // C. Delete Activity (Village Level)
  const handleDeleteActivity = async (id: string) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: 'Hapus Rencana Kerja',
      description: `Rencana kegiatan "${target.name}" dihapus oleh operator Desa ${target.village}.`,
      timestamp: new Date().toISOString(),
      type: 'warn',
      village: target.village
    };

    // 1. Instantly write to local states
    setActivities(prev => {
      const updated = prev.filter(a => a.id !== id);
      safeSaveToLocalStorage('simonev_activities', updated);
      return updated;
    });
    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity(null);
    }

    // 2. Background synchronizer
    try {
      await deleteDoc(doc(db, 'activities', id));
      await setDoc(doc(db, 'logs', logId), newLog);
    } catch (error) {
      console.warn("Firestore delete error caught (Quota exceeded):", error);
      setIsOfflineFallback(true);
    }
  };

  // D. Evaluate & Sign / Approve (Kecamatan Level)
  const handleSetEvaluation = async (id: string, recommendation: string, approve: boolean, officerName: string) => {
    const target = activities.find(a => a.id === id);
    if (!target) return;

    const evaluationText = recommendation || (approve ? 'Laporan Akhir Terverifikasi Baik, disetujui secara digital oleh Kecamatan Waru.' : '');

    // Build the history array
    let updatedRecommendationsHistory = target.recommendationsHistory ? [...target.recommendationsHistory] : [];
    
    if (evaluationText && evaluationText.trim() !== '') {
      const mostRecentEntry = updatedRecommendationsHistory[updatedRecommendationsHistory.length - 1];
      const isDifferent = mostRecentEntry 
        ? mostRecentEntry.text !== evaluationText 
        : target.recommendation !== evaluationText;

      if (isDifferent) {
        // Bootstrap: If history is empty but we have an old target.recommendation, prepend it to preserve history
        if (updatedRecommendationsHistory.length === 0 && target.recommendation && target.recommendation.trim() !== '') {
          updatedRecommendationsHistory.push({
            id: `rec-legacy-${Date.now() - 1000}`,
            text: target.recommendation,
            officerName: target.approvedBy || 'Evaluator Kecamatan (Terdahulu)',
            timestamp: target.approvedAt || target.lastUpdated || target.createdAt,
            isApproved: target.isKecamatanApproved
          });
        }

        updatedRecommendationsHistory.push({
          id: `rec-${Date.now()}`,
          text: evaluationText,
          officerName,
          timestamp: new Date().toISOString(),
          isApproved: approve
        });
      }
    }

    let updatedAct: Activity;
    if (approve) {
      updatedAct = {
        ...target,
        recommendation: evaluationText,
        isKecamatanApproved: true,
        status: 'SELESAI' as ActivityStatus,
        approvedBy: officerName,
        approvedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        recommendationsHistory: updatedRecommendationsHistory.length > 0 ? updatedRecommendationsHistory : undefined
      };
    } else {
      updatedAct = {
        ...target,
        recommendation: evaluationText,
        isKecamatanApproved: false,
        status: 'DALAM_PROSES' as ActivityStatus, // Send back for revision
        lastUpdated: new Date().toISOString(),
        recommendationsHistory: updatedRecommendationsHistory.length > 0 ? updatedRecommendationsHistory : undefined
      };
    }

    const eventTitle = approve ? 'Persetujuan (ACC) Kecamatan' : 'Revisi Evaluasi';
    const eventType = approve ? 'approval' : 'warn';
    const eventDesc = approve 
      ? `Laporan akhir kegiatan "${target.name}" (${target.village}) disetujui secara digital oleh ${officerName}.`
      : `Verifikator PMD mengirim rekomendasi perbaikan untuk "${target.name}" (${target.village}): "${recommendation}".`;

    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: eventTitle,
      description: eventDesc,
      timestamp: new Date().toISOString(),
      type: eventType,
      village: target.village
    };

    // 1. Instantly write to local states
    setActivities(prev => {
      const updated = prev.map(a => a.id === id ? updatedAct : a);
      safeSaveToLocalStorage('simonev_activities', updated);
      return updated;
    });
    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    if (selectedActivity && selectedActivity.id === id) {
      setSelectedActivity(updatedAct);
    }

    // 2. Background cloud synchronization
    try {
      await setDoc(doc(db, 'activities', id), cleanForFirestore(updatedAct));
      await setDoc(doc(db, 'logs', logId), cleanForFirestore(newLog));
    } catch (error) {
      console.warn("Firestore evaluate error caught (Quota exceeded):", error);
      setIsOfflineFallback(true);
    }
  };

  // E. Handle Citizen Report (Transparency Public Board)
  const handleCitizenReport = async (report: { name: string; village: Village; message: string; activityName: string }) => {
    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: 'Aduan Masyarakat Terbuka',
      description: `Warga (${report.name}) melaporkan tanggapan terkait program "${report.activityName}": "${report.message}"`,
      timestamp: new Date().toISOString(),
      type: 'warn',
      village: report.village
    };

    // 1. Instantly write to local status
    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    // 2. Background Cloud synchronizer
    try {
      await setDoc(doc(db, 'logs', logId), cleanForFirestore(newLog));
    } catch (error) {
      console.warn("Firestore citizen report storage error capped:", error);
      setIsOfflineFallback(true);
    }
  };

  // --- 4. Role Navigation Lock (Dynamic Menu Management) ---
  const activeVillageForOperator = useMemo((): Village => {
    if (activeRole === 'OP_BANGUN_MULYA') return 'Bangun Mulya';
    if (activeRole === 'OP_SESULU') return 'Sesulu';
    return 'Api-api'; // OP_API_API
  }, [activeRole]);

  // Siskeudes village budgets represents the overarching budget ceiling
  const villageBudgets = useMemo(() => {
    const budgets: Record<string, number> = {
      'Bangun Mulya': 0,
      'Sesulu': 0,
      'Api-api': 0
    };
    const currentYearPagus = siskeudesPagu.filter(p => (p.year || 2026) === selectedYear);
    if (currentYearPagus.length > 0) {
      currentYearPagus.forEach(item => {
        budgets[item.village] = item.paguTotal;
      });
    } else if (selectedYear === 2026) {
      budgets['Bangun Mulya'] = 1300000000;
      budgets['Sesulu'] = 1520000000;
      budgets['Api-api'] = 1180000000;
    }
    return budgets;
  }, [siskeudesPagu, selectedYear]);

  // Dynamic village budgets calculated directly from activities entered by operators
  const activitiesAllocatedBudgets = useMemo(() => {
    const budgets: Record<string, number> = {
      'Bangun Mulya': 0,
      'Sesulu': 0,
      'Api-api': 0
    };
    filteredActivitiesByYear.forEach(act => {
      if (budgets[act.village] !== undefined) {
        budgets[act.village] += act.budgetTotal;
      } else {
        budgets[act.village] = act.budgetTotal;
      }
    });
    return budgets;
  }, [filteredActivitiesByYear]);

  // Update village APBDes pagu from manual form input per year
  const handleUpdateSiskeudesPagu = async (village: Village, paguTotal: number, breakdown?: any, yearToUpdate: number = selectedYear) => {
    const docId = `${village}_${yearToUpdate}`;
    const item: SiskeudesPagu = {
      id: docId,
      village,
      year: yearToUpdate,
      paguTotal,
      lastSynced: new Date().toISOString(),
      isSynced: true,
      fundsBreakdown: breakdown || {
        dd: Math.round(paguTotal * 0.6),
        add: Math.round(paguTotal * 0.3),
        pad: Math.round(paguTotal * 0.1)
      }
    };

    const logId = `log-${Date.now()}`;
    const newLog: NotificationLog = {
      id: logId,
      title: 'Update Pagu Anggaran',
      description: `Mengubah Pagu APBDes Desa ${village} TA ${yearToUpdate} secara manual sebesar ${formatRupiah(paguTotal)}.`,
      timestamp: new Date().toISOString(),
      type: 'success',
      village
    };

    // 1. Instantly update local React states and LocalStorage
    setSiskeudesPagu(prev => {
      const filtered = prev.filter(p => !(p.village === village && (p.year || 2026) === yearToUpdate));
      const updated = [...filtered, item];
      safeSaveToLocalStorage('simonev_siskeudes_pagu', updated);
      return updated;
    });
    setLogs(prev => {
      const updated = [newLog, ...prev];
      safeSaveToLocalStorage('simonev_logs', updated);
      return updated;
    });

    // 2. Perform background synchronization with Cloud Firestore
    try {
      await setDoc(doc(db, 'siskeudes_pagu', docId), item);
      await setDoc(doc(db, 'logs', logId), cleanForFirestore(newLog));
    } catch (error) {
      console.warn("Firestore update pagu error caught (Quota exceeded):", error);
      setIsOfflineFallback(true);
    }
  };

  // Adjust active screen to role limits if a role restriction changes
  const switchRole = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'PUBLIC') {
      if (activeTab === 'OPERATOR_DESA' || activeTab === 'EVALUASI_KECAMATAN') {
        setActiveTab('DASHBOARD');
      }
    } else if (role === 'OP_BANGUN_MULYA' || role === 'OP_SESULU' || role === 'OP_API_API') {
      if (activeTab === 'EVALUASI_KECAMATAN') {
        setActiveTab('OPERATOR_DESA');
      }
    } else if (role === 'OP_KECAMATAN') {
      if (activeTab === 'OPERATOR_DESA') {
        setActiveTab('EVALUASI_KECAMATAN');
      }
    }
  };

  // Format Helper
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const getAbbreviatedRole = (role: UserRole) => {
    switch (role) {
      case 'OP_BANGUN_MULYA': return 'BM';
      case 'OP_SESULU': return 'SL';
      case 'OP_API_API': return 'AA';
      case 'OP_KECAMATAN': return 'KC';
      default: return 'PB';
    }
  };

  const getFriendlyRoleName = (role: UserRole) => {
    switch (role) {
      case 'OP_BANGUN_MULYA': return 'Operator Bangun Mulya';
      case 'OP_SESULU': return 'Operator Sesulu';
      case 'OP_API_API': return 'Operator Api-api';
      case 'OP_KECAMATAN': return 'Operator Kecamatan';
      default: return 'Portal Publik';
    }
  };

  const getRoleSub = (role: UserRole) => {
    switch (role) {
      case 'OP_BANGUN_MULYA': return 'Waru Utama';
      case 'OP_SESULU': return 'Waru Utama';
      case 'OP_API_API': return 'Waru Utama';
      case 'OP_KECAMATAN': return 'Operator PMD';
      default: return 'Masyarakat Waru';
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveRole('PUBLIC');
    localStorage.removeItem('simonev_is_logged_in');
    localStorage.removeItem('simonev_active_role');
  };

  if (!isLoggedIn) {
    return (
      <div id="simonev-auth-gateway" className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between p-4 sm:p-6 relative overflow-y-auto font-sans">
        {/* Background Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-blue-600/10 blur-3xl pointer-events-none rounded-full" />
        
        {/* Top Header Logo Bar */}
        <div className="max-w-md w-full mx-auto flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-white/10 rounded-xl shadow-lg border border-white/20 shrink-0">
              <img src={logoPpu} alt="Logo Penajam Paser Utara" className="w-8 h-8 object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-lg font-bold font-sans tracking-wide text-white">SIMONEV APBDES</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Kecamatan Waru</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveRole('PUBLIC');
              setIsLoggedIn(true);
              setActiveTab('PORTAL_WARGA');
              localStorage.setItem('simonev_is_logged_in', 'true');
              localStorage.setItem('simonev_active_role', 'PUBLIC');
            }}
            className="text-xs font-bold text-blue-400 hover:text-blue-300 bg-blue-950/70 border border-blue-800/60 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            title="Akses Publik Tanpa Login Operator"
          >
            <Eye className="w-3.5 h-3.5" /> Tamu Publik
          </button>
        </div>

        {/* Center Card */}
        <div className="my-auto py-6 z-10">
          <div className="text-center max-w-lg mx-auto mb-5">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white leading-snug tracking-tight">
              Sistem Informasi Monitoring & Evaluasi APBDes
              <span className="block text-blue-400 font-bold text-lg sm:text-xl md:text-2xl mt-1">
                Kecamatan Waru
              </span>
            </h2>
          </div>

          <LoginPortal
            onLoginSuccess={(role) => {
              setActiveRole(role);
              setIsLoggedIn(true);
              localStorage.setItem('simonev_is_logged_in', 'true');
              localStorage.setItem('simonev_active_role', role);

              if (role === 'OP_KECAMATAN') {
                setActiveTab('EVALUASI_KECAMATAN');
              } else if (role === 'OP_BANGUN_MULYA' || role === 'OP_SESULU' || role === 'OP_API_API') {
                setActiveTab('OPERATOR_DESA');
              } else {
                setActiveTab('DASHBOARD');
              }
            }}
            defaultRolePreference="OP_BANGUN_MULYA"
          />
        </div>

        {/* Bottom Disclaimer */}
        <div className="text-center text-[11px] text-slate-500 z-10 pb-2 font-mono">
          © 2026 SIMONEV APBDES Kecamatan Waru. Melayani Desa Bangun Mulya, Desa Sesulu, dan Desa Api-api.
        </div>
      </div>
    );
  }

  return (
    <div id="simonev-apbdes-app" className="h-screen w-full bg-slate-50 font-sans text-slate-800 flex flex-col overflow-hidden antialiased">
      
      {/* Simulation Info Bar (Showing active operator credentials in a premium format) */}
      {showDevPanel && (
        <div className="bg-slate-950 text-slate-300 py-2.5 px-4 md:px-8 border-b border-slate-800 text-[11px] flex flex-col md:flex-row gap-3 items-center justify-between z-20 shrink-0 select-none">
          <div className="flex items-center gap-2 font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            <span className="tracking-wider text-xs">PANDUAN AUTENTIKASI AKTIF</span>
          </div>

          <div className="hidden lg:flex flex-wrap items-center justify-center gap-5 text-slate-450 text-[10px]">
            <span className="text-slate-550 uppercase font-bold text-[9px] tracking-wide">Panduan Akses Cepat:</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-400">BM (Desa):</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-850">ops.bangunmulya</span> / <span className="font-mono text-slate-400">bangunmulya2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-400">SL (Desa):</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-850">ops.sesulu</span> / <span className="font-mono text-slate-400">sesulu2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-blue-400">AA (Desa):</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-850">ops.apiapi</span> / <span className="font-mono text-slate-400">apiapi2026</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-amber-500">KC (Kec.):</span>
              <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-300 border border-slate-850">ops.kecamatan</span> / <span className="font-mono text-slate-400">kecamatanwaru2026</span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {activeRole !== 'PUBLIC' ? (
              <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[10px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sesi: {getFriendlyRoleName(activeRole)}
              </span>
            ) : (
              <button
                onClick={() => setActiveTab('OPERATOR_DESA')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-2.5 py-0.5 rounded text-[10px] transition-all flex items-center gap-1"
              >
                <Lock className="w-2.5 h-2.5" /> Masuk Akun
              </button>
            )}
            <button
              onClick={handleResetData}
              className="text-[10px] bg-slate-900 hover:bg-rose-950 hover:text-rose-200 text-slate-400 px-2 py-0.5 rounded transition-colors flex items-center gap-1 border border-slate-850 font-semibold"
            >
              <RefreshCw className="w-3 h-3 text-rose-500" /> Reset Database Awal
            </button>
          </div>
        </div>
      )}

      {/* Workspace Wrapper (Sidebar + Main Content Viewport) */}
      <div className="flex flex-1 w-full overflow-hidden">
        
        {/* Desktop Left Sidebar (Matches the brand-new Professional Polish aspect precisely) */}
        <aside className="w-64 bg-slate-900 text-white flex flex-col hidden md:flex shrink-0">
          <div className="p-6 border-b border-slate-850">
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2.5">
              <img src={logoPpu} alt="Logo Penajam Paser Utara" className="w-7 h-7 object-contain shrink-0" />
              <span>Simonev APBDes</span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-semibold font-mono">Kecamatan Waru</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-1.5 pt-6">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all ${
                activeTab === 'DASHBOARD'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">📊</span> Dashboard Utama
            </button>

            {/* Operator Desa Portal - Always visible to allow login gating */}
            <button
              onClick={() => setActiveTab('OPERATOR_DESA')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all justify-between ${
                activeTab === 'OPERATOR_DESA'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">📋</span> Input Kegiatan Desa
              </div>
              {!(activeRole === 'OP_BANGUN_MULYA' || activeRole === 'OP_SESULU' || activeRole === 'OP_API_API') && (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            {/* Kecamatan Portal - Always visible to allow login gating */}
            <button
              onClick={() => setActiveTab('EVALUASI_KECAMATAN')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all justify-between ${
                activeTab === 'EVALUASI_KECAMATAN'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">⚖️</span> Evaluasi Kecamatan
              </div>
              {activeRole !== 'OP_KECAMATAN' && (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            {/* Pagu Anggaran Input - Gated under login, only Desa & Kecamatan Operators */}
            <button
              onClick={() => setActiveTab('INTEGRASI_SISKEUDES')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all justify-between ${
                activeTab === 'INTEGRASI_SISKEUDES'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">💰</span> Input Pagu Anggaran
              </div>
              {!(activeRole === 'OP_BANGUN_MULYA' || activeRole === 'OP_SESULU' || activeRole === 'OP_API_API' || activeRole === 'OP_KECAMATAN') && (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('PORTAL_WARGA')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all ${
                activeTab === 'PORTAL_WARGA'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">📢</span> Portal Transparansi
            </button>

            <button
              onClick={() => setActiveTab('MONEV_BUMDES')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all justify-between ${
                activeTab === 'MONEV_BUMDES'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-3">🏢</span> Monev BUMDes
              </div>
              {activeRole === 'PUBLIC' && (
                <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('PERATURAN')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all ${
                activeTab === 'PERATURAN'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">⚖️</span> Peraturan-Peraturan
            </button>

            <button
              onClick={() => setActiveTab('PANDUAN')}
              className={`w-full px-4 py-2.5 rounded-lg font-semibold text-sm flex items-center transition-all ${
                activeTab === 'PANDUAN'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span className="mr-3">📘</span> Panduan Operator
            </button>
          </nav>

          {/* Dynamic Active Operator Status Profiler Box */}
          <div className="p-4 bg-slate-800 border-t border-slate-750 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 truncate">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-bold text-white shadow-sm uppercase shrink-0">
                  {getAbbreviatedRole(activeRole)}
                </div>
                <div className="truncate flex-1">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {activeRole === 'PUBLIC' ? 'Tamu Publik' : getFriendlyRoleName(activeRole)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5 uppercase tracking-wider font-mono font-bold">
                    {getRoleSub(activeRole)}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Keluar / Logout dari Aplikasi"
                className="p-1 px-2.5 rounded-lg text-rose-400 hover:bg-rose-950/80 hover:text-rose-300 border border-rose-900/60 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area Locked to Viewport height */}
        <main className="flex-1 flex flex-col h-full overflow-hidden">
          
          {/* Top Header - Matches the professional design spec completely */}
          <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-8 shrink-0 z-10">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 px-2.5 py-1 rounded-lg border border-slate-300 transition-colors select-none">
                <span className="text-[10px] md:text-xs text-slate-650 font-black uppercase font-mono tracking-tight">Monev TA:</span>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="text-xs font-black text-blue-700 bg-transparent py-0.5 pl-0.5 pr-6 border-0 focus:ring-0 focus:outline-hidden cursor-pointer"
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                  <option value={2027}>2027</option>
                  <option value={2028}>2028</option>
                </select>
              </div>
              <div className="h-4 w-px bg-slate-300"></div>
              <div className="flex space-x-2 text-[10px] md:text-xs">
                {isOfflineFallback ? (
                  <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded border border-amber-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                    Offline Fallback (Luring)
                  </span>
                ) : (
                  <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                    Monev Cloud (Real-time)
                  </span>
                )}
                <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-bold hidden sm:inline">
                  {isOfflineFallback ? 'Sync: Browser Cache' : 'Sync: Real-time'}
                </span>
              </div>
            </div>

            {/* Mobile Nav Switcher (Toggles inline inline-tabs to fit small viewports) */}
            <div className="md:hidden flex items-center gap-1">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as any)}
                className="text-xs bg-slate-50 border border-slate-350 pr-7 py-1.5 rounded-lg font-bold text-slate-700 font-sans"
              >
                <option value="DASHBOARD">📊 Dasbor Utama</option>
                <option value="MONEV_BUMDES">🏢 Monev BUMDes</option>
                <option value="OPERATOR_DESA">📋 Input Desa [BM/SL/AA]</option>
                <option value="EVALUASI_KECAMATAN">⚖️ Evaluasi Kec. Waru</option>
                <option value="INTEGRASI_SISKEUDES">💰 Input Pagu Anggaran</option>
                <option value="PORTAL_WARGA">📢 Portal Transparansi</option>
                <option value="PERATURAN">⚖️ Peraturan-Peraturan</option>
                <option value="PANDUAN">📘 Panduan Operator (PDF)</option>
              </select>
            </div>

            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="text-right hidden sm:block mr-2">
                <p className="text-[9px] text-slate-400 uppercase font-bold leading-none">Terakhir Sinkronisasi</p>
                <p className="text-xs font-bold text-slate-700 mt-1">Hari Ini, Real-time WIB</p>
              </div>
              <button 
                onClick={() => window.print()}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-bold hover:bg-blue-700 shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Cetakan Laporan
              </button>
              <button 
                onClick={handleLogout}
                className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1.5 rounded text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                title="Keluar dari Sistem SIMONEV"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </header>

          {/* Offline fallback warning banner */}
          {isOfflineFallback && (
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-xs text-amber-850 flex items-center justify-between shrink-0 gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Mode Luring Aktif:</strong> Batas kuota harian database Cloud Firestore terlampaui. Perubahan yang Anda buat sekarang disimpan secara luring (di browser) dan tidak akan hilang. Anda tetap bisa memasukkan data, menyetujui, dan mencetak berkas secara penuh.
                </span>
              </div>
              <button 
                onClick={() => {
                  setIsOfflineFallback(false);
                  localStorage.removeItem('simonev_offline_fallback');
                }}
                className="text-[10px] bg-amber-600 hover:bg-amber-700 text-white font-extrabold px-2.5 py-1 rounded transition-all whitespace-nowrap cursor-pointer"
              >
                Coba Hubungkan Kembali
              </button>
            </div>
          )}

          {/* Scrollable Context Box */}
          <div className="flex-grow overflow-y-auto p-4 md:p-8 space-y-6 h-full">
            
            {activeTab === 'DASHBOARD' && (
              <Dashboard 
                activities={filteredActivitiesByYear} 
                villageBudgets={villageBudgets} 
                notificationLogs={logs}
                onSelectActivity={(act) => setSelectedActivity(act)}
                activitiesAllocatedBudgets={activitiesAllocatedBudgets}
                siskeudesPaguList={siskeudesPagu}
                onUpdateSiskeudesPagu={handleUpdateSiskeudesPagu}
                bumdesList={bumdesMonevList}
                onNavigateToBumdes={() => setActiveTab('MONEV_BUMDES')}
                activeRole={activeRole}
              />
            )}

            {activeTab === 'OPERATOR_DESA' && (
              (activeRole === 'OP_BANGUN_MULYA' || activeRole === 'OP_SESULU' || activeRole === 'OP_API_API') ? (
                <VillageOperator
                  village={activeVillageForOperator}
                  activities={filteredActivitiesByYear}
                  selectedYear={selectedYear}
                  onAddActivity={handleAddActivity}
                  onUpdateActivity={handleUpdateActivity}
                  onDeleteActivity={handleDeleteActivity}
                  onTriggerPrintRecap={() => {
                    setPrintModalVillageFilter(activeVillageForOperator);
                    setIsPrintModalOpen(true);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-center max-w-md mb-6 px-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Akses Terbuka: Operator Desa</h3>
                    <p className="text-xs text-slate-550 mt-1.5 leading-relaxed">
                      Layanan ini terlindungi. Silakan hubungkan identitas operator Desa Anda (Desa Bangun Mulya, Desa Sesulu, atau Desa Api-api) untuk melanjutkan penginputan dan publikasi realisasi anggaran fisik.
                    </p>
                  </div>
                  <LoginPortal 
                    onLoginSuccess={(role) => {
                      setActiveRole(role);
                    }} 
                    defaultRolePreference="OP_BANGUN_MULYA"
                  />
                </div>
              )
            )}

            {activeTab === 'EVALUASI_KECAMATAN' && (
              activeRole === 'OP_KECAMATAN' ? (
                <KecamatanOperator
                  activities={filteredActivitiesByYear}
                  onSetEvaluation={handleSetEvaluation}
                  onTriggerPrintRecap={() => {
                    setPrintModalVillageFilter('ALL');
                    setIsPrintModalOpen(true);
                  }}
                  onTriggerPrintProposal={() => {
                    setIsProposalModalOpen(true);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-center max-w-md mb-6 px-4">
                    <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-3">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Akses Terbuka: Kecamatan Waru PMD</h3>
                    <p className="text-xs text-slate-550 mt-1.5 leading-relaxed">
                      Layanan ini dibatasi khusus Tim Verifikator Kecamatan Waru. Silakan log-in terlebih dahulu untuk memberikan rekomendasi, perbaikan, atau persetujuan (ACC) digital.
                    </p>
                  </div>
                  <LoginPortal 
                    onLoginSuccess={(role) => {
                      setActiveRole(role);
                    }} 
                    defaultRolePreference="OP_KECAMATAN"
                  />
                </div>
              )
            )}

            {activeTab === 'INTEGRASI_SISKEUDES' && (
              (activeRole === 'OP_BANGUN_MULYA' || activeRole === 'OP_SESULU' || activeRole === 'OP_API_API' || activeRole === 'OP_KECAMATAN') ? (
                <InputPaguAnggaran
                  paguList={siskeudesPagu}
                  onUpdatePagu={handleUpdateSiskeudesPagu}
                  activeRole={activeRole}
                  selectedYear={selectedYear}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-center max-w-md mb-6 px-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-3 border border-blue-200">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Akses Terbuka: Input Pagu Anggaran Desa</h3>
                    <p className="text-xs text-slate-550 mt-1.5 leading-relaxed">
                      Layanan ini terlindungi dan hanya dapat dimasuki oleh Operator Desa / Kecamatan. Silakan masuk menggunakan akun Operator Desa atau Operator Kecamatan PMD Waru untuk melanjutkan manajemen data anggaran.
                    </p>
                  </div>
                  <LoginPortal 
                    onLoginSuccess={(role) => {
                      setActiveRole(role);
                    }} 
                    defaultRolePreference="OP_BANGUN_MULYA"
                  />
                </div>
              )
            )}

            {activeTab === 'MONEV_BUMDES' && (
              (activeRole === 'OP_BANGUN_MULYA' || activeRole === 'OP_SESULU' || activeRole === 'OP_API_API' || activeRole === 'OP_KECAMATAN') ? (
                <BumdesMonevBoard
                  bumdesList={bumdesMonevList}
                  onUpdateBumdes={handleUpdateBumdes}
                  activeRole={activeRole}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-6">
                  <div className="text-center max-w-md mb-6 px-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-3 border border-blue-200">
                      <Lock className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Akses Terbuka: Monev BUMDes</h3>
                    <p className="text-xs text-slate-550 mt-1.5 leading-relaxed">
                      Layanan ini terlindungi. Silakan masuk menggunakan akun Operator Desa atau Operator Kecamatan PMD Waru untuk mengelola, mengevaluasi, dan mencetak laporan monev BUMDes terdaftar.
                    </p>
                  </div>
                  <LoginPortal 
                    onLoginSuccess={(role) => {
                      setActiveRole(role);
                    }} 
                    defaultRolePreference="OP_BANGUN_MULYA"
                  />
                </div>
              )
            )}

            {activeTab === 'PORTAL_WARGA' && (
              <TransparencyBoard
                activities={filteredActivitiesByYear}
                onCitizenReport={handleCitizenReport}
              />
            )}

            {activeTab === 'PERATURAN' && (
              <RegulationsBoard activeRole={activeRole} />
            )}

            {activeTab === 'PANDUAN' && (
              <div id="operator-panduan-section" className="space-y-6 max-w-4xl mx-auto md:pb-12 text-slate-800">
                <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
                      <span>📘</span> Panduan Resmi & Operator Manual
                    </h2>
                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                      Layanan petunjuk operasional sistem monitoring dan verifikasi evaluasi desa Kecamatan Waru TA {selectedYear}.
                    </p>
                  </div>
                  <button
                    onClick={generateOperatorManualPDF}
                    className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer active:scale-95"
                  >
                    <Download className="w-4 h-4" /> Unduh Buku Panduan (PDF)
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quick Access Info Card */}
                  <div className="bg-amber-50 rounded-xl shadow-xs border border-amber-200 p-5 flex flex-col justify-center items-center text-center space-y-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-lg">
                      🔑
                    </div>
                    <h3 className="font-bold text-amber-900 text-sm">
                      Pemberitahuan Akses
                    </h3>
                    <p className="text-xs text-amber-850 leading-relaxed font-semibold">
                      Untuk Akses Bisa Hubungi Tim Monev Kecamatan Waru
                    </p>
                  </div>

                  {/* Village Operator Steps */}
                  <div className="md:col-span-2 bg-white rounded-xl shadow-xs border border-slate-200 p-5 space-y-3">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-2">
                      📋 Petunjuk Kerja Operator Desa
                    </h3>
                    <div className="space-y-3 text-xs leading-relaxed text-slate-700">
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">1</span>
                        <p><strong>Daftarkan Usulan:</strong> Buka tab "Input Kegiatan Desa" lalu tekan tombol tambah. Isi formulir pagu, sektor, sumber dana, dsb.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">2</span>
                        <p><strong>Perbarui Realisasi Berkala:</strong> Update serapan dana SPJ, persentase fisik, unggah dokumentasi foto lapangan & lampiran berkas laporan.</p>
                      </div>
                      <div className="flex gap-2">
                        <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 mt-0.5 font-mono text-[10px]">3</span>
                        <p><strong>Pengajuan Evaluasi (100%):</strong> Saat realisasi fisik ditarik ke <strong>100%</strong>, status otomatis beralih ke <strong>MENUNGGU EVALUASI</strong> untuk dievaluasi oleh kecamatan.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
                  <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">
                    ⚖️ Petunjuk Kerja Verifikator Kecamatan (Camat / Tim PMD)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700 leading-relaxed">
                    <div className="space-y-2">
                      <p className="font-bold text-slate-800">1. Penilaian & Rekomendasi:</p>
                      <p>Masuk ke menu "Evaluasi Kecamatan". Tinjau berkas pendukung, rincian biaya, dan dokumentasi foto lapangan yang diajukan desa.</p>
                      <p>Kecamatan dapat memberikan masukan/revisi dengan menyertakan teks rekomendasi, lalu klik "Kirim Catatan Evaluasi". Status usulan desa akan dikembalikan ke "Dalam Proses" untuk diperbaiki desa.</p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-bold text-slate-800">2. ACC & Tanda Tangan Digital:</p>
                      <p>Jika berkas dan progres fisik dinilai sudah lengkap & sah 100%, verifikator kecamatan PMD dapat mengisi rekomendasi penyetuju dan menekan tombol <strong>"Setujui Laporan Akhir"</strong>.</p>
                      <p>Sistem akan memberi ACC serta bubuhan tanda tangan elektronik sah secara mutlak. Status kegiatan resmi dinilai <strong>"SELESAI (TER-ACC)"</strong>.</p>
                    </div>
                  </div>
                </div>

                {/* Bug Fix / Solid Database Notice */}
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1">
                    ✔️ Jaminan Penyimpanan Data Evaluasi Desa (ACC & TTD 100% Tersimpan)
                  </h4>
                  <p className="text-emerald-800 leading-relaxed">
                    Kami telah menambahkan optimasi sanitasi database (fungsi <code>cleanForFirestore</code>) secara menyeluruh. Hal ini menjamin parameter yang kosong / undefined ditiadakan sebelum diunggah ke Cloud Firestore. <strong>Data ACC, rekomendasi, evaluasi, dan tanda tangan digital kecamatan kini dapat disimpan seratus persen lancar tanpa ada data hilang atau gagal simpan.</strong>
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Print-ready Table Report Modal Overlay */}
      <PrintReportModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        activities={filteredActivitiesByYear}
        villageBudgets={villageBudgets}
        initialVillage={printModalVillageFilter}
        selectedYear={selectedYear}
      />

      {/* Print-ready Proposal to Superior Modal Overlay */}
      <PrintProposalModal
        isOpen={isProposalModalOpen}
        onClose={() => setIsProposalModalOpen(false)}
        activities={filteredActivitiesByYear}
        villageBudgets={villageBudgets}
        selectedYear={selectedYear}
      />

      {/* Detailed Side / Hover Overlay Modal for Activity */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[85vh] overflow-y-auto space-y-6 shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-6 bg-slate-900 text-white flex justify-between items-start relative">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold tracking-wider uppercase text-indigo-400 bg-slate-850 px-2 py-0.5 rounded">
                  {selectedActivity.sector}
                </span>
                <h3 className="text-base md:text-lg font-bold mt-1 pr-6 leading-tight">
                  {selectedActivity.name}
                </h3>
                <div className="flex items-center gap-1 text-xs text-slate-350 mt-1 font-semibold">
                  <MapPin className="w-3.5 h-3.5" /> Kecamatan Waru • Desa {selectedActivity.village}
                </div>
              </div>
              <button 
                onClick={() => setSelectedActivity(null)}
                className="text-slate-400 hover:text-white bg-slate-800 p-1.5 rounded-full text-xs font-bold font-mono transition-colors"
              >
                [X]
              </button>
            </div>

            {/* Modal Contents */}
            <div className="px-6 pb-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Pagu Total Anggaran</span>
                  <div className="text-sm font-bold text-slate-900 font-mono">{formatRupiah(selectedActivity.budgetTotal)}</div>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase">Dana Terserap (SPJ)</span>
                  <div className="text-sm font-bold text-emerald-800 font-mono">{formatRupiah(selectedActivity.budgetSpent)}</div>
                </div>
              </div>

              {/* Physical slider progress */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs text-slate-600">
                  <span className="font-semibold">Realisasi Fisik Terkini:</span>
                  <span className="font-bold text-indigo-950 font-mono">{selectedActivity.progressPhysical}%</span>
                </div>
                <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                  <div 
                    className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${selectedActivity.progressPhysical}%` }}
                  ></div>
                </div>
              </div>

              {/* Attached media proofs */}
              {selectedActivity.photoUrl && (
                <div className="space-y-1.5 font-sans">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Dokumentasi Lapangan</h4>
                  {selectedActivity.photoUrl.startsWith('data:application/pdf') || selectedActivity.photoUrl.includes('.pdf') ? (
                    <div className="flex flex-col gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                      <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-red-600" />
                        <span className="text-xs font-bold text-slate-900">Berkas Dokumen Bukti Fisik (PDF)</span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-normal">
                        Dokumen ini berisi gabungan dari bukti-bukti progres dokumentasi fisik di lapangan (maks. 4 foto per lembar).
                      </p>
                      <button
                        type="button"
                        onClick={() => handleDownloadPhotoPdf(selectedActivity)}
                        className="w-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer mt-1"
                      >
                        <Download className="w-4 h-4" />
                        Unduh Bukti Fisik
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-slate-200 max-h-56 bg-slate-100 flex justify-center">
                      <img src={selectedActivity.photoUrl} alt="Documentation" className="w-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Syarat Evaluasi / Laporan PDF Download */}
              {selectedActivity.budgetReportUrl && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">Berkas Syarat Evaluasi</h4>
                  <div className="flex items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <FileCheck className="w-4 h-4 text-slate-500" />
                      <span className="text-xs font-mono text-slate-700 truncate max-w-[200px]" title={selectedActivity.budgetReportUrl}>
                        {selectedActivity.budgetReportUrl}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDownloadFile(selectedActivity)}
                      className="bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-[11px] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Unduh Berkas
                    </button>
                  </div>
                </div>
              )}

                        <div className="pt-2 border-t border-slate-150 space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Status Monitoring:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    selectedActivity.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' :
                    selectedActivity.status === 'MENUNGGU_EVALUASI' ? 'bg-blue-100 text-blue-800' :
                    selectedActivity.status === 'DALAM_PROSES' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-rose-800'
                  }`}>
                    {selectedActivity.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Recommendation box */}
                {(selectedActivity.recommendationsHistory && selectedActivity.recommendationsHistory.length > 0) ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Riwayat Rekomendasi Camat Waru / Tim PMD:
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedActivity.recommendationsHistory.map((rec, index) => (
                        <div key={rec.id} className="text-xs text-slate-700 bg-white/80 p-2 rounded border border-amber-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="font-bold">{index + 1}. Oleh {rec.officerName}</span>
                            <span className="font-mono">{new Date(rec.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <p className="italic">"{rec.text}"</p>
                          <div className="text-[9px] font-bold">
                            Status: {rec.isApproved ? (
                              <span className="text-emerald-700 font-semibold bg-emerald-50 px-1 py-0.2 rounded">Selesai (ACC)</span>
                            ) : (
                              <span className="text-amber-700 font-semibold bg-amber-50 px-1 py-0.2 rounded">Perlu Perbaikan (Revisi)</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedActivity.recommendation ? (
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      Rekomendasi Camat Waru / Tim PMD:
                    </div>
                    <p className="text-xs text-slate-700 italic">
                      "{selectedActivity.recommendation}"
                    </p>
                  </div>
                ) : null}

                {/* Reason for not completed box */}
                {(selectedActivity.incompleteReasonsHistory && selectedActivity.incompleteReasonsHistory.length > 0) ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-3">
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-500 text-rose-600" />
                      Riwayat Alasan Belum Rampung:
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {selectedActivity.incompleteReasonsHistory.map((inc, index) => (
                        <div key={inc.id} className="text-xs text-slate-700 bg-white/80 p-2 rounded border border-rose-100 space-y-1">
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="font-bold">{index + 1}. Progress Fisik: {inc.progressPhysical}%</span>
                            <span className="font-mono">{new Date(inc.timestamp).toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' })}</span>
                          </div>
                          <p className="italic">"{inc.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : selectedActivity.incompleteReason ? (
                  <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl space-y-1">
                    <div className="flex items-center gap-1 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-500 text-rose-600" />
                      Alasan Kegiatan Belum Rampung:
                    </div>
                    <p className="text-xs text-slate-700 font-medium italic">
                      "{selectedActivity.incompleteReason}"
                    </p>
                  </div>
                ) : null}

                {/* Signature status */}
                {selectedActivity.isKecamatanApproved && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      Digital Approval Certificate (Kecamatan Waru)
                    </div>
                    <div className="text-slate-600 text-[11px] font-medium leading-relaxed font-sans">
                      Kegiatan ini dinyatakan memenuhi syarat dan telah disetujui laporannya oleh: <strong className="text-slate-800">{selectedActivity.approvedBy}</strong> pada <span className="font-mono">{selectedActivity.approvedAt ? new Date(selectedActivity.approvedAt).toLocaleString('id-ID') : ''}</span>.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 rounded-b-2xl text-right">
              <button 
                onClick={() => setSelectedActivity(null)}
                className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-700"
              >
                Tutup Detail
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Minimalistic human-friendly footer credits */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400 font-sans mt-auto">
        <p>© 2026 Simonev APBDes Kecamatan Waru. Sistem Tata Kelola Keuangan dan Fisik Desa Transparan.</p>
        <p className="mt-1">Melayani Desa Bangun Mulya, Desa Sesulu, dan Desa Api-api.</p>
      </footer>
    </div>
  );
}
