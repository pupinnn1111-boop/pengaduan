import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import * as api from '../../lib/api';
import { Laporan } from '../../lib/api';

export default function LaporanDetail() {
  const { id } = useLocalSearchParams();
  const reportId = Number(id);
  const { user } = useAuth();
  const router = useRouter();

  const [report, setReport] = useState<Laporan | null>(null);
  const [resolvedBaseUrl, setResolvedBaseUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const isActionLoadingRef = useRef(false);

  // Comments
  const [commentText, setCommentText] = useState('');
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const isCommentSubmittingRef = useRef(false);

  // Resolve base URL once on mount
  useEffect(() => {
    api.getApiBaseUrl().then((url) => {
      setResolvedBaseUrl(url);
      setImageError(false);
    });
  }, []);

  const fetchReportDetails = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getLaporanById(reportId);
      if (res.success && res.data) {
        setReport(res.data);
      } else {
        Alert.alert('Eror', 'Laporan tidak ditemukan');
        router.back();
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Eror', 'Gagal memuat detail laporan atau Anda tidak memiliki akses.');
      router.back();
    } finally {
      setIsLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchReportDetails();
  }, [fetchReportDetails]);

  useEffect(() => {
    setImageError(false);
  }, [report?.image]);

  const handleStatusUpdate = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!report || isActionLoadingRef.current) return;
    isActionLoadingRef.current = true;
    setIsActionLoading(true);
    try {
      const formData = new FormData();
      formData.append('status', newStatus);

      const res = await api.updateLaporan(report.id, formData);
      if (res.success) {
        const labelMap = { approved: 'Disetujui', rejected: 'Ditolak', pending: 'Menunggu' };
        Alert.alert('Sukses', `Status laporan berhasil diubah menjadi ${labelMap[newStatus]}`);
        const reloadRes = await api.getLaporanById(report.id);
        if (reloadRes.success && reloadRes.data) {
          setReport(reloadRes.data);
        }
      } else {
        Alert.alert('Gagal', res.message || 'Gagal mengubah status');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Gagal', e.response?.data?.message || e.message || 'Terjadi kesalahan');
    } finally {
      setIsActionLoading(false);
      isActionLoadingRef.current = false;
    }
  };


  const handleDeleteReport = async () => {
    if (!report || isActionLoadingRef.current) return;
    isActionLoadingRef.current = true;
    setIsActionLoading(true);
    try {
      await api.deleteLaporan(report.id);

window.alert('Laporan berhasil dihapus');

if (user?.role === 'user') {
  router.replace('/(user)');
} else if (user?.role === 'admin') {
  router.replace('/(admin)');
} else if (user?.role === 'super_admin') {
  router.replace('/(super_admin)');
}
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal menghapus laporan';
      Alert.alert('Gagal', msg);
    } finally {
      setIsActionLoading(false);
      isActionLoadingRef.current = false;
    }
  };

  const handleCommentSubmit = async () => {
    if (!report || !commentText.trim()) return;
    if (isCommentSubmittingRef.current) return;

    isCommentSubmittingRef.current = true;
    setIsCommentSubmitting(true);
    try {
      const res = await api.createComment(report.id, commentText.trim());
      if (res.success) {
        setCommentText('');
        const reloadRes = await api.getLaporanById(report.id);
        if (reloadRes.success && reloadRes.data) {
          setReport(reloadRes.data);
        }
      } else {
        Alert.alert('Gagal', res.message || 'Gagal mengirim komentar');
      }
    } catch (e: any) {
      console.error(e);
      Alert.alert('Gagal', e.message);
    } finally {
      setIsCommentSubmitting(false);
      isCommentSubmittingRef.current = false;
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      await api.deleteComment(commentId);
      const reloadRes = await api.getLaporanById(reportId);
      if (reloadRes.success && reloadRes.data) {
        setReport(reloadRes.data);
      } else {
        fetchReportDetails();
      }
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.message || 'Gagal menghapus komentar';
      Alert.alert('Gagal', msg);
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#FEF3C7', text: '#D97706', label: 'Menunggu' };
      case 'approved':
        return { bg: '#D1FAE5', text: '#059669', label: 'Disetujui' };
      case 'rejected':
        return { bg: '#FEE2E2', text: '#DC2626', label: 'Ditolak' };
      default:
        return { bg: '#F1F5F9', text: '#475569', label: 'Laporan' };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateStr;
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeContainer}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.loadingText}>Memuat detail laporan...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!report) return null;

  const badge = getStatusBadgeStyle(report.status);
  const imageUri = api.buildImageUrl(resolvedBaseUrl, report.image);

  // Authorization checks
  const isOwner = user?.id === report.user_id;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  const isSuperAdmin = user?.role === 'super_admin';

  const canDelete = user?.role === 'super_admin' || (user?.role === 'user' && isOwner);
  const canDeleteReport = canDelete;
  const canComment = isAdmin || isOwner;

  const goToDashboard = () => {
    if (user?.role === 'user') {
      router.replace('/(user)');
    } else if (user?.role === 'admin') {
      router.replace('/(admin)');
    } else if (user?.role === 'super_admin') {
      router.replace('/(super_admin)');
    } else {
      router.replace('/(auth)/login');
    }
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Header toolbar */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => goToDashboard()}>
            <Ionicons name="arrow-back" size={22} color="#1E293B" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              Detail Laporan #{report.id}
            </Text>
            <Text style={styles.headerSubtitle}>{report.category?.name || 'Aduan'}</Text>
          </View>
          {canDeleteReport && (
 <TouchableOpacity
 style={styles.deleteButton}
 onPress={handleDeleteReport}
>
 <Ionicons name="trash-outline" size={22} color="#EF4444" />
</TouchableOpacity>
)}
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Attached Image */}
          <View style={styles.imageCard}>
            {imageUri && resolvedBaseUrl && !imageError ? (
              <Image
                key={imageUri}
                source={{ uri: imageUri }}
                style={styles.attachedImage}
                resizeMode="cover"
                onError={() => setImageError(true)}
              />
            ) : report.image && !resolvedBaseUrl ? (
              <View style={styles.noImagePlaceholder}>
                <ActivityIndicator color="#2563EB" size="small" />
                <Text style={styles.noImageText}>Memuat foto...</Text>
              </View>
            ) : imageError ? (
              <View style={styles.noImagePlaceholder}>
                <Ionicons name="image-outline" size={48} color="#FCA5A5" />
                <Text style={[styles.noImageText, { color: '#EF4444' }]}>Foto gagal dimuat</Text>
                <TouchableOpacity onPress={() => setImageError(false)}>
                  <Text style={styles.retryText}>Coba Lagi</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.noImagePlaceholder}>
                <Ionicons name="images-outline" size={48} color="#94A3B8" />
                <Text style={styles.noImageText}>Tidak Ada Lampiran Foto</Text>
              </View>
            )}
          </View>

          {/* Details Content Card */}
          <View style={styles.detailsCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
                <Text style={[styles.statusBadgeText, { color: badge.text }]}>{badge.label}</Text>
              </View>
              <Text style={styles.dateText}>{formatDate(report.created_at)}</Text>
            </View>

            <Text style={styles.reportTitle}>{report.title}</Text>
            <Text style={styles.reportDesc}>{report.description}</Text>

            <View style={styles.reporterInfo}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarMiniText}>
                  {report.user?.username.substring(0, 2).toUpperCase() || 'US'}
                </Text>
              </View>
              <View>
                <Text style={styles.reporterName}>{report.user?.username || 'Anonim'}</Text>
                <Text style={styles.reporterSub}>Pelapor Resmi</Text>
              </View>
            </View>
          </View>

          {/* Admin Action Card */}
          {isAdmin && (
            <View style={styles.adminActionCard}>
              <Text style={styles.adminTitle}>Verifikasi Tindakan Administrator</Text>
              <Text style={styles.adminDesc}>Tentukan hasil pemeriksaan aduan masyarakat ini:</Text>

              {isActionLoading ? (
                <ActivityIndicator color="#2563EB" size="small" style={{ marginVertical: 8 }} />
              ) : (
                <View style={styles.adminButtons}>
                  <TouchableOpacity
                    style={[styles.actionBtn, styles.approveBtn, report.status === 'approved' && styles.actionBtnDisabled]}
                    onPress={() => handleStatusUpdate('approved')}
                    disabled={report.status === 'approved' || isActionLoading}
                  >
                    <Ionicons name="checkmark-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Setujui</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, styles.rejectBtn, report.status === 'rejected' && styles.actionBtnDisabled]}
                    onPress={() => handleStatusUpdate('rejected')}
                    disabled={report.status === 'rejected' || isActionLoading}
                  >
                    <Ionicons name="close-circle-outline" size={18} color="#FFFFFF" />
                    <Text style={styles.actionBtnText}>Tolak</Text>
                  </TouchableOpacity>

                  {report.status !== 'pending' && (
                    <TouchableOpacity
                      style={[styles.actionBtn, styles.pendingBtn]}
                      onPress={() => handleStatusUpdate('pending')}
                      disabled={isActionLoading}
                    >
                      <Ionicons name="time-outline" size={18} color="#475569" />
                      <Text style={[styles.actionBtnText, { color: '#475569' }]}>Tinjau Ulang</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {/* Comments Discussion section */}
          <View style={styles.commentsHeader}>
            <Ionicons name="chatbubbles-outline" size={20} color="#1E293B" style={{ marginRight: 6 }} />
            <Text style={styles.commentsTitle}>
              Diskusi & Komentar ({report.comments?.length || 0})
            </Text>
          </View>

          {/* Comment list */}
          <View style={styles.commentsList}>
            {!report.comments || report.comments.length === 0 ? (
              <View style={styles.emptyCommentsCard}>
                <Text style={styles.emptyCommentsText}>Belum ada diskusi untuk aduan ini.</Text>
              </View>
            ) : (
              report.comments.map((comment) => {
                const isCommentOwner = String(user?.id) === String(comment.user_id);
                const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
                const showDeleteBtn = isCommentOwner || isAdmin;

                return (
                  <View key={comment.id} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <View style={styles.commentUser}>
                        <View style={styles.avatarComment}>
                          <Text style={styles.avatarCommentText}>
                            {comment.user?.username.substring(0, 2).toUpperCase() || 'US'}
                          </Text>
                        </View>
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.commentUsername}>
                          {comment.user?.username}
</Text>
                            {comment.user?.role !== 'user' && (
                              <View
                                style={[
                                  styles.roleMiniBadge,
                                  {
                                    backgroundColor:
                                      comment.user?.role === 'super_admin' ? '#EEF2FF' : '#F5F3FF',
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.roleMiniBadgeText,
                                    {
                                      color:
                                        comment.user?.role === 'super_admin' ? '#4F46E5' : '#7C3AED',
                                    },
                                  ]}
                                >
                                  {comment.user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                                </Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.commentTime}>{formatDate(comment.created_at)}</Text>
                        </View>
                      </View>

                      {showDeleteBtn && (
                        <TouchableOpacity
                          style={styles.commentDeleteBtn}
                          onPress={() => handleDeleteComment(comment.id)}
                        >
                          <Ionicons name="trash-outline" size={15} color="#EF4444" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <Text style={styles.commentText}>{comment.comment}</Text>
                  </View>
                );
              })
            )}
          </View>
        </ScrollView>

        {/* Floating Input Box for commenting */}
        {canComment ? (
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Tulis tanggapan atau saran Anda..."
              placeholderTextColor="#94A3B8"
              value={commentText}
              onChangeText={setCommentText}
              multiline
              maxLength={300}
            />
            <TouchableOpacity
              style={[
                styles.sendCommentBtn,
                (!commentText.trim() || isCommentSubmitting) && styles.sendCommentBtnDisabled,
              ]}
              onPress={handleCommentSubmit}
              disabled={!commentText.trim() || isCommentSubmitting}
            >
              {isCommentSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Ionicons name="send" size={18} color="#FFFFFF" />
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.commentDisabledCard}>
            <Text style={styles.commentDisabledText}>
              Diskusi hanya dibuka untuk pelapor dan administrator sistem.
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  backButton: {
    padding: 6,
  },
  headerTitleContainer: {
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E293B',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#2563EB',
    fontWeight: '700',
    marginTop: 1,
  },
  deleteButton: {
    padding: 6,
    zIndex: 9999,
    elevation: 9999,
  },
  scrollContainer: {
    paddingBottom: 80,
  },
  imageCard: {
    backgroundColor: '#FFFFFF',
    height: 240,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  attachedImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 8,
  },
  retryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    lineHeight: 24,
    marginBottom: 8,
  },
  reportDesc: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 20,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 16,
  },
  avatarMini: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  avatarMiniText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#2563EB',
  },
  reporterName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  reporterSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  adminActionCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  adminTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  adminDesc: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    marginBottom: 14,
  },
  adminButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  approveBtn: {
    backgroundColor: '#10B981',
  },
  rejectBtn: {
    backgroundColor: '#EF4444',
  },
  pendingBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  commentsTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E293B',
  },
  commentsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyCommentsCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: 12,
    color: '#94A3B8',
  },
  commentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentUser: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarComment: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarCommentText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563EB',
  },
  commentUsername: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  roleMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 6,
  },
  roleMiniBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  commentTime: {
    fontSize: 9,
    color: '#94A3B8',
    marginTop: 1,
  },
  commentDeleteBtn: {
    padding: 4,
  },
  commentText: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 8,
  },
  commentInputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    height: 40,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
    color: '#1E293B',
    marginRight: 8,
  },
  sendCommentBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2563EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sendCommentBtnDisabled: {
    backgroundColor: '#93C5FD',
  },
  commentDisabledCard: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    padding: 14,
    alignItems: 'center',
  },
  commentDisabledText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
  },
});