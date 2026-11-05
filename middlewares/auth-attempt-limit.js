const buckets = new Map();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_KEYS = 10000;
let sweepAt = 0;

function authAttemptLimit(req, res, next) {
  const now = Date.now();
  if (now >= sweepAt) {
    sweepAt = now + 60000;
    for (const [key, bucket] of buckets) if (bucket.until <= now) buckets.delete(key);
  }

  const identity = typeof req.body?.ten_dang_nhap === 'string'
    ? req.body.ten_dang_nhap.trim().toLowerCase().slice(0, 254) : '';
  const registration = req.path === '/register';
  const limits = [[(registration ? 'register:' : 'login:') + req.ip, registration ? 8 : 40]];
  if (!registration && identity) limits.push(['account:' + identity, 10]);

  for (const [key, limit] of limits) {
    const bucket = buckets.get(key);
    if ((bucket?.until > now && bucket.count >= limit) || (!bucket && buckets.size >= MAX_KEYS)) {
      res.setHeader('Retry-After', String(Math.ceil(((bucket?.until || now + WINDOW_MS) - now) / 1000)));
      return res.apiError('Bạn đã thử nhiều lần. Hãy đợi một lúc rồi thử lại.', 'AUTH_RATE_LIMIT', 429);
    }
  }
  for (const [key] of limits) {
    const bucket = buckets.get(key);
    if (bucket?.until > now) bucket.count++;
    else buckets.set(key, { count: 1, until: now + WINDOW_MS });
  }
  next();
}

module.exports = { authAttemptLimit };
