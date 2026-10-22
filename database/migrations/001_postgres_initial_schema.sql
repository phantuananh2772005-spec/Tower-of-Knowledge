-- =======================================================================
-- MIGRATION: 001_postgres_initial_schema.sql
-- Du an: Tower of Knowledge (Nen tang hoc tap Gamification & Dau truong 1v1)
-- Phien ban: 4.0 (Class Diagram v4)
-- He quan tri: PostgreSQL 14+ (Ho tro Render / Cloud)
-- =======================================================================

-- 1. NGUOI_DUNG
CREATE TABLE IF NOT EXISTS nguoi_dung (
    ma_nguoi_dung VARCHAR(50) PRIMARY KEY,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    ten_hien_thi VARCHAR(100) NOT NULL,
    khung_avatar VARCHAR(50) NOT NULL DEFAULT 'khung_khoi_dau',
    vai_tro VARCHAR(20) NOT NULL DEFAULT 'NGUOI_HOC',
    tong_diem_kinh_nghiem INT NOT NULL DEFAULT 0,
    xu_tri_thuc INT NOT NULL DEFAULT 100,
    chuoi_streak_ngay INT NOT NULL DEFAULT 0,
    ngay_hoat_dong_cuoi DATE NULL,
    che_do_giao_dien VARCHAR(10) NOT NULL DEFAULT 'TOI',
    bat_am_thanh BOOLEAN NOT NULL DEFAULT TRUE,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. THU_CUNG
CREATE TABLE thu_cung (
    ma_thu_cung VARCHAR(50) PRIMARY KEY,
    ten_thu_cung VARCHAR(100) NOT NULL,
    mo_ta VARCHAR(500) NULL,
    anh_dai_dien VARCHAR(255) NULL,
    spritesheet_url VARCHAR(255) NULL,
    gia_xu INT NOT NULL DEFAULT 0,
    cap_do_yeu_cau INT NOT NULL DEFAULT 1,
    he_so_sat_thuong REAL NOT NULL DEFAULT 1.0,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. THU_CUNG_SO_HUU
CREATE TABLE thu_cung_so_huu (
    ma_so_huu VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_thu_cung VARCHAR(50) NOT NULL REFERENCES thu_cung(ma_thu_cung),
    dang_kich_hoat BOOLEAN NOT NULL DEFAULT FALSE,
    ngay_so_huu TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_nguoi_dung_thu_cung UNIQUE(ma_nguoi_dung, ma_thu_cung)
);

CREATE UNIQUE INDEX uq_nguoi_dung_pet_active 
ON thu_cung_so_huu(ma_nguoi_dung) 
WHERE dang_kich_hoat = TRUE;

-- 4. GIAO_DICH_XU
CREATE TABLE giao_dich_xu (
    ma_giao_dich VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    so_luong INT NOT NULL,
    so_du_sau INT NOT NULL,
    nguon_giao_dich VARCHAR(50) NOT NULL,
    mo_ta VARCHAR(255) NULL,
    thoi_gian TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. MON_HOC
CREATE TABLE mon_hoc (
    ma_mon VARCHAR(50) PRIMARY KEY,
    ten_mon VARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    mo_ta TEXT NULL,
    anh_bia VARCHAR(255) NULL,
    thu_tu INT NOT NULL DEFAULT 1,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. CHUONG_HOC
CREATE TABLE chuong_hoc (
    ma_chuong VARCHAR(50) PRIMARY KEY,
    ma_mon VARCHAR(50) NOT NULL REFERENCES mon_hoc(ma_mon) ON DELETE CASCADE,
    tieu_de VARCHAR(200) NOT NULL,
    thu_tu INT NOT NULL DEFAULT 1,
    mo_ta TEXT NULL,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. MOC_BAI_HOC
CREATE TABLE moc_bai_hoc (
    ma_moc VARCHAR(50) PRIMARY KEY,
    ma_chuong VARCHAR(50) NOT NULL REFERENCES chuong_hoc(ma_chuong) ON DELETE CASCADE,
    tieu_de VARCHAR(200) NOT NULL,
    loai_moc VARCHAR(30) NOT NULL,
    noi_dung_ly_thuyet TEXT NULL,
    diem_thuong INT NOT NULL DEFAULT 10,
    xu_thuong INT NOT NULL DEFAULT 5,
    thu_tu INT NOT NULL DEFAULT 1,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. CAU_HOI
CREATE TABLE cau_hoi (
    ma_cau_hoi VARCHAR(50) PRIMARY KEY,
    ma_moc VARCHAR(50) NULL REFERENCES moc_bai_hoc(ma_moc) ON DELETE SET NULL,
    noi_dung TEXT NOT NULL,
    loai_cau_hoi VARCHAR(30) NOT NULL DEFAULT 'TRAC_NGHIEM_4',
    dap_an_a TEXT NULL,
    dap_an_b TEXT NULL,
    dap_an_c TEXT NULL,
    dap_an_d TEXT NULL,
    vi_tri_dap_an_dung INT NULL,
    muc_bloom VARCHAR(20) NOT NULL DEFAULT 'NHO',
    buoc_luyen_tap INT NOT NULL DEFAULT 1,
    du_lieu_cau_hoi TEXT NULL,
    giai_thich TEXT NULL,
    do_kho INT NOT NULL DEFAULT 1,
    tao_luc TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. TIEN_DO_MON_HOC
CREATE TABLE tien_do_mon_hoc (
    ma_tien_do_mon VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_mon VARCHAR(50) NOT NULL REFERENCES mon_hoc(ma_mon) ON DELETE CASCADE,
    phan_tram_hoan_thanh REAL NOT NULL DEFAULT 0.0,
    ngay_bat_dau TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ngay_hoan_thanh TIMESTAMPTZ NULL,
    CONSTRAINT uq_nguoi_dung_mon UNIQUE(ma_nguoi_dung, ma_mon)
);

-- 10. TIEN_DO_MOC_BAI_HOC
CREATE TABLE tien_do_moc_bai_hoc (
    ma_tien_do_moc VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_moc VARCHAR(50) NOT NULL REFERENCES moc_bai_hoc(ma_moc) ON DELETE CASCADE,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'DA_MO',
    diem_dat_duoc INT NOT NULL DEFAULT 0,
    xu_da_nhan INT NOT NULL DEFAULT 0,
    buoc_hien_tai INT NOT NULL DEFAULT 1,
    cac_buoc_hoan_thanh VARCHAR(50) NOT NULL DEFAULT '0/4',
    thoi_diem_hoan_thanh TIMESTAMPTZ NULL,
    CONSTRAINT uq_nguoi_dung_moc UNIQUE(ma_nguoi_dung, ma_moc)
);

-- 11. TRAN_DAU_1V1
CREATE TABLE tran_dau_1v1 (
    ma_tran VARCHAR(50) PRIMARY KEY,
    ma_mon VARCHAR(50) NULL REFERENCES mon_hoc(ma_mon) ON DELETE SET NULL,
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHUAN_BI',
    thoi_gian_bat_dau TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    thoi_gian_ket_thuc TIMESTAMPTZ NULL,
    nguoi_thang_cuoc VARCHAR(50) NULL REFERENCES nguoi_dung(ma_nguoi_dung),
    ly_do_ket_thuc VARCHAR(50) NULL
);

-- 12. NGUOI_CHOI_TRONG_TRAN
CREATE TABLE nguoi_choi_trong_tran (
    ma_nguoi_choi_trong_tran VARCHAR(50) PRIMARY KEY,
    ma_tran VARCHAR(50) NOT NULL REFERENCES tran_dau_1v1(ma_tran) ON DELETE CASCADE,
    ma_nguoi_dung VARCHAR(50) NOT NULL REFERENCES nguoi_dung(ma_nguoi_dung),
    ma_thu_cung VARCHAR(50) NULL REFERENCES thu_cung(ma_thu_cung),
    mau_hien_tai INT NOT NULL DEFAULT 100,
    mau_toi_da INT NOT NULL DEFAULT 100,
    tong_sat_thuong_gay_ra INT NOT NULL DEFAULT 0,
    ket_qua VARCHAR(20) NOT NULL DEFAULT 'CHUA_KET_THUC',
    xu_nhan_duoc INT NOT NULL DEFAULT 0,
    exp_nhan_duoc INT NOT NULL DEFAULT 0,
    CONSTRAINT uq_tran_nguoi_dung UNIQUE(ma_tran, ma_nguoi_dung)
);

-- 13. CAU_HOI_TRONG_TRAN
CREATE TABLE cau_hoi_trong_tran (
    ma_cau_trong_tran VARCHAR(50) PRIMARY KEY,
    ma_tran VARCHAR(50) NOT NULL REFERENCES tran_dau_1v1(ma_tran) ON DELETE CASCADE,
    ma_cau_hoi VARCHAR(50) NOT NULL REFERENCES cau_hoi(ma_cau_hoi),
    thu_tu_cau INT NOT NULL,
    CONSTRAINT uq_tran_thu_tu UNIQUE(ma_tran, thu_tu_cau)
);

-- 14. LUOT_TRA_LOI
CREATE TABLE luot_tra_loi (
    ma_luot_tra_loi VARCHAR(50) PRIMARY KEY,
    ma_cau_trong_tran VARCHAR(50) NOT NULL REFERENCES cau_hoi_trong_tran(ma_cau_trong_tran) ON DELETE CASCADE,
    ma_nguoi_choi_trong_tran VARCHAR(50) NOT NULL REFERENCES nguoi_choi_trong_tran(ma_nguoi_choi_trong_tran),
    vi_tri_dap_an_chon INT NULL,
    la_dap_an_dung BOOLEAN NOT NULL DEFAULT FALSE,
    thoi_gian_tra_loi_giay REAL NOT NULL DEFAULT 0.0,
    sat_thuong_gay_ra INT NOT NULL DEFAULT 0,
    thoi_diem_tra_loi TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_cau_nguoi_choi UNIQUE(ma_cau_trong_tran, ma_nguoi_choi_trong_tran)
);
