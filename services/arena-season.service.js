const db = require('../database/db');
const { mutateCoinsInTransaction } = require('./wallet.service');

function acquireArenaSeasonLock(tx) {
  return tx.queryOne("SELECT pg_advisory_xact_lock(hashtext('thap-tri-thuc-v1:arena-season'))");
}

async function publishSeasonResults(tx, season, period) {
  const results = await tx.query(`
    WITH totals AS (
      SELECT r.user_id, sum(r.points) AS points
      FROM rank_scores AS r
      JOIN users AS u ON u.id = r.user_id AND u.role = 'LEARNER'
      WHERE r.season_no = $1 AND EXISTS (
        SELECT 1
        FROM matches AS m
        JOIN coin_ledger AS l ON l.match_id = m.id AND l.user_id = r.user_id
          AND l.kind = 'MATCH_REWARD' AND l.delta > 0
        WHERE m.season_no = r.season_no AND m.mode = 'RANKED' AND m.status = 'FINISHED'
          AND m.finished_at >= $2 AND m.finished_at < $3
      )
      GROUP BY r.user_id
      HAVING sum(r.points) > 0
    )
    INSERT INTO season_results (season_no, user_id, rank)
    SELECT $1, user_id, rank() OVER (ORDER BY points DESC)::int FROM totals
    RETURNING user_id, rank
  `, [season.season_no, season.starts_at, season.ends_at]);

  // Match settlement and season awards take user locks in the same UUID order.
  results.sort((left, right) => left.user_id.localeCompare(right.user_id));
  for (const result of results) {
    const rank = result.rank;
    const coins = rank === 1 ? 150 : rank <= 3 ? 100 : rank <= 10 ? 50 : 0;
    if (coins === 0) continue;
    await mutateCoinsInTransaction(tx, result.user_id, coins, 'SEASON_REWARD', {
      season_no: season.season_no,
      occurred_at: period,
      note: 'Top ' + rank + ' mùa ' + season.season_no
    });
  }
}

async function syncArenaSeason(tx, occurredAt = null) {
  await acquireArenaSeasonLock(tx);
  const current = await tx.queryOne(`
    WITH observed AS (SELECT COALESCE($1::timestamptz, clock_timestamp()) AS observed_at)
    SELECT observed_at, greatest(
      1, 1 + floor(extract(epoch FROM (observed_at - v1_first_season_start())) /
        (v1_season_length_days() * 86400))
    )::int AS season_no
    FROM observed
  `, [occurredAt]);
  const open = await tx.queryOne(`
    SELECT v.season_no, v.starts_at, v.ends_at
    FROM seasons AS s JOIN v_season_calendar AS v USING (season_no)
    WHERE NOT s.is_closed
    FOR UPDATE OF s
  `);
  if (open?.season_no === current.season_no) return open;
  if (open?.season_no > current.season_no) {
    throw new Error('Thời điểm chốt trận sớm hơn mùa đấu hạng đang mở.');
  }

  if (open) {
    await publishSeasonResults(tx, open, current.observed_at);
    await tx.execute('UPDATE seasons SET is_closed = true WHERE season_no = $1', [open.season_no]);
  }
  await tx.execute('INSERT INTO seasons (season_no) VALUES ($1)', [current.season_no]);

  if (open) {
    const divisor = 2 ** Math.min(31, current.season_no - open.season_no);
    await tx.execute(`
      INSERT INTO rank_scores (user_id, subject_id, season_no, points)
      SELECT user_id, subject_id, $1, (points::bigint / $2::bigint)::int
      FROM rank_scores
      WHERE season_no = $3
    `, [current.season_no, divisor, open.season_no]);
  }

  return tx.queryOne(
    'SELECT season_no, starts_at, ends_at FROM v_season_calendar WHERE season_no = $1',
    [current.season_no]
  );
}

async function getArenaSeason() {
  const open = await db.queryOne(`
    WITH observed AS (SELECT clock_timestamp() AS now)
    SELECT v.season_no, v.starts_at, v.ends_at
    FROM v_season_calendar AS v CROSS JOIN observed
    WHERE NOT v.is_closed AND observed.now >= v.starts_at AND observed.now < v.ends_at
  `);
  return open ?? db.transaction(tx => syncArenaSeason(tx));
}

module.exports = { acquireArenaSeasonLock, syncArenaSeason, getArenaSeason };
