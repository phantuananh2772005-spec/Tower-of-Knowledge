/**
 * Verifies Bearer tokens and resolves current authorization from PostgreSQL.
 */

const jwt = require('jsonwebtoken');
const { assertCurrentSession } = require('../services/session-validity.service');

function bearerToken(req) {
  const header = req.headers.authorization;
  return typeof header === 'string' ? /^Bearer (\S+)$/i.exec(header)?.[1] : undefined;
}

async function verifySessionToken(token) {
  const claims = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  return assertCurrentSession(claims);
}

function authError(res, status, code, message) {
  return res.status(status).json({
    success: false,
    error: { code, message },
    timestamp: new Date().toISOString()
  });
}

async function authenticate(req, res, next) {
  const token = bearerToken(req);
  if (!token) {
    return authError(res, 401, 'UNAUTHORIZED', 'Yêu cầu đăng nhập để truy cập tài nguyên này.');
  }

  try {
    req.user = await verifySessionToken(token);
  } catch {
    return authError(res, 401, 'INVALID_TOKEN', 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.');
  }
  return next();
}

async function optionalAuthenticate(req, res, next) {
  const token = bearerToken(req);
  if (token) {
    try {
      req.user = await verifySessionToken(token);
    } catch {
      // Public routes remain accessible without a valid session.
    }
  }
  return next();
}

function requireAdmin(req, res, next) {
  return authenticate(req, res, () => {
    if (req.user.role === 'ADMIN') return next();
    return authError(res, 403, 'FORBIDDEN', 'Bạn không có quyền thực hiện thao tác quản trị này.');
  });
}

module.exports = { authenticate, optionalAuthenticate, requireAdmin, verifySessionToken };
