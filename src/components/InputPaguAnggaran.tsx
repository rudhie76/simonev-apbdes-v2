/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { SiskeudesPagu, Village } from '../types';
import { 
  Database, 
  Coins, 
  CheckCircle2, 
  Lock, 
  Info, 
  AlertTriangle,
  Scale,
  Edit3
} from 'lucide-react';

interface InputPaguAnggaranProps {
  paguList: SiskeudesPagu[];
  onUpdatePagu: (village: Village, paguTotal: number, breakdown: { dd: number; add: number; pad: number; pbh: number; bankeu: number; silpa: number }, year?: number) => Promise<void>;
  activeRole: string;
  selectedYear?: number;
}

export default function InputPaguAnggaran({
  paguList,
  onUpdatePagu,
  activeRole,
  selectedYear = 2026
}: InputPaguAnggaranProps) {
  // Determine if user has restricted access
  const isOperatorDesa = activeRole !== 'OP_KECAMATAN';
  
  // Set default village based on role
  const getDefaultVillage = (): Village => {
    if (activeRole === 'OP_BANGUN_MULYA') return 'Bangun Mulya';
    if (activeRole === 'OP_SESULU') return 'Sesulu';
    if (activeRole === 'OP_API_API') return 'Api-api';
    return 'Bangun Mulya'; // OP_KECAMATAN default
  };

  const [targetVillage, setTargetVillage] = useState<Village>(getDefaultVillage());

  // Form Fields
  const [dd, setDd] = useState<number>(0);
  const [add, setAdd] = useState<number>(0);
  const [pbh, setPbh] = useState<number>(0);
  const [bankeu, setBankeu] = useState<number>(0);
  const [pad, setPad] = useState<number>(0);
  const [silpa, setSilpa] = useState<number>(0);

  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Helper to retrieve pagu record for a village and year (with fallback baseline)
  const getLatestPagu = (v: Village): SiskeudesPagu | undefined => {
    // 1. Exact match for village AND selectedYear
    const exactMatches = paguList.filter(p => p.village === v && (p.year || 2026) === selectedYear);
    if (exactMatches.length > 0) {
      return exactMatches.sort((a, b) => new Date(b.lastSynced || 0).getTime() - new Date(a.lastSynced || 0).getTime())[0];
    }
    // 2. Fallback baseline from any year if no entry exists yet for selectedYear
    const fallbackMatches = paguList.filter(p => p.village === v);
    if (fallbackMatches.length > 0) {
      return fallbackMatches.sort((a, b) => new Date(b.lastSynced || 0).getTime() - new Date(a.lastSynced || 0).getTime())[0];
    }
    return undefined;
  };

  // Sync state whenever targetVillage or selectedYear changes, pre-filling with current Firestore values
  useEffect(() => {
    const currentPagu = getLatestPagu(targetVillage);
    if (currentPagu && currentPagu.fundsBreakdown) {
      setDd(currentPagu.fundsBreakdown.dd || 0);
      setAdd(currentPagu.fundsBreakdown.add || 0);
      setPbh(currentPagu.fundsBreakdown.pbh || 0);
      setBankeu(currentPagu.fundsBreakdown.bankeu || 0);
      setPad(currentPagu.fundsBreakdown.pad || 0);
      setSilpa(currentPagu.fundsBreakdown.silpa || 0);
    } else {
      // Default baseline values if not present
      setDd(0);
      setAdd(0);
      setPbh(0);
      setBankeu(0);
      setPad(0);
      setSilpa(0);
    }
    setSaveSuccess(false);
    setIsDirty(false);
  }, [targetVillage, selectedYear, paguList]);

  // If paguList updates from server and user has not made local unsaved edits, sync baseline once
  useEffect(() => {
    if (!isDirty) {
      const currentPagu = getLatestPagu(targetVillage);
      if (currentPagu && currentPagu.fundsBreakdown) {
        setDd(currentPagu.fundsBreakdown.dd || 0);
        setAdd(currentPagu.fundsBreakdown.add || 0);
        setPbh(currentPagu.fundsBreakdown.pbh || 0);
        setBankeu(currentPagu.fundsBreakdown.bankeu || 0);
        setPad(currentPagu.fundsBreakdown.pad || 0);
        setSilpa(currentPagu.fundsBreakdown.silpa || 0);
      }
    }
  }, [paguList, selectedYear]);

  // Adjust target village if activeRole changes
  useEffect(() => {
    setTargetVillage(getDefaultVillage());
  }, [activeRole]);

  // Calculations
  const paguTotal = dd + add + pbh + bankeu + pad + silpa;

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(value);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    
    try {
      await onUpdatePagu(targetVillage, paguTotal, {
        dd,
        add,
        pbh,
        bankeu,
        pad,
        silpa
      }, selectedYear);
      setSaveSuccess(true);
      setIsDirty(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Header Banner */}
      <div className="p-6 bg-slate-900 rounded-2xl text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <span className="text-blue-400 font-mono text-xs uppercase tracking-widest bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
              Input Manual Pagu Belanja
            </span>
            <h1 className="text-2xl md:text-3xl font-sans font-extrabold tracking-tight mt-2 flex items-center gap-2">
              <Coins className="w-7 h-7 text-yellow-500" />
              Input Pagu Anggaran Desa
            </h1>
            <p className="text-slate-350 text-xs md:text-sm max-w-2xl leading-relaxed">
              Konfigurasikan plafon / pagu belanja induk Desa secara mandiri berdasarkan sumber pendanaan aktual (DD, ADD, PBH, Bankeu, PAD) untuk referensi rasio realisasi.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-950/50 border border-emerald-500/30 px-3.5 py-2 rounded-xl text-emerald-400 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Mode Input Mandiri Aktif
          </div>
        </div>
      </div>

      {/* Target Status Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {(['Bangun Mulya', 'Sesulu', 'Api-api'] as Village[]).map((v) => {
          const paguObj = getLatestPagu(v);
          const isSelected = targetVillage === v;
          const isRestrictedForUser = isOperatorDesa && getDefaultVillage() !== v;

          return (
            <div 
              key={v} 
              onClick={() => {
                if (!isRestrictedForUser) {
                  setTargetVillage(v);
                }
              }}
              className={`p-5 rounded-2xl border transition-all ${
                isRestrictedForUser 
                  ? 'opacity-65 bg-slate-50 border-slate-200 cursor-not-allowed' 
                  : isSelected 
                    ? 'bg-blue-50/40 border-blue-600 shadow-md ring-2 ring-blue-500/15 cursor-pointer' 
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Pagu Desa</span>
                {isRestrictedForUser ? (
                  <span className="bg-slate-200 text-slate-500 border border-slate-300 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-mono">
                    <Lock className="w-2 h-2" /> Terkunci
                  </span>
                ) : isSelected ? (
                  <span className="bg-blue-500/10 text-blue-600 border border-blue-500/20 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span> Sedang Diedit
                  </span>
                ) : (
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase font-mono">
                    Tersimpan
                  </span>
                )}
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Desa {v}</h3>
              <p className="text-2xl font-black font-mono text-slate-800 mt-2">
                {paguObj ? formatRupiah(paguObj.paguTotal) : 'Rp 0'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Terakhir Diupdate: {paguObj?.lastSynced ? new Date(paguObj.lastSynced).toLocaleString('id-ID') : '-'}
              </p>

              {paguObj?.fundsBreakdown && (
                <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-6 gap-1 text-center text-[9px] font-mono">
                  <div className="bg-slate-50 p-1 rounded">
                    <div className="text-slate-400 font-bold">DD</div>
                    <div className="font-semibold text-slate-700 truncate">{formatRupiah(paguObj.fundsBreakdown.dd).replace('Rp', '').trim()}</div>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <div className="text-slate-400 font-bold">ADD</div>
                    <div className="font-semibold text-slate-700 truncate">{formatRupiah(paguObj.fundsBreakdown.add).replace('Rp', '').trim()}</div>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <div className="text-slate-400 font-bold">PBH</div>
                    <div className="font-semibold text-slate-700 truncate">{formatRupiah(paguObj.fundsBreakdown.pbh || 0).replace('Rp', '').trim()}</div>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <div className="text-slate-400 font-bold">BK</div>
                    <div className="font-semibold text-slate-700 truncate">{formatRupiah(paguObj.fundsBreakdown.bankeu || 0).replace('Rp', '').trim()}</div>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <div className="text-slate-400 font-bold">PAD</div>
                    <div className="font-semibold text-slate-700 truncate">{formatRupiah(paguObj.fundsBreakdown.pad || 0).replace('Rp', '').trim()}</div>
                  </div>
                  <div className="bg-slate-50 p-1 rounded">
                    <div className="text-slate-400 font-bold">SLP</div>
                    <div className="font-semibold text-slate-700 truncate">{formatRupiah(paguObj.fundsBreakdown.silpa || 0).replace('Rp', '').trim()}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Input Workspace */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
        
        {/* Left Side: Form Fields */}
        <form onSubmit={handleSave} className="lg:col-span-7 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
                <span><Edit3 className="w-5 h-5 text-blue-500" /></span> Form Input Alokasi Anggaran - Desa {targetVillage}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOperatorDesa 
                  ? 'Hak akses Anda terbatas pada pengeditan data Pagu APBDes desa Anda sendiri.' 
                  : 'Sebagai operator Kecamatan, Anda bebas memilih desa di atas dan menyunting pagunya.'}
              </p>
            </div>
            <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 text-xs font-mono font-extrabold rounded-lg border border-blue-200 shrink-0 self-start sm:self-center">
              TA {selectedYear}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Field: DD */}
            <div className="space-y-1.5">
              <label htmlFor="input-dd" className="text-xs font-bold text-slate-600 block">
                Dana Desa (DD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">Rp</span>
                <input
                  id="input-dd"
                  type="number"
                  min="0"
                  value={dd || ''}
                  onChange={(e) => {
                    setDd(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-xl border border-slate-250 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden tracking-wide font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formatRupiah(dd)}
              </span>
            </div>

            {/* Field: ADD */}
            <div className="space-y-1.5">
              <label htmlFor="input-add" className="text-xs font-bold text-slate-600 block">
                Alokasi Dana Desa (ADD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">Rp</span>
                <input
                  id="input-add"
                  type="number"
                  min="0"
                  value={add || ''}
                  onChange={(e) => {
                    setAdd(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-xl border border-slate-250 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden tracking-wide font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formatRupiah(add)}
              </span>
            </div>

            {/* Field: PBH */}
            <div className="space-y-1.5">
              <label htmlFor="input-pbh" className="text-xs font-bold text-slate-600 block">
                Bagi Hasil Pajak & Retribusi (PBH)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">Rp</span>
                <input
                  id="input-pbh"
                  type="number"
                  min="0"
                  value={pbh || ''}
                  onChange={(e) => {
                    setPbh(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-xl border border-slate-250 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden tracking-wide font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formatRupiah(pbh)}
              </span>
            </div>

            {/* Field: Bankeu */}
            <div className="space-y-1.5">
              <label htmlFor="input-bankeu" className="text-xs font-bold text-slate-600 block">
                Bantuan Keuangan Provinsi/Kabupaten (Bankeu)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">Rp</span>
                <input
                  id="input-bankeu"
                  type="number"
                  min="0"
                  value={bankeu || ''}
                  onChange={(e) => {
                    setBankeu(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-xl border border-slate-250 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden tracking-wide font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formatRupiah(bankeu)}
              </span>
            </div>

            {/* Field: PAD */}
            <div className="space-y-1.5">
              <label htmlFor="input-pad" className="text-xs font-bold text-slate-600 block">
                Pendapatan Asli Desa (PAD)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">Rp</span>
                <input
                  id="input-pad"
                  type="number"
                  min="0"
                  value={pad || ''}
                  onChange={(e) => {
                    setPad(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-xl border border-slate-250 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden tracking-wide font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formatRupiah(pad)}
              </span>
            </div>

            {/* Field: SILPA */}
            <div className="space-y-1.5">
              <label htmlFor="input-silpa" className="text-xs font-bold text-slate-600 block">
                Sisa Lebih Perhitungan Anggaran (SiLPA)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-xs font-bold text-slate-400 font-mono">Rp</span>
                <input
                  id="input-silpa"
                  type="number"
                  min="0"
                  value={silpa || ''}
                  onChange={(e) => {
                    setSilpa(Math.max(0, parseInt(e.target.value) || 0));
                    setIsDirty(true);
                  }}
                  placeholder="0"
                  className="w-full pl-10 pr-4 py-2 text-sm font-semibold rounded-xl border border-slate-250 focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden tracking-wide font-mono"
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium block">
                {formatRupiah(silpa)}
              </span>
            </div>

          </div>

          {saveSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2.5 animate-fade-in animate-pulse">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold block">Pagu Anggaran Sukses Disimpan!</span>
                Data anggaran belanja Desa {targetVillage} telah dimutakhirkan secara real-time di sistem cloud.
              </div>
            </div>
          )}

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer shadow-md shadow-blue-500/10"
            >
              {isSaving ? 'Menyimpan...' : `Simpan Pagu Anggaran TA ${selectedYear}`}
            </button>
          </div>
        </form>

        {/* Right Side: Calculation & Verification Details */}
        <div className="lg:col-span-5 p-6 bg-slate-50/50 flex flex-col justify-between">
          <div className="space-y-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono">Rangkuman Akumulasi Pagu</h3>
            
            <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sasaran Desa</span>
                <div className="text-base font-extrabold text-slate-900">Desa {targetVillage}</div>
              </div>

               <div className="border-t border-slate-100 pt-3">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Pagu Terhitung:</span>
                <div className="text-2xl font-black font-mono text-blue-600 mt-1">{formatRupiah(paguTotal)}</div>
                <span className="text-[10px] text-slate-400 font-medium block mt-1">DD + ADD + PBH + Bankeu + PAD + SiLPA</span>
              </div>

              <div className="space-y-2 pt-3 border-t border-slate-100">
                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">Porsi Distribusi Pagu:</span>
                
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>DD (Dana Desa):</span>
                    <span className="font-bold font-mono text-slate-800">{formatRupiah(dd)} ({paguTotal > 0 ? Math.round((dd / paguTotal) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden block">
                    <div className="bg-amber-500 h-full" style={{ width: `${paguTotal > 0 ? (dd / paguTotal) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>ADD (Alokasi Dana Desa):</span>
                    <span className="font-bold font-mono text-slate-800">{formatRupiah(add)} ({paguTotal > 0 ? Math.round((add / paguTotal) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden block">
                    <div className="bg-blue-500 h-full" style={{ width: `${paguTotal > 0 ? (add / paguTotal) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Lainnya (PBH/Bankeu/PAD):</span>
                    <span className="font-bold font-mono text-slate-800">{formatRupiah(pbh + bankeu + pad)} ({paguTotal > 0 ? Math.round(((pbh + bankeu + pad) / paguTotal) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden block">
                    <div className="bg-emerald-500 h-full" style={{ width: `${paguTotal > 0 ? ((pbh + bankeu + pad) / paguTotal) * 100 : 0}%` }} />
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>SiLPA (Sisa Lebih Perhitungan Anggaran):</span>
                    <span className="font-bold font-mono text-slate-800">{formatRupiah(silpa)} ({paguTotal > 0 ? Math.round((silpa / paguTotal) * 100) : 0}%)</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden block">
                    <div className="bg-purple-500 h-full" style={{ width: `${paguTotal > 0 ? (silpa / paguTotal) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-200 mt-6 lg:mt-0 space-y-3">
            <div className="flex items-start gap-2 text-[10.5px] leading-relaxed text-slate-500 bg-white/70 p-3 rounded-xl border border-slate-200">
              <Scale className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
              <span>
                Formulasi rincian pagu ini akan dikaitkan dengan total pagu usulan kegiatan pembangunan fisik dan pembinaan masyarakat desa secara akurat.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Info Footer Alert */}
      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-200/50 flex gap-3 text-xs leading-relaxed text-amber-850">
        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block text-amber-900 mb-0.5">Ketentuan Pengisian Manual Pagu:</span>
          Harap sesuaikan data inputan di atas dengan Dokumen APBDes yang telah disahkan secara resmi. Angka total pagu ini menjadi penyebut (denominator) dalam perhitungan persentase penyerapan anggaran keseluruhan pada dasbor utama Simonev Kecamatan Waru.
        </div>
      </div>
    </div>
  );
}
