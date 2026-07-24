import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Plus,
  Trash2,
  Edit2,
  Shield,
  Key,
  Mail,
  Globe,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Search,
  Crown,
  Lock,
  UserCheck,
  UserX,
} from 'lucide-react';
import { FirebaseUserRecord, UserRole } from '../types';
import {
  getAllFirebaseUsers,
  saveUserToFirebase,
  deleteUserFromFirebase,
  fetchClientIpAddress,
} from '../services/firebaseUserService';

interface FirebaseUserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'bn' | 'en';
}

export const FirebaseUserManagerModal: React.FC<FirebaseUserManagerModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const [users, setUsers] = useState<FirebaseUserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<FirebaseUserRecord | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [status, setStatus] = useState<'active' | 'suspended' | 'blocked'>('active');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getAllFirebaseUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load Firebase users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenAddForm = async () => {
    setEditingUser(null);
    setFullName('');
    setUsername('');
    setPassword('');
    setEmailAddress('');
    setRole('user');
    setStatus('active');

    // Auto detect current client IP
    const currentIp = await fetchClientIpAddress();
    setIpAddress(currentIp);

    setIsFormOpen(true);
    setMsg(null);
  };

  const handleOpenEditForm = (u: FirebaseUserRecord) => {
    setEditingUser(u);
    setFullName(u.fullName || '');
    setUsername(u.username || '');
    setPassword(u.password || '');
    setEmailAddress(u.emailAddress || '');
    setIpAddress(u.ipAddress || '127.0.0.1');
    setRole(u.role || 'user');
    setStatus(u.status || 'active');
    setIsFormOpen(true);
    setMsg(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setMsg({
        type: 'error',
        text: lang === 'bn' ? 'ইউজারনেম এবং পাসওয়ার্ড প্রদান করা আবশ্যক!' : 'Username and Password are required!',
      });
      return;
    }

    setSaving(true);
    setMsg(null);

    try {
      await saveUserToFirebase({
        id: editingUser?.id,
        fullName: fullName.trim() || username.trim(),
        username: username.trim(),
        password: password.trim(),
        emailAddress: emailAddress.trim() || `${username.trim()}@sms333.com`,
        ipAddress: ipAddress.trim() || '127.0.0.1',
        role,
        status,
        createdAt: editingUser?.createdAt || new Date().toISOString(),
      });

      setMsg({
        type: 'success',
        text:
          lang === 'bn'
            ? 'ফায়ারবেস ইউজার সফলভাবে সংরক্ষিত হয়েছে!'
            : 'Firebase user saved successfully!',
      });

      setIsFormOpen(false);
      loadUsers();
    } catch (err: any) {
      setMsg({
        type: 'error',
        text: err.message || (lang === 'bn' ? 'ফায়ারবেস ডাটা সেভ ব্যর্থ হয়েছে!' : 'Failed to save Firebase user!'),
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: FirebaseUserRecord) => {
    if (!u.id) return;
    const confirmDelete = window.confirm(
      lang === 'bn'
        ? `আপনি কি নিশ্চিত যে ইউজার "${u.username}" মুছে ফেলতে চান?`
        : `Are you sure you want to delete user "${u.username}" from Firebase?`
    );

    if (confirmDelete) {
      try {
        await deleteUserFromFirebase(u.id);
        loadUsers();
      } catch (err) {
        console.error('Delete error:', err);
      }
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.emailAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.ipAddress?.includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-4xl w-full p-4 sm:p-6 my-auto text-[11px] relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 bg-orange-500/15 text-orange-500 rounded-2xl border border-orange-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{lang === 'bn' ? 'ফায়ারবেস ইউজার ডাটাবেজ (Firebase Database)' : 'Firebase User Management'}</span>
                <span className="bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full text-[9px] font-bold">
                  Firestore Live
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'ইউজারনেম, পাসওয়ার্ড, ফুল নাম, ইমেইল ও আইপি এড্রেস লাইভ নিয়ন্ত্রণ'
                  : 'Manage Firebase users with Username, Password, Full Name, Email & IP tracking'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3 shrink-0">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={lang === 'bn' ? 'ইউজার, ইমেইল বা IP সার্চ...' : 'Search Name, Email, IP...'}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-[10px] focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={loadUsers}
              className="p-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl transition-colors"
              title="Refresh Users"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={handleOpenAddForm}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'নতুন ইউজার যোগ করুন' : 'Add Firebase User'}</span>
            </button>
          </div>
        </div>

        {/* Message Banner */}
        {msg && (
          <div
            className={`p-2.5 rounded-xl text-[10px] font-medium flex items-center gap-2 mb-3 shrink-0 ${
              msg.type === 'success'
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Form Modal / Overlay if editing or adding */}
        {isFormOpen && (
          <form
            onSubmit={handleSaveUser}
            className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-800/80 border border-orange-500/30 rounded-2xl mb-3 space-y-3 shrink-0 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-1.5 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <User className="w-4 h-4 text-orange-500" />
                <span>
                  {editingUser
                    ? lang === 'bn' ? 'ইউজার এডিট করুন' : 'Edit Firebase User'
                    : lang === 'bn' ? 'নতুন ফায়ারবেস ইউজার তথ্য' : 'New Firebase User Details'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {/* Full Name */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                  {lang === 'bn' ? 'ফুল নাম (Full Name)' : 'Full Name'}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Md. Rahat Hossain"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px]"
                />
              </div>

              {/* Username */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                  {lang === 'bn' ? 'ইউজারনেম (Username)' : 'Username'}
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. rahat333"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px]"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                  {lang === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'}
                </label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px] font-mono"
                />
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                  {lang === 'bn' ? 'ইমেইল এড্রেস (Email Address)' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={emailAddress}
                  onChange={(e) => setEmailAddress(e.target.value)}
                  placeholder="email@domain.com"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px]"
                />
              </div>

              {/* IP Address */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                  {lang === 'bn' ? 'আইপি এড্রেস (IP Address)' : 'IP Address'}
                </label>
                <input
                  type="text"
                  required
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="103.220.12.5"
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px] font-mono"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-[9px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 uppercase">
                  {lang === 'bn' ? 'রোল (Role)' : 'User Role'}
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[10px]"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-[10px] transition-all flex items-center gap-1.5"
              >
                {saving && <RefreshCw className="w-3 h-3 animate-spin" />}
                <span>{editingUser ? 'Update User' : 'Save to Firebase'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Users Table */}
        <div className="overflow-x-auto flex-1 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold uppercase text-[9px]">
                <th className="p-2.5">User Details</th>
                <th className="p-2.5">Username & Pass</th>
                <th className="p-2.5">IP Address</th>
                <th className="p-2.5">Email</th>
                <th className="p-2.5">Role</th>
                <th className="p-2.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    {loading ? 'Loading Firebase users...' : 'No users found in Firebase database.'}
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr
                    key={u.id || u.username}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Full Name & Status */}
                    <td className="p-2.5 font-bold text-slate-800 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{u.fullName || u.username}</span>
                      </div>
                    </td>

                    {/* Username & Password */}
                    <td className="p-2.5">
                      <div className="flex flex-col">
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          {u.username}
                        </span>
                        <span className="font-mono text-[9px] text-slate-400">
                          Pass: {u.password}
                        </span>
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="p-2.5 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-sky-500 shrink-0" />
                        <span>{u.ipAddress || '127.0.0.1'}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="p-2.5 text-slate-600 dark:text-slate-300">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[140px]">{u.emailAddress}</span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="p-2.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${
                          u.role === 'super_admin'
                            ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="p-2.5 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditForm(u)}
                        className="p-1 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        title="Edit User"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(u)}
                        className="p-1 text-slate-500 hover:text-red-500 transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="pt-3 mt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[9px] text-slate-400 shrink-0">
          <span>Total Firebase Users: {users.length}</span>
          <span className="text-emerald-500 font-medium">✓ Synced with Firebase Firestore</span>
        </div>
      </div>
    </div>
  );
};
