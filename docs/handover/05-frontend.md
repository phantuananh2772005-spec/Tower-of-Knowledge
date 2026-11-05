# 05 — Frontend

## Cấu trúc màn hình

| Vùng | Điểm vào | Nguồn hiển thị / chỗ sửa |
|---|---|---|
| Khung chung | `navTo`, `setPageHeader`, `updateTopbarUI`, `updateMobileBottomBar` | Header chung, sidebar PC, bottom bar và More trên mobile. Cuộn chính nằm ở `app-main-scroll`. |
| Trang chủ | `updateHubWelcomeBanner`, render tiến độ cấp, nhiệm vụ, pet | Chừa chiều cao tên và nút trước khi API trả. Nút tiếp tục dùng mốc đang học. |
| Môn và bản đồ | `openCourseRoadmap`, `renderLearningGarden` | Catalog → chọn/đăng ký → bản đồ → modal mốc. [Garden](../garden-v2.md). |
| Làm bài | `startPlay`, render câu, chấm, hoàn tất hoặc thoát | Focus mode, tiến độ, khối lý thuyết và phần câu hỏi có trạng thái riêng. [Lesson layout](../lesson-layout.md). |
| Sảnh / trận / BXH | `arenaTab`, `selectArenaMode`, `renderLobby`, `startMatchmaking`, `checkEnd`, `loadRealLeaderboard` | Sảnh thật giữ handler và ID khi đổi CSS. Trang `/design/arena-studio.html` là demo. [Sảnh thật](../arena-garden.md). |
| Cực hạn | Các hàm Extreme trong index | Có tim, lượt và bộ câu hỏi tiếp theo. Kết quả Xu/EXP theo API finish. |
| Pet / Shop | `loadRealPets`, `equipPet`, `syncAllPetDisplays`, `inventory.js` | Phân biệt catalog, sở hữu và đang dùng. Mua khác trang bị. |
| Hồ sơ | `personal-journey.js` | Trang phủ toàn màn hình, dữ liệu riêng từ API journey, cấp và avatar từ tài khoản. |
| Cài đặt / tour | `account-state.js`, `guided-tour.js` | Lưu có hàng đợi, đối chiếu user/token trước khi áp dụng phản hồi. |
| Quản trị | `public/admin/index.html` | Có state và đăng nhập riêng, quyền thực tế do API kiểm. |

## State và hợp đồng giữa module

- `currentUserAccount` nhận DTO từ `applyUserData`. Tránh tăng Xu/EXP giả ở FE rồi ghi đè dữ liệu server. `refreshUserData` lấy lại số dư, pet, tiến độ và các khối phụ thuộc.
- `currentAppView`, `liveCourseData`, `currentFocusMoc`, `currentQuizSession` là state trong trang. Đổi view có nhánh chặn/ghi phiên khi đang chơi. Khi thêm đường điều hướng phải đi qua luồng hiện có.
- `B` giữ HP, câu, combo, timer, mode và người chơi. `currentLiveMatch` giữ trạng thái máy chủ. Giải phóng timer/listener và chặn callback cũ khi mở trận mới.
- `RANKS` và `RANK_DATA` là dữ liệu dựng sảnh/BXH. Local nạp điểm từ DTO `diem_dau_hang`, không khôi phục phép gán EXP sang điểm hạng.
- `lesson-state.js` giữ phiên luyện có thể tiếp tục. `account-state.js` chống phản hồi preference áp dụng sang tài khoản khác. `tok_token` là phiên học viên, admin dùng khóa riêng. Không ghi token hoặc email vào log khi debug.
- ID DOM là hợp đồng thực tế giữa JS, tour và Puppeteer. Trước khi đổi ID, tìm toàn repo. Mọi chuỗi từ tên tài khoản/câu hỏi đi qua xử lý an toàn khi chèn HTML.

## Theme và tài nguyên

Boot áp dụng theme sáng/tối sớm. `season-switch.js` chọn bộ nút theo lịch Việt Nam hoặc lựa chọn tay. `scenic-skin.js` đưa theme sang ảnh nền và icon. Garden đọc cùng theme, chọn cỡ ảnh theo viewport, tải dần. CSS giữ tỉ lệ ảnh. Khi sửa UI kiểm cả 390 px, vùng tablet và PC, chế độ sáng/tối, giảm chuyển động, tên dài và tải chậm. Ảnh nguồn và demo không đại diện số byte tải cho một trang.

[Chỉ mục hàm](08-source-index.md) · [Màu cảnh](../seasonal-scenery.md) · [Icon](../seasonal-icons.md) · [Tour](../guided-learning-update.md)
