/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { Activity, Village, Sector, ActivityStatus, SourceOfFunds, SiskeudesPagu, BumdesMonev } from '../types';
import { 
  BarChart as RechartsBarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  Building2, 
  TrendingUp, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Search, 
  Filter, 
  ArrowUpRight, 
  DollarSign,
  Activity as ActivityIcon,
  ChevronRight,
  FileSpreadsheet,
  MapPin,
  Calendar,
  Printer,
  Database,
  UploadCloud,
  RefreshCw,
  AlertTriangle,
  Bell,
  Coins,
  Store,
  Briefcase,
  ShieldCheck,
  Award,
  ArrowRight,
  ExternalLink,
  Image as ImageIcon,
  Users
} from 'lucide-react';

interface DashboardProps {
  activities: Activity[];
  villageBudgets: Record<string, number>;
  notificationLogs: any[];
  onSelectActivity?: (activity: Activity) => void;
  activitiesAllocatedBudgets?: Record<string, number>;
  siskeudesPaguList?: SiskeudesPagu[];
  onUpdateSiskeudesPagu?: (village: Village, paguTotal: number, breakdown?: any) => Promise<void>;
  bumdesList?: BumdesMonev[];
  onNavigateToBumdes?: () => void;
  activeRole?: string;
}

export default function Dashboard({ 
  activities, 
  villageBudgets, 
  notificationLogs,
  onSelectActivity,
  activitiesAllocatedBudgets = {},
  siskeudesPaguList = [],
  onUpdateSiskeudesPagu,
  bumdesList = [],
  onNavigateToBumdes,
  activeRole
}: DashboardProps) {
  const userVillage = useMemo((): Village | 'ALL' => {
    if (activeRole === 'OP_BANGUN_MULYA') return 'Bangun Mulya';
    if (activeRole === 'OP_SESULU') return 'Sesulu';
    if (activeRole === 'OP_API_API') return 'Api-api';
    return 'ALL';
  }, [activeRole]);

  const [selectedVillage, setSelectedVillage] = useState<Village | 'ALL'>(userVillage);
  const [selectedSector, setSelectedSector] = useState<Sector | 'ALL'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<ActivityStatus | 'ALL'>('ALL');
  const [selectedSourceOfFunds, setSelectedSourceOfFunds] = useState<SourceOfFunds | 'ALL'>('ALL');
  const [selectedPhysical, setSelectedPhysical] = useState<'ALL' | '100' | 'UNDER_100'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  React.useEffect(() => {
    setSelectedVillage(userVillage);
  }, [userVillage]);

  const effectiveVillage = userVillage !== 'ALL' ? userVillage : selectedVillage;

  // 1. Filtered activities for current display or metric views
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchVillage = effectiveVillage === 'ALL' || act.village === effectiveVillage;
      const matchSector = selectedSector === 'ALL' || act.sector === selectedSector;
      const matchStatus = selectedStatus === 'ALL' || act.status === selectedStatus;
      const matchSource = selectedSourceOfFunds === 'ALL' || (act.sourceOfFunds || 'Dana Desa (DD)') === selectedSourceOfFunds;
      const matchPhysical = 
        selectedPhysical === 'ALL' ? true :
        selectedPhysical === '100' ? act.progressPhysical === 100 :
        act.progressPhysical < 100;
      const matchSearch = act.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          act.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          act.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (act.sourceOfFunds || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (act.incompleteReason || '').toLowerCase().includes(searchQuery.toLowerCase());
      return matchVillage && matchSector && matchStatus && matchSource && matchPhysical && matchSearch;
    });
  }, [activities, effectiveVillage, selectedSector, selectedStatus, selectedSourceOfFunds, selectedPhysical, searchQuery]);

  // 2. Metrics calculation
  const stats = useMemo(() => {
    let targetActivities = activities;
    let targetBudgets = Object.values(villageBudgets).reduce((a, b) => a + b, 0);

    if (effectiveVillage !== 'ALL') {
      targetActivities = activities.filter(a => a.village === effectiveVillage);
      targetBudgets = villageBudgets[effectiveVillage] || 0;
    }

    const totalActivities = targetActivities.length;
    const completed = targetActivities.filter(a => a.status === 'SELESAI').length;
    const inProgress = targetActivities.filter(a => a.status === 'DALAM_PROSES').length;
    const waitingEvaluasi = targetActivities.filter(a => a.status === 'MENUNGGU_EVALUASI').length;
    const notStarted = targetActivities.filter(a => a.status === 'BELUM_MULAI').length;
    const pendingApproval = targetActivities.filter(a => !a.isKecamatanApproved).length;
    const approved = targetActivities.filter(a => a.isKecamatanApproved).length;

    const totalBudgetAllocatedForActivities = targetActivities.reduce((sum, a) => sum + a.budgetTotal, 0);
    const totalBudgetRealized = targetActivities.reduce((sum, a) => sum + a.budgetSpent, 0);

    // Physical progress average
    const avgPhysicalProgress = totalActivities > 0 
      ? Math.round(targetActivities.reduce((sum, a) => sum + a.progressPhysical, 0) / totalActivities) 
      : 0;

    // Budget absorption relative to total APBDes allocation
    const totalBudgetAbsorptionRate = targetBudgets > 0 
      ? Math.round((totalBudgetRealized / targetBudgets) * 100) 
      : 0;

    // Budget spent relative to total activity-planned budgets
    const allocatedBudgetAbsorptionRate = totalBudgetAllocatedForActivities > 0 
      ? Math.round((totalBudgetRealized / totalBudgetAllocatedForActivities) * 100) 
      : 0;

    return {
      totalActivities,
      completed,
      inProgress,
      waitingEvaluasi,
      notStarted,
      pendingApproval,
      approved,
      totalBudgets: targetBudgets,
      totalBudgetAllocatedForActivities,
      totalBudgetRealized,
      avgPhysicalProgress,
      totalBudgetAbsorptionRate,
      allocatedBudgetAbsorptionRate
    };
  }, [activities, effectiveVillage, villageBudgets]);

  // Format currency in Rupiah
  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  // Helper for status badge colors
  const getStatusBadge = (status: ActivityStatus) => {
    switch (status) {
      case 'SELESAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Selesai
          </span>
        );
      case 'MENUNGGU_EVALUASI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Menunggu Evaluasi
          </span>
        );
      case 'DALAM_PROSES':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Dalam Proses
          </span>
        );
      case 'BELUM_MULAI':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Belum Mulai
          </span>
        );
    }
  };

  // Calculation per Village for bento tiles
  const villageStats = useMemo(() => {
    const allVillages: Village[] = ['Bangun Mulya', 'Sesulu', 'Api-api'];
    const targetVillages: Village[] = effectiveVillage === 'ALL' ? allVillages : [effectiveVillage];

    const list = targetVillages.map(vName => ({
      name: vName,
      totalBudget: villageBudgets[vName] || 0,
      spent: 0,
      count: 0,
      completedCount: 0,
      progress: 0
    }));

    list.forEach(v => {
      const vActs = activities.filter(a => a.village === v.name);
      v.spent = vActs.reduce((sum, a) => sum + a.budgetSpent, 0);
      v.count = vActs.length;
      v.completedCount = vActs.filter(a => a.status === 'SELESAI').length;
      v.progress = vActs.length > 0 ? Math.round(vActs.reduce((sum, a) => sum + a.progressPhysical, 0) / vActs.length) : 0;
    });

    return list;
  }, [activities, villageBudgets, effectiveVillage]);

  // Chart data formatted specifically for Recharts comparison
  const chartData = useMemo(() => {
    return villageStats.map(v => ({
      name: `Desa ${v.name}`,
      Pagu: v.totalBudget,
      Realisasi: v.spent,
    }));
  }, [villageStats]);

  // Filter notification logs for active village selection
  const filteredLogs = useMemo(() => {
    if (effectiveVillage === 'ALL') return notificationLogs;
    return notificationLogs.filter(log => !log.village || log.village === effectiveVillage);
  }, [notificationLogs, effectiveVillage]);

  // Format Helper for Y-Axis values to Indonesian financial notation (Milyar / Juta)
  const formatYAxis = (value: number) => {
    if (value >= 1e9) {
      return `Rp ${(value / 1e9).toFixed(1).replace('.', ',')} M`;
    }
    if (value >= 1e6) {
      return `Rp ${(value / 1e6).toFixed(0)} Jt`;
    }
    return `Rp ${value}`;
  };

  // Custom tooltips with proper padding, typography, and contrast
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const paguVal = payload[0]?.value || 0;
      const spentVal = payload[1]?.value || 0;
      const ratio = paguVal > 0 ? Math.round((spentVal / paguVal) * 100) : 0;
      return (
        <div className="bg-slate-950 border border-slate-800 text-white p-4 rounded-xl shadow-xl font-mono text-xs space-y-2.5">
          <p className="font-sans font-bold text-slate-300 border-b border-slate-800 pb-1.5">{label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5 text-slate-400 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"></span>
                Pagu APBDes:
              </span>
              <span className="font-bold text-slate-100">{formatRupiah(paguVal)}</span>
            </div>
            <div className="flex items-center gap-4 justify-between">
              <span className="flex items-center gap-1.5 text-slate-400 font-sans">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Realisasi Belanja:
              </span>
              <span className="font-bold text-emerald-400">{formatRupiah(spentVal)}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between text-[11px] font-sans">
            <span className="text-slate-400">Rasio Penyerapan:</span>
            <span className="text-blue-400 font-extrabold font-mono">{ratio}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  // Sector breakdown calculations
  const sectorData = useMemo(() => {
    const sectors: Record<string, { budget: number; spent: number; count: number }> = {};
    const targetActs = effectiveVillage === 'ALL' ? activities : activities.filter(a => a.village === effectiveVillage);
    targetActs.forEach(act => {
      if (!sectors[act.sector]) {
        sectors[act.sector] = { budget: 0, spent: 0, count: 0 };
      }
      sectors[act.sector].budget += act.budgetTotal;
      sectors[act.sector].spent += act.budgetSpent;
      sectors[act.sector].count += 1;
    });

    return Object.entries(sectors).map(([name, data]) => ({
      name,
      ...data,
      percent: data.budget > 0 ? Math.round((data.spent / data.budget) * 100) : 0
    }));
  }, [activities, effectiveVillage]);

  // Filtered BUMDes entries based on village filter
  const filteredBumdesList = useMemo(() => {
    if (!bumdesList || bumdesList.length === 0) return [];
    if (effectiveVillage === 'ALL') return bumdesList;
    return bumdesList.filter(b => b.village === effectiveVillage);
  }, [bumdesList, effectiveVillage]);

  return (
    <div id="simonev-dashboard-root" className="space-y-8">
      {/* Welcome & Context Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 bg-linear-to-r from-slate-900 via-blue-950 to-slate-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative vector mesh overlay */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <span className="text-blue-400 font-mono text-xs uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
            Kecamatan Waru • Real-time Monitoring
          </span>
          <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight mt-2">
            Simonev APBDes Waru
          </h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Sistem Monitoring dan Evaluasi Kinerja Penyelenggaraan APBDes Desa Bangun Mulya, Sesulu, dan Api-api secara transparan, efektif & akuntabel.
          </p>
        </div>
        <div className="flex items-center gap-4 bg-slate-800/60 backdrop-blur-md p-4 rounded-xl border border-slate-700 relative z-10">
          <div className="p-3 bg-blue-50/20 text-blue-400 rounded-lg">
            <ActivityIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium font-mono uppercase tracking-wider">SINKRONISASI AKTIF</div>
            <div className="text-sm font-semibold text-emerald-400 font-mono">100% Real-time Cloud</div>
          </div>
        </div>
      </div>

      {/* Village Quick Switcher Bar */}
      {userVillage === 'ALL' ? (
        <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-xl max-w-fit border border-slate-200">
          <button
            onClick={() => setSelectedVillage('ALL')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              selectedVillage === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Semua Wilayah ({activities.length})
          </button>
          {(['Bangun Mulya', 'Sesulu', 'Api-api'] as Village[]).map((v) => {
            const count = activities.filter(a => a.village === v).length;
            return (
              <button
                key={v}
                onClick={() => setSelectedVillage(v)}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
                  selectedVillage === v
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Desa {v} ({count})
              </button>
            );
          })}
        </div>
      ) : (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 border border-blue-200 rounded-xl max-w-fit text-blue-900 text-xs font-extrabold shadow-2xs">
          <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Wilayah Dasbor Operator: <strong className="text-blue-700">Desa {userVillage}</strong> ({activities.filter(a => a.village === userVillage).length} kegiatan)</span>
        </div>
      )}

      {/* Main KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
        {/* KPI 1: Total APBDes Allocation */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pagu Total APBDes</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono tracking-tight flex items-baseline gap-1 flex-wrap">
                {formatRupiah(stats.totalBudgets)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1 flex-wrap">
                <span>{effectiveVillage === 'ALL' ? 'Total 3 Desa Waru' : `Pagu Desa ${effectiveVillage}`}</span>
                {effectiveVillage !== 'ALL' && siskeudesPaguList.find(p => p.village === effectiveVillage)?.isSynced && (
                  <span className="inline-flex items-center px-1.5 py-0.2 bg-emerald-100 text-emerald-800 text-[8px] rounded font-bold uppercase tracking-wider font-mono border border-emerald-250">Sync</span>
                )}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-[10px] text-slate-500">
              <span className="font-semibold">Rencana Simonev:</span>
              <span className="font-bold text-slate-700 font-mono">
                {formatRupiah(effectiveVillage === 'ALL' 
                  ? Object.values(activitiesAllocatedBudgets).reduce((a, b) => a + b, 0)
                  : (activitiesAllocatedBudgets[effectiveVillage] || 0)
                )}
              </span>
            </div>
            {(() => {
              const plannedSum = effectiveVillage === 'ALL' 
                ? Object.values(activitiesAllocatedBudgets).reduce((a, b) => a + b, 0)
                : (activitiesAllocatedBudgets[effectiveVillage] || 0);
              const planPercent = stats.totalBudgets > 0 ? Math.round((plannedSum / stats.totalBudgets) * 100) : 0;
              return (
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>Rasio Terencana:</span>
                    <span>{planPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${Math.min(planPercent, 100)}%` }} />
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* KPI 2: Budget Realized */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Realisasi Belanja</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {formatRupiah(stats.totalBudgetRealized)}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Pencairan SPJ Realtime
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-[10px]">Penyerapan APBDes:</span>
              <span className="font-bold text-emerald-600 font-mono text-[11px]">{stats.totalBudgetAbsorptionRate}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(stats.totalBudgetAbsorptionRate, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 3: Physical Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Progres Fisik</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                <ActivityIcon className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                {stats.avgPhysicalProgress}%
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Rata-rata Fisik Lapangan
              </p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-[10px]">Capaian Fisik:</span>
              <span className="font-bold text-amber-600 font-mono text-[11px]">{stats.avgPhysicalProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${stats.avgPhysicalProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* KPI 4: Menunggu Evaluasi */}
        <div className="bg-white p-5 rounded-2xl border border-orange-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-orange-700 uppercase tracking-wider">Menunggu Evaluasi</span>
              <div className="p-2 bg-orange-100 text-orange-600 rounded-xl">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-orange-900 font-mono tracking-tight">
                {stats.waitingEvaluasi}
              </div>
              <p className="text-[11px] text-orange-600 font-medium leading-tight">
                Kegiatan Fisik 100%
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-orange-100 flex items-center justify-between text-[10px] text-orange-700 font-semibold">
            <span>Perlu Verifikasi Kec.</span>
            <span className="px-1.5 py-0.5 bg-orange-100 rounded text-orange-800 font-mono font-bold">{stats.waitingEvaluasi} usulan</span>
          </div>
        </div>

        {/* KPI 5: Dalam Proses */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Dalam Proses</span>
              <div className="p-2 bg-blue-100 text-blue-600 rounded-xl">
                <RefreshCw className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-blue-900 font-mono tracking-tight">
                {stats.inProgress}
              </div>
              <p className="text-[11px] text-blue-600 font-medium leading-tight">
                Pekerjaan Fisik Berjalan
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between text-[10px] text-blue-700 font-semibold">
            <span>Pelaksanaan Desa</span>
            <span className="px-1.5 py-0.5 bg-blue-100 rounded text-blue-800 font-mono font-bold">{stats.inProgress} usulan</span>
          </div>
        </div>

        {/* KPI 6: Disetujui (ACC) */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between min-h-[165px]">
          <div>
            <div className="flex items-center justify-between pb-3">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Disetujui (ACC)</span>
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl md:text-4xl font-extrabold text-emerald-900 font-mono tracking-tight">
                {stats.approved}
              </div>
              <p className="text-[11px] text-emerald-600 font-medium leading-tight">
                Pengesahan Kecamatan
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t border-emerald-100 flex items-center justify-between text-[10px] text-emerald-700 font-semibold">
            <span>Ttd Digital Valid</span>
            <span className="px-1.5 py-0.5 bg-emerald-100 rounded text-emerald-800 font-mono font-bold">{stats.approved} usulan</span>
          </div>
        </div>
      </div>

      {/* Pagu Anggaran Manual Notification Badge */}
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
            <Coins className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
              Kelola Pagu Anggaran Desa Mandiri
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h4>
            <p className="text-xs text-slate-400">Pagu anggaran total Desa dikonfigurasi berdasarkan rincian manual (DD, ADD, PBH, Bankeu, PAD).</p>
          </div>
        </div>
        <div className="text-xs text-emerald-400 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-900/40 font-mono font-bold shrink-0 hidden sm:inline-block z-10">
          SISTEM AKTIF & TERKENDALI
        </div>
      </div>

      {/* Visualisasi Recharts Comparison Bar Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Perbandingan Realisasi Penyerapan vs Pagu Anggaran per Desa
            </h3>
            <p className="text-xs text-slate-550 mt-1">
              Grafik komparatif real-time yang membandingkan pagu APBDes dengan total realisasi belanja yang telah terserap di masing-masing desa.
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600 font-sans self-start sm:self-center">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-blue-600 rounded-xs"></span>
              Pagu APBDes
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded-xs"></span>
              Realisasi Penyerapan
            </div>
          </div>
        </div>

        <div className="w-full h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b" 
                fontSize={12} 
                fontWeight={600} 
                tickLine={false} 
                axisLine={false} 
              />
              <YAxis 
                stroke="#64748b" 
                fontSize={10} 
                fontWeight={500}
                tickLine={false} 
                axisLine={false} 
                tickFormatter={formatYAxis} 
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.04)' }} />
              <Bar dataKey="Pagu" fill="#2563eb" radius={[6, 6, 0, 0]} name="Pagu APBDes" barSize={36} />
              <Bar dataKey="Realisasi" fill="#10b981" radius={[6, 6, 0, 0]} name="Realisasi Penyerapan" barSize={36} />
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Informational & Financial Section: Status & Kinerja BUMDes Setiap Desa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Store className="w-5 h-5 text-emerald-600" />
              Profil & Kinerja BUMDes Setiap Desa ({filteredBumdesList.length} Desa)
            </h3>
            <p className="text-xs text-slate-550 mt-1">
              Rangkuman perkembangan kelembagaan, unit usaha, aset, pendapatan, serta kontribusi PADes BUMDes terdaftar di Kecamatan Waru.
            </p>
          </div>
          {onNavigateToBumdes && (
            <button
              type="button"
              onClick={onNavigateToBumdes}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200/80 transition-all cursor-pointer shrink-0 self-start sm:self-center"
            >
              <span>Detail Monev BUMDes Lengkap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {filteredBumdesList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
            <Store className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-500 font-semibold">Belum ada data Monev BUMDes untuk wilayah yang dipilih.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBumdesList.map((item) => {
              const isSehat = item.healthScore === 'Sehat/Berkembang';
              const isPembinaan = item.healthScore === 'Perlu Pembinaan';
              const healthBadgeClass = isSehat 
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                : isPembinaan 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-rose-100 text-rose-800 border-rose-300';

              const activeUnits = (item.units || []).filter(u => u.status === 'Aktif Beroperasi');
              const totalUnits = (item.units || []).length;
              const photos = item.musdesPhotos && item.musdesPhotos.length > 0 
                ? item.musdesPhotos 
                : (item.musdesPhotoUrl ? [item.musdesPhotoUrl] : []);

              return (
                <div 
                  key={item.id} 
                  className="bg-slate-50/60 border border-slate-200 rounded-xl p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    {/* Top Header: Village & Health Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-md border border-slate-200 shadow-2xs">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        Desa {item.village}
                      </span>
                      <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full border ${healthBadgeClass}`}>
                        {item.healthScore || 'Belum Dievaluasi'}
                      </span>
                    </div>

                    {/* BUMDes Name & Director */}
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {item.bumdesName || `BUMDes ${item.village}`}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-1 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          Direktur: <strong className="text-slate-700">{item.directorName || '-'}</strong>
                        </span>
                        <span>•</span>
                        <span className="font-mono text-[11px]">Berdiri {item.establishedYear || '-'}</span>
                      </div>
                    </div>

                    {/* Legal Status */}
                    <div className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">Badan Hukum:</span>
                      <span className={`font-bold flex items-center gap-1 ${
                        item.lawStatus === 'Sudah Terbit' ? 'text-emerald-700' : 'text-amber-700'
                      }`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {item.lawStatus || 'Belum Ada'}
                      </span>
                    </div>

                    {/* 4 Financial Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2.5 bg-white rounded-lg border border-slate-150">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Aset</p>
                        <p className="font-extrabold text-slate-800 font-mono mt-0.5">{formatRupiah(item.totalAssets || 0)}</p>
                      </div>
                      <div className="p-2.5 bg-white rounded-lg border border-slate-150">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendapatan/Omset</p>
                        <p className="font-extrabold text-slate-800 font-mono mt-0.5">{formatRupiah(item.totalRevenue || 0)}</p>
                      </div>
                      <div className="p-2.5 bg-emerald-50/50 rounded-lg border border-emerald-100">
                        <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">Laba Bersih</p>
                        <p className="font-extrabold text-emerald-800 font-mono mt-0.5">{formatRupiah(item.netProfit || 0)}</p>
                      </div>
                      <div className="p-2.5 bg-blue-50/50 rounded-lg border border-blue-100">
                        <p className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Setoran PADes</p>
                        <p className="font-extrabold text-blue-800 font-mono mt-0.5">{formatRupiah(item.padesContribution || 0)}</p>
                      </div>
                    </div>

                    {/* Business Units List */}
                    <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-blue-600" />
                          Unit Usaha ({totalUnits})
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {activeUnits.length} Aktif Beroperasi
                        </span>
                      </div>
                      {totalUnits === 0 ? (
                        <p className="text-[11px] text-slate-400 italic">Belum ada unit usaha terdaftar.</p>
                      ) : (
                        <div className="space-y-1.5 pt-1">
                          {item.units.map((unit) => (
                            <div key={unit.id} className="flex items-center justify-between text-[11px] bg-slate-50 p-2 rounded-md border border-slate-100">
                              <span className="font-medium text-slate-800 truncate max-w-[170px]">{unit.name}</span>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                unit.financialCondition === 'Untung' ? 'bg-emerald-100 text-emerald-800' :
                                unit.financialCondition === 'Impas' ? 'bg-blue-100 text-blue-800' :
                                'bg-rose-100 text-rose-800'
                              }`}>
                                {unit.financialCondition}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Local Workforce & UMKM */}
                    <div className="flex items-center justify-between text-[11px] text-slate-600 px-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        Tenaga Kerja: <strong className="text-slate-800">{item.totalEmployees || 0} Orang</strong>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-slate-400" />
                        UMKM Binaan: <strong className="text-slate-800">{item.assistedUmkm || 0} Usaha</strong>
                      </span>
                    </div>

                    {/* Photos Thumbnail Preview */}
                    {photos.length > 0 && (
                      <div className="space-y-1 pt-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-blue-500" /> Dokumentasi Musdes ({photos.length} Foto):
                        </p>
                        <div className="flex gap-1.5 overflow-x-auto pb-1">
                          {photos.map((pUrl, pIdx) => (
                            <img
                              key={pIdx}
                              src={pUrl}
                              alt={`Dokumentasi Musdes ${item.village}`}
                              referrerPolicy="no-referrer"
                              className="w-14 h-11 object-cover rounded-md border border-slate-200 shadow-2xs shrink-0"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Navigation CTA */}
                  {onNavigateToBumdes && (
                    <button
                      type="button"
                      onClick={onNavigateToBumdes}
                      className="w-full mt-3 py-2 bg-slate-900 hover:bg-blue-600 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <span>Lihat Rincian & Laporan PDF</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Widget: Village Performance Bento Cards */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Status Keuangan & Fisik Desa Se-Kecamatan Waru
          </h3>

          <div className="space-y-5">
            {villageStats.map(v => {
              const absorptionRate = v.totalBudget > 0 ? Math.round((v.spent / v.totalBudget) * 100) : 0;
              return (
                <div key={v.name} className="p-4 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                    <div>
                      <h4 className="font-semibold text-slate-900 text-sm sm:text-base">Desa {v.name}</h4>
                      <p className="text-xs text-slate-500">{v.count} total usulan terencana</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">Pagu APBDes</div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 font-mono">{formatRupiah(v.totalBudget)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Budget Absorption */}
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          Penyerapan Dana
                        </span>
                        <span className="font-bold text-emerald-700 font-mono">{absorptionRate}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(absorptionRate, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>{formatRupiah(v.spent)}</span>
                        <span>realisasi</span>
                      </div>
                    </div>

                    {/* Physical Progress */}
                    <div className="bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-xs text-slate-600 mb-1.5">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <ActivityIcon className="w-3.5 h-3.5 text-amber-500" />
                          Progres Fisik Rata-rata
                        </span>
                        <span className="font-bold text-amber-600 font-mono">{v.progress}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-amber-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${v.progress}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                        <span>{v.completedCount} / {v.count} Selesai</span>
                        <span>kegiatan</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Widget: Real-time Update Logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Aktivitas Terkini
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
              Live Feed
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 max-h-[380px] pr-1">
            {filteredLogs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-8">Belum ada pembaruan log untuk wilayah ini.</p>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.id} className="p-3 bg-slate-50 hover:bg-slate-100/70 transition-colors rounded-xl border border-slate-200/50 relative overflow-hidden flex gap-3">
                  <div className={`w-1 absolute left-0 top-0 bottom-0 ${
                    log.type === 'approval' ? 'bg-emerald-500' :
                    log.type === 'success' ? 'bg-blue-500' :
                    log.type === 'warn' ? 'bg-amber-500' : 'bg-slate-400'
                  }`} />
                  
                  <div className="space-y-1 pl-1 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-xs font-bold text-slate-800">{log.title}</span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 md:line-clamp-3">{log.description}</p>
                    {log.village && (
                      <span className="inline-block text-[9px] px-2 py-0.5 bg-slate-200/80 text-slate-700 font-semibold rounded-sm font-sans mt-1">
                        Desa {log.village}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Sectoral Allocations visual custom chart (CSS Area grid) */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-500" />
          Kinerja Bidang APBDes (Penyerapan Anggaran Kegiatan)
        </h3>

        {sectorData.length === 0 ? (
          <p className="text-slate-400 text-sm py-4 text-center">Belum ada usulan kegiatan di bidang APBDes.</p>
        ) : (
          <div className="space-y-4">
            {sectorData.map(sector => (
              <div key={sector.name} className="space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm gap-1">
                  <div className="font-semibold text-slate-800 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm bg-blue-600 inline-block"></span>
                    {sector.name} <span className="font-normal text-slate-400 font-mono">({sector.count} usulan)</span>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs text-slate-600">
                    <span>Realisasi: <strong className="text-slate-900">{formatRupiah(sector.spent)}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span>Pagu: <strong className="text-slate-900">{formatRupiah(sector.budget)}</strong></span>
                    <span className="text-slate-300">|</span>
                    <span className="text-blue-600 font-bold">{sector.percent}%</span>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden border border-slate-200/50">
                    <div 
                       className="bg-blue-600 h-full rounded-full transition-all duration-500 relative"
                      style={{ width: `${Math.min(sector.percent, 100)}%` }}
                    >
                      {sector.percent > 15 && (
                        <span className="absolute inset-y-0 right-2 flex items-center text-[9px] font-bold text-white font-mono">
                          {sector.percent}%
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Table & List Section */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Filter Panel */}
        <div className="p-6 border-b border-slate-100 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pencarian & Pelacakan Kegiatan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Gunakan filter di bawah untuk melihat rincian realisasi fisik dan serapan di tingkat dusun.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-500 bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg font-mono">
                Menampilkan: {filteredActivities.length} Kegiatan
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 pt-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari kegiatan..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 placeholder-slate-400 bg-slate-50/50"
              />
            </div>

            {/* Filter Desa */}
            <div className="relative">
              {userVillage !== 'ALL' ? (
                <div className="w-full pl-3 pr-3 py-2 text-sm bg-slate-100 border border-slate-300 rounded-lg font-semibold text-slate-700 flex items-center justify-between">
                  <span className="truncate">Desa {userVillage}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold shrink-0">Terkunci</span>
                </div>
              ) : (
                <>
                  <select
                    value={selectedVillage}
                    onChange={(e) => setSelectedVillage(e.target.value as Village | 'ALL')}
                    className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-semibold text-slate-700"
                  >
                    <option value="ALL">Semua Desa (Bangun Mulya, Sesulu, Api-api)</option>
                    <option value="Bangun Mulya">Desa Bangun Mulya</option>
                    <option value="Sesulu">Desa Sesulu</option>
                    <option value="Api-api">Desa Api-api</option>
                  </select>
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </>
              )}
            </div>

            {/* Filter Bidang / Sektor */}
            <div className="relative">
              <select
                value={selectedSector}
                onChange={(e) => setSelectedSector(e.target.value as Sector | 'ALL')}
                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-semibold text-slate-700 truncate"
              >
                <option value="ALL">Semua Bidang APBDes</option>
                <option value="Penyelenggaraan Pemerintahan">Penyelenggaraan Pemerintahan</option>
                <option value="Pembangunan Desa (Infrastruktur)">Pembangunan Desa (Infrastruktur)</option>
                <option value="Pembangunan Desa (Non Infrastruktur)">Pembangunan Desa (Non Infrastruktur)</option>
                <option value="Pembinaan Kemasyarakatan">Pembinaan Kemasyarakatan</option>
                <option value="Pemberdayaan Masyarakat">Pemberdayaan Masyarakat</option>
                <option value="Penanggulangan Bencana & Mendesak">Kebencanaan & Mendesak</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Status */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as ActivityStatus | 'ALL')}
                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-semibold text-slate-700"
              >
                <option value="ALL">Semua Status Realisasi</option>
                <option value="BELUM_MULAI">Belum Mulai</option>
                <option value="DALAM_PROSES">Dalam Proses</option>
                <option value="MENUNGGU_EVALUASI">Menunggu Evaluasi</option>
                <option value="SELESAI">Selesai</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Sumber Dana */}
            <div className="relative">
              <select
                value={selectedSourceOfFunds}
                onChange={(e) => setSelectedSourceOfFunds(e.target.value as SourceOfFunds | 'ALL')}
                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-semibold text-slate-700"
              >
                <option value="ALL">Semua Sumber Dana</option>
                <option value="Dana Desa (DD)">Dana Desa (DD)</option>
                <option value="Alokasi Dana Desa (ADD)">Alokasi Dana Desa (ADD)</option>
                <option value="Pendapatan Bagi Hasil (PBH)">Pendapatan Bagi Hasil (PBH)</option>
                <option value="Bantuan Keuangan (Bankeu)">Bantuan Keuangan (Bankeu)</option>
                <option value="Pendapatan Asli Desa (PAD)">Pendapatan Asli Desa (PAD)</option>
                <option value="Sisa Lebih Perhitungan Anggaran (SiLPA)">Sisa Lebih Perhitungan Anggaran (SiLPA)</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Filter Progres Fisik */}
            <div className="relative">
              <select
                value={selectedPhysical}
                onChange={(e) => setSelectedPhysical(e.target.value as 'ALL' | '100' | 'UNDER_100')}
                className="w-full pl-3 pr-8 py-2 text-sm bg-slate-50/50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 appearance-none font-semibold text-slate-700"
              >
                <option value="ALL">Semua Progres Fisik</option>
                <option value="100">Fisik 100%</option>
                <option value="UNDER_100">Fisik di Bawah 100%</option>
              </select>
              <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Desktop Table View / Mobile Card View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6">Nama Kegiatan & Sektor</th>
                <th className="py-4 px-6">Desa / Wilayah</th>
                <th className="py-4 px-6">Anggaran (Pagu / Serapan)</th>
                <th className="py-4 px-6">Progres Fisik</th>
                <th className="py-4 px-6">Status & Rekomendasi</th>
                <th className="py-4 px-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredActivities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400 font-medium">
                    Tidak ditemukan kegiatan yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredActivities.map((act) => {
                  const absorptionPercent = act.budgetTotal > 0 ? Math.round((act.budgetSpent / act.budgetTotal) * 100) : 0;
                  return (
                    <tr 
                      key={act.id} 
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectActivity && onSelectActivity(act)}
                    >
                      <td className="py-5 px-6 max-w-sm">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {act.name}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="inline-block text-[10px] uppercase font-mono px-2 py-0.5 rounded-sm bg-slate-100 text-slate-600 tracking-wide line-clamp-1">
                              {act.sector}
                            </span>
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider font-mono">
                              🪙 {act.sourceOfFunds || 'Dana Desa (DD)'}
                            </span>
                          </div>
                          {act.progressPhysical < 100 && act.incompleteReason && (
                            <div className="text-[11px] text-rose-700 bg-rose-50/70 rounded-md border border-rose-200/50 px-2 py-1 mt-1.5 flex items-center gap-1.5 font-medium max-w-sm">
                              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                              <span className="truncate" title={act.incompleteReason}>
                                Belum Rampung: {act.incompleteReason}
                              </span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                          <MapPin className="w-4 h-4 text-slate-400" />
                          Desa {act.village}
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1 font-mono">
                          <div className="text-xs text-slate-400">Pagu: <span className="font-semibold text-slate-700">{formatRupiah(act.budgetTotal)}</span></div>
                          <div className="text-xs font-semibold text-emerald-700">SPJ: <span>{formatRupiah(act.budgetSpent)}</span> <span className="text-[10px] bg-emerald-50 text-emerald-800 px-1 py-0.2 rounded font-normal">{absorptionPercent}%</span></div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="w-32 space-y-1.5">
                          <div className="flex justify-between items-center text-xs">
                            <span className="font-bold text-slate-700">{act.progressPhysical}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/40">
                            <div 
                              className={`h-full rounded-full transition-all duration-300 ${
                                act.progressPhysical === 100 ? 'bg-emerald-500' :
                                act.progressPhysical > 50 ? 'bg-amber-400' : 'bg-rose-400'
                              }`} 
                              style={{ width: `${act.progressPhysical}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-5 px-6">
                        <div className="space-y-1.5">
                          <div>{getStatusBadge(act.status)}</div>
                          {act.isKecamatanApproved ? (
                            <span className="inline-block text-[10px] text-emerald-600 bg-emerald-100/50 font-bold px-2 py-0.5 rounded-sm">
                              Telah Disetujui Camat ✔
                            </span>
                          ) : act.recommendation ? (
                            <span className="inline-block text-[10px] text-amber-700 bg-amber-50 rounded-sm italic px-2 py-0.5 max-w-[180px] truncate">
                              Yg diperbaiki: {act.recommendation}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="py-5 px-6 text-right">
                        <button className="p-2 bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-flex items-center">
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View / List Cards (Fall-back for responsive viewports) */}
        <div className="block md:hidden divide-y divide-slate-100">
          {filteredActivities.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm font-medium">
              Tidak ditemukan kegiatan.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const absorptionPercent = act.budgetTotal > 0 ? Math.round((act.budgetSpent / act.budgetTotal) * 100) : 0;
              return (
                <div 
                  key={act.id} 
                  className="p-4 hover:bg-slate-50 active:bg-slate-100 transition-colors space-y-4 cursor-pointer"
                  onClick={() => onSelectActivity && onSelectActivity(act)}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wide">
                        {act.sector}
                      </span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-blue-50 text-blue-700 border border-blue-100 uppercase tracking-wider font-mono">
                        🪙 {act.sourceOfFunds || 'Dana Desa (DD)'}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-tight group-hover:text-blue-600">
                      {act.name}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Desa {act.village}
                    </div>
                    {act.progressPhysical < 100 && act.incompleteReason && (
                      <div className="text-[11px] text-rose-700 bg-rose-50/70 rounded-md border border-rose-200/50 px-2 py-1 mt-2 flex items-center gap-1.5 font-medium">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-rose-500" />
                        <span>Belum Rampung: {act.incompleteReason}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Anggaran</div>
                      <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{formatRupiah(act.budgetTotal)}</div>
                      <div className="text-[9px] text-emerald-600 mt-1 font-semibold">Terealisi: {absorptionPercent}%</div>
                    </div>

                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Fisik</div>
                      <div className="text-xs font-bold text-slate-800 font-mono mt-0.5">{act.progressPhysical}%</div>
                      <div className="w-full bg-slate-200 h-1 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="bg-blue-600 h-full rounded-full" 
                          style={{ width: `${act.progressPhysical}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-dashed border-slate-100">
                    <div>{getStatusBadge(act.status)}</div>
                    <span className="text-xs text-blue-600 font-semibold flex items-center gap-0.5">
                      Rincian <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

    </div>
  );
}
