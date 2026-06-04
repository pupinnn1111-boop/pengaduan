'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store/authStore';
import { getLaporanById, updateLaporan, deleteLaporan } from '@/lib/api/laporan';
import { createComment, deleteComment } from '@/lib/api/comments';
import type { Laporan } from '@/lib/types';
import { API_URL } from '@/lib/utils/constants';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Loader } from '@/components/ui/Loader';
import { formatDate, formatDateTime } from '@/lib/utils/formatDate';
import { 
  HiArrowLeft, 
  HiChatBubbleLeftEllipsis,
  HiTrash,
  HiPencilSquare,
  HiChevronRight,
  HiMapPin
} from 'react-icons/hi2';
import toast from 'react-hot-toast';

export default function DetailLaporanPage() {
  const router = useRouter();
  const { id } = useParams();
  const { user } = useAuthStore();
  
  const [report, setReport] = useState<Laporan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // Comment states
  const [commentText, setCommentText] = useState('');
  const [isCommentSubmitLoading, setIsCommentSubmitLoading] = useState(false);

  // Modals
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch Report Detail
  const fetchReportDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const res = await getLaporanById(Number(id));
      setReport(res.data);
    } catch {
      toast.error('Laporan tidak ditemukan atau Anda tidak memiliki akses');
      router.push('/laporan');
    } finally {
      setIsLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchReportDetail();
  }, [fetchReportDetail]);

  // Handle status update (Admin/Super Admin only)
  const handleStatusUpdate = async (newStatus: 'pending' | 'approved' | 'rejected') => {
    if (!report) return;
    try {
      setIsActionLoading(true);
      const formData = new FormData();
      formData.append('status', newStatus);

      await updateLaporan(report.id, formData);
      toast.success(`Status laporan berhasil diubah menjadi ${newStatus === 'approved' ? 'Disetujui' : 'Ditolak'}`);
      
      // Reload report detail
      const res = await getLaporanById(report.id);
      setReport(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Gagal memperbarui status laporan';
      toast.error(errMsg);
    } finally {
      setIsActionLoading(false);
    }
  };

  // Handle report delete
  const handleDeleteReport = async () => {
    if (!report) return;
    try {
      setIsActionLoading(true);
      await deleteLaporan(report.id);
      toast.success('Laporan berhasil dihapus');
      router.push('/laporan');
    } catch {
      toast.error('Gagal menghapus laporan');
    } finally {
      setIsActionLoading(false);
      setDeleteModalOpen(false);
    }
  };

  // Handle comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!report || !commentText.trim()) return;
    try {
      setIsCommentSubmitLoading(true);
      await createComment(report.id, commentText);
      setCommentText('');
      toast.success('Komentar berhasil ditambahkan');
      
      // Reload report detail to get fresh comments list
      const res = await getLaporanById(report.id);
      setReport(res.data);
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : 'Gagal mengirim komentar';
      toast.error(errMsg);
    } finally {
      setIsCommentSubmitLoading(false);
    }
  };

  // Handle comment delete
  const handleDeleteComment = async (commentId: number) => {
    try {
      await deleteComment(commentId);
      toast.success('Komentar berhasil dihapus');
      
      // Reload report detail
      const res = await getLaporanById(Number(id));
      setReport(res.data);
    } catch {
      toast.error('Gagal menghapus komentar');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (!report) return null;

  // Enforce access: User can only write comment if they own the report OR if they are admin/super_admin
  const canComment = user?.role !== 'user' || user.id === report.user_id;
  const canDeleteReport = user?.role === 'super_admin' || (user?.role === 'user' && user.id === report.user_id);
  const canEditReport = user?.role !== 'admin' && (user?.role === 'super_admin' || (user?.role === 'user' && user.id === report.user_id));

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs md:text-sm text-text-secondary">
        <Link href="/laporan" className="hover:text-primary transition-all">Laporan</Link>
        <HiChevronRight className="h-3.5 w-3.5 text-text-muted" />
        <span className="text-text-primary font-semibold truncate max-w-[200px]">{report.title}</span>
      </div>

      {/* Action Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/laporan')}
            className="rounded-xl border border-border bg-surface p-2.5 text-text-secondary hover:bg-background transition-all shadow-sm"
          >
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-text-primary">Detail Laporan</h1>
            <p className="text-xs text-text-secondary mt-0.5">ID Laporan: #{report.id}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {canEditReport && (
            <Link href={`/laporan/${report.id}/edit`}>
              <Button variant="outline" className="gap-2 rounded-xl text-text-secondary">
                <HiPencilSquare className="h-5 w-5" />
                Edit
              </Button>
            </Link>
          )}

          {canDeleteReport && (
            <Button
              variant="danger"
              className="gap-2 rounded-xl"
              onClick={() => setDeleteModalOpen(true)}
            >
              <HiTrash className="h-5 w-5" />
              Hapus
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Content Left (2 columns) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border border-border" hover={false}>
            {/* Laporan Image */}
            <div className="relative h-[350px] w-full bg-slate-50 border-b border-border">
              {report.image ? (
                <img
                  src={`${API_URL}/uploads/${report.image}`}
                  alt={report.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/800x600/e2e8f0/1e293b?text=Gambar+Laporan';
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-blue-50 text-primary">
                  <HiChatBubbleLeftEllipsis className="h-16 w-16 opacity-30" />
                  <span className="text-sm font-semibold mt-2">Tidak Ada Lampiran Foto Bukti</span>
                </div>
              )}
            </div>

            {/* Laporan Information */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Badge status={report.status} />
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-lg">
                    {report.category?.name || 'Kategori'}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                  <HiMapPin className="h-4.5 w-4.5 text-text-muted" />
                  <span>Lokasi Publik</span>
                </div>
              </div>

              <h2 className="text-xl md:text-2xl font-bold text-text-primary leading-tight">
                {report.title}
              </h2>

              <p className="text-sm text-text-secondary whitespace-pre-line leading-relaxed">
                {report.description}
              </p>

              {/* Creator details */}
              <div className="pt-6 border-t border-border flex items-center justify-between text-xs text-text-secondary">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                    {report.user?.username?.substring(0, 2).toUpperCase() || 'US'}
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">{report.user?.username || 'Anonim'}</p>
                    <p className="text-[10px] text-text-muted">Pelapor Resmi</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium text-right text-text-primary">{formatDate(report.created_at)}</p>
                  <p className="text-[10px] text-text-muted text-right">Dibuat pada {formatDateTime(report.created_at)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Admin Verification Card */}
          {user && (user.role === 'admin' || user.role === 'super_admin') && (
            <Card className="p-6 border border-border" hover={false}>
              <h3 className="text-base font-bold text-text-primary mb-3">Tindakan Admin & Verifikasi</h3>
              <p className="text-xs text-text-secondary mb-5">Sebagai administrator, Anda dapat memverifikasi kesesuaian laporan masyarakat dan memperbarui statusnya.</p>
              
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  variant="primary"
                  className="bg-emerald-600 hover:bg-emerald-700 border-none font-semibold text-sm rounded-xl"
                  disabled={report.status === 'approved' || isActionLoading}
                  onClick={() => handleStatusUpdate('approved')}
                >
                  Setujui Laporan
                </Button>
                <Button
                  variant="danger"
                  className="font-semibold text-sm rounded-xl"
                  disabled={report.status === 'rejected' || isActionLoading}
                  onClick={() => handleStatusUpdate('rejected')}
                >
                  Tolak Laporan
                </Button>
                {report.status !== 'pending' && (
                  <Button
                    variant="outline"
                    className="font-semibold text-sm rounded-xl"
                    disabled={isActionLoading}
                    onClick={() => handleStatusUpdate('pending')}
                  >
                    Kembalikan ke Menunggu
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Comments Section Right (1 column) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-text-primary flex items-center gap-2.5">
            <HiChatBubbleLeftEllipsis className="h-6 w-6 text-primary" />
            Diskusi & Komentar ({report.comments?.length || 0})
          </h3>

          {/* Comment input form */}
          {canComment ? (
            <Card className="p-4 border border-border" hover={false}>
              <form onSubmit={handleCommentSubmit} className="space-y-3">
                <textarea
                  placeholder="Tulis tanggapan atau saran Anda..."
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full p-3 rounded-xl border border-border bg-background text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
                  required
                />
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    size="sm"
                    className="rounded-xl text-xs"
                    isLoading={isCommentSubmitLoading}
                  >
                    Kirim Komentar
                  </Button>
                </div>
              </form>
            </Card>
          ) : (
            <Card className="p-4 bg-muted text-center" hover={false}>
              <p className="text-xs text-text-secondary leading-normal">Hanya pelapor yang bersangkutan atau administrator yang dapat berkomentar pada pengaduan ini.</p>
            </Card>
          )}

          {/* Comments List */}
          <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
            {!report.comments || report.comments.length === 0 ? (
              <div className="text-center py-8 text-text-secondary border border-dashed border-border rounded-2xl bg-surface">
                <p className="text-xs">Belum ada diskusi untuk laporan ini.</p>
              </div>
            ) : (
              report.comments.map((comment) => {
                const isCommentOwner = user?.id === comment.user_id;
                const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
                const showDeleteBtn = isCommentOwner || isAdmin;
                
                return (
                  <Card key={comment.id} className="p-4 border border-border relative group" hover={false}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs flex-shrink-0">
                          {comment.user?.username?.substring(0, 2).toUpperCase() || 'US'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-text-primary truncate">{comment.user?.username}</span>
                            {comment.user?.role !== 'user' && (
                              <span className="text-[9px] bg-primary/10 text-primary font-bold px-1.5 py-0.5 rounded uppercase">
                                {comment.user?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-text-muted">{formatDateTime(comment.created_at)}</span>
                        </div>
                      </div>
                      
                      {showDeleteBtn && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-danger opacity-0 group-hover:opacity-100 transition-all"
                          title="Hapus Komentar"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <p className="text-xs text-text-secondary mt-2.5 whitespace-pre-wrap leading-relaxed">
                      {comment.comment}
                    </p>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Hapus Laporan Pengaduan?"
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
              onClick={handleDeleteReport}
              isLoading={isActionLoading}
            >
              Hapus Laporan
            </Button>
          </div>
        }
      >
        <p className="text-sm text-text-secondary leading-normal">Apakah Anda yakin ingin menghapus laporan pengaduan ini? Tindakan ini bersifat permanen dan data laporan beserta foto lampiran akan dihapus sepenuhnya dari sistem.</p>
      </Modal>
    </div>
  );
}
