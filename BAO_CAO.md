# Tiến độ PostgreSQL local V1

Nhánh `local-pg-v1` tách từ `main` tại `fe206d3`. [Luật nghiệp vụ](LUAT_NGHIEP_VU.md) đối chiếu đủ **82 HTTP endpoint** với code và ghi riêng hợp đồng Socket.IO. [Thiết kế V1](THIET_KE.md) mô tả **29 bảng, 169 cột**, sơ đồ Mermaid, điểm yếu cũ, cơ chế chặn và danh sách ca kiểm.

| Bước | Trạng thái |
|---|---|
| 0 · Trích luật | Đã hoàn tất. Những lựa chọn đã chốt gồm ẩn khiên, sát thương chung, lưu từng lượt học và chi tiết Admin, giữ thưởng thực nhận và chỉ hoàn thành qua đọc ở mốc thuần lý thuyết. |
| 1 · Thiết kế | Đã duyệt. Admin sửa nhãn bước và độ khó trên câu hiện tại. Nội dung và phương án đổi qua bản mới. Kiểm câu cùng môn nằm ở backend theo rủi ro đã chấp nhận. |
| 2 · DDL và seed | Đã áp trên PostgreSQL 16.16 qua Docker local. Schema `app_v1` có 29 bảng, 169 cột, 8 view và ba nhóm trigger. Đã kiểm chạy lại, rollback hai lần, áp lại cùng seed. Hướng dẫn ở [README](database/pg-v1/README.md). |
| 3 · Kiểm chứng DB | [verify_v1.sql](database/pg-v1/verify_v1.sql) đạt **75/75 ca** trên PostgreSQL 16.16. Đối soát ví sau thưởng, mua và rollback có **0 sai lệch**. Còn **0 dòng dữ liệu thử** sau rollback. |
| 4 · Chỉnh ứng dụng | Thứ tự và phạm vi ở [KE_HOACH_SUA_CODE.md](KE_HOACH_SUA_CODE.md). |
| 5 · Chạy thử đầy đủ | Thực hiện sau khi chuyển các nhóm ứng dụng. |

## Kiểm thử từng nhóm Bước 4

| Nhóm | Kết quả | Bằng chứng |
|---|---|---|
| 1 · Config | **PASS** | `node --test tests/test_db_adapter.js` đạt 4/4. Xác nhận login riêng thuộc role runtime và đúng search_path, đọc được hằng số V1, rollback probe và bị từ chối CREATE trong app_v1. Khởi động server và gọi `/health` trên loopback thành công ngay cả khi tiến trình cha có DATABASE_URL khác. |
| 2 · Auth và users | **PASS** | `node --test tests/test_auth_pg_v1.js` đạt 2/2 kịch bản trên PostgreSQL. Đăng ký cấp Sparky, đăng nhập và thưởng streak đúng một lần, lưu cài đặt, đổi mật khẩu thu hồi phiên cũ và chặn tài khoản vô hiệu. Google và gửi mã dùng giả lập. Lượt ghi kiểm thử được rollback. |
| 3 · Pet và inventory | **PASS** | `node --test tests/test_pet_inventory_pg_v1.js` đạt 2/2 kịch bản qua HTTP và PostgreSQL. Mua riêng, trang bị riêng, mũ Sparky tạm khóa, chăm Pet và chống trừ hai lần đều đạt. Mọi ví khớp tổng sổ Xu sau thưởng, mua và rollback. Fixture phụ kiện mở chỉ tồn tại trong transaction kiểm thử. |
| 4 · Nội dung và course | **PASS** | `node --test tests/test_course_pg_v1.js` đạt 2/2 kịch bản qua HTTP và PostgreSQL. Kiểm ghi danh, khóa theo thứ tự, đề chưa lộ đáp án, cả bốn dạng câu, lượt làm lại và tra cứu, mở mốc qua chương, thưởng một lần, chỉ mốc THEORY chốt qua đọc. Kiểm Chrome local đi từ bản đồ đến nộp bài, xác nhận lưu hoàn thành. Dữ liệu thử đã rollback. |
| 5 · Economy và quest | **PASS** | `node --test tests/test_economy_pg_v1.js` đạt 3/3 kịch bản qua HTTP và PostgreSQL. Giờ Việt Nam, cấp XP chạm trần 1.500, nhận một lần, quà tân thủ, lịch sử số dư và rollback đều đạt. Các luồng đã thử có 0 ví lệch với tổng sổ. |
| 6 · Arena và season | **PASS** | `node --test tests/test_arena_pg_v1.js` đạt 2/2 qua HTTP, Socket.IO và PostgreSQL. Câu sai môn bị chặn trước khi lưu trận/hiệp và phát đề. HTTP và Socket.IO từ chối khiên. Chrome local xác nhận nút khiên đã ẩn, Bot dùng đúng ảnh Pet và lượt hợp lệ gây sát thương. Kiểm chốt mùa 56 ngày, thưởng đồng hạng một lần và đối soát ví đạt. Toàn bộ nhóm 1–6 đạt 15/15. |

Không có thay đổi trên `main` hoặc máy chủ Render. Máy local dùng container `thaptrithuc-pg-v1` với cổng loopback 55432, database `thaptrithuc_v1`. Script quản trị chạy qua socket trong container.

**[HỎI] nghiệp vụ hiện tại.** Không có câu hỏi cần trả lời cho DDL đã duyệt.
