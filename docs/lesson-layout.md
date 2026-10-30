# Bố cục bài học theo chặng

Bài học chiếm chiều cao khả dụng của màn hình. Header tiến độ và thanh hành động không cuộn; chỉ vùng câu hỏi/phản hồi hoặc nội dung bài giảng cuộn khi dài. Nút Tiếp tục/Kiểm tra và Xem lại bài giảng giữ vị trí giữa các dạng câu hỏi. Chế độ tập trung ẩn navigation bên ngoài đúng như luồng học hiện có.

Bỏ huy hiệu tim khỏi view-play; không sửa sinh mạng của Thi đấu cực hạn. Giữ hàng đợi luyện lại, chấm bài, lưu phiên và phần thưởng.

Ghép cặp: giữ các thẻ đã ghép đúng, không ẩn rồi để lại ô trắng. Khi ghép hết, xếp định nghĩa đúng theo từng thuật ngữ và căn chiều cao hàng để xem lại. Không cắt chữ bằng line-clamp. Câu ghép cặp chỉ dùng huy hiệu hoàn tất; bỏ khung kết quả/giải thích bên dưới. Các dạng câu hỏi khác vẫn giữ phản hồi.

Kiểm thử PostgreSQL local: test_lesson_layout.js dùng câu hỏi thật có ID cố định từ pool được server cho phép khôi phục. Xác nhận lý thuyết và 4 dạng câu hỏi ở 1280×600, 1280×720, 1920×1080, 768×800, 375×667: thao tác luôn trong viewport, cùng vị trí giữa các dạng, vừa chiều rộng khung, không cuộn cả trang, không tim, cặp đúng còn hiện và nằm đúng hàng. test_lesson_resume_and_invitation.js khôi phục đủ 4 dạng sau reload, không trùng submissions. Tour PC88 và mobile96 đạt; bước chỉ dẫn bài giảng mobile được giới hạn riêng trong lúc tour để không bị hộp thoại che mục tiêu.
