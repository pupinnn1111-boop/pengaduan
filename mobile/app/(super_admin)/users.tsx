import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  Modal,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as api from '../../lib/api';
import { User } from '../../lib/api';

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin' | 'super_admin'>('user');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openRoleUserId, setOpenRoleUserId] = useState<number | null>(null);

  const fetchUsers = useCallback(async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const res = await api.getUsers();
      if (res.success && res.data) {
        setUsers(res.data);
        applyFilter(res.data, search);
      }
    } catch (e) {
      console.error('Failed to load users:', e);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers(true);
  }, []);

  const applyFilter = (userList: User[], query: string) => {
    if (!query.trim()) {
      setFilteredUsers(userList);
    } else {
      const filtered = userList.filter(
        (u) =>
          u.username.toLowerCase().includes(query.toLowerCase()) ||
          u.email.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    applyFilter(users, text);
  };

  const onRefresh = () => {
    setIsRefreshing(true);
    fetchUsers(false);
  };

  const handleCreateUser = async () => {
    if (!username.trim() || !email.trim() || !password) {
      Alert.alert('Eror', 'Semua kolom wajib diisi');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Eror', 'Password minimal 6 karakter');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.createUser({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      setIsSubmitting(false);
      if (res.success) {
        Alert.alert('Sukses', `User ${username} berhasil dibuat!`);
        // reset fields
        setUsername('');
        setEmail('');
        setPassword('');
        setRole('user');
        setAddModalOpen(false);
        fetchUsers(true);
      } else {
        Alert.alert('Gagal', res.message || 'Gagal membuat user');
      }
    } catch (e: any) {
      setIsSubmitting(false);
      console.error(e);
      Alert.alert('Gagal', e.response?.data?.message || e.message || 'Terjadi kesalahan jaringan');
    }
  };

  const handleDeleteUser = (id: number, name: string) => {
    Alert.alert(
      'Hapus Akun',
      `Apakah Anda yakin ingin menghapus akun ${name}? Tindakan ini permanen.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              const res = await api.deleteUser(id);
              if (res.success) {
                Alert.alert('Sukses', `Akun ${name} berhasil dihapus.`);
                fetchUsers(true);
              } else {
                Alert.alert('Gagal', res.message || 'Gagal menghapus user');
                setIsLoading(false);
              }
            } catch (e: any) {
              setIsLoading(false);
              console.error(e);
              Alert.alert('Gagal', e.message);
            }
          },
        },
      ]
    );
  };

  const handleRoleChange = async (
    userId: number,
    username: string,
    newRole: 'user' | 'admin' | 'super_admin'
  ) => {
    try {
      const res = await api.updateUser(userId, {
        role: newRole,
      });
  
      if (res.success) {
        Alert.alert(
          'Sukses',
          `Role ${username} berhasil diubah menjadi ${newRole}`
        );
  
        setOpenRoleUserId(null);
        fetchUsers(true);
      } else {
        Alert.alert('Gagal', res.message || 'Gagal mengubah role');
      }
    } catch (e: any) {
      Alert.alert('Gagal', e.message);
    }
  };

  const getRoleBadgeStyle = (userRole: string) => {
    switch (userRole) {
      case 'super_admin':
        return { bg: '#EEF2FF', text: '#4F46E5', label: 'Super Admin' };
      case 'admin':
        return { bg: '#F5F3FF', text: '#7C3AED', label: 'Admin' };
      default:
        return { bg: '#EFF6FF', text: '#2563EB', label: 'Pengguna' };
    }
  };

  const renderUserItem = ({ item }: { item: User }) => {
    const badge = getRoleBadgeStyle(item.role);
    return (
      <View style={styles.userCard}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{item.username.substring(0, 2).toUpperCase()}</Text>
        </View>

        <View style={styles.userInfo}>
          <Text style={styles.username} numberOfLines={1}>{item.username}</Text>
          <Text style={styles.email} numberOfLines={1}>{item.email}</Text>
          
          {/* Role Pill Indicator */}
          <TouchableOpacity
  style={[styles.roleBadge, { backgroundColor: badge.bg }]}
  onPress={() =>
    setOpenRoleUserId(
      openRoleUserId === item.id ? null : item.id
    )
  }
>
            <Text style={[styles.roleBadgeText, { color: badge.text }]}>{badge.label}</Text>
            <Ionicons name="swap-horizontal" size={10} color={badge.text} style={{ marginLeft: 4 }} />
          </TouchableOpacity>
          {openRoleUserId === item.id && (
  <View style={styles.roleDropdown}>
    <TouchableOpacity
      style={styles.roleDropdownItem}
      onPress={() =>
        handleRoleChange(item.id, item.username, 'user')
      }
    >
      <Text>User</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.roleDropdownItem}
      onPress={() =>
        handleRoleChange(item.id, item.username, 'admin')
      }
    >
      <Text>Admin</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.roleDropdownItem}
      onPress={() =>
        handleRoleChange(item.id, item.username, 'super_admin')
      }
    >
      <Text>Super Admin</Text>
    </TouchableOpacity>
  </View>
)}
        </View>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDeleteUser(item.id, item.username)}
        >
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.container}>
        {/* Upper Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Kelola Akun</Text>
            <Text style={styles.headerSubtitle}>Manajemen dan otorisasi hak akses user sistem</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => setAddModalOpen(true)}>
            <Ionicons name="person-add" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Cari user berdasarkan nama / email..."
              placeholderTextColor="#94A3B8"
              value={search}
              onChangeText={handleSearch}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => handleSearch('')}>
                <Ionicons name="close-circle" size={18} color="#94A3B8" style={{ marginRight: 8 }} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* User list */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2563EB" />
            <Text style={styles.loadingText}>Mengambil data pengguna...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#2563EB']} />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="people-outline" size={48} color="#CBD5E1" />
                <Text style={styles.emptyTitle}>Pengguna Tidak Ditemukan</Text>
                <Text style={styles.emptyDesc}>Tidak ada pengguna yang cocok dengan pencarian Anda.</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Add User Modal */}
      <Modal
        visible={addModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setAddModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={{ width: '100%' }}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Tambah Akun Baru</Text>
                <TouchableOpacity onPress={() => setAddModalOpen(false)}>
                  <Ionicons name="close" size={24} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView keyboardShouldPersistTaps="handled">
                {/* Username */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Nama Pengguna</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Contoh: agus_admin"
                    placeholderTextColor="#94A3B8"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Alamat Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="nama@email.com"
                    placeholderTextColor="#94A3B8"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password (Min. 6 Karakter)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Masukkan password"
                    placeholderTextColor="#94A3B8"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                </View>

                {/* Role Toggle */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Hak Akses (Role)</Text>
                  <View style={styles.roleOptions}>
                    {[
                      { id: 'user', label: 'User' },
                      { id: 'admin', label: 'Admin' },
                      { id: 'super_admin', label: 'Super Admin' },
                    ].map((opt) => (
                      <TouchableOpacity
                        key={opt.id}
                        style={[
                          styles.roleOptionCard,
                          role === opt.id && styles.roleOptionCardActive,
                        ]}
                        onPress={() => setRole(opt.id as any)}
                      >
                        <Text
                          style={[
                            styles.roleOptionText,
                            role === opt.id && styles.roleOptionTextActive,
                          ]}
                        >
                          {opt.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.modalSubmitBtn, isSubmitting && styles.modalSubmitBtnDisabled]}
                  onPress={handleCreateUser}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Buat Akun Sekarang</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  roleDropdown: {
    marginTop: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    overflow: 'hidden',
    width: 130,
  },
  
  roleDropdownItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  container: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingLeft: 10,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    height: 44,
    fontSize: 13,
    color: '#1E293B',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    flexGrow: 1,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 6,
    elevation: 1,
  },
  userAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  userAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#475569',
  },
  userInfo: {
    flex: 1,
    marginRight: 12,
  },
  username: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  email: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginTop: 6,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
  },
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748B',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  input: {
    height: 46,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 13,
    color: '#1E293B',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  roleOptionCard: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleOptionCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  roleOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  roleOptionTextActive: {
    color: '#2563EB',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    height: 48,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  modalSubmitBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
