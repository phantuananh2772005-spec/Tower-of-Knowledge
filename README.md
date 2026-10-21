# 🏰 Tháp Tri Thức (Tower of Knowledge)
> **Nền tảng Học tập Gamification Chuẩn hóa Đại học & Đấu Trường Tri Thức 1v1 Thời Gian Thực**

---

## 🌟 Tổng Quan Dự Án

**Tháp Tri Thức (Tower of Knowledge)** là nền tảng học tập trực tuyến thế hệ mới kết hợp giữa hệ thống quản lý học tập (LMS), cơ chế nhập vai Gamification RPG và Đấu trường đối kháng 1v1 thời gian thực (Real-time Arena).

Hệ thống được thiết kế theo chuẩn **UML Class Diagram v4** và kiến trúc sạch (Clean Architecture), cho phép:
1. **Chạy thực tế với CSDL Microsoft SQL Server** trên máy người dùng (hoặc **PostgreSQL** khi deploy lên Cloud/Render).
2. **Khả năng chuyển dịch 1-1 sang ASP.NET Core (C#)** thông qua việc cô lập toàn bộ quy tắc nghiệp vụ thuần túy (`core/rules/`) và chuẩn hóa hợp đồng API qua **OpenAPI 3.0 (`docs/openapi.yaml`)**.

---

## 🏗️ Cấu Trúc Thư Mục Dự Án

```
tower-of-knowledge/
├── core/
│   └── rules/                  # Quy tắc nghiệp vụ thuần hàm (Pure Functions, sẵn sàng port C#)
│       ├── combat.rules.js     # Đấu trường 1v1: Tính sát thương, chí mạng tốc độ, K.O.
│       ├── economy.rules.js    # Kinh tế: Xu Tri Thức, suy dẫn Danh hiệu từ EXP (không tụt)
│       ├── progression.rules.js# Lộ trình: Đánh giá trắc nghiệm, phần trăm, mở khóa tuần tự
│       └── streak.rules.js     # Streak: Múi giờ UTC+7, kiểm tra chuỗi ngày lười (Lazy Evaluation)
├── database/
│   ├── migrations/             # Kịch bản DDL khởi tạo toàn bộ 14 bảng CSDL
│   │   ├── 001_mssql_initial_schema.sql
│   │   └── 001_postgres_initial_schema.sql
│   ├── seed_mssql.sql          # Dữ liệu mẫu chuẩn hóa 4 chương & 16 câu hỏi CSDL
│   ├── seed_postgres.sql
│   ├── db.js                   # Adapter CSDL đa nền tảng (SQL Server / PostgreSQL)
│   └── migrate.js              # Bộ chạy migration tự động
├── docs/
│   └── openapi.yaml            # Đặc tả hợp đồng API OpenAPI 3.0 chuẩn hóa
├── middlewares/
│   ├── auth.middleware.js      # Xác thực JWT Bearer & phân quyền Quản trị viên
│   └── response.middleware.js  # Chuẩn hóa phong bì phản hồi { success, data, error, timestamp }
├── public/                     # Giao diện Web Client
│   ├── index.html              # Ứng dụng Học Viên (Bản đồ leo tháp, 1v1 Arena, Thú cưng, Shop)
│   └── admin/
│       └── index.html          # Cổng Quản Trị Hệ Thống (Thống kê KPI, Quản lý giáo trình, Ngân hàng câu hỏi, User)
├── routes/                     # Bộ định tuyến API Express
│   ├── admin.routes.js
│   ├── arena.routes.js
│   ├── auth.routes.js
│   ├── course.routes.js
│   ├── economy.routes.js
│   └── pet.routes.js
├── services/                   # Tầng dịch vụ logic hệ thống
├── sockets/
│   └── arena.socket.js         # Socket.IO điều phối ghép trận radar & đấu trường 1v1
├── tests/
│   └── test_runner.js          # Bộ kiểm thử tự động 18 test cases đạt 100% pass
├── server.js                   # Entry point máy chủ Express & Socket.IO
└── package.json
```

---

## 🗄️ Mô Hình CSDL (14 Bảng theo Class Diagram v4)

Hệ thống đã khởi tạo hoàn chỉnh và hoạt động trực tiếp trong CSDL **`TowerOfKnowledge`** trên **Microsoft SQL Server**:

1. **`nguoi_dung`**: Tài khoản, phân quyền (`NGUOI_HOC`, `QUAN_TRI_VIEN`), EXP, Xu Tri Thức, Chuỗi Streak, chế độ giao diện, âm thanh.
2. **`thu_cung`**: Danh mục linh thú, hệ số sát thương, giá xu, cấp độ yêu cầu.
3. **`thu_cung_so_huu`**: Quan hệ sở hữu thú cưng (ràng buộc duy nhất tối đa 1 thú cưng kích hoạt).
4. **`giao_dich_xu`**: Sổ cái kinh tế ghi nhận toàn bộ biến động xu (ACID ledger).
5. **`mon_hoc`**: Danh mục môn học (Môn khởi đầu: *Cơ sở Dữ liệu & Hệ Quản trị CSDL*).
6. **`chuong_hoc`**: 4 chương học chuẩn đại học.
7. **`moc_bai_hoc`**: 8 mốc bài học (Lý thuyết, Trắc nghiệm, Thử thách Boss).
8. **`cau_hoi`**: Ngân hàng 16 câu hỏi trắc nghiệm chuyên sâu có giải thích chi tiết.
9. **`tien_do_mon_hoc`**: Tiến độ học tập môn của từng học viên.
10. **`tien_do_moc_bai_hoc`**: Trạng thái từng mốc (`DA_MO`, `DANG_LAM`, `HOAN_THANH`).
11. **`tran_dau_1v1`**: Thông tin các trận đấu đối kháng thời gian thực.
12. **`nguoi_choi_trong_tran`**: Trạng thái máu (100 HP), sát thương gây ra, kết quả trận.
13. **`cau_hoi_trong_tran`**: 5 câu hỏi được rút ngẫu nhiên cho mỗi trận đấu.
14. **`luot_tra_loi`**: Chi tiết từng lượt trả lời của người chơi trong trận đấu.

---

## 🔑 Tài Khoản Mặc Định Được Thiết Lập Sẵn

| Vai trò | Tên đăng nhập | Mật khẩu | Đặc quyền |
|---|---|---|---|
| **Quản trị viên (Admin)** | `admin` | `Admin123@` | Toàn quyền Quản trị, Thống kê, Quản lý giáo trình, Ngân hàng câu hỏi, Phân quyền user |
| **Học viên Demo** | `demo_user` | `User123@` | Dũng Sĩ SQL, sở hữu Rồng Sparky, chuỗi 3 ngày streak, sẵn sàng làm bài và đấu 1v1 |
| **Chiến Binh Bot** | `rival_bot` | `Bot123@` | Đối thủ tự động trong Đấu trường 1v1 khi không có người chơi chờ trong hàng đợi |

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy

### 1. Cài đặt phụ thuộc
```bash
npm install
```

### 2. Khởi tạo CSDL & Nạp dữ liệu mẫu
- Với Microsoft SQL Server nội bộ (Windows Auth):
```bash
npm run migrate
```

### 3. Chạy bộ kiểm thử tự động
```bash
npm test
```
*Kết quả: 18/18 test cases vượt qua thành công 100% bao gồm cả Pure Rules và Live SQL Server Queries.*

### 4. Khởi chạy Server
```bash
npm start
```

Truy cập trên trình duyệt:
- **Ứng dụng Học Viên**: [http://localhost:3000/](http://localhost:3000/)
- **Cổng Quản Trị Hệ Thống**: [http://localhost:3000/admin/](http://localhost:3000/admin/)
- **Kiểm tra sức khỏe API**: [http://localhost:3000/health](http://localhost:3000/health)

---

## 🎮 Các Tính Năng Nổi Bật

- **Bản Đồ Leo Tháp Uốn Lượn**: Thể hiện trực quan các mốc bài học đã hoàn thành, mốc đang mở, mốc bị khóa và cổng đột phá Boss.
- **Đấu Trường 1v1 Thời Gian Thực (Socket.IO)**: Radar quét tìm trận, màn hình VS 3-2-1, tính toán sát thương tốc độ, hoạt ảnh tung đòn, hiệu ứng rung lắc và âm thanh Web Audio tổng hợp không cần tải file ngoài.
- **Linh Thú Đồng Hành**: Hệ thống Pet (Rồng Sparky, Hồ Ly Kitsune, Thạch Cự Nhân Golem) tăng hệ số sát thương và hỗ trợ tích lũy EXP.
- **Hệ Thống Sổ Cái Minh Bạch**: Giao dịch xu được bảo vệ toàn vẹn dữ liệu (ACID ledger).
- **Cổng Quản Trị Toàn Diện**: Thống kê KPI thời gian thực, quản lý giáo trình động, nhập câu hỏi hàng loạt (JSON/CSV), quản lý phân quyền và thưởng xu người học.
