\set ON_ERROR_STOP on
BEGIN;
\ir schema/local_guard.sql
SELECT pg_catalog.pg_advisory_xact_lock(12287302, 1);

DO $rollback$
DECLARE
    schema_id oid := pg_catalog.to_regnamespace('app_v1');
BEGIN
    IF schema_id IS NULL THEN
        RETURN;
    END IF;
    IF pg_catalog.obj_description(schema_id, 'pg_namespace')
            IS DISTINCT FROM 'Thap Tri Thuc / local PostgreSQL V1 / 001'
    THEN
        RAISE EXCEPTION 'Refusing to drop app_v1 without the V1 migration marker';
    END IF;
    DROP SCHEMA app_v1 CASCADE;
END
$rollback$;

COMMIT;
