const { randomBytes, scrypt, timingSafeEqual } = require('node:crypto');
const { promisify } = require('node:util');
const bcrypt = require('bcryptjs');

const derive = promisify(scrypt);
const options = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
const common = new Set([
  '123456789012345', '1234567890123456', '0123456789012345',
  'passwordpassword', 'password123456789', 'qwertyuiopasdfgh',
  'qwerty1234567890', 'iloveyouiloveyou', 'letmeinletmein123',
  'matkhau123456789', 'towerofknowledge', 'thaptrithuc12345'
]);

function validatePassword(value, identifiers = []) {
  if (typeof value !== 'string') throw new Error('Vui lòng nhập mật khẩu.');
  const length = [...value].length;
  if (length < 15 || length > 128) throw new Error('Mật khẩu cần từ 15 đến 128 ký tự.');
  const lower = value.toLowerCase();
  const matchesAccount = identifiers.some(id => typeof id === 'string' && id.toLowerCase() === lower);
  if (common.has(lower) || matchesAccount || /^(.{1,4})\1+$/su.test(value) || /^[0-9]+$/.test(value)) {
    throw new Error('Mật khẩu này dễ đoán. Hãy chọn một cụm từ dài khác.');
  }
}

async function hashPassword(value) {
  const salt = randomBytes(16).toString('hex');
  const key = await derive(value, salt, 32, options);
  return 'scrypt-v1$' + salt + '$' + key.toString('hex');
}

async function verifyPassword(value, stored) {
  if (typeof value !== 'string' || typeof stored !== 'string' || Buffer.byteLength(value) > 4096) return false;
  if (/^\$2[aby]\$/.test(stored)) return bcrypt.compare(value, stored);
  const match = /^scrypt-v1\$([a-f0-9]{32})\$([a-f0-9]{64})$/.exec(stored);
  if (!match) return false;
  const actual = await derive(value, match[1], 32, options);
  return timingSafeEqual(actual, Buffer.from(match[2], 'hex'));
}

module.exports = { validatePassword, hashPassword, verifyPassword };
