-- Included inside a transaction by the local SQL entry points.
DO $local_guard$
BEGIN
    IF pg_catalog.current_database() <> 'thaptrithuc_v1'
        OR (pg_catalog.inet_server_addr() IS NOT NULL
            AND pg_catalog.inet_server_addr() NOT IN (inet '127.0.0.1', inet '::1'))
    THEN
        RAISE EXCEPTION 'Use the local thaptrithuc_v1 database through a socket or loopback';
    END IF;
    IF pg_catalog.current_setting('server_version_num')::integer / 10000 <> 16 THEN
        RAISE EXCEPTION 'This schema requires PostgreSQL major version 16';
    END IF;
    IF pg_catalog.current_setting('server_encoding') <> 'UTF8' THEN
        RAISE EXCEPTION 'The local database must use UTF8 encoding';
    END IF;
END
$local_guard$;
SET LOCAL TIME ZONE 'UTC';
