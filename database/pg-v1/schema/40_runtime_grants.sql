REVOKE ALL ON ALL TABLES IN SCHEMA app_v1 FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA app_v1 FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA app_v1 FROM PUBLIC;

GRANT USAGE ON SCHEMA app_v1 TO thaptrithuc_v1_runtime;
GRANT SELECT ON ALL TABLES IN SCHEMA app_v1 TO thaptrithuc_v1_runtime;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_v1 TO thaptrithuc_v1_runtime;

GRANT INSERT (id, username, email, display_name, role, password_hash, google_sub, google_verified_email)
    ON users TO thaptrithuc_v1_runtime;
GRANT UPDATE (username, email, display_name, role, password_hash, google_sub, google_verified_email,
    session_version, disabled_at, xp, coin_balance, streak_days, last_active_date, equipped_pet_id,
    equipped_accessory_id) ON users TO thaptrithuc_v1_runtime;
GRANT INSERT ON user_settings TO thaptrithuc_v1_runtime;
GRANT UPDATE (theme, sound_enabled, sound_config, tutorial_progress)
    ON user_settings TO thaptrithuc_v1_runtime;
GRANT INSERT, DELETE ON password_resets TO thaptrithuc_v1_runtime;
GRANT UPDATE (google_sub, code_hash, expires_at, attempts)
    ON password_resets TO thaptrithuc_v1_runtime;
GRANT INSERT ON pets, accessories, user_pets, user_accessories TO thaptrithuc_v1_runtime;
GRANT UPDATE (name, description, image_path, price_coins, minimum_level, required_role, status)
    ON pets TO thaptrithuc_v1_runtime;
GRANT UPDATE (name, description, price_coins, minimum_level, status)
    ON accessories TO thaptrithuc_v1_runtime;

GRANT INSERT ON subjects, chapters, milestones, questions, question_options TO thaptrithuc_v1_runtime;
GRANT UPDATE (slug, name, description, sort_order, status) ON subjects TO thaptrithuc_v1_runtime;
GRANT UPDATE (title, sort_order, status) ON chapters TO thaptrithuc_v1_runtime;
GRANT UPDATE (title, kind, theory_markdown, status, sort_order, reward_xp, reward_coins, step_count,
    questions_per_step, bloom_config) ON milestones TO thaptrithuc_v1_runtime;
GRANT UPDATE (status, step_no, difficulty) ON questions TO thaptrithuc_v1_runtime;

GRANT INSERT ON enrollments, milestone_progress, study_sessions, study_session_questions,
    session_answers, session_answer_lookups TO thaptrithuc_v1_runtime;
GRANT UPDATE (current_step, xp_earned, completed_at, memory)
    ON milestone_progress TO thaptrithuc_v1_runtime;
GRANT UPDATE (finished_at, finish_kind) ON study_sessions TO thaptrithuc_v1_runtime;

GRANT INSERT ON quest_claims, weekly_xp_usage TO thaptrithuc_v1_runtime;
GRANT UPDATE (xp) ON weekly_xp_usage TO thaptrithuc_v1_runtime;
GRANT INSERT (user_id, kind, delta, occurred_at, note, match_id, milestone_id, season_no)
    ON coin_ledger TO thaptrithuc_v1_runtime;

GRANT INSERT ON seasons, rank_scores, season_results, matches, match_players, match_rounds,
    match_answers TO thaptrithuc_v1_runtime;
GRANT UPDATE (is_closed) ON seasons TO thaptrithuc_v1_runtime;
GRANT UPDATE (points) ON rank_scores TO thaptrithuc_v1_runtime;
GRANT UPDATE (season_no, status, finished_at, finish_reason) ON matches TO thaptrithuc_v1_runtime;
GRANT UPDATE (result, xp_awarded, rating_delta) ON match_players TO thaptrithuc_v1_runtime;
