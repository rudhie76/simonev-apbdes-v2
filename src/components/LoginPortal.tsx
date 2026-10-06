import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, ShieldAlert, Key, UserPlus, LogIn, CheckCircle2, AlertCircle, Eye, EyeOff, User, Phone } from 'lucide-react';
import logoPpu from '../assets/logo.png';
import { doc, setDoc } from '../lib/sheetsApi';
import { db } from '../lib/firebase';

// Credential dictionary for default system accounts
export const OPERATOR_CREDENTIALS = {
  'OP_BANGUN_MULYA': {
    username: 'ops.bangunmulya',
    password: 'bangunmulya2026',
    friendlyName: 'Desa Bangun Mulya',
    sub: 'Waru Utama',
  },
  'OP_SESULU': {
    username: 'ops.sesulu',
    password: 'sesulu2026',
    friendlyName: 'Desa Sesulu',
    sub: 'Waru Utama',
  },
  'OP_API_API': {
    username: 'ops.apiapi',
    password: 'apiapi2026',
    friendlyName: 'Desa Api-api',
    sub: 'Waru Utama',
  },
  'OP_KECAMATAN': {
    username: 'ops.kecamatan',
    password: 'kecamatanwaru2026',
    friendlyName: 'Kecamatan Waru',
    sub: 'Operator PMD',
  }
};

export interface RegisteredAccount {
  id: string;
  fullName: string;
  role: UserRole;
  username: string;
  password: string;
  phoneNip?: string;
  registeredAt: string;
}

interface LoginPortalProps {
  onLoginSuccess: (role: UserRole) => void;
  defaultRolePreference?: UserRole;
}

export default function LoginPortal({ onLoginSuccess, defaultRolePreference }: LoginPortalProps) {
  const [activeTab, setActiveTab] = useState<'LOGIN' | 'REGISTER'>('LOGIN');

  // Login form state
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRolePreference || 'OP_BANGUN_MULYA');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('OP_BANGUN_MULYA');
  const [regUsername, setRegUsername] = useState('');
  const [regPhoneNip, setRegPhoneNip] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  // Registered accounts state
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(() => {
    try {
      const saved = localStorage.getItem('simonev_registered_accounts');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed loading registered accounts:", e);
    }
    return [];
  });

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'PUBLIC') return;

    setErrorMsg('');
    setSuccessMsg('');
    setIsAuthenticating(true);

    setTimeout(() => {
      const cleanUser = username.trim().toLowerCase();
      const defaultCred = OPERATOR_CREDENTIALS[selectedRole];

      // Check default system credentials
      const matchesDefault = (cleanUser === defaultCred.username.toLowerCase() && password === defaultCred.password);

      // Check user-registered credentials
      const matchesRegistered = registeredAccounts.find(
        acc => acc.username.toLowerCase() === cleanUser && acc.password === password && acc.role === selectedRole
      );

      if (matchesDefault || matchesRegistered) {
        onLoginSuccess(selectedRole);
        setIsAuthenticating(false);
      } else {
        setErrorMsg('Autentikasi gagal! Username atau Kata Sandi yang Anda masukkan salah atau peran tidak sesuai.');
        setIsAuthenticating(false);
      }
    }, 600);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!regFullName.trim()) {
      setErrorMsg('Nama Lengkap tidak boleh kosong.');
      return;
    }
    if (!regUsername.trim()) {
      setErrorMsg('Username tidak boleh kosong.');
      return;
    }
    if (regPassword.length < 5) {
      setErrorMsg('Kata Sandi minimal terdiri dari 5 karakter.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Konfirmasi Kata Sandi tidak cocok dengan Kata Sandi.');
      return;
    }

    const cleanRegUser = regUsername.trim().toLowerCase();

    // Check if username already exists in registered accounts or default credentials
    const isDefaultExist = Object.values(OPERATOR_CREDENTIALS).some(c => c.username.toLowerCase() === cleanRegUser);
    const isRegisteredExist = registeredAccounts.some(a => a.username.toLowerCase() === cleanRegUser);

    if (isDefaultExist || isRegisteredExist) {
      setErrorMsg('Username sudah terdaftar dalam sistem. Silakan gunakan username lain.');
      return;
    }

    setIsRegistering(true);

    setTimeout(() => {
      const newAcc: RegisteredAccount = {
        id: `usr-${Date.now()}`,
        fullName: regFullName.trim(),
        role: regRole,
        username: cleanRegUser,
        password: regPassword,
        phoneNip: regPhoneNip.trim() || undefined,
        registeredAt: new Date().toISOString()
      };

      const updated = [newAcc, ...registeredAccounts];
      setRegisteredAccounts(updated);
      localStorage.setItem('simonev_registered_accounts', JSON.stringify(updated));

      // Sync new account to Google Sheets / Firestore users tab
      try {
        setDoc(doc(db, 'users', newAcc.id), {
          ...newAcc,
          phoneNip: newAcc.phoneNip || '-',
          lastLogin: new Date().toISOString(),
          status: 'Aktif'
        });
      } catch (err) {
        console.warn("Failed syncing user account to sheets:", err);
      }

      // Reset Register fields
      setRegFullName('');
      setRegUsername('');
      setRegPhoneNip('');
      setRegPassword('');
      setRegConfirmPassword('');
      setIsRegistering(false);

      // Switch to Login tab with pre-filled fields
      setSelectedRole(regRole);
      setUsername(cleanRegUser);
      setPassword(regPassword);
      setActiveTab('LOGIN');
      setSuccessMsg(`Pendaftaran Akun Berhasil! Akun "${newAcc.fullName}" telah dibuat. Silakan klik tombol "Masuk Akun Kerja".`);
    }, 600);
  };

  return (
    <div id="login-portal-card" className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-4">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 bg-white/10 p-1 rounded-xl flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
            <img src={logoPpu} alt="Logo Penajam Paser Utara" className="w-9 h-9 object-contain drop-shadow-sm" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              {activeTab === 'LOGIN' ? 'Autentikasi Akun Operator' : 'Pendaftaran Akun Operator Baru'}
            </h2>
            <p className="text-xs text-slate-400">
              {activeTab === 'LOGIN' 
                ? 'Silakan masuk untuk mengakses instrumen kerja operator.' 
                : 'Lengkapi formulir registrasi untuk membuat akun operator baru.'}
            </p>
          </div>
        </div>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-100/80 p-1.5 gap-1">
        <button
          type="button"
          onClick={() => {
            setActiveTab('LOGIN');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'LOGIN'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LogIn className="w-3.5 h-3.5" />
          Masuk (Login)
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveTab('REGISTER');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'REGISTER'
              ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" />
          Daftar Akun Baru
        </button>
      </div>

      {/* Login Form */}
      {activeTab === 'LOGIN' ? (
        <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-lg flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-250 text-emerald-800 rounded-lg flex items-start gap-2.5 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Institusi / Peran</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                const role = e.target.value as UserRole;
                setSelectedRole(role);
                setErrorMsg('');
              }}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-350 px-3 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OP_BANGUN_MULYA">Desa Bangun Mulya (Operator)</option>
              <option value="OP_SESULU">Desa Sesulu (Operator)</option>
              <option value="OP_API_API">Desa Api-api (Operator)</option>
              <option value="OP_KECAMATAN">Kecamatan Waru (Tim Evaluasi PMD)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Nama Pengguna (Username)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">@</span>
              <input
                type="text"
                required
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 pl-8 pr-3 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Kata Sandi (Password)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Key className="w-3.5 h-3.5" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 pl-8 pr-10 py-2.5 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer focus:outline-none"
                title={showPassword ? 'Sembunyikan Kata Sandi' : 'Tampilkan Kata Sandi'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isAuthenticating}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              isAuthenticating ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            {isAuthenticating ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Menghubungkan Database...
              </>
            ) : (
              'Masuk Akun Kerja'
            )}
          </button>
        </form>
      ) : (
        /* Register Form */
        <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-lg flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Nama Lengkap Operator / Petugas</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <User className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                required
                placeholder="Contoh: Budi Santoso, S.STP"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 pl-8 pr-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Institusi / Peran Kerja</label>
            <select
              value={regRole}
              onChange={(e) => setRegRole(e.target.value as UserRole)}
              className="w-full text-xs font-semibold bg-slate-50 border border-slate-350 px-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="OP_BANGUN_MULYA">Desa Bangun Mulya (Operator)</option>
              <option value="OP_SESULU">Desa Sesulu (Operator)</option>
              <option value="OP_API_API">Desa Api-api (Operator)</option>
              <option value="OP_KECAMATAN">Kecamatan Waru (Tim Evaluasi PMD)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Username Baru</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">@</span>
              <input
                type="text"
                required
                placeholder="Contoh: ops_budi"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 pl-8 pr-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">No. HP / NIP (Opsional)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Phone className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                placeholder="Contoh: 08123456789 / NIP. 1985..."
                value={regPhoneNip}
                onChange={(e) => setRegPhoneNip(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 pl-8 pr-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Kata Sandi</label>
              <input
                type={regShowPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 px-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Ulangi Sandi</label>
              <input
                type={regShowPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-350 px-3 py-2 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-1.5 text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={regShowPassword}
                onChange={(e) => setRegShowPassword(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              Tampilkan Sandi
            </label>
          </div>

          <button
            type="submit"
            disabled={isRegistering}
            className={`w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-2 ${
              isRegistering ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
            }`}
          >
            {isRegistering ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Mendaftarkan Akun...
              </>
            ) : (
              'Daftar Akun Baru'
            )}
          </button>
        </form>
      )}

      {/* Information footer */}
      <div className="bg-slate-50 p-4 border-t border-slate-200 text-center flex flex-col items-center justify-center gap-1">
        <ShieldAlert className="w-4 h-4 text-blue-600" />
        <span className="text-[11px] font-bold text-slate-700">
          Untuk Bantuan Buka Akses Hubungi Tim Monev Kec. Waru
        </span>
      </div>
    </div>
  );
}
