const User = require('./User');
const Category = require('./Category');
const Laporan = require('./Laporan');
const Comment = require('./Comment');

// ========================
// DEFINISI RELASI / ASOSIASI
// ========================

// User → Laporan (One to Many)
User.hasMany(Laporan, { foreignKey: 'user_id', as: 'laporan' });
Laporan.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Category → Laporan (One to Many)
Category.hasMany(Laporan, { foreignKey: 'category_id', as: 'laporan' });
Laporan.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// Laporan → Comment (One to Many)
Laporan.hasMany(Comment, { foreignKey: 'laporan_id', as: 'comments' });
Comment.belongsTo(Laporan, { foreignKey: 'laporan_id', as: 'laporan' });

// User → Comment (One to Many)
User.hasMany(Comment, { foreignKey: 'user_id', as: 'comments' });
Comment.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

module.exports = { User, Category, Laporan, Comment };
