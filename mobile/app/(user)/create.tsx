import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as api from '../../lib/api';
import { Category } from '../../lib/api';

export default function CreateLaporan() {
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsCategoriesLoading(true);
        const res = await api.getCategories();
        if (res.success && res.data) {
          setCategories(res.data);
          setCategoryId(null);
        }
      } catch (e) {
        console.error('Failed to load categories:', e);
      } finally {
        setIsCategoriesLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  
    if (status !== 'granted') {
      Alert.alert(
        'Izin Akses Galeri',
        'Sistem membutuhkan izin galeri untuk melampirkan foto bukti laporan.'
      );
      return;
    }
  
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
  
    if (!result.canceled && result.assets?.length > 0) {
      const asset = result.assets[0];
      setImageUri(asset.uri);
  
      if (Platform.OS === 'web') {
        try {
          const response = await fetch(asset.uri);
          const blob = await response.blob();
          const file = new File(
            [blob],
            asset.fileName || `image-${Date.now()}.jpg`,
            { type: blob.type || 'image/jpeg' }
          );
          setImageFile(file);
        } catch (err) {
          console.error('FAILED CREATE FILE:', err);
        }
      }
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
    setImageFile(null);
  };

  const isSubmittingRef = useRef(false);

  const handleSubmit = async () => {
    if (isSubmittingRef.current) return;
  
    if (!title.trim() || !description.trim() || !categoryId) {
      setErrorMsg('Judul, deskripsi, dan kategori wajib diisi');
      return;
    }
  
    isSubmittingRef.current = true;
    setErrorMsg(null);
    setIsLoading(true);
  
    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category_id', String(categoryId));
  
      if (Platform.OS === 'web') {
        if (imageFile) formData.append('image', imageFile);
      } else {
        if (imageUri) {
          const filename = imageUri.split('/')[imageUri.split('/').length - 1];
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1].toLowerCase()}` : 'image/jpeg';
          formData.append('image', {
            uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
            name: filename,
            type,
          } as any);
        }
      }
  
      const res = await api.createLaporan(formData);
  
      if (res.success) {
        // Reset form dulu
        setTitle('');
        setDescription('');
        setCategoryId(null);
        setImageUri(null);
        setImageFile(null);
      
        // ✅ Fix untuk web: langsung navigate, alert pakai cara berbeda
        if (Platform.OS === 'web') {
          window.alert('Laporan berhasil dikirim!');
          router.replace('/(user)');
        } else {
          Alert.alert('Sukses', 'Laporan berhasil dikirim!', [
            {
              text: 'OK',
              onPress: () => router.replace('/(user)'),
            },
          ]);
        }
        return;
      }
  
      setErrorMsg(res.message || 'Gagal mengirim laporan');
    } catch (e: any) {
      console.error('SUBMIT ERROR:', e);
      setErrorMsg(
        e?.response?.data?.message || e?.message || 'Terjadi kesalahan'
      );
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
    }
  };

  const getActiveCategoryName = () => {
    const selected = categories.find((c) => c.id === categoryId);
    return selected ? selected.name : 'Pilih Kategori';
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tulis Pengaduan Baru</Text>
          <Text style={styles.headerSubtitle}>Laporkan permasalahan fasilitas publik secara cepat</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            {errorMsg && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={18} color="#EF4444" style={styles.errorIcon} />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Judul Laporan</Text>
              <TextInput
                style={styles.input}
                placeholder="Contoh: Jalan Berlubang Parah di RT 03"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Kategori Aduan</Text>
              {isCategoriesLoading ? (
                <ActivityIndicator color="#2563EB" size="small" />
              ) : (
                <TouchableOpacity
                  style={styles.selectorWrapper}
                  onPress={() => setShowCategorySelector(!showCategorySelector)}
                >
                  <Text style={styles.selectorText}>{getActiveCategoryName()}</Text>
                  <Ionicons
                    name={showCategorySelector ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#64748B"
                  />
                </TouchableOpacity>
              )}

              {showCategorySelector && (
                <View style={styles.selectorDropdown}>
                  {categories.map((c) => (
                    <TouchableOpacity
                      key={c.id}
                      style={[styles.dropdownItem, categoryId === c.id && styles.dropdownItemActive]}
                      onPress={() => {
                        setCategoryId(c.id);
                        setShowCategorySelector(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, categoryId === c.id && styles.dropdownItemTextActive]}>
                        {c.name}
                      </Text>
                      {categoryId === c.id && <Ionicons name="checkmark" size={18} color="#2563EB" />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Detail Pengaduan</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Tuliskan kronologi lengkap, lokasi spesifik, dan dampak permasalahan..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Foto Bukti Lampiran (Opsional)</Text>
              {imageUri ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: imageUri }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={handleRemoveImage}>
                    <Ionicons name="close" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.imagePickerBtn} onPress={handlePickImage}>
                  <Ionicons name="camera-outline" size={28} color="#2563EB" />
                  <Text style={styles.imagePickerText}>Unggah Foto Bukti</Text>
                  <Text style={styles.imagePickerSubtext}>Ukuran file foto maksimal 5MB</Text>
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.submitBtn, (isLoading || isSubmittingRef.current) && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading || isSubmittingRef.current}
              activeOpacity={isLoading || isSubmittingRef.current ? 1 : 0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Kirim Laporan Pengaduan</Text>
                  <Ionicons name="paper-plane" size={16} color="#FFFFFF" style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#F5F7FA' },
  keyboardContainer: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#1E293B' },
  headerSubtitle: { fontSize: 12, color: '#64748B', marginTop: 2 },
  scrollContainer: { paddingHorizontal: 20, paddingBottom: 40, paddingTop: 8 },
  card: {
    backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20,
    borderWidth: 1, borderColor: '#E2E8F0',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02, shadowRadius: 8, elevation: 1,
  },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2',
    borderWidth: 1, borderColor: '#FCA5A5', padding: 10,
    borderRadius: 10, marginBottom: 16,
  },
  errorIcon: { marginRight: 6 },
  errorText: { fontSize: 12, color: '#EF4444', fontWeight: '600', flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 6 },
  input: {
    height: 48, backgroundColor: '#F8FAFC', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 12, paddingHorizontal: 14,
    fontSize: 14, color: '#1E293B',
  },
  textArea: { height: 120, paddingTop: 12 },
  selectorWrapper: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#F8FAFC', borderWidth: 1, borderColor: '#E2E8F0',
    borderRadius: 12, height: 48, paddingHorizontal: 14,
  },
  selectorText: { fontSize: 14, color: '#1E293B', fontWeight: '500' },
  selectorDropdown: {
    marginTop: 6, backgroundColor: '#FFFFFF', borderWidth: 1,
    borderColor: '#E2E8F0', borderRadius: 12, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 3,
  },
  dropdownItem: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 12, paddingHorizontal: 14,
    borderBottomWidth: 1, borderBottomColor: '#F1F5F9',
  },
  dropdownItemActive: { backgroundColor: '#EFF6FF' },
  dropdownItemText: { fontSize: 14, color: '#475569' },
  dropdownItemTextActive: { color: '#2563EB', fontWeight: '700' },
  imagePickerBtn: {
    height: 120, borderRadius: 12, borderWidth: 1.5,
    borderStyle: 'dashed', borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center',
  },
  imagePickerText: { fontSize: 13, fontWeight: '700', color: '#2563EB', marginTop: 6 },
  imagePickerSubtext: { fontSize: 10, color: '#64748B', marginTop: 2 },
  imagePreviewContainer: {
    position: 'relative', height: 180, borderRadius: 12,
    overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0',
  },
  imagePreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  removeImageBtn: {
    position: 'absolute', top: 8, right: 8, width: 28, height: 28,
    borderRadius: 14, backgroundColor: 'rgba(30, 41, 59, 0.7)',
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtn: {
    height: 50, backgroundColor: '#2563EB', borderRadius: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 10, shadowColor: '#2563EB', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15, shadowRadius: 8, elevation: 3,
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
});