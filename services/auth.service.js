/**
 * Authentication & User Service
 * Handles registration, login, streak maintenance, and JWT tokens.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { evaluateStreak } = require('../core/rules/streak.rules');
const { deriveRankTitle } = require('../core/rules/economy.rules');
const { mutateCoins } = require('./economy.service');

const JWT_SECRET = process.env.JWT_SECRET || 'tower_of_knowledge_ultra_secure_jwt_secret_2026';

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      ma_nguoi_dung: user.ma_nguoi_dung,
      ten_dang_nhap: user.ten_dang_nhap,
      vai_tro: user.vai_tro
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Format user DTO for API responses
 */
async function formatUserResponse(user) {
  // Fetch active pet
  const activePet = await db.queryOne(`
    SELECT tc.ma_thu_cung, tc.ten_thu_cung, tc.mo_ta, tc.anh_dai_dien, tc.spritesheet_url, tc.he_so_sat_thuong
    FROM thu_cung_so_huu sh
    JOIN thu_cung tc ON sh.ma_thu_cung = tc.ma_thu_cung
    WHERE sh.ma_nguoi_dung = $1 AND sh.dang_kich_hoat = 1
  `, [user.ma_nguoi_dung]);

  return {
    ma_nguoi_dung: user.ma_nguoi_dung,
    ten_dang_nhap: user.ten_dang_nhap,
    email: user.email,
    ten_hien_thi: user.ten_hien_thi,
    khung_avatar: user.khung_avatar,
    vai_tro: user.vai_tro,
    tong_diem_kinh_nghiem: user.tong_diem_kinh_nghiem,
    danh_hieu: deriveRankTitle(user.tong_diem_kinh_nghiem),
    xu_tri_thuc: user.xu_tri_thuc,
    chuoi_streak_ngay: user.chuoi_streak_ngay,
    ngay_hoat_dong_cuoi: user.ngay_hoat_dong_cuoi,
    che_do_giao_dien: user.che_do_giao_dien,
    bat_am_thanh: Boolean(user.bat_am_thanh),
    thu_cung_dang_dung: activePet || null
  };
}

/**
 * Register a new user
 */
async function register({ ten_dang_nhap, email, mat_khau, ten_hien_thi }) {
  if (!ten_dang_nhap || !mat_khau) {
    throw new Error('Vui lòng điền đầy đủ tên đăng nhập hoặc email và mật khẩu.');
  }

  let finalUsername = String(ten_dang_nhap).trim();
  let finalEmail = (email || '').trim();

  // If user typed an email into username field
  if (finalUsername.includes('@')) {
    if (!finalEmail) finalEmail = finalUsername;
    finalUsername = finalUsername.split('@')[0];
  }

  if (!finalEmail) {
    finalEmail = `${finalUsername}@hocvien.tok.vn`;
  }

  // Check unique username & email
  const existing = await db.queryOne(
    'SELECT ma_nguoi_dung FROM nguoi_dung WHERE ten_dang_nhap = $1 OR email = $2',
    [finalUsername, finalEmail]
  );
  if (existing) {
    throw new Error('Tên đăng nhập hoặc email đã được sử dụng.');
  }

  const salt = bcrypt.genSaltSync(10);
  const mat_khau_hash = bcrypt.hashSync(mat_khau, salt);
  const ma_nguoi_dung = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const displayName = ten_hien_thi || finalUsername;

  // Insert user: 0 EXP, 0 coins, 0 streak
  await db.execute(`
    INSERT INTO nguoi_dung (
      ma_nguoi_dung, ten_dang_nhap, email, mat_khau_hash, ten_hien_thi,
      khung_avatar, vai_tro, tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay,
      ngay_hoat_dong_cuoi, che_do_giao_dien, bat_am_thanh
    ) VALUES ($1, $2, $3, $4, $5, 'khung_khoi_dau', 'NGUOI_HOC', 0, 0, 0, CAST(SYSDATETIME() AS DATE), 'TOI', 1)
  `, [ma_nguoi_dung, finalUsername, finalEmail, mat_khau_hash, displayName]);

  // Grant starting pet Sparky
  const ma_so_huu = `own_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO thu_cung_so_huu (ma_so_huu, ma_nguoi_dung, ma_thu_cung, dang_kich_hoat)
    VALUES ($1, $2, 'pet_sparky', 1)
  `, [ma_so_huu, ma_nguoi_dung]);

  const newUser = await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  const token = generateToken(newUser);
  const profile = await formatUserResponse(newUser);

  return { token, nguoi_dung: profile };
}

/**
 * Login user and lazily evaluate streak
 */
async function login({ ten_dang_nhap, mat_khau }) {
  if (!ten_dang_nhap || !mat_khau) {
    throw new Error('Vui lòng nhập tên đăng nhập hoặc email và mật khẩu.');
  }

  const identifier = String(ten_dang_nhap).trim();
  const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE ten_dang_nhap = $1 OR email = $1', [identifier]);
  if (!user) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
  }

  const isMatch = bcrypt.compareSync(mat_khau, user.mat_khau_hash);
  if (!isMatch) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
  }

  // Lazy streak evaluation
  const now = new Date();
  const streakResult = evaluateStreak({
    lastActivityDate: user.ngay_hoat_dong_cuoi,
    currentStreak: user.chuoi_streak_ngay,
    currentDate: now
  });

  if (streakResult.shouldUpdateDate) {
    await db.execute(`
      UPDATE nguoi_dung 
      SET chuoi_streak_ngay = $1, ngay_hoat_dong_cuoi = CAST(SYSDATETIME() AS DATE), cap_nhat_luc = SYSDATETIME()
      WHERE ma_nguoi_dung = $2
    `, [streakResult.newStreak, user.ma_nguoi_dung]);

    user.chuoi_streak_ngay = streakResult.newStreak;
    user.ngay_hoat_dong_cuoi = streakResult.todayStr;

    // Daily streak reward
    if (streakResult.streakIncremented) {
      const rewardCoin = 5 * streakResult.newStreak;
      await mutateCoins(user.ma_nguoi_dung, rewardCoin, 'THUONG_STREAK', `Thưởng chuỗi học ${streakResult.newStreak} ngày liên tiếp`);
      user.xu_tri_thuc += rewardCoin;
    }
  }

  const token = generateToken(user);
  const profile = await formatUserResponse(user);

  return { token, nguoi_dung: profile, streak_info: streakResult };
}

/**
 * Get current profile by userId
 */
async function getCurrentUser(ma_nguoi_dung) {
  const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  if (!user) throw new Error('Không tìm thấy người dùng.');
  return await formatUserResponse(user);
}

/**
 * Update user settings
 */
async function updateSettings(ma_nguoi_dung, { che_do_giao_dien, bat_am_thanh, ten_hien_thi }) {
  const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  if (!user) throw new Error('Người dùng không tồn tại.');

  const newTheme = che_do_giao_dien || user.che_do_giao_dien;
  const newSound = bat_am_thanh !== undefined ? (bat_am_thanh ? 1 : 0) : user.bat_am_thanh;
  const newName = ten_hien_thi || user.ten_hien_thi;

  await db.execute(`
    UPDATE nguoi_dung 
    SET che_do_giao_dien = $1, bat_am_thanh = $2, ten_hien_thi = $3, cap_nhat_luc = SYSDATETIME()
    WHERE ma_nguoi_dung = $4
  `, [newTheme, newSound, newName, ma_nguoi_dung]);

  return await getCurrentUser(ma_nguoi_dung);
}

module.exports = {
  register,
  login,
  getCurrentUser,
  updateSettings,
  generateToken,
  formatUserResponse
};
