# Khôi phục mật khẩu

## Cách đang dùng: xác minh Google, không cần dịch vụ email

Đăng nhập → Quên mật khẩu → Xác minh bằng Google đã liên kết → chọn đúng Google → nhập và xác nhận mật khẩu mới → đăng nhập lại.

Backend xác minh chữ ký ID token, audience, nonce và CSRF bằng Google Identity Services. Chỉ tìm tài khoản có `google_sub` và email đã liên kết khớp; không tạo tài khoản mới, không tự ghép theo email đăng ký. Quyền khôi phục ngẫu nhiên 256 bit chỉ nằm trong bộ nhớ giao diện, không lưu localStorage hoặc URL. PostgreSQL lưu HMAC, thời hạn 10 phút; sử dụng một lần trong transaction khóa hàng. Sau khi đặt lại, tăng `session_version` để vô hiệu hóa JWT cũ ở HTTP và các gói Socket.IO tiếp theo.

## Gửi mã email: tùy chọn, chưa kích hoạt

Không tự đăng ký, mua tên miền hoặc bật gói trả phí. Giao diện ẩn cách gửi mã khi chưa có cấu hình. Google đăng nhập không cấp quyền gửi thư Gmail.

Nếu chủ dự án sau này có tài khoản Resend và địa chỉ gửi đã xác minh, thêm trên Render:

- `RESEND_API_KEY`: khóa có quyền gửi email, chỉ lưu trong Environment.
- `RECOVERY_MAIL_FROM`: địa chỉ gửi đã được nhà cung cấp xác minh.
- `PASSWORD_RECOVERY_SECRET`: tùy chọn; mặc định dùng `JWT_SECRET` của server. Không dùng giá trị công khai.

Gửi qua HTTPS Resend API. Không trả mã trong API, không log mã. Mã 6 số hết hạn sau 10 phút, tối đa 5 lần sai, gửi lại cách ít nhất 60 giây, thay mã cũ; lỗi nhà cung cấp rollback. Chỉ địa chỉ Google đã liên kết được nhận thư. Phản hồi chung không công khai việc tài khoản có tồn tại hay không. Giới hạn bổ sung theo IP, 20 yêu cầu/10 phút/mỗi tiến trình; Render dùng một proxy tin cậy. Dữ liệu mã tồn tại tối đa một hàng/tài khoản và được xóa khi dùng thành công/hủy liên kết hoặc thay bằng yêu cầu mới; hàng hết hạn không còn được chấp nhận.

Hai cách khôi phục hiện dành cho PostgreSQL (Render). MSSQL vẫn hỗ trợ đăng nhập và đổi mật khẩu thông thường; không bật khôi phục bằng email/Google trên MSSQL vì adapter hiện chưa hỗ trợ transaction qua nhiều câu lệnh.

## Kiểm thử

`tests/test_password_recovery.js`: PostgreSQL thật, điều kiện liên kết, đồng thời, hết hạn, khóa sai, rollback gửi lỗi, dùng một lần, thu hồi phiên, xác minh Google nonce/CSRF/mode.

`tests/test_password_recovery_ui.js`: 375/768/1280/1920px, đối chiếu mật khẩu, đặt lại qua HTTP/PG thật; thay riêng Google popup bằng proof kiểm thử. Không chứng minh gửi email thật. Kiểm tra HTTP thu hồi token, origin và giới hạn request.
