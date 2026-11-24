\set ON_ERROR_STOP on
BEGIN;
\ir schema/local_guard.sql
SET LOCAL search_path = app_v1, pg_catalog;
SET LOCAL client_min_messages = notice;

CREATE FUNCTION pg_temp.verify_true(test_name text, passed boolean) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
    IF passed IS DISTINCT FROM true THEN
        RAISE EXCEPTION 'FAIL %', test_name;
    END IF;
    RAISE NOTICE 'PASS %', test_name;
END;
$$;

-- Each expected error runs in its own subtransaction. Unexpected failures abort psql.
CREATE FUNCTION pg_temp.verify_error(test_name text, expected text, statement_text text) RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
    BEGIN
        EXECUTE statement_text;
    EXCEPTION WHEN OTHERS THEN
        IF SQLSTATE <> expected THEN
            RAISE EXCEPTION 'FAIL %: expected %, got % (%)', test_name, expected, SQLSTATE, SQLERRM;
        END IF;
        RAISE NOTICE 'PASS %', test_name;
        RETURN;
    END;
    RAISE EXCEPTION 'FAIL %: expected %, statement succeeded', test_name, expected;
END;
$$;

SELECT pg_temp.verify_true('schema matches 29 tables and 169 columns',
    (SELECT count(*) = 29 FROM information_schema.tables
     WHERE table_schema = 'app_v1' AND table_type = 'BASE TABLE')
    AND (SELECT count(*) = 169 FROM information_schema.columns AS col
         JOIN information_schema.tables AS tbl USING (table_schema, table_name)
         WHERE col.table_schema = 'app_v1' AND tbl.table_type = 'BASE TABLE'));
SELECT pg_temp.verify_true('only five physical triggers in the three approved groups',
    (SELECT count(*) = 5 FROM pg_catalog.pg_trigger AS t
     JOIN pg_catalog.pg_class AS c ON c.oid = t.tgrelid
     WHERE c.relnamespace = 'app_v1'::regnamespace AND NOT t.tgisinternal));
SELECT pg_temp.verify_true('no SECURITY DEFINER application function',
    NOT EXISTS (SELECT FROM pg_catalog.pg_proc
                WHERE pronamespace = 'app_v1'::regnamespace AND prosecdef));
SELECT pg_temp.verify_true('V1 constants',
    v1_season_length_days() = 56 AND v1_weekly_xp_limit() = 1500
    AND v1_arena_initial_hp() = 100 AND v1_arena_base_damage() = 12
    AND v1_arena_fast_bonus() = 3 AND v1_arena_fast_answer_seconds() = 5);

SET LOCAL ROLE thaptrithuc_v1_runtime;
INSERT INTO users (id, username, email, display_name, role, password_hash) VALUES
    ('f1150000000000000000000000000001', 'pg_v1_verify_1', 'pg_v1_verify_1@example.test', 'Test 1', 'LEARNER', 'fixture'),
    ('f1150000000000000000000000000002', 'pg_v1_verify_2', 'pg_v1_verify_2@example.test', 'Test 2', 'LEARNER', 'fixture'),
    ('f1150000000000000000000000000003', 'pg_v1_verify_3', 'pg_v1_verify_3@example.test', 'Test 3', 'LEARNER', 'fixture');
INSERT INTO user_settings (user_id, theme, sound_enabled)
    VALUES ('f1150000000000000000000000000001', 'LIGHT', true);
INSERT INTO user_pets VALUES ('f1150000000000000000000000000001', 'pet_sparky');
UPDATE users SET equipped_pet_id = 'pet_sparky' WHERE username = 'pg_v1_verify_1';
SELECT pg_temp.verify_true('create user, grant and equip Sparky',
    (SELECT equipped_pet_id = 'pet_sparky' FROM users WHERE username = 'pg_v1_verify_1'));
SELECT pg_temp.verify_error('equip unowned Pet', '23503',
    $$UPDATE users SET equipped_pet_id = 'pet_sparky' WHERE username = 'pg_v1_verify_2'$$);
SELECT pg_temp.verify_error('equip unowned accessory', '23503',
    $$UPDATE users SET equipped_accessory_id = 'sparky_witch_hat' WHERE username = 'pg_v1_verify_1'$$);
SELECT pg_temp.verify_error('duplicate Pet ownership', '23505',
    $$INSERT INTO user_pets VALUES ('f1150000000000000000000000000001', 'pet_sparky')$$);
SELECT pg_temp.verify_error('negative wallet', '23514',
    $$UPDATE users SET coin_balance = -1 WHERE username = 'pg_v1_verify_1'$$);
SELECT pg_temp.verify_error('negative XP', '23514',
    $$UPDATE users SET xp = -1 WHERE username = 'pg_v1_verify_1'$$);
SELECT pg_temp.verify_error('negative price', '23514',
    $$UPDATE pets SET price_coins = -1 WHERE id = 'pet_sparky'$$);
SELECT pg_temp.verify_error('runtime cannot change a protected users column', '42501',
    $$UPDATE users SET created_at = now() WHERE username = 'pg_v1_verify_1'$$);
SELECT pg_temp.verify_error('non-object settings JSON', '23514',
    $$UPDATE user_settings SET sound_config = '[]' WHERE user_id = 'f1150000000000000000000000000001'$$);

INSERT INTO subjects (id, slug, name, sort_order, status) VALUES
    ('f1150000000000000000000000000010', 'pg-v1-verify-subject', 'Fixture', 999, 'ACTIVE');
INSERT INTO chapters (id, subject_id, title, sort_order, status) VALUES
    ('f1150000000000000000000000000011', 'f1150000000000000000000000000010', 'Fixture', 1, 'ACTIVE');
INSERT INTO milestones (id, chapter_id, title, kind, status, sort_order, reward_xp, reward_coins,
                        step_count, questions_per_step, bloom_config)
VALUES ('f1150000000000000000000000000012', 'f1150000000000000000000000000011',
        'Fixture', 'QUIZ', 'ACTIVE', 1, 20, 10, 2, 4,
        '{"1":{"remember_pct":70,"understand_pct":30,"apply_pct":0}}');
INSERT INTO questions (id, milestone_id, type, bloom_level, step_no, difficulty, stem, status) VALUES
    ('f1150000000000000000000000000013', 'f1150000000000000000000000000012',
     'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, 'Fixture?', 'ACTIVE');
INSERT INTO question_options VALUES
    ('f1150000000000000000000000000013', 0, 'Correct', true),
    ('f1150000000000000000000000000013', 1, 'Wrong A', false),
    ('f1150000000000000000000000000013', 2, 'Wrong B', false),
    ('f1150000000000000000000000000013', 3, 'Wrong C', false);
SET CONSTRAINTS ALL IMMEDIATE;
SET CONSTRAINTS ALL DEFERRED;
SELECT pg_temp.verify_true('create course tree and valid four-option MCQ',
    (SELECT count(*) = 4 AND count(*) FILTER (WHERE is_correct) = 1
     FROM question_options WHERE question_id = 'f1150000000000000000000000000013'));

UPDATE questions SET step_no = 2, difficulty = 2 WHERE id = 'f1150000000000000000000000000013';
SELECT pg_temp.verify_true('runtime can update question step_no and difficulty',
    (SELECT step_no = 2 AND difficulty = 2 FROM questions WHERE id = 'f1150000000000000000000000000013'));
SELECT pg_temp.verify_error('runtime edit still respects question difficulty range', '23514',
    $$UPDATE questions SET difficulty = 4 WHERE id = 'f1150000000000000000000000000013'$$);
SELECT pg_temp.verify_error('runtime cannot edit question stem', '42501',
    $$UPDATE questions SET stem = 'new' WHERE id = 'f1150000000000000000000000000013'$$);
SELECT pg_temp.verify_error('runtime cannot edit question payload', '42501',
    $$UPDATE questions SET payload = '{}' WHERE id = 'f1150000000000000000000000000013'$$);
SELECT pg_temp.verify_error('runtime cannot edit option', '42501',
    $$UPDATE question_options SET text = 'new' WHERE question_id = 'f1150000000000000000000000000013'$$);
SELECT pg_temp.verify_error('runtime cannot delete option', '42501',
    $$DELETE FROM question_options WHERE question_id = 'f1150000000000000000000000000013'$$);
SELECT pg_temp.verify_error('runtime cannot move milestone to another chapter', '42501',
    $$UPDATE milestones SET chapter_id = chapter_id WHERE id = 'f1150000000000000000000000000012'$$);
SELECT pg_temp.verify_error('duplicate chapter order within subject', '23505',
    $$INSERT INTO chapters (subject_id, title, sort_order, status)
      VALUES ('f1150000000000000000000000000010', 'duplicate', 1, 'ACTIVE')$$);
SELECT pg_temp.verify_error('second correct MCQ option', '23505',
    $q$INSERT INTO questions (id, milestone_id, type, bloom_level, step_no, difficulty, stem, status)
       VALUES ('f1150000000000000000000000000014', 'f1150000000000000000000000000012',
               'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, 'Duplicate correct?', 'ACTIVE');
       INSERT INTO question_options VALUES ('f1150000000000000000000000000014', 0, 'A', true),
                                           ('f1150000000000000000000000000014', 1, 'B', true)$q$);
SELECT pg_temp.verify_error('MCQ with no options', '23514',
    $q$INSERT INTO questions (id, milestone_id, type, bloom_level, step_no, difficulty, stem, status)
       VALUES ('f1150000000000000000000000000014', 'f1150000000000000000000000000012',
               'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, 'No options?', 'ACTIVE');
       SET CONSTRAINTS ALL IMMEDIATE$q$);
SELECT pg_temp.verify_error('MCQ with all options wrong', '23514',
    $q$INSERT INTO questions (id, milestone_id, type, bloom_level, step_no, difficulty, stem, status)
       VALUES ('f1150000000000000000000000000014', 'f1150000000000000000000000000012',
               'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, 'All wrong?', 'ACTIVE');
       INSERT INTO question_options VALUES ('f1150000000000000000000000000014', 0, 'A', false);
       SET CONSTRAINTS ALL IMMEDIATE$q$);
SELECT pg_temp.verify_error('MCQ with JSON payload', '23514',
    $$INSERT INTO questions (milestone_id, type, bloom_level, step_no, difficulty, stem, status, payload)
      VALUES ('f1150000000000000000000000000012', 'MULTIPLE_CHOICE', 'REMEMBER', 1, 1, 'Bad?', 'ACTIVE', '{}')$$);
SELECT pg_temp.verify_error('Bloom missing a weight', '23514',
    $$UPDATE milestones SET bloom_config = '{"1":{"remember_pct":70,"understand_pct":30}}'
      WHERE id = 'f1150000000000000000000000000012'$$);
SELECT pg_temp.verify_error('Bloom sum different from 100', '23514',
    $$UPDATE milestones SET bloom_config = '{"1":{"remember_pct":70,"understand_pct":20,"apply_pct":0}}'
      WHERE id = 'f1150000000000000000000000000012'$$);
SELECT pg_temp.verify_error('Bloom step out of range', '23514',
    $$UPDATE milestones SET bloom_config = '{"3":{"remember_pct":70,"understand_pct":30,"apply_pct":0}}'
      WHERE id = 'f1150000000000000000000000000012'$$);
SELECT pg_temp.verify_error('Bloom string or fractional numbers', '23514',
    $$UPDATE milestones SET bloom_config = '{"1":{"remember_pct":"70","understand_pct":29.5,"apply_pct":0.5}}'
      WHERE id = 'f1150000000000000000000000000012'$$);

SELECT pg_temp.verify_error('Bloom override on a theory-only milestone', '23514',
    $$INSERT INTO milestones (chapter_id, title, kind, status, sort_order, reward_xp, reward_coins,
                              step_count, questions_per_step, bloom_config)
      VALUES ('f1150000000000000000000000000011', 'Theory', 'THEORY', 'ACTIVE', 2, 0, 0, 0, 0,
              '{"1":{"remember_pct":70,"understand_pct":30,"apply_pct":0}}')$$);

INSERT INTO enrollments (user_id, subject_id, enrolled_at)
    VALUES ('f1150000000000000000000000000001', 'f1150000000000000000000000000010', '2026-11-09 03:00:00+00');
INSERT INTO milestone_progress (user_id, milestone_id, current_step, xp_earned)
    VALUES ('f1150000000000000000000000000001', 'f1150000000000000000000000000012', 1, 0);
INSERT INTO study_sessions (id, user_id, kind, milestone_id, step_no) VALUES
    ('f1150000000000000000000000000020', 'f1150000000000000000000000000001', 'STEP',
        'f1150000000000000000000000000012', 1);
INSERT INTO study_sessions (id, user_id, kind, subject_id, started_at) VALUES
    ('f1150000000000000000000000000021', 'f1150000000000000000000000000001', 'EXTREME',
        'f1150000000000000000000000000010', '2026-11-24 01:00:00+00');
SELECT pg_temp.verify_true('milestone session and subject-scoped EXTREME session',
    (SELECT count(*) = 2 FROM study_sessions WHERE user_id = 'f1150000000000000000000000000001'));
SELECT pg_temp.verify_error('session with both scopes', '23514',
    $$INSERT INTO study_sessions (id, user_id, kind, milestone_id, subject_id, step_no)
      VALUES ('f1150000000000000000000000000022', 'f1150000000000000000000000000001', 'STEP',
              'f1150000000000000000000000000012', 'f1150000000000000000000000000010', 1)$$);
SELECT pg_temp.verify_error('session without a scope', '23514',
    $$INSERT INTO study_sessions (id, user_id, kind)
      VALUES ('f1150000000000000000000000000022', 'f1150000000000000000000000000001', 'MILESTONE')$$);
INSERT INTO study_session_questions VALUES
    ('f1150000000000000000000000000020', 1, 'f1150000000000000000000000000013');
INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, seconds,
                             selected_option_position, submitted_text, response) VALUES
    ('f1150000000000000000000000000020', 1, 1, false, 8, 1, NULL, NULL),
    ('f1150000000000000000000000000020', 2, 1, true, 4, 0, NULL, NULL),
    ('f1150000000000000000000000000020', 3, 1, false, NULL, NULL, 'Fixture text', NULL),
    ('f1150000000000000000000000000020', 4, 1, false, NULL, NULL, NULL, '{"kind":"TIMEOUT"}'),
    ('f1150000000000000000000000000020', 5, 1, false, NULL, NULL, NULL, '{"kind":"ORDERING","tokens":["A","B"]}'),
    ('f1150000000000000000000000000020', 6, 1, true, NULL, NULL, NULL, '{"kind":"MATCHING","pairs":[{"left":"A","right":"B"}]}');
INSERT INTO session_answer_lookups VALUES
    ('f1150000000000000000000000000020', 1, 1, '2026-11-24 01:00:00+00', 3, 2, 'BEFORE_ANSWER');
SELECT pg_temp.verify_true('distinct attempts, structured response shapes and lookup count',
    (SELECT answer_count = 6 AND correct_count = 2 AND total_lookups = 1 AND average_seconds = 6
     FROM v_study_session_stats WHERE session_id = 'f1150000000000000000000000000020'));
SELECT pg_temp.verify_error('answer for an unassigned question', '23503',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, selected_option_position)
      VALUES ('f1150000000000000000000000000020', 10, 2, false, 0)$$);
SELECT pg_temp.verify_error('answer without a response shape', '23514',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct)
      VALUES ('f1150000000000000000000000000020', 10, 1, false)$$);
SELECT pg_temp.verify_error('answer with two response shapes', '23514',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, selected_option_position, submitted_text)
      VALUES ('f1150000000000000000000000000020', 10, 1, false, 0, 'duplicate')$$);
SELECT pg_temp.verify_error('answer with JSON null', '23514',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, response)
      VALUES ('f1150000000000000000000000000020', 10, 1, false, 'null')$$);
SELECT pg_temp.verify_error('answer with missing kind', '23514',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, response)
      VALUES ('f1150000000000000000000000000020', 10, 1, false, '{"tokens":["X"]}')$$);
SELECT pg_temp.verify_error('answer with non-string token', '23514',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, response)
      VALUES ('f1150000000000000000000000000020', 10, 1, false, '{"kind":"ORDERING","tokens":[1]}')$$);
SELECT pg_temp.verify_error('timeout marked correct', '23514',
    $$INSERT INTO session_answers (session_id, attempt_no, question_position, is_correct, response)
      VALUES ('f1150000000000000000000000000020', 10, 1, true, '{"kind":"TIMEOUT"}')$$);

-- Exercise role grants separately from foreign keys and ledger triggers.
RESET ROLE;
SELECT pg_temp.verify_error('referenced question cannot be hard-deleted', '23503',
    $$DELETE FROM questions WHERE id = 'f1150000000000000000000000000013'$$);
SELECT pg_temp.verify_error('referenced subject cannot be hard-deleted', '23503',
    $$DELETE FROM subjects WHERE id = 'f1150000000000000000000000000010'$$);
INSERT INTO quests VALUES ('PG_V1_VERIFY_QUEST', 12, 0);
SELECT pg_temp.verify_true('new quest code accepted by catalog',
    EXISTS (SELECT FROM quests WHERE code = 'PG_V1_VERIFY_QUEST'));
SET LOCAL ROLE thaptrithuc_v1_runtime;
INSERT INTO quest_claims (user_id, quest_code, vn_date)
SELECT 'f1150000000000000000000000000001', 'STUDY', (instant AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
FROM (VALUES (timestamptz '2026-11-24 16:59:59+00'), (timestamptz '2026-11-24 17:00:00+00')) AS boundary(instant);
SELECT pg_temp.verify_true('quest dates straddle midnight in Viet Nam',
    (SELECT array_agg(vn_date ORDER BY vn_date) = ARRAY[date '2026-11-24', date '2026-11-25']
     FROM quest_claims WHERE user_id = 'f1150000000000000000000000000001'));
SELECT pg_temp.verify_error('duplicate quest claim on one VN date', '23505',
    $$INSERT INTO quest_claims VALUES ('f1150000000000000000000000000001', 'STUDY', '2026-11-24')$$);
SELECT pg_temp.verify_error('quest claim for unknown catalog code', '23503',
    $$INSERT INTO quest_claims VALUES ('f1150000000000000000000000000001', 'PG_V1_UNKNOWN_QUEST', '2026-11-24')$$);
INSERT INTO weekly_xp_usage VALUES ('f1150000000000000000000000000001', '2026-11-23', 1500);
SELECT pg_temp.verify_error('weekly XP quota exceeded', '23514',
    $$UPDATE weekly_xp_usage SET xp = 1501 WHERE user_id = 'f1150000000000000000000000000001'$$);
SELECT pg_temp.verify_error('weekly XP date is not Monday', '23514',
    $$INSERT INTO weekly_xp_usage VALUES ('f1150000000000000000000000000001', '2026-11-24', 1)$$);

INSERT INTO matches (id, subject_id, mode, status, started_at) VALUES
    ('f1150000000000000000000000000030', 'f1150000000000000000000000000010', 'CASUAL', 'ACTIVE', '2026-11-24 02:00:00+00');
INSERT INTO match_players (match_id, slot, user_id, xp_awarded, rating_delta) VALUES
    ('f1150000000000000000000000000030', 1, 'f1150000000000000000000000000001', 0, 0),
    ('f1150000000000000000000000000030', 2, 'f1150000000000000000000000000002', 0, 0);
SET CONSTRAINTS ALL IMMEDIATE;
SET CONSTRAINTS ALL DEFERRED;
SELECT pg_temp.verify_error('match with zero players', '23514',
    $q$INSERT INTO matches (id, subject_id, mode, status, started_at)
       VALUES ('f1150000000000000000000000000031', 'f1150000000000000000000000000010', 'CASUAL', 'ACTIVE', now());
       SET CONSTRAINTS ALL IMMEDIATE$q$);
SELECT pg_temp.verify_error('match with one player', '23514',
    $q$INSERT INTO matches (id, subject_id, mode, status, started_at)
       VALUES ('f1150000000000000000000000000031', 'f1150000000000000000000000000010', 'CASUAL', 'ACTIVE', now());
       INSERT INTO match_players (match_id, slot, user_id, xp_awarded, rating_delta)
       VALUES ('f1150000000000000000000000000031', 1, 'f1150000000000000000000000000003', 0, 0);
       SET CONSTRAINTS ALL IMMEDIATE$q$);
SELECT pg_temp.verify_error('third player', '23514',
    $$INSERT INTO match_players (match_id, slot, user_id, xp_awarded, rating_delta)
      VALUES ('f1150000000000000000000000000030', 3, 'f1150000000000000000000000000003', 0, 0)$$);
RESET ROLE;
SELECT pg_temp.verify_error('deleting a player leaves one player', '23514',
    $q$DELETE FROM match_players WHERE match_id = 'f1150000000000000000000000000030' AND slot = 2;
       SET CONSTRAINTS ALL IMMEDIATE$q$);
SET LOCAL ROLE thaptrithuc_v1_runtime;

INSERT INTO match_rounds VALUES
    ('f1150000000000000000000000000030', 1, 'f1150000000000000000000000000013');
INSERT INTO matches (id, subject_id, mode, status, started_at) VALUES
    ('f1150000000000000000000000000032', 'f1150000000000000000000000000010', 'CASUAL', 'ACTIVE', '2026-11-24 02:00:00+00');
INSERT INTO match_players (match_id, slot, user_id) VALUES
    ('f1150000000000000000000000000032', 1, 'f1150000000000000000000000000001'),
    ('f1150000000000000000000000000032', 2, 'f1150000000000000000000000000003');
INSERT INTO match_rounds VALUES
    ('f1150000000000000000000000000032', 2, 'f1150000000000000000000000000013');
SELECT pg_temp.verify_error('existing slot cannot answer a round from another existing match', '23503',
    $$INSERT INTO match_answers
      VALUES ('f1150000000000000000000000000032', 1, 1, true, 4, 15, now())$$);
SELECT pg_temp.verify_error('negative damage', '23514',
    $$INSERT INTO match_answers
      VALUES ('f1150000000000000000000000000030', 1, 1, false, 4, -1, now())$$);
INSERT INTO match_answers VALUES
    ('f1150000000000000000000000000030', 1, 1, true, 4, 15, '2026-11-24 02:00:04+00'),
    ('f1150000000000000000000000000030', 1, 2, false, 6, 0, '2026-11-24 02:00:06+00');
UPDATE matches SET status = 'FINISHED', finished_at = '2026-11-24 02:00:06+00', finish_reason = 'TIMEOUT'
    WHERE id = 'f1150000000000000000000000000030';
UPDATE match_players SET result = 'WIN' WHERE match_id = 'f1150000000000000000000000000030' AND slot = 1;
SELECT pg_temp.verify_error('second winner in the same match', '23505',
    $$UPDATE match_players SET result = 'WIN' WHERE match_id = 'f1150000000000000000000000000030' AND slot = 2$$);
UPDATE match_players SET result = 'LOSE' WHERE match_id = 'f1150000000000000000000000000030' AND slot = 2;
SELECT pg_temp.verify_true('two-player match, round, answers, outcome and derived HP',
    (SELECT count(*) = 2 AND min(hp) = 85 AND max(hp) = 100 AND sum(total_damage) = 15
     FROM v_match_player_stats WHERE match_id = 'f1150000000000000000000000000030'));

-- Simulate enough accumulated damage to exercise the view's zero floor.
INSERT INTO match_answers VALUES
    ('f1150000000000000000000000000032', 2, 1, true, 4, 105, '2026-11-24 02:00:04+00');
SELECT pg_temp.verify_true('derived HP has a zero floor',
    (SELECT hp = 0 FROM v_match_player_stats
     WHERE match_id = 'f1150000000000000000000000000032' AND slot = 2));
SELECT pg_temp.verify_error('derived HP cannot be assigned', '55000',
    $$UPDATE v_match_player_stats SET hp = -1 WHERE match_id = 'f1150000000000000000000000000032'$$);

INSERT INTO rank_scores (user_id, subject_id, season_no, points)
    VALUES ('f1150000000000000000000000000001', 'f1150000000000000000000000000010', 1, 300);
SELECT pg_temp.verify_error('duplicate rating per user, subject and season', '23505',
    $$INSERT INTO rank_scores (user_id, subject_id, season_no, points)
      VALUES ('f1150000000000000000000000000001', 'f1150000000000000000000000000010', 1, 300)$$);
SELECT pg_temp.verify_error('negative rank points', '23514',
    $$UPDATE rank_scores SET points = -1 WHERE user_id = 'f1150000000000000000000000000001'$$);
SELECT pg_temp.verify_error('second open season', '23505', $$INSERT INTO seasons VALUES (999, false)$$);
SELECT pg_temp.verify_true('season is 56 days from the VN anchor',
    (SELECT starts_at = timestamptz '2026-11-09 00:00:00+07'
        AND ends_at - starts_at = interval '56 days' FROM v_season_calendar WHERE season_no = 1));

-- Lock the wallet before touching its ledger. Keep each linked write in the same transaction.
SELECT id FROM users WHERE id = 'f1150000000000000000000000000001' FOR UPDATE \gset
INSERT INTO coin_ledger (user_id, kind, delta, occurred_at)
    VALUES ('f1150000000000000000000000000001', 'DAILY_QUEST_REWARD', 15, '2026-11-24 16:59:59+00');
UPDATE users SET coin_balance = coin_balance + 15 WHERE id = 'f1150000000000000000000000000001';
INSERT INTO coin_ledger (user_id, kind, delta, occurred_at, match_id)
    VALUES ('f1150000000000000000000000000001', 'MATCH_REWARD', 200, '2026-11-24 17:00:00+00',
            'f1150000000000000000000000000030');
UPDATE users SET coin_balance = coin_balance + 200 WHERE id = 'f1150000000000000000000000000001';
SELECT pg_temp.verify_error('cannot pay the same match reward twice', '23505',
    $$INSERT INTO coin_ledger (user_id, kind, delta, occurred_at, match_id)
      VALUES ('f1150000000000000000000000000001', 'MATCH_REWARD', 200, now(), 'f1150000000000000000000000000030')$$);
WITH catalog AS (SELECT id, price_coins FROM pets WHERE id = 'pet_kitsune')
INSERT INTO coin_ledger (user_id, kind, delta, occurred_at)
SELECT 'f1150000000000000000000000000001', 'PET_PURCHASE', -price_coins, '2026-11-24 17:05:00+00' FROM catalog;
INSERT INTO user_pets VALUES ('f1150000000000000000000000000001', 'pet_kitsune');
UPDATE users SET coin_balance = coin_balance - (SELECT price_coins FROM pets WHERE id = 'pet_kitsune')
    WHERE id = 'f1150000000000000000000000000001';
SELECT pg_temp.verify_true('reward and purchase update wallet and ledger',
    (SELECT coin_balance = 215 - (SELECT price_coins FROM pets WHERE id = 'pet_kitsune')
     FROM users WHERE id = 'f1150000000000000000000000000001')
    AND (SELECT count(*) = 3 FROM coin_ledger WHERE user_id = 'f1150000000000000000000000000001'));

SAVEPOINT tentative_adjustment;
INSERT INTO coin_ledger (user_id, kind, delta, occurred_at)
    VALUES ('f1150000000000000000000000000001', 'ADMIN_ADJUSTMENT', 7, '2026-11-24 17:10:00+00');
UPDATE users SET coin_balance = coin_balance + 7 WHERE id = 'f1150000000000000000000000000001';
ROLLBACK TO SAVEPOINT tentative_adjustment;
RELEASE SAVEPOINT tentative_adjustment;
SELECT pg_temp.verify_error('failure after ledger INSERT rolls back both wallet changes', '23514',
    $q$INSERT INTO coin_ledger (user_id, kind, delta, occurred_at)
           VALUES ('f1150000000000000000000000000001', 'PET_PURCHASE', -10000, now());
       UPDATE users SET coin_balance = coin_balance - 10000 WHERE id = 'f1150000000000000000000000000001'$q$);
SELECT pg_temp.verify_true('no tentative, failed or duplicate ledger rows survive',
    (SELECT count(*) = 3 AND sum(delta) = 215 - (SELECT price_coins FROM pets WHERE id = 'pet_kitsune')
     FROM coin_ledger WHERE user_id = 'f1150000000000000000000000000001'));

SELECT pg_temp.verify_error('runtime cannot UPDATE ledger', '42501', $$UPDATE coin_ledger SET delta = delta$$);
SELECT pg_temp.verify_error('runtime cannot DELETE ledger', '42501', $$DELETE FROM coin_ledger$$);
SELECT pg_temp.verify_error('runtime cannot TRUNCATE ledger', '42501', $$TRUNCATE coin_ledger$$);
RESET ROLE;
SELECT pg_temp.verify_error('ledger trigger blocks UPDATE even with permission', '55000',
    $$UPDATE coin_ledger SET delta = delta WHERE user_id = 'f1150000000000000000000000000001'$$);
SELECT pg_temp.verify_error('ledger trigger blocks DELETE even with permission', '55000',
    $$DELETE FROM coin_ledger WHERE user_id = 'f1150000000000000000000000000001'$$);

SET CONSTRAINTS ALL IMMEDIATE;
-- Reconcile every user after reward, purchase and rollback, including zero-ledger users.
DO $reconcile$
DECLARE
    mismatches bigint;
BEGIN
    SELECT count(*) INTO mismatches
    FROM users AS u
    LEFT JOIN (
        SELECT user_id, sum(delta) AS ledger_balance
        FROM coin_ledger GROUP BY user_id
    ) AS l ON l.user_id = u.id
    WHERE u.coin_balance IS DISTINCT FROM COALESCE(l.ledger_balance, 0);

    PERFORM pg_temp.verify_true(format('wallet reconciliation for all users (%s mismatches)', mismatches),
                               mismatches = 0);
END;
$reconcile$;
ROLLBACK;

-- The outer rollback removes every fixture and the temporary verification functions.
BEGIN;
\ir schema/local_guard.sql
SET LOCAL search_path = app_v1, pg_catalog;
DO $cleanup$
BEGIN
    IF EXISTS (SELECT FROM users WHERE id IN (
        'f1150000000000000000000000000001', 'f1150000000000000000000000000002', 'f1150000000000000000000000000003'))
        OR EXISTS (SELECT FROM subjects WHERE id = 'f1150000000000000000000000000010')
        OR EXISTS (SELECT FROM quests WHERE code = 'PG_V1_VERIFY_QUEST')
        OR EXISTS (SELECT FROM matches WHERE id = 'f1150000000000000000000000000030')
        OR EXISTS (SELECT FROM seasons WHERE season_no = 999)
    THEN
        RAISE EXCEPTION 'FAIL fixture rollback: test rows remain';
    END IF;
    RAISE NOTICE 'PASS fixture rollback (0 fixture rows)';
END;
$cleanup$;
ROLLBACK;
