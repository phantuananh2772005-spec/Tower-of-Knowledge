-- Derived read models. 001_schema.sql sets the transaction-local search path.
CREATE OR REPLACE VIEW v_subject_progress AS
SELECT
    e.user_id,
    e.subject_id,
    e.enrolled_at,
    count(m.id) AS total_milestones,
    count(p.milestone_id) AS opened_milestones,
    count(p.completed_at) AS completed_milestones,
    coalesce(round(100.0 * count(p.completed_at) / nullif(count(m.id), 0), 1), 0) AS completion_percent
FROM enrollments AS e
JOIN subjects AS s ON s.id = e.subject_id
LEFT JOIN chapters AS c ON c.subject_id = s.id AND s.status = 'ACTIVE' AND c.status = 'ACTIVE'
LEFT JOIN milestones AS m ON m.chapter_id = c.id AND m.status = 'ACTIVE'
LEFT JOIN milestone_progress AS p ON p.user_id = e.user_id AND p.milestone_id = m.id
GROUP BY e.user_id, e.subject_id, e.enrolled_at;

CREATE OR REPLACE VIEW v_study_session_stats AS
WITH attempt_stats AS (
    SELECT
        a.session_id,
        count(*) AS answer_count,
        count(*) FILTER (WHERE a.is_correct) AS correct_count,
        count(a.seconds) AS timed_answer_count,
        sum(a.seconds) AS total_answer_seconds,
        avg(a.seconds) AS average_seconds
    FROM session_answers AS a
    GROUP BY a.session_id
), lookup_stats AS (
    SELECT l.session_id, count(*) AS total_lookups
    FROM session_answer_lookups AS l
    GROUP BY l.session_id
), last_answers AS (
    SELECT DISTINCT ON (a.session_id, a.question_position)
        a.session_id, a.question_position, a.is_correct
    FROM session_answers AS a
    ORDER BY a.session_id, a.question_position, a.attempt_no DESC
), official_score AS (
    SELECT
        q.session_id,
        count(*) AS question_count,
        count(*) FILTER (WHERE a.is_correct) AS correct_count
    FROM study_session_questions AS q
    LEFT JOIN last_answers AS a ON a.session_id = q.session_id AND a.question_position = q.position
    GROUP BY q.session_id
)
SELECT
    s.id AS session_id,
    s.user_id,
    s.kind,
    s.milestone_id,
    s.subject_id,
    s.step_no,
    s.started_at,
    s.finished_at,
    s.finish_kind,
    coalesce(a.answer_count, 0) AS answer_count,
    coalesce(a.correct_count, 0) AS correct_count,
    round(100.0 * a.correct_count / nullif(a.answer_count, 0)) AS accuracy_percent,
    coalesce(l.total_lookups, 0) AS total_lookups,
    coalesce(a.timed_answer_count, 0) AS timed_answer_count,
    a.total_answer_seconds,
    a.average_seconds,
    CASE WHEN s.kind = 'EXTREME' THEN extract(epoch FROM s.finished_at - s.started_at)
         WHEN a.timed_answer_count = a.answer_count THEN a.total_answer_seconds
    END AS duration_seconds,
    coalesce(g.question_count, 0) AS scored_question_count,
    coalesce(g.correct_count, 0) AS scored_correct_count,
    round(100.0 * g.correct_count / nullif(g.question_count, 0)) AS scored_accuracy_percent
FROM study_sessions AS s
LEFT JOIN attempt_stats AS a ON a.session_id = s.id
LEFT JOIN lookup_stats AS l ON l.session_id = s.id
LEFT JOIN official_score AS g ON g.session_id = s.id;

CREATE OR REPLACE VIEW v_milestone_progress AS
WITH milestone_scope AS (
    SELECT e.user_id, m.id AS milestone_id
    FROM enrollments AS e
    JOIN subjects AS s ON s.id = e.subject_id AND s.status = 'ACTIVE'
    JOIN chapters AS c ON c.subject_id = s.id AND c.status = 'ACTIVE'
    JOIN milestones AS m ON m.chapter_id = c.id AND m.status = 'ACTIVE'
    UNION
    SELECT p.user_id, p.milestone_id
    FROM milestone_progress AS p
), milestone_rewards AS (
    SELECT l.user_id, l.milestone_id, sum(l.delta) AS coins_earned
    FROM coin_ledger AS l
    WHERE l.kind = 'MILESTONE_REWARD'
    GROUP BY l.user_id, l.milestone_id
), latest_submission AS (
    SELECT DISTINCT ON (s.user_id, s.milestone_id)
        s.user_id, s.milestone_id, s.session_id,
        s.scored_question_count, s.scored_correct_count, s.scored_accuracy_percent
    FROM v_study_session_stats AS s
    WHERE s.milestone_id IS NOT NULL
      AND s.finish_kind = 'SUBMITTED'
      AND s.finished_at IS NOT NULL
    ORDER BY s.user_id, s.milestone_id, s.finished_at DESC, s.session_id
)
SELECT
    scope.user_id,
    s.id AS subject_id,
    m.id AS milestone_id,
    CASE
        WHEN p.completed_at IS NOT NULL THEN 'COMPLETED'
        WHEN p.user_id IS NOT NULL THEN 'OPEN'
        ELSE 'LOCKED'
    END AS status,
    (s.status = 'ACTIVE' AND c.status = 'ACTIVE' AND m.status = 'ACTIVE') AS is_available,
    p.current_step,
    CASE WHEN p.completed_at IS NOT NULL THEN m.step_count::int
         ELSE greatest(0, least(m.step_count::int, coalesce(p.current_step - 1, 0)))
    END AS completed_steps,
    m.step_count AS total_steps,
    p.completed_at,
    coalesce(p.xp_earned, 0) AS xp_earned,
    coalesce(l.coins_earned, 0) AS coins_earned,
    g.session_id AS last_session_id,
    g.scored_question_count,
    g.scored_correct_count,
    g.scored_accuracy_percent
FROM milestone_scope AS scope
JOIN milestones AS m ON m.id = scope.milestone_id
JOIN chapters AS c ON c.id = m.chapter_id
JOIN subjects AS s ON s.id = c.subject_id
LEFT JOIN milestone_progress AS p ON p.user_id = scope.user_id AND p.milestone_id = m.id
LEFT JOIN milestone_rewards AS l ON l.user_id = scope.user_id AND l.milestone_id = m.id
LEFT JOIN latest_submission AS g ON g.user_id = scope.user_id AND g.milestone_id = m.id;

CREATE OR REPLACE VIEW v_step_records AS
WITH first_attempts AS (
    SELECT DISTINCT ON (a.session_id, a.question_position)
        a.session_id, a.question_position, a.is_correct
    FROM session_answers AS a
    ORDER BY a.session_id, a.question_position, a.attempt_no
), first_scores AS (
    SELECT
        a.session_id,
        count(*) AS answer_count,
        count(*) FILTER (WHERE a.is_correct) AS correct_count
    FROM first_attempts AS a
    GROUP BY a.session_id
), best_steps AS (
    SELECT DISTINCT ON (s.user_id, s.milestone_id, s.step_no)
        s.user_id, s.milestone_id, s.step_no, a.answer_count, a.correct_count, s.duration_seconds
    FROM v_study_session_stats AS s
    JOIN first_scores AS a ON a.session_id = s.session_id
    WHERE s.kind = 'STEP' AND s.finish_kind = 'SUBMITTED' AND s.finished_at IS NOT NULL
    ORDER BY s.user_id, s.milestone_id, s.step_no,
        a.correct_count::numeric / a.answer_count DESC, s.finished_at, s.session_id
), records AS (
    SELECT
        user_id, milestone_id,
        count(*) AS recorded_steps,
        sum(correct_count) AS correct_count,
        sum(answer_count) AS answer_count,
        round(100.0 * sum(correct_count) / sum(answer_count)) AS accuracy_percent,
        -- Legacy record time uses total time of each selected session over its first-attempt sample.
        CASE WHEN bool_and(coalesce(duration_seconds > 0, false))
            THEN round(sum(duration_seconds) / sum(answer_count), 1)
        END AS average_seconds
    FROM best_steps
    GROUP BY user_id, milestone_id
)
SELECT
    p.user_id,
    p.milestone_id,
    coalesce(r.recorded_steps, 0) AS recorded_steps,
    coalesce(r.correct_count, 0) AS correct_count,
    coalesce(r.answer_count, 0) AS answer_count,
    r.accuracy_percent,
    r.average_seconds,
    CASE
        WHEN p.completed_at IS NULL THEN 0
        WHEN p.total_steps <= 0 OR coalesce(r.recorded_steps, 0) < p.total_steps THEN 1
        WHEN r.accuracy_percent >= 95 THEN 3
        WHEN r.accuracy_percent >= 80 THEN 2
        ELSE 1
    END AS stars
FROM v_milestone_progress AS p
LEFT JOIN records AS r ON r.user_id = p.user_id AND r.milestone_id = p.milestone_id;

CREATE OR REPLACE VIEW v_match_player_stats AS
WITH answer_stats AS (
    SELECT
        a.match_id, a.slot,
        count(*) AS answer_count,
        count(*) FILTER (WHERE a.is_correct) AS correct_count,
        sum(a.damage) AS total_damage,
        sum(a.response_seconds) AS total_response_seconds
    FROM match_answers AS a
    GROUP BY a.match_id, a.slot
)
SELECT
    m.id AS match_id,
    m.subject_id,
    m.season_no,
    p.slot,
    p.user_id,
    p.result,
    p.xp_awarded,
    p.rating_delta,
    coalesce(l.delta, 0) AS coins_awarded,
    v1_arena_initial_hp() AS max_hp,
    CASE
        WHEN m.finish_reason = 'FORFEIT' AND p.result = 'LOSE' THEN 0
        ELSE greatest(0, v1_arena_initial_hp() - coalesce(opponent.total_damage, 0))::int
    END AS hp,
    coalesce(a.answer_count, 0) AS answer_count,
    coalesce(a.correct_count, 0) AS correct_count,
    coalesce(a.total_damage, 0) AS total_damage,
    a.total_response_seconds
FROM match_players AS p
JOIN matches AS m ON m.id = p.match_id
LEFT JOIN answer_stats AS a ON a.match_id = p.match_id AND a.slot = p.slot
LEFT JOIN answer_stats AS opponent ON opponent.match_id = p.match_id AND opponent.slot = 3 - p.slot
LEFT JOIN coin_ledger AS l ON l.kind = 'MATCH_REWARD' AND l.match_id = p.match_id AND l.user_id = p.user_id;

CREATE OR REPLACE VIEW v_season_calendar AS
SELECT
    s.season_no,
    s.is_closed,
    v1_first_season_start()
        + interval '1 second' * ((s.season_no::bigint - 1) * v1_season_length_days() * 86400) AS starts_at,
    v1_first_season_start()
        + interval '1 second' * (s.season_no::bigint * v1_season_length_days() * 86400) AS ends_at
FROM seasons AS s;

CREATE OR REPLACE VIEW v_season_awards AS
WITH season_points AS (
    SELECT season_no, user_id, sum(points) AS points
    FROM rank_scores
    GROUP BY season_no, user_id
)
SELECT
    r.season_no,
    r.user_id,
    r.rank,
    coalesce(p.points, 0) AS points,
    coalesce(l.delta, 0) AS coins_awarded
FROM season_results AS r
LEFT JOIN season_points AS p ON p.season_no = r.season_no AND p.user_id = r.user_id
LEFT JOIN coin_ledger AS l ON l.kind = 'SEASON_REWARD' AND l.season_no = r.season_no AND l.user_id = r.user_id;

CREATE OR REPLACE VIEW v_coin_history AS
SELECT
    l.id,
    l.user_id,
    l.kind,
    l.delta,
    l.occurred_at,
    l.note,
    l.match_id,
    l.milestone_id,
    l.season_no,
    sum(l.delta) OVER (
        PARTITION BY l.user_id ORDER BY l.id ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS balance_after
FROM coin_ledger AS l;
