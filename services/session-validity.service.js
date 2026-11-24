const db = require('../database/db');

const userIdPattern = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
const loginRoles = new Set(['LEARNER', 'ADMIN']);

async function assertCurrentSession(decoded) {
  if (!decoded || typeof decoded.sub !== 'string' || !userIdPattern.test(decoded.sub) ||
      typeof decoded.username !== 'string' || !decoded.username.trim() ||
      !loginRoles.has(decoded.role) || !Number.isSafeInteger(decoded.session_version) ||
      decoded.session_version < 0 || !Number.isSafeInteger(decoded.iat) ||
      !Number.isSafeInteger(decoded.exp) || Date.now() >= decoded.exp * 1000) {
    throw new Error('SESSION_REVOKED');
  }

  const current = await db.queryOne(
    'SELECT username, role, session_version, disabled_at FROM users WHERE id = $1',
    [decoded.sub]
  );
  if (!current || current.disabled_at !== null || !loginRoles.has(current.role) ||
      current.session_version !== decoded.session_version) {
    throw new Error('SESSION_REVOKED');
  }

  return { ...decoded, id: decoded.sub, username: current.username, role: current.role };
}

module.exports = { assertCurrentSession };
