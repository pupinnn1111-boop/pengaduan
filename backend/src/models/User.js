const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: {
        msg: 'Username sudah digunakan',
      },
      validate: {
        notEmpty: { msg: 'Username tidak boleh kosong' },
        len: { args: [3, 100], msg: 'Username minimal 3 karakter' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: {
        msg: 'Email sudah terdaftar',
      },
      validate: {
        isEmail: { msg: 'Format email tidak valid' },
        notEmpty: { msg: 'Email tidak boleh kosong' },
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: { msg: 'Password tidak boleh kosong' },
        len: { args: [6], msg: 'Password minimal 6 karakter' },
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'admin', 'super_admin'),
      defaultValue: 'user',
      allowNull: false,
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          user.password = await bcrypt.hash(user.password, 10);
        }
      },
    },
  }
);

// Method untuk cek password
User.prototype.checkPassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Method untuk hide password di response
User.prototype.toJSON = function () {
  const values = Object.assign({}, this.get());
  delete values.password;
  return values;
};

module.exports = User;
