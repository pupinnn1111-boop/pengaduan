require('dotenv').config({ path: '../.env' });
const bcrypt = require('bcryptjs');
const { sequelize, connectDB } = require('../src/config/database');
const { User, Category, Laporan, Comment } = require('../src/models');

const seed = async () => {
  try {
    await connectDB();

    console.log('🌱 Mulai seeding database...\n');

    // ============================================
    // SEED USERS
    // ============================================
    const hashedPassword = await bcrypt.hash('password123', 10);

    const users = await User.bulkCreate(
      [
        {
          username: 'superadmin',
          email: 'superadmin@pengaduan.com',
          password: hashedPassword,
          role: 'super_admin',
        },
        {
          username: 'admin_kota',
          email: 'admin@pengaduan.com',
          password: hashedPassword,
          role: 'admin',
        },
        {
          username: 'budi_santoso',
          email: 'budi@gmail.com',
          password: hashedPassword,
          role: 'user',
        },
        {
          username: 'siti_rahayu',
          email: 'siti@gmail.com',
          password: hashedPassword,
          role: 'user',
        },
        {
          username: 'agus_purnomo',
          email: 'agus@gmail.com',
          password: hashedPassword,
          role: 'user',
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log(`✅ Berhasil seed ${users.length} users`);

    // ============================================
    // SEED CATEGORIES
    // ============================================
    const categories = await Category.bulkCreate(
      [
        { name: 'Infrastruktur Jalan' },
        { name: 'Kebersihan Lingkungan' },
        { name: 'Keamanan & Ketertiban' },
        { name: 'Pelayanan Publik' },
        { name: 'Bencana Alam' },
        { name: 'Fasilitas Umum' },
      ],
      { ignoreDuplicates: true }
    );

    console.log(`✅ Berhasil seed ${categories.length} kategori`);

    // Ambil ulang data aktual dari DB
    const dbUsers = await User.findAll();
    const dbCategories = await Category.findAll();

    const userUser = dbUsers.find((u) => u.role === 'user');
    const user2 = dbUsers.filter((u) => u.role === 'user')[1];

    // ============================================
    // SEED LAPORAN
    // ============================================
    const laporan = await Laporan.bulkCreate(
      [
        {
          user_id: userUser.id,
          category_id: dbCategories[0].id,
          title: 'Jalan Raya Sudirman Berlubang Parah',
          description:
            'Jalan raya di Sudirman dekat lampu merah mengalami kerusakan serius. Terdapat beberapa lubang besar yang membahayakan pengendara motor dan mobil, terutama saat malam hari.',
          status: 'pending',
          image: null,
        },
        {
          user_id: userUser.id,
          category_id: dbCategories[1].id,
          title: 'Tumpukan Sampah di TPS Tidak Diangkut',
          description:
            'Tempat Pembuangan Sampah di RT 05 sudah menumpuk selama 5 hari dan tidak ada petugas yang mengangkut. Bau menyengat dan mulai mengganggu warga sekitar.',
          status: 'approved',
          image: null,
        },
        {
          user_id: user2 ? user2.id : userUser.id,
          category_id: dbCategories[2].id,
          title: 'Lampu Jalan Mati di Kawasan Perumahan',
          description:
            'Lampu penerangan jalan di blok D perumahan Griya Indah sudah mati sejak 2 minggu yang lalu. Warga merasa tidak aman saat pulang malam hari.',
          status: 'approved',
          image: null,
        },
        {
          user_id: user2 ? user2.id : userUser.id,
          category_id: dbCategories[3].id,
          title: 'Antrian Panjang di Kantor Kelurahan',
          description:
            'Proses pembuatan KTP di kantor kelurahan sangat lambat. Warga harus mengantri berjam-jam dan sistem pelayanan perlu diperbaiki.',
          status: 'rejected',
          image: null,
        },
        {
          user_id: userUser.id,
          category_id: dbCategories[4].id,
          title: 'Banjir Menggenangi Pemukiman Warga',
          description:
            'Hujan deras kemarin menyebabkan banjir setinggi 50cm di kawasan RT 03 RW 02. Puluhan rumah terendam dan warga membutuhkan bantuan evakuasi.',
          status: 'pending',
          image: null,
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log(`✅ Berhasil seed ${laporan.length} laporan`);

    // Ambil laporan dari DB
    const dbLaporan = await Laporan.findAll();
    const adminUser = dbUsers.find((u) => u.role === 'admin');

    // ============================================
    // SEED COMMENTS
    // ============================================
    const comments = await Comment.bulkCreate(
      [
        {
          laporan_id: dbLaporan[0].id,
          user_id: adminUser.id,
          comment: 'Laporan sudah diterima. Tim dinas PU akan segera melakukan pengecekan ke lokasi.',
        },
        {
          laporan_id: dbLaporan[0].id,
          user_id: userUser.id,
          comment: 'Terima kasih pak admin. Semoga bisa segera diperbaiki karena sudah banyak yang jatuh.',
        },
        {
          laporan_id: dbLaporan[1].id,
          user_id: adminUser.id,
          comment: 'Sudah dikoordinasikan dengan dinas kebersihan. Pengangkutan dijadwalkan besok pagi.',
        },
        {
          laporan_id: dbLaporan[2].id,
          user_id: adminUser.id,
          comment: 'Laporan diterima. PLN sudah dihubungi untuk perbaikan segera.',
        },
      ],
      { ignoreDuplicates: true }
    );

    console.log(`✅ Berhasil seed ${comments.length} komentar`);

    console.log('\n🎉 Seeding selesai!\n');
    console.log('📋 Akun untuk testing:');
    console.log('─────────────────────────────────────────');
    console.log('👑 Super Admin : superadmin@pengaduan.com / password123');
    console.log('🛡️  Admin       : admin@pengaduan.com / password123');
    console.log('👤 User 1      : budi@gmail.com / password123');
    console.log('👤 User 2      : siti@gmail.com / password123');
    console.log('─────────────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding gagal:', error);
    process.exit(1);
  }
};

seed();
