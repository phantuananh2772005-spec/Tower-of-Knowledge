const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const db = require('../database/db');
const mail = require('./recovery-mail.service');
const { validatePassword, hashPassword, verifyPassword } = require('./password-policy');

const ttlMs = 10 * 60 * 1000;
const cooldownMs = 60 * 1000;
const maxAttempts = 5;
const generic = {
  message: 'Nếu Gmail này đã liên kết với tài khoản đã đăng ký, mã khôi phục sẽ được gửi. Kiểm tra cả thư rác. Mã có hiệu lực 10 phút.'
};
const invalid = 'Mã không đúng, đã hết hạn hoặc đã được sử dụng. Hãy yêu cầu mã mới.';
const unavailable = 'Tài khoản không tồn tại hoặc chưa liên kết Google.';
const proofNotLinked = 'Tài khoản Google này chưa được liên kết. Vui lòng chọn lại.';

function recoverySecret() {
  const secret = process.env.PASSWORD_RECOVERY_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('Chưa cấu hình bảo mật khôi phục mật khẩu.');
  return secret;
}

function normalize(value) {
  return typeof value === 'string' ? value.trim().toLowerCase() : '';
}

function isEmail(value) {
  return value.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function maskEmail(email) {
  const [name, domain] = email.split('@');
  return (name.length > 2 ? name.slice(0, 2) : '') + '***' + (name.length > 4 ? name.slice(-1) : '') + '@' + domain;
}

function signBinding(purpose, user, proof = null) {
  return crypto.createHmac('sha256', recoverySecret())
    .update(JSON.stringify([purpose, user.id, user.google_sub, user.google_verified_email, proof]))
    .digest('hex');
}

function sameDigest(left, right) {
  return typeof left === 'string' && /^[0-9a-f]{64}$/.test(left) &&
    crypto.timingSafeEqual(Buffer.from(left, 'hex'), Buffer.from(right, 'hex'));
}

function readLookup(token) {
  try {
    const data = jwt.verify(token, recoverySecret(), { algorithms: ['HS256'] });
    if (data.purpose !== 'recovery-lookup' || typeof data.userId !== 'string' ||
        !Number.isInteger(data.version) || data.version < 0 ||
        typeof data.binding !== 'string' || !/^[0-9a-f]{64}$/.test(data.binding)) {
      throw new Error('Invalid account lookup proof');
    }
    return data;
  } catch {
    throw new Error('Phiên tìm tài khoản đã hết hạn. Hãy tìm lại tài khoản.');
  }
}

function isEligible(user) {
  return Boolean(user && user.disabled_at == null && user.role !== 'SYSTEM' &&
    user.google_sub && isEmail(normalize(user.google_verified_email)));
}

function createRecoveryService({ database = db, transport = mail, now } = {}) {
  async function getTime(tx) {
    if (now) return new Date(now()).getTime();
    const row = await tx.queryOne('SELECT clock_timestamp() AS instant');
    return new Date(row.instant).getTime();
  }

  async function findVerifiedEmail(connection, email, lock = false) {
    const candidates = await connection.query(
      'SELECT * FROM users WHERE google_verified_email = $1 AND google_sub IS NOT NULL '
        + 'ORDER BY id LIMIT 2' + (lock ? ' FOR UPDATE' : ''),
      [email]
    );
    return candidates.length === 1 && isEligible(candidates[0]) ? candidates[0] : null;
  }

  async function lookup({ username } = {}) {
    const name = normalize(username);
    if (!name || name.length > 100) throw new Error('Nhập tên đăng nhập của tài khoản cần tìm.');
    const user = await database.queryOne(
      'SELECT id, role, disabled_at, google_sub, google_verified_email, session_version FROM users WHERE username = $1',
      [name]
    );
    if (!isEligible(user)) throw new Error(unavailable);
    const unique = await findVerifiedEmail(database, user.google_verified_email);
    if (unique?.id !== user.id) throw new Error(unavailable);
    const lookupToken = jwt.sign({
      purpose: 'recovery-lookup',
      userId: user.id,
      version: user.session_version,
      binding: signBinding('recovery-lookup', user)
    }, recoverySecret(), { algorithm: 'HS256', expiresIn: '10m' });
    return { maskedEmail: maskEmail(user.google_verified_email), lookupToken };
  }

  async function replaceChallenge(tx, user, proof, issuedAt) {
    await tx.execute(
      'INSERT INTO password_resets (user_id, google_sub, code_hash, expires_at, attempts) '
        + 'VALUES ($1, $2, $3, $4, 0) ON CONFLICT (user_id) DO UPDATE '
        + 'SET google_sub = EXCLUDED.google_sub, code_hash = EXCLUDED.code_hash, '
        + 'expires_at = EXCLUDED.expires_at, attempts = EXCLUDED.attempts',
      [user.id, user.google_sub, signBinding('password-reset', user, proof), new Date(issuedAt + ttlMs)]
    );
  }

  async function request({ email } = {}) {
    email = normalize(email);
    if (!isEmail(email)) throw new Error('Nhập email Google đã liên kết với tài khoản.');
    if (!transport.configured()) {
      throw new Error('Gửi mã email chưa được cấu hình. Bạn có thể đăng nhập bằng Google đã liên kết để vào tài khoản.');
    }
    await database.transaction(async tx => {
      const user = await findVerifiedEmail(tx, email, true);
      if (!user) return;
      const challenge = await tx.queryOne('SELECT expires_at FROM password_resets WHERE user_id = $1', [user.id]);
      const instant = await getTime(tx);
      if (challenge && instant - (new Date(challenge.expires_at).getTime() - ttlMs) < cooldownMs) return;

      const code = String(crypto.randomInt(0, 1000000)).padStart(6, '0');
      await replaceChallenge(tx, user, code, instant);
      // Delivery failure rolls back the replacement, keeping an earlier valid code usable.
      await transport.sendCode(email, code);
    });
    return generic;
  }

  async function googleProof(identity, target = null) {
    const email = normalize(identity?.email);
    if (typeof identity?.sub !== 'string' || !identity.sub || !isEmail(email)) throw new Error(proofNotLinked);
    const token = crypto.randomBytes(32).toString('base64url');
    await database.transaction(async tx => {
      const user = await findVerifiedEmail(tx, email, true);
      if (!user || user.google_sub !== identity.sub) throw new Error(proofNotLinked);
      if (target && (user.id !== target.userId || user.session_version !== target.version ||
          !sameDigest(target.binding, signBinding('recovery-lookup', user)))) {
        throw new Error('Tài khoản Google không khớp. Vui lòng chọn đúng email được gợi ý.');
      }
      await replaceChallenge(tx, user, token, await getTime(tx));
    });
    return { recoveryToken: token, email };
  }

  async function reset({ email, code, recovery_token: recoveryToken, password } = {}) {
    email = normalize(email);
    const proof = typeof recoveryToken === 'string' && /^[A-Za-z0-9_-]{43}$/.test(recoveryToken)
      ? recoveryToken
      : code;
    if (!isEmail(email) || typeof proof !== 'string' || !/^(?:\d{6}|[A-Za-z0-9_-]{43})$/.test(proof)) {
      throw new Error(invalid);
    }
    validatePassword(password, [email]);

    const updated = await database.transaction(async tx => {
      const user = await findVerifiedEmail(tx, email, true);
      if (!user) return false;
      const challenge = await tx.queryOne('SELECT * FROM password_resets WHERE user_id = $1', [user.id]);
      const instant = await getTime(tx);
      if (!challenge || challenge.google_sub !== user.google_sub ||
          !(new Date(challenge.expires_at).getTime() > instant) || challenge.attempts >= maxAttempts) {
        return false;
      }
      if (!sameDigest(challenge.code_hash, signBinding('password-reset', user, proof))) {
        await tx.execute('UPDATE password_resets SET attempts = attempts + 1 WHERE user_id = $1', [user.id]);
        return false;
      }

      validatePassword(password, [user.username, user.email, email]);
      if (user.password_hash && await verifyPassword(password, user.password_hash)) {
        throw new Error('Hãy chọn mật khẩu khác mật khẩu hiện tại.');
      }
      await tx.execute(
        'UPDATE users SET password_hash = $1, session_version = session_version + 1 WHERE id = $2',
        [await hashPassword(password), user.id]
      );
      await tx.execute('DELETE FROM password_resets WHERE user_id = $1', [user.id]);
      return true;
    });
    if (!updated) throw new Error(invalid);
    return { message: 'Đã đặt lại mật khẩu. Hãy đăng nhập bằng mật khẩu mới.' };
  }

  return { lookup, request, reset, googleProof };
}

module.exports = { ...createRecoveryService(), createRecoveryService, readLookup, maskEmail };
