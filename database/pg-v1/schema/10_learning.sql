-- Accounts, catalog, curriculum, and study history. Included by 001_schema.sql.

CREATE FUNCTION valid_sound_config(config jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    IF jsonb_typeof(config) <> 'object' THEN
        RETURN false;
    END IF;

    RETURN NOT EXISTS (
        SELECT 1
        FROM jsonb_each(config) AS channel(name, enabled)
        WHERE name NOT IN ('quiz', 'reward', 'battle', 'outcome', 'bgm')
           OR jsonb_typeof(enabled) <> 'boolean'
    );
END;
$$;

CREATE FUNCTION valid_tutorial_progress(progress jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    IF jsonb_typeof(progress) <> 'object' THEN
        RETURN false;
    END IF;

    RETURN COALESCE(
        progress - ARRAY['version', 'step', 'layout', 'completed', 'context'] = '{}'::jsonb
        AND jsonb_typeof(progress -> 'step') = 'string'
        AND char_length(btrim(progress ->> 'step')) BETWEEN 1 AND 100
        AND progress ->> 'layout' IN ('desktop', 'mobile')
        AND jsonb_typeof(progress -> 'completed') = 'boolean'
        AND (NOT progress ? 'version'
             OR (jsonb_typeof(progress -> 'version') = 'number'
                 AND progress ->> 'version' ~ '^[1-9][0-9]*$'))
        AND (NOT progress ? 'context'
             OR jsonb_typeof(progress -> 'context') IN ('null', 'object')),
        false
    );
END;
$$;

CREATE FUNCTION valid_bloom_config(config jsonb, step_limit smallint)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
DECLARE
    step_key text;
    weights jsonb;
    weight jsonb;
    percentage numeric;
    total numeric;
BEGIN
    IF jsonb_typeof(config) <> 'object' THEN
        RETURN false;
    END IF;

    FOR step_key, weights IN SELECT key, value FROM jsonb_each(config) LOOP
        IF step_key !~ '^[1-9][0-9]{0,4}$' THEN
            RETURN false;
        END IF;
        IF step_key::integer > step_limit OR jsonb_typeof(weights) <> 'object' THEN
            RETURN false;
        END IF;
        IF NOT (weights ?& ARRAY['remember_pct', 'understand_pct', 'apply_pct'])
           OR weights - ARRAY['remember_pct', 'understand_pct', 'apply_pct'] <> '{}'::jsonb THEN
            RETURN false;
        END IF;

        total := 0;
        FOR weight IN SELECT value FROM jsonb_each(weights) LOOP
            IF jsonb_typeof(weight) <> 'number' THEN
                RETURN false;
            END IF;
            percentage := weight::numeric;
            IF percentage NOT BETWEEN 0 AND 100 OR percentage <> trunc(percentage) THEN
                RETURN false;
            END IF;
            total := total + percentage;
        END LOOP;
        IF total <> 100 THEN
            RETURN false;
        END IF;
    END LOOP;

    RETURN true;
END;
$$;

CREATE FUNCTION valid_text_array(items jsonb, minimum_count integer)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    IF jsonb_typeof(items) <> 'array' THEN
        RETURN false;
    END IF;

    RETURN jsonb_array_length(items) >= minimum_count AND NOT EXISTS (
        SELECT 1
        FROM jsonb_array_elements(items) AS item(value)
        WHERE jsonb_typeof(value) <> 'string' OR btrim(value #>> '{}') = ''
    );
END;
$$;

CREATE FUNCTION valid_matching_pairs(pairs jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
DECLARE
    pair jsonb;
BEGIN
    IF jsonb_typeof(pairs) <> 'array' OR pairs = '[]'::jsonb THEN
        RETURN false;
    END IF;

    FOR pair IN SELECT value FROM jsonb_array_elements(pairs) LOOP
        IF jsonb_typeof(pair) <> 'object' THEN
            RETURN false;
        END IF;
        IF NOT COALESCE(
            pair - ARRAY['left', 'right'] = '{}'::jsonb
            AND jsonb_typeof(pair -> 'left') = 'string'
            AND jsonb_typeof(pair -> 'right') = 'string'
            AND btrim(pair ->> 'left') <> ''
            AND btrim(pair ->> 'right') <> '',
            false
        ) THEN
            RETURN false;
        END IF;
    END LOOP;

    RETURN true;
END;
$$;

CREATE FUNCTION valid_question_payload(question_type text, payload jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE
SET search_path = pg_catalog, app_v1
AS $$
DECLARE
    template text;
BEGIN
    IF question_type = 'MULTIPLE_CHOICE' THEN
        RETURN payload IS NULL;
    END IF;
    IF payload IS NULL OR jsonb_typeof(payload) <> 'object' THEN
        RETURN false;
    END IF;

    CASE question_type
        WHEN 'MATCHING' THEN
            RETURN COALESCE(payload - 'pairs' = '{}'::jsonb
                            AND app_v1.valid_matching_pairs(payload -> 'pairs'), false);
        WHEN 'FILL_BLANK' THEN
            template := payload ->> 'sentence_template';
            RETURN COALESCE(
                payload - ARRAY['sentence_template', 'options', 'blank_answer'] = '{}'::jsonb
                AND jsonb_typeof(payload -> 'sentence_template') = 'string'
                AND char_length(template) - char_length(replace(template, '{blank}', '')) = 7
                AND app_v1.valid_text_array(payload -> 'options', 1)
                AND jsonb_typeof(payload -> 'blank_answer') = 'string'
                AND btrim(payload ->> 'blank_answer') <> ''
                AND (payload -> 'options') @> jsonb_build_array(payload -> 'blank_answer'),
                false
            );
        WHEN 'ORDERING' THEN
            RETURN COALESCE(
                payload - ARRAY['prompt', 'correct_order', 'distractors'] = '{}'::jsonb
                AND jsonb_typeof(payload -> 'prompt') = 'string'
                AND btrim(payload ->> 'prompt') <> ''
                AND app_v1.valid_text_array(payload -> 'correct_order', 1)
                AND app_v1.valid_text_array(payload -> 'distractors', 0),
                false
            );
        ELSE
            RETURN false;
    END CASE;
END;
$$;

CREATE FUNCTION valid_session_response(response jsonb, correct boolean)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    IF jsonb_typeof(response) <> 'object' THEN
        RETURN false;
    END IF;

    CASE response ->> 'kind'
        WHEN 'ORDERING' THEN
            RETURN COALESCE(response - ARRAY['kind', 'tokens'] = '{}'::jsonb
                            AND app_v1.valid_text_array(response -> 'tokens', 1), false);
        WHEN 'MATCHING' THEN
            RETURN COALESCE(response - ARRAY['kind', 'pairs'] = '{}'::jsonb
                            AND app_v1.valid_matching_pairs(response -> 'pairs'), false);
        WHEN 'TIMEOUT' THEN
            RETURN response - 'kind' = '{}'::jsonb AND NOT correct;
        ELSE
            RETURN false;
    END CASE;
END;
$$;

CREATE FUNCTION valid_study_memory(memory jsonb)
RETURNS boolean
LANGUAGE plpgsql IMMUTABLE STRICT
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    IF jsonb_typeof(memory) <> 'object' THEN
        RETURN false;
    END IF;

    RETURN NOT EXISTS (
        SELECT 1
        FROM jsonb_each(memory) AS question(id, state)
        WHERE id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
           OR jsonb_typeof(state) <> 'object'
    );
END;
$$;

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE CHECK (username <> '' AND username = lower(btrim(username))),
    email text NOT NULL UNIQUE CHECK (email <> '' AND email = lower(btrim(email))),
    display_name text NOT NULL CHECK (btrim(display_name) <> ''),
    role text NOT NULL DEFAULT 'LEARNER' CHECK (role IN ('LEARNER', 'ADMIN', 'SYSTEM')),
    password_hash text CHECK (btrim(password_hash) <> ''),
    google_sub text CHECK (btrim(google_sub) <> ''),
    google_verified_email text CHECK (
        google_verified_email <> '' AND google_verified_email = lower(btrim(google_verified_email))
    ),
    session_version integer NOT NULL DEFAULT 0 CHECK (session_version >= 0),
    disabled_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    xp integer NOT NULL DEFAULT 0 CHECK (xp >= 0),
    coin_balance integer NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    streak_days integer NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
    last_active_date date,
    equipped_pet_id text,
    equipped_accessory_id text,
    CONSTRAINT users_google_identity_complete CHECK ((google_sub IS NULL) = (google_verified_email IS NULL)),
    CONSTRAINT users_credential_required CHECK (role = 'SYSTEM' OR num_nonnulls(password_hash, google_sub) >= 1),
    CONSTRAINT users_streak_date_consistent CHECK ((streak_days = 0) = (last_active_date IS NULL))
);

CREATE UNIQUE INDEX users_google_sub_unique ON users (google_sub) WHERE google_sub IS NOT NULL;
CREATE INDEX users_google_verified_email_idx ON users (google_verified_email) WHERE google_verified_email IS NOT NULL;

CREATE TABLE user_settings (
    user_id uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    theme text NOT NULL DEFAULT 'DARK' CHECK (theme IN ('LIGHT', 'DARK')),
    sound_enabled boolean NOT NULL DEFAULT true,
    sound_config jsonb CHECK (sound_config IS NULL OR COALESCE(app_v1.valid_sound_config(sound_config), false)),
    tutorial_progress jsonb CHECK (
        tutorial_progress IS NULL OR COALESCE(app_v1.valid_tutorial_progress(tutorial_progress), false)
    )
);

CREATE TABLE password_resets (
    user_id uuid PRIMARY KEY REFERENCES users (id) ON DELETE CASCADE,
    google_sub text NOT NULL CHECK (btrim(google_sub) <> ''),
    code_hash text NOT NULL UNIQUE CHECK (btrim(code_hash) <> ''),
    expires_at timestamptz NOT NULL,
    attempts smallint NOT NULL DEFAULT 0 CHECK (attempts BETWEEN 0 AND 5)
);

CREATE INDEX password_resets_expires_at_idx ON password_resets (expires_at);

CREATE TABLE pets (
    id text PRIMARY KEY CHECK (btrim(id) <> ''),
    name text NOT NULL CHECK (btrim(name) <> ''),
    description text NOT NULL,
    image_path text NOT NULL CHECK (btrim(image_path) <> ''),
    price_coins integer NOT NULL CHECK (price_coins >= 0),
    minimum_level smallint NOT NULL CHECK (minimum_level >= 1),
    required_role text CHECK (required_role = 'ADMIN'),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX pets_shop_idx ON pets (status, price_coins, id);

CREATE TABLE accessories (
    id text PRIMARY KEY CHECK (btrim(id) <> ''),
    name text NOT NULL CHECK (btrim(name) <> ''),
    description text NOT NULL,
    price_coins integer NOT NULL CHECK (price_coins >= 0),
    minimum_level smallint NOT NULL CHECK (minimum_level >= 1),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX accessories_shop_idx ON accessories (status, price_coins, id);

CREATE TABLE user_pets (
    user_id uuid REFERENCES users (id) ON DELETE RESTRICT,
    pet_id text REFERENCES pets (id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, pet_id)
);

CREATE INDEX user_pets_pet_idx ON user_pets (pet_id);

CREATE TABLE user_accessories (
    user_id uuid REFERENCES users (id) ON DELETE RESTRICT,
    accessory_id text REFERENCES accessories (id) ON DELETE RESTRICT,
    PRIMARY KEY (user_id, accessory_id)
);

CREATE INDEX user_accessories_accessory_idx ON user_accessories (accessory_id);

ALTER TABLE users
    ADD CONSTRAINT users_equipped_pet_fk
        FOREIGN KEY (id, equipped_pet_id) REFERENCES user_pets (user_id, pet_id) ON DELETE RESTRICT,
    ADD CONSTRAINT users_equipped_accessory_fk
        FOREIGN KEY (id, equipped_accessory_id) REFERENCES user_accessories (user_id, accessory_id) ON DELETE RESTRICT;

CREATE TABLE subjects (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name text NOT NULL CHECK (btrim(name) <> ''),
    description text,
    sort_order integer NOT NULL CHECK (sort_order >= 0),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED'))
);

CREATE INDEX subjects_catalog_idx ON subjects (status, sort_order, id);

CREATE TABLE chapters (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id uuid NOT NULL REFERENCES subjects (id) ON DELETE RESTRICT,
    title text NOT NULL CHECK (btrim(title) <> ''),
    sort_order integer NOT NULL CHECK (sort_order >= 0),
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    UNIQUE (subject_id, sort_order)
);

CREATE TABLE milestones (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id uuid NOT NULL REFERENCES chapters (id) ON DELETE RESTRICT,
    title text NOT NULL CHECK (btrim(title) <> ''),
    kind text NOT NULL CHECK (kind IN ('THEORY', 'QUIZ', 'BOSS')),
    theory_markdown text,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    sort_order integer NOT NULL CHECK (sort_order >= 0),
    reward_xp integer NOT NULL CHECK (reward_xp >= 0),
    reward_coins integer NOT NULL CHECK (reward_coins >= 0),
    step_count smallint NOT NULL,
    questions_per_step smallint NOT NULL,
    bloom_config jsonb,
    UNIQUE (chapter_id, sort_order),
    CONSTRAINT milestones_kind_steps CHECK (
        (kind = 'THEORY' AND step_count = 0 AND questions_per_step = 0 AND bloom_config IS NULL)
        OR (kind IN ('QUIZ', 'BOSS') AND step_count >= 1 AND questions_per_step >= 1)
    ),
    CONSTRAINT milestones_bloom_config_valid CHECK (
        bloom_config IS NULL OR COALESCE(app_v1.valid_bloom_config(bloom_config, step_count), false)
    )
);

CREATE TABLE questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    milestone_id uuid NOT NULL REFERENCES milestones (id) ON DELETE RESTRICT,
    type text NOT NULL CHECK (type IN ('MULTIPLE_CHOICE', 'MATCHING', 'FILL_BLANK', 'ORDERING')),
    bloom_level text NOT NULL CHECK (bloom_level IN ('REMEMBER', 'UNDERSTAND', 'APPLY')),
    step_no smallint NOT NULL CHECK (step_no >= 1),
    difficulty smallint NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
    stem text NOT NULL CHECK (btrim(stem) <> ''),
    explanation text,
    status text NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'ARCHIVED')),
    payload jsonb,
    CONSTRAINT questions_payload_valid CHECK (COALESCE(app_v1.valid_question_payload(type, payload), false))
);

CREATE INDEX questions_pool_idx ON questions (milestone_id, status, bloom_level);

CREATE TABLE question_options (
    question_id uuid REFERENCES questions (id) ON DELETE RESTRICT,
    position smallint CHECK (position BETWEEN 0 AND 3),
    text text NOT NULL CHECK (btrim(text) <> ''),
    is_correct boolean NOT NULL,
    PRIMARY KEY (question_id, position)
);

CREATE UNIQUE INDEX question_options_one_correct ON question_options (question_id) WHERE is_correct;

CREATE FUNCTION check_mcq_correct_option(question_to_check uuid)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    PERFORM 1
    FROM questions
    WHERE id = question_to_check AND type = 'MULTIPLE_CHOICE'
    FOR NO KEY UPDATE;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF (SELECT count(*) FROM question_options WHERE question_id = question_to_check AND is_correct) <> 1 THEN
        RAISE check_violation USING
            CONSTRAINT = 'questions_one_correct_option',
            MESSAGE = 'Multiple-choice question must have exactly one correct option';
    END IF;
END;
$$;

CREATE FUNCTION check_question_correct_option()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    PERFORM app_v1.check_mcq_correct_option(NEW.id);
    RETURN NULL;
END;
$$;

CREATE FUNCTION check_option_correct_option()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, app_v1
AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        PERFORM app_v1.check_mcq_correct_option(OLD.question_id);
    ELSE
        PERFORM app_v1.check_mcq_correct_option(NEW.question_id);
        IF TG_OP = 'UPDATE' AND OLD.question_id <> NEW.question_id THEN
            PERFORM app_v1.check_mcq_correct_option(OLD.question_id);
        END IF;
    END IF;
    RETURN NULL;
END;
$$;

CREATE CONSTRAINT TRIGGER questions_one_correct_option
    AFTER INSERT OR UPDATE OF type ON questions
    DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
    EXECUTE FUNCTION app_v1.check_question_correct_option();

CREATE CONSTRAINT TRIGGER question_options_one_correct_check
    AFTER INSERT OR UPDATE OR DELETE ON question_options
    DEFERRABLE INITIALLY DEFERRED FOR EACH ROW
    EXECUTE FUNCTION app_v1.check_option_correct_option();

CREATE TABLE enrollments (
    user_id uuid REFERENCES users (id) ON DELETE RESTRICT,
    subject_id uuid REFERENCES subjects (id) ON DELETE RESTRICT,
    enrolled_at timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, subject_id)
);

CREATE INDEX enrollments_user_date_idx ON enrollments (user_id, enrolled_at DESC);
CREATE INDEX enrollments_subject_idx ON enrollments (subject_id);

CREATE TABLE milestone_progress (
    user_id uuid REFERENCES users (id) ON DELETE RESTRICT,
    milestone_id uuid REFERENCES milestones (id) ON DELETE RESTRICT,
    current_step smallint CHECK (current_step >= 1),
    xp_earned integer NOT NULL DEFAULT 0 CHECK (xp_earned >= 0),
    completed_at timestamptz,
    memory jsonb CHECK (memory IS NULL OR COALESCE(app_v1.valid_study_memory(memory), false)),
    PRIMARY KEY (user_id, milestone_id),
    CONSTRAINT milestone_progress_completed_without_current_step CHECK (
        completed_at IS NULL OR current_step IS NULL
    )
);

CREATE INDEX milestone_progress_user_date_idx ON milestone_progress (user_id, completed_at);
CREATE INDEX milestone_progress_milestone_idx ON milestone_progress (milestone_id);

CREATE TABLE study_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    kind text NOT NULL CHECK (kind IN ('STEP', 'MILESTONE', 'EXTREME')),
    milestone_id uuid REFERENCES milestones (id) ON DELETE RESTRICT,
    subject_id uuid REFERENCES subjects (id) ON DELETE RESTRICT,
    step_no smallint CHECK (step_no >= 1),
    started_at timestamptz,
    finished_at timestamptz,
    finish_kind text CHECK (finish_kind IN ('SUBMITTED', 'ABANDONED')),
    CONSTRAINT study_sessions_scope CHECK (
        (kind = 'EXTREME' AND subject_id IS NOT NULL AND milestone_id IS NULL
            AND started_at IS NOT NULL AND step_no IS NULL)
        OR (kind = 'STEP' AND milestone_id IS NOT NULL AND subject_id IS NULL
            AND started_at IS NULL AND step_no IS NOT NULL)
        OR (kind = 'MILESTONE' AND milestone_id IS NOT NULL AND subject_id IS NULL
            AND started_at IS NULL AND step_no IS NULL)
    ),
    CONSTRAINT study_sessions_finish_pair CHECK (
        (finished_at IS NULL) = (finish_kind IS NULL)
        AND (finish_kind IS DISTINCT FROM 'ABANDONED' OR kind = 'STEP')
        AND (finished_at IS NULL OR started_at IS NULL OR finished_at >= started_at)
    )
);

CREATE INDEX study_sessions_user_finished_idx ON study_sessions (user_id, finished_at DESC);
CREATE INDEX study_sessions_milestone_step_idx ON study_sessions (milestone_id, step_no);
CREATE INDEX study_sessions_subject_idx ON study_sessions (subject_id);

CREATE TABLE study_session_questions (
    session_id uuid REFERENCES study_sessions (id) ON DELETE RESTRICT,
    position integer CHECK (position >= 1),
    question_id uuid NOT NULL REFERENCES questions (id) ON DELETE RESTRICT,
    PRIMARY KEY (session_id, position),
    UNIQUE (session_id, question_id)
);

CREATE INDEX study_session_questions_question_idx ON study_session_questions (question_id);

CREATE TABLE session_answers (
    session_id uuid,
    attempt_no integer CHECK (attempt_no >= 1),
    question_position integer NOT NULL,
    is_correct boolean NOT NULL,
    seconds numeric(10,3) CHECK (seconds >= 0 AND seconds <> 'NaN'::numeric),
    selected_option_position smallint CHECK (selected_option_position BETWEEN 0 AND 3),
    submitted_text text CHECK (btrim(submitted_text) <> ''),
    response jsonb CHECK (response IS NULL OR COALESCE(app_v1.valid_session_response(response, is_correct), false)),
    PRIMARY KEY (session_id, attempt_no),
    FOREIGN KEY (session_id, question_position) REFERENCES study_session_questions (session_id, position)
        ON DELETE RESTRICT,
    CONSTRAINT session_answers_exactly_one_response CHECK (
        num_nonnulls(selected_option_position, submitted_text, response) = 1
    )
);

CREATE INDEX session_answers_question_idx ON session_answers (session_id, question_position, attempt_no);

CREATE TABLE session_answer_lookups (
    session_id uuid,
    attempt_no integer,
    lookup_no integer CHECK (lookup_no >= 1),
    opened_at timestamptz NOT NULL,
    duration_seconds integer NOT NULL CHECK (duration_seconds >= 1),
    offset_seconds integer NOT NULL CHECK (offset_seconds >= 0),
    context text NOT NULL CHECK (context IN ('BEFORE_ANSWER', 'AFTER_ANSWER')),
    PRIMARY KEY (session_id, attempt_no, lookup_no),
    FOREIGN KEY (session_id, attempt_no) REFERENCES session_answers (session_id, attempt_no)
        ON DELETE CASCADE
);
