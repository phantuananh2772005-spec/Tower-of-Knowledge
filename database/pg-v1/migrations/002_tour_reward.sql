BEGIN;
SET LOCAL search_path = app_v1, pg_catalog;
ALTER TABLE coin_ledger DROP CONSTRAINT coin_ledger_amount_matches_kind;
ALTER TABLE coin_ledger ADD CONSTRAINT coin_ledger_amount_matches_kind CHECK (
 CASE
 WHEN kind IN ('STREAK_REWARD','MILESTONE_REWARD','MATCH_REWARD','EXTREME_REWARD',
 'DAILY_QUEST_REWARD','ONBOARDING_REWARD','SEASON_REWARD','TOUR_REWARD') THEN delta > 0
 WHEN kind IN ('PET_PURCHASE','ACCESSORY_PURCHASE','PET_FEED') THEN delta < 0
 WHEN kind = 'PET_STROKE' THEN delta = 0
 WHEN kind = 'ADMIN_ADJUSTMENT' THEN delta <> 0
 ELSE false END);
CREATE UNIQUE INDEX IF NOT EXISTS coin_ledger_one_tour_reward
 ON coin_ledger(user_id) WHERE kind = 'TOUR_REWARD';
COMMIT;
