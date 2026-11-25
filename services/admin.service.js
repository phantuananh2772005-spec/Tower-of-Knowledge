const db = require('../database/db');
const content = require('./admin-content.service');
const { deriveRankTitle } = require('../core/rules/economy.rules');
const { replayExtreme, extremePrompt } = require('../core/rules/extreme.rules');
const { mutateCoinsInTransaction } = require('./wallet.service');

const USER_COLUMNS = [
  'id', 'username', 'email', 'display_name', 'role', 'xp', 'coin_balance',
  'streak_days', 'last_active_date', 'created_at', 'disabled_at'
];
const userColumns = USER_COLUMNS.join(', ');
const qualifiedUserColumns = USER_COLUMNS.map(column => 'u.' + column).join(', ');

function formatUser(user) {
  return { ...user, rank_title: deriveRankTitle(user.xp) };
}

async function getSystemStats() {
  const [overview, recentUsers, recentMatches] = await Promise.all([
    db.queryOne(`
      SELECT (SELECT count(*) FROM users)::integer AS user_count,
             (SELECT count(*) FROM subjects)::integer AS subject_count,
             (SELECT count(*) FROM chapters)::integer AS chapter_count,
             (SELECT count(*) FROM milestones)::integer AS milestone_count,
             (SELECT count(*) FROM questions)::integer AS question_count,
             (SELECT count(*) FROM matches)::integer AS match_count,
             (SELECT count(*) FROM v_study_session_stats
                WHERE kind = 'EXTREME' AND finished_at IS NOT NULL AND answer_count > 0)::integer AS extreme_session_count,
             (SELECT count(*) FROM coin_ledger)::integer AS transaction_count,
             (SELECT coalesce(sum(coin_balance), 0) FROM users) AS coin_balance_total
    `),
    db.query('SELECT ' + userColumns + ' FROM users ORDER BY created_at DESC, id DESC LIMIT 5'),
    db.query(`
      SELECT m.id, m.subject_id, m.mode, m.status, m.started_at, m.finished_at, m.finish_reason,
             p.user_id AS winner_id, u.display_name AS winner_display_name
      FROM matches m
      LEFT JOIN match_players p ON p.match_id = m.id AND p.result = 'WIN'
      LEFT JOIN users u ON u.id = p.user_id
      ORDER BY m.started_at DESC, m.id DESC LIMIT 5
    `)
  ]);
  return {
    overview: { ...overview, coin_balance_total: Number(overview.coin_balance_total) },
    recent_users: recentUsers.map(formatUser),
    recent_matches: recentMatches
  };
}

async function listUsers() {
  const users = await db.query('SELECT ' + userColumns + ' FROM users ORDER BY created_at DESC, id DESC');
  return users.map(formatUser);
}

async function lockManagedUser(tx, userId, actorId) {
  // Serialize changes that can remove an active administrator.
  await tx.queryOne("SELECT pg_advisory_xact_lock(hashtextextended('app_v1.admin.accounts', 0))");
  if (actorId) {
    const actor = await tx.queryOne('SELECT role, disabled_at FROM users WHERE id = $1', [actorId]);
    if (actor?.role !== 'ADMIN' || actor.disabled_at) throw new Error('Không có quyền quản trị.');
  }
  const user = await tx.queryOne('SELECT ' + userColumns + ' FROM users WHERE id = $1 FOR UPDATE', [userId]);
  if (!user) throw new Error('Người dùng không tồn tại.');
  if (user.role === 'SYSTEM') throw new Error('Không thể thay đổi tài khoản hệ thống.');
  return user;
}

async function requireOtherAdmin(tx, user, actorId) {
  if (user.role !== 'ADMIN' || user.disabled_at) return;
  if (user.id === actorId) throw new Error('Không thể hạ quyền hoặc vô hiệu hóa tài khoản của chính bạn.');
  const other = await tx.queryOne(
    "SELECT 1 FROM users WHERE role = 'ADMIN' AND disabled_at IS NULL AND id <> $1 LIMIT 1",
    [user.id]
  );
  if (!other) throw new Error('Phải giữ ít nhất một quản trị viên đang hoạt động.');
}

async function updateUserRole(userId, role, actorId) {
  if (!['LEARNER', 'ADMIN'].includes(role)) throw new Error('Vai trò không hợp lệ.');
  return db.transaction(async tx => {
    const user = await lockManagedUser(tx, userId, actorId);
    if (user.role === role) return formatUser(user);
    if (role === 'LEARNER') await requireOtherAdmin(tx, user, actorId);
    const changed = await tx.queryOne(
      'UPDATE users SET role = $2, session_version = session_version + 1 WHERE id = $1 RETURNING ' + userColumns,
      [userId, role]
    );
    return formatUser(changed);
  });
}

async function setUserDisabled(userId, disabled, actorId) {
  if (typeof disabled !== 'boolean') throw new Error('Trạng thái tài khoản không hợp lệ.');
  return db.transaction(async tx => {
    const user = await lockManagedUser(tx, userId, actorId);
    if (Boolean(user.disabled_at) === disabled) return formatUser(user);
    if (disabled) await requireOtherAdmin(tx, user, actorId);
    const changed = await tx.queryOne(
      'UPDATE users SET disabled_at = CASE WHEN $2 THEN clock_timestamp() ELSE NULL END,'
        + ' session_version = session_version + 1 WHERE id = $1 RETURNING ' + userColumns,
      [userId, disabled]
    );
    if (disabled) await tx.execute('DELETE FROM password_resets WHERE user_id = $1', [userId]);
    return formatUser(changed);
  });
}

async function adjustUserCoins(userId, delta, note) {
  if (!Number.isSafeInteger(delta) || delta === 0 || delta < -2147483648 || delta > 2147483647) {
    throw new Error('Số Xu điều chỉnh phải là số nguyên hợp lệ và khác 0.');
  }
  if (note != null && typeof note !== 'string') throw new Error('Lý do điều chỉnh không hợp lệ.');
  return db.transaction(tx => mutateCoinsInTransaction(tx, userId, delta, 'ADMIN_ADJUSTMENT', {
    note: note?.trim() || 'Điều chỉnh bởi quản trị viên'
  }));
}

function formatDuration(seconds) {
  if (seconds == null) return null;
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const remainder = total % 60 + 's';
  if (minutes >= 60) return Math.floor(minutes / 60) + 'g ' + minutes % 60 + 'p ' + remainder;
  return minutes ? minutes + 'p ' + remainder : remainder;
}

function numeric(value) {
  return value == null ? null : Number(value);
}

function answerText(value) {
  if (!Array.isArray(value)) return value;
  return value.map(item => typeof item === 'string' ? item : item.left + ' ↔ ' + item.right).join(' → ');
}

function formatAttempt(row) {
  const { payload, selected_text, option_answer, session_kind, ...attempt } = row;
  const response = attempt.response;
  let submitted = selected_text ?? attempt.submitted_text;
  if (response?.kind === 'TIMEOUT') submitted = 'Hết giờ';
  if (response?.kind === 'MATCHING') submitted = answerText(response.pairs);
  if (response?.kind === 'ORDERING') submitted = answerText(response.tokens);
  let expected = option_answer ?? payload?.blank_answer ?? payload?.pairs ?? payload?.correct_order;
  if (session_kind === 'EXTREME' && attempt.type === 'MATCHING') expected = payload.pairs[0].right;
  return {
    ...attempt,
    stem: session_kind === 'EXTREME' ? extremePrompt({ ...attempt, payload }) : attempt.stem,
    seconds: numeric(attempt.seconds),
    answer_text: submitted,
    correct_answer_text: answerText(expected),
    lookup_count: attempt.lookups.length
  };
}

async function loadAttempts(sessionIds) {
  if (!sessionIds.length) return new Map();
  const rows = await db.query(`
    SELECT a.session_id, a.attempt_no, a.question_position, q.id AS question_id, s.kind AS session_kind,
           q.type, q.bloom_level, q.difficulty, q.stem, q.explanation, q.payload,
           a.is_correct, a.seconds, a.selected_option_position, a.submitted_text, a.response,
           chosen.text AS selected_text, expected.text AS option_answer,
           coalesce(events.lookups, '[]'::jsonb) AS lookups
    FROM session_answers a
    JOIN study_sessions s ON s.id = a.session_id
    JOIN study_session_questions issued
      ON issued.session_id = a.session_id AND issued.position = a.question_position
    JOIN questions q ON q.id = issued.question_id
    LEFT JOIN question_options chosen
      ON chosen.question_id = q.id AND chosen.position = a.selected_option_position
    LEFT JOIN question_options expected ON expected.question_id = q.id AND expected.is_correct
    LEFT JOIN LATERAL (
      SELECT jsonb_agg(jsonb_build_object(
        'lookup_no', l.lookup_no, 'opened_at', l.opened_at,
        'duration_seconds', l.duration_seconds, 'offset_seconds', l.offset_seconds,
        'context', l.context
      ) ORDER BY l.lookup_no) AS lookups
      FROM session_answer_lookups l WHERE l.session_id = a.session_id AND l.attempt_no = a.attempt_no
    ) events ON true
    WHERE a.session_id = ANY($1::uuid[])
    ORDER BY a.session_id, a.attempt_no
  `, [sessionIds]);
  const bySession = new Map();
  for (const { session_id, ...row } of rows) {
    if (!bySession.has(session_id)) bySession.set(session_id, []);
    bySession.get(session_id).push(formatAttempt(row));
  }
  return bySession;
}

async function loadSessions(userId = null, limit = null) {
  const rows = await db.query(`
    SELECT t.session_id AS id, t.user_id, t.kind, t.milestone_id, t.step_no,
           t.started_at, t.finished_at, t.finish_kind,
           t.answer_count::integer, t.correct_count::integer, t.accuracy_percent,
           t.total_lookups::integer, t.average_seconds, t.duration_seconds,
           t.scored_question_count::integer, t.scored_correct_count::integer, t.scored_accuracy_percent,
           s.id AS subject_id, s.name AS subject_name, c.title AS chapter_title, m.title AS milestone_title,
           u.display_name, u.username, u.xp
    FROM v_study_session_stats t
    JOIN users u ON u.id = t.user_id
    LEFT JOIN milestones m ON m.id = t.milestone_id
    LEFT JOIN chapters c ON c.id = m.chapter_id
    JOIN subjects s ON s.id = coalesce(t.subject_id, c.subject_id)
    WHERE t.finished_at IS NOT NULL AND (t.kind <> 'EXTREME' OR t.answer_count > 0)
      AND ($1::uuid IS NULL OR t.user_id = $1)
    ORDER BY t.finished_at DESC, t.session_id DESC LIMIT $2
  `, [userId, limit]);
  const bySession = await loadAttempts(rows.map(row => row.id));
  return rows.map(({ xp, ...session }) => {
    const attempts = bySession.get(session.id) ?? [];
    const duration = numeric(session.duration_seconds);
    const extreme = session.kind === 'EXTREME' ? replayExtreme(attempts, session.scored_question_count) : null;
    return {
      ...session,
      rank_title: deriveRankTitle(xp),
      accuracy_percent: numeric(session.accuracy_percent),
      scored_accuracy_percent: numeric(session.scored_accuracy_percent),
      average_seconds: numeric(session.average_seconds),
      duration_seconds: duration,
      formatted_duration: formatDuration(duration),
      attempts,
      extreme_stats: extreme ? { score: extreme.score, best_combo: extreme.best_combo, round: extreme.round } : null
    };
  });
}

async function getActivityLogs(userId = null) {
  return db.query(`
    SELECT u.id AS user_id, u.username, u.display_name, s.id AS subject_id, s.name AS subject_name,
           c.title AS chapter_title, m.id AS milestone_id, m.title AS milestone_title, p.status,
           p.current_step, p.completed_steps, p.total_steps, p.completed_at, p.xp_earned,
           p.coins_earned::integer
    FROM v_milestone_progress p
    JOIN users u ON u.id = p.user_id
    JOIN milestones m ON m.id = p.milestone_id
    JOIN chapters c ON c.id = m.chapter_id
    JOIN subjects s ON s.id = c.subject_id
    WHERE p.status <> 'LOCKED' AND ($1::uuid IS NULL OR u.id = $1)
    ORDER BY p.completed_at DESC NULLS LAST, c.sort_order, m.sort_order, m.id, u.id
  `, [userId]);
}

async function getLearningActivityFeed() {
  const [totals, recent_activities, activity_logs] = await Promise.all([
    db.queryOne(`
      SELECT count(*)::integer AS total_sessions, count(DISTINCT user_id)::integer AS total_learners_active,
             round(avg(accuracy_percent)) AS avg_accuracy, sum(duration_seconds) AS total_study_time_seconds,
             coalesce(sum(total_lookups), 0)::integer AS total_lookups
      FROM v_study_session_stats WHERE finished_at IS NOT NULL AND (kind <> 'EXTREME' OR answer_count > 0)
    `),
    loadSessions(null, 10),
    getActivityLogs()
  ]);
  return {
    summary: {
      ...totals,
      avg_accuracy: numeric(totals.avg_accuracy),
      total_study_time_seconds: numeric(totals.total_study_time_seconds),
      formatted_total_time: formatDuration(totals.total_study_time_seconds)
    },
    recent_activities,
    activity_logs
  };
}

async function getLearnersTelemetryList() {
  const users = await db.query(`
    WITH learning AS (
      SELECT user_id, count(*)::integer AS total_sessions, round(avg(accuracy_percent)) AS avg_accuracy,
             sum(duration_seconds) AS total_study_time_seconds, sum(total_lookups)::integer AS total_lookups,
             max(finished_at) AS last_finished_at
      FROM v_study_session_stats WHERE finished_at IS NOT NULL AND (kind <> 'EXTREME' OR answer_count > 0)
      GROUP BY user_id
    ), progress AS (
      SELECT user_id, count(*)::integer AS completed_milestones
      FROM milestone_progress WHERE completed_at IS NOT NULL GROUP BY user_id
    )
    SELECT ` + qualifiedUserColumns + `, coalesce(l.total_sessions, 0) AS total_sessions, l.avg_accuracy,
           l.total_study_time_seconds, coalesce(l.total_lookups, 0) AS total_lookups,
           coalesce(p.completed_milestones, 0) AS completed_milestones,
           coalesce(l.last_finished_at, u.last_active_date::timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh', u.created_at)
             AS last_activity_at
    FROM users u
    LEFT JOIN learning l ON l.user_id = u.id
    LEFT JOIN progress p ON p.user_id = u.id
    WHERE u.role <> 'SYSTEM'
    ORDER BY last_activity_at DESC, u.created_at DESC, u.id
  `);
  return users.map(user => ({
    ...formatUser(user),
    avg_accuracy: numeric(user.avg_accuracy),
    total_study_time_seconds: numeric(user.total_study_time_seconds),
    formatted_duration: formatDuration(user.total_study_time_seconds)
  }));
}

function collectWeaknesses(sessions, memoryRows) {
  const weightByQuestion = new Map();
  for (const { memory } of memoryRows) {
    for (const [questionId, entry] of Object.entries(memory)) {
      const weight = numeric(entry?.trong_so);
      if (!Number.isFinite(weight)) continue;
      weightByQuestion.set(questionId, Math.max(weightByQuestion.get(questionId) ?? weight, weight));
    }
  }
  const byQuestion = new Map();
  for (const session of sessions) {
    if (session.kind === 'EXTREME') continue;
    for (const attempt of session.attempts) {
      const { question_id, stem, correct_answer_text, explanation } = attempt;
      if (!byQuestion.has(question_id)) {
        byQuestion.set(question_id, {
          question_id, stem, correct_answer_text, explanation, wrong_count: 0, answer_count: 0,
          timed_count: 0, total_seconds: 0, total_lookups: 0, last_lookup_at: null
        });
      }
      const stats = byQuestion.get(question_id);
      stats.answer_count++;
      if (!attempt.is_correct) stats.wrong_count++;
      if (attempt.seconds != null) {
        stats.timed_count++;
        stats.total_seconds += attempt.seconds;
      }
      stats.total_lookups += attempt.lookup_count;
      for (const { opened_at } of attempt.lookups) {
        if (!stats.last_lookup_at || Date.parse(opened_at) > Date.parse(stats.last_lookup_at)) {
          stats.last_lookup_at = opened_at;
        }
      }
    }
  }
  return [...byQuestion.values()].map(({ timed_count, total_seconds, ...item }) => ({
    ...item,
    correct_count: item.answer_count - item.wrong_count,
    wrong_percent: Math.round(100 * item.wrong_count / item.answer_count),
    average_seconds: timed_count ? Math.round(total_seconds * 10 / timed_count) / 10 : null,
    weight: weightByQuestion.get(item.question_id) ?? null
  })).sort((a, b) => b.wrong_percent - a.wrong_percent || (b.weight ?? 0) - (a.weight ?? 0));
}

async function getLearnerDeepTelemetry(userId) {
  const user = await db.queryOne('SELECT ' + userColumns + ' FROM users WHERE id = $1', [userId]);
  if (!user) throw new Error('Không tìm thấy học viên.');
  const [sessions, checkpoints_progress, memory] = await Promise.all([
    loadSessions(userId),
    getActivityLogs(userId),
    db.query('SELECT memory FROM milestone_progress WHERE user_id = $1', [userId])
  ]);

  let total_questions = 0;
  let total_correct = 0;
  let total_time_seconds = null;
  let totalAnswerSeconds = 0;
  let timedAnswers = 0;
  let total_lookups = 0;
  for (const session of sessions) {
    if (session.duration_seconds != null) total_time_seconds = (total_time_seconds ?? 0) + session.duration_seconds;
    for (const attempt of session.attempts) {
      total_questions++;
      if (attempt.is_correct) total_correct++;
      total_lookups += attempt.lookup_count;
      if (attempt.seconds != null) {
        timedAnswers++;
        totalAnswerSeconds += attempt.seconds;
      }
    }
  }

  return {
    user: formatUser(user),
    kpi: {
      total_sessions: sessions.length,
      total_questions,
      total_correct,
      total_wrong: total_questions - total_correct,
      accuracy_percentage: total_questions ? Math.round(100 * total_correct / total_questions) : null,
      total_time_seconds,
      formatted_total_time: formatDuration(total_time_seconds),
      avg_time_per_question: timedAnswers ? Math.round(totalAnswerSeconds * 10 / timedAnswers) / 10 : null,
      total_lookups,
      completed_checkpoints: checkpoints_progress.filter(p => p.status === 'COMPLETED').length
    },
    sessions,
    weaknesses: collectWeaknesses(sessions, memory),
    checkpoints_progress
  };
}

async function getAllTransactions() {
  const rows = await db.query(`
    SELECT h.id, h.user_id, u.username, u.display_name, h.kind, h.delta, h.balance_after, h.note,
           h.occurred_at, h.match_id, h.milestone_id, h.season_no
    FROM v_coin_history h JOIN users u ON u.id = h.user_id
    ORDER BY h.occurred_at DESC, h.id DESC
  `);
  return rows.map(row => ({ ...row, balance_after: Number(row.balance_after) }));
}

module.exports = {
  ...content,
  getSystemStats,
  listUsers,
  updateUserRole,
  setUserDisabled,
  adjustUserCoins,
  getActivityLogs,
  getLearningActivityFeed,
  getLearnersTelemetryList,
  getLearnerDeepTelemetry,
  getAllTransactions
};
