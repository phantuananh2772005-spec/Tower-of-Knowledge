# Tiến độ PostgreSQL local V1

Nhánh `local-pg-v1` tách từ `main` tại `fe206d3`. [Luật nghiệp vụ](LUAT_NGHIEP_VU.md) đối chiếu đủ **82 HTTP endpoint** với code và ghi riêng hợp đồng Socket.IO. [Thiết kế V1](THIET_KE.md) mô tả **29 bảng, 169 cột dự kiến**, sơ đồ Mermaid, điểm yếu cũ, cơ chế chặn và danh sách ca kiểm.

| Bước | Trạng thái |
|---|---|
| 0 · Trích luật | Đã hoàn tất. Những lựa chọn đã chốt gồm ẩn khiên, sát thương chung, lưu từng lượt học và chi tiết Admin, giữ thưởng thực nhận và chỉ hoàn thành qua đọc ở mốc thuần lý thuyết. |
| 1 · Thiết kế | Bản sửa chờ duyệt lần cuối. Gộp JSONB đáp án và Bloom, mở danh mục mã nhiệm vụ, còn ba nhóm trigger và ghi Xu qua giao dịch backend có khóa người dùng. Hằng số dùng chung được liệt kê trong thiết kế. |
| 2–3 · DDL và kiểm chứng | Chờ duyệt `THIET_KE.md`. Chưa có schema vật lý hoặc kết quả PASS/FAIL trên PostgreSQL. |
| 4–5 · Chỉnh ứng dụng và chạy local | Chờ kiểm chứng DB. Chưa đổi mã ứng dụng, chưa tạo `.env.local` và chưa khởi động server. |

Không có thay đổi trên `main` hoặc máy chủ Render. Docker CLI có trên máy. Engine chưa chạy tại lượt kiểm tra Bước 0 và `psql` chưa có trong PATH. Chuẩn bị môi trường local thuộc Bước 2.

**[HỎI] nghiệp vụ hiện tại.** Không còn lựa chọn nào đang chờ trả lời ở Bước 0. Cổng duyệt thiết kế trước DDL vẫn còn.
