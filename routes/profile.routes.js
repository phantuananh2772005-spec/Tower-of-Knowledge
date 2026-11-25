const router = require('express').Router();
const { authenticate } = require('../middlewares/auth.middleware');
const db = require('../database/db');

const journeyQuery = `
  WITH courses AS (
    SELECT s.id, s.slug, s.name, s.sort_order, p.enrolled_at, p.total_milestones,
      p.completed_milestones, p.completion_percent
    FROM v_subject_progress p
    JOIN subjects s ON s.id = p.subject_id
    WHERE p.user_id = $1 AND s.status = 'ACTIVE'
  ), activity AS (
    SELECT (finished_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date AS day, count(*) AS sessions
    FROM study_sessions s
    WHERE s.user_id = $1 AND s.finished_at >= CURRENT_TIMESTAMP - interval '90 days'
      AND (s.kind <> 'EXTREME' OR EXISTS (SELECT 1 FROM session_answers a WHERE a.session_id = s.id))
    GROUP BY 1
  ), season_awards AS (
    SELECT season_no, rank, coins_awarded
    FROM v_season_awards
    WHERE user_id = $1 AND coins_awarded > 0
  )
  SELECT
    COALESCE((
      SELECT jsonb_agg(to_jsonb(c) - 'sort_order' ORDER BY c.enrolled_at DESC, c.sort_order, c.id)
      FROM courses c
    ), '[]'::jsonb) AS courses,
    COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.day) FROM activity a), '[]'::jsonb) AS activity,
    COALESCE((
      SELECT jsonb_agg(to_jsonb(s) ORDER BY s.season_no DESC) FROM season_awards s
    ), '[]'::jsonb) AS season_awards
`;

router.get('/profile/journey', authenticate, async (req, res) => {
  try {
    const journey = await db.queryOne(journeyQuery, [req.user.id]);
    res.set('Cache-Control', 'no-store');
    res.apiSuccess(journey);
  } catch (error) {
    console.error('[profile journey]', error.message);
    res.apiError('Không tải được hành trình. Vui lòng thử lại.', 'PROFILE_FAILED', 500);
  }
});

module.exports = router;
