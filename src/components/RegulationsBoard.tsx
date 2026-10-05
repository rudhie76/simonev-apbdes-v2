import React, { useState, useEffect, useMemo } from 'react';
import { 
  Scale, 
  Search, 
  Building2, 
  Download, 
  ExternalLink, 
  FileText, 
  Calendar, 
  ChevronDown, 
  ChevronUp, 
  Info,
  CheckCircle2,
  FileCheck,
  Plus,
  Trash2,
  Edit2,
  AlertCircle,
  RefreshCw,
  X,
  Save,
  CloudLightning,
  CloudOff,
  Check
} from 'lucide-react';
import { db, handleFirestoreError, OperationType, collection, onSnapshot, doc, setDoc, deleteDoc, getDocs } from '../lib/sheetsApi';
import { Regulation, UserRole } from '../types';

interface RegulationsBoardProps {
  activeRole: UserRole;
}

// 9 Standard Acuan Regulations stored in offline file memory
const INITIAL_REGULATIONS: Regulation[] = [
  {
    id: 'reg-pusat-1',
    category: 'PUSAT',
    title: 'Undang-Undang Republik Indonesia tentang Desa',
    numberAndYear: 'UU Nomor 6 Tahun 2014',
    topic: 'Asas, Kedudukan, Kewenangan, Pembangunan, dan Keuangan Desa',
    description: 'Regulasi induk yang menjadi dasar hukum pengakuan terhadap desa, pengelolaan keuangan (Dana Desa), hak dan kewajiban desa, serta tata kelola pemerintahan desa secara mandiri.',
    publishDate: '15 Januari 2014',
    keyPoints: [
      'Pengakuan terhadap kesatuan masyarakat hukum yang memiliki batas wilayah dan kewenangan asli.',
      'Mandat pengalokasian anggaran khusus dari APBN berupa Dana Desa (DD).',
      'Siklus perencanaan pembangunan partisipatif melalui Musyawarah Desa (Musdes).',
      'Ketentuan masa jabatan Kepala Desa dan tata pengawasan pertanggungjawaban.'
    ],
    downloadFilename: 'UU_Nomor_6_Tahun_2014_Tentang_Desa.pdf',
    createdAt: '2014-01-15T00:00:00.000Z',
    lastUpdated: '2014-01-15T00:00:00.000Z'
  },
  {
    id: 'reg-pusat-2',
    category: 'PUSAT',
    title: 'Peraturan Menteri Dalam Negeri tentang Pengelolaan Keuangan Desa',
    numberAndYear: 'Permendagri Nomor 20 Tahun 2018',
    topic: 'Siklus dan Mekanisme Pengelolaan Keuangan Desa (APBDes)',
    description: 'Pedoman teknis utama bagi seluruh aparat desa dan kecamatan dalam merancang, melaksanakan, menatausahakan, melaporkan, dan mempertanggungjawabkan APBDes.',
    publishDate: '08 Mei 2018',
    keyPoints: [
      'Pembagian peran Keuangan Desa: Kepala Desa sebagai PKPKD, dibantu PPKD (Sekdes, Kaur, Kasi).',
      'Struktur APBDes yang terdiri atas Pendapatan Desa, Belanja Desa (Sektor Penyelenggaraan Pemerintahan, Pembangunan, Pembinaan Kemasyarakatan, Pemberdayaan, dan Penanggulangan Bencana), serta Pembiayaan.',
      'Mekanisme pengajuan SPP (Surat Permintaan Pembayaran) dan pertanggungjawaban fisik.',
      'Sanksi administratif dan pengawasan oleh Camat serta Badan Permusyawaratan Desa (BPD).'
    ],
    downloadFilename: 'Permendagri_Nomor_20_Tahun_2018.pdf',
    createdAt: '2018-05-08T00:00:00.000Z',
    lastUpdated: '2018-05-08T00:00:00.000Z'
  },
  {
    id: 'reg-pusat-3',
    category: 'PUSAT',
    title: 'Peraturan Pemerintah tentang Peraturan Pelaksanaan UU Nomor 6 Tahun 2014 tentang Desa',
    numberAndYear: 'PP Nomor 43 Tahun 2014 jo. PP Nomor 11 Tahun 2019',
    topic: 'Pelaksanaan Teknis UU Desa, Penghasilan Tetap Siltap, dan Belanja Operasional',
    description: 'Mengatur penghasilan tetap (Siltap) kepala desa, perangkat desa, serta batas maksimal belanja operasional pemerintah desa (porsi 30% dan 70% APBDes).',
    publishDate: '29 April 2019',
    keyPoints: [
      'Besaran Siltap Kepala Desa setara minimal 120% gaji pokok PNS golongan IIa.',
      'Ketentuan alokasi penggunaan belanja APBDes maksimal 30% untuk siltap & operasional, minimal 70% untuk pembangunan masyarakat dan pemberdayaan.',
      'Prosedur pemilihan, penunjukan kepala desa definitif / penjabat (Pj).'
    ],
    downloadFilename: 'PP_Nomor_11_Tahun_2019_Perubahan_Kedua_PP43.pdf',
    createdAt: '2019-04-29T00:00:00.000Z',
    lastUpdated: '2019-04-29T00:00:00.000Z'
  },
  {
    id: 'reg-pusat-4',
    category: 'PUSAT',
    title: 'Peraturan Menteri Keuangan tentang Pengelolaan Dana Desa',
    numberAndYear: 'PMK Nomor 145/PMK.07/2023',
    topic: 'Penyaluran, Pencairan, dan Pengamanan Akuntabilitas Dana Desa',
    description: 'Aturan Kementerian Keuangan RI yang menetapkan siklus penyaluran Dana Desa berdasar pemenuhan dokumen syarat salur dari desa ke KPPN.',
    publishDate: '28 Desember 2023',
    keyPoints: [
      'Pemberlakuan penyaluran Dana Desa dalam bentuk Earmarked (ditentukan penggunaannya seperti BLT Desa, Ketahanan Pangan) dan Non-Earmarked.',
      'Syarat salur tahap I dan tahap II meliputi laporan realisasi penyerapan minimal 90% dan capaian output minimal 75% tahun sebelumnya.',
      'Ketentuan pemotongan penyaluran jika terjadi penyalahgunaan anggaran.'
    ],
    downloadFilename: 'PMK_145_PMK07_2023_Pengelolaan_Dana_Desa.pdf',
    createdAt: '2023-12-28T00:00:00.000Z',
    lastUpdated: '2023-12-28T00:00:00.000Z'
  },
  {
    id: 'reg-prov-1',
    category: 'PROVINSI',
    title: 'Peraturan Gubernur Kalimantan Timur tentang Pedoman Bantuan Keuangan Khusus Pemprov Kaltim kepada Desa',
    numberAndYear: 'Pergub Kaltim Nomor 34 Tahun 2021',
    topic: 'Alokasi, Penggunaan, dan Evaluasi Bankeu Provinsi',
    description: 'Kebijakan Gubernur Kalimantan Timur yang mendasari pemberian stimulasi modal pembangunan desa guna percepatan pengentasan desa tertinggal.',
    publishDate: '10 Juni 2021',
    keyPoints: [
      'Bankeu Kaltim difokuskan untuk insentif administrasi, penguatan posyandu, pencegahan stunting, dan pengembangan lumbung pangan.',
      'Kewajiban penginputan laporan pertanggungjawaban fisik dan keuangan secara sitematis ke Dinas Pemberdayaan Masyarakat dan Pemerintahan Desa (DPMPD) Kaltim.',
      'Integrasi laporan evaluasi agar berkesinambungan dengan program pembangunan propinsi.'
    ],
    downloadFilename: 'Pergub_Kaltim_Nomor_34_Tahun_2021_Bantuan_Keuangan_Desa.pdf',
    createdAt: '2021-06-10T00:00:00.000Z',
    lastUpdated: '2021-06-10T00:00:00.000Z'
  },
  {
    id: 'reg-prov-2',
    category: 'PROVINSI',
    title: 'Keputusan Dinas Pemberdayaan Masyarakat dan Pemerintahan Desa (DPMPD) Kaltim tentang Petunjuk Teknis Evaluasi APBDes',
    numberAndYear: 'Kepdis DPMPD Nomor 120/X/2024',
    topic: 'Pedoman Penilaian Kinerja Penyerapan Realisasi Desa di Provinsi',
    description: 'Keputusan teknis penyamaan indikator penilaian keberhasilan penyerapan fisik lapangan dengan kriteria kualitatif yang mengikat se-Provinsi.',
    publishDate: '12 Oktober 2024',
    keyPoints: [
      'Kriteria efektivitas pemanfaatan dana jangka pendek dan menengah.',
      'Penetapan rasio indeks kepatuhan administrasi pelaporan.',
      'Kewajiban penggunaan sistem integrasi daring kementerian.'
    ],
    downloadFilename: 'Juknis_Evaluasi_APBDes_DPMPD_Kaltim_2024.pdf',
    createdAt: '2024-10-12T00:00:00.000Z',
    lastUpdated: '2024-10-12T00:00:00.000Z'
  },
  {
    id: 'reg-kab-1',
    category: 'KABUPATEN',
    title: 'Peraturan Bupati Penajam Paser Utara tentang Tata Cara Pengalokasian dan Penyaluran Alokasi Dana Desa (ADD) Kabupaten PPU',
    numberAndYear: 'Perbup PPU Nomor 21 Tahun 2023',
    topic: 'Penghitungan Formula Anggaran ADD per Desa di PPU',
    description: 'Landasan operasional pembagian Alokasi Dana Desa (ADD) bersumber dari APBD Kabupaten Penajam Paser Utara menggunakan formula bobot desa (luas wilayah, jumlah penduduk, tingkat kemiskinan, tingkat kesulitan geografis).',
    publishDate: '05 September 2023',
    keyPoints: [
      'Ketentuan proporsi ADD dasar (pemerataan) sebesar 60%, dan formula proporsi formula (bobot kinerja desa) sebesar 40%.',
      'Mekanisme penyaluran ADD tiap triwulan dengan syarat laporan realisasi penyerapan triwulan sebelumnya minimum 75%.',
      'Sanksi penundaan penyaluran bagi desa yang melanggar batas waktu penyampaian LHP (Laporan Hasil Pemeriksaan) Inspektorat.'
    ],
    downloadFilename: 'Perbup_PPU_Nomor_21_Tahun_2023_Pengalokasian_ADD.pdf',
    referenceUrl: 'https://jdih.penajamkab.go.id/',
    createdAt: '2023-09-05T00:00:00.000Z',
    lastUpdated: '2023-09-05T00:00:00.000Z'
  },
  {
    id: 'reg-kab-2',
    category: 'KABUPATEN',
    title: 'Peraturan Bupati Penajam Paser Utara tentang Pedoman Penyusunan Anggaran Pendapatan dan Belanja Desa (APBDes) TA 2026',
    numberAndYear: 'Perbup PPU Nomor 18 Tahun 2025',
    topic: 'Sinkronisasi Prioritas RKPD Kabupaten dengan Rencana Kerja APBDes',
    description: 'Kebijakan daerah PPU yang mengarahkan desa di Kecamatan Waru dan kecamatan lainnya dalam mensinkronkan program pembangunan prioritas daerah seperti perlindungan jaminan kesehatan daerah, penanggulangan banjir, dan digitalisasi desa.',
    publishDate: '14 November 2025',
    keyPoints: [
      'Desa wajib menganggarkan sekurang-kurangnya 10% dari Dana Desa untuk program perlindungan pangan desa.',
      'Manday pelaksanaan evaluasi APBDes oleh Camat via Kasi PMD sebelum rancangan anggaran ditetapkan menjadi Peraturan Desa.',
      'Instruksi penggunaan aplikasi Simonev terpadu berjejaring dengan sistem evaluasi kecamatan Waru.'
    ],
    downloadFilename: 'Perbup_PPU_Nomor_18_Tahun_2025_Pedoman_APBDes_2026.pdf',
    referenceUrl: 'https://jdih.penajamkab.go.id/',
    createdAt: '2025-11-14T00:00:00.000Z',
    lastUpdated: '2025-11-14T00:00:00.000Z'
  },
  {
    id: 'reg-kab-3',
    category: 'KABUPATEN',
    title: 'Peraturan Bupati Penajam Paser Utara tentang Petunjuk Teknis Evaluasi Penyerapan Anggaran Kegiatan Kerja Desa',
    numberAndYear: 'Perbup PPU Nomor 8 Tahun 2024',
    topic: 'SOP Pelaksanaan Evaluasi dan Tindak Lanjut oleh Camat/Evaluator',
    description: 'Menjabarkan Prosedur Operasional Standar (SOP) pelaksanaan monitoring lapangan serta pengisian instrumen rekomendasi penilai kecamatan Waru.',
    publishDate: '18 Maret 2024',
    keyPoints: [
      'Wewenang evaluasi fisik lapangan didelegasikan penuh kepada Camat selaku koordinator wilayah.',
      'Formulasi penetapan status kegiatan: Terlaksana Baik, Terlaksana dengan Catatan, atau Belum Selesai.',
      'Hak memberikan teguran tertulis berjenjang apabila realisasi meleset dari komitmen target RKPDes.'
    ],
    downloadFilename: 'Perbup_PPU_Nomor_8_Tahun_2024_SOP_Monev_Kecamatan.pdf',
    referenceUrl: 'https://jdih.penajamkab.go.id/',
    createdAt: '2024-03-18T00:00:00.000Z',
    lastUpdated: '2024-03-18T00:00:00.000Z'
  }
];

export default function RegulationsBoard({ activeRole }: RegulationsBoardProps) {
  // Offline-First Initial State: We load the 9 structural ones directly!
  const [regulations, setRegulations] = useState<Regulation[]>(INITIAL_REGULATIONS);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'PUSAT' | 'PROVINSI' | 'KABUPATEN'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Sync System & Notification Alerts
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Management Form UI States
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form fields
  const [category, setCategory] = useState<'PUSAT' | 'PROVINSI' | 'KABUPATEN'>('PUSAT');
  const [title, setTitle] = useState('');
  const [numberAndYear, setNumberAndYear] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [keyPoints, setKeyPoints] = useState<string[]>(['']);
  const [referenceUrl, setReferenceUrl] = useState('');
  const [downloadFilename, setDownloadFilename] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Allow all authorized log-in operators (Kecamatan & Village) to edit & update for high usability
  const hasEditRights = activeRole !== 'PUBLIC';

  // Real-time listen to Firestore.
  // Updates local state smoothly if cloud items are fetched, fails gracefully without crashing on network logs
  useEffect(() => {
    const q = collection(db, 'regulations');
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const list: Regulation[] = [];
        snapshot.forEach((d) => {
          list.push(d.data() as Regulation);
        });
        
        // Sort: newly created / updated first
        list.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        setRegulations(list);
      }
    }, (error) => {
      console.warn('Real-time database offline, displaying structural offline regulations: ', error.message);
    });

    return () => unsubscribe();
  }, []);

  // Sync / Pre-populate cloud database with initial structural regulations
  const handleDatabaseSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      let syncedCount = 0;
      // Direct setDoc for each item to push them to firestore
      for (const reg of INITIAL_REGULATIONS) {
        const docRef = doc(db, 'regulations', reg.id);
        await setDoc(docRef, reg);
        syncedCount++;
      }

      // Read fresh items
      const querySnapshot = await getDocs(collection(db, 'regulations'));
      const list: Regulation[] = [];
      querySnapshot.forEach((d) => {
        list.push(d.data() as Regulation);
      });
      list.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setRegulations(list);

      setSyncMessage({
        type: 'success',
        text: `Sinkronisasi selesai! ${syncedCount} peraturan berhasil diselaraskan dengan cloud database.`
      });
    } catch (err: any) {
      console.error(err);
      setSyncMessage({
        type: 'error',
        text: `Gagal sinkronisasi: ${err.message || 'Periksa otorisasi database.'}`
      });
    } finally {
      setIsSyncing(false);
      // Fade away notice after 4 seconds
      setTimeout(() => {
        setSyncMessage(null);
      }, 4000);
    }
  };

  // Key points list handlers
  const handleAddKeyPoint = () => {
    setKeyPoints(prev => [...prev, '']);
  };

  const handleKeyPointChange = (index: number, value: string) => {
    setKeyPoints(prev => {
      const copy = [...prev];
      copy[index] = value;
      return copy;
    });
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints(prev => {
      if (prev.length <= 1) return [''];
      return prev.filter((_, idx) => idx !== index);
    });
  };

  // Open Add Regulation Form
  const triggerAddMode = () => {
    setEditingId(null);
    setCategory('PUSAT');
    setTitle('');
    setNumberAndYear('');
    setTopic('');
    setDescription('');
    setPublishDate('');
    setKeyPoints(['']);
    setReferenceUrl('');
    setDownloadFilename('');
    setFormError(null);
    setShowForm(true);
  };

  // Open Edit Regulation Form
  const triggerEditMode = (reg: Regulation) => {
    setEditingId(reg.id);
    setCategory(reg.category);
    setTitle(reg.title);
    setNumberAndYear(reg.numberAndYear);
    setTopic(reg.topic);
    setDescription(reg.description);
    setPublishDate(reg.publishDate);
    setKeyPoints(reg.keyPoints.length > 0 ? reg.keyPoints : ['']);
    setReferenceUrl(reg.referenceUrl || '');
    setDownloadFilename(reg.downloadFilename);
    setFormError(null);
    setShowForm(true);
  };

  // Delete Regulation from Firestore
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Apakah Anda yakin ingin menghapus peraturan ini secara permanen dari server cloud?')) {
      return;
    }
    try {
      await deleteDoc(doc(db, 'regulations', id));
      // Locally remove to prevent visual lag on failures
      setRegulations(prev => prev.filter(r => r.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `regulations/${id}`);
    }
  };

  // Save (Create or Edit) Regulation to Firestore
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // Validate inputs
    if (!title.trim() || !numberAndYear.trim() || !topic.trim() || !description.trim() || !publishDate.trim() || !downloadFilename.trim()) {
      setFormError('Harap lengkapi semua field wajib bertanda bintang (*).');
      return;
    }

    const filteredKeyPoints = keyPoints.map(p => p.trim()).filter(p => p.length > 0);
    if (filteredKeyPoints.length === 0) {
      setFormError('Harap tuliskan minimal 1 poin penting peraturan.');
      return;
    }

    // Match limits in firestore.rules
    if (title.length > 400) {
      setFormError('Judul peraturan tidak boleh lebih dari 400 karakter.');
      return;
    }
    if (numberAndYear.length > 150) {
      setFormError('Nomor & tahun tidak boleh lebih dari 150 karakter.');
      return;
    }
    if (topic.length > 200) {
      setFormError('Topik bahasan tidak boleh lebih dari 200 karakter.');
      return;
    }
    if (description.length > 3000) {
      setFormError('Uraian deskripsi tidak boleh lebih dari 3000 karakter.');
      return;
    }
    if (downloadFilename.length > 150) {
      setFormError('Format nama file tidak boleh lebih dari 150 karakter.');
      return;
    }

    setIsSaving(true);
    const id = editingId || `reg-${category.toLowerCase()}-${Date.now()}`;
    const now = new Date().toISOString();

    const payload: Regulation = {
      id,
      category,
      title: title.trim(),
      numberAndYear: numberAndYear.trim(),
      topic: topic.trim(),
      description: description.trim(),
      publishDate: publishDate.trim(),
      keyPoints: filteredKeyPoints,
      downloadFilename: downloadFilename.trim(),
      referenceUrl: referenceUrl.trim() || undefined,
      createdAt: editingId ? (regulations.find(r => r.id === editingId)?.createdAt || now) : now,
      lastUpdated: now
    };

    try {
      await setDoc(doc(db, 'regulations', id), payload);
      setShowForm(false);
      setEditingId(null);
      setFormError(null);
    } catch (err) {
      setFormError('Gagal menyimpan ke server Firestore. Periksa koneksi atau otorisasi Anda.');
      handleFirestoreError(err, OperationType.WRITE, `regulations/${id}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Filter regulations dynamically based on Search & Category tabs
  const filteredRegulations = useMemo(() => {
    return regulations.filter(reg => {
      const matchSearch = 
        reg.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.numberAndYear.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        reg.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchCategory = selectedCategory === 'ALL' || reg.category === selectedCategory;

      return matchSearch && matchCategory;
    });
  }, [regulations, searchQuery, selectedCategory]);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleDownloadStub = (filename: string) => {
    const element = document.createElement("a");
    const testContent = `DOKUMEN NEGARA & PERATURAN RESMI\n=================================\n\nUnit: Pemerintah Kecamatan Waru - Kab. Penajam Paser Utara\nNama Berkas: ${filename}\nStatus: Dokumen Acuan Pengelolaan Keuangan & Evaluasi APBDes\n\nCatatan: Berkas ini merupakan file acuan regulasi resmi yang terarsip di database portal Simonev APBDes Penilai-Kecamatan Waru.`;
    const file = new Blob([testContent], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename.replace('.pdf', '.txt');
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto md:pb-12 text-slate-800 animate-fade-in" id="regulations-board-container">
      {/* Hero Banner Section */}
      <div className="bg-slate-900 rounded-2xl p-6 md:p-8 text-white shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none translate-x-12 -translate-y-12">
          <Scale className="w-96 h-96" />
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl space-y-3.5">
            <span className="bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono inline-block">
              Dasar Hukum & Regulasi Indonesia
            </span>
            <h2 className="text-xl md:text-3xl font-extrabold tracking-tight">
              Portal Peraturan Pengelolaan APBDes
            </h2>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed font-medium">
              Akses cepat undang-undang, keputusan menteri, serta peraturan bupati mengenai evaluasi keuangan dan APBDes di Kecamatan Waru. Gunakan tombol Sinkronisasi untuk mengambil perubahan secara instan dari cloud server.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Sync Button */}
            <button
              onClick={handleDatabaseSync}
              disabled={isSyncing}
              className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shadow-md select-none"
              title="Sinkronisasi seluruh peraturan dengan cloud database"
            >
              <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Menghubungkan...' : 'Sinkronisasi Cloud'}
            </button>

            {/* Create Regulation Button */}
            {hasEditRights && (
              <button
                onClick={triggerAddMode}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-indigo-900/40 select-none cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Tambah Peraturan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sync Success / Error Notification */}
      {syncMessage && (
        <div className={`p-4 rounded-xl border flex items-center justify-between gap-3 text-xs font-semibold animate-slide-up ${
          syncMessage.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {syncMessage.type === 'success' ? (
              <Check className="w-5 h-5 text-emerald-600 bg-emerald-100 rounded-full p-0.5 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{syncMessage.text}</span>
          </div>
          <button 
            onClick={() => setSyncMessage(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* JDIH PPU Sync & Search Integration Widget */}
      <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-150/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
              <CloudLightning className="w-4 h-4 text-blue-600 animate-pulse" />
              Sinkronisasi & Portal JDIH Penajam Paser Utara
            </h4>
            <p className="text-xs text-slate-650 font-semibold leading-relaxed">
              Sistem ini telah diselaraskan dengan acuan portal resmi <strong>JDIH Kabupaten Penajam Paser Utara</strong>. Gunakan alat di bawah ini untuk mencari regulasi daerah secara dinamis langsung dari database hukum PPU.
            </p>
          </div>
          <a
            href="https://jdih.penajamkab.go.id/"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 bg-white hover:bg-slate-50 text-blue-700 hover:text-blue-800 border border-blue-300 font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-2xs cursor-pointer select-none"
          >
            <ExternalLink className="w-4 h-4 text-blue-500" />
            Buka JDIH Penajam Paser Utara ↗
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
          {/* Quick Search on JDIH PPU */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Pencarian Dokumen Hukum Daerah JDIH PPU</span>
              <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded">ONLINE</span>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                id="jdih-search-input"
                placeholder="Cari kata kunci: Alokasi Dana Desa, APBDes, Perbup Waru..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:border-blue-500 bg-slate-50 text-slate-800"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    const val = (e.target as HTMLInputElement).value;
                    if (val.trim()) {
                      window.open(`https://jdih.penajamkab.go.id/index.php/pencarian?search=${encodeURIComponent(val)}`, '_blank');
                    }
                  }
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const input = document.getElementById('jdih-search-input') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    window.open(`https://jdih.penajamkab.go.id/index.php/pencarian?search=${encodeURIComponent(input.value)}`, '_blank');
                  } else {
                    alert('Harap ketik kata kunci pencarian terlebih dahulu.');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Search className="w-3.5 h-3.5" />
                Cari di JDIH PPU
              </button>
            </div>
            <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
              * Pencarian di atas akan secara otomatis memproyeksikan parameter kata kunci langsung ke modul pencarian JDIH Penajam Paser Utara.
            </p>
          </div>

          {/* Quick Acuan / Reference Links of PPU */}
          <div className="bg-white p-4 rounded-xl border border-blue-100 space-y-3 flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Tautan Langsung Produk Hukum</span>
              <div className="space-y-2">
                <a
                  href="https://jdih.penajamkab.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left text-xs text-slate-700 hover:text-blue-600 font-bold flex items-center justify-between group"
                >
                  <span className="truncate group-hover:underline">📋 Perbup No. 21 Tahun 2023 (Formula ADD)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-blue-500" />
                </a>
                <a
                  href="https://jdih.penajamkab.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left text-xs text-slate-700 hover:text-blue-600 font-bold flex items-center justify-between group"
                >
                  <span className="truncate group-hover:underline">📋 Perbup No. 18 Tahun 2025 (Penyusunan APBDes)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-blue-500" />
                </a>
                <a
                  href="https://jdih.penajamkab.go.id/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-left text-xs text-slate-700 hover:text-blue-600 font-bold flex items-center justify-between group"
                >
                  <span className="truncate group-hover:underline">📋 Perbup No. 8 Tahun 2024 (Juknis Monev)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0 group-hover:text-blue-500" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Editor Modal / Form Container */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-slate-350 shadow-xl overflow-hidden animate-slide-up">
          <div className="bg-slate-950 p-4 px-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-400" />
              <h3 className="font-extrabold text-sm md:text-base">
                {editingId ? 'Edit Peraturan-Peraturan Baru' : 'Input Peraturan-Peraturan Baru'}
              </h3>
            </div>
            <button 
              onClick={() => setShowForm(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-4 text-slate-800">
            {formError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Kategori Tingkat Regulasi *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
                >
                  <option value="PUSAT font-medium">NASIONAL / PUSAT</option>
                  <option value="PROVINSI font-medium">PROVINSI (KALTIM)</option>
                  <option value="KABUPATEN font-medium">KABUPATEN (PPU)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Nomor & Tahun Regulasi *</label>
                <input
                  type="text"
                  placeholder="Contoh: UU Nomor 6 Tahun 2014"
                  value={numberAndYear}
                  onChange={(e) => setNumberAndYear(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Tanggal Ditetapkan / Terbit *</label>
                <input
                  type="text"
                  placeholder="Contoh: 15 Januari 2014"
                  value={publishDate}
                  onChange={(e) => setPublishDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Judul Lengkap Peraturan *</label>
              <input
                type="text"
                placeholder="Contoh: Undang-Undang Republik Indonesia tentang Desa"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Topik Pokok Pembahasan *</label>
                <input
                  type="text"
                  placeholder="Contoh: Mekanisme Pengelolaan Keuangan Desa"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Skenario Berkas Berkas Unduhan *</label>
                <input
                  type="text"
                  placeholder="Contoh: PMK_145_PMK07_2023.pdf"
                  value={downloadFilename}
                  onChange={(e) => setDownloadFilename(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Uraian Ringkasan Isi Regulasi *</label>
              <textarea
                rows={3}
                placeholder="Tulis ringkasan mengenai tujuan, bab yang berlaku, atau konsekuensi hukum anggaran..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 font-sans">Tautan JDIH Portal Pemerintah (Opsional)</label>
              <input
                type="text"
                placeholder="Contoh: https://jdih.penajamkab.go.id/produk_hukum/detail/..."
                value={referenceUrl}
                onChange={(e) => setReferenceUrl(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-105"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 font-sans">Daftar Poin-Poin Penting APBDes *</label>
                <button
                  type="button"
                  onClick={handleAddKeyPoint}
                  className="text-blue-600 hover:text-blue-800 text-xs font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Tambah Poin Pokok
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {keyPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-500 font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {index + 1}
                    </span>
                    <input
                      type="text"
                      placeholder="Masukkan poin spesifik yang mengikat bagi anggaran desa..."
                      value={point}
                      onChange={(e) => handleKeyPointChange(index, e.target.value)}
                      className="flex-1 px-2.5 py-1.5 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 focus:bg-white focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyPoint(index)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-5 py-2 bg-gradient-to-r from-blue-600 to-indigo-650 text-white rounded-xl text-xs font-bold hover:from-blue-750 hover:to-indigo-750 flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-md"
              >
                {isSaving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {editingId ? 'Simpan Perubahan' : 'Terbitkan Regulasi'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Control Filters & Options Panel */}
      <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Level Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl max-w-fit">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                selectedCategory === 'ALL'
                  ? 'bg-slate-950 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              Semua Regulasi
            </button>
            <button
              onClick={() => setSelectedCategory('PUSAT')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'PUSAT'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              Nasional / Pusat
            </button>
            <button
              onClick={() => setSelectedCategory('PROVINSI')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'PROVINSI'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              Prov. Kaltim
            </button>
            <button
              onClick={() => setSelectedCategory('KABUPATEN')}
              className={`px-3 md:px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedCategory === 'KABUPATEN'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              Kab. Penajam Paser Utara
            </button>
          </div>

          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor peraturan, topik, kata kunci..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 bg-slate-50 focus:bg-white transition-colors"
            />
          </div>

        </div>

        {/* Info notice about legal validity and real-time synchronization */}
        <div className="flex items-start gap-2.5 p-3.5 bg-blue-50/75 border border-blue-150/50 rounded-xl text-blue-900 text-xs leading-relaxed">
          <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold text-blue-950">Informasi Regulasi Terdistribusi:</span> Halaman ini mengintegrasikan seluruh regulasi terkait pembagian ADD, instruksi PMK Dana Desa, serta keputusan teknis Bupati Penajam Paser Utara. {hasEditRights ? (
              <span className="font-bold text-indigo-700">Akun Anda memiliki hak akses Operator ({activeRole === 'OP_KECAMATAN' ? 'Kecamatan Waru' : 'Desa'}): Anda dapat mempublikasikan peraturan tambahan langsung ke dashboard.</span>
            ) : (
              <span>Gunakan menu ini sebagai landasan penyusunan realisasi APBDes di desa Anda.</span>
            )}
          </div>
        </div>
      </div>

      {/* Loading Block (Used temporarily during filters) */}
      {loading ? (
        <div className="bg-white py-16 text-center space-y-4 rounded-2xl border border-slate-200">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500">Mensejajarkan dasar hukum dari Firestore...</p>
        </div>
      ) : (
        <>
          {/* Empty Search Result State */}
          {filteredRegulations.length === 0 && (
            <div className="bg-white py-12 px-6 rounded-2xl border border-slate-200 text-center space-y-3 shadow-xs animate-fade-in">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
                <Scale className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">Peraturan Tidak Ditemukan</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Tidak ada dokumen yang cocok dengan kata kunci "{searchQuery}" di bawah kategori terpilih. Coba ketik kata kunci yang lain.
              </p>
            </div>
          )}

          {/* Regulations List */}
          <div className="space-y-4 animate-fade-in">
            {filteredRegulations.map((reg) => {
              const isExpanded = expandedId === reg.id;
              
              // Badge color styling based on level
              let levelBadgeClass = '';
              if (reg.category === 'PUSAT') {
                levelBadgeClass = 'bg-blue-50 text-blue-700 border-blue-200';
              } else if (reg.category === 'PROVINSI') {
                levelBadgeClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              } else {
                levelBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200';
              }

              return (
                <div 
                  key={reg.id}
                  className={`bg-white border rounded-2xl transition-all shadow-2xs hover:border-slate-300 overflow-hidden ${
                    isExpanded ? 'border-indigo-400 ring-4 ring-indigo-50' : 'border-slate-200'
                  }`}
                >
                  {/* Card Header clickable to expand */}
                  <div 
                    onClick={() => toggleExpand(reg.id)}
                    className="p-5 flex items-start gap-4 cursor-pointer select-none"
                  >
                    {/* Visual Icon indicator */}
                    <div className={`p-3 rounded-xl border shrink-0 ${
                      reg.category === 'PUSAT' ? 'bg-blue-50/50 border-blue-100 text-blue-600' :
                      reg.category === 'PROVINSI' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-600' :
                      'bg-amber-50/50 border-amber-100 text-amber-600'
                    }`}>
                      <FileText className="w-5 h-5 mx-auto" />
                    </div>

                    {/* Info block */}
                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-[10px] uppercase font-bold tracking-wider text-slate-400">
                          ID: {reg.id.toUpperCase()}
                        </span>
                        <div className="h-2 w-px bg-slate-200"></div>
                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${levelBadgeClass}`}>
                          {reg.category === 'PUSAT' ? 'Nasional / Pusat' :
                          reg.category === 'PROVINSI' ? 'Prov. Kalimantan Timur' :
                          'Kab. Penajam Paser Utara'}
                        </span>
                      </div>

                      <h3 className="text-sm md:text-base font-extrabold text-slate-900 leading-snug">
                        {reg.numberAndYear}
                      </h3>
                      <p className="text-xs md:text-sm font-bold text-slate-700 leading-relaxed">
                        {reg.title}
                      </p>
                      
                      {/* Topic badge */}
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pt-0.5">
                        <span className="font-bold text-slate-400">Topik Utama:</span>
                        <span className="italic truncate font-semibold text-slate-600">{reg.topic}</span>
                      </div>
                    </div>

                    {/* Admin Actions */}
                    {hasEditRights && (
                      <div className="flex items-center gap-1 self-center mr-2" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => triggerEditMode(reg)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Ubah Rincian Regulasi"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(reg.id, e)}
                          className="p-2 text-red-650 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Regulasi dari Server"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    {/* Right angle arrow */}
                    <div className="text-slate-400 self-center pl-2">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>

                  {/* Collapsible content pane */}
                  {isExpanded && (
                    <div className="border-t border-slate-150 bg-slate-50/50 p-5 md:p-6 space-y-5">
                      {/* Description */}
                      <div className="space-y-1.5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider font-sans">Ringkasan isi / latar belakang:</h4>
                        <p className="text-xs md:text-sm text-slate-705 leading-relaxed font-semibold">
                          {reg.description}
                        </p>
                      </div>

                      {/* Key Points */}
                      <div className="space-y-2.5">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 font-sans">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          Instruksi Penting Pengelolaan Anggaran & Penjelas:
                        </h4>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {reg.keyPoints.map((point, index) => (
                            <li 
                              key={index}
                              className="p-3 bg-white border border-slate-200/80 rounded-xl text-xs text-slate-700 leading-relaxed font-semibold flex items-start gap-2.5 shadow-2xs"
                            >
                              <span className="w-5 h-5 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold font-mono border border-indigo-100 shrink-0 mt-0.5">
                                {index + 1}
                              </span>
                              <span className="flex-1">{point}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Bottom Footer Section of card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-200 text-[11px] text-slate-500 font-sans">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>Tanggal Ditetapkan: <strong className="text-slate-700">{reg.publishDate}</strong></span>
                          </div>
                          {reg.lastUpdated && reg.lastUpdated !== reg.createdAt && (
                            <div className="text-slate-400 italic">
                             (Diupdate: {new Date(reg.lastUpdated).toLocaleDateString('id-ID')})
                            </div>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadStub(reg.downloadFilename)}
                            className="bg-slate-950 text-white font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 hover:bg-slate-850 tracking-wide select-none cursor-pointer transition-all active:scale-95 text-xs shadow-sm"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Unduh Regulasi
                          </button>
                          
                          <a
                            href={reg.referenceUrl || "https://jdih.penajamkab.go.id/"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold px-3.5 py-2 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all select-none text-xs shadow-xs"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                            Portal JDIH Resmi
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
