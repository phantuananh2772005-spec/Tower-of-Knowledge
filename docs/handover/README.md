# Tháp Tri Thức — tài liệu tiếp quản

Tài liệu lập ngày 06/11/2026, giờ Việt Nam. Chỉ mục nguồn lấy mốc Git `3762634`. Bản thay đổi về bảo mật, đấu trường và hướng dẫn đã lên Render ở `40bfa54` và các bản bổ sung đến `7c27c93`. Đọc [tình trạng bản triển khai](09-ux-security-review.md#trạng-thái-bản-triển-khai) trước khi dùng các bảng ghi nhận hiện trạng cũ.

| Cần hiểu | Đọc |
|---|---|
| Người dùng bấm gì, server xử lý gì, lưu ở đâu | [Luồng chức năng](01-flows.md) |
| Khởi động, ranh giới hệ thống, phiên bản | [Kiến trúc](02-architecture.md) |
| Endpoint HTTP, middleware và nơi triển khai | [Danh mục API](03-api.md) |
| Cột, kiểu dữ liệu, khóa và migration | [Schema](04-data.md) |
| Màn hình, state, cách tìm code | [Frontend](05-frontend.md) |
| EXP, Xu, hạng, thưởng và vấn đề đã xác định | [Quy tắc và review](06-review.md) |
| Chạy, kiểm thử, điều tra lỗi, bàn giao | [Vận hành](07-operations.md) |
| Tra cứu hàm và sự kiện theo mã nguồn | [Chỉ mục nguồn](08-source-index.md) |
| Mật khẩu, bảo mật và hướng dẫn theo tính năng | [Rà soát UX và bảo mật](09-ux-security-review.md) |

**Quy ước.** FE = frontend, BE = backend, PG = PostgreSQL, DTO = dữ liệu API, TX = transaction, BXH = bảng xếp hạng, EXP = kinh nghiệm học tập, WS = Socket.IO. “Mốc” là checkpoint thuộc chương. “Chặng” là bước luyện trong một mốc.

Đọc 01 → 02 → 04 khi mới tiếp quản. Khi xử lý một lỗi, tra 01 rồi mở route ở 03, service và hàm FE ở 08, sau đó xác minh đúng môi trường theo 07. [Tài liệu bàn giao cũ](../../PROJECT_HANDOVER.md) có bối cảnh đề tài. Bộ này dùng mã hiện tại làm nguồn đối chiếu.

Phạm vi là kiến trúc, các chức năng đang có, hợp đồng và điểm cần kiểm chứng. Trạng thái thực tế của tài khoản, cấu hình dịch vụ và schema đã áp dụng trên Render cần bằng chứng từ môi trường đó. Chỉ mục dẫn về code để kiểm tra chi tiết khi sửa.
