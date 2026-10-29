# Khôi phục mật khẩu bằng tài khoản Google đã liên kết

Luồng giao diện:
1. Nhập tên đăng nhập cần khôi phục và bấm Tìm tài khoản.
2. Nếu không tồn tại hoặc chưa liên kết Google: cùng thông báo “Tài khoản không tồn tại hoặc chưa liên kết Google.”
3. Nếu hợp lệ: chỉ hiển thị email che một phần, ví dụ ph***5@gmail.com, yêu cầu đăng nhập Google đó. Không gửi mã email.
4. Server xác minh chữ ký Google, nonce, CSRF và đối chiếu đúng tài khoản vừa tìm. Google khác bị từ chối, không tự tạo hoặc chuyển sang tài khoản khác.
5. Nhập và xác nhận mật khẩu mới; hoàn tất rồi đăng nhập lại.

Tra cứu có giới hạn theo IP, trả vé ký số có hạn 10 phút (không chứa email đầy đủ). Vé bị giả mạo/hết hạn hoặc tài khoản đã đổi phiên không được dùng. Email che chỉ là gợi ý, không phải bằng chứng sở hữu. Trả lời tra cứu không phân biệt tài khoản không tồn tại với tài khoản chưa liên kết.

Quyền đặt lại ngẫu nhiên 256 bit chỉ nằm trong bộ nhớ giao diện, PostgreSQL lưu HMAC; có hạn 10 phút và dùng một lần trong transaction khóa hàng. Đổi mật khẩu thông thường/hủy liên kết hủy quyền khôi phục cũ. Reset thành công tăng session_version, thu hồi JWT HTTP và Socket.IO cũ. Mật khẩu tối thiểu 8 ký tự, tối đa 72 byte UTF-8.

Không mua tên miền, đăng ký dịch vụ thư hoặc kích hoạt gói trả phí. Mã gửi thư cũ chưa kích hoạt; giao diện mới hoàn toàn không có chức năng gửi mã.

Backend khôi phục dùng PostgreSQL của Render. MSSQL adapter chưa hỗ trợ transaction qua nhiều lệnh nên không bật luồng khôi phục trên MSSQL.

Kiểm thử: test_password_recovery.js (điều kiện tìm/liên kết, email che, vé giả, Google khác, nonce/CSRF/mode, hết hạn/single-use/thu hồi phiên); test_password_recovery_ui.js (375/768/1280/1920px, tìm không thấy/tìm đúng/email che, đổi mật khẩu qua HTTP/PG thật, mismatch, socket revocation, rate limit). Trong UI test chỉ thay Google popup bằng proof kiểm thử; xác minh Google thật được kiểm riêng trên production, không tự nhập mật khẩu thật của người dùng.
