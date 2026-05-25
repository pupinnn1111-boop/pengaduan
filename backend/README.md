# 🏛️ Sistem Pelaporan Pengaduan Masyarakat — Backend API

REST API untuk sistem pelaporan pengaduan masyarakat berbasis **Node.js + Express + MySQL + Sequelize + JWT**.

---

## 📁 Struktur Folder

```
pengaduan-api/
├── src/
│   ├── app.js                    # Entry point Express
│   ├── config/
│   │   └── database.js           # Koneksi & sync Sequelize
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Me
│   │   ├── userController.js     # CRUD User (super_admin)
│   │   ├── categoryController.js # CRUD Kategori
│   │   ├── laporanController.js  # CRUD Laporan + upload
│   │   └── commentController.js  # CRUD Komentar
│   ├── middleware/
│   │   ├── authMiddleware.js     # Verifikasi JWT token
│   │   ├── roleMiddleware.js     # Cek role user
│   │   ├── errorHandler.js      # Global error handler
│   │   └── validate.js          # Cek hasil validasi
│   ├── models/
│   │   ├── index.js              # Load model + asosiasi
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Laporan.js
│   │   └── Comment.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── laporanRoutes.js
│   │   └── commentRoutes.js
│   ├── utils/
│   │   ├── jwt.js               # Generate & verify token
│   │   ├── upload.js            # Konfigurasi Multer
│   │   └── response.js          # Format response JSON
│   └── validations/
│       ├── authValidation.js
│       └── laporanValidation.js
├── seeders/
│   └── index.js                 # Dummy data seeder
├── uploads/                     # Folder penyimpanan gambar
├── schema.sql                   # SQL schema manual
├── .env.example
├── .gitignore
└── package.json
```

---

## ⚙️ Setup & Cara Menjalankan

### 1. Clone & Install Dependencies

```bash
git clone <repo-url>
cd pengaduan-api
npm install
```

### 2. Setup Environment Variables

```bash
cp .env.example .env
```

Edit file `.env`:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=3306
DB_NAME=pengaduan_db
DB_USER=root
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_EXPIRES_IN=7d

MAX_FILE_SIZE=5242880
UPLOAD_PATH=uploads
```

### 3. Buat Database MySQL

```sql
CREATE DATABASE pengaduan_db;
```

Atau jalankan schema manual:

```bash
mysql -u root -p < schema.sql
```

### 4. Jalankan Server

```bash
# Development (dengan nodemon)
npm run dev

# Production
npm start
```

### 5. Seed Data Dummy (Opsional)

```bash
npm run seed
```

Akun hasil seeder:
| Role | Email | Password |
|------|-------|----------|
| super_admin | superadmin@pengaduan.com | password123 |
| admin | admin@pengaduan.com | password123 |
| user | budi@gmail.com | password123 |
| user | siti@gmail.com | password123 |

---

## 🔐 Autentikasi

API menggunakan **JWT Bearer Token**.

Setelah login, sertakan token di header setiap request:

```
Authorization: Bearer <token>
```

---

## 📌 Daftar Endpoint API

### AUTH

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| POST | `/auth/register` | Public | Daftar akun baru |
| POST | `/auth/login` | Public | Login & dapat token |
| GET | `/auth/me` | Private | Lihat profil sendiri |

### USERS (super_admin only)

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/users` | Lihat semua user |
| GET | `/users/:id` | Lihat user by ID |
| POST | `/users` | Buat user baru |
| PUT | `/users/:id` | Update user |
| DELETE | `/users/:id` | Hapus user |

### CATEGORIES

| Method | Endpoint | Akses | Deskripsi |
|--------|----------|-------|-----------|
| GET | `/categories` | Semua | Lihat semua kategori |
| POST | `/categories` | admin, super_admin | Tambah kategori |
| PUT | `/categories/:id` | admin, super_admin | Edit kategori |
| DELETE | `/categories/:id` | admin, super_admin | Hapus kategori |

### LAPORAN

| Method | Endpoint | Query Params | Deskripsi |
|--------|----------|-------------|-----------|
| GET | `/laporan` | `page, limit, search, status` | Lihat laporan |
| GET | `/laporan/:id` | — | Lihat detail laporan |
| POST | `/laporan` | — | Buat laporan (form-data) |
| PUT | `/laporan/:id` | — | Edit laporan |
| DELETE | `/laporan/:id` | — | Hapus laporan |

**Query params GET /laporan:**
- `page` — halaman (default: 1)
- `limit` — jumlah per halaman (default: 10)
- `search` — cari berdasarkan title
- `status` — filter: `pending` / `approved` / `rejected`

### COMMENTS

| Method | Endpoint | Query Params | Deskripsi |
|--------|----------|-------------|-----------|
| GET | `/comments` | `laporan_id` | Lihat komentar |
| POST | `/comments` | — | Tambah komentar |
| DELETE | `/comments/:id` | — | Hapus komentar |

---

## 📤 Upload Gambar

- Endpoint: `POST /laporan` atau `PUT /laporan/:id`
- Form field: `image`
- Content-Type: `multipart/form-data`
- Format: jpg, jpeg, png, gif, webp
- Maks. ukuran: **5MB**
- Akses gambar: `http://localhost:3000/uploads/<nama-file>`

---

## 📋 Format Response JSON

**Sukses:**
```json
{
  "success": true,
  "message": "Data berhasil diambil",
  "data": {}
}
```

**Sukses dengan Pagination:**
```json
{
  "success": true,
  "message": "Data laporan berhasil diambil",
  "data": [],
  "pagination": {
    "total": 25,
    "total_pages": 3,
    "current_page": 1,
    "per_page": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Pesan error",
  "errors": ["Detail error 1", "Detail error 2"]
}
```

---

## 🔒 Aturan Otorisasi

| Aksi | user | admin | super_admin |
|------|------|-------|-------------|
| Register / Login | ✅ | ✅ | ✅ |
| Buat laporan | ✅ | ✅ | ✅ |
| Lihat laporan sendiri | ✅ | ✅ | ✅ |
| Lihat semua laporan | ❌ | ✅ | ✅ |
| Edit laporan sendiri | ✅ | ✅ | ✅ |
| Ubah status laporan | ❌ | ✅ | ✅ |
| Hapus laporan sendiri | ✅ | ❌ | ✅ |
| CRUD kategori | ❌ | ✅ | ✅ |
| CRUD user | ❌ | ❌ | ✅ |
| Buat komentar | ✅ | ✅ | ✅ |
| Hapus komentar sendiri | ✅ | ✅ | ✅ |

---

## 🧪 Contoh Request

### Register
```http
POST /auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@gmail.com",
  "password": "secret123"
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@gmail.com",
  "password": "secret123"
}
```

### Buat Laporan (dengan gambar)
```http
POST /laporan
Authorization: Bearer <token>
Content-Type: multipart/form-data

category_id: 1
title: Jalan Berlubang di Jl. Merdeka
description: Terdapat lubang besar di tengah jalan...
image: [file gambar]
```

### Get Laporan dengan Filter
```http
GET /laporan?page=1&limit=5&status=pending&search=jalan
Authorization: Bearer <token>
```

### Update Status Laporan (admin)
```http
PUT /laporan/1
Authorization: Bearer <token_admin>
Content-Type: application/json

{
  "status": "approved"
}
```
