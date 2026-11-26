const db = require('../database/db');
const { mutateCoinsInTransaction } = require('./wallet.service');
const { getStepConfig } = require('./study-questions');

const subjectSummaryQuery = `
  WITH milestone_counts AS (
    SELECT c.subject_id, COUNT(*)::int AS total_milestones
    FROM chapters AS c
    JOIN milestones AS m ON m.chapter_id = c.id AND m.status = 'ACTIVE'
    WHERE c.status = 'ACTIVE'
    GROUP BY c.subject_id
  )
  SELECT s.id, s.slug, s.name, s.description, s.sort_order, p.enrolled_at,
    COALESCE(p.total_milestones, c.total_milestones, 0)::int AS total_milestones,
    COALESCE(p.opened_milestones, 0)::int AS opened_milestones,
    COALESCE(p.completed_milestones, 0)::int AS completed_milestones,
    COALESCE(p.completion_percent, 0)::float8 AS completion_percent
  FROM subjects AS s
  LEFT JOIN milestone_counts AS c ON c.subject_id = s.id
  LEFT JOIN v_subject_progress AS p ON p.subject_id = s.id AND p.user_id = $1
  WHERE s.status = 'ACTIVE'
`;

const milestoneProjection = `
  m.id, m.chapter_id, m.title, m.kind, m.sort_order, m.step_count, m.questions_per_step,
  NULLIF(btrim(m.theory_markdown), '') IS NOT NULL AS has_theory,
  m.reward_xp, m.reward_coins, COALESCE(p.status, 'LOCKED') AS status, p.current_step,
  COALESCE(p.completed_steps, 0) AS completed_steps, p.completed_at,
  COALESCE(p.xp_earned, 0) AS xp_earned, COALESCE(p.coins_earned, 0)::bigint AS coins_earned
`;

const lockedMilestoneMessage = 'Mốc bài học này đang bị khóa. Hãy hoàn thành các mốc trước để mở khóa!';

function listCourses(userId = null) {
  return db.query(subjectSummaryQuery + ' ORDER BY s.sort_order, s.id', [userId]);
}

function listMyCourses(userId) {
  if (!userId) return Promise.resolve([]);
  return db.query(subjectSummaryQuery + `
    AND p.enrolled_at IS NOT NULL
    ORDER BY p.enrolled_at DESC, s.sort_order, s.id
  `, [userId]);
}

async function lockCourseUser(tx, userId) {
  const user = await tx.queryOne(`
    SELECT id, xp, coin_balance FROM users
    WHERE id = $1 AND disabled_at IS NULL AND role IN ('LEARNER', 'ADMIN')
    FOR UPDATE
  `, [userId]);
  if (!user) throw new Error('Tài khoản không còn hoạt động.');
  return user;
}

async function lockOpenMilestone(tx, milestoneId, userId, { allowArchived = false } = {}) {
  const milestone = await tx.queryOne(`
    SELECT m.*, c.subject_id,
      (s.status = 'ACTIVE' AND c.status = 'ACTIVE' AND m.status = 'ACTIVE') AS is_available
    FROM subjects AS s
    JOIN chapters AS c ON c.subject_id = s.id
    JOIN milestones AS m ON m.chapter_id = c.id
    WHERE m.id = $1
    FOR SHARE OF s, c, m
  `, [milestoneId]);

  if (!milestone || (!milestone.is_available && !allowArchived)) {
    throw new Error('Không tìm thấy mốc bài học đang mở.');
  }

  const progress = await tx.queryOne(`
    SELECT p.current_step, p.completed_at, p.xp_earned, p.memory
    FROM enrollments AS e
    JOIN milestone_progress AS p ON p.user_id = e.user_id AND p.milestone_id = $3
    WHERE e.user_id = $1 AND e.subject_id = $2
    FOR UPDATE OF p
  `, [userId, milestone.subject_id, milestone.id]);
  if (!progress) throw new Error(lockedMilestoneMessage);
  return { ...milestone, progress };
}

async function openFirstIncomplete(tx, userId, subjectId) {
  const next = await tx.queryOne(`
    SELECT m.id, m.kind
    FROM subjects AS s
    JOIN chapters AS c ON c.subject_id = s.id AND c.status = 'ACTIVE'
    JOIN milestones AS m ON m.chapter_id = c.id AND m.status = 'ACTIVE'
    LEFT JOIN milestone_progress AS p ON p.milestone_id = m.id AND p.user_id = $1
    WHERE s.id = $2 AND s.status = 'ACTIVE' AND p.completed_at IS NULL
    ORDER BY c.sort_order, m.sort_order, m.id
    LIMIT 1
    FOR SHARE OF s, c, m
  `, [userId, subjectId]);
  if (!next) return null;

  await tx.execute(`
    INSERT INTO milestone_progress (user_id, milestone_id, current_step)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, milestone_id) DO NOTHING
  `, [userId, next.id, next.kind === 'THEORY' ? null : 1]);

  return next.id;
}

async function getActiveSubject(tx, slug, userId) {
  if (!userId) {
    const subject = await tx.queryOne(subjectSummaryQuery + ' AND s.slug = $2', [null, slug]);
    if (!subject) throw new Error('Không tìm thấy môn học.');
    return subject;
  }

  await lockCourseUser(tx, userId);
  const row = await tx.queryOne(`
    SELECT id FROM subjects WHERE slug = $1 AND status = 'ACTIVE' FOR SHARE
  `, [slug]);
  if (!row) throw new Error('Không tìm thấy môn học.');

  await tx.execute(`
    INSERT INTO enrollments (user_id, subject_id) VALUES ($1, $2)
    ON CONFLICT (user_id, subject_id) DO NOTHING
  `, [userId, row.id]);
  await openFirstIncomplete(tx, userId, row.id);

  return tx.queryOne(subjectSummaryQuery + ' AND s.id = $2', [userId, row.id]);
}

function enrollCourse(slug, userId) {
  if (!userId) throw new Error('Vui lòng đăng nhập để đăng ký môn học.');
  return db.transaction(tx => getActiveSubject(tx, slug, userId));
}

async function getCourseDetails(slug, userId = null) {
  return db.transaction(async tx => {
    const subject = await tx.queryOne(subjectSummaryQuery + ' AND s.slug = $2', [userId, slug]);
    if (!subject) throw new Error('Không tìm thấy môn học.');
    const chapters = await tx.query(`
      SELECT id, title, sort_order
      FROM chapters
      WHERE subject_id = $1 AND status = 'ACTIVE'
      ORDER BY sort_order, id
    `, [subject.id]);

    const milestones = await tx.query(`
      SELECT ${milestoneProjection}
      FROM milestones AS m
      JOIN chapters AS c ON c.id = m.chapter_id AND c.status = 'ACTIVE'
      LEFT JOIN v_milestone_progress AS p ON p.milestone_id = m.id AND p.user_id = $1
      WHERE c.subject_id = $2 AND m.status = 'ACTIVE'
      ORDER BY c.sort_order, m.sort_order, m.id
    `, [userId, subject.id]);

    const chapterIndex = new Map(chapters.map(chapter => [chapter.id, { ...chapter, milestones: [] }]));
    for (const item of milestones) {
      chapterIndex.get(item.chapter_id)?.milestones.push(parseMilestone(item));
    }
    return { ...subject, chapters: [...chapterIndex.values()] };
  });
}

function parseMilestone(item) {
  return { ...item, coins_earned: Number(item.coins_earned) };
}

async function getCheckpointPreview(milestoneId, userId) {
  const row = await db.queryOne(`
    SELECT ${milestoneProjection}, m.theory_markdown, m.bloom_config
    FROM subjects AS s
    JOIN chapters AS c ON c.subject_id = s.id AND c.status = 'ACTIVE'
    JOIN milestones AS m ON m.chapter_id = c.id AND m.status = 'ACTIVE'
    JOIN enrollments AS e ON e.subject_id = s.id AND e.user_id = $1
    JOIN v_milestone_progress AS p ON p.milestone_id = m.id AND p.user_id = e.user_id
    WHERE s.status = 'ACTIVE' AND m.id = $2
  `, [userId, milestoneId]);

  if (!row || row.status === 'LOCKED') throw new Error(lockedMilestoneMessage);

  const { bloom_config, ...preview } = parseMilestone(row);
  const stepConfigs = Array.from({ length: preview.step_count }, (_, index) => {
    const stepNo = index + 1;
    let status = 'LOCKED';
    if (stepNo <= preview.completed_steps) status = 'COMPLETED';
    else if (stepNo === preview.current_step) status = 'OPEN';
    return { ...getStepConfig({ ...preview, bloom_config }, stepNo), status };
  });

  return { ...preview, step_configs: stepConfigs };
}

async function applyMilestoneProgress(tx, milestone, userId, { completed, nextStep = null, xp, coins, note, at }) {
  // The caller holds user, milestone and progress locks in this order.
  const progress = await tx.queryOne(`
    UPDATE milestone_progress
    SET current_step = $3, completed_at = $4, xp_earned = xp_earned + $5
    WHERE user_id = $1 AND milestone_id = $2 AND completed_at IS NULL
    RETURNING current_step, completed_at
  `, [userId, milestone.id, completed ? null : nextStep, completed ? at : null, xp]);
  if (!progress) throw new Error('Mốc bài học đã hoàn thành.');

  const user = xp === 0
    ? await tx.queryOne('SELECT xp, coin_balance FROM users WHERE id = $1', [userId])
    : await tx.queryOne('UPDATE users SET xp = xp + $2 WHERE id = $1 RETURNING xp, coin_balance', [userId, xp]);
  let balance = user.coin_balance;
  if (coins > 0) {
    ({ coin_balance: balance } = await mutateCoinsInTransaction(tx, userId, coins, 'MILESTONE_REWARD', {
      milestone_id: milestone.id,
      note,
      occurred_at: at
    }));
  }

  return {
    ...progress,
    xp_awarded: xp,
    coins_awarded: coins,
    coin_balance: balance,
    total_xp: user.xp,
    next_milestone_id: completed ? await openFirstIncomplete(tx, userId, milestone.subject_id) : null
  };
}

async function completeTheoreticalCheckpoint(milestoneId, userId) {
  return db.transaction(async tx => {
    const user = await lockCourseUser(tx, userId);
    const milestone = await lockOpenMilestone(tx, milestoneId, userId);
    if (milestone.kind !== 'THEORY') throw new Error('Mốc này cần hoàn thành bài luyện tập.');

    const result = { milestone_id: milestoneId, completed: true };
    if (milestone.progress.completed_at) {
      return {
        ...result,
        already_completed: true,
        coins_awarded: 0,
        xp_awarded: 0,
        coin_balance: user.coin_balance,
        total_xp: user.xp,
        completed_at: milestone.progress.completed_at,
        current_step: null,
        next_milestone_id: null
      };
    }

    const { occurred_at } = await tx.queryOne('SELECT clock_timestamp() AS occurred_at');
    const progress = await applyMilestoneProgress(tx, milestone, userId, {
      completed: true,
      xp: milestone.reward_xp,
      coins: milestone.reward_coins,
      note: 'Hoàn thành lý thuyết mốc ' + milestone.title,
      at: occurred_at
    });
    return { ...result, already_completed: false, ...progress };
  });
}

module.exports = {
  listCourses,
  listMyCourses,
  enrollCourse,
  getCourseDetails,
  getCheckpointPreview,
  completeTheoreticalCheckpoint,
  lockCourseUser,
  lockOpenMilestone,
  applyMilestoneProgress
};
