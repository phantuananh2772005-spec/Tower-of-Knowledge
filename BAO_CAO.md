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

Không có thay đổi trên `main` hoặc máy chủ Render. Máy local dùng container `thaptrithuc-pg-v1` với cổng loopback 55432, database `thaptrithuc_v1`. Script quản trị chạy qua socket trong container.

**[HỎI] nghiệp vụ hiện tại.** Không có câu hỏi cần trả lời cho DDL đã duyệt.
