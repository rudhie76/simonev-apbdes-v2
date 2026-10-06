import React, { useState } from 'react';
import { RegisteredAccount, UserRole, UserStatus } from '../types';
import { X, CheckCircle2, XCircle, Trash2, Search, ShieldCheck, Clock, UserCheck, AlertTriangle, Users, Building2 } from 'lucide-react';

interface UserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeRole: UserRole;
  users: RegisteredAccount[];
  onUpdateUserStatus: (userId: string, newStatus: UserStatus, approvedBy: string) => void;
  onDeleteUser: (userId: string) => void;
}

export default function UserManagementModal({
  isOpen,
  onClose,
  activeRole,
  users,
  onUpdateUserStatus,
  onDeleteUser
}: UserManagementModalProps) {
  const [filterTab, setFilterTab] = useState<'PENDING' | 'AKTIF' | 'DITOLAK' | 'ALL'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionConfirmId, setActionConfirmId] = useState<string | null>(null);

  if (!isOpen) return null;

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'OP_BANGUN_MULYA': return 'Desa Bangun Mulya';
      case 'OP_SESULU': return 'Desa Sesulu';
      case 'OP_API_API': return 'Desa Api-api';
      case 'OP_KECAMATAN': return 'PMD Kecamatan Waru';
      default: return 'Publik / Lainnya';
    }
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'OP_BANGUN_MULYA': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'OP_SESULU': return 'bg-cyan-100 text-cyan-800 border-cyan-300';
      case 'OP_API_API': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'OP_KECAMATAN': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  // Filter accounts based on user role scope and selected tab
  const scopedUsers = users.filter(user => {
    // Operator Kecamatan can see all accounts
    if (activeRole === 'OP_KECAMATAN') return true;
    // Operator Desa can see accounts registered for their village
    return user.role === activeRole;
  });

  const pendingUsers = scopedUsers.filter(u => u.status === 'Pending' || !u.status);
  const activeUsers = scopedUsers.filter(u => u.status === 'Aktif');
  const rejectedUsers = scopedUsers.filter(u => u.status === 'Ditolak');

  const filteredUsers = scopedUsers.filter(user => {
    // Status tab filter
    if (filterTab === 'PENDING' && (user.status !== 'Pending' && user.status)) return false;
    if (filterTab === 'AKTIF' && user.status !== 'Aktif') return false;
    if (filterTab === 'DITOLAK' && user.status !== 'Ditolak') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = user.fullName.toLowerCase().includes(q);
      const matchUser = user.username.toLowerCase().includes(q);
      const matchPhone = (user.phoneNip || '').toLowerCase().includes(q);
      return matchName || matchUser || matchPhone;
    }
    return true;
  });

  const getOperatorTitle = () => {
    if (activeRole === 'OP_KECAMATAN') return 'Kecamatan Waru';
    return getRoleLabel(activeRole);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600/30 border border-blue-400/40 rounded-xl flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold flex items-center gap-2">
                Verifikasi & Persetujuan Akun Operator
                <span className="text-[10px] font-mono bg-blue-900/80 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full uppercase">
                  {getOperatorTitle()}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Verifikasi pendaftaran pengguna baru agar mendapatkan izin hak akses login SIMONEV APBDES.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats & Tab Navigation */}
        <div className="bg-slate-50 border-b border-slate-200 p-4 px-6 flex flex-col md:flex-row gap-3 items-center justify-between shrink-0">
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setFilterTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'PENDING'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Menunggu Verifikasi
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                filterTab === 'PENDING' ? 'bg-amber-700 text-white' : 'bg-amber-100 text-amber-800'
              }`}>
                {pendingUsers.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('AKTIF')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'AKTIF'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Akun Disetujui (Aktif)
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                filterTab === 'AKTIF' ? 'bg-emerald-800 text-white' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {activeUsers.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('DITOLAK')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'DITOLAK'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              Ditolak
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                filterTab === 'DITOLAK' ? 'bg-rose-800 text-white' : 'bg-rose-100 text-rose-800'
              }`}>
                {rejectedUsers.length}
              </span>
            </button>

            <button
              onClick={() => setFilterTab('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                filterTab === 'ALL'
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              Semua ({scopedUsers.length})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama / username..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Content Table / Cards */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-slate-50/50 rounded-xl border border-dashed border-slate-300">
              <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">Tidak Ada Akun Ditemukan</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                {filterTab === 'PENDING' 
                  ? 'Saat ini tidak ada permohonan pendaftaran akun pengguna baru yang menunggu verifikasi.'
                  : 'Tidak ada data pengguna yang sesuai dengan kriteria filter pencarian Anda.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-xs">
              <table className="w-full text-left text-xs text-slate-700 border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <th className="py-3 px-4">Nama Lengkap & Kontak</th>
                    <th className="py-3 px-4">Username Login</th>
                    <th className="py-3 px-4">Hak Akses / Peran</th>
                    <th className="py-3 px-4">Status Verifikasi</th>
                    <th className="py-3 px-4 text-center">Tindakan Persetujuan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 bg-white font-medium">
                  {filteredUsers.map((user) => {
                    const isPending = user.status === 'Pending' || !user.status;
                    const isActive = user.status === 'Aktif';
                    const isRejected = user.status === 'Ditolak';

                    return (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        {/* Name & Contact */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-xs">{user.fullName}</div>
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <span>No HP/NIP: {user.phoneNip || '-'}</span>
                          </div>
                          {user.registeredAt && (
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Daftar: {new Date(user.registeredAt).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}
                            </div>
                          )}
                        </td>

                        {/* Username */}
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          @{user.username}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold border ${getRoleBadgeStyle(user.role)}`}>
                            <Building2 className="w-3 h-3 shrink-0" />
                            {getRoleLabel(user.role)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4">
                          {isPending && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 animate-pulse">
                              <Clock className="w-3 h-3 text-amber-600" />
                              Menunggu Verifikasi
                            </span>
                          )}
                          {isActive && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Disetujui (Aktif)
                              </span>
                              {user.approvedBy && (
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  Oleh: {user.approvedBy}
                                </div>
                              )}
                            </div>
                          )}
                          {isRejected && (
                            <div>
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                                <XCircle className="w-3 h-3 text-rose-600" />
                                Ditolak
                              </span>
                              {user.approvedBy && (
                                <div className="text-[9px] text-slate-400 mt-0.5">
                                  Oleh: {user.approvedBy}
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Approve button */}
                            {(!isActive) && (
                              <button
                                onClick={() => onUpdateUserStatus(user.id, 'Aktif', getOperatorTitle())}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-2xs transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Setujui & Aktifkan Akun User Ini"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Setujui
                              </button>
                            )}

                            {/* Reject button */}
                            {(!isRejected) && (
                              <button
                                onClick={() => onUpdateUserStatus(user.id, 'Ditolak', getOperatorTitle())}
                                className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-95"
                                title="Tolak Akses Akun User Ini"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Tolak
                              </button>
                            )}

                            {/* Delete button */}
                            {actionConfirmId === user.id ? (
                              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 p-1 rounded-lg">
                                <span className="text-[10px] font-bold text-rose-700">Hapus?</span>
                                <button
                                  onClick={() => {
                                    onDeleteUser(user.id);
                                    setActionConfirmId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-rose-600 text-white text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Ya
                                </button>
                                <button
                                  onClick={() => setActionConfirmId(null)}
                                  className="px-1.5 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded cursor-pointer"
                                >
                                  Batal
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setActionConfirmId(user.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Hapus Permanen Akun"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 px-6 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Perubahan status akan langsung tersimpan di Cloud Firestore & Google Sheets.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition-all cursor-pointer"
          >
            Tutup Window
          </button>
        </div>

      </div>
    </div>
  );
}
