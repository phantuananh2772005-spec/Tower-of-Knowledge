# 🏰 BẢN TÀI LIỆU BÀN GIAO TOÀN DIỆN DỰ ÁN (PROJECT HANDOVER MANUAL)
> **Dành cho AI Agent kế nhiệm & Đội ngũ Kỹ sư Phát triển (Incoming AI Agents & Developers)**  
> **Cập nhật ngày:** 27/10/2026 | **Phiên bản hệ thống:** v1.0.0 Production Ready

---

## 📌 PHẦN 1: THÔNG TIN TỔNG QUAN & BỐI CẢNH ĐỀ TÀI

### 1.1. Định Danh Đề Tài
* **Tên đề tài chính thức (Báo cáo / Phiếu đăng ký tốt nghiệp):**  
  **"Xây dựng hệ thống học tập trực tuyến tích hợp trò chơi hóa và cơ chế đối kháng thời gian thực"**
* **Tên tiếng Anh:**  
  **"Development of a Gamified E-Learning Platform with Real-Time Competitive Mechanisms"**
* **Tên thương hiệu & Sản phẩm ứng dụng:**  
  **Tháp Tri Thức (Tower of Knowledge)**
* **Tác giả / Sinh viên:** Anh-2005-pta (`s236435@nctu.edu.vn`)
* **Mục tiêu cốt lõi:**  
  Giải quyết vấn đề khô khan, tỷ lệ bỏ dở cao của LMS truyền thống bằng cách kết hợp:
  1. Quản lý học tập theo lộ trình phân cấp mở khóa tuần tự (Saga Map kiểu Duolingo).
  2. Cơ chế kinh tế trò chơi nhập vai (Gamification RPG: EXP, Xu Tri Thức, Chuỗi Streak, Thú cưng).
  3. Đấu trường Tri thức 1v1 đối kháng thời gian thực qua WebSockets (Real-time PvP & Bot AI).

---

## 🌐 PHẦN 2: MÔI TRƯỜNG, ĐỊA CHỈ TRIỂN KHAI & KHO MÃ NGUỒN

### 2.1. Địa chỉ Truy Cập (Endpoints & URLs)
| Môi trường | Loại dịch vụ | URL / Địa chỉ | Ghi chú |
| :--- | :--- | :--- | :--- |
| **Local** | Web App Học Viên | `http://localhost:3000/` | Giao diện học viên, bản đồ tháp, 1v1, shop |
| **Local** | Cổng Quản Trị Hệ Thống | `http://localhost:3000/admin/` | Quản lý câu hỏi, giáo trình, user, KPI |
| **Local** | Phòng Trưng Bày Linh Thú | `http://localhost:3000/pet-gallery.html` | Review hoạt họa 16 linh thú 24 frames |
| **Local** | Kiểm tra Sức khỏe API | `http://localhost:3000/health` | Trả về JSON trạng thái server & loại DB |
| **Cloud / Staging** | Render Deployment | `https://tower-of-knowledge.onrender.com` | Triển khai trên nền tảng Render |
| **Cloud / Staging** | Admin trên Render | `https://tower-of-knowledge.onrender.com/admin/` | Cổng quản trị Cloud |

### 2.2. Kho Mã Nguồn Git (Version Control)
* **GitHub Repository:** `git@github.com:phantuananh2772005-spec/Tower-of-Knowledge.git`
* **Nhánh hoạt động chính (Main Branch):** `main`
* **Thư mục làm việc cục bộ (Local Workspace):**  
  `C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge`

---

## 🏗️ PHẦN 3: KIẾN TRÚC PHẦN MỀM & CÔNG NGHỆ (TECH STACK)

### 3.1. Ngăn Xếp Công Nghệ (Full Tech Stack)
* **Backend Runtime:** Node.js (>= 18.0.0, khuyến nghị Node 20+ hoặc 24 LTS).
* **Web Framework:** Express 4.19+ với kiến trúc RESTful chuẩn hóa.
* **Thời Gian Thực (Real-Time):** Socket.IO 4.7+ (Ghép trận radar, đồng bộ đếm ngược 1v1, tính sát thương đòn đánh).
* **Frontend Client:** 
  * Single Page Application không phụ thuộc framework cồng kềnh (Vanilla JavaScript ES6+ tối ưu tốc độ).
  * Giao diện: Tailwind CSS (Dev build qua CDN Google Antigravity), hỗ trợ Dark/Light Theme.
  * Âm thanh: Web Audio API đa kênh (SFX chiến đấu, click, victory, defeat, countdown).
  * Hoạt họa: Pixel Art Animation 24-frame (chu kỳ 70ms/frame) kết hợp CSS animations.
* **Bảo Mật:** JSON Web Token (JWT) Bearer, băm mật khẩu chuẩn `bcryptjs`, thẩm định điểm số và sát thương 100% phía máy chủ (Server-Side Authoritative).
* **Cơ Sở Dữ Liệu Kép (Dual Database Architecture):**
  * **Môi trường Local:** Microsoft SQL Server (kết nối qua tiện ích hệ thống `sqlcmd` với Windows Authentication hoặc SQL Auth).
  * **Môi trường Cloud:** PostgreSQL (kết nối qua thư viện `pg` Pool với chuỗi kết nối `DATABASE_URL`).
* **Quy Chuẩn Kiến Trúc Sạch (Clean Architecture & C# Portability):**
  * Toàn bộ quy tắc nghiệp vụ lõi (Combat, Economy, Progression, Streak) được cô lập thành các hàm thuần túy (**Pure Functions**) trong thư mục `core/rules/`.
  * Không phụ thuộc framework/DB trong `core/rules/`, sẵn sàng chuyển đổi 1-1 sang **ASP.NET Core (C#)** khi cần.
  * Hợp đồng giao tiếp API được đặc tả chi tiết theo chuẩn **OpenAPI 3.0 (`docs/openapi.yaml`)**.

---

## 📁 PHẦN 4: CẤU TRÚC THƯ MỤC TOÀN DỰ ÁN

```text
tower-of-knowledge/
├── core/
│   └── rules/                  # [RẤT QUAN TRỌNG] Quy tắc nghiệp vụ thuần túy (Pure Functions)
│       ├── combat.rules.js     # Đấu trường 1v1: Tính sát thương, chí mạng tốc độ, K.O.
│       ├── economy.rules.js    # Kinh tế: Xu Tri Thức, suy dẫn Rank 15 bậc từ EXP (không tụt)
│       ├── progression.rules.js# Lộ trình: Tính % hoàn thành, mở khóa tuần tự, điều kiện qua mốc
│       └── streak.rules.js     # Streak: Múi giờ UTC+7, kiểm tra chuỗi ngày lười (Lazy Evaluation)
├── database/
│   ├── migrations/             # Kịch bản DDL khởi tạo 14 bảng CSDL
│   │   ├── 001_mssql_initial_schema.sql
│   │   └── 001_postgres_initial_schema.sql
│   ├── seed_mssql.sql          # Dữ liệu mẫu môn học CSDL cho SQL Server
│   ├── seed_postgres.sql       # Dữ liệu mẫu cho PostgreSQL
│   ├── seed_postgres_cds.sql   # Dữ liệu ngân hàng câu hỏi mở rộng
│   ├── db.js                   # Adapter CSDL đa năng (tự nhận diện MSSQL hoặc PostgreSQL)
│   ├── init_telemetry.js       # Bảng ghi vết hành vi người học & câu hỏi sai
│   └── migrate.js              # Script thực thi migration tự động
├── docs/
│   └── openapi.yaml            # Đặc tả hợp đồng API OpenAPI 3.0 chuẩn hóa
├── middlewares/
│   ├── auth.middleware.js      # Xác thực token JWT & kiểm tra phân quyền QUAN_TRI_VIEN
│   └── response.middleware.js  # Chuẩn hóa phong bì phản hồi { success, data, error, timestamp }
├── public/                     # Giao diện Web Người Dùng
│   ├── index.html              # Ứng dụng chính của Học Viên (Bản đồ leo tháp, 1v1, Pet, Shop)
│   ├── pet-gallery.html        # Phòng Trưng Bày Hoạt Họa 16 Linh Thú (24-frame review)
│   ├── pet-studio.html         # Công cụ quản lý Sprite Studio
│   ├── manifest.json           # Cấu hình PWA cài đặt ứng dụng trên Mobile/Desktop
│   ├── favicon.ico             # Favicon đa kích thước (16, 32, 48, 64px)
│   ├── admin/
│   │   └── index.html          # Cổng Quản Trị Hệ Thống (CMS, Ngân hàng câu hỏi, User, KPI)
│   └── assets/                 # Thư mục tài nguyên đồ họa tĩnh
│       ├── logo_original.jpg   # Ảnh logo gốc chất lượng cao
│       ├── logo.png            # Logo PNG vuông
│       ├── logo_transparent.png# Logo tách nền trong suốt cho Dark/Light mode
│       ├── favicon-32x32.png   # Favicon PNG 32px
│       ├── icon-192.png        # Icon ứng dụng PWA 192px
│       ├── icon-512.png        # Icon ứng dụng PWA 512px
│       └── pets/               # Thư mục 16 Linh thú (mỗi pet chứa raw, processed, spritesheet)
├── routes/                     # Bộ định tuyến API Express
│   ├── admin.routes.js         # API Quản trị viên (CRUD câu hỏi, thống kê KPI, user)
│   ├── arena.routes.js         # API Đấu trường 1v1 & Bảng xếp hạng Leaderboard
│   ├── auth.routes.js          # API Đăng ký, Đăng nhập thường & Google OAuth
│   ├── course.routes.js        # API Môn học, Chương, Mốc bài học, Nộp bài chấm điểm
│   ├── economy.routes.js       # API Giao dịch Xu, Nhiệm vụ ngày, Điểm danh Streak
│   ├── extreme.routes.js       # API Chế độ sinh tồn leo tháp cực hạn
│   ├── pet.routes.js           # API Mua thú cưng, Trang bị thú cưng
│   └── petStudioRoutes.js      # API Hỗ trợ công cụ Pet Studio
├── scripts/                    # Scripts tiện ích hệ thống & seeder dữ liệu
│   └── seed_chapter1_5levels.js# Tự động đồng bộ 5 mốc học & bộ câu hỏi Chương 1
├── services/                   # Tầng xử lý nghiệp vụ tích hợp CSDL
│   ├── admin.service.js
│   ├── arena.service.js        # Logic tạo trận đấu, ghi vết đòn đánh, kết thúc trận
│   ├── auth.service.js
│   ├── course.service.js
│   ├── economy.service.js
│   └── pet.service.js
├── sockets/
│   └── arena.socket.js         # Điều phối WebSocket ghép trận radar & diễn biến 1v1
├── tests/
│   └── test_runner.js          # Bộ kiểm thử tự động (18 test cases cốt lõi đạt 100% pass)
├── tools/                      # ⚠️ [CẢNH BÁO QUAN TRỌNG] Thư mục công cụ xử lý đồ họa (Xem Phần 6)
├── server.js                   # Điểm khởi động chính của máy chủ (Entry Point)
├── package.json                # Cấu hình dự án Node.js & danh mục thư viện
└── README.md                   # Tài liệu tổng quan giới thiệu dự án
```

---

## 🎮 PHẦN 5: CHI TIẾT CÁC PHÂN HỆ TÍNH NĂNG CỐT LÕI

### 5.1. Bản Đồ Leo Tháp Tri Thức (Saga Roadmap)
* **Hiển thị uốn lượn Bezier**: Các mốc bài học hiển thị theo đường cong mượt mà trên nền trời đêm công nghệ, thích ứng hoàn hảo cho cả PC và Mobile.
* **Cơ chế Mở Khóa Tuần Tự**: Người học bắt đầu từ Mốc 1 (Lý thuyết) $\rightarrow$ hoàn thành mới mở Mốc 2 $\rightarrow$ Mốc 3 $\rightarrow$ Thử thách Boss chương.
* **Chấm điểm chống học vẹt**: Câu hỏi phân tầng theo thang nhận thức Bloom (Nhớ, Hiểu, Vận dụng, Phân tích). Khi người học trả lời sai, câu hỏi sẽ được đẩy xuống cuối hàng đợi để học lại cho đến khi thực sự nắm vững.

### 5.2. Đấu Trường Tri Thức 1v1 Thời Gian Thực (Arena 1v1)
* **Radar Tìm Trận (Socket.IO Matchmaking)**: Quét tìm đối thủ trực tuyến có cùng dải điểm.
* **Màn Hình Đối Đầu (Versus Screen)**: Hiệu ứng 3-2-1 hiển thị Avatar, Tên, Cấp bậc và Hoạt ảnh Linh thú của 2 bên.
* **Cơ chế Tính Sát Thương Tốc Độ (Speed-Critical Combat)**:
  * Trả lời đúng trong vòng dưới 2 giây: Kích hoạt đòn đánh chí mạng (Critical Hit x1.5 sát thương).
  * Kỹ năng **Khiên Chắn (Shield)**: Giảm 50% sát thương từ đối thủ khi gặp câu hỏi khó.
  * Đòn đánh kích hoạt hiệu ứng rung lắc (shake), nhảy số sát thương nổi và hoạt ảnh linh thú tấn công.
* **Cơ chế Bảo vệ Chờ Đợi (Fallback Bot AI)**: Sau 15 giây nếu không ghép được người thật, hệ thống tự động ghép với 1 trong 4 Bot AI thông minh.

### 5.3. Hệ Thống 16 Linh Thú Pixel Art Hoàn Chỉnh (Pet System)
Mỗi linh thú được thiết kế chuẩn Pixel Art, sở hữu hoạt họa **24 frames mượt mà / trạng thái** (chu kỳ 70ms/frame):
1. **10 Linh Thú Đồng Hành Cho Học Viên**:
   - `dragon` (Rồng Nhỏ Sparky - Khởi đầu)
   - `fox` (Cáo Lửa Kitsune)
   - `pyra_phoenix` (Phượng Hoàng Lửa Pyra)
   - `kim_quy_turtle` (Rùa Thần Kim Quy)
   - `stone_golem` (Người Đá Golem)
   - `maneki_neko` (Mèo Thần Tài Neko)
   - `bambo_panda` (Gấu Trúc Bambo)
   - `byte_robot` (Robot Khối Byte)
   - `astra_stag` (Hươu Tinh Tú Astra)
   - `kylin_qilin` (Kỳ Lân Mây Kylin)
   - `inky_octopus` (Bạch Tuộc Học Giả Inky)
   - `spike_hedgehog` (Nhím Ghi Chú Spike)
2. **4 Linh Thú Chiến Đấu DÀNH RIÊNG CHO BOT (Mặt hướng Trái vào người chơi)**:
   - `bot_gloop`: Slime Mọt Sách Gloop (Đấu sĩ Tập sự - Mũ cử nhân & bút chì).
   - `bot_tickbot`: Cú Cót Tickbot (Chiến binh Đồng hồ - Cơ khí Steampunk bánh răng).
   - `bot_glitchy`: Bóng Ma Lỗi Glitchy (Bóng ma mạng - Lỗi Byte 8-bit neon).
   - `bot_dracobot`: Long Giáp Dracobot (Trùm Cơ Khí Boss - Rồng giáp titan plasma).
3. **2 Linh Thú Thần Thoại DÀNH RIÊNG CHO ADMIN (Mặt hướng Phải cùng phía người chơi)**:
   - `admin_aurum`: Kim Long Aurum 👑 (Thần thú Hoàng Kim tối thượng).
   - `admin_nguyet`: Thỏ Nguyệt Thẩm Phán 👑 (Thỏ cung trăng áo quan tư pháp cầm búa công lý, xóa sạch 100% watermark Gemini).
   - *Bảo mật*: Chỉ tài khoản vai trò `QUAN_TRI_VIEN` mới trang bị được; học viên thường chỉ thấy huy hiệu khóa `👑 Dành riêng Admin`.

### 5.4. Kinh Tế Ảo, Streak & Nhiệm Vụ Hằng Ngày
* **Kinh tế**: Xu Tri Thức nhận được qua học bài và thắng trận; dùng để mở khóa linh thú trong Cửa hàng.
* **EXP & Hệ Thống Rank Không Tụt**: Tích lũy EXP để thăng cấp qua 5 đại bậc (Khởi nguyên $\rightarrow$ Tinh thông $\rightarrow$ Vững vàng $\rightarrow$ Xuất chúng $\rightarrow$ Đỉnh cao). Điểm EXP và Rank chỉ tăng chứ không bao giờ bị trừ khi mua sắm.
* **Chuỗi Ngày Chăm Chỉ (Streak UTC+7)**: Thuật toán *Lazy Evaluation* kiểm tra thời điểm học gần nhất so với hôm nay theo múi giờ Việt Nam mà không cần cron job nền phức tạp.

---

## ⚠️ PHẦN 6: CẢNH BÁO QUAN TRỌNG VỀ THƯ MỤC `tools/` VÀ CÁC FILE PYTHON (`.py`)

> [!CAUTION]
> **THÔNG BÁO QUAN TRỌNG CHO AI AGENT HOẶC KỸ SƯ KẾ NHIỆM:**
> Trong thư mục dự án cục bộ có thư mục `tools/` chứa nhiều tệp mã nguồn Python (`.py`). Bạn cần đọc kỹ các ghi chú dưới đây trước khi thao tác!

### 6.1. Bản Chất của Các Tệp `.py` trong `tools/`
* **KHÔNG PHẢI MÃ NGUỒN CHẠY RUNTIME CỦA SERVER!**  
  Máy chủ web chính (`server.js`) chạy hoàn toàn 100% bằng **Node.js**. Không có bất kỳ endpoint nào của web gọi trực tiếp đến Python khi phục vụ người dùng.
* **ĐÂY LÀ PIPELINE XỬ LÝ ĐỒ HỌA THỜI ĐIỂM THIẾT KẾ (Build-Time / Asset Generation Pipelines):**  
  Các script Python này được tạo ra để phục vụ quá trình:
  - Tách frame từ video gốc độ phân giải 1280x720 24fps do AI sinh ra.
  - Xóa phông xanh Chroma-keying chuẩn điện ảnh.
  - Thuật toán khử quang sai & tẩy xóa logo watermark Gemini trên pet Thỏ Nguyệt (`tools/qa_logo_removal.py`, `tools/process_batch3_bot_admin.py`).
  - Lật hướng mặt nhân vật (horizontal flip) để bảo đảm đúng góc nhìn chiến đấu.
  - Cắt và xuất ảnh Spritesheet dải dài (`_strip.png`) và ảnh động GIF mượt 24 frame (`_idle.gif`, `_attack.gif`).
  - Bóc tách nền trắng của Logo chính thức bằng thuật toán lan truyền biên BFS Floodfill (`tools/process_logo.py`).

### 6.2. Danh Mục Các Script Python Quan Trọng trong `tools/`
1. `tools/process_logo.py`:
   - **Mục đích:** Đọc tệp logo gốc do người dùng tải lên, chạy BFS Floodfill từ 4 cạnh để tách nền trắng bên ngoài (giữ nguyên thân rồng tuyết bên trong), tạo ra `logo.png`, `logo_transparent.png`, `favicon.ico`, `favicon-32x32.png`, `icon-192.png`, `icon-512.png`.
   - **Thư viện yêu cầu:** `Pillow`, `numpy`, `scipy`.
2. `tools/process_batch3_bot_admin.py`:
   - **Mục đích:** Pipeline xử lý hoàn chỉnh 4 Bot Pet và 2 Admin Pet từ video `gemini_generated_video_aa6bddb6.mp4`.
   - **Thư viện yêu cầu:** `opencv-python` (`cv2`), `Pillow`, `numpy`.
3. `tools/reprocess_10_pets_smooth.py` & `tools/process_all_12_pets.py`:
   - **Mục đích:** Pipeline sinh 24 frame hoạt họa cho 10 pet học viên đầu tiên.
4. `tools/flip_target_pets.py`:
   - **Mục đích:** Tiện ích đảo hướng quay mặt cho các pet (Kỳ lân, Người đá, Nhím,...).

### 6.3. Hướng Dẫn Quản Lý & Triển Khai (Deployment Precautions)
* **Khi triển khai lên Production (Render / Docker / Vercel):**
  * **KHÔNG CẦN** cài đặt Python, OpenCV hay Pillow trên server production.
  * Toàn bộ thành phẩm đồ họa cuối cùng (ảnh PNG, GIF, ICO) **đã được lưu trữ sẵn trong thư mục `public/assets/`**.
  * Có thể thêm `tools/` vào `.gitignore` hoặc `dockerignore` để giảm dung lượng build của server nếu muốn.
* **Nếu người dùng yêu cầu làm thêm Pet mới từ Video:**
  * Kích hoạt môi trường Python trên máy local:  
    `cmd.exe /c "C:\Users\phant\AppData\Local\Python\bin\python.exe <tên_script.py>"`
  * Sử dụng file `tools/process_batch3_bot_admin.py` làm mẫu chuẩn vì đã tích hợp đầy đủ: cắt lưới 3x2, lọc màu xanh lục bảo vệ chi tiết, tẩy logo và căn tâm chạm đất.

---

## 🔑 PHẦN 7: TÀI KHOẢN ĐĂNG NHẬP & PHÂN QUYỀN HỆ THỐNG

### 7.1. Tài Khoản Quản Trị Viên (Admin)
* **Đường dẫn đăng nhập:** `http://localhost:3000/admin/`
* **Tên đăng nhập (Username):** `admin`
* **Mật khẩu (Password):** `Admin123@`
* **Vai trò trong CSDL:** `QUAN_TRI_VIEN`
* **Quyền hạn:** Quản lý toàn bộ môn học, chương, mốc bài học, ngân hàng câu hỏi trắc nghiệm, quản lý học viên, khóa tài khoản, xem thống kê KPI và tự động sở hữu 2 Linh thú Thần thoại (`admin_aurum`, `admin_nguyet`).

### 7.2. Tài Khoản Học Viên Thử Nghiệm (Learner)
* **Tên đăng nhập:** `hocvien01` / `hocvien02`
* **Mật khẩu:** `123456`
* **Hoặc Đăng nhập Khách / Đăng ký mới:** Bấm trực tiếp nút "Đăng Ký" trên thanh Sidebar của trang chủ để tạo tài khoản mới ngay lập tức.

---

## 🚀 PHẦN 8: HƯỚNG DẪN KHỞI ĐỘNG, KIỂM THỬ & BẢO TRÌ

### 8.1. Khởi Động Máy Chủ Cục Bộ
Từ thư mục dự án `C:\Users\phant\.gemini\antigravity\scratch\tower-of-knowledge`:

```bash
# 1. Cài đặt các gói phụ thuộc (nếu là máy mới)
npm install

# 2. Khởi chạy máy chủ Express & Socket.IO
node server.js
```
Máy chủ sẽ lắng nghe tại cổng `3000` (hoặc cổng được chỉ định trong biến môi trường `PORT`).

### 8.2. Chạy Bộ Kiểm Thử Tự Động (Automated Test Suite)
Hệ thống tích hợp sẵn bộ kiểm thử đơn vị và tích hợp cho các quy tắc nghiệp vụ cốt lõi:

```bash
# Chạy bộ test runner
node tests/test_runner.js
```
*Kết quả kỳ vọng:* **18/18 test cases PASSED (100% thành công)** bao gồm:
- Quy tắc combat đấu trường, trừ máu, sát thương chí mạng tốc độ.
- Quy tắc tích lũy EXP, suy dẫn cấp bậc quân hàm không tụt.
- Thuật toán Streak UTC+7 kiểm tra tính lười.
- Quy tắc mở khóa mốc học tuần tự và tính phần trăm hoàn thành.

### 8.3. Kiểm Tra Cú Pháp Giao Diện & Kết Nối Tài Nguyên
Trong thư mục `tools/` có sẵn các công cụ kiểm tra nhanh không phụ thuộc trình duyệt:
* `node tools/check_both_htmls.js`: Quét và thẩm định cú pháp JavaScript của cả `public/index.html` và `public/pet-gallery.html` (Bảo đảm 0 lỗi cú pháp).
* `node tools/verify_logo_assets.js`: Kiểm tra HTTP 200 cho toàn bộ các biến thể logo và favicon.
* `node tools/verify_assets.js`: Kiểm tra HTTP 200 cho toàn bộ các file hoạt họa linh thú GIF.

---

## 💡 PHẦN 9: LỜI KHUYÊN & LƯU Ý DÀNH CHO AI AGENT TIẾP THEO

1. **Bảo tồn tính toàn vẹn của Kiến trúc Sạch:**  
   Khi thêm các tính năng tính điểm, xếp hạng hoặc chiến đấu mới, hãy viết logic thuần túy trong `core/rules/` trước, sau đó mới gọi vào `services/` hoặc `routes/`.
2. **Không phá vỡ bộ chọn Pet:**  
   Hai linh thú Admin (`admin_aurum`, `admin_nguyet`) và 4 linh thú Bot (`bot_gloop`, `bot_tickbot`, `bot_glitchy`, `bot_dracobot`) đã được cấu hình chặt chẽ trong `allPets` và `botPool`. Khi sửa đổi giao diện Shop hoặc Đấu trường, luôn tôn trọng cờ `p.role === 'admin'`.
3. **Cơ sở dữ liệu:**  
   Nếu làm việc trên máy của người dùng, CSDL mặc định kết nối tới MSSQL qua `sqlcmd`. Khi deploy lên cloud (Render), chỉ cần cấu hình biến môi trường `DATABASE_URL=postgres://...` là `database/db.js` sẽ tự động chuyển sang driver PostgreSQL mà không cần sửa code.

---
*Tài liệu này được tạo tự động và đồng bộ trực tiếp từ cấu trúc mã nguồn thực tế của dự án Tháp Tri Thức.*
