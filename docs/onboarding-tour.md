# Hướng dẫn Sparky

Bản nâng cấp local dùng engine public/js/guided-tour.js, cấu hình public/js/tour-steps.js và public/css/guided-tour.css.

## Điểm trỏ

Các thuộc tính data-tour đã gắn vào giao diện và phần render động:
level, quests, coins, catalog, enroll, minigame, mobile-minigame,
casual, extreme, ranked, leaderboard, pet, mobile-pet, feed, stroke,
shop, mobile-shop, shop-pet, settings, mobile-settings, replay.

## Thưởng

Quà tân thủ dùng ONBOARDING_REWARD, 20 Xu và 30 EXP.
Hoàn thành cả sáu chặng dùng TOUR_REWARD, 10 Xu, không EXP.
Hai khoản dùng khóa duy nhất riêng theo người dùng. Server khóa dòng users
trong transaction trước khi kiểm tra và ghi sổ.
Trạng thái hướng dẫn do trình duyệt gửi lên; đây không phải chứng nhận
người dùng đã hiểu hoặc dữ liệu phù hợp dùng cho đánh giá học tập.

Áp database/pg-v1/migrations/002_tour_reward.sql bằng tài khoản quản trị
trước khi chạy server có endpoint tour-reward.
Script rollback từ chối nếu đã có giao dịch TOUR_REWARD để giữ lịch sử.
Không xóa ledger để rollback giao diện.

## Kiểm tra

npm test
node --test tests/test_tour_ui.js

Bộ UI dùng Chrome qua puppeteer-core hiện có trong repo.
CHROME_PATH có thể chỉ đường dẫn Chrome riêng.

## Phạm vi bằng chứng

Đã đi đủ 17 bước trên local desktop bằng nút Tiếp.
Đã thử đăng ký thật trên mobile, có một enrollment.
Đã thử Shop, mở Cài đặt và nhận 10 Xu trên mobile local.
Đã kiểm tra mục tiêu muộn, hủy khi đang chờ, ảnh bị chặn, focus,
offline, card thu nhỏ và bốn mép màn hình ở năm viewport.

Cần tiếp tục xác minh zoom/cỡ chữ lớn, mục tiêu cao trên 60% viewport,
xoay màn hình trong luồng trang thật, và khả năng đồng bộ tiến độ
giữa hai thiết bị. Chưa triển khai bản này lên production.
