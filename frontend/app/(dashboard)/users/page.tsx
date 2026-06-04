'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getUsers, updateUser, deleteUser } from '@/lib/api/users';
import type { User } from '@/lib/types';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { ROLE_COLORS, ROLE_LABELS } from '@/lib/utils/constants';
import { formatDate } from '@/lib/utils/formatDate';
import { 
  HiMagnifyingGlass, 
  HiTrash, 
  HiChevronDown,
  HiUserMinus,
  HiUser,
  HiUsers
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function UserManagementPage() {
  const router = useRouter();
  const { user: currentUser } = useAuthStore();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Modal States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Role Edit States
  const [editingUserId, setEditingUserId] = useState<number | null>(null);

  // Role checks
  useEffect(() => {
    if (currentUser && currentUser.role !== 'super_admin') {
      toast.error('Anda tidak memiliki izin untuk mengakses halaman ini');
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await getUsers();
      setUsersList(res.data || []);
    } catch {
      toast.error('Gagal mengambil daftar pengguna');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'super_admin') {
      fetchUsers();
    }
  }, [currentUser, fetchUsers]);

  // Handle Role Change
  const handleRoleChange = async (userId: number, newRole: 'user' | 'admin' | 'super_admin') => {
    try {
      setIsActionLoading(true);
      await updateUser(userId, { role: newRole });
      toast.success('Peran pengguna berhasil diperbarui');
      
      // Update local state
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
      setEditingUserId(null);
    } catch {
      toast.error('Gagal memperbarui peran pengguna');
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle Delete Confirmation Modal Open
  const triggerDeleteConfirm = (user: User) => {
    if (user.id === currentUser?.id) {
      toast.error('Anda tidak dapat menghapus akun Anda sendiri');
      return;
    }
    setSelectedUser(user);
    setDeleteModalOpen(true);
  };

  // Handle User Delete Action
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setIsActionLoading(true);
      await deleteUser(selectedUser.id);
      toast.success('Pengguna berhasil dihapus');
      
      // Update local state
      setUsersList(prev => prev.filter(u => u.id !== selectedUser.id));
    } catch {
      toast.error('Gagal menghapus pengguna');
    } finally {
      setIsActionLoading(false);
      setDeleteModalOpen(false);
      setSelectedUser(null);
    }
  };

  // Filter list by search query
  const filteredUsers = usersList.filter(user => 
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading || currentUser?.role !== 'super_admin') {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-text-primary">Manajemen Data Pengguna</h1>
        <p className="text-sm text-text-secondary mt-0.5">Kelola data seluruh akun pengguna, peran, serta hak akses mereka di aplikasi.</p>
      </div>

      {/* Control Bar */}
      <Card className="p-4" hover={false}>
        <div className="max-w-md">
          <Input
            label="Cari Pengguna"
            placeholder="Masukkan nama pengguna atau email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<HiMagnifyingGlass className="h-5 w-5 text-text-muted" />}
          />
        </div>
      </Card>

      {/* Users Table */}
      <Card className="overflow-hidden border border-border" hover={false}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-border text-xs font-bold text-text-secondary uppercase tracking-wider">
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Alamat Email</th>
                <th className="px-6 py-4">Peran / Hak Akses</th>
                <th className="px-6 py-4">Bergabung Pada</th>
                <th className="px-6 py-4 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-sm text-text-primary">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-text-secondary">
                    Tidak ada pengguna yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleColor = ROLE_COLORS[user.role] || { bg: 'bg-slate-50', text: 'text-slate-700' };
                  const isEditing = editingUserId === user.id;

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name / Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                            {user.username.substring(0, 2).toUpperCase()}
                          </div>
                          <span className="font-semibold text-text-primary">{user.username}</span>
                          {user.id === currentUser?.id && (
                            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-1.5 py-0.5 rounded">
                              Saya
                            </span>
                          )}
                        </div>
                      </td>
                      {/* Email */}
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-text-secondary">
                        {user.email}
                      </td>
                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <div className="relative">
                            <select
                              value={user.role}
                              disabled={isActionLoading}
                              onChange={(e) => handleRoleChange(user.id, e.target.value as 'user' | 'admin' | 'super_admin')}
                              className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            >
                              <option value="user">Pengguna</option>
                              <option value="admin">Admin</option>
                              <option value="super_admin">Super Admin</option>
                            </select>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              if (user.id !== currentUser?.id) {
                                setEditingUserId(user.id);
                              }
                            }}
                            disabled={user.id === currentUser?.id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${roleColor.bg} ${roleColor.text} ${
                              user.id !== currentUser?.id ? 'hover:brightness-95 cursor-pointer' : 'cursor-default'
                            }`}
                          >
                            <span>{ROLE_LABELS[user.role] || user.role}</span>
                            {user.id !== currentUser?.id && <HiChevronDown className="h-3 w-3" />}
                          </button>
                        )}
                      </td>
                      {/* Joined Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-text-secondary font-medium">
                        {formatDate(user.created_at)}
                      </td>
                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-danger hover:bg-red-50 border-none p-2 rounded-xl"
                          disabled={user.id === currentUser?.id}
                          onClick={() => triggerDeleteConfirm(user)}
                        >
                          <HiUserMinus className="h-5 w-5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Akun Pengguna?"
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setDeleteModalOpen(false)}
              disabled={isActionLoading}
            >
              Batal
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteUser}
              isLoading={isActionLoading}
            >
              Hapus Akun
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary leading-normal">
          Apakah Anda yakin ingin menghapus akun pengguna <strong className="text-text-primary font-semibold">@{selectedUser?.username}</strong>?
          Tindakan ini bersifat permanen. Semua laporan dan komentar yang dibuat oleh pengguna ini akan dihapus sepenuhnya dari sistem.
        </p>
      </Modal>
    </div>
  );
}
