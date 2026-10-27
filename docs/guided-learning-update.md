# Cập nhật học viên, lưu dữ liệu và hướng dẫn

## Nguồn dữ liệu và liên hệ giao diện

- `nguoi_dung.tong_diem_kinh_nghiem` là nguồn EXP. `public/js/level-rules.js` dùng chung với backend để suy ra 6 cấp, danh hiệu và phần trăm EXP; không thêm cột cấp có thể lệch EXP.
- `thu_cung` là danh mục 14 Pet. `thu_cung_so_huu` lưu quyền sở hữu và Pet đang kích hoạt. API kiểm tra cấp, vai trò và số dư trước khi mua/trang bị. Giao diện trang chủ, thanh bên, phòng đấu và hồ sơ đọc cùng lựa chọn này.
- `vat_pham_so_huu` lưu phụ kiện đã mua; `nguoi_dung.phu_kien_dang_dung` chỉ ra phụ kiện đang dùng. Giá và hình phụ kiện định nghĩa trong `config/accessories.json`.
- `giao_dich_xu` lưu giao dịch, nhận thưởng và thao tác có phí. Nhiệm vụ học lấy từ phiên học thật, đấu trường từ kết quả thật, chăm Pet từ API chăm sóc. Trạng thái hoàn thành và trạng thái đã nhận thưởng được phân biệt.
- Cài đặt sáng/tối, từng kênh âm thanh và tiến độ tour nằm trong tài khoản. `localStorage` chỉ hỗ trợ tải giao diện/tạm lưu; máy chủ vẫn kiểm quyền và phần thưởng.
- `google_sub` là định danh Google đã được xác minh phía máy chủ; không dùng địa chỉ Gmail do trình duyệt tự khai làm bằng chứng liên kết. Google-only account cần tạo mật khẩu riêng trước khi hủy liên kết.
- Dữ liệu trận được tạo trong một giao dịch. Người chơi không tồn tại hoặc tự đấu với chính mình bị từ chối; không tự sinh học viên để lấp khóa ngoại.

## API bổ sung

Tất cả request/response theo envelope `success`, `data`/`error`, `timestamp`. Ngoại trừ config, challenge đăng nhập và QR, các API dưới đây yêu cầu Bearer token của tài khoản hiện tại.

| API | Công dụng / dữ liệu |
|---|---|
| `GET /api/auth/config` | Client ID Google công khai hoặc null khi chưa cấu hình |
| `GET /api/auth/google/challenge?mode=login` | Nonce, CSRF và cookie HttpOnly có chữ ký; dùng `mode=link` kèm Bearer để liên kết |
| `POST /api/auth/google` | `{credential, csrf}` từ Google Identity Services, kiểm chữ ký/audience/nonce/email verified |
| `POST /api/auth/google/link` | Cùng proof, challenge gắn với tài khoản hiện tại |
| `DELETE /api/auth/google/link` | Hủy khi tài khoản có mật khẩu riêng |
| `PUT /api/auth/account` | `ten_hien_thi` hoặc `ten_dang_nhap`; không nhận trường vai trò |
| `PUT /api/auth/password` | `{mat_khau_hien_tai, mat_khau_moi}`; tài khoản Google chưa có mật khẩu cần phiên xác minh mới |
| `PUT /api/auth/settings` | `che_do_giao_dien`, `bat_am_thanh`, `cai_dat_am_thanh`, `tien_do_huong_dan` |
| `GET /api/items` | Danh mục phụ kiện cùng trạng thái sở hữu/trang bị của tài khoản |
| `POST /api/items/:id/buy` | Mua một lần, giao dịch nguyên tử; gọi lại không trừ Xu lần nữa |
| `PUT /api/items/equipped` | `{itemId}`; null để tháo |
| `POST /api/pets/:id/buy` / `equip` | Mua/trang bị Pet; quyền được kiểm phía server |
| `POST /api/pets/care` | `{action: 'pet'}` miễn phí hoặc `{action: 'feed'}` tốn 10 Xu |
| `GET /api/arena/room-qr.png?code=TOK-ABCD` | PNG QR thật chứa URL mời; chỉ mở trang và điền mã, không tự tham gia |
| `GET /api/checkpoints/:id?resume=id1,id2` | Khôi phục đúng câu từ ngân hàng mốc được phép truy cập; ID không còn tồn tại bị từ chối |

## Hướng dẫn theo bố cục

PC có 87 bước, mobile có 95 bước. Người học tự bấm thanh điều hướng; mobile đi qua menu Thêm cho các mục không có nút trực tiếp. Mỗi bước đo phần tử thật và đặt panel cạnh/trên/dưới mục tiêu. Bốn vùng phủ tối giữ vùng mục tiêu sáng. Phần âm thanh có một bước giới thiệu chung; Pet Admin không xuất hiện trong shop hoặc kịch bản hướng dẫn học viên.

Tour gồm trang chủ, nhiệm vụ, đăng ký môn, danh sách môn đang học, bản đồ, thẻ bài giảng, thao tác câu hỏi và phản hồi, Pet/chăm sóc/cửa hàng/phụ kiện, các chế độ đấu, QR, bảng xếp hạng, hồ sơ/huy hiệu, tên/Username/mật khẩu/Google, âm thanh, theme và đăng xuất. Hành động có phí, đổi mật khẩu và bắt đầu trận thật được giải thích để người học tự quyết định.

Tạm dừng/lùi/tiếp tục lưu ngữ cảnh của từng tài khoản. Khi đang làm bài, snapshot giữ hàng đợi, lựa chọn và phản hồi cho cả bốn dạng câu hỏi; khôi phục không nhân đôi lượt trả lời. Nội dung câu hỏi tải lại từ máy chủ theo ID, không tin bản đề được trình duyệt gửi lên.

## Kiểm tra và triển khai

Thiết lập `DATABASE_URL` tới PostgreSQL kiểm thử riêng trước khi chạy test. Không chạy test tạo/xóa fixture trên CSDL production.

```powershell
node tests/test_runner.js
node tests/test_account_state_integrity.js
node tests/test_inventory_and_google_identity.js
node tests/test_atomic_match_and_streak.js
# Chạy server test ở PORT=3002 trước hai bộ trình duyệt:
node tests/test_lesson_resume_and_invitation.js
node tests/test_tour_step_compatibility.js
node tests/test_guided_tour_e2e.js
```

`scripts/inspect_schema.js` dùng giao dịch READ ONLY để kiểm kê bảng, cột, khóa/index và số bản ghi, không in credentials/hồ sơ cá nhân. Trên Render thiết lập `GOOGLE_CLIENT_ID` và khai báo Authorized JavaScript origins trong Google Cloud. Chỉ xác nhận Google hoạt động hoàn chỉnh sau khi người dùng thực hiện được đăng nhập thật.
