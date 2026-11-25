# Tháp Tri Thức

Tháp Tri Thức kết hợp lộ trình học, bài luyện tập, Linh thú và Đấu trường 1v1. Worktree `local-pg-v1` chạy Express, Socket.IO và PostgreSQL 16. Giao diện học viên nằm ở `public/index.html`, giao diện quản trị ở `public/admin/`.

## Chạy local

1. Dựng PostgreSQL và tạo login ứng dụng riêng theo [hướng dẫn V1](database/pg-v1/README.md). Ứng dụng đọc cấu hình từ `.env.local`.
2. Chạy `npm ci`.
3. Chạy `npm run seed` để nạp giáo trình và bot luyện tập. Lệnh có thể chạy lại.
4. Chạy `npm test` để kiểm ứng dụng trên V1 và `npm start` để khởi động.

Mở trang [học viên](http://127.0.0.1:3000/), [quản trị](http://127.0.0.1:3000/admin/) hoặc [kiểm tra kết nối](http://127.0.0.1:3000/health). Nếu `.env.local` chỉ định cổng khác, dùng cổng đó.

## Mã nguồn và tài liệu

| Nơi | Nội dung |
|---|---|
| `core/rules/` | Quy tắc học, Xu và EXP, mùa giải, Đấu trường và Cực Hạn |
| `routes/`, `services/`, `sockets/` | API, nghiệp vụ có giao dịch và ghép trận thời gian thực |
| `database/pg-v1/` | DDL đã duyệt, dữ liệu tham chiếu và kiểm thử PostgreSQL |
| [THIET_KE.md](THIET_KE.md) | Thiết kế 29 bảng, sơ đồ quan hệ và quy tắc toàn vẹn |
| [LUAT_NGHIEP_VU.md](LUAT_NGHIEP_VU.md) | Đối chiếu nghiệp vụ ghi nhận trước khi chuyển schema |
| [BAO_CAO.md](BAO_CAO.md) | Tiến độ chuyển nhóm và bằng chứng kiểm thử |

Bản local dùng hình Pet gốc với sát thương chung, cộng điểm hạng cho đấu hạng và dùng chung hạn mức EXP tuần giữa Đấu trường và Cực Hạn. Admin có thể ngừng sử dụng nội dung mà vẫn giữ lịch sử học.
