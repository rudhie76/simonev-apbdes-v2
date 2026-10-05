import React, { useState } from 'react';
import { UserRole } from '../types';
import { Lock, ShieldAlert, Key, HelpCircle, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

// Credential dictionary
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

interface LoginPortalProps {
  onLoginSuccess: (role: UserRole) => void;
  defaultRolePreference?: UserRole;
}

export default function LoginPortal({ onLoginSuccess, defaultRolePreference }: LoginPortalProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>(defaultRolePreference || 'OP_BANGUN_MULYA');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelp, setShowHelp] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRole === 'PUBLIC') return;
    
    setErrorMsg('');
    setIsAuthenticating(true);

    // Simulate network delay for premium visual satisfaction
    setTimeout(() => {
      const cred = OPERATOR_CREDENTIALS[selectedRole];
      if (username.trim() === cred.username && password === cred.password) {
        onLoginSuccess(selectedRole);
        setIsAuthenticating(false);
      } else {
        setErrorMsg('Autentikasi gagal! Kredensial username atau sandi yang Anda masukkan salah.');
        setIsAuthenticating(false);
      }
    }, 600);
  };

  const handleQuickFill = (role: UserRole) => {
    if (role === 'PUBLIC') return;
    const cred = OPERATOR_CREDENTIALS[role];
    setSelectedRole(role);
    setUsername(cred.username);
    setPassword(cred.password);
    setErrorMsg('');
  };

  return (
    <div id="login-portal-card" className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden mt-4">
      {/* Upper header banner (Deep Navy Blue style) */}
      <div className="bg-slate-900 text-white p-6 relative">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">Portal Pengaman Simonev</h2>
            <p className="text-xs text-slate-400">Silakan login untuk mengakses instrumen kerja operator.</p>
          </div>
        </div>
      </div>

      {/* Login Form body */}
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-250 text-rose-800 rounded-lg flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-600 uppercase">Institusi / Peran</label>
          <select
            value={selectedRole}
            onChange={(e) => {
              const role = e.target.value as UserRole;
              setSelectedRole(role);
              // reset field values when switching roles manually to prevent leaking passwords
              setUsername('');
              setPassword('');
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
          className={`w-full py-2.5 rounded-lg text-xs font-bold text-white shadow-md transition-all flex items-center justify-center gap-1.5 ${
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

      {/* Information text about contacting Monev Team */}
      <div className="bg-slate-50 p-5 border-t border-slate-200 text-center flex flex-col items-center justify-center gap-1.5">
        <ShieldAlert className="w-4.5 h-4.5 text-blue-600" />
        <span className="text-xs font-bold text-slate-700 tracking-wide">
          Untuk Akses Hubungi Tim Monev
        </span>
      </div>
    </div>
  );
}
