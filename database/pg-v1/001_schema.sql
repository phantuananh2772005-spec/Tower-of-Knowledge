\set ON_ERROR_STOP on
BEGIN;
\ir schema/local_guard.sql

-- Serialize apply/rollback on the local database.
SELECT pg_catalog.pg_advisory_xact_lock(12287302, 1);
SELECT pg_catalog.to_regnamespace('app_v1') IS NULL AS install_v1 \gset

\if :install_v1
DO $role$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'thaptrithuc_v1_runtime') THEN
        CREATE ROLE thaptrithuc_v1_runtime NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE
            NOREPLICATION NOBYPASSRLS;
    END IF;

    IF EXISTS (
        SELECT FROM pg_catalog.pg_roles AS runtime
        WHERE runtime.rolname = 'thaptrithuc_v1_runtime'
          AND (rolcanlogin OR rolsuper OR rolcreatedb OR rolcreaterole OR rolreplication
               OR rolbypassrls OR EXISTS (
                   SELECT FROM pg_catalog.pg_auth_members WHERE member = runtime.oid
               ))
    ) THEN
        RAISE EXCEPTION 'Role thaptrithuc_v1_runtime exists with unsupported privileges';
    END IF;
END
$role$;

CREATE SCHEMA app_v1;
REVOKE ALL ON SCHEMA app_v1 FROM PUBLIC;
SET LOCAL search_path = app_v1, pg_catalog;

-- V1 business constants. Changes require a versioned migration.
CREATE FUNCTION v1_season_length_days() RETURNS integer
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN 56;
CREATE FUNCTION v1_first_season_start() RETURNS timestamptz
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN TIMESTAMPTZ '2026-11-09 00:00:00+07';
CREATE FUNCTION v1_weekly_xp_limit() RETURNS integer
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN 1500;
CREATE FUNCTION v1_arena_initial_hp() RETURNS integer
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN 100;
CREATE FUNCTION v1_arena_base_damage() RETURNS integer
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN 12;
CREATE FUNCTION v1_arena_fast_bonus() RETURNS integer
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN 3;
CREATE FUNCTION v1_arena_fast_answer_seconds() RETURNS integer
    LANGUAGE sql IMMUTABLE PARALLEL SAFE RETURN 5;

\ir schema/10_learning.sql
\ir schema/20_arena_economy.sql
\ir schema/30_views.sql
\ir schema/40_runtime_grants.sql

COMMENT ON SCHEMA app_v1 IS 'Thap Tri Thuc / local PostgreSQL V1 / 001';
\endif

DO $verify$
DECLARE
    schema_id oid := pg_catalog.to_regnamespace('app_v1');
BEGIN
    IF pg_catalog.obj_description(schema_id, 'pg_namespace')
            IS DISTINCT FROM 'Thap Tri Thuc / local PostgreSQL V1 / 001'
        OR (SELECT count(*) FROM pg_catalog.pg_class
            WHERE relnamespace = schema_id AND relkind = 'r') <> 29
        OR (SELECT count(*) FROM pg_catalog.pg_attribute AS a
            JOIN pg_catalog.pg_class AS c ON c.oid = a.attrelid
            WHERE c.relnamespace = schema_id AND c.relkind = 'r'
              AND a.attnum > 0 AND NOT a.attisdropped) <> 169
    THEN
        RAISE EXCEPTION 'app_v1 does not match the approved V1 schema';
    END IF;
END
$verify$;

COMMIT;
