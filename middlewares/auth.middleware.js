/**
 * Auth Middleware
 * Validates JWT bearer tokens and role-based permissions.
 */

const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'tower_of_knowledge_ultra_secure_jwt_secret_2026';

async function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Yêu cầu đăng nhập để truy cập tài nguyên này.' },
      timestamp: new Date().toISOString()
    });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    await require('../services/session-validity.service').assertCurrentSession(decoded);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Phiên đăng nhập đã hết hạn hoặc không hợp lệ.' },
      timestamp: new Date().toISOString()
    });
  }
}

/**
 * Optional authentication: attaches req.user if token is present, continues otherwise
 */
async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      await require('../services/session-validity.service').assertCurrentSession(decoded);
      req.user = decoded;
    } catch (err) {
      // Ignore invalid optional token
    }
  }
  next();
}

/**
 * Requires admin role
 */
function requireAdmin(req, res, next) {
  authenticate(req, res, () => {
    if (req.user && req.user.vai_tro === 'QUAN_TRI_VIEN') {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Bạn không có quyền thực hiện thao tác quản trị này.' },
        timestamp: new Date().toISOString()
      });
    }
  });
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireAdmin
};
