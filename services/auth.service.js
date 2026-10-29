/**
 * Authentication & User Service
 * Handles registration, login, streak maintenance, and JWT tokens.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const { evaluateStreak, toVietnamDateString } = require('../core/rules/streak.rules');
const { deriveRankTitle, deriveUserLevel, levelProgress } = require('../core/rules/economy.rules');
const { mutateCoinsInTransaction, withUserLock } = require('./economy.service');

const JWT_SECRET = process.env.JWT_SECRET || 'tower_of_knowledge_ultra_secure_jwt_secret_2026';
function parsePreference(value) {
  try { return typeof value === 'string' ? JSON.parse(value) : value || null; } catch { return null; }
}

/**
 * Generate JWT token
 */
function generateToken(user) {
  return jwt.sign(
    {
      ma_nguoi_dung: user.ma_nguoi_dung,
      ten_dang_nhap: user.ten_dang_nhap,
      vai_tro: user.vai_tro,
      session_version: Number(user.session_version || 0)
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
    WHERE sh.ma_nguoi_dung = $1 AND sh.dang_kich_hoat = $2
  `, [user.ma_nguoi_dung, true]);

  return {
    ma_nguoi_dung: user.ma_nguoi_dung,
    ten_dang_nhap: user.ten_dang_nhap,
    email: user.email,
    ten_hien_thi: user.ten_hien_thi,
    khung_avatar: user.khung_avatar,
    google_lien_ket: Boolean(user.google_sub),
    google_email: user.google_sub ? user.google_email : null,
    co_mat_khau: user.co_mat_khau !== false && user.co_mat_khau !== 0,
    phu_kien_dang_dung: require('./inventory.service').itemFor(user.phu_kien_dang_dung),
    vai_tro: user.vai_tro,
    tong_diem_kinh_nghiem: user.tong_diem_kinh_nghiem,
    danh_hieu: deriveRankTitle(user.tong_diem_kinh_nghiem),
    cap_do: deriveUserLevel(user.tong_diem_kinh_nghiem),
    tien_do_cap_do: levelProgress(user.tong_diem_kinh_nghiem),
    xu_tri_thuc: user.xu_tri_thuc,
    chuoi_streak_ngay: user.chuoi_streak_ngay,
    chuoi_thang_arena: typeof user.chuoi_thang_arena === 'number' ? user.chuoi_thang_arena : 0,
    chuoi_thang_cao_nhat_arena: typeof user.chuoi_thang_cao_nhat_arena === 'number' ? user.chuoi_thang_cao_nhat_arena : 0,
    ngay_hoat_dong_cuoi: user.ngay_hoat_dong_cuoi,
    che_do_giao_dien: user.che_do_giao_dien,
    bat_am_thanh: Boolean(user.bat_am_thanh),
    cai_dat_am_thanh: parsePreference(user.cai_dat_am_thanh),
    tien_do_huong_dan: parsePreference(user.tien_do_huong_dan),
    thu_cung_dang_dung: require('./pet.service').formatPet(activePet)
  };
}

/**
 * Register a new user
 */
async function register({ ten_dang_nhap, email, mat_khau, ten_hien_thi }) {
  if (!ten_dang_nhap || !mat_khau) {
    throw new Error('Vui lòng điền đầy đủ tên đăng nhập hoặc email và mật khẩu.');
  }

  let finalUsername = String(ten_dang_nhap).trim().toLowerCase();
  let finalEmail = (email || '').trim().toLowerCase();

  // If user typed an email into username field
  if (finalUsername.includes('@')) {
    if (!finalEmail) finalEmail = finalUsername;
    finalUsername = finalUsername.split('@')[0];
  }

  if (!finalEmail) {
    finalEmail = `${finalUsername}@hocvien.tok.vn`;
  }

  // Check unique username & email (case-insensitive)
  const existing = await db.queryOne(
    'SELECT ma_nguoi_dung FROM nguoi_dung WHERE LOWER(ten_dang_nhap) = LOWER($1) OR LOWER(email) = LOWER($2)',
    [finalUsername, finalEmail]
  );
  if (existing) {
    throw new Error('Tên đăng nhập hoặc email đã được sử dụng.');
  }

  const salt = bcrypt.genSaltSync(10);
  const mat_khau_hash = bcrypt.hashSync(mat_khau, salt);
  const ma_nguoi_dung = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const displayName = ten_hien_thi ? String(ten_hien_thi).trim() : String(ten_dang_nhap).trim();

  // Insert user: 0 EXP, 0 coins, 0 streak, NULL last active date until first login/activity
  await db.execute(`
    INSERT INTO nguoi_dung (
      ma_nguoi_dung, ten_dang_nhap, email, mat_khau_hash, ten_hien_thi,
      khung_avatar, vai_tro, tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay,
      ngay_hoat_dong_cuoi, che_do_giao_dien, bat_am_thanh
    ) VALUES ($1, $2, $3, $4, $5, 'khung_khoi_dau', 'NGUOI_HOC', 0, 0, 0, NULL, 'TOI', $6)
  `, [ma_nguoi_dung, finalUsername, finalEmail, mat_khau_hash, displayName, true]);

  // Grant starting pet Sparky
  const ma_so_huu = `own_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  await db.execute(`
    INSERT INTO thu_cung_so_huu (ma_so_huu, ma_nguoi_dung, ma_thu_cung, dang_kich_hoat)
    VALUES ($1, $2, 'pet_sparky', $3)
  `, [ma_so_huu, ma_nguoi_dung, true]);

  const newUser = await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  const token = generateToken(newUser);
  const profile = await formatUserResponse(newUser);

  return { token, nguoi_dung: profile };
}

/**
 * Login user and lazily evaluate streak
 */
async function login({ ten_dang_nhap, mat_khau, currentDate }) {
  if (!ten_dang_nhap || !mat_khau) {
    throw new Error('Vui lòng nhập tên đăng nhập hoặc email và mật khẩu.');
  }

  const identifier = String(ten_dang_nhap).trim().toLowerCase();
  const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE LOWER(ten_dang_nhap) = LOWER($1) OR LOWER(email) = LOWER($1) ORDER BY tong_diem_kinh_nghiem DESC, tao_luc ASC', [identifier]);
  if (!user) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
  }

  const isMatch = user.co_mat_khau !== false && user.co_mat_khau !== 0 && bcrypt.compareSync(mat_khau, user.mat_khau_hash);
  if (!isMatch) {
    throw new Error('Tài khoản hoặc mật khẩu không chính xác.');
  }

  return issueSession(user,currentDate);
}
async function issueSession(user,currentDate) {
  const result = await withUserLock(user.ma_nguoi_dung, () => db.transaction(async tx => {
    const freshUser = await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1' + (db.isPostgres ? ' FOR UPDATE' : ''),[user.ma_nguoi_dung]);
    if(!freshUser)throw new Error('Tài khoản không còn tồn tại.');
    const today = toVietnamDateString(currentDate ? new Date(currentDate) : new Date());
    const streak = evaluateStreak(freshUser.ngay_hoat_dong_cuoi,today,freshUser.chuoi_streak_ngay);
    if(streak.shouldUpdateDate){
      await tx.execute('UPDATE nguoi_dung SET chuoi_streak_ngay = $1, ngay_hoat_dong_cuoi = $2, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $3',[streak.newStreak,streak.todayStr,freshUser.ma_nguoi_dung]);
      freshUser.chuoi_streak_ngay=streak.newStreak;freshUser.ngay_hoat_dong_cuoi=streak.todayStr;
      if(streak.streakIncremented){
        const reward=await mutateCoinsInTransaction(tx,freshUser.ma_nguoi_dung,5*streak.newStreak,'THUONG_STREAK','Thưởng chuỗi học '+streak.newStreak+' ngày liên tiếp');
        freshUser.xu_tri_thuc=reward.newBalance;
      }
    }
    return {user:freshUser,streak};
  }));
  return {token:generateToken(result.user),nguoi_dung:await formatUserResponse(result.user),streak_info:result.streak};
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
async function updateSettings(ma_nguoi_dung, { che_do_giao_dien, bat_am_thanh, ten_hien_thi, cai_dat_am_thanh, tien_do_huong_dan }) {
  return withUserLock(ma_nguoi_dung, async () => {
  const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1', [ma_nguoi_dung]);
  if (!user) throw new Error('Người dùng không tồn tại.');

  const newTheme = che_do_giao_dien || user.che_do_giao_dien;
  if (!['TOI', 'SANG'].includes(newTheme)) throw new Error('Chế độ giao diện không hợp lệ.');
  const newSound = bat_am_thanh !== undefined ? Boolean(bat_am_thanh) : Boolean(user.bat_am_thanh);
  const newName = ten_hien_thi || user.ten_hien_thi;
  if (cai_dat_am_thanh !== undefined) {
    if (!cai_dat_am_thanh || typeof cai_dat_am_thanh !== 'object') throw new Error('Cài đặt âm thanh không hợp lệ.');
    const audio = {};
    for (const key of ['quiz','reward','battle','outcome','bgm']) if (typeof cai_dat_am_thanh[key] === 'boolean') audio[key] = cai_dat_am_thanh[key];
    await db.execute('UPDATE nguoi_dung SET cai_dat_am_thanh = $1 WHERE ma_nguoi_dung = $2', [JSON.stringify(audio), ma_nguoi_dung]);
  }
  if (tien_do_huong_dan !== undefined) {
    const tour = tien_do_huong_dan;
    if (!tour || typeof tour.step !== 'string' || tour.step.length > 100 || !['desktop','mobile'].includes(tour.layout)) throw new Error('Tiến độ hướng dẫn không hợp lệ.');
    if (tour.context && (typeof tour.context !== 'object' || Array.isArray(tour.context) || JSON.stringify(tour.context).length > 65536)) throw new Error('Tiến độ hướng dẫn quá lớn hoặc không hợp lệ.');
    await db.execute('UPDATE nguoi_dung SET tien_do_huong_dan = $1 WHERE ma_nguoi_dung = $2',
      [JSON.stringify({ version: 2, step: tour.step, layout: tour.layout, completed: Boolean(tour.completed),
        context: tour.context || null }), ma_nguoi_dung]);
  }

  await db.execute(`
    UPDATE nguoi_dung 
    SET che_do_giao_dien = $1, bat_am_thanh = $2, ten_hien_thi = $3, cap_nhat_luc = SYSDATETIME()
    WHERE ma_nguoi_dung = $4
  `, [newTheme, newSound, newName, ma_nguoi_dung]);

  return await getCurrentUser(ma_nguoi_dung);
  });
}

async function updateAccount(userId, {ten_hien_thi, ten_dang_nhap}) {
  return withUserLock(userId, async () => {
    const user = await db.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1',[userId]);
    if (!user) throw new Error('Người dùng không tồn tại.');
    const name = ten_hien_thi === undefined ? user.ten_hien_thi : String(ten_hien_thi).trim();
    const username = ten_dang_nhap === undefined ? user.ten_dang_nhap : String(ten_dang_nhap).trim().toLowerCase();
    if (!name || name.length > 100) throw new Error('Tên hiển thị cần có từ 1 đến 100 ký tự.');
    if (!/^[a-z0-9_.-]{3,50}$/.test(username)) throw new Error('Tên đăng nhập gồm 3–50 chữ thường, số, dấu chấm, gạch dưới hoặc gạch ngang.');
    const duplicate = await db.queryOne('SELECT ma_nguoi_dung FROM nguoi_dung WHERE LOWER(ten_dang_nhap) = $1 AND ma_nguoi_dung <> $2',[username,userId]);
    if (duplicate) throw new Error('Tên đăng nhập đã được sử dụng.');
    await db.execute('UPDATE nguoi_dung SET ten_hien_thi = $1, ten_dang_nhap = $2, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $3',[name,username,userId]);
    const updated = {...user,ten_hien_thi:name,ten_dang_nhap:username};
    return {nguoi_dung:await formatUserResponse(updated),token:generateToken(updated)};
  });
}
async function changePassword(userId,{mat_khau_hien_tai,mat_khau_moi},sessionIssuedAt) {
  return withUserLock(userId,()=>db.transaction(async tx=>{
    const user = await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1'+(db.isPostgres?' FOR UPDATE':''),[userId]);
    if (!user) throw new Error('Người dùng không tồn tại.');
    const hasPassword = user.co_mat_khau !== false && user.co_mat_khau !== 0;
    if (hasPassword && !await bcrypt.compare(String(mat_khau_hien_tai||''),user.mat_khau_hash)) throw new Error('Mật khẩu hiện tại không chính xác.');
    if (!hasPassword && (!user.google_sub || !Number.isFinite(sessionIssuedAt) || Date.now()/1000-sessionIssuedAt>600)) throw new Error('Hãy đăng nhập lại bằng Google trước khi tạo mật khẩu.');
    if (typeof mat_khau_moi !== 'string' || mat_khau_moi.length < 8 || Buffer.byteLength(mat_khau_moi,'utf8') > 72) throw new Error('Mật khẩu mới cần ít nhất 8 ký tự và tối đa 72 byte.');
    const hash = await bcrypt.hash(mat_khau_moi,10);
    await tx.execute('UPDATE nguoi_dung SET mat_khau_hash = $1, co_mat_khau = $2, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $3',[hash,true,userId]);
    if(db.isPostgres)await tx.execute('DELETE FROM password_recovery WHERE user_id = $1',[userId]);
    return {updated:true};
  }));
}

module.exports = {
  issueSession,
  updateAccount,
  changePassword,
  register,
  login,
  getCurrentUser,
  updateSettings,
  generateToken,
  formatUserResponse
};
