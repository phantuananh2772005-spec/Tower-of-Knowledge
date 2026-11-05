# 06 — Quy tắc và kết quả review

| Khái niệm | Nguồn sự thật | Cách dùng |
|---|---|---|
| Cấp học | `nguoi_dung.tong_diem_kinh_nghiem` → LevelRules | Ngưỡng 0 / 100 / 500 / 1.500 / 3.500 / 7.000 EXP. Tiến độ là phần đã kiếm trong cấp hiện tại. |
| Xu | `nguoi_dung.xu_tri_thuc`, `giao_dich_xu` | Giao dịch ghi biến động và số dư sau. Mua pet/phụ kiện và chăm pet dùng Xu. |
| Điểm hạng local | `diem_dau_hang` theo user/môn | Trận RANKED hợp lệ thắng +25, thêm 5 nếu còn ít nhất 50 HP; thua −15 với sàn 0; hòa 0. Tổng là tổng các môn. Chưa có bộ cấp hạng riêng. |
| Thưởng trận local | `nguoi_choi_trong_tran.xu_nhan_duoc/exp_nhan_duoc` | Hạng thắng/hòa/thua lần lượt 50/75, 25/35, 20/25 (Xu/EXP). Giao hữu và tập 25/35, 15/20, 10/10. Hai bên phải có lượt; bot không nhận thưởng. |
| Nhiệm vụ ngày | Ledger + phiên học + trận theo ngày VN | Học 15 Xu/25 EXP, đấu 15/25, chăm 10/15. Quà tân thủ riêng 20/30. |
| Cực hạn | `extreme.service.finishSession` | Tối đa 250 Xu và 600 EXP mỗi lượt hoàn tất theo công thức hiện tại. Đây là giới hạn mỗi lượt. |
| Sao mốc | Tiến độ + bản ghi từng chặng | Hoàn thành có sao cơ bản, thêm sao khi đủ dữ liệu và đạt ngưỡng 80%/95%. Xem điều kiện chính xác trong checkpoint records. |

## Phát hiện và việc cần xác minh

| Mức | Bằng chứng trong code | Tác động / bước kiểm |
|---|---|---|
| Cao | `getMatchState` trả `vi_tri_dap_an_dung` và cấu trúc lời giải cho các dạng khác. | Trình duyệt có thể đọc đáp án trước khi trả lời. Khi sửa, phải chuyển cả phản hồi đúng/sai và nối cặp/sắp xếp sang contract an toàn. |
| Cao | Cực hạn `finishSession` tính lại từ cờ đúng trong log do client gửi và có fallback summary. | Cần phiên phía server, xác thực từng lượt và nhận thưởng một lần. Trần EXP không tự xác minh được kết quả. |
| Cao | Route lấy trận dùng JWT, cần đối chiếu quyền thuộc trận. Pet Studio có các route xử lý video/ảnh cần rà quyền và giới hạn đầu vào. | Kiểm bằng tài khoản ngoài trận và kiểm cách mount trước khi coi endpoint là nội bộ. |
| Cao | Một số bước ghi tiến độ, telemetry, thưởng ở service học tập tách nhiều lệnh. | Kiểm nộp lặp và nộp đồng thời. Local đã chuyển đường hoàn thành lý thuyết sang TX, cần test PG thật. |
| Trung bình | Bản triển khai cũ dùng tổng EXP cho hạng. Local có schema riêng, trận cũ mặc định UNCLASSIFIED. | Giữ EXP lịch sử. Không suy ngược điểm hạng từ trận thiếu mode hoặc từ EXP. Chạy migration và E2E trước khi phát hành. |
| Trung bình | Tên `Học viên <4 ký tự>` khớp `ensurePlayerRecord` cũ. `Học Viên Google` từng là tên mặc định của Google thử nghiệm. | Đối chiếu mã, role và dấu vết placeholder trên Render trước khi phân loại từng dòng. Bot chính thức có prefix `usr_bot_`. Không xóa theo tên hiển thị. |
| Trung bình | Adapter MSSQL không cung cấp cùng bảo đảm TX như PG. Init telemetry chạy sau listen. | Ghi rõ môi trường test. Kiểm startup mới, readiness và kết nối thật. |
| Trung bình | Có giá trị JWT mặc định trong code và CORS cấu hình rộng. | Kiểm môi trường production đã đặt secret riêng. Rà origin, cookie và phân quyền trước khi mở rộng truy cập. |

## Đề xuất EXP chưa bật

Mốc thử 300 EXP/ngày và 1.500 EXP/tuần cho hoạt động lặp. Tách EXP lần đầu vượt mốc và thưởng nhiệm vụ. Dùng múi giờ Việt Nam, tuần bắt đầu thứ Hai. Nếu triển khai, ghi lượng cấp thực tế theo nguồn và sự kiện duy nhất trong TX. UI hiển thị phần thực nhận khi chỉ còn một phần hạn mức. Trần EXP không thay đổi kết quả học hoặc điểm hạng.

[Nguồn hạng](../../services/arena.service.js) · [Quy tắc thưởng](../../public/js/arena-rules.js) · [Cực hạn](../../services/extreme.service.js) · [Tên tạo tự động trong lịch sử](https://github.com/phantuananh2772005-spec/Tower-of-Knowledge/blob/541d72f/services/arena.service.js)
