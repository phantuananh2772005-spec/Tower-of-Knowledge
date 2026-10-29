const db = require('../database/db');
async function assertCurrentSession(decoded) {
  const user = await db.queryOne('SELECT session_version, vai_tro FROM nguoi_dung WHERE ma_nguoi_dung = $1', [decoded.ma_nguoi_dung]);
  if (!user || Number(user.session_version || 0) !== Number(decoded.session_version || 0)) throw new Error('SESSION_REVOKED');
  decoded.vai_tro = user.vai_tro;
}
module.exports = { assertCurrentSession };
