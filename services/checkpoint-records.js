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
  const result = Object.fromEntries(rows.map(({ milestone_id, ...record }) => [milestone_id, record]));
  const steps = await db.query(`
    SELECT DISTINCT ON (milestone_id, step_no)
      milestone_id, step_no, scored_accuracy_percent::int AS accuracy_percent,
      CASE WHEN duration_seconds > 0 THEN round(duration_seconds / scored_question_count, 1)::float8 END AS average_seconds
    FROM v_study_session_stats
    WHERE user_id = $1 AND kind = 'STEP' AND finish_kind = 'SUBMITTED'
      AND finished_at IS NOT NULL AND scored_question_count > 0 ${milestoneFilter}
    ORDER BY milestone_id, step_no, scored_accuracy_percent DESC, finished_at, session_id
  `, params);
  for (const { milestone_id, step_no, accuracy_percent, average_seconds } of steps) {
    const record = result[milestone_id] ??= {};
    const byStep = record.steps ??= {};
    const stars = [70, 80, 95].filter(threshold => accuracy_percent >= threshold).length;
    byStep[step_no] = { accuracy_percent, average_seconds, stars };
  }
  return result;
}

module.exports = { records };
