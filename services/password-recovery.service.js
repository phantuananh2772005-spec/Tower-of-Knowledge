const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const db = require('../database/db');
const mail = require('./recovery-mail.service');
const jwt = require('jsonwebtoken');
function recoverySecret(){const value=process.env.PASSWORD_RECOVERY_SECRET||process.env.JWT_SECRET;if(!value)throw new Error('Chưa cấu hình bảo mật khôi phục mật khẩu.');return value;}
function maskEmail(email){const [name,domain]=email.split('@');return (name.length>2?name.slice(0,2):'')+'***'+(name.length>4?name.slice(-1):'')+'@'+domain;}
async function lookup({username}){
  const name=typeof username==='string'?username.trim().toLowerCase():'';
  if(!name||name.length>100)throw new Error('Nhập tên đăng nhập của tài khoản cần tìm.');
  const user=await db.queryOne('SELECT ma_nguoi_dung,google_sub,google_email,session_version FROM nguoi_dung WHERE LOWER(ten_dang_nhap)=$1',[name]);
  if(!user?.google_sub||!user.google_email)throw new Error('Tài khoản không tồn tại hoặc chưa liên kết Google.');
  return {maskedEmail:maskEmail(user.google_email),lookupToken:jwt.sign({purpose:'recovery-lookup',userId:user.ma_nguoi_dung,version:Number(user.session_version||0)},recoverySecret(),{expiresIn:'10m'})};
}
function readLookup(token){try{const data=jwt.verify(token,recoverySecret());if(data.purpose!=='recovery-lookup')throw Error();return data;}catch{throw new Error('Phiên tìm tài khoản đã hết hạn. Hãy tìm lại tài khoản.');}}
const generic = { message: 'Nếu Gmail này đã liên kết với tài khoản đã đăng ký, mã khôi phục sẽ được gửi. Kiểm tra cả thư rác. Mã có hiệu lực 10 phút.' };
const invalid = 'Mã không đúng, đã hết hạn hoặc đã được sử dụng. Hãy yêu cầu mã mới.';
function normalize(value) { return typeof value === 'string' ? value.trim().toLowerCase() : ''; }
function createRecoveryService({ database = db, transport = mail, now = Date.now } = {}) {
  function digest(id, code) {
    const secret = process.env.PASSWORD_RECOVERY_SECRET || process.env.JWT_SECRET;
    if (!secret) throw new Error('Chưa cấu hình bảo mật khôi phục mật khẩu.');
    return crypto.createHmac('sha256', secret).update(`${id}:${code}`).digest('hex');
  }
  async function request({ email }) {
    email = normalize(email);
    if (!email || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Nhập email Google đã liên kết với tài khoản.');
    if (!database.isPostgres || !transport.configured()) throw new Error('Gửi mã email chưa được cấu hình. Bạn có thể đăng nhập bằng Google đã liên kết để vào tài khoản.');
    // Only the Google-verified address is trusted; a registration email alone is insufficient.
    const users = await database.query('SELECT ma_nguoi_dung FROM nguoi_dung WHERE LOWER(google_email) = $1 AND google_sub IS NOT NULL', [email]);
    if (users.length !== 1) return generic;
    const id = users[0].ma_nguoi_dung;
    await database.transaction(async tx => {
      const user = await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1 FOR UPDATE', [id]);
      if (!user.google_sub || normalize(user.google_email) !== email) return;
      const old = await tx.queryOne('SELECT * FROM password_recovery WHERE user_id = $1', [id]);
      if (old && now() - Number(old.sent_at) < 60000) return;
      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      const hash = digest(id, code);
      await tx.execute('DELETE FROM password_recovery WHERE user_id = $1', [id]);
      await tx.execute('INSERT INTO password_recovery(user_id,email,google_sub,code_hash,expires_at,sent_at,attempts) VALUES($1,$2,$3,$4,$5,$6,0)', [id,email,user.google_sub,hash,now()+600000,now()]);
      // Failure rolls back the replacement, keeping an earlier valid code usable.
      await transport.sendCode(email, code);
    });
    return generic;
  }
  async function googleProof(identity,target=null) {
    if (!database.isPostgres) throw new Error('Khôi phục mật khẩu cần cơ sở dữ liệu PostgreSQL.');
    const token=crypto.randomBytes(32).toString('base64url');
    await database.transaction(async tx=>{
      const user=await tx.queryOne('SELECT * FROM nguoi_dung WHERE google_sub = $1 FOR UPDATE',[identity.sub]);
      if(!user || normalize(user.google_email)!==normalize(identity.email)) throw new Error('Google này chưa liên kết với tài khoản đã đăng ký. Không tạo tài khoản mới trong luồng khôi phục.');
      if(target&&(user.ma_nguoi_dung!==target.userId||Number(user.session_version||0)!==target.version))throw new Error('Bạn đã chọn Google khác với tài khoản cần khôi phục. Hãy chọn đúng email được gợi ý.');
      await tx.execute('DELETE FROM password_recovery WHERE user_id = $1',[user.ma_nguoi_dung]);
      await tx.execute('INSERT INTO password_recovery(user_id,email,google_sub,code_hash,expires_at,sent_at,attempts) VALUES($1,$2,$3,$4,$5,$6,0)',[user.ma_nguoi_dung,normalize(identity.email),identity.sub,digest(user.ma_nguoi_dung,token),now()+600000,now()]);
    });
    return {recoveryToken:token,email:normalize(identity.email)};
  }
  async function reset({ email, code, recovery_token, password }) {
    email = normalize(email);
    if (!database.isPostgres) throw new Error('Khôi phục mật khẩu cần cơ sở dữ liệu PostgreSQL.');
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password,'utf8') > 72) throw new Error('Mật khẩu cần ít nhất 8 ký tự và tối đa 72 byte.');
    const proof=typeof recovery_token==='string'&&/^[A-Za-z0-9_-]{43}$/.test(recovery_token)?recovery_token:code;
    if (!email || email.length > 255 || typeof proof !== 'string' || !/^(?:\d{6}|[A-Za-z0-9_-]{43})$/.test(proof)) throw new Error(invalid);
    const users = await database.query('SELECT ma_nguoi_dung FROM nguoi_dung WHERE LOWER(google_email) = $1 AND google_sub IS NOT NULL', [email]);
    if (users.length !== 1) throw new Error(invalid);
    const id = users[0].ma_nguoi_dung;
    const hash = await bcrypt.hash(password, 10);
    const ok = await database.transaction(async tx => {
      const user = await tx.queryOne('SELECT * FROM nguoi_dung WHERE ma_nguoi_dung = $1 FOR UPDATE', [id]);
      const item = await tx.queryOne('SELECT * FROM password_recovery WHERE user_id = $1', [id]);
      if (!item || !user.google_sub || user.google_sub !== item.google_sub || normalize(user.google_email) !== email || item.email !== email || Number(item.expires_at) <= now() || item.attempts >= 5) return false;
      const matches = crypto.timingSafeEqual(Buffer.from(item.code_hash,'hex'),Buffer.from(digest(id,proof),'hex'));
      if (!matches) {
        await tx.execute('UPDATE password_recovery SET attempts = attempts + 1 WHERE user_id = $1', [id]);
        return false; // Commit the failed attempt; throwing inside the transaction would undo it.
      }
      await tx.execute('UPDATE nguoi_dung SET mat_khau_hash = $1, co_mat_khau = $2, session_version = session_version + 1, cap_nhat_luc = SYSDATETIME() WHERE ma_nguoi_dung = $3', [hash,true,id]);
      await tx.execute('DELETE FROM password_recovery WHERE user_id = $1', [id]);
      return true;
    });
    if (!ok) throw new Error(invalid);
    return { message: 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.' };
  }
  return { request, reset, googleProof };
}
module.exports = { ...createRecoveryService(), createRecoveryService, lookup, readLookup, maskEmail };
