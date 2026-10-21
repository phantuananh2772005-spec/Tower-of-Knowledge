-- =======================================================================
-- SEED DATA: 002_seed_mssql.sql
-- Du an: Tower of Knowledge (Giao trinh Co so Du lieu & Dau truong 1v1)
-- =======================================================================

USE TowerOfKnowledge;
GO
SET ANSI_NULLS ON;
GO
SET QUOTED_IDENTIFIER ON;
GO

-- 1. NGUOI DUNG MAC DINH
-- Mat khau admin: Admin123@ ($2a$10$RE9vsn6NderNjirHDtSP9urgC/WotN.WfzRPbhJ.KGNMT1F8wGOnm)
-- Mat khau demo: User123@ ($2a$10$W04xIE.JXjb4d6l0vksEzOHJXn60IrjvN42c1/tTqDEoqJmwgq806)
-- Mat khau bot: Bot123@ ($2a$10$W04xIE.JXjb4d6l0vksEzOHJXn60IrjvN42c1/tTqDEoqJmwgq806)

INSERT INTO nguoi_dung (ma_nguoi_dung, ten_dang_nhap, email, mat_khau_hash, ten_hien_thi, khung_avatar, vai_tro, tong_diem_kinh_nghiem, xu_tri_thuc, chuoi_streak_ngay, ngay_hoat_dong_cuoi, che_do_giao_dien, bat_am_thanh)
VALUES 
('usr_admin_001', 'admin', 'admin@towerofknowledge.edu.vn', '$2a$10$RE9vsn6NderNjirHDtSP9urgC/WotN.WfzRPbhJ.KGNMT1F8wGOnm', N'Đại Sư Quản Trị', 'khung_vang_dai_su', 'QUAN_TRI_VIEN', 2500, 850, 7, CAST(SYSDATETIME() AS DATE);
GO

-- 2. THU CUNG
INSERT INTO thu_cung (ma_thu_cung, ten_thu_cung, mo_ta, anh_dai_dien, spritesheet_url, gia_xu, cap_do_yeu_cau, he_so_sat_thuong)
VALUES
('pet_sparky', N'Rồng Lửa Sparky', N'Linh thú hệ Lửa mang ngọn lửa nhiệt huyết tri thức. Tăng 15% sát thương khi trả lời trúng tốc độ.', 'sparky_avatar.png', 'sparky_sheet.png', 0, 1, 1.15),
('pet_kitsune', N'Hồ Ly Kitsune', N'Linh thú hệ Bí Ẩn với chín đuôi phép thuật. Khả năng né đòn và tăng 20% sát thương đòn đánh.', 'kitsune_avatar.png', 'kitsune_sheet.png', 150, 1, 1.20),
('pet_golem', N'Thạch Cự Nhân Golem', N'Hộ vệ vách đá kiên cố cổ xưa. Tăng 25% chống chịu sát thương từ sai sót kiến thức.', 'golem_avatar.png', 'golem_sheet.png', 300, 2, 1.10);
GO

-- 3. THU CUNG SO HUU
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
INSERT INTO thu_cung_so_huu (ma_so_huu, ma_nguoi_dung, ma_thu_cung, dang_kich_hoat)
VALUES
('own_demo_01', 'usr_demo_002', 'pet_sparky', 1),
('own_admin_01', 'usr_admin_001', 'pet_kitsune', 1),
('own_bot_01', 'usr_bot_003', 'pet_golem', 1);
GO

-- 4. MON HOC: CO SO DU LIEU
INSERT INTO mon_hoc (ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu)
VALUES
('mon_csdl', N'Cơ sở Dữ liệu & Hệ Quản trị CSDL (Database Systems)', 'co-so-du-lieu', N'Giáo trình toàn diện chuẩn đại học về Cơ sở Dữ liệu Quan hệ, Thiết kế mô hình ERD, Chuẩn hóa 1NF - 3NF, và Ngôn ngữ Truy vấn SQL chuẩn Quốc tế.', 'banner_csdl.jpg', 1);
GO

-- 5. CHUONG HOC (4 CHUONG HOAN CHINH)
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES
('ch_csdl_01', 'mon_csdl', N'Chương 1: Tổng quan về Hệ Cơ sở Dữ liệu', 1, N'Khái niệm dữ liệu, hệ thống tập tin vs DBMS, kiến trúc 3 mức trừu tượng ANSI/SPARC.'),
('ch_csdl_02', 'mon_csdl', N'Chương 2: Mô hình Dữ liệu Quan hệ & Thiết kế ERD', 2, N'Khái niệm quan hệ, thuộc tính, bộ, các loại khóa (Primary Key, Foreign Key) và mô hình Thực thể - Quan hệ.'),
('ch_csdl_03', 'mon_csdl', N'Chương 3: Ngôn ngữ Truy vấn SQL (DDL, DML & JOIN)', 3, N'Thực hành lệnh SELECT, WHERE, GROUP BY, HAVING, ORDER BY và các phép kết bảng INNER/LEFT/RIGHT JOIN.'),
('ch_csdl_04', 'mon_csdl', N'Chương 4: Ràng buộc Toàn vẹn & Chuẩn hóa CSDL (1NF - 3NF)', 4, N'Phụ thuộc hàm, phân rã lược đồ và thuật toán chuẩn hóa khử dư thừa dữ liệu.');
GO

-- 6. MOC BAI HOC (8 MOC HOAN CHINH)
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu)
VALUES
-- Chuong 1
('moc_csdl_01_01', 'ch_csdl_01', N'Mốc 1.1: Khái niệm CSDL & Các Mức Trừu Tượng Dữ Liệu', 'LY_THUYET', 
N'### 1. Dữ liệu (Data) và Thông tin (Information)
- **Dữ liệu**: Là các sự kiện, số liệu thô chưa qua xử lý (ví dụ: điểm số 8.5, chuỗi ký tự "Nguyen Van A").
- **Thông tin**: Là dữ liệu đã được xử lý, tổ chức và đặt vào ngữ cảnh có ý nghĩa (ví dụ: "Sinh viên Nguyen Van A đạt điểm tổng kết 8.5 xếp loại Giỏi").

### 2. Định nghĩa Hệ Cơ sở Dữ liệu (DBMS)
Một **Hệ Quản trị Cơ sở Dữ liệu (Database Management System - DBMS)** là phần mềm hệ thống cho phép định nghĩa, tạo lập, lưu trữ, truy vấn và quản lý an toàn dữ liệu trên bộ nhớ phụ.

### 3. Kiến trúc 3 mức trừu tượng ANSI/SPARC
1. **Mức Ngoài (External Level / View Level)**: Khung nhìn dữ liệu cho từng nhóm người dùng hoặc ứng dụng cụ thể.
2. **Mức Quan niệm (Conceptual Level / Logical Level)**: Mô tả toàn bộ cấu trúc dữ liệu của tổ chức (các thực thể, quan hệ, kiểu dữ liệu, ràng buộc). Không phụ thuộc cách lưu trữ vật lý.
3. **Mức Trong / Vật lý (Internal / Physical Level)**: Mô tả chi tiết cách dữ liệu được ghi trên đĩa (cấu trúc file, B-Tree index, băm, phân đoạn đĩa).

### 4. Tính Độc lập Dữ liệu (Data Independence)
- **Độc lập Dữ liệu Logic**: Khả năng thay đổi lược đồ quan niệm mà không làm thay đổi các ứng dụng ở mức ngoài.
- **Độc lập Dữ liệu Vật lý**: Khả năng thay đổi cấu trúc lưu trữ hoặc thiết bị đĩa vật lý mà không cần sửa đổi lược đồ logic hay ứng dụng.', 
15, 10, 1),

('moc_csdl_01_02', 'ch_csdl_01', N'Mốc 1.2: Trắc nghiệm Kiến thức Cốt lõi DBMS', 'TRAC_NGHIEM', NULL, 25, 20, 2),

-- Chuong 2
('moc_csdl_02_01', 'ch_csdl_02', N'Mốc 2.1: Mô hình Quan hệ & Mô hình Thực thể - Quan hệ (ERD)', 'LY_THUYET',
N'### 1. Mô hình Dữ liệu Quan hệ (Relational Model)
Do Edgar F. Codd đề xuất năm 1970 tại IBM, dựa trên lý thuyết tập hợp toán học:
- **Quan hệ (Relation)**: Một bảng gồm các hàng và cột.
- **Bộ (Tuple)**: Một hàng dữ liệu đại diện cho một đối tượng cụ thể.
- **Thuộc tính (Attribute)**: Một cột đặc trưng cho một tính chất của đối tượng.
- **Miền giá trị (Domain)**: Tập hợp các giá trị hợp lệ mà một thuộc tính có thể nhận.

### 2. Các loại Khóa trong CSDL Quan hệ
- **Siêu khóa (Super Key)**: Tập một hoặc nhiều thuộc tính xác định duy nhất mỗi bộ trong quan hệ.
- **Khóa ứng viên (Candidate Key)**: Siêu khóa tối thiểu (không thể bỏ bớt thuộc tính nào mà vẫn là siêu khóa).
- **Khóa chính (Primary Key - PK)**: Một khóa ứng viên được chọn làm định danh chính. Giá trị không được trùng lặp và không được phép NULL (Thực thể toàn vẹn).
- **Khóa ngoại (Foreign Key - FK)**: Một hoặc tập thuộc tính trong bảng này tham chiếu đến Khóa chính của bảng khác (Tham chiếu toàn vẹn).

### 3. Mô hình ERD (Entity-Relationship Diagram)
- **Thực thể (Entity)**: Đối tượng trong thế giới thực có thể phân biệt được (Sinh viên, Lớp học).
- **Mối quan hệ (Relationship)**: Sự liên kết giữa các thực thể (Sinh viên *Theo học* Lớp học).
- **Bản số (Cardinality)**: Tỉ lệ tương quan (1 - 1, 1 - N, N - N). Mối quan hệ N - N khi chuyển sang lược đồ quan hệ bắt buộc phải tách thành một bảng trung gian liên kết.',
15, 10, 1),

('moc_csdl_02_02', 'ch_csdl_02', N'Mốc 2.2: Trắc nghiệm Thiết kế Lược đồ & ERD', 'TRAC_NGHIEM', NULL, 25, 20, 2),

-- Chuong 3
('moc_csdl_03_01', 'ch_csdl_03', N'Mốc 3.1: Ngôn ngữ SQL Cốt lõi (DDL, DML & JOIN)', 'LY_THUYET',
N'### 1. Phân loại câu lệnh SQL
- **DDL (Data Definition Language)**: `CREATE`, `ALTER`, `DROP`, `TRUNCATE` (Định nghĩa cấu trúc bảng).
- **DML (Data Manipulation Language)**: `SELECT`, `INSERT`, `UPDATE`, `DELETE` (Thao tác với dữ liệu).
- **DCL (Data Control Language)**: `GRANT`, `REVOKE` (Phân quyền bảo mật).
- **TCL (Transaction Control Language)**: `COMMIT`, `ROLLBACK`, `SAVEPOINT` (Kiểm soát giao dịch ACID).

### 2. Cấu trúc câu truy vấn SELECT và thứ tự thực thi (Logical Order)
Cú pháp viết:
`SELECT` -> `FROM` -> `WHERE` -> `GROUP BY` -> `HAVING` -> `ORDER BY`

Thứ tự thực thi logic của hệ quản trị:
1. `FROM` & `JOIN` (Xác định nguồn bảng)
2. `WHERE` (Lọc từng dòng)
3. `GROUP BY` (Gom nhóm)
4. `HAVING` (Lọc trên từng nhóm đã gom)
5. `SELECT` (Tính toán và chiếu cột hiển thị)
6. `ORDER BY` (Sắp xếp kết quả cuối)

### 3. Các phép KẾT BẢNG (JOIN)
- **INNER JOIN**: Trả về các dòng có giá trị tương ứng ở cả hai bảng.
- **LEFT JOIN (LEFT OUTER JOIN)**: Trả về toàn bộ dòng từ bảng bên trái, ghép dòng tương ứng từ bảng phải (nếu không có thì trả NULL).
- **RIGHT JOIN**: Ngược lại với LEFT JOIN.
- **FULL OUTER JOIN**: Trả về tất cả các dòng khi có sự khớp ở một trong hai bảng.',
20, 15, 1),

('moc_csdl_03_02', 'ch_csdl_03', N'Mốc 3.2: Thử thách Truy vấn SQL & Gom nhóm dữ liệu', 'TRAC_NGHIEM', NULL, 30, 25, 2),

-- Chuong 4
('moc_csdl_04_01', 'ch_csdl_04', N'Mốc 4.1: Phụ thuộc hàm & Chuẩn hóa CSDL (1NF, 2NF, 3NF)', 'LY_THUYET',
N'### 1. Mục đích của Chuẩn hóa CSDL
Tránh hiện tượng dư thừa dữ liệu (Data Redundancy) và ngăn ngừa các dị thường dữ liệu (Anomalies):
- Dị thường Thêm mới (Insertion Anomaly)
- Dị thường Xóa (Deletion Anomaly)
- Dị thường Cập nhật (Update Anomaly)

### 2. Phụ thuộc hàm (Functional Dependency: X -> Y)
Với bất kỳ hai bộ t1, t2 trong quan hệ R, nếu t1[X] = t2[X] thì luôn suy ra t1[Y] = t2[Y].

### 3. Các Dạng chuẩn Cơ bản:
- **1NF (Dạng chuẩn 1)**: Tất cả các thuộc tính đều chứa giá trị nguyên tố (Atomic values), không chứa thuộc tính lặp hoặc đa trị.
- **2NF (Dạng chuẩn 2)**: Đạt 1NF VÀ mọi thuộc tính không khóa phải phụ thuộc hàm đầy đủ vào khóa chính (không được phụ thuộc một phần khóa chính phức hợp).
- **3NF (Dạng chuẩn 3)**: Đạt 2NF VÀ không tồn tại phụ thuộc bắc cầu giữa các thuộc tính không khóa (mọi thuộc tính không khóa đều phụ thuộc trực tiếp vào khóa chính, không thông qua thuộc tính không khóa khác).
- **BCNF (Boyce-Codd Normal Form)**: Với mọi phụ thuộc hàm không tầm thường X -> Y, X bắt buộc phải là một siêu khóa.',
20, 15, 1),

('moc_csdl_04_02', 'ch_csdl_04', N'Mốc 4.2: TRẬN ĐẤU BOSS CUỐI - Đại Chiến Chuẩn Hóa CSDL', 'THU_THACH_BOSS', NULL, 50, 50, 2);
GO

-- 7. NGAN HANG CAU HOI (16 CAU HOI CHUYEN SAU CHO 4 CHUONG)
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho)
VALUES
-- Chuong 1: Mốc 1.2 (4 câu)
('q_csdl_01', 'moc_csdl_01_02', N'Đặc tính nào cho phép thay đổi cấu trúc bảng ở mức quan niệm (như thêm cột mới) mà không làm ảnh hưởng đến các chương trình ứng dụng của người dùng?', 'TRAC_NGHIEM_4', 
N'Độc lập dữ liệu vật lý (Physical Data Independence)', 
N'Độc lập dữ liệu logic (Logical Data Independence)', 
N'Tính toàn vẹn thực thể (Entity Integrity)', 
N'Kiểm soát đồng thời (Concurrency Control)', 
1, N'Độc lập dữ liệu logic là khả năng sửa đổi lược đồ mức quan niệm mà không cần thay đổi lược đồ mức ngoài hoặc các ứng dụng phụ thuộc.', 1),

('q_csdl_02', 'moc_csdl_01_02', N'Trong kiến trúc 3 mức trừu tượng ANSI/SPARC, mức nào mô tả cách dữ liệu thực sự được tổ chức và lưu trữ trên thiết bị đĩa vật lý (B-tree, hashing, blocks)?', 'TRAC_NGHIEM_4', 
N'Mức Khung nhìn (View Level)', 
N'Mức Quan niệm (Conceptual Level)', 
N'Mức Trong / Vật lý (Internal Level)', 
N'Mức Logic (Logical Level)', 
2, N'Mức Trong (Internal/Physical Level) là mức thấp nhất, đặc tả cấu trúc lưu trữ vật lý, phương pháp lập chỉ mục và cấp phát khối đĩa.', 1),

('q_csdl_03', 'moc_csdl_01_02', N'Nhược điểm cốt lõi của việc lưu trữ dữ liệu bằng hệ thống tập tin (File System) truyền thống so với Hệ quản trị CSDL (DBMS) là gì?', 'TRAC_NGHIEM_4', 
N'Không thể lưu trữ các file có dung lượng lớn hơn 1GB', 
N'Dư thừa dữ liệu, thiếu nhất quán và khó kiểm soát truy cập đồng thời', 
N'Không thể viết mã nguồn bằng các ngôn ngữ hiện đại như Python hay C#', 
N'Tốc độ đọc tuần tự chậm hơn DBMS trong mọi trường hợp', 
1, N'Hệ thống tập tin gây ra hiện tượng trùng lặp dữ liệu giữa các phòng ban, dẫn đến thiếu nhất quán khi cập nhật và không có cơ chế giao dịch ACID an toàn.', 1),

('q_csdl_04', 'moc_csdl_01_02', N'Thành phần nào trong kiến trúc DBMS chịu trách nhiệm đảm bảo các thuộc tính ACID của giao dịch, đặc biệt là tính Bền vững (Durability)?', 'TRAC_NGHIEM_4', 
N'Bộ tối ưu hóa truy vấn (Query Optimizer)', 
N'Bộ phân tích cú pháp (Parser)', 
N'Bộ quản lý phục hồi và nhật ký ghi trước (Recovery & WAL Manager)', 
N'Bộ biên dịch DDL (DDL Compiler)', 
2, N'Recovery Manager kết hợp với cơ chế Write-Ahead Logging (WAL) đảm bảo dữ liệu giao dịch đã commit không bao giờ bị mất ngay cả khi hệ thống sập nguồn.', 2),

-- Chuong 2: Mốc 2.2 (4 câu)
('q_csdl_05', 'moc_csdl_02_02', N'Quy tắc Toàn vẹn Thực thể (Entity Integrity Constraint) trong mô hình dữ liệu quan hệ quy định điều gì?', 'TRAC_NGHIEM_4', 
N'Khóa ngoại không được tham chiếu tới một dòng không tồn tại', 
N'Không có thuộc tính nào thuộc Khóa chính được mang giá trị NULL', 
N'Tất cả các thuộc tính phải có kiểu dữ liệu là số nguyên', 
N'Mỗi bảng phải có ít nhất hai khóa ngoại liên kết', 
1, N'Toàn vẹn thực thể yêu cầu khóa chính phải nhận diện duy nhất từng thực thể, do đó không một thành phần nào của khóa chính được phép NULL.', 1),

('q_csdl_06', 'moc_csdl_02_02', N'Khi chuyển đổi một mối quan hệ nhiều - nhiều (N - N) giữa hai thực thể SinhVien và MonHoc sang mô hình quan hệ, giải pháp chuẩn là gì?', 'TRAC_NGHIEM_4', 
N'Đặt khóa chính của SinhVien vào làm khóa ngoại trong bảng MonHoc', 
N'Đặt khóa chính của MonHoc vào làm khóa ngoại trong bảng SinhVien', 
N'Tạo một bảng liên kết trung gian chứa khóa ngoại của cả hai thực thể', 
N'Gộp hai thực thể thành một bảng duy nhất với cột mảng (array)', 
2, N'Mối quan hệ N-N bắt buộc phải được chuẩn hóa thành một bảng kết hợp (Junction/Bridge table) chứa khóa ngoại tham chiếu đến cả hai thực thể.', 1),

('q_csdl_07', 'moc_csdl_02_02', N'Khóa ngoại (Foreign Key) có bắt buộc phải tham chiếu đến Khóa chính (Primary Key) của bảng khác không?', 'TRAC_NGHIEM_4', 
N'Bắt buộc phải là Khóa chính, không thể tham chiếu cột nào khác', 
N'Có thể tham chiếu tới Khóa chính hoặc một Khóa ứng viên duy nhất (Unique Key)', 
N'Có thể tham chiếu tới bất kỳ cột nào, kể cả cột có nhiều giá trị trùng lặp', 
N'Khóa ngoại không cần tham chiếu đến bất kỳ bảng nào', 
1, N'Khóa ngoại có thể tham chiếu tới Khóa chính (PK) hoặc bất kỳ thuộc tính nào có ràng buộc UNIQUE trong bảng được tham chiếu.', 2),

('q_csdl_08', 'moc_csdl_02_02', N'Hành vi ON DELETE CASCADE trong định nghĩa khóa ngoại có ý nghĩa gì?', 'TRAC_NGHIEM_4', 
N'Ngăn cấm việc xóa bản ghi cha nếu còn bản ghi con tham chiếu', 
N'Khi dòng cha bị xóa, tất cả các dòng con tham chiếu đến nó sẽ tự động bị xóa theo', 
N'Đặt giá trị của khóa ngoại ở bảng con thành NULL khi dòng cha bị xóa', 
N'Thông báo cảnh báo nhưng vẫn giữ nguyên dữ liệu con mồ côi', 
1, N'CASCADE tự động lan truyền thao tác xóa từ bảng cha xuống tất cả các bản ghi phụ thuộc ở bảng con.', 1),

-- Chuong 3: Mốc 3.2 (4 câu)
('q_csdl_09', 'moc_csdl_03_02', N'Sự khác nhau cơ bản giữa mệnh đề WHERE và HAVING trong câu lệnh truy vấn SQL là gì?', 'TRAC_NGHIEM_4', 
N'WHERE và HAVING hoàn toàn giống nhau, có thể thay thế cho nhau', 
N'WHERE lọc dữ liệu trên từng dòng trước khi gom nhóm; HAVING lọc trên các nhóm sau GROUP BY', 
N'HAVING chỉ dùng được với các câu lệnh UPDATE và DELETE', 
N'WHERE cho phép sử dụng các hàm gộp (COUNT, AVG) còn HAVING thì không', 
1, N'Mệnh đề WHERE lọc từng bản ghi trước khi GROUP BY, do đó không dùng được hàm tổng hợp; HAVING lọc trên kết quả tổng hợp của nhóm.', 2),

('q_csdl_10', 'moc_csdl_03_02', N'Kết quả của phép truy vấn LEFT JOIN giữa bảng A (5 dòng) và bảng B (3 dòng) sẽ luôn chứa tối thiểu bao nhiêu dòng?', 'TRAC_NGHIEM_4', 
N'0 dòng', 
N'3 dòng', 
N'5 dòng', 
N'15 dòng', 
2, N'LEFT JOIN giữ lại toàn bộ các dòng từ bảng bên trái (bảng A), do đó kết quả luôn có tối thiểu 5 dòng (nếu không có điều kiện WHERE thu hẹp).', 2),

('q_csdl_11', 'moc_csdl_03_02', N'Thứ tự thực thi logic nào sau đây là đúng của một câu truy vấn SQL chuẩn?', 'TRAC_NGHIEM_4', 
N'SELECT -> FROM -> WHERE -> GROUP BY -> HAVING -> ORDER BY', 
N'FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY', 
N'FROM -> SELECT -> WHERE -> HAVING -> GROUP BY -> ORDER BY', 
N'WHERE -> FROM -> GROUP BY -> SELECT -> HAVING -> ORDER BY', 
1, N'Hệ quản trị CSDL thực thi FROM/JOIN đầu tiên để lấy tập dữ liệu, sau đó WHERE, GROUP BY, HAVING, rồi mới chiếu SELECT và cuối cùng là ORDER BY.', 2),

('q_csdl_12', 'moc_csdl_03_02', N'Hàm gộp COUNT(ten_cot) khác với COUNT(*) như thế nào trong SQL chuẩn?', 'TRAC_NGHIEM_4', 
N'Không có sự khác nhau nào cả', 
N'COUNT(ten_cot) bỏ qua các giá trị NULL, còn COUNT(*) đếm toàn bộ các hàng bất kể NULL', 
N'COUNT(*) chỉ đếm các hàng có số chẵn', 
N'COUNT(ten_cot) chỉ thực hiện được trên cột số nguyên', 
1, N'COUNT(cột) chỉ tính các dòng mà cột đó có giá trị khác NULL, còn COUNT(*) đếm tất cả các dòng thỏa mãn điều kiện.', 2),

-- Chuong 4: Mốc 4.2 - BOSS BATTLE (4 câu phân loại chuyên sâu)
('q_csdl_13', 'moc_csdl_04_02', N'[BOSS BATTLE 1] Cho lược đồ quan hệ R(A, B, C, D) với khóa chính là (A, B). Phụ thuộc hàm nào sau đây vi phạm Dạng Chuẩn 2 (2NF)?', 'TRAC_NGHIEM_4', 
N'(A, B) -> C', 
N'A -> C', 
N'C -> D', 
N'(A, B) -> D', 
1, N'Phụ thuộc hàm A -> C là phụ thuộc bộ phận: thuộc tính không khóa C chỉ phụ thuộc vào một phần của khóa chính (A), vi phạm trực tiếp định nghĩa 2NF.', 3),

('q_csdl_14', 'moc_csdl_04_02', N'[BOSS BATTLE 2] Cho quan hệ R(MaSV, TenSV, MaKhoa, TenKhoa) với MaSV là khóa chính, tồn tại các phụ thuộc hàm: MaSV -> MaKhoa và MaKhoa -> TenKhoa. Lược đồ này đạt dạng chuẩn nào cao nhất?', 'TRAC_NGHIEM_4', 
N'1NF', 
N'2NF', 
N'3NF', 
N'BCNF', 
1, N'Lược đồ đạt 2NF vì khóa là MaSV đơn nên không có phụ thuộc bộ phận. Tuy nhiên, tồn tại phụ thuộc bắc cầu MaSV -> MaKhoa -> TenKhoa nên vi phạm 3NF.', 3),

('q_csdl_15', 'moc_csdl_04_02', N'[BOSS BATTLE 3] Điều kiện cần và đủ để một lược đồ quan hệ đạt Dạng chuẩn Boyce-Codd (BCNF) là gì?', 'TRAC_NGHIEM_4', 
N'Đạt 3NF và không chứa thuộc tính kiểu ngày giờ', 
N'Với mọi phụ thuộc hàm không tầm thường X -> Y, X bắt buộc phải là một Siêu khóa (Super Key)', 
N'Tất cả các khóa ứng viên chỉ được phép có tối đa một thuộc tính', 
N'Bảng không được có quá 10 thuộc tính', 
1, N'Định nghĩa BCNF đòi hỏi vế trái (X) của mọi phụ thuộc hàm không tầm thường X -> Y phải là một Siêu khóa (Super Key).', 3),

('q_csdl_16', 'moc_csdl_04_02', N'[BOSS BATTLE 4] Trong giao dịch CSDL (Transaction), hiện tượng Non-repeatable Read (Đọc không lặp lại) được ngăn chặn triệt để ở mức cô lập (Isolation Level) tối thiểu nào?', 'TRAC_NGHIEM_4', 
N'Read Uncommitted', 
N'Read Committed', 
N'Repeatable Read', 
N'Serializable', 
2, N'Mức Repeatable Read khóa các dòng đã đọc trong suốt thời gian giao dịch diễn ra, ngăn chặn hoàn toàn giao dịch khác sửa đổi dữ liệu đó (Non-repeatable read).', 3);
GO

-- 8. TIEN DO MAC DINH CHO NGUOI DUNG DEMO
-- No pre-seeded progression: clean fresh start

-- Mốc 1.1 đã hoàn thành, Mốc 1.2 đã mở sẵn sàng làm
-- No pre-seeded checkpoint progress

-- 9. GIAO DICH XU KHOI TAO
INSERT INTO giao_dich_xu (ma_giao_dich, ma_nguoi_dung, so_luong, so_du_sau, nguon_giao_dich, mo_ta)
VALUES
('tx_seed_001', 'usr_demo_002', 150, 150, 'THUONG_STREAK', N'Thưởng duy trì chuỗi Streak 3 ngày'),
('tx_seed_002', 'usr_demo_002', 10, 160, 'THUONG_MOC_HOC', N'Thưởng hoàn thành Mốc 1.1: Khái niệm CSDL');
GO

PRINT N'DA NAP DU LIEU MAU CHUAN GIAO TRINH CO SO DU LIEU THANH CONG VAO SQL SERVER!';
GO
