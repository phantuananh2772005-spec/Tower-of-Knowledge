# Kết quả chạy local PostgreSQL V1

Worktree `local-pg-v1` được kiểm trên PostgreSQL 16.16 với container `thaptrithuc-pg-v1`. Ứng dụng chạy qua `.env.local`, dùng login `thaptrithuc_v1_app` thuộc role `thaptrithuc_v1_runtime`, với `search_path = app_v1, pg_catalog`. Server nghe tại [127.0.0.1:3000](http://127.0.0.1:3000/).

| Luồng | Kết quả và bằng chứng |
|---|---|
| Khởi động và quyền PostgreSQL | **PASS.** `npm start` và `/health` hoạt động trên loopback. Bốn kiểm thử adapter xác nhận login, search path, hằng số, rollback và từ chối tạo đối tượng khi chạy bằng runtime. |
| Đăng ký, đăng nhập và khôi phục | **PASS.** Qua HTTP và PostgreSQL, đăng ký cấp Sparky, mật khẩu dài 8 ký tự được chấp nhận, đăng nhập được, đổi mật khẩu thu hồi token cũ. Đăng nhập Google, liên kết Gmail và khôi phục được kiểm với xác minh Google và bộ gửi thư giả lập. |
| Mua, trang bị và chăm Pet | **PASS.** Mua và chọn trang bị tách riêng. Mũ Sparky vẫn khóa. Mua đồng thời chỉ trừ Xu một lần. Sổ ghi lượt chăm và ví khớp tổng sổ sau mua, thưởng, và sau rollback. |
| Ghi danh, học và hoàn thành | **PASS.** Ghi danh, khóa mốc theo thứ tự, làm đủ bốn dạng câu, làm lại, xem giải thích, chấm điểm, thưởng một lần và mở chương kế. Chỉ mốc thuần lý thuyết hoàn thành qua đọc. Chrome kiểm từ bản đồ đến nộp bài và lưu hoàn thành. |
| Nhiệm vụ ngày và EXP tuần | **PASS.** Kiểm mốc 00:00 giờ Việt Nam, nhận thưởng một lần, cách tính 1.500 EXP/tuần, và số dư khi rollback. Thoát Cực Hạn trước khi làm câu đầu không tính nhiệm vụ học. |
| Đấu trường và khiên | **PASS.** Cả HTTP và Socket.IO chặn câu khác môn trước khi ghi trận/hiệp và phát đề. Câu đúng môn được phát ở ca đối chứng. Cả hai đường gửi từ chối tham số khiên. Chrome xác nhận giao diện ẩn khiên, Bot dùng đúng ảnh Pet và gây sát thương khi trả lời hợp lệ. |
| Đấu hạng giữa hai người chơi | **PASS.** Hai client Socket.IO ghép trận, chơi hết ba hiệp và mỗi bên nhận đủ sáu kết quả lượt. Người thắng nhận +30 điểm hạng, +50 Xu và +75 EXP. Người thua nhận −15 điểm hạng, +20 Xu và +25 EXP. Gửi lại lượt cuối cho kết quả cũ, mỗi ví chỉ có một giao dịch thưởng. |
| Chốt mùa | **PASS.** Kiểm 56 ngày, xếp đồng hạng và trả thưởng một lần, giữ điểm mùa cũ và chuyển điểm sang mùa mới. |
| Admin và vô hiệu hóa | **PASS.** Chrome kiểm cây môn, sửa câu và trang Pet/học viên. HTTP kiểm sửa bước/độ khó giữ ID, sửa nội dung tạo bản mới, lưu trữ giữ toàn bộ lượt và tra cứu, nhập hàng loạt nguyên tử, vô hiệu hóa và thu hồi phiên. |
| Cực Hạn | **PASS.** Kho câu theo môn, lặp câu qua vòng mới, nhận đúng thưởng khi hai yêu cầu chốt đến đồng thời, khách chơi tạm. Chrome kiểm tải lại, tiếp tục đúng câu, hết giờ và tổng kết. Thời lượng phiên tính từ lúc mở tới lúc chốt. |
| Dữ liệu mẫu | **PASS.** `npm run seed` nạp 2 môn, 10 chương, 29 mốc, 298 câu, 764 phương án trắc nghiệm, cùng 3 bot có GIF riêng. Lần thứ hai giữ ID bot và thêm 0 bản ghi nội dung. Các bot hiện trong Đấu trường và ẩn khỏi Shop. Chạy đúng entrypoint cũ `/admin.html` chuyển đến `/admin/`. |

## Kết quả tổng hợp

- `npm test` sau seed đạt **19/19** với PostgreSQL V1 thật. Kịch bản hai người đấu hạng và các lượt Chrome là kiểm thử bổ sung.
- `npm run test:db` đạt **75/75**, gồm đối soát toàn bộ ví với sổ Xu. Các tài khoản và phiên kiểm thử đã rollback. Dữ liệu seed được giữ để mở thử local.
- Kiểm tra Git xác nhận bốn nhóm tệp của DDL, seed tham chiếu và bộ kiểm SQL giống bản đã duyệt.
- Kiểm thử ứng dụng dùng bộ V1 được khai báo trong `npm test`. Các kiểm thử đơn lẻ dùng schema cũ được giữ để đối chiếu lịch sử.

## Phạm vi cần đối chiếu thêm

- Google và thư khôi phục đã được kiểm với giả lập. Tài khoản Gmail thật và dịch vụ gửi thư chưa được dùng trên Render.
- Nguồn Cơ sở Dữ liệu chưa có đề gắn với mốc **2.2** và **3.2**.
- Nếu máy chủ Cực Hạn khởi động lại sau khi đã chốt, lượt truy vấn sau vẫn có tổng kết và số Xu đã cấp. EXP thực nhận hiển thị dấu gạch nếu biên nhận cũ đã mất khỏi bộ nhớ. Lưu trữ hiện tại vẫn ngăn cấp thưởng trùng.

Xem [cách chạy](database/pg-v1/README.md), [kế hoạch chuyển nhóm](KE_HOACH_SUA_CODE.md) và [tiến độ](BAO_CAO.md).
