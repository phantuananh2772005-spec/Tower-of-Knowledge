# Tiến độ PostgreSQL local V1

Nhánh `local-pg-v1` tách từ `main` tại `fe206d3`. [Luật nghiệp vụ](LUAT_NGHIEP_VU.md) đối chiếu đủ **82 HTTP endpoint** với code và ghi riêng hợp đồng Socket.IO. [Thiết kế V1](THIET_KE.md) mô tả **29 bảng, 169 cột**, sơ đồ Mermaid, điểm yếu cũ, cơ chế chặn và danh sách ca kiểm.

| Bước | Trạng thái |
|---|---|
| 0 · Trích luật | Đã hoàn tất. Những lựa chọn đã chốt gồm ẩn khiên, sát thương chung, lưu từng lượt học và chi tiết Admin, giữ thưởng thực nhận và chỉ hoàn thành qua đọc ở mốc thuần lý thuyết. |
| 1 · Thiết kế | Đã duyệt. Admin sửa nhãn bước và độ khó trên câu hiện tại. Nội dung và phương án đổi qua bản mới. Kiểm câu cùng môn nằm ở backend theo rủi ro đã chấp nhận. |
| 2 · DDL và seed | Đã áp trên PostgreSQL 16.16 qua Docker local. Schema `app_v1` có 29 bảng, 169 cột, 8 view và ba nhóm trigger. Đã kiểm chạy lại, rollback hai lần, áp lại cùng seed. Hướng dẫn ở [README](database/pg-v1/README.md). |
| 3 · Kiểm chứng DB | [verify_v1.sql](database/pg-v1/verify_v1.sql) đạt **75/75 ca** trên PostgreSQL 16.16. Đối soát ví sau thưởng, mua và rollback có **0 sai lệch**. Còn **0 dòng dữ liệu thử** sau rollback. |
| 4 · Chỉnh ứng dụng | **PASS 9/9 nhóm**. Thứ tự và phạm vi ở [KE_HOACH_SUA_CODE.md](KE_HOACH_SUA_CODE.md). |
| 5 · Chạy thử đầy đủ | Đã kiểm local sau seed. [Kết quả từng luồng](KET_QUA_CHAY_LOCAL.md) ghi kiểm thử 19/19 ứng dụng, 75/75 SQL và trận xếp hạng giữa hai người. |

## Kiểm thử từng nhóm Bước 4

| Nhóm | Kết quả | Bằng chứng |
|---|---|---|
| 1 · Config | **PASS** | `node --test tests/test_db_adapter.js` đạt 4/4. Xác nhận login riêng thuộc role runtime và đúng search_path, đọc được hằng số V1, rollback probe và bị từ chối CREATE trong app_v1. Khởi động server và gọi `/health` trên loopback thành công ngay cả khi tiến trình cha có DATABASE_URL khác. |
| 2 · Auth và users | **PASS** | `node --test tests/test_auth_pg_v1.js` đạt 2/2 kịch bản trên PostgreSQL. Đăng ký cấp Sparky, đăng nhập và thưởng streak đúng một lần, lưu cài đặt, đổi mật khẩu thu hồi phiên cũ và chặn tài khoản vô hiệu. Google và gửi mã dùng giả lập. Lượt ghi kiểm thử được rollback. |
| 3 · Pet và inventory | **PASS** | `node --test tests/test_pet_inventory_pg_v1.js` đạt 2/2 kịch bản qua HTTP và PostgreSQL. Mua riêng, trang bị riêng, mũ Sparky tạm khóa, chăm Pet và chống trừ hai lần đều đạt. Mọi ví khớp tổng sổ Xu sau thưởng, mua và rollback. Fixture phụ kiện mở chỉ tồn tại trong transaction kiểm thử. |
| 4 · Nội dung và course | **PASS** | `node --test tests/test_course_pg_v1.js` đạt 2/2 kịch bản qua HTTP và PostgreSQL. Kiểm ghi danh, khóa theo thứ tự, đề chưa lộ đáp án, cả bốn dạng câu, lượt làm lại và tra cứu, mở mốc qua chương, thưởng một lần, chỉ mốc THEORY chốt qua đọc. Kiểm Chrome local đi từ bản đồ đến nộp bài, xác nhận lưu hoàn thành. Dữ liệu thử đã rollback. |
| 5 · Economy và quest | **PASS** | `node --test tests/test_economy_pg_v1.js` đạt 3/3 kịch bản qua HTTP và PostgreSQL. Giờ Việt Nam, cấp XP chạm trần 1.500, nhận một lần, quà tân thủ, lịch sử số dư và rollback đều đạt. Các luồng đã thử có 0 ví lệch với tổng sổ. |
| 6 · Arena và season | **PASS** | `node --test tests/test_arena_pg_v1.js` đạt 2/2 qua HTTP, Socket.IO và PostgreSQL. Câu sai môn bị chặn trước khi lưu trận/hiệp và phát đề. HTTP và Socket.IO từ chối khiên. Chrome local xác nhận nút khiên đã ẩn, Bot dùng đúng ảnh Pet và lượt hợp lệ gây sát thương. Kiểm chốt mùa 56 ngày, thưởng đồng hạng một lần và đối soát ví đạt. Toàn bộ nhóm 1–6 đạt 15/15. |
| 7 · Admin | **PASS** | `node --test tests/test_admin_pg_v1.js` đạt 2/2 qua HTTP và PostgreSQL. Sửa bước/độ khó giữ ID. Đổi đề tạo bản mới, bản cũ và từng lượt làm/tra cứu còn đọc được sau lưu trữ. Kiểm phân quyền, vô hiệu hóa, thu hồi phiên, nhập câu hỏi nguyên tử và đối soát ví. Chrome local kiểm cây môn, sửa câu và trang Pet/học viên. Nhóm 1–7 đạt 17/17. |
| 8 · Cực Hạn | **PASS** | Kiểm thử HTTP/PostgreSQL đạt 2/2. Giữ từng lượt lặp, đo thời gian bằng timestamp phiên, giới hạn đề theo môn, chơi khách ở bộ nhớ và cấp thưởng một lần khi chốt đồng thời. Phiên 0 lượt không tính nhiệm vụ học. Chrome local kiểm tải lại đúng câu, sang vòng mới, hết giờ và tổng kết đã lưu. Nhóm 1–8 đạt 19/19. |
| 9 · Seed và script | **PASS** | `npm run migrate` áp lại DDL và seed tham chiếu. `npm run seed` nạp 10 chương, 29 mốc, 298 câu, 764 phương án MCQ và 3 bot. Chạy lần hai thêm 0 mục nội dung và giữ nguyên ID bot. `npm test` đạt 19/19 sau seed. Kiểm startup, `/health`, hai môn, GIF của cả ba bot, Shop và API Cực Hạn khách đạt. Kiểm DB xác nhận schema `public` có 0 bảng. |

Nếu tiến trình Cực Hạn khởi động lại sau khi chốt, kết quả và Xu đã cấp vẫn đọc được, còn EXP thực nhận của lần chốt trước hiển thị dấu gạch khi không còn biên nhận trong bộ nhớ.

Không có thay đổi trên `main` hoặc máy chủ Render. Máy local dùng container `thaptrithuc-pg-v1` với cổng loopback 55432, database `thaptrithuc_v1`. Script quản trị chạy qua socket trong container.

## Các commit chuyển ứng dụng

| Nhóm | Commit | Mã và dữ liệu chính |
|---|---|---|
| Config | `8c26d2d` | `config/local-env.js`, `database/db.js`, `server.js` |
| Auth và users | `8709216` | Route và service xác thực, Google, khôi phục, middleware, giao diện tài khoản |
| Pet và inventory | `373e00c` | Route và service Pet, inventory và giao diện Shop |
| Nội dung và course | `487da86` | Service môn, phiên, câu hỏi, kỷ lục và route tiến độ |
| Economy và quest | `a94e886` | Service Xu, EXP, nhiệm vụ và giao diện thưởng |
| Arena và season | `ccaf610` | Service trận và mùa, route Arena, Socket.IO và giao diện trận |
| Admin | `83dd196` | Service danh mục, phân quyền, báo cáo, route và giao diện Admin |
| Extreme | `b6036cb` | Luật Cực Hạn, service, route, lịch sử Admin, hồ sơ và giao diện |
| Seed và scripts | `f0af2a9` | Lệnh npm local, PostgreSQL SQL runner, seed giáo trình và bot |

## Điểm yếu và cơ chế chặn

| Điểm cần chặn | Cơ chế hiện tại |
|---|---|
| Ghi lượt của câu chưa được phát | Khóa ngoại ghép từ lượt đến phiên và vị trí câu đã phát |
| Phát câu thuộc môn khác trong trận | Backend kiểm tổ tiên và môn trước khi ghi hiệp. Kiểm HTTP và Socket.IO xác nhận không có hiệp hoặc gói câu. |
| Đội Pet hay phụ kiện của người khác | Khóa ngoại ghép từ slot của người dùng đến quyền sở hữu |
| Ghi đè đề đã có lịch sử | Runtime chỉ cập nhật trạng thái, bước và độ khó. Sửa nội dung tạo bản mới. Khóa ngoại lịch sử còn trỏ bản cũ. |
| Nộp chốt trận, chốt phiên hoặc nhận thưởng ngày nhiều lần | Khóa dòng và transaction lưu kết quả, thưởng và sổ Xu. Nhiệm vụ có khóa duy nhất theo mã, người dùng và ngày Việt Nam. |
| Xu và sổ lệch sau thưởng hoặc mua | Khóa dòng người dùng, ghi ledger và cập nhật ví trong cùng transaction. Runtime bị cấm sửa hoặc xóa dòng sổ. |
| Gửi tham số khiên | UI ẩn khiên. HTTP và Socket.IO từ chối trường khiên ở bước ghi lượt. |

## Dữ liệu mẫu và phần còn thiếu

- Nguồn repo có 124 câu Cơ sở Dữ liệu và 174 câu Chuyển đổi số. Seed giữ nguyên đề và phương án. Tám câu Chuyển đổi số `VAN_DUNG_CAO`, độ khó 4 dùng `APPLY` và mức 3, mức cao nhất trong V1 đã duyệt.
- **[HỎI] nội dung CSDL.** Mốc **2.2** (Trắc nghiệm Thiết kế Lược đồ & ERD) và **3.2** (Thử thách Truy vấn SQL & Gom nhóm dữ liệu) chưa có câu hỏi gắn với mốc trong nguồn. Hai mốc cần bổ sung hoặc duyệt lại việc gán câu. Các mốc luyện tập còn lại có câu đủ điều kiện.
- DDL đã duyệt được dùng nguyên trạng. Các lệnh local đã chuyển sang PostgreSQL V1. Tệp cấu hình Render thuộc luồng triển khai `main`.
