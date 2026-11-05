# 07 — Vận hành và kiểm chứng

## Chạy local

1. Dùng Node theo `package.json` (>=18), `npm ci`, tạo một PostgreSQL dành riêng cho dev/test.
2. Trỏ `DATABASE_URL` vào DB đó, đặt `JWT_SECRET` riêng. Áp dụng DDL/seed phù hợp theo [migrate.js](../../database/migrate.js). Đọc runner trước khi chạy. Runner hiện có nhánh seed mặc định và `--fresh`, cần tránh thao tác này trên DB có dữ liệu thật.
3. `npm start` → kiểm `GET /health`, log init và log telemetry/seed chạy sau listen. `npm run seed` khai báo đường `database/seed.js`, cần kiểm file hiện hữu trước khi sử dụng.
4. Dùng tài khoản test cho nhập bài, mua pet, bắt cặp và reset. Tách cổng test khỏi server đang chạy. Không ghi bí mật hoặc dump người dùng vào tài liệu.

| Biến | Vai trò |
|---|---|
| `DATABASE_URL`, `NODE_ENV` | Chọn PG và cấu hình SSL của adapter. |
| `PORT`, `RENDER`, `PUBLIC_APP_URL` | Port, proxy, URL gốc mời phòng. |
| `JWT_SECRET`, `PASSWORD_RECOVERY_SECRET` | Ký JWT và proof khôi phục. Recovery có fallback JWT secret. |
| `GOOGLE_CLIENT_ID` | Xác thực audience. Origin thực tế kiểm tại Google Cloud. |
| `RESEND_API_KEY`, `RECOVERY_MAIL_FROM` | Kích hoạt nhánh gửi mã email. |
| `MSSQL_SERVER`, `MSSQL_DATABASE` | Nhánh local SQL Server qua sqlcmd. |

## Kiểm thử theo thay đổi

| Thay đổi | Kiểm gần nhất trong repo | Kiểm tích hợp cần làm |
|---|---|---|
| Auth/Google/recovery | `test_inventory_and_google_identity.js`, `test_password_recovery.js`, UI recovery | Token sai/hết hạn, Google sai tài khoản, thu hồi HTTP/socket. |
| Điểm hạng và thưởng | `test_arena_rank_separation.js` local chạy pg-mem | PG thật: migration cũ, 2 client nộp đồng thời, rollback, lặp conclude, bot/giao hữu, hòa và mất kết nối. |
| Bài học | `test_checkpoint_preview.js`, `test_step_view_mode.js`, progression/telemetry | Nộp chặng, nộp cả mốc, partial, lý thuyết lặp, mở mốc và số dư sau reload. |
| Pet/shop/quest | test inventory, daily quests, account switching | Mua đồng thời, thiếu Xu, đổi tài khoản và reload pet. |
| UI | theme first paint, scenic themes, garden scenery, arena garden, guided tour | 390/768/1440 px, sáng/tối, tên dài, bàn phím, tài nguyên 404. |

Test browser có thể giả định Chrome và port cụ thể. Đọc đầu file test trước khi chạy. pg-mem dùng để kiểm hợp đồng SQL/logic, không thay cho kiểm khóa hàng và TX trên PG thật. Bộ tài liệu được kiểm link và chỉ mục. Các test sản phẩm nêu trên là lộ trình kiểm, không phải kết quả chạy mới.

## Điều tra trên Render

- Ghi URL, phiên bản đang chạy và trạng thái migration trước khi so với working tree. Với lỗi ghi dữ liệu, kiểm mã lỗi API, log server, rồi truy vấn đọc các hàng liên quan.
- Kiểm schema thật bằng `information_schema.columns`. Đối chiếu `table_name`, `column_name`, `data_type`, `is_nullable`, `column_default` với [schema nguồn](04-data.md).
- Khi điều tra tài khoản “Học viên …”, đối chiếu role, prefix ID, 4 ký tự cuối, trạng thái liên kết và dấu vết hash placeholder. Không xuất email, hash hoặc token ra chat. Tổng hợp số lượng trước khi đề xuất xử lý hàng.
- Với BXH, lấy một trận hoàn tất và truy theo ID qua trận → người chơi → lượt → điểm và ledger. Trường `che_do` chỉ có sau migration local mới. Với pet, truy cờ kích hoạt rồi đối chiếu DTO và asset trả về.
- Khi phát hành thay đổi có migration, kiểm migration chạy lặp trên bản sao, kiểm dữ liệu trước/sau và kế hoạch rollback. Tránh xóa trường hoặc backfill bằng suy đoán. Xác minh lại route, file JS và luồng browser sau deploy.

[Danh sách test và vị trí nguồn](08-source-index.md)
