-- ============================================
-- SQL SCHEMA - Sistem Pelaporan Pengaduan Masyarakat
-- Database: MySQL
-- ============================================

CREATE DATABASE IF NOT EXISTS pengaduan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pengaduan_db;

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(100) NOT NULL UNIQUE,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('user', 'admin', 'super_admin') NOT NULL DEFAULT 'user',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL UNIQUE,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: laporan
-- ============================================
CREATE TABLE IF NOT EXISTS laporan (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  category_id   INT NOT NULL,
  title         VARCHAR(200) NOT NULL,
  description   TEXT NOT NULL,
  image         VARCHAR(255) DEFAULT NULL,
  status        ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_laporan_user     FOREIGN KEY (user_id)     REFERENCES users(id)      ON DELETE CASCADE,
  CONSTRAINT fk_laporan_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- TABLE: comments
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  laporan_id  INT NOT NULL,
  user_id     INT NOT NULL,
  comment     TEXT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_comment_laporan FOREIGN KEY (laporan_id) REFERENCES laporan(id) ON DELETE CASCADE,
  CONSTRAINT fk_comment_user    FOREIGN KEY (user_id)    REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================
-- INDEX untuk performa query
-- ============================================
CREATE INDEX idx_laporan_user_id     ON laporan(user_id);
CREATE INDEX idx_laporan_category_id ON laporan(category_id);
CREATE INDEX idx_laporan_status      ON laporan(status);
CREATE INDEX idx_laporan_title       ON laporan(title);
CREATE INDEX idx_comments_laporan_id ON comments(laporan_id);
CREATE INDEX idx_comments_user_id    ON comments(user_id);
