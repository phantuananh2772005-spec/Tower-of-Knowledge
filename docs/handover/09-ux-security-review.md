# 09 — Rà soát trải nghiệm và bảo mật

Rà mã nguồn ngày 06/11/2026. Các bảng dưới đây ghi lại hiện trạng trước đợt sửa.

## Trạng thái bản triển khai

- Đăng ký, đổi và đặt lại mật khẩu dùng chung ngưỡng 8–128 ký tự, danh sách chặn cục bộ và scrypt. Đăng nhập vẫn đọc được hash bcrypt cũ. Giới hạn thử hiện theo tiến trình. Cần kiểm cấu hình JWT và proxy trên Render.
- Hướng dẫn xuất hiện theo tính năng khi người học mở màn hình đó. Khu vực âm thanh có một gợi ý, còn nút sau khi mở quà dẫn tới mốc/lộ trình môn đang học hoặc Kho môn nếu chưa đăng ký.
- Phản hồi 1v1 chỉ gửi dữ liệu đủ để làm câu hỏi. Máy chủ giữ đáp án, xác minh thành viên và thứ tự, lấy thời điểm từ máy chủ và khóa hàng trận khi ghi lượt. Điểm hạng chỉ đổi ở trận hạng giữa hai người chơi.
- Cực Hạn xác nhận từng lượt và kết toán từ phiên của máy chủ. Phiên lưu trong RAM, hết hạn sau hai giờ và mất khi tiến trình khởi động lại.
- EXP thi đấu lặp lại giới hạn 300/ngày và 1.500/tuần theo giờ Việt Nam. Thưởng hoàn thành lần đầu đi riêng.
- API Pet Studio yêu cầu quản trị, giới hạn video trong thư mục cấu hình, giới hạn thông số xuất và có thời hạn cho tác vụ Python.
- Kiểm thử dịch vụ đã chạy trên pg-mem và PGlite. PGlite chạy bộ máy PostgreSQL nhúng. Chrome 375 px và 1280 px đã kiểm gợi ý theo màn hình. Hai phiên Chrome tách biệt đã ghép và hoàn thành trận xếp hạng trên máy chủ local với PGlite. PostgreSQL 18.6 native đã chạy lại bài kiểm thử dịch vụ. Hai kết nối PostgreSQL độc lập gửi kết toán đồng thời và chỉ ghi một lần thưởng. Render đã triển khai `7c27c93` và trả về phiên bản `1.2.0-contextual-learning`. API công khai xác nhận có cấu hình Google và nhánh gửi mã email đang tắt.

## Mật khẩu và phiên

| Đường vào | Điều kiện quan sát được | Hệ quả |
|---|---|---|
| Đăng ký qua form | JS chặn dưới 4 ký tự. | `1234` qua điều kiện chiều dài. |
| Đăng ký trực tiếp qua API | Service kiểm có username và mật khẩu, kiểm trùng username/email rồi hash bcrypt. Không có kiểm tối thiểu, 72 byte hay danh sách mật khẩu yếu ở nhánh này. | Chuỗi không rỗng như `1` có thể qua kiểm tra mật khẩu nếu thông tin tài khoản hợp lệ. |
| Đổi hoặc tạo mật khẩu | Tối thiểu 8 ký tự theo `.length`, tối đa 72 byte UTF-8. Kiểm mật khẩu hiện hành hoặc phiên Google mới khi tạo mật khẩu đầu tiên. | `12345678` qua điều kiện độ mạnh. Không thấy kiểm mật khẩu mới bằng mật khẩu hiện tại. |
| Khôi phục | Cùng ngưỡng 8 và 72 byte, thêm proof Google hoặc mã, hạn, số lần thử và thu hồi phiên. | Độ mạnh chưa nhất quán với đăng ký. |
| Đăng nhập | So bcrypt. Middleware HTTP/Socket kiểm phiên trong DB, lấy vai trò hiện hành. | Có nền tảng thu hồi phiên. Route login/register không thấy limiter như các route recovery. Gateway ngoài repo cần xác minh. |

Không kiểm mật khẩu trùng giữa hai tài khoản. Mỗi tài khoản có salt riêng. Hai ý cần tách khi thiết kế: **nhập lại mật khẩu** để tránh gõ sai và **đổi mật khẩu mới** để tránh chọn lại chính mật khẩu hiện tại. Chặn trùng username/email dựa trên dữ liệu tài khoản, không dò mật khẩu người khác.

### Tiêu chí đề xuất

- Một validator ở BE dùng chung cho đăng ký, tạo/đổi và reset. FE dùng cùng thông báo, kiểm xác nhận mật khẩu nếu có hai ô.
- Tối thiểu 15 ký tự cho tài khoản có thể đăng nhập chỉ bằng mật khẩu. Cho phép cụm từ dài, khoảng trắng, dán và trình quản lý mật khẩu. Chặn mật khẩu phổ biến, đã lộ và giá trị dễ đoán liên quan tài khoản. Không bắt buộc đủ chữ hoa, số và ký hiệu. [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html)
- Với bcrypt hiện tại, reject quá 72 byte **trước khi hash** ở mọi đường ghi. Byte khác ký tự, nhất là chữ tiếng Việt. Muốn hỗ trợ mật khẩu Unicode dài theo hướng tối đa ít nhất 64 ký tự, cần chọn cơ chế hash không bị trần byte đó và chuyển đổi hash cũ có phiên bản. Không cắt ngầm chuỗi.
- Áp chính sách mới khi tạo/đổi/khôi phục. Kiểm mật khẩu cũ theo hash hiện hành để tài khoản hợp lệ vẫn đăng nhập được. Kiểm cả case Unicode, đúng biên, quá biên, mật khẩu yếu đủ dài và lỗi nhập lại.
- Giới hạn đoán mật khẩu theo tài khoản và IP. Thông báo lỗi đăng nhập đủ chung. Kiểm production có secret JWT riêng và fail startup nếu thiếu. Xác minh luồng thu hồi token HTTP và socket sau reset.

## Bảo mật cần ưu tiên ngoài mật khẩu

| Ưu tiên | Bằng chứng | Điều kiện đạt |
|---|---|---|
| P0 trước khi mở hạng thật | DTO trận chứa đáp án, kể cả cấu trúc lời giải của nối cặp/sắp xếp. | Payload trước trả lời không tiết lộ đáp án. Máy chủ chấm, kiểm thứ tự lượt và thành viên trận. Thử request từ tài khoản ngoài trận và replay. |
| P0 rà quyền | Pet Studio có handler gọi Python và không thấy middleware xác thực tại route/mount hiện tại. | Đóng hoặc đặt sau quyền quản trị, giới hạn thao tác/tài nguyên, kiểm endpoint từ phiên khách. |
| P1 | Cực hạn finish tin cờ đúng trong log hoặc tổng điểm từ client. | Server lưu lượt đã xác minh và tính thưởng từ đó. Một phiên chỉ quyết toán một lần. |
| P1 | Auth có secret mặc định, JWT 7 ngày và route login/register không thấy throttle tại app. | Kiểm cấu hình Render. Bắt buộc secret riêng và có giới hạn thử login ở server/gateway. |
| P1 trước phát hành điểm hạng | Bản local đã tách EXP và rank, test pg-mem chưa kiểm được concurrency PostgreSQL thật. | Migration lặp được, 2 request kết thúc đồng thời chỉ ghi một thưởng, rollback đồng nhất, bot/giao hữu không đổi rank. |

Nguồn: [Auth service](../../services/auth.service.js), [Auth routes](../../routes/auth.routes.js), [Reset](../../services/password-recovery.service.js), [Arena](../../services/arena.service.js), [Extreme](../../services/extreme.service.js), [Pet Studio](../../routes/petStudioRoutes.js).

## Hướng dẫn lần đầu

`buildSteps(false)` tạo **88 bước PC**. `buildSteps(true)` tạo **96 bước mobile**. Đây là số bước trong kịch bản, không phải số bắt buộc phải bấm mới được dùng ứng dụng. Người dùng có thể dừng, nhưng nút sau mở hộp Pet gọi tour tổng và đưa về Trang chủ nếu bắt đầu từ đầu. Điều này đặt nhiều thao tác ngoài mục tiêu học trước khi người mới làm được bài đầu tiên.

### Luồng thay thế

| Khi nào | Hiện gì | Kết thúc |
|---|---|---|
| Sau khi nhận Pet | Một lời chào và CTA **Bắt đầu học**. | Vào mốc hiện tại nếu có. Nếu chưa chọn môn, dẫn đến Kho môn. |
| Mở bản đồ lần đầu | Một nhắc cạnh mốc đang mở. **Bấm mốc để xem bài và luyện tập**. | Khi bấm mốc hoặc bỏ qua. |
| Gặp dạng câu mới lần đầu | Một chỉ dẫn ngay trong câu, ví dụ **Chọn một thuật ngữ rồi chọn định nghĩa tương ứng**. | Sau thao tác đầu. Không chiếm khung câu hỏi. |
| Vào sảnh lần đầu | Nhắc ngắn: chọn môn rồi tìm trận. Giải thích điểm hạng ở đúng sảnh hạng. | Khi bấm tìm hoặc đóng nhắc. |
| Mở giao hữu lần đầu | Hai việc có ngữ cảnh: chia sẻ mã của bạn hoặc nhập mã bạn nhận được. | Khi dùng một trong hai thao tác. |
| Pet, Shop, Hồ sơ, Cài đặt | Mỗi nơi tối đa 1–2 nhắc nếu có thao tác khó đoán. Âm thanh chỉ cần mô tả chung một lần. | Xong thao tác hoặc bỏ qua. |

Lưu trạng thái theo **tài khoản + mã tính năng + phiên bản hướng dẫn**. PC/mobile dùng cùng trạng thái đã hiểu, bố cục và vị trí nhắc riêng. Dữ liệu tour cũ có thể đọc để chuyển đổi tiến độ phù hợp, không buộc người đã hoàn thành xem lại. Dùng lại chức năng xem trợ giúp chủ động theo trang. Nút bỏ qua luôn rõ, không dẫn người dùng sang trang khác để “hoàn thành hướng dẫn”.

### Các chỗ nên gọn thêm

- **Mở mốc:** ưu tiên một CTA theo trạng thái. Mốc mới có “Học lý thuyết”, mốc đang làm có “Tiếp tục”, mốc xong có “Ôn tập”. Kỷ lục và ba sao nằm trong phần xem thêm nếu chiếm chỗ. Tách xem lý thuyết với nộp bài.
- **Đấu hạng:** chọn môn và tìm trận là hai thao tác chính. Hạng môn/tổng là thông tin tham khảo. Nếu ghép bot sau thời gian chờ, báo rõ chuyển sang đấu tập trước khi bắt đầu để người chơi biết trận không tính hạng.
- **Giao hữu:** dùng chữ “Mã phòng”, một khu “Mời bạn” và một khu “Vào phòng”. QR là cách chia sẻ thêm. Link mời điền sẵn mã sau đăng nhập, vẫn để người chơi xác nhận vào phòng.
- **Khôi phục:** hỏi tên đăng nhập, hiện Gmail che khi đủ điều kiện rồi CTA xác minh Google. Phần nhập mật khẩu mới xuất hiện sau xác minh. Nhánh mã email chỉ xuất hiện khi đã cấu hình gửi mail.

Tiêu chí nghiệm thu tour: người mới có thể vào bài đầu ngay sau nhận Pet, không có tour tổng tự bật. Vào tính năng mới có chỉ dẫn ngắn, quay lại không bị nhắc lại. Bỏ qua không chặn chức năng. Ở 390 px và PC, nhắc không che nút đang yêu cầu bấm, thao tác được bằng bàn phím và có thể mở lại trợ giúp.

Nguồn: [Kịch bản hướng dẫn](../../public/js/guided-tour.js) · [Mở hộp Pet](../../public/index.html#L9546) · [Luồng hiện có](01-flows.md).
