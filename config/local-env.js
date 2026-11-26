const { readFileSync } = require('node:fs');
const path = require('node:path');
const dotenv = require('dotenv');

const envPath = path.join(__dirname, '..', '.env.local');
const loopbackHosts = ['127.0.0.1', 'localhost', '[::1]'];

function loadLocalEnvironment() {
  let values;
  try {
    values = dotenv.parse(readFileSync(envPath));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    throw new Error('Create .env.local using .env.local.example before running PostgreSQL V1.');
  }

  let databaseUrl;
  try {
    databaseUrl = new URL(values.DATABASE_URL);
  } catch {
    throw new Error('DATABASE_URL in .env.local must be a local PostgreSQL URL.');
  }
  const { protocol, hostname, pathname, username, password, search, hash } = databaseUrl;
  if (!['postgres:', 'postgresql:'].includes(protocol) || !loopbackHosts.includes(hostname)
      || pathname !== '/thaptrithuc_v1' || !username || username === 'postgres'
      || !password || search || hash) {
    throw new Error('DATABASE_URL must target local thaptrithuc_v1 with its dedicated app login.');
  }

  const port = Number(values.PORT ?? 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT in .env.local must be between 1 and 65535.');
  }
  if (!values.JWT_SECRET?.trim()) {
    throw new Error('JWT_SECRET is required in .env.local.');
  }

  // The local runtime never reads .env or takes a deploy database URL from the parent process.
  for (const key of ['JWT_SECRET', 'GOOGLE_CLIENT_ID', 'PASSWORD_RECOVERY_SECRET',
    'RESEND_API_KEY', 'RECOVERY_MAIL_FROM', 'PUBLIC_APP_URL']) {
    if (values[key] === undefined) delete process.env[key];
    else process.env[key] = values[key];
  }
  return { databaseUrl, port };
}

function loadProductionEnvironment() {
  const { V1_DATABASE_URL, JWT_SECRET, PORT = '10000' } = process.env;
  if (!V1_DATABASE_URL || !JWT_SECRET?.trim()) {
    throw new Error('Set V1_DATABASE_URL and JWT_SECRET for the production V1 runtime.');
  }
  const databaseUrl = new URL(V1_DATABASE_URL);
  const port = Number(PORT);
  if (!['postgres:', 'postgresql:'].includes(databaseUrl.protocol)
      || !databaseUrl.username || !databaseUrl.password || databaseUrl.pathname.length < 2
      || databaseUrl.search || databaseUrl.hash || !Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('Invalid V1 runtime connection or PORT.');
  }
  return { databaseUrl, port, host: '0.0.0.0', ssl: { rejectUnauthorized: true } };
}

module.exports = process.env.NODE_ENV === 'production'
  ? loadProductionEnvironment()
  : { ...loadLocalEnvironment(), host: '127.0.0.1', ssl: false };
