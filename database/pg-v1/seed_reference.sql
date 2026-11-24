\set ON_ERROR_STOP on
\encoding UTF8
BEGIN;
\ir schema/local_guard.sql
SET LOCAL search_path = app_v1, pg_catalog;

-- Reference records only. Existing catalog edits and season state survive reruns.
-- Pet IDs, names, descriptions, images, prices and unlock levels come from config/pets.json.
INSERT INTO pets (id, name, description, image_path, price_coins, minimum_level, required_role, status)
VALUES
    ('pet_sparky', 'Rồng Nhỏ Sparky', 'Rồng con tinh nghịch · Cổ vũ bạn học', '/assets/sparky_idle.gif', 0, 1, NULL, 'ACTIVE'),
    ('pet_kitsune', 'Cáo Lửa Kitsune', 'Hiệp sĩ cáo · Lém lỉnh & trung thành', '/assets/kitsune_idle.gif', 150, 1, NULL, 'ACTIVE'),
    ('pet_pyra_phoenix', 'Phượng Hoàng Pyra', 'Hỏa Phượng Hoàng · Thắp sáng niềm tin', '/assets/pets/pyra_phoenix/03_spritesheet/pyra_phoenix_idle.gif', 300, 1, NULL, 'ACTIVE'),
    ('pet_kim_quy_turtle', 'Rùa Thần Kim Quy', 'Cụ Rùa thông thái · Vững vàng kiên trì', '/assets/pets/kim_quy_turtle/03_spritesheet/kim_quy_turtle_idle.gif', 180, 1, NULL, 'ACTIVE'),
    ('pet_golem', 'Người Đá Golem', 'Vệ binh cổ đại · Tinh thần thép', '/assets/pets/stone_golem/03_spritesheet/stone_golem_idle.gif', 300, 2, NULL, 'ACTIVE'),
    ('pet_maneki_neko', 'Mèo Thần Tài Neko', 'Mèo may mắn · Niềm vui học tập', '/assets/pets/maneki_neko/03_spritesheet/maneki_neko_idle.gif', 150, 1, NULL, 'ACTIVE'),
    ('pet_bambo_panda', 'Gấu Trúc Bambo', 'Trúc vương lười biếng · Điềm tĩnh ôn hòa', '/assets/pets/bambo_panda/03_spritesheet/bambo_panda_idle.gif', 160, 1, NULL, 'ACTIVE'),
    ('pet_byte_robot', 'Robot Khối Byte', 'Trợ lý AI nhí · Phân tích chuẩn xác', '/assets/pets/byte_robot/03_spritesheet/byte_robot_idle.gif', 200, 1, NULL, 'ACTIVE'),
    ('pet_astra_stag', 'Hươu Tinh Tú Astra', 'Tuần lộc sao băng · Soi đường tri thức', '/assets/pets/astra_stag/03_spritesheet/astra_stag_idle.gif', 250, 1, NULL, 'ACTIVE'),
    ('pet_kylin_qilin', 'Kỳ Lân Mây Kylin', 'Thánh thú ngũ sắc · Mang lại điềm lành', '/assets/pets/kylin_qilin/03_spritesheet/kylin_qilin_idle.gif', 280, 1, NULL, 'ACTIVE'),
    ('pet_inky_octopus', 'Bạch Tuộc Học Giả Inky', 'Bậc thầy thảo văn · Nét mực uyển chuyển', '/assets/pets/inky_octopus/03_spritesheet/inky_octopus_idle.gif', 170, 1, NULL, 'ACTIVE'),
    ('pet_spike_hedgehog', 'Nhím Ghi Chú Spike', 'Ghi nhớ thần tốc · Chăm chỉ cần mẫn', '/assets/pets/spike_hedgehog/03_spritesheet/spike_hedgehog_idle.gif', 140, 1, NULL, 'ACTIVE'),
    ('pet_admin_aurum', 'Kim Long Aurum 👑', 'Thần thú Hoàng Kim Tối Thượng · Dành riêng Quản trị viên', '/assets/pets/admin_aurum/03_spritesheet/admin_aurum_idle.gif', 9999, 1, 'ADMIN', 'ACTIVE'),
    ('pet_admin_nguyet', 'Thỏ Nguyệt Thẩm Phán 👑', 'Quyền trượng Công lý Pháp đình · Dành riêng Quản trị viên', '/assets/pets/admin_nguyet/03_spritesheet/admin_nguyet_idle.gif', 9999, 1, 'ADMIN', 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- The accessory in config/accessories.json starts locked. No level is specified there.
INSERT INTO accessories (id, name, description, price_coins, minimum_level, status)
VALUES
    ('sparky_witch_hat', 'Mũ Phù Thủy Sparky', 'Mũ pixel có chuyển động dành riêng cho Sparky.', 50, 1, 'ARCHIVED')
ON CONFLICT (id) DO NOTHING;

-- Subject titles, slugs, descriptions and ordering come from database/seed_postgres*.sql.
INSERT INTO subjects (slug, name, description, sort_order, status)
VALUES
    ('co-so-du-lieu', 'Cơ sở Dữ liệu & Hệ Quản trị CSDL (Database Systems)',
     'Giáo trình toàn diện chuẩn đại học về Cơ sở Dữ liệu Quan hệ, Thiết kế mô hình ERD, Chuẩn hóa 1NF - 3NF, và Ngôn ngữ Truy vấn SQL chuẩn Quốc tế.', 1, 'ACTIVE'),
    ('chuyen-doi-so', 'Chuyển đổi số & Kinh tế số (Digital Transformation)',
     'Giáo trình đào tạo toàn diện chuẩn Đại học về Chuyển đổi số, Hạ tầng dữ liệu, Kinh tế số, Công nghệ 4.0, Chính phủ số & Kỹ năng số cho kỷ nguyên mới.', 2, 'ACTIVE')
ON CONFLICT (slug) DO NOTHING;

-- Daily quest amounts come from services/quest.service.js. Onboarding is not a daily quest.
INSERT INTO quests (code, reward_coins, reward_xp)
VALUES ('STUDY', 15, 25), ('BATTLE', 15, 25), ('PET_CARE', 10, 15)
ON CONFLICT (code) DO NOTHING;

-- Calendar bounds are supplied by the approved V1 constants. Do not reopen a closed season.
INSERT INTO seasons (season_no, is_closed)
SELECT 1, false WHERE NOT EXISTS (SELECT 1 FROM seasons)
ON CONFLICT DO NOTHING;

COMMIT;
