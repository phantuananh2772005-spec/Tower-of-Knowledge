const db = require('../database/db');
const { seedArenaBots } = require('./seed-pg-v1-bots');
const { seedCourseContent } = require('./seed-pg-v1-content');

async function main() {
  await db.verifyRuntime();
  const counts = await db.transaction(async tx => {
    const content = await seedCourseContent(tx);
    const bots = await seedArenaBots(tx);
    return { content, bots };
  });
  console.log(JSON.stringify(counts, null, 2));
}

main().catch(error => {
  console.error('Nạp dữ liệu mẫu V1 thất bại.', error.message);
  process.exitCode = 1;
}).finally(() => db.close());
