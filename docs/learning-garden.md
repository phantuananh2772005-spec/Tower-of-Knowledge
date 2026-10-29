# Bản đồ khu vườn

Lộ trình cuộn dọc dùng chung cho mọi môn. Tất cả chương và mốc từ API được hiển thị; không co cả chương vào một khung ngang. Cuộn tự nhiên trong app-main-scroll, không chặn wheel/touch. Nút Về mốc đang học chỉ cuộn khi được bấm; thao tác trở về từ bài học vẫn đưa người dùng về mốc hiện tại.

Phong cảnh SVG cây/hoa/cỏ do dự án tự vẽ, không dùng hình hoặc thương hiệu Duolingo/Candy Crush. Nền có bảng màu sáng/tối; hình trang trí không nhận pointer và không xuất hiện trong cây accessibility. Kích thước nút đủ cho chạm và dùng bàn phím, có focus ring, tôn trọng reduced motion.

Mốc khóa được xem trước nhưng không mở bài; kiểm quyền hiện có ở backend được giữ nguyên. Mốc hoàn thành giữ điểm sao, mốc đang mở hiển thị Pet đã trang bị. Không thay đổi tiến độ hoặc dữ liệu môn học để phục vụ bố cục.

Kiểm thử: test_learning_garden.js dùng tài khoản thử riêng trong PostgreSQL local, hai môn/11 và 18 mốc, 375/768/1280/1920px. Xác nhận số chương/mốc bằng API, không tràn ngang, cuộn được đến đích, quay lại mốc hiện tại, khóa không mở bài, Enter mở được bài, không lỗi JS. Chụp cả giao diện sáng/tối. Tour hoàn chỉnh PC 88 bước và mobile 96 bước đạt, không thiếu mục tiêu hoặc chồng hộp lên mục tiêu.
