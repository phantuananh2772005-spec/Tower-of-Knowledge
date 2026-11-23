# Tiến độ PostgreSQL local V1

**Đã hoàn thành trích luật nghiệp vụ từ code.** Bản sao dự án ở nhánh `local-pg-v1`, tách khỏi `main` tại `fe206d3`. [LUAT_NGHIEP_VU.md](LUAT_NGHIEP_VU.md) ghi luật cũ, quyết định V1 và các trích dẫn file:dòng. Đã so sánh **82 HTTP endpoint** trong tài liệu với route đăng ký trong code. Sự kiện Socket.IO được kiểm riêng.

| Bước | Trạng thái |
|---|---|
| 0 · Trích luật | Đã đọc và ghi lại nguồn. Đã chốt sát thương chung, giữ từng lượt học với chi tiết Admin, thưởng thực nhận theo trận và điều kiện hoàn thành chỉ qua lý thuyết. |
| 1 · Thiết kế | Chờ quyết định khiên. Code hiện chỉ đổi hiệu ứng, máy chủ vẫn trừ đủ HP. Kết quả chọn sẽ quyết định có cần dữ liệu khiên trong schema hay chỉ thay giao diện. |
| 2–3 · DDL và kiểm chứng | Chờ tài liệu thiết kế được duyệt. Chưa tạo PostgreSQL `thaptrithuc_v1`, chưa có bảng/cột để đếm hoặc kết quả kiểm chứng DB. |
| 4–5 · Chỉnh backend, API và frontend, chạy local | Chờ kiểm chứng DB. Chưa đổi mã ứng dụng, chưa tạo `.env.local` và chưa chạy server. |

**Phạm vi thực tế.** Chỉ tạo worktree và viết tài liệu. Không có kết nối Render. Docker CLI có trên máy nhưng engine chưa chạy ở thời điểm kiểm tra, và `psql` chưa có trong PATH. Việc dựng PostgreSQL local thuộc bước sau khi được duyệt, ưu tiên chỉ mở địa chỉ loopback.

**[HỎI] đang mở.** Chọn ẩn nút khiên, giữ như hiệu ứng thuần hình ảnh hoặc làm khiên giảm sát thương thật. Nếu chọn giảm sát thương, cần xác định tỷ lệ, khi nào có hiệu lực và dùng tối đa bao nhiêu lần.
