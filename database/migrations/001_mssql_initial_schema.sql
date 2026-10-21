-- =======================================================================
-- MIGRATION: 001_mssql_initial_schema.sql
-- Du an: Tower of Knowledge (Nen tang hoc tap Gamification & Dau truong 1v1)
-- Phien ban: 4.0 (Class Diagram v4)
-- He quan tri: Microsoft SQL Server 2019+
-- =======================================================================

USE TowerOfKnowledge;
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- Xoa cac bang neu da ton tai (theo thu tu nguoc lai cua khoa ngoai)
IF OBJECT_ID('luot_tra_loi', 'U') IS NOT NULL DROP TABLE luot_tra_loi;
IF OBJECT_ID('cau_hoi_trong_tran', 'U') IS NOT NULL DROP TABLE cau_hoi_trong_tran;
IF OBJECT_ID('nguoi_choi_trong_tran', 'U') IS NOT NULL DROP TABLE nguoi_choi_trong_tran;
IF OBJECT_ID('tran_dau_1v1', 'U') IS NOT NULL DROP TABLE tran_dau_1v1;
IF OBJECT_ID('tien_do_moc_bai_hoc', 'U') IS NOT NULL DROP TABLE tien_do_moc_bai_hoc;
IF OBJECT_ID('tien_do_mon_hoc', 'U') IS NOT NULL DROP TABLE tien_do_mon_hoc;
IF OBJECT_ID('cau_hoi', 'U') IS NOT NULL DROP TABLE cau_hoi;
IF OBJECT_ID('moc_bai_hoc', 'U') IS NOT NULL DROP TABLE moc_bai_hoc;
IF OBJECT_ID('chuong_hoc', 'U') IS NOT NULL DROP TABLE chuong_hoc;
IF OBJECT_ID('mon_hoc', 'U') IS NOT NULL DROP TABLE mon_hoc;
IF OBJECT_ID('giao_dich_xu', 'U') IS NOT NULL DROP TABLE giao_dich_xu;
IF OBJECT_ID('thu_cung_so_huu', 'U') IS NOT NULL DROP TABLE thu_cung_so_huu;
IF OBJECT_ID('thu_cung', 'U') IS NOT NULL DROP TABLE thu_cung;
IF OBJECT_ID('nguoi_dung', 'U') IS NOT NULL DROP TABLE nguoi_dung;
GO

-- 1. NGUOI_DUNG
CREATE TABLE nguoi_dung (
    ma_nguoi_dung VARCHAR(50) PRIMARY KEY,
    ten_dang_nhap VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    mat_khau_hash VARCHAR(255) NOT NULL,
    ten_hien_thi NVARCHAR(100) NOT NULL,
    khung_avatar VARCHAR(50) NOT NULL DEFAULT 'khung_khoi_dau',
    vai_tro VARCHAR(20) NOT NULL DEFAULT 'NGUOI_HOC', -- 'NGUOI_HOC', 'QUAN_TRI_VIEN'
    tong_diem_kinh_nghiem INT NOT NULL DEFAULT 0,
    xu_tri_thuc INT NOT NULL DEFAULT 100,
    chuoi_streak_ngay INT NOT NULL DEFAULT 0,
    ngay_hoat_dong_cuoi DATE NULL,
    che_do_giao_dien VARCHAR(10) NOT NULL DEFAULT 'TOI', -- 'TOI', 'SANG'
    bat_am_thanh BIT NOT NULL DEFAULT 1,
    tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    cap_nhat_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 2. THU_CUNG
CREATE TABLE thu_cung (
    ma_thu_cung VARCHAR(50) PRIMARY KEY,
    ten_thu_cung NVARCHAR(100) NOT NULL,
    mo_ta NVARCHAR(500) NULL,
    anh_dai_dien VARCHAR(255) NULL,
    spritesheet_url VARCHAR(255) NULL,
    gia_xu INT NOT NULL DEFAULT 0,
    cap_do_yeu_cau INT NOT NULL DEFAULT 1,
    he_so_sat_thuong FLOAT NOT NULL DEFAULT 1.0,
    tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 3. THU_CUNG_SO_HUU
CREATE TABLE thu_cung_so_huu (
    ma_so_huu VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_thu_cung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES thu_cung(ma_thu_cung),
    dang_kich_hoat BIT NOT NULL DEFAULT 0,
    ngay_so_huu DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_nguoi_dung_thu_cung UNIQUE(ma_nguoi_dung, ma_thu_cung)
);
GO

-- Partial unique index: moi nguoi dung chi co toi da 1 thu cung dang kich hoat
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
CREATE UNIQUE NONCLUSTERED INDEX UQ_nguoi_dung_pet_active 
ON thu_cung_so_huu(ma_nguoi_dung) 
WHERE dang_kich_hoat = 1;
GO

-- 4. GIAO_DICH_XU (So cai minh bach kinh te)
CREATE TABLE giao_dich_xu (
    ma_giao_dich VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    so_luong INT NOT NULL,
    so_du_sau INT NOT NULL,
    nguon_giao_dich VARCHAR(50) NOT NULL, -- THUONG_MOC_HOC, THUONG_TRAN_DAU, THUONG_THAM_GIA, THUONG_STREAK, MUA_THU_CUNG
    mo_ta NVARCHAR(255) NULL,
    thoi_gian DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 5. MON_HOC
CREATE TABLE mon_hoc (
    ma_mon VARCHAR(50) PRIMARY KEY,
    ten_mon NVARCHAR(200) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    mo_ta NVARCHAR(MAX) NULL,
    anh_bia VARCHAR(255) NULL,
    thu_tu INT NOT NULL DEFAULT 1,
    tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 6. CHUONG_HOC
CREATE TABLE chuong_hoc (
    ma_chuong VARCHAR(50) PRIMARY KEY,
    ma_mon VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES mon_hoc(ma_mon) ON DELETE CASCADE,
    tieu_de NVARCHAR(200) NOT NULL,
    thu_tu INT NOT NULL DEFAULT 1,
    mo_ta NVARCHAR(MAX) NULL,
    tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 7. MOC_BAI_HOC
CREATE TABLE moc_bai_hoc (
    ma_moc VARCHAR(50) PRIMARY KEY,
    ma_chuong VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES chuong_hoc(ma_chuong) ON DELETE CASCADE,
    tieu_de NVARCHAR(200) NOT NULL,
    loai_moc VARCHAR(30) NOT NULL, -- LY_THUYET, TRAC_NGHIEM, THU_THACH_BOSS
    noi_dung_ly_thuyet NVARCHAR(MAX) NULL,
    diem_thuong INT NOT NULL DEFAULT 10,
    xu_thuong INT NOT NULL DEFAULT 5,
    thu_tu INT NOT NULL DEFAULT 1,
    tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 8. CAU_HOI
CREATE TABLE cau_hoi (
    ma_cau_hoi VARCHAR(50) PRIMARY KEY,
    ma_moc VARCHAR(50) NULL FOREIGN KEY REFERENCES moc_bai_hoc(ma_moc) ON DELETE SET NULL,
    noi_dung NVARCHAR(MAX) NOT NULL,
    loai_cau_hoi VARCHAR(30) NOT NULL DEFAULT 'TRAC_NGHIEM_4',
    dap_an_a NVARCHAR(MAX) NOT NULL,
    dap_an_b NVARCHAR(MAX) NOT NULL,
    dap_an_c NVARCHAR(MAX) NOT NULL,
    dap_an_d NVARCHAR(MAX) NOT NULL,
    vi_tri_dap_an_dung INT NOT NULL, -- 0=A, 1=B, 2=C, 3=D
    giai_thich NVARCHAR(MAX) NULL,
    do_kho INT NOT NULL DEFAULT 1, -- 1=De, 2=Trung binh, 3=Kho
    tao_luc DATETIME2 NOT NULL DEFAULT SYSDATETIME()
);
GO

-- 9. TIEN_DO_MON_HOC
CREATE TABLE tien_do_mon_hoc (
    ma_tien_do_mon VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_mon VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES mon_hoc(ma_mon) ON DELETE CASCADE,
    phan_tram_hoan_thanh FLOAT NOT NULL DEFAULT 0.0,
    ngay_bat_dau DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    ngay_hoan_thanh DATETIME2 NULL,
    CONSTRAINT UQ_nguoi_dung_mon UNIQUE(ma_nguoi_dung, ma_mon)
);
GO

-- 10. TIEN_DO_MOC_BAI_HOC
CREATE TABLE tien_do_moc_bai_hoc (
    ma_tien_do_moc VARCHAR(50) PRIMARY KEY,
    ma_nguoi_dung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung) ON DELETE CASCADE,
    ma_moc VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES moc_bai_hoc(ma_moc) ON DELETE CASCADE,
    trang_thai VARCHAR(20) NOT NULL DEFAULT 'DA_MO', -- DA_MO, DANG_LAM, HOAN_THANH
    diem_dat_duoc INT NOT NULL DEFAULT 0,
    xu_da_nhan INT NOT NULL DEFAULT 0,
    thoi_diem_hoan_thanh DATETIME2 NULL,
    CONSTRAINT UQ_nguoi_dung_moc UNIQUE(ma_nguoi_dung, ma_moc)
);
GO

-- 11. TRAN_DAU_1V1
CREATE TABLE tran_dau_1v1 (
    ma_tran VARCHAR(50) PRIMARY KEY,
    ma_mon VARCHAR(50) NULL FOREIGN KEY REFERENCES mon_hoc(ma_mon) ON DELETE SET NULL,
    trang_thai VARCHAR(30) NOT NULL DEFAULT 'CHUAN_BI', -- CHUAN_BI, DANG_THI_DAU, KET_THUC, HUY_TRAN
    thoi_gian_bat_dau DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    thoi_gian_ket_thuc DATETIME2 NULL,
    nguoi_thang_cuoc VARCHAR(50) NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung),
    ly_do_ket_thuc VARCHAR(50) NULL
);
GO

-- 12. NGUOI_CHOI_TRONG_TRAN
CREATE TABLE nguoi_choi_trong_tran (
    ma_nguoi_choi_trong_tran VARCHAR(50) PRIMARY KEY,
    ma_tran VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES tran_dau_1v1(ma_tran) ON DELETE CASCADE,
    ma_nguoi_dung VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_dung(ma_nguoi_dung),
    ma_thu_cung VARCHAR(50) NULL FOREIGN KEY REFERENCES thu_cung(ma_thu_cung),
    mau_hien_tai INT NOT NULL DEFAULT 100,
    mau_toi_da INT NOT NULL DEFAULT 100,
    tong_sat_thuong_gay_ra INT NOT NULL DEFAULT 0,
    ket_qua VARCHAR(20) NOT NULL DEFAULT 'CHUA_KET_THUC', -- CHUA_KET_THUC, THANG, THUA, HOA
    xu_nhan_duoc INT NOT NULL DEFAULT 0,
    exp_nhan_duoc INT NOT NULL DEFAULT 0,
    CONSTRAINT UQ_tran_nguoi_dung UNIQUE(ma_tran, ma_nguoi_dung)
);
GO

-- 13. CAU_HOI_TRONG_TRAN
CREATE TABLE cau_hoi_trong_tran (
    ma_cau_trong_tran VARCHAR(50) PRIMARY KEY,
    ma_tran VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES tran_dau_1v1(ma_tran) ON DELETE CASCADE,
    ma_cau_hoi VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES cau_hoi(ma_cau_hoi),
    thu_tu_cau INT NOT NULL,
    CONSTRAINT UQ_tran_thu_tu UNIQUE(ma_tran, thu_tu_cau)
);
GO

-- 14. LUOT_TRA_LOI
CREATE TABLE luot_tra_loi (
    ma_luot_tra_loi VARCHAR(50) PRIMARY KEY,
    ma_cau_trong_tran VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES cau_hoi_trong_tran(ma_cau_trong_tran) ON DELETE CASCADE,
    ma_nguoi_choi_trong_tran VARCHAR(50) NOT NULL FOREIGN KEY REFERENCES nguoi_choi_trong_tran(ma_nguoi_choi_trong_tran) ON DELETE NO ACTION,
    vi_tri_dap_an_chon INT NULL,
    la_dap_an_dung BIT NOT NULL DEFAULT 0,
    thoi_gian_tra_loi_giay FLOAT NOT NULL DEFAULT 0.0,
    sat_thuong_gay_ra INT NOT NULL DEFAULT 0,
    thoi_diem_tra_loi DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT UQ_cau_nguoi_choi UNIQUE(ma_cau_trong_tran, ma_nguoi_choi_trong_tran)
);
GO

PRINT N'DA KHOI TAO THANH CONG TOAN BO 14 BANG CSDL TOWER OF KNOWLEDGE TRONG SQL SERVER!';
GO
