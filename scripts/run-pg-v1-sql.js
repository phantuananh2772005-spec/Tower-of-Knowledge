const { execFileSync } = require('node:child_process');

const container = 'thaptrithuc-pg-v1';
const filesByOperation = {
  migrate: ['001_schema.sql', 'seed_reference.sql'],
  verify: ['verify_v1.sql']
};

function dockerOutput(...args) {
  return execFileSync('docker', args, { encoding: 'utf8' }).trim();
}

function run(operation) {
  const files = filesByOperation[operation];
  if (!Array.isArray(files)) throw new Error('Chọn migrate hoặc verify.');
  const endpoints = JSON.parse(dockerOutput('context', 'inspect', '--format', '{{json .Endpoints}}'));
  const localSocket = /^(?:npipe|unix):\/\//;
  if (!localSocket.test(endpoints.docker?.Host || '') ||
      (process.env.DOCKER_HOST && !localSocket.test(process.env.DOCKER_HOST))) {
    throw new Error('Dùng Docker Engine local hoặc chạy psql theo database/pg-v1/README.md.');
  }
  const info = JSON.parse(dockerOutput('inspect', '--type', 'container', container))[0];
  if (!info.State.Running || info.Config.Labels?.['com.thaptrithuc.environment'] !== 'local-pg-v1' ||
      !info.Mounts.some(mount => mount.Destination === '/pg-v1' && !mount.RW)) {
    throw new Error('Khởi động container PostgreSQL V1 local theo database/pg-v1/README.md.');
  }
  for (const file of files) {
    execFileSync('docker', [
      'exec', container, 'psql', '-X', '-q', '-v', 'ON_ERROR_STOP=1',
      '-U', 'postgres', '-d', 'thaptrithuc_v1', '-f', '/pg-v1/' + file
    ], { stdio: 'inherit' });
  }
}

try {
  run(process.argv[2]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
