const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const db = require('../database/db');

const client = new OAuth2Client();
const clientId = () => String(process.env.GOOGLE_CLIENT_ID || '').trim();
const googleSession = { auth_method: 'GOOGLE' };
const emailCollisionMessage = 'Email này đã có tài khoản. Hãy đăng nhập bằng mật khẩu, rồi liên kết Google trong Cài đặt.';
const identityCollisionMessage = 'Tài khoản Google này đã liên kết với một người dùng khác.';

function challengeSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Đăng nhập Google chưa được cấu hình.');
  return secret;
}

function assertAccountAvailable(user) {
  if (!user || user.disabled_at != null || user.role === 'SYSTEM') {
    throw new Error('Tài khoản không khả dụng.');
  }
}

async function lockGoogleIdentity(tx, sub) {
  await tx.queryOne('SELECT pg_advisory_xact_lock(hashtext($1), hashtext($2))', ['google-identity', sub]);
}

// The official verifier checks the Google signature, audience, issuer and expiry.
function createGoogleIdentity({
  verifyIdToken = async (credential, audience) => (await client.verifyIdToken({ idToken: credential, audience })).getPayload(),
  database = db,
  authService,
  recoveryService
} = {}) {
  const auth = () => authService || require('./auth.service');
  const recovery = () => recoveryService || require('./password-recovery.service');

  function challenge(mode = 'login', userId = null) {
    const audience = clientId();
    if (!audience) throw new Error('Đăng nhập Google chưa được cấu hình trên hệ thống. Hãy dùng tên đăng nhập và mật khẩu.');
    if (!['login', 'link', 'recover'].includes(mode) || (mode === 'link' && !userId)) {
      throw new Error('Yêu cầu đăng nhập trước khi liên kết Google.');
    }
    const nonce = crypto.randomBytes(24).toString('base64url');
    const csrf = crypto.randomBytes(24).toString('base64url');
    const cookie = jwt.sign(
      { purpose: 'google-challenge', mode, userId, nonce, csrf },
      challengeSecret(),
      { algorithm: 'HS256', expiresIn: '10m' }
    );
    return { clientId: audience, nonce, csrf, cookie };
  }

  async function verify(body, cookie, mode, userId = null) {
    const audience = clientId();
    if (!audience) throw new Error('Đăng nhập Google chưa được cấu hình.');
    let challengeData;
    try {
      challengeData = jwt.verify(cookie || '', challengeSecret(), { algorithms: ['HS256'] });
    } catch {
      throw new Error('Phiên xác thực Google đã hết hạn. Hãy mở lại nút Google.');
    }
    if (challengeData.purpose !== 'google-challenge' || challengeData.mode !== mode ||
        challengeData.userId !== userId || typeof body?.csrf !== 'string' || body.csrf !== challengeData.csrf) {
      throw new Error('Phiên xác thực Google không khớp. Hãy thử lại.');
    }
    if (typeof body.credential !== 'string' || !body.credential || body.credential.length > 10000) {
      throw new Error('Thông tin xác thực Google không hợp lệ.');
    }

    let payload;
    try {
      payload = await verifyIdToken(body.credential, audience);
    } catch {
      throw new Error('Không xác minh được tài khoản Google. Hãy thử đăng nhập lại.');
    }
    const email = typeof payload?.email === 'string' ? payload.email.trim().toLowerCase() : '';
    if (payload?.nonce !== challengeData.nonce || typeof payload.sub !== 'string' ||
        !payload.sub.trim() || payload.sub.length > 255 || payload.email_verified !== true ||
        email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error('Tài khoản Google chưa được xác minh hoặc phiên đăng nhập không khớp.');
    }
    return { sub: payload.sub, email, name: (String(payload.name || '').trim() || email).slice(0, 100) };
  }

  async function signIn(body, cookie) {
    const identity = await verify(body, cookie, 'login');
    let result;
    try {
      result = await database.transaction(async tx => {
        await lockGoogleIdentity(tx, identity.sub);
        const user = await tx.queryOne('SELECT * FROM users WHERE google_sub = $1 FOR UPDATE', [identity.sub]);
        if (user) {
          assertAccountAvailable(user);
          return { user, created: false };
        }

        // An account email collision requires explicit password login and linking.
        if (await tx.queryOne('SELECT id FROM users WHERE email = $1', [identity.email])) {
          throw new Error(emailCollisionMessage);
        }
        const created = await auth().createAccount(tx, {
          username: 'gg_' + crypto.randomBytes(10).toString('hex'),
          email: identity.email,
          display_name: identity.name,
          password_hash: null,
          google_sub: identity.sub,
          google_verified_email: identity.email
        });
        return { user: created, created: true };
      });
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'users_email_key') {
        throw new Error(emailCollisionMessage);
      }
      throw error;
    }

    if (!result.created) return auth().issueSession(result.user, googleSession);
    return {
      token: auth().generateToken(result.user, googleSession),
      user: await auth().formatUserResponse(result.user)
    };
  }

  async function link(userId, body, cookie) {
    const identity = await verify(body, cookie, 'link', userId);
    try {
      await database.transaction(async tx => {
        await lockGoogleIdentity(tx, identity.sub);
        const user = await tx.queryOne('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
        assertAccountAvailable(user);
        const owner = await tx.queryOne('SELECT id FROM users WHERE google_sub = $1', [identity.sub]);
        if (owner && owner.id !== userId) throw new Error(identityCollisionMessage);
        if (user.google_sub === identity.sub && user.google_verified_email === identity.email) return;

        await tx.execute(
          'UPDATE users SET google_sub = $1, google_verified_email = $2 WHERE id = $3',
          [identity.sub, identity.email, userId]
        );
        await tx.execute('DELETE FROM password_resets WHERE user_id = $1', [userId]);
      });
    } catch (error) {
      if (error.code === '23505' && error.constraint === 'users_google_sub_unique') {
        throw new Error(identityCollisionMessage);
      }
      throw error;
    }
    return auth().getCurrentUser(userId);
  }

  async function unlink(userId) {
    await database.transaction(async tx => {
      const user = await tx.queryOne('SELECT * FROM users WHERE id = $1 FOR UPDATE', [userId]);
      assertAccountAvailable(user);
      if (!user.password_hash) throw new Error('Hãy tạo mật khẩu cho tài khoản trước khi hủy liên kết Google.');

      await tx.execute('UPDATE users SET google_sub = NULL, google_verified_email = NULL WHERE id = $1', [userId]);
      await tx.execute('DELETE FROM password_resets WHERE user_id = $1', [userId]);
    });
    return auth().getCurrentUser(userId);
  }

  async function recover(body, cookie) {
    const target = recovery().readLookup(body?.lookupToken);
    const identity = await verify(body, cookie, 'recover');
    return recovery().googleProof(identity, target);
  }

  return { challenge, signIn, link, unlink, recover };
}

module.exports = { ...createGoogleIdentity(), createGoogleIdentity, clientId };
