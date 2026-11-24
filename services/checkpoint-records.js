const db = require('../database/db');

async function records(userId, milestoneIds) {
  if (milestoneIds?.length === 0) return {};
  const params = [userId];
  let milestoneFilter = '';
  if (milestoneIds) {
    params.push(milestoneIds);
    milestoneFilter = ' AND milestone_id = ANY($2::uuid[])';
  }
  const rows = await db.query(
    'SELECT milestone_id, accuracy_percent::float8, average_seconds::float8, recorded_steps::int, stars'
    + ' FROM v_step_records WHERE user_id = $1 AND (recorded_steps > 0 OR stars > 0)'
    + milestoneFilter,
    params
  );
  return Object.fromEntries(rows.map(({ milestone_id, ...record }) => [milestone_id, record]));
}

module.exports = { records };
