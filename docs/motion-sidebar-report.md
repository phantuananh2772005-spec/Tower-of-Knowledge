# Motion và hai nhóm sidebar — 27/11/2026

## Phạm vi và dữ liệu được đối chiếu trước khi sửa

Đọc hai yêu cầu đính kèm và bản HTML demo. Demo chỉ tham chiếu chuyển động.
Nguồn chức năng là ứng dụng hiện có, không lấy môn học, vật phẩm, submenu hoặc
nghiệp vụ của demo vào ứng dụng.

Các thành phần trước đợt sửa: sidebar 7 mục phẳng và nút ẩn/mở toàn bộ menu;
10 vùng `view-hub/enrolled/saga/catalog/minigame/battle/pet/shop/play/extreme`;
tab đăng nhập/đăng ký và các sảnh/BXH; thanh EXP, nhiệm vụ, tiến độ môn, tâm trạng
Pet; số Xu/điểm; toast; công tắc ảnh ngày/đêm và circular theme reveal; nút chính,
thẻ chọn chế độ và nút mốc học. Chưa có accordion hay sidebar dạng hàng icon.

Sau khi có yêu cầu A/B riêng, chỉ thêm đúng hai nhóm Kho môn học và Shop.
Sidebar không bị remount. Không thêm view/URL route, API, schema, sản phẩm hay
quy tắc thưởng. `myEnrolledCourses`, `allPets`, `accessoryCatalog` trong ứng dụng
giữ nguồn và cấu trúc cũ; trạng thái nhóm/filter/anchor chỉ thuộc trình bày UI.

## A — Kho môn học

- `nav-enrolled` được **di chuyển**, giữ ID và `sidebar-enrolled-count`, thành con
  của `sidebar-courses-group`. Không còn ở cấp 1.
- Cha Kho môn học mở nhóm và gọi lại `navTo('enrolled')`. Bấm khi nhóm đang mở
  sẽ thu nhóm, giữ trang hiện tại. Mở nhóm này đóng nhóm Shop.
- Đang theo học dùng `view-enrolled`, `enrolled-courses-grid` và
  `renderEnrolledCourses()` cũ. Tất cả môn dùng `view-catalog` cũ.
- **A3 đã làm, không bị chặn thiếu dữ liệu.** `services/course.service.js` đã trả
  `total_milestones` và `completed_milestones` từ `v_subject_progress` trong
  `database/pg-v1/schema/30_views.sql`. Các số này dựa trên
  `milestone_progress.completed_at` đã lưu. Trang hồ sơ
  `public/js/personal-journey.js` đã có đúng quy tắc:
  `total_milestones > 0 && completed_milestones === total_milestones`.
- Đã hoàn thành lọc cùng danh sách đăng ký bằng đúng quy tắc trên, trên cùng
  view/renderer. Không dùng phần trăm đã làm tròn và không coi môn có 0 mốc là
  hoàn thành. Không tạo cờ hoàn thành hay lưu tiến độ mới.
- Giữ nguyên badge `myEnrolledCourses.length` tại nơi cập nhật cũ. Vì yêu cầu
  giữ cách tính, Đang theo học vẫn là danh sách đăng ký cũ; danh sách hoàn thành
  là tập con của danh sách đó. Không tự đổi thành badge đếm riêng môn chưa xong.

## B — Hai mốc neo trên cùng Shop

- **B2 đã đủ dữ liệu.** Linh vật đang dùng `/api/pets`, `allPets` và
  `renderShopPets()`. Phụ kiện đang dùng `/api/items`, `accessoryCatalog` và
  `renderAccessories()` trong `public/js/inventory.js`. Không phân loại mới.
- Khu linh vật có `id="shop-pets" data-section="pets"`. Khu phụ kiện giữ ID
  **`shop-accessories`** để không phá selector/link cũ, thêm `data-section="items"`.
- Con Linh vật đồng hành và Vật phẩm & phụ kiện chỉ cuộn `app-main-scroll`,
  không gọi lại `navTo` nếu đã ở Shop và không chạy lại animation trang.
- Từ trang khác, dùng `navTo('shop')` cũ, đợi page-entry đang chạy kết thúc và
  grid thật có nội dung, rồi mới căn neo. Không cuộn vào grid chưa render;
  readiness observer chờ dữ liệu chậm và được hủy khi đổi neo/rời Shop.
- Khu cao hơn 90% viewport căn đầu, chừa `scroll-margin-top:18px`. Khu thấp căn
  giữa; khoảng trống đầu/cuối Shop cho phép căn giữa cả khu đầu và khu cuối.
- Scroll-spy dùng IntersectionObserver gắn với vùng cuộn. Giữ tập các khu đang
  giao vùng đọc để cuộn ngược vẫn đổi active đúng khi khu linh vật rất dài.
- Click khóa spy ngay từ lúc chọn, qua thời gian chờ render/page motion và khi
  đang cuộn. Giải phóng ở `scrollend`, có fallback khoảng 700ms và theo dõi điểm
  đến cho các lượt cuộn dài. Khi rời Shop hủy IO, ResizeObserver, observer chờ,
  timer và listener scrollend.

## Motion đã áp dụng

| Hiệu ứng | Vị trí thực tế |
|---|---|
| Pill 460ms, đọc tọa độ thật mỗi rAF | `app-motion.js`, `#tt-nav-pill`; `SidebarNavigation.pillTarget()` chọn con hoặc cha khi nhóm đóng |
| Accordion 400ms, grid 0fr/1fr, mũi tên 350ms | Hai `.tt-sidebar-group`; nội dung đóng dùng `inert` |
| Ẩn/mở sidebar 400ms, chữ fade, footer ghim đáy | Sidebar và nút toggle cũ; không đổi thành hàng icon |
| Page/tab entry 400ms, opacity + translateY(14px) | Hook ở `navTo`, `authTab`, `arenaTab`, `selectArenaMode` và hai bộ lọc môn |
| Không nháy khi render/lọc hoặc chọn lại cùng trang/tab | Gating theo khóa trình bày; render catalog/Xem thêm và lọc hồ sơ không được gọi animation trang |
| EXP/tiến độ 900ms | EXP, nhiệm vụ, Pet mood, course progress và thanh kết quả; không kéo dài timer/HP chiến đấu |
| Bump 400ms | Số Xu và điểm hiện có; không đổi số/nguồn dữ liệu |
| Hover/nhấn 150–200ms | Nút chính/thẻ bấm được ngoài màn hình chiến đấu |
| Toast 300ms, nghỉ khoảng 1,8 giây | Toast cũ; hủy timer cũ khi toast mới thay thế |
| Núm theme 400ms và fade nền cùng nhịp | Công tắc ảnh hiện có; giữ circular reveal và layout single-button mobile |
| Một pulse nhẹ | `garden-node[aria-current="step"]` |
| Giảm chuyển động | Tắt CSS animation/transition, pill tức thì, cuộn neo `auto`; không sửa ảnh GIF Pet gốc |

Thanh tiến độ dùng class trình bày width=0 trong hai rAF, **không ghi đè giá trị
inline thật**. Nếu EXP đổi giữa hai frame, giá trị mới vẫn thắng. Page và tab
nằm trong page vừa vào không bị cộng dồn hai lần translateY.

## Tương thích và kiểm thử

Đã kiểm tra trên app local thực, Chrome headless:

```powershell
node --test tests/test_app_motion.js
node --test tests/test_sidebar_navigation.js
node --check public/js/app-motion.js
node --check public/js/sidebar-navigation.js
git diff --check
```

- Giữ `navTo('enrolled')`, `navTo('catalog')`, `navTo('shop')` và các `view-*` cũ.
- Giữ `nav-enrolled`; kiểm tra lối vào cũ từ `btn_hub_xem_tatca_mon` ở trang chủ.
  Các nút hiện có gọi `navTo('enrolled')` dùng lại cùng alias, không phải sửa API
  hoặc tạo deep link/URL router mới. Nút bản đồ/đăng ký/room invitation không đổi.
- Đang theo học → Tất cả môn → Đã hoàn thành; đổi trực tiếp hai bộ lọc trên cùng
  renderer; pill trượt và về đúng con, đóng nhóm về cha mà không đổi trang.
- Đã hoàn thành chỉ lấy đúng môn đủ mốc; loại ca 9/10 dù percent giả lập là 100,
  và loại môn 0 mốc. Badge không bị lọc theo kết quả đang xem.
- Shop 100 Pet: căn đầu đúng 18px, phụ kiện ngắn căn giữa, click neo không chạy
  animation trang, cuộn tay cập nhật lại menu cả hai hướng, từ Hub vào đúng neo,
  chờ grid phụ kiện xuất hiện muộn và căn giữa khu linh vật khi chỉ có một thẻ.
- 1280×600, 1280×700, 844×390 và 390×844 khi các nhóm mở: không tràn ngang,
  không cuộn sidebar, không chồng footer. Bộ motion còn kiểm 1920×1080 và 768×650.
- Bật reduced motion: không CSS animation/transition đang chạy, neo căn tức thì.
- 100 Pet và các môn/đồ thử chỉ gán trong browser test, không gọi API ghi; phục
  hồi mảng gốc/render lại cuối test rồi đóng browser. Không có dữ liệu thử trong DB.

Các lỗi bắt được và sửa trong đợt này: không chờ lại một CSS animation đã
`finished` (tránh lặp microtask khi jump sau entry); giữ tập intersection thay vì
chỉ đọc phần tử mới trong callback; không snap pill khi hai menu dùng cùng view.

## Điểm khác mẫu, có căn cứ

1. `rootMargin` dùng pixel tương ứng **35% trên / 55% dưới theo chiều cao**, thay
   chuỗi phần trăm literal. Theo [đặc tả W3C](https://www.w3.org/TR/intersection-observer/),
   phần trăm rootMargin quy chiếu chiều rộng. Chuỗi trong mẫu có thể thu vùng
   đọc về rỗng trên cửa sổ rộng, thấp. Tỷ lệ vùng đọc mong muốn vẫn giữ nguyên.
2. Dùng `shop-accessories` sẵn có, không đổi tên thành `shop-items` vì ID trong
   prompt là ví dụ và yêu cầu giữ tương thích selector/component cũ.
3. Giữ khung flex hiện có, cố định body vào viewport và `min-height:0` vùng cuộn;
   không dựng thêm một app grid mới. Sidebar vẫn ẩn toàn bộ khi thu gọn.
4. A3 không có cột trạng thái môn riêng. Dùng đúng read-model và quy tắc hoàn
   thành đã có ở hồ sơ, không tự thêm cột hay nghiệp vụ.

Không có câu hỏi còn chặn A3/B2. Trạng thái triển khai được báo riêng sau kiểm tra phát hành.

## Tệp của đợt motion và A/B

- `public/index.html`: di chuyển menu cũ, hai nhóm, hai neo và hook trình bày.
- `public/js/app-motion.js`, `public/css/app-motion.css`: lớp motion dùng chung.
- `public/js/sidebar-navigation.js`, `public/css/sidebar-navigation.css`: nhóm,
  bộ lọc trên view cũ, neo và vòng đời scroll-spy.
- `tests/test_app_motion.js`, `tests/test_sidebar_navigation.js`: kiểm browser.
- Tài liệu này. Các tệp nền vườn/Garden V3 là công việc trước đó, không thuộc A/B.
