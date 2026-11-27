CREATE TABLE app_v1.quests (
    code text PRIMARY KEY,
    reward_coins integer NOT NULL,
    reward_xp integer NOT NULL,
    CONSTRAINT quests_code_not_blank CHECK (btrim(code) <> ''),
    CONSTRAINT quests_rewards_nonnegative CHECK (reward_coins >= 0 AND reward_xp >= 0)
);

CREATE TABLE app_v1.quest_claims (
    user_id uuid NOT NULL REFERENCES app_v1.users (id) ON DELETE RESTRICT,
    quest_code text NOT NULL REFERENCES app_v1.quests (code) ON DELETE RESTRICT,
    vn_date date NOT NULL,
    PRIMARY KEY (user_id, quest_code, vn_date)
);

CREATE INDEX quest_claims_date_code_idx ON app_v1.quest_claims (vn_date, quest_code);
CREATE INDEX quest_claims_code_idx ON app_v1.quest_claims (quest_code);

CREATE TABLE app_v1.weekly_xp_usage (
    user_id uuid NOT NULL REFERENCES app_v1.users (id) ON DELETE RESTRICT,
    week_start date NOT NULL,
    xp integer NOT NULL,
    PRIMARY KEY (user_id, week_start),
    CONSTRAINT weekly_xp_usage_monday CHECK (
        isfinite(week_start) AND extract(isodow FROM week_start) = 1
    ),
    CONSTRAINT weekly_xp_usage_quota CHECK (xp BETWEEN 0 AND app_v1.v1_weekly_xp_limit())
);

CREATE TABLE app_v1.seasons (
    season_no integer PRIMARY KEY,
    is_closed boolean NOT NULL DEFAULT false,
    CONSTRAINT seasons_number_positive CHECK (season_no >= 1)
);

CREATE UNIQUE INDEX seasons_only_one_open ON app_v1.seasons ((1)) WHERE NOT is_closed;

CREATE TABLE app_v1.rank_scores (
    user_id uuid NOT NULL REFERENCES app_v1.users (id) ON DELETE RESTRICT,
    subject_id uuid NOT NULL REFERENCES app_v1.subjects (id) ON DELETE RESTRICT,
    season_no integer NOT NULL REFERENCES app_v1.seasons (season_no) ON DELETE RESTRICT,
    points integer NOT NULL,
    PRIMARY KEY (user_id, subject_id, season_no),
    CONSTRAINT rank_scores_points_nonnegative CHECK (points >= 0)
);

CREATE INDEX rank_scores_season_subject_points_idx
    ON app_v1.rank_scores (season_no, subject_id, points DESC);
CREATE INDEX rank_scores_season_user_idx ON app_v1.rank_scores (season_no, user_id);

CREATE TABLE app_v1.season_results (
    season_no integer NOT NULL REFERENCES app_v1.seasons (season_no) ON DELETE RESTRICT,
    user_id uuid NOT NULL REFERENCES app_v1.users (id) ON DELETE RESTRICT,
    rank integer NOT NULL,
    PRIMARY KEY (season_no, user_id),
    CONSTRAINT season_results_rank_positive CHECK (rank >= 1)
);

CREATE INDEX season_results_season_rank_idx ON app_v1.season_results (season_no, rank);
CREATE INDEX season_results_user_season_idx ON app_v1.season_results (user_id, season_no DESC);

CREATE TABLE app_v1.matches (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id uuid NOT NULL REFERENCES app_v1.subjects (id) ON DELETE RESTRICT,
    season_no integer REFERENCES app_v1.seasons (season_no) ON DELETE RESTRICT,
    mode text NOT NULL,
    status text NOT NULL,
    started_at timestamptz NOT NULL,
    finished_at timestamptz,
    finish_reason text,
    CONSTRAINT matches_mode_valid CHECK (mode IN ('RANKED', 'CASUAL', 'PRACTICE')),
    CONSTRAINT matches_finish_consistent CHECK (
        CASE status
            WHEN 'ACTIVE' THEN finished_at IS NULL AND finish_reason IS NULL
            WHEN 'FINISHED' THEN finished_at IS NOT NULL AND finish_reason IS NOT NULL
                AND finish_reason IN ('KNOCKOUT', 'FORFEIT', 'TIMEOUT', 'DRAW')
            WHEN 'CANCELLED' THEN finished_at IS NOT NULL
                AND finish_reason IS NOT DISTINCT FROM 'CANCELLED'
            ELSE false
        END
    ),
    CONSTRAINT matches_times_ordered CHECK (finished_at IS NULL OR finished_at >= started_at),
    CONSTRAINT matches_season_consistent CHECK (
        (season_no IS NOT NULL) = (mode = 'RANKED' AND status = 'FINISHED')
    )
);

CREATE INDEX matches_season_subject_finish_idx
    ON app_v1.matches (season_no, subject_id, finished_at);
CREATE INDEX matches_status_finish_idx ON app_v1.matches (status, finished_at);

CREATE TABLE app_v1.match_players (
    match_id uuid NOT NULL REFERENCES app_v1.matches (id) ON DELETE RESTRICT,
    slot smallint NOT NULL,
    user_id uuid NOT NULL REFERENCES app_v1.users (id) ON DELETE RESTRICT,
    result text,
    xp_awarded integer NOT NULL DEFAULT 0,
    rating_delta integer NOT NULL DEFAULT 0,
    PRIMARY KEY (match_id, slot),
    UNIQUE (match_id, user_id),
    CONSTRAINT match_players_slot_valid CHECK (slot IN (1, 2)),
    CONSTRAINT match_players_result_valid CHECK (result IN ('WIN', 'LOSE', 'DRAW')),
    CONSTRAINT match_players_xp_nonnegative CHECK (xp_awarded >= 0),
    CONSTRAINT match_players_no_awards_before_result CHECK (
        result IS NOT NULL OR (xp_awarded = 0 AND rating_delta = 0)
    )
);

CREATE UNIQUE INDEX match_players_only_one_winner ON app_v1.match_players (match_id)
    WHERE result = 'WIN';
CREATE INDEX match_players_user_match_idx ON app_v1.match_players (user_id, match_id);

CREATE FUNCTION app_v1.check_match_player_count() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, app_v1
AS $$
DECLARE
    affected_matches uuid[];
    affected_match uuid;
BEGIN
    IF TG_TABLE_NAME = 'matches' THEN
        affected_matches := ARRAY[NEW.id];
    ELSIF TG_OP = 'INSERT' THEN
        affected_matches := ARRAY[NEW.match_id];
    ELSIF TG_OP = 'DELETE' THEN
        affected_matches := ARRAY[OLD.match_id];
    ELSIF OLD.match_id = NEW.match_id THEN
        affected_matches := ARRAY[NEW.match_id];
    ELSE
        affected_matches := ARRAY[OLD.match_id, NEW.match_id];
    END IF;

    FOREACH affected_match IN ARRAY affected_matches LOOP
        IF EXISTS (SELECT 1 FROM app_v1.matches WHERE id = affected_match)
            AND (SELECT count(*) FROM app_v1.match_players WHERE match_id = affected_match) <> 2
        THEN
            RAISE EXCEPTION 'Match % must have exactly two players', affected_match
                USING ERRCODE = '23514', CONSTRAINT = 'matches_require_two_players';
        END IF;
    END LOOP;

    RETURN NULL;
END;
$$;

-- Validate the final state of both new matches and changes to their slots.
CREATE CONSTRAINT TRIGGER matches_require_two_players
    AFTER INSERT OR UPDATE ON app_v1.matches
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION app_v1.check_match_player_count();

CREATE CONSTRAINT TRIGGER match_players_require_two_players
    AFTER INSERT OR UPDATE OR DELETE ON app_v1.match_players
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW EXECUTE FUNCTION app_v1.check_match_player_count();

CREATE TABLE app_v1.match_rounds (
    match_id uuid NOT NULL REFERENCES app_v1.matches (id) ON DELETE RESTRICT,
    round_no smallint NOT NULL,
    question_id uuid NOT NULL REFERENCES app_v1.questions (id) ON DELETE RESTRICT,
    PRIMARY KEY (match_id, round_no),
    UNIQUE (match_id, question_id),
    CONSTRAINT match_rounds_number_valid CHECK (round_no BETWEEN 1 AND 10)
);

CREATE INDEX match_rounds_question_idx ON app_v1.match_rounds (question_id);

CREATE TABLE app_v1.match_answers (
    match_id uuid NOT NULL,
    round_no smallint NOT NULL,
    slot smallint NOT NULL,
    is_correct boolean NOT NULL,
    response_seconds numeric(10, 3) NOT NULL,
    damage integer NOT NULL,
    answered_at timestamptz NOT NULL,
    PRIMARY KEY (match_id, round_no, slot),
    CONSTRAINT match_answers_round_fk FOREIGN KEY (match_id, round_no)
        REFERENCES app_v1.match_rounds (match_id, round_no) ON DELETE RESTRICT,
    CONSTRAINT match_answers_player_fk FOREIGN KEY (match_id, slot)
        REFERENCES app_v1.match_players (match_id, slot) ON DELETE RESTRICT,
    CONSTRAINT match_answers_response_time_valid CHECK (
        response_seconds >= 0 AND response_seconds <> 'NaN'::numeric
    ),
    CONSTRAINT match_answers_damage_valid CHECK (damage >= 0 AND (is_correct OR damage = 0))
);

CREATE INDEX match_answers_player_round_idx ON app_v1.match_answers (match_id, slot, round_no);

CREATE TABLE app_v1.coin_ledger (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES app_v1.users (id) ON DELETE RESTRICT,
    kind text NOT NULL,
    delta integer NOT NULL,
    occurred_at timestamptz NOT NULL,
    note text,
    match_id uuid,
    milestone_id uuid REFERENCES app_v1.milestones (id) ON DELETE RESTRICT,
    season_no integer,
    CONSTRAINT coin_ledger_match_player_fk FOREIGN KEY (match_id, user_id)
        REFERENCES app_v1.match_players (match_id, user_id) ON DELETE RESTRICT,
    CONSTRAINT coin_ledger_season_result_fk FOREIGN KEY (season_no, user_id)
        REFERENCES app_v1.season_results (season_no, user_id) ON DELETE RESTRICT,
    CONSTRAINT coin_ledger_amount_matches_kind CHECK (
        CASE
            WHEN kind IN (
                'STREAK_REWARD', 'MILESTONE_REWARD', 'MATCH_REWARD', 'EXTREME_REWARD',
                'DAILY_QUEST_REWARD', 'ONBOARDING_REWARD', 'SEASON_REWARD', 'TOUR_REWARD'
            ) THEN delta > 0
            WHEN kind IN ('PET_PURCHASE', 'ACCESSORY_PURCHASE', 'PET_FEED') THEN delta < 0
            WHEN kind = 'PET_STROKE' THEN delta = 0
            WHEN kind = 'ADMIN_ADJUSTMENT' THEN delta <> 0
            ELSE false
        END
    ),
    CONSTRAINT coin_ledger_references_match_kind CHECK (
        (match_id IS NOT NULL) = (kind = 'MATCH_REWARD')
        AND (season_no IS NOT NULL) = (kind = 'SEASON_REWARD')
        AND (milestone_id IS NOT NULL) = (kind = 'MILESTONE_REWARD')
    )
);

CREATE INDEX coin_ledger_user_time_idx
    ON app_v1.coin_ledger (user_id, occurred_at DESC, id DESC);
-- The reference CHECK makes each non-NULL predicate equivalent to the reward kind.
CREATE UNIQUE INDEX coin_ledger_one_match_reward
    ON app_v1.coin_ledger (match_id, user_id) WHERE match_id IS NOT NULL;
CREATE UNIQUE INDEX coin_ledger_one_season_reward
    ON app_v1.coin_ledger (season_no, user_id) WHERE season_no IS NOT NULL;
CREATE INDEX coin_ledger_milestone_user_idx
    ON app_v1.coin_ledger (milestone_id, user_id) WHERE milestone_id IS NOT NULL;
CREATE UNIQUE INDEX coin_ledger_one_onboarding_reward
    ON app_v1.coin_ledger (user_id) WHERE kind = 'ONBOARDING_REWARD';

CREATE UNIQUE INDEX coin_ledger_one_tour_reward
    ON app_v1.coin_ledger (user_id) WHERE kind = 'TOUR_REWARD';

CREATE FUNCTION app_v1.prevent_coin_ledger_changes() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    RAISE EXCEPTION 'Coin ledger is append-only'
        USING ERRCODE = '55000', TABLE = 'coin_ledger';
END;
$$;

CREATE TRIGGER coin_ledger_append_only
    BEFORE UPDATE OR DELETE ON app_v1.coin_ledger
    FOR EACH STATEMENT EXECUTE FUNCTION app_v1.prevent_coin_ledger_changes();
