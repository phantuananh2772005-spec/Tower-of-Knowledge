# Thiết kế PostgreSQL V1 · Tháp Tri Thức

**Thiết kế đã duyệt ngày 24/11/2026.** Đích là PostgreSQL local `thaptrithuc_v1` trên nhánh `local-pg-v1`. Thiết kế lấy nghiệp vụ từ [LUAT_NGHIEP_VU.md](LUAT_NGHIEP_VU.md). Quyết định đã chốt gồm ẩn khiên, sát thương chung cho mọi Pet, lưu từng lần làm và chi tiết đối chiếu Admin, giữ thưởng thực nhận theo trận, và chỉ cho mốc thuần lý thuyết hoàn thành qua phần đọc.

Thiết kế dùng các tính năng có trong PostgreSQL 16. Mọi tên vật lý là tiếng Anh, ASCII snake_case và tên bảng số nhiều. Tài liệu mô tả schema và cơ chế toàn vẹn đã duyệt. DDL và seed ở `database/pg-v1/`.

## Các quyết định cần thấy khi duyệt

| Điểm khác khung ban đầu | Thiết kế đề xuất và căn cứ |
|---|---|
| **HP và tổng sát thương** | HP thực ra suy được từ 100 HP ban đầu, sát thương đã ghi của đối thủ và trạng thái đầu hàng. Khiên đã ẩn, sát thương không phụ thuộc Pet. Dùng view HP có sàn 0. Đây là chỗ chủ động bỏ cột `match_players.hp` để theo P2. Test sẽ chặn sát thương âm và xác nhận không thể ghi HP tùy ý qua view. |
| **Xu thực nhận của trận, mùa và mốc** | Sổ Xu là nguồn duy nhất của khoản tiền thực đã cấp. FK có kiểu tới trận/người, mùa/người hoặc mốc cho phép lấy lại đúng khoản trên giao diện. Giữ EXP và delta hạng thực tế trong `match_players`, vì tổng tuần, tổng EXP và điểm hiện tại không tái tạo chúng. Giữ hạng đã công bố trong `season_results`, tính Xu khi đọc từ ledger. |
| **Ngày và trạng thái tiến độ** | `milestone_progress.completed_at` đã phân biệt mở và xong. Cột `status` thứ hai và chuỗi “3/5” được suy trong view. Ngày ghi danh có chức năng sắp xếp nên được giữ. Mốc hoàn thành của môn không tạo thêm cột. |
| **Câu đã phát và các lần trả lời** | Bổ sung quan hệ câu đã phát vì mẫu số chấm gồm cả câu bỏ trống. Lượt có khóa phiên–số lượt để giữ nhiều lần làm cùng câu. Token và cặp lưu trong JSONB response của lượt. Sự kiện tra cứu vẫn là dòng riêng để Admin xem từng thời điểm. Hai ngoại lệ JSONB đã được duyệt gồm response phi trắc nghiệm và cấu hình Bloom. |
| **Google và khôi phục** | Lưu `google_verified_email` riêng vì tài khoản có thể liên kết địa chỉ khác. Hash nullable thay cờ có mật khẩu. Thử thách có một thời điểm hết hạn. Với TTL cố định 10 phút của V1, suy giờ cấp để giới hạn gửi lại 60 giây. |
| **Cấu hình nội dung** | Giữ `milestones.kind` vì nó điều khiển đề boss và mốc lý thuyết. Cấu hình Bloom tùy chỉnh nằm ở milestones.bloom_config JSONB, mỗi bước có ba tỷ lệ cộng đúng 100. Giữ thẻ bước của câu do Admin dùng dù truy vấn đề hiện chủ yếu lọc Bloom. Bỏ mô tả chương khỏi schema và form local nếu thiết kế được duyệt, vì chưa thấy chức năng đọc ngoài việc API trả cả bản ghi. |
| **Giá trị 0 và chấm bước** | Giá/thưởng 0 là giá/thưởng 0. Khi thưởng bước dương, giữ luật phân bổ, làm tròn và sàn hiện hành. Một bước mới chỉ tăng tiến độ nếu bằng bước đang mở. Ôn bước trước vẫn lưu lượt nhưng không trả lại thưởng. Đây là thay đổi chủ ý so với nhánh cũ chấp nhận bước lớn hơn bước đang mở. |
| **Ghi danh và ngày nhiệm vụ** | Giữ khả năng tự ghi danh khi người đã xác thực xem lộ trình và giữ thứ tự mốc. Giữ tiêu chí nhiệm vụ theo code B0, kể cả phiên lưu dở, với tập dữ kiện thực sự đã lưu. Mốc thuần lý thuyết cập nhật tiến độ và thưởng, không tự tạo phiên giả để làm tăng nhiệm vụ. |

## Danh mục vật lý

| Nhóm | Bảng | Cột |
|---|---:|---:|
| Tài khoản | 3 | 27 |
| Pet và phụ kiện | 4 | 18 |
| Nội dung | 5 | 37 |
| Học tập | 6 | 36 |
| Kinh tế | 4 | 18 |
| Đấu trường | 7 | 33 |
| **Tổng** | **29** | **169** |

Quy ước trong danh mục. `?` là cột cho phép NULL, các cột còn lại bắt buộc. `PK` trên nhiều cột biểu thị một khóa ghép. `FK` có thể là thành phần của khóa ghép. Khóa UUID sinh cho thực thể có danh tính riêng và giữ nguyên khi đổi tên. Các quan hệ, suất đấu, hàng phiên và lượt dùng khóa nghiệp vụ ghép. `text` dùng miền CHECK thay vì lưu nhiều dạng enum cũ. Mọi timestamp là `timestamptz` và kết nối định dạng UTC. `date` dùng cho ngày địa phương khi bản chất nghiệp vụ là ngày.

### Tài khoản

#### `users`

Tài khoản người học, quản trị hoặc bot.

- Cột `id uuid PK`, `username text`, `email text`, `display_name text`, `role text`, `password_hash text?`, `google_sub text?`, `google_verified_email text?`, `session_version int`, `disabled_at timestamptz?`, `created_at timestamptz`, `xp int`, `coin_balance int`, `streak_days int`, `last_active_date date?`, `equipped_pet_id text?`, `equipped_accessory_id text?`.
- Ràng buộc và căn cứ giữ cột. UNIQUE username/email đã chuẩn hóa, unique lọc Google sub khi có. CHECK role, số dư/EXP/streak/session_version ≥0, trạng thái streak khớp ngày, sub và email Google cùng có hoặc cùng NULL. FK ghép từ id và mã trang bị tới user_pets/user_accessories, RESTRICT. Tên, role, email và hash phục vụ auth. Email Google riêng dùng khôi phục. Ngày tạo hiện trên Admin. XP, Xu và streak là trạng thái nghiệp vụ. disabled_at được dùng để khóa đăng nhập và ghi thời điểm vô hiệu. Chọn Pet/phụ kiện là dữ kiện khác danh sách sở hữu.
- Đối chiếu `services/auth.service.js:38–72,79–173,220–249`, `services/google-identity.service.js:33–66`, `services/session-validity.service.js:1–6`, `public/admin/index.html:2650`.

#### `user_settings`

Cài đặt đồng bộ của một tài khoản.

- Cột `user_id uuid PK FK`, `theme text`, `sound_enabled bool`, `sound_config jsonb?`, `tutorial_progress jsonb?`.
- Ràng buộc và căn cứ giữ cột. FK users CASCADE. theme LIGHT/DARK. Cờ âm thanh tổng và cấu hình từng kênh có nghĩa riêng. JSONB chỉ là object, áp schema khóa theo tính năng. Hướng dẫn có bước, layout, hoàn thành và context theo tài khoản.
- Đối chiếu `services/auth.service.js:68–71,186–213`, `public/js/account-state.js:28–48`.

#### `password_resets`

Một thử thách còn hiệu lực mỗi tài khoản.

- Cột `user_id uuid PK FK`, `google_sub text`, `code_hash text`, `expires_at timestamptz`, `attempts smallint`.
- Ràng buộc và căn cứ giữ cột. FK users CASCADE. attempts 0..5, code_hash duy nhất theo thử thách ở dạng băm. google_sub là định danh đã xác thực lúc cấp và so lại lúc dùng. Index expires_at để dọn thử thách. Duy nhất một mốc giờ vì TTL cả hai luồng là 10 phút. Mốc gửi gần nhất suy từ expiry trừ TTL. Email Google hiện tại lấy từ users, phiên cấp mã ràng buộc email đã xác minh trong đầu vào băm và xóa thử thách khi đổi liên kết.
- Đối chiếu `services/password-recovery.service.js:27–84`, `services/google-identity.service.js:50–66`.

### Pet và phụ kiện

#### `pets`

Danh mục Pet dùng chung cho shop, admin và hiển thị.

- Cột `id text PK`, `name text`, `description text`, `image_path text`, `price_coins int`, `minimum_level smallint`, `required_role text?`, `status text`.
- Ràng buộc và căn cứ giữ cột. Giá ≥0, cấp ≥1, role ADMIN hoặc NULL, status ACTIVE/ARCHIVED. Index (status,price_coins,id) cho shop. Giữ mã và ảnh theo seed danh mục. Tên, mô tả, ảnh có người dùng. ARCHIVED chặn bán mới, Pet đã mua vẫn hiện và dùng được nếu đủ quyền. Phần công thức sát thương độc lập Pet.
- Đối chiếu `services/pet.service.js:27–77`, `config/pets.json:2–156`, `public/index.html:3452–3475,8433–8438`.

#### `accessories`

Danh mục phụ kiện cosmetic, mua và trang bị độc lập.

- Cột `id text PK`, `name text`, `description text`, `price_coins int`, `minimum_level smallint`, `status text`.
- Ràng buộc và căn cứ giữ cột. Giá ≥0, cấp ≥1. ACTIVE/ARCHIVED. Seed mũ Sparky 50 Xu ở ARCHIVED để bảo toàn trạng thái khóa, cấp mặc định 1 vì nguồn không giới hạn. Phụ kiện ARCHIVED không mua/đội được, có thể tháo. Demo kiểm luồng mua có một mẫu ACTIVE riêng trong dữ liệu test. Index (status,price_coins,id).
- Đối chiếu `config/accessories.json:2`, `services/inventory.service.js:6–37`, `public/js/inventory.js:64–145`.

#### `user_pets`

Một quyền sở hữu Pet của người dùng.

- Cột `user_id uuid PK FK`, `pet_id text PK FK`.
- Ràng buộc và căn cứ giữ cột. FK users và pets RESTRICT. PK người–Pet chống cấp/mua trùng. Index pet_id theo chiều ngược. FK trang bị của users trỏ vào cặp này. Không lưu ngày sở hữu hay cờ kích hoạt.
- Đối chiếu `services/pet.service.js:22–26,37–41,52–77`, `services/auth.service.js:120–125`.

#### `user_accessories`

Một quyền sở hữu phụ kiện của người dùng.

- Cột `user_id uuid PK FK`, `accessory_id text PK FK`.
- Ràng buộc và căn cứ giữ cột. FK users và accessories RESTRICT. PK người–phụ kiện, index accessory_id. FK trang bị của users trỏ vào cặp này. Hiển thị đã sở hữu và kiểm điều kiện đội.
- Đối chiếu `services/inventory.service.js:6–37`.

### Nội dung

#### `subjects`

Môn trên kho môn, lộ trình, phòng đấu và Cực Hạn.

- Cột `id uuid PK`, `slug text`, `name text`, `description text?`, `sort_order int`, `status text`.
- Ràng buộc và căn cứ giữ cột. UNIQUE slug. CHECK slug ASCII dạng chữ thường, số, gạch ngang, thứ tự ≥0. Index (status,sort_order,id). Slug phục vụ URL, mã dùng FK. Tên, mô tả và thứ tự có UI đọc. Môn ngừng độc lập theo trạng thái.
- Đối chiếu `services/course.service.js:24,68–70,181–190`, `public/index.html:3841–3940`, `services/admin.service.js:46–69`.

#### `chapters`

Chương nằm trong một môn.

- Cột `id uuid PK`, `subject_id uuid FK`, `title text`, `sort_order int`, `status text`.
- Ràng buộc và căn cứ giữ cột. FK subjects RESTRICT, UNIQUE (subject_id,sort_order), thứ tự ≥0. Giữ cờ độc lập để quản trị ngừng riêng chương theo chính sách đã chốt. Tên và thứ tự có UI đọc. Form mô tả chương bị bỏ theo thiết kế vì chưa thấy giao diện tiêu thụ nội dung đó.
- Đối chiếu `services/course.service.js:190–217`, `services/admin.service.js:75–98`, `public/js/learning-garden.js:21–46`.

#### `milestones`

Một mục học thuần lý thuyết, luyện tập hoặc boss.

- Cột `id uuid PK`, `chapter_id uuid FK`, `title text`, `kind text`, `theory_markdown text?`, `status text`, `sort_order int`, `reward_xp int`, `reward_coins int`, `step_count smallint`, `questions_per_step smallint`, `bloom_config jsonb?`.
- Ràng buộc và căn cứ giữ cột. FK chapters RESTRICT. UNIQUE (chapter_id,sort_order). kind THEORY/QUIZ/BOSS. Thứ tự và thưởng ≥0. THEORY dùng 0 bước và 0 câu mỗi bước. QUIZ/BOSS dùng cả hai >0. Loại quyết định cách lấy đề và điều kiện hoàn thành. Thưởng và số lượng được đọc khi cấp đề/chấm thưởng. Tên, lý thuyết và thứ tự được hiển thị. bloom_config NULL dùng bộ mặc định. CHECK kiểm cấu hình cùng hàng với step_count theo mục Bloom bên dưới.
- Đối chiếu `services/course.service.js:203–217,269–431,832–925`, `public/admin/index.html:725–747`.

#### `questions`

Một phiên bản câu dùng được trong học, arena và Cực Hạn.

- Cột `id uuid PK`, `milestone_id uuid FK`, `type text`, `bloom_level text`, `step_no smallint`, `difficulty smallint`, `stem text`, `explanation text?`, `status text`, `payload jsonb?`.
- Ràng buộc và căn cứ giữ cột. FK milestones RESTRICT. Index (milestone_id,status,bloom_level) cho chọn đề. CHECK enums bên dưới, step_no ≥1, difficulty 1..3. stem/explanation là nội dung hiển thị và chấm. step_no là nhãn admin hiện sửa, không dùng khóa khác thay nó. JSONB giữ dữ liệu chấm phi trắc nghiệm. MCQ dùng NULL và bảng options. Nội dung đáp án chỉ xuất sau chấm hoặc cho Admin.
- Đối chiếu `services/course.service.js:397–486`, `services/arena.service.js:298–350`, `services/extreme.service.js:68–133`, `public/admin/index.html:2176–2283`.

#### `question_options`

Một phương án trắc nghiệm tự nhiên theo vị trí.

- Cột `question_id uuid PK FK`, `position smallint PK`, `text text`, `is_correct bool`.
- Ràng buộc và căn cứ giữ cột. FK questions RESTRICT. position 0..3 và text có nội dung. Unique lọc question_id khi is_correct. Trigger hoãn bảo đảm đúng một phương án đúng cho câu MCQ. Backend kiểm đủ bốn phương án cho MCQ và không có phương án cho loại khác khi phát hành câu. Phương án và dấu đúng là nguồn chấm có thật, không lưu chỉ số đáp án đúng ở questions.
- Đối chiếu `core/rules/progression.rules.js:89–99`, `services/course.service.js:476–486`.

### Học tập

#### `enrollments`

Ghi danh của người học ở một môn.

- Cột `user_id uuid PK FK`, `subject_id uuid PK FK`, `enrolled_at timestamptz`.
- Ràng buộc và căn cứ giữ cột. FK users, subjects RESTRICT. Index (user_id,enrolled_at DESC) cho hồ sơ, index subject_id cho tra môn. Ngày ghi danh có thể trước phiên đầu và đang dùng để sắp xếp. Trạng thái hoàn thành và tỷ lệ môn tính từ tiến độ.
- Đối chiếu `services/course.service.js:68–109,141–175`, `routes/profile.routes.js:7–14`.

#### `milestone_progress`

Tiến độ hiện hành và EXP thực nhận theo mốc.

- Cột `user_id uuid PK FK`, `milestone_id uuid PK FK`, `current_step smallint?`, `xp_earned int`, `completed_at timestamptz?`, `memory jsonb?`.
- Ràng buộc và căn cứ giữ cột. FK users/milestones RESTRICT. Index (user_id,completed_at) và milestone_id. Không có dòng là khóa, đã có dòng là mở, completed_at có giá trị là đã xong. Tránh lặp cột status và chuỗi số bước. current_step chỉ cần ở QUIZ/BOSS chưa xong. Backend khóa mốc và ghi danh trong transaction để kiểm phạm vi và giới hạn current_step. EXP là khoản thực đã ghi theo mốc. Xu xem từ ledger có milestone_id. memory JSONB object per-question dùng ôn thích nghi.
- Đối chiếu `services/course.service.js:220–248,619–745,832–925`, `public/admin/index.html:2850–2875,2910–2934`.

#### `study_sessions`

Định danh phiên dùng để chấm, chốt và mở lại lịch sử.

- Cột `id uuid PK`, `user_id uuid FK`, `kind text`, `milestone_id uuid? FK`, `subject_id uuid? FK`, `step_no smallint?`, `started_at timestamptz?`, `finished_at timestamptz?`, `finish_kind text?`.
- Ràng buộc và căn cứ giữ cột. FK users, milestones, subjects RESTRICT. Cực Hạn theo môn, started_at có thật để đo wall-clock. Phiên khác chỉ trỏ mốc, started_at NULL. Chỉ loại STEP có step_no. finished_at cho ngày học, nhiệm vụ, Admin và nhập chốt đúng một lần. finish_kind phân biệt SUBMITTED/ABANDONED, chỉ STEP được abandon. Cặp finish_kind và finished_at cùng NULL khi đang làm. Index (user_id,finished_at DESC), (milestone_id,step_no), subject_id.
- Đối chiếu `services/course.service.js:607–615,804–815,1034–1045`, `services/extreme.service.js:142–177,332–359`, `routes/profile.routes.js:15–17`.

#### `study_session_questions`

Danh sách câu chính thức được phát trong phiên.

- Cột `session_id uuid PK FK`, `position int PK`, `question_id uuid FK`.
- Ràng buộc và căn cứ giữ cột. FK session và câu RESTRICT. UNIQUE (session_id,question_id), position ≥1 và bất biến sau khi phát. Index question_id. Chứng minh phạm vi chấm và tổng số câu, kể cả bài bỏ trống. Khóa câu và kiểm môn/mốc/chương thích hợp khi lập phiên.
- Đối chiếu `services/course.service.js:391–440,526–569`, `core/rules/progression.rules.js:23–46`, `services/extreme.service.js:44–62`.

#### `session_answers`

Một lượt trả lời thực tế, kể cả lần thử lại cùng câu.

- Cột `session_id uuid PK FK`, `attempt_no int PK`, `question_position int FK`, `is_correct bool`, `seconds numeric(10,3)?`, `selected_option_position smallint?`, `submitted_text text?`, `response jsonb?`.
- Ràng buộc và căn cứ giữ cột. FK ghép (session_id,question_position) tới câu đã phát RESTRICT. attempt_no ≥1, seconds ≥0 nếu có, selected_option_position 0..3 nếu có. CHECK đúng một trong selected_option_position, submitted_text, response. Dạng MCQ gốc lưu chỉ số. Điền từ hoặc lựa chọn chuyển thể Cực Hạn lưu text. JSONB lưu token, cặp hoặc dấu TIMEOUT. Backend kiểm dạng đáp án và lựa chọn khớp câu đã phát trong cùng transaction. Số lần tra cứu tính từ các dòng chi tiết. Không tạo lượt giả cho câu bỏ trống.
- Đối chiếu `public/index.html:7077–7080,7124–7136,8355–8382`, `services/admin.service.js:311–367`, `services/extreme.service.js:353–359`.

#### `session_answer_lookups`

Từng lần mở lý thuyết để tra cứu trong câu.

- Cột `session_id uuid PK FK`, `attempt_no int PK FK`, `lookup_no int PK`, `opened_at timestamptz`, `duration_seconds int`, `offset_seconds int`, `context text`.
- Ràng buộc và căn cứ giữ cột. FK ghép tới lượt CASCADE. lookup_no ≥1, duration_seconds ≥1, offset_seconds ≥0, context BEFORE_ANSWER/AFTER_ANSWER. Thời điểm xảy ra, thời lượng và khoảng cách từ xung bắt đầu câu là telemetry gốc, đều có luồng hiển thị/phân tích. View COUNT dùng thay cho số lượt tra cứu lưu riêng.
- Đối chiếu `public/index.html:8355–8382`, `services/admin.service.js:365–366,700–702`, `public/admin/index.html:2790–2822`.

### Kinh tế

#### `quests`

Danh mục nhiệm vụ có chu kỳ ngày.

- Cột `code text PK`, `reward_coins int`, `reward_xp int`.
- Ràng buộc và căn cứ giữ cột. PK code là danh mục mã hiệu lực. CHECK mã không rỗng và thưởng ≥0. Seed STUDY/BATTLE/PET_CARE từ Bước 0, không giới hạn cứng các mã này trong schema. Backend kiểm điều kiện theo mã rồi dùng FK từ quest_claims bảo đảm mã thuộc danh mục. Quà tân thủ có quy tắc một lần riêng.
- Đối chiếu `services/quest.service.js:5–28`.

#### `quest_claims`

Bằng chứng đã nhận một nhiệm vụ trong ngày Việt Nam.

- Cột `user_id uuid PK FK`, `quest_code text PK FK`, `vn_date date PK`.
- Ràng buộc và căn cứ giữ cột. FK users/quests RESTRICT. Index (vn_date,quest_code) cho báo cáo ngày và quest_code cho FK. vn_date lấy một lần từ thời điểm UTC do DB chọn lúc xử lý. Không cần thêm claimed_at vì UI chỉ quan tâm ngày. Backend ghi sau khi kiểm đủ điều kiện và giữ khóa người dùng trong cùng transaction.
- Đối chiếu `services/quest.service.js:7–39`, `public/index.html:8690–8725`.

#### `weekly_xp_usage`

EXP thi đấu đã được cấp trong tuần của một người.

- Cột `user_id uuid PK FK`, `week_start date PK`, `xp int`.
- Ràng buộc và căn cứ giữ cột. FK users RESTRICT. CHECK week_start là thứ Hai và xp từ 0 đến giới hạn V1 ở mục Hằng số. Key người–tuần chặn trùng trạng thái. Append lịch nhiều tuần chỉ là kết quả tự nhiên của khóa tuần. XP tổng gồm nhóm ngoài quota, không dùng thay xp của tuần.
- Đối chiếu `services/economy.service.js:99–124`, `public/index.html:3066–3067`.

#### `coin_ledger`

Sổ Xu nguồn chuẩn cho mọi khoản cộng và trừ.

- Cột `id bigint identity PK`, `user_id uuid FK`, `kind text`, `delta int`, `occurred_at timestamptz`, `note text?`, `match_id uuid? FK`, `milestone_id uuid? FK`, `season_no int? FK`.
- Ràng buộc và căn cứ giữ cột. FK user RESTRICT. FK ghép (match_id,user_id) tới match_players và (season_no,user_id) tới season_results, FK milestone_id tới milestones, đều RESTRICT. Ref khác NULL theo kind. Chỉ MATCH_REWARD có match_id, chỉ SEASON_REWARD có season_no, chỉ MILESTONE_REWARD có milestone_id. Mua âm, thưởng dương, PET_FEED âm, PET_STROKE bằng 0, ADMIN_ADJUSTMENT khác 0. ID tách các sự kiện có thể cùng người và timestamp. Giờ dùng cho ngày nhiệm vụ/histories. Note giữ lý do Admin nhập và mô tả nghiệp vụ, không chứa khóa dùng để JOIN. Index (user_id,occurred_at DESC,id DESC), index refs và unique lọc mỗi trận, mỗi mùa, mỗi quà tân thủ.
- Đối chiếu `services/economy.service.js:51–90,135–139`, `services/quest.service.js:14–53`, `services/admin.service.js:290–291,777–780`, `services/arena.service.js:503–509`, `services/arena-season.service.js:52–57`.

### Đấu trường

#### `seasons`

Trạng thái chốt theo số mùa xác định trong lịch 56 ngày.

- Cột `season_no int PK`, `is_closed bool`.
- Ràng buộc và căn cứ giữ cột. Số mùa ≥1. Unique lọc trên hằng số khi chưa đóng bảo đảm tối đa một mùa mở. Mốc bắt đầu/kết thúc đọc từ lịch V1, không lưu chồng. is_closed là dấu chốt thực phục vụ mở lại và chịu lỗi khi trả thưởng.
- Đối chiếu `services/arena-season.service.js:5–25,50–68`.

#### `rank_scores`

Điểm đang dùng và điểm khóa của một người trong một môn theo mùa.

- Cột `user_id uuid PK FK`, `subject_id uuid PK FK`, `season_no int PK FK`, `points int`.
- Ràng buộc và căn cứ giữ cột. FK users/subjects/seasons RESTRICT, points ≥0. Index (season_no,subject_id,points DESC) và (season_no,user_id). Đóng mùa thì điểm mùa đó giữ nguyên. Điểm là trạng thái có chuyển điểm đầu mùa, khác tổng delta của trận trong mùa. Tổng theo mọi môn tính SUM khi đọc.
- Đối chiếu `services/arena.service.js:490–505`, `services/arena-season.service.js:28–61`, `routes/arena.routes.js:42–109`.

#### `season_results`

Hạng đã công bố của một người đủ điều kiện khi chốt mùa.

- Cột `season_no int PK FK`, `user_id uuid PK FK`, `rank int`.
- Ràng buộc và căn cứ giữ cột. FK seasons/users RESTRICT. CHECK rank ≥1, chấp nhận đồng hạng. Index (season_no,rank) và (user_id,season_no DESC). Lưu hạng đã công bố. Xu chốt mùa đọc từ ledger có FK tới kết quả, điểm đọc từ rank_scores đã khóa.
- Đối chiếu `services/arena-season.service.js:20–57`, `routes/profile.routes.js:18–23`.

#### `matches`

Trận 1v1 đã mở và kết quả vòng đời của nó.

- Cột `id uuid PK`, `subject_id uuid FK`, `season_no int? FK`, `mode text`, `status text`, `started_at timestamptz`, `finished_at timestamptz?`, `finish_reason text?`.
- Ràng buộc và căn cứ giữ cột. FK subjects/seasons RESTRICT. Mode RANKED/CASUAL/PRACTICE. Trạng thái ACTIVE/FINISHED/CANCELLED. ACTIVE không có giờ/lý do chốt. Trạng thái cuối bắt buộc giờ và lý do hợp lệ. CHECK bắt buộc mùa cho RANKED FINISHED và để NULL khi chưa có mùa theo quy tắc. Backend kiểm cửa sổ của finished_at dưới khóa mùa khi chốt. started_at dùng đồng hồ hiệp đầu. finished_at dùng nhiệm vụ, bảng hạng và rollover. Index (season_no,subject_id,finished_at), (status,finished_at). Người thắng lấy từ match_players.
- Đối chiếu `services/arena.service.js:15–29,284–296,442–509`, `services/quest.service.js:16–17`.

#### `match_players`

Hai suất của một trận và khoản thực cấp theo từng người.

- Cột `match_id uuid PK FK`, `slot smallint PK`, `user_id uuid FK`, `result text?`, `xp_awarded int`, `rating_delta int`.
- Ràng buộc và căn cứ giữ cột. FK matches/users RESTRICT. CHECK slot 1/2, xp_awarded ≥0. UNIQUE (match_id,user_id), unique lọc match_id khi WIN. Index (user_id,match_id). Trận mở/hủy không có result và thưởng. Chốt có WIN/LOSE hoặc DRAW/DRAW. XP thực nhận không âm và delta điểm hạng có thể âm. Hai giá trị không suy được từ tổng tuần hoặc điểm hiện tại. Xu từ ledger, HP từ view.
- Đối chiếu `services/arena.service.js:442–509`, `public/index.html:4925–4951,5041`.

#### `match_rounds`

Một câu được chọn ở một hiệp trong trận.

- Cột `match_id uuid PK FK`, `round_no smallint PK`, `question_id uuid FK`.
- Ràng buộc và căn cứ giữ cột. FK matches/questions RESTRICT. round_no 1..10, UNIQUE (match_id,question_id). Index question_id. Backend kiểm đề đúng môn, nội dung đang ACTIVE lúc phát và hiệp liên tiếp trong transaction. Lưu lịch sử câu bằng FK tới phiên bản bất biến.
- Đối chiếu `services/arena.service.js:58–89,113–120`.

#### `match_answers`

Lượt chấm của một suất trong một hiệp.

- Cột `match_id uuid PK FK`, `round_no smallint PK FK`, `slot smallint PK FK`, `is_correct bool`, `response_seconds numeric(10,3)`, `damage int`, `answered_at timestamptz`.
- Ràng buộc và căn cứ giữ cột. Hai FK ghép tới round và player cùng match_id, RESTRICT. CHECK seconds và damage ≥0. Index (match_id,slot,round_no). is_correct, thời lượng và sát thương là kết quả server đã ghi khi chấm. answered_at làm mốc hiệp kế. Không giữ chỉ số lựa chọn vì lịch sử arena không hiển thị nó, khác Admin học.
- Đối chiếu `services/arena.service.js:236–296,351–425`, `routes/arena.routes.js:72–109`.

## Hằng số nguồn của V1

DDL khai báo các hằng số bằng hàm SQL `IMMUTABLE` mặc định `SECURITY INVOKER` ở đầu **`database/pg-v1/001_schema.sql`**, trước các bảng và CHECK dùng chúng. Không có bảng cấu hình mới. Backend đọc các hàm khi khởi động, truyền tham số vào luật thuần, và đưa giới hạn cần hiển thị ra DTO. View và CHECK gọi cùng nguồn DB. Thiếu hằng số thì dừng khởi động, tránh giá trị JS dự phòng bị lệch.

| Hằng số | Giá trị | Hàm nguồn và nơi sử dụng |
|---|---:|---|
| Độ dài mùa | **56 ngày** | `v1_season_length_days()`. Backend chọn mùa và view lịch mùa dùng cùng hàm. Mốc đầu từ `v1_first_season_start()` là 09/11/2026 00:00 Việt Nam. Cộng số giây cố định theo UTC để cửa sổ mùa không phụ thuộc múi giờ của phiên kết nối. |
| Hạn mức EXP thi đấu | **1.500 EXP/tuần** | `v1_weekly_xp_limit()`. CHECK của `weekly_xp_usage`, backend cấp EXP và DTO quota dùng cùng giá trị. Tuần bắt đầu thứ Hai theo ngày Việt Nam. |
| HP ban đầu | **100** | `v1_arena_initial_hp()`. View HP, so chốt trận và thanh HP frontend qua DTO. |
| Sát thương cơ bản | **12** | `v1_arena_base_damage()`. Backend áp khi chấm một lượt đúng. |
| Thưởng sát thương nhanh | **+3** | `v1_arena_fast_bonus()` và `v1_arena_fast_answer_seconds()` bằng 5 giây. Backend áp ở lượt đúng có thời lượng ≤5 giây. Lượt sai có sát thương 0. |

Đây là hằng số theo phiên bản. Nếu cần đổi sau V1, dùng migration có duyệt, rà lại CHECK, lịch mùa, kết quả đã lưu và khởi động lại backend. Sát thương từng lượt đã ghi giữ nguyên.

## Miền nghiệp vụ và cơ chế kiểm

### Tài khoản, trang bị và thời gian

- Vai trò `LEARNER/ADMIN/SYSTEM`. SYSTEM dành cho bot nội bộ, không đăng nhập qua HTTP hoặc OAuth. Với tài khoản người thật, CHECK yêu cầu ít nhất một trong hash và Google sub. Chuẩn hóa tên đăng nhập, email và email Google về chữ thường trước lưu. UNIQUE của username/email dựa trên dữ liệu đã chuẩn hóa. Nếu email Google đã liên kết có nhiều tài khoản do dữ liệu ngoài dự kiến, luồng recovery phải xác định ứng viên duy nhất và từ chối khi không xác định được.
- Tạo người dùng trong một transaction theo thứ tự người dùng với hai slot trang bị NULL, user_settings, cấp Sparky qua user_pets, rồi UPDATE slot Pet. FK ghép dùng MATCH SIMPLE nên NULL hợp lệ. Khi đổi Pet, sửa slot bằng đúng cặp sở hữu. Khi muốn xóa quyền sở hữu đang trang bị, FK chặn đến khi đổi hoặc tháo. Việc xóa cứng tài khoản có lịch sử bị RESTRICT, quyền runtime cũng không cho xóa người dùng. Vô hiệu hóa cập nhật `disabled_at` và tăng `session_version` để các phiên cũ không tiếp tục ghi. [Tài liệu PostgreSQL về FK và CHECK](https://www.postgresql.org/docs/16/ddl-constraints.html).
- Đăng nhập Google xác minh sub và email của phiên rồi ghi trong transaction. Một thử thách khôi phục gắn `user_id`, sub và email Google xác minh vào đầu vào hash. Ghi hoặc gỡ liên kết và xóa reset đang mở dưới lock người dùng. Chấp nhận reset dưới cùng lock, tăng số lần sai nếu sai, hoặc đổi mật khẩu, tăng phiên bản và tiêu thụ thử thách nếu đúng. Tài khoản đã vô hiệu không tạo hoặc dùng reset. HTTP và Socket.IO đều đối chiếu người dùng hiện tại khi thực hiện hành động cần xác thực.
- `disabled_at`, `expires_at`, `started_at` và `finished_at` là thời điểm UTC trong PostgreSQL. Ngày VN dùng `(instant AT TIME ZONE 'Asia/Ho_Chi_Minh')::date`. Đầu tuần lấy thứ Hai từ datetime đã chuyển sang VN rồi lấy date. Luồng PostgreSQL cấp giờ, frontend chỉ đổi định dạng để hiển thị. Với chốt trận/kỳ, lấy một mốc thời gian sau khi có lock và dùng mốc đó cho cả phép tính và dữ kiện đã lưu. [Tài liệu PostgreSQL về thời gian và múi giờ](https://www.postgresql.org/docs/16/functions-datetime.html).

### Nội dung, đáp án và tính bất biến

- Bảng nội dung và danh mục dùng `ACTIVE/ARCHIVED`. Dòng con hiển thị trong luồng mới khi nó và toàn bộ tổ tiên đều ACTIVE. Cờ con lưu quyết định riêng, việc ngừng môn không ghi đè cờ chương/mốc/câu. Chỉnh nội dung lộ trình giữ ID của môn/chương/mốc và thứ tự unique, không chuyển chương/mốc sang cha khác. Quyền UPDATE theo cột của role runtime loại trừ khóa chính và liên kết cha. Backend khóa mốc khi kiểm lịch sử và giữ nguyên loại, số bước nếu đã có lượt hoặc tiến độ. Các phép chỉnh không làm đổi tham chiếu lịch sử vẫn thực hiện qua nghiệp vụ quản trị.
- Câu `MULTIPLE_CHOICE` có bốn hàng `question_options` vị trí 0–3. Unique lọc bảo đảm tối đa một hàng đúng. Constraint trigger DEFERRABLE INITIALLY DEFERRED bảo đảm câu MCQ còn đúng một hàng đúng khi hoàn tất transaction. Trigger trên câu và phương án đọc trạng thái cuối. Backend kiểm đủ bốn phương án cho MCQ và không có phương án cho loại khác trong transaction phát hành. [Constraint trigger](https://www.postgresql.org/docs/16/sql-createtrigger.html), [partial unique index](https://www.postgresql.org/docs/16/indexes-partial.html).
- `questions.type` là `MULTIPLE_CHOICE/MATCHING/FILL_BLANK/ORDERING`. `bloom_level` là `REMEMBER/UNDERSTAND/APPLY`, chuyển alias THONG_HIEU và PHAN_TICH sang cấp chuẩn của luồng chọn đề. JSONB phi trắc nghiệm là object chuẩn theo loại. MATCHING có `pairs` gồm `left/right` và ít nhất một cặp. FILL_BLANK có `sentence_template`, `options`, `blank_answer` và đúng một chỗ `{blank}`. ORDERING có `prompt`, `correct_order` và `distractors`. Validator DB dùng dữ liệu cùng hàng, xác nhận kiểu và phần tử chuỗi bắt buộc. Dữ liệu seed/admin dùng cùng hình dạng.
- Nội dung và phương án đã phát phải bất biến kể cả phiên đang mở. V1 dùng quy tắc đơn giản cho mọi câu đã ghi. Chỉnh cấu trúc luôn phát hành bản mới và chuyển status bản cũ sang ARCHIVED trong một transaction backend. Role `thaptrithuc_v1_runtime` được cấp `UPDATE (status, step_no, difficulty)` trên `questions`. Admin có thể chỉnh nhãn bước và độ khó trên cùng ID qua backend. Nội dung câu, giải thích, payload và phương án bất biến với role runtime. Đổi nội dung tạo bản mới và chuyển bản cũ sang ARCHIVED. Role runtime được INSERT câu/phương án lúc khởi tạo và không có UPDATE/DELETE trên question_options. Backend tạo trọn bộ phương án khi thêm câu và từ chối thêm phương án vào câu đã phát hành. RESTRICT từ round/phiên giữ câu cũ. Điều này bảo toàn cả kết quả đã chốt và người làm đang giữ ID đề. Trang quản trị xóa bằng ARCHIVED ở cả bốn cấp. Chỉ phiên và từng lượt hợp lệ được xử lý, đáp án đúng và giải thích không có trong payload phát đề. Học gửi một lượt để server kiểm và trả phản hồi, nên vẫn có phản hồi ngay.
- Backend khoanh phạm vi đề và kiểm tổ tiên ACTIVE trong transaction khi phát. STEP và MILESTONE đọc câu của mốc. BOSS đọc các mốc cùng chương. EXTREME đọc cùng môn. Lấy khóa FOR SHARE trên tổ tiên và câu theo thứ tự nhất quán để thao tác đổi trạng thái phải chờ đến khi phát đề xong. FK ghép giới hạn lượt ở câu đã phát. Khi gửi lại, backend khóa phiên và trả kết quả của cùng `attempt_no`. Từ chối trùng khóa với câu hoặc nội dung khác. App chỉ ghi và chốt qua các đường nghiệp vụ.
- Backend chấm và kiểm kiểu khớp câu trong giao dịch ghi lượt. MCQ gốc ghi vị trí chuẩn của option trong kho câu, không ghi chỉ số hiển thị sau khi xáo. Chuyển thể của Cực Hạn và điền từ ghi nội dung đã chọn. Ghép và sắp xếp ghi response JSONB. Cực Hạn có thể gặp lại câu ở vòng sau với cùng vị trí nguồn và attempt_no mới. Câu không chơi vẫn có trong bộ đề nhưng không sinh lượt.
- Phiên có mốc kéo theo môn qua chương. Phiên EXTREME có subject_id trực tiếp. CHECK cùng hàng theo kind bắt đúng một liên kết và cột bước/started_at đi kèm. Backend khóa và kiểm giới hạn bước, ghi danh, thao tác chốt và cập nhật tiến độ trong cùng transaction. EXTREME không cần ghi danh. Khách Cực Hạn giữ phiên tạm thời và không ghi lịch sử/thưởng.

### CHECK cho hai cột JSONB mới

- `milestones.bloom_config` là SQL NULL khi dùng bộ mặc định. Khi có giá trị, đó là object với khóa số bước dạng chính tắc, ví dụ `{"1":{"remember_pct":70,"understand_pct":30,"apply_pct":0}}`. Bước phải nằm trong 1..step_count. Mỗi bước có đúng ba khóa, mỗi giá trị là số nguyên JSON từ 0 đến 100 và tổng đúng 100. Bước không cấu hình tiếp tục dùng preset. Mốc THEORY có cấu hình NULL. CHECK gọi bộ kiểm thuần cùng hàng, trả false khi sai kiểu hoặc thiếu trường.
- `session_answers` dùng `num_nonnulls(selected_option_position, submitted_text, response) = 1`. Chỉ số MCQ có miền 0..3. Văn bản cần khác rỗng sau trim. JSONB chỉ nhận một trong ba dạng `{"kind":"ORDERING","tokens":["SELECT","FROM"]}`, `{"kind":"MATCHING","pairs":[{"left":"A","right":"B"}]}`, `{"kind":"TIMEOUT"}`. Mỗi dạng chỉ có các khóa đã liệt kê. Mảng token/cặp phải có phần tử và từng phần tử phải đúng kiểu. JSON literal null và dạng thiếu khóa bị từ chối. TIMEOUT không có nội dung khác và bắt buộc `is_correct = false`. CHECK phủ riêng trường hợp SQL NULL và ép kết quả validator sai kiểu/thiếu khóa thành false để giá trị UNKNOWN không qua kiểm. Backend xác minh dạng đã chọn phù hợp câu thực tế.

### Sổ Xu, thưởng, hạn mức

- Role migration sở hữu schema. Role runtime có SELECT và INSERT trên ledger cùng quyền cập nhật cột coin_balance ở users theo nghiệp vụ. Thu hồi UPDATE, DELETE và TRUNCATE trên ledger. Backend lấy khóa SELECT FOR UPDATE của dòng users, tính delta, ghi ledger và cập nhật coin_balance trong cùng transaction. Nếu lỗi ở một trong hai bước thì rollback cả hai. CHECK số dư ≥0 vẫn do DB bảo vệ. Không dùng SECURITY DEFINER hoặc hàm DB để ghi sổ.
- Enum `coin_ledger.kind`. `STREAK_REWARD/MILESTONE_REWARD/MATCH_REWARD/EXTREME_REWARD/PET_PURCHASE/ACCESSORY_PURCHASE/DAILY_QUEST_REWARD/PET_FEED/PET_STROKE/ONBOARDING_REWARD/SEASON_REWARD/ADMIN_ADJUSTMENT`. CHECK kiểm dấu delta và xác định refs cho loại có khóa. Quà miễn phí cấp quyền trực tiếp. Chi ban đầu hoặc seed có số dư dương phải đi qua sổ. Hiển thị số dư hiện tại từ users, còn số dư sau ở lịch sử nếu giữ giao diện thì WINDOW SUM theo thứ tự ID trong phạm vi người dùng. Khóa người dùng trước khi cấp ID bảo toàn thứ tự sổ của cùng tài khoản.
- Backend nhận nhiệm vụ dưới khóa người dùng. Đọc mã và mức thưởng từ quests, kiểm điều kiện tương ứng theo nghiệp vụ, rồi INSERT quest_claims. Chỉ giao dịch tạo được khóa người–nhiệm vụ–ngày mới trả thưởng. Trùng khóa trả kết quả đã nhận và không đổi số dư/EXP. Mã mới có thể tồn tại trong danh mục trước khi backend hỗ trợ điều kiện, khi chưa có handler thì chưa được claim. Backend dùng một thời điểm DB cho ranh giới ngày. Fixture có thể cấp instant bên trong test, endpoint runtime không nhận thời điểm do client đưa. Quà tân thủ dùng unique lọc ledger. Vuốt Pet là PET_STROKE với delta 0.
- Chỉ hai luồng trận và EXTREME dùng weekly_xp_usage. Bên giữ lock người dùng tính phần được cấp và đồng thời cập nhật quota và tổng XP. Báo cáo trận dùng amount thực cấp ở `match_players.xp_awarded`. Mốc thuần lý thuyết chỉ thưởng khi completed_at chuyển từ NULL sang có giờ. QUIZ/BOSS cập nhật ở bước hiện tại hoặc hoàn thành toàn mốc theo chấm hợp lệ. Số dư dương hay lịch sử chữ không được dùng như chứng từ chống nộp trùng.
- Khoản Xu thưởng trận liên hệ cả người và trận qua FK ghép, và UNIQUE theo cặp ở loại MATCH_REWARD. Xu thưởng mùa tương tự với bản kết quả mùa. Xu theo mốc tính từ tổng ledger `MILESTONE_REWARD` của cặp người–mốc. Cột điểm hạng thay đổi giữ giá trị thực sau sàn và có thể âm.

### Trận, điểm và chốt mùa

- Lock nhất quán theo thứ tự khóa chốt mùa nếu cần, trận, người dùng theo UUID tăng dần. Tạo trận ACTIVE cùng hai hàng slot 1 và 2 trong một transaction. PK hai slot chặn người thứ ba ngay. Trigger hoãn trên trận và thành viên bảo đảm đủ hai sau ghi. Chế độ RANKED chặn SYSTEM. PRACTICE dùng cả trường hợp có bot và đường luyện từ REST, còn CASUAL là hai người trong phòng. Không giữ mốc tạo sảnh hay hàng chờ trong DB.
- Backend khóa hàng trận, giữ khóa FOR SHARE trên nội dung được chọn theo cùng thứ tự với luồng học, rồi xác nhận câu thuộc môn và các cấp còn ACTIVE lúc phát. Kiểm hiệp liền kề và không nhận lượt hiệp sau khi hiệp trước chưa đủ hai lượt. FK ghép của lượt cùng match_id vẫn bảo đảm đúng trận, người và hiệp. Chấm server dùng hằng số V1 và đồng hồ trận/lượt. Ghi lượt trước, phát dữ liệu sau commit. Lượt trùng khóa trả kết quả đã lưu. Hết giờ theo loại giữ luật hiển thị từ Bước 0. V1 ẩn nút khiên và dùng sát thương chung.
- CHECK cùng hàng buộc lý do, thời điểm chốt và sự hiện diện của mùa theo trạng thái và chế độ. FINISHED có KNOCKOUT/FORFEIT/TIMEOUT/DRAW. CANCELLED có lý do CANCELLED và không thưởng. Backend kiểm cặp kết quả khi giữ khóa trận. ACTIVE/CANCELLED không có kết quả, FINISHED dùng WIN + LOSE hoặc DRAW + DRAW. Unique lọc DB chặn hai WIN. Backend từ chối đổi kết quả terminal hoặc thưởng lần hai. Mất kết nối sau khi tạo trận vẫn xử lý như đầu hàng.
- HP ở view là `greatest(0, v1_arena_initial_hp() - tổng damage của đối thủ)`. Bên LOSE trong trận FORFEIT hiển thị 0. Sát thương áp dụng của lượt là dữ kiện lịch sử. Chốt theo HP rồi số câu đúng rồi sát thương, nếu bằng thì DRAW. Winner lấy suất WIN, không giữ thêm FK chiến thắng trên matches. View tổng hợp là read-only, ngay schema cơ sở không có cột HP để ghi giá trị âm.
- Mùa 1 bắt đầu 00:00 ngày 09/11/2026 giờ Việt Nam, mỗi mùa 56 ngày. Backend chọn mùa và view lịch mùa đọc bộ hằng số V1 ở trên. Từ ngày đầu và số mùa suy cửa sổ `[start,end)`. Khóa tư vấn transaction duy nhất cho cả rollover và chốt trận hạng. Vừa qua rollover thì đóng mùa cũ, chốt RANK đồng điểm, ghi season_results và trả thưởng bằng ledger, tạo mùa mới trong cùng transaction. Giữ điểm mùa cũ, carry điểm từng môn sang mùa mới bằng `floor(points/2^min(31, khoảng cách mùa))`. Không cấp thưởng cho mùa trung gian chưa từng mở. Khóa ghép user–subject–season chặn điểm trùng. Trận chốt hạng gắn mùa đang có hiệu lực lúc chốt, kể cả mở trước nửa đêm.
- Giữ tier, thưởng, tiêu chí đủ lượt, loại bot/admin khỏi bảng công khai, đồng hạng và chuỗi thắng theo [luật Bước 0](LUAT_NGHIEP_VU.md). Chuỗi thắng và thống kê bảng hạng tính trên trận hạng đủ lượt đã chốt trong mùa. Khi tra lịch sử, bảng phiên/đấu/quỹ không loại bản ghi chỉ vì nội dung hoặc người dùng đã ngừng.

## Ba nhóm trigger giữ lại

| Nhóm | Cơ chế giữ | Vì sao FK hoặc CHECK chưa đủ |
|---|---|---|
| **Đúng một đáp án đúng mỗi câu MCQ** | FK tới câu, PK vị trí 0..3 và unique lọc ngăn nhiều hơn một đáp án đúng. Dùng một hàm kiểm đúng một hàng có dấu đúng cho MCQ, với constraint trigger hoãn trên thay đổi ở `questions` và `question_options`. | FK chỉ kiểm hàng đích tồn tại. CHECK đọc từng hàng. Chúng không thể yêu cầu mỗi MCQ có ít nhất một dòng con đúng khi giao dịch hoàn thành. |
| **Sổ Xu chặn UPDATE/DELETE** | Một trigger từ chối UPDATE hoặc DELETE trên `coin_ledger`, bổ sung cho quyền app chỉ đọc và INSERT. | FK và CHECK kiểm dữ liệu còn lại, không phân biệt lịch sử của một hàng hợp lệ có bị sửa hoặc xóa hay không. Quyền cũng chặn TRUNCATE ở app. |
| **Đúng hai người trong trận** | PK (match_id,slot), CHECK slot 1/2, UNIQUE người theo trận và một hàm đếm được gọi bởi constraint trigger hoãn trên `matches` và `match_players`. | Các khóa chặn người thứ ba và trùng người. Chúng không bắt bản ghi trận phải có đủ hai dòng tham gia, kể cả khi tạo trận với 0 người hoặc xóa một người trước commit. |

Tổng cộng có năm khai báo trigger trong ba nhóm. Nhóm thứ nhất và thứ ba mỗi nhóm có khai báo trên bảng cha và bảng con để bắt cả đường tạo cha lẫn thay đổi con. Trigger chỉ kiểm một đáp án đúng, sổ Xu chỉ ghi thêm và đủ hai suất. Backend kiểm số lượng phương án theo loại câu, cặp WIN/LOSE/DRAW, cửa sổ mùa, hiệp liền kề, đúng môn và điều kiện chốt thưởng trong giao dịch tương ứng. Các trường hợp FK, CHECK và UNIQUE xử lý được vẫn giữ trong DB. [Tài liệu PostgreSQL về CHECK và FK](https://www.postgresql.org/docs/16/ddl-constraints.html), [constraint trigger](https://www.postgresql.org/docs/16/sql-createtrigger.html).

## Rủi ro đã chấp nhận

- FK của `match_rounds.question_id` kiểm câu tồn tại. Kiểm câu thuộc môn của trận nằm hoàn toàn ở giao dịch backend. Ghi SQL trực tiếp có thể gắn một câu thuộc môn khác vào trận. Bước 4 bắt buộc có kiểm thử qua luồng mở hiệp thật, tạo hai môn riêng, đưa câu của môn B vào trận môn A và xác nhận bị từ chối, không có dòng hiệp mới và không phát câu cho người chơi. Dùng câu đúng môn làm ca đối chứng.
- Tính nhất quán giữa số dư và sổ Xu dựa vào transaction có khóa dòng. `verify_v1.sql` kiểm `users.coin_balance = COALESCE(SUM(coin_ledger.delta), 0)` cho mọi người dùng sau các ca thưởng, mua và rollback.

## View và điểm tích hợp

| View | Trường tính khi đọc chính |
|---|---|
| `v_subject_progress` | Số mốc mở/hoàn thành, phần trăm theo mốc đang khả dụng. Giữ kết quả lịch sử của mốc ARCHIVED trong route lịch sử riêng. |
| `v_milestone_progress` | Trạng thái LOCKED/OPEN/COMPLETED, số bước, Xu thực nhận từ ledger, không lưu nhãn hoặc phần trăm. Tỷ lệ đạt lấy lượt cuối trên bộ đề chính thức, câu thiếu tính sai. |
| `v_study_session_stats` | Đúng/tổng trên lượt thực tế, tổng tra cứu theo số dòng, tốc độ trung bình chỉ trên lượt có seconds. Phiên EXTREME dùng finished_at trừ started_at cho thời lượng hoạt động, per-answer speed chỉ có khi đo được. Giá trị không đo được trả NULL. Admin chọn cách hiển thị phù hợp. |
| `v_step_records` | Lượt đầu theo câu, chọn kết quả tốt nhất mỗi bước, hòa ưu tiên phiên sớm. Tính số sao, hạng và thời gian từ dữ kiện gốc. |
| `v_match_player_stats` | HP, tổng damage, kết quả, thưởng Xu, XP và delta. |
| `v_season_calendar`, `v_season_awards` | Cửa sổ mùa, hạng đã chốt và số Xu thực cấp đọc từ ledger. |
| `v_coin_history` | Giao dịch có delta, nguyên nhân và số dư lũy kế khi Admin cần số dư sau. |

HTTP, socket và admin chuyển đồng thời sang DTO mới sau khi bài kiểm chứng DB đạt. Danh sách 82 route và field thực đọc nằm trong [luật Bước 0](LUAT_NGHIEP_VU.md#kiểm-kê-api-http-và-trường-phản-hồi-frontend-đọc). Không đưa khóa đáp án vào payload phát đề. Các mã cũ trong tài liệu chỉ là bằng chứng và đầu vào của quá trình chuyển dữ liệu seed.

## Sơ đồ Mermaid

Các nhánh optional với phiên, trang bị, mùa trận và nguồn Coin dùng CHECK phạm vi hoặc FK ghép như mô tả. Các cạnh mũi chỉ biểu diễn liên hệ, còn khóa và quy tắc xóa nằm trong danh mục phía trên.

```mermaid
erDiagram
    users ||--o| user_settings : settings
    users ||--o| password_resets : has_challenge
    users ||--o{ user_pets : owns
    pets ||--o{ user_pets : catalog
    users ||--o{ user_accessories : owns
    accessories ||--o{ user_accessories : catalog
    user_pets o|--o| users : equipped_pet
    user_accessories o|--o| users : equipped_accessory
    subjects ||--o{ chapters : contains
    chapters ||--o{ milestones : contains
    milestones ||--o{ questions : bank
    questions ||--o{ question_options : mcq_options
    users ||--o{ enrollments : enrolls
    subjects ||--o{ enrollments : enrolled_subject
    users ||--o{ milestone_progress : progresses
    milestones ||--o{ milestone_progress : tracked_milestone
    users ||--o{ study_sessions : studies
    milestones o|--o{ study_sessions : milestone_scope
    subjects o|--o{ study_sessions : extreme_scope
    study_sessions ||--o{ study_session_questions : assigns
    questions ||--o{ study_session_questions : historical_question
    study_session_questions ||--o{ session_answers : attempts
    session_answers ||--o{ session_answer_lookups : theory_lookups
    quests ||--o{ quest_claims : daily_rule
    users ||--o{ quest_claims : claims
    users ||--o{ weekly_xp_usage : capped_xp
    users ||--o{ coin_ledger : wallet
    milestones o|--o{ coin_ledger : milestone_reward
    seasons ||--o{ rank_scores : season_points
    users ||--o{ rank_scores : player_points
    subjects ||--o{ rank_scores : subject_points
    seasons ||--o{ season_results : published
    users ||--o{ season_results : ranked_player
    season_results o|--o| coin_ledger : season_reward
    subjects ||--o{ matches : match_subject
    seasons o|--o{ matches : ranked_season
    matches ||--|{ match_players : two_slots
    users ||--o{ match_players : plays
    match_players o|--o| coin_ledger : match_reward
    matches ||--|{ match_rounds : rounds
    questions ||--o{ match_rounds : frozen_question
    match_rounds ||--o{ match_answers : round_answers
    match_players ||--o{ match_answers : answers
```

## Kiểm chứng DB và giao dịch backend

| Điểm yếu hoặc yêu cầu | Cơ chế và ca kiểm |
|---|---|
| Quyền sở hữu Pet hoặc phụ kiện | **Bước 3.** Tạo account, cấp Sparky và trang bị hợp lệ. FK ghép chặn trang bị chưa sở hữu. PK chặn trùng cặp người–Pet/phụ kiện. |
| Trắc nghiệm thiếu hoặc nhiều đáp án đúng | **Bước 3.** Câu MCQ có một phương án đúng qua kiểm. Buộc chạy trigger hoãn ở ca tạo MCQ không có phương án và ca có phương án nhưng đều sai. Unique lọc chặn hai phương án đúng. **Bước 4–5.** Giao dịch phát hành từ chối MCQ thiếu phương án và câu kiểu khác có phương án MCQ. |
| Bảo toàn câu từng phát và cấu trúc môn | **Bước 3.** Role runtime sửa được step_no và difficulty nhưng không sửa stem, payload, phương án hay FK cha của chương/mốc. FK RESTRICT của dữ liệu lịch sử chặn xóa câu/môn. **Bước 4–5.** Chuyển ARCHIVED và tạo bản mới trong một transaction, bài cũ vẫn đọc bản cũ. Chặn đổi loại hoặc số bước của mốc đã học. |
| Phạm vi phiên và các lần làm lại | **Bước 3.** Phiên theo mốc hoặc EXTREME theo môn hợp lệ, thiếu cả hai, đồng thời có cả hai hoặc dùng sai loại đều bị CHECK từ chối. Hai attempt hợp lệ của cùng câu tồn tại riêng. FK ghép chặn lượt ngoài bộ đề. **Bước 4–5.** Admin thấy cả hai lần làm. Chọn đề lệch môn/mốc/chương, tổ tiên đã ARCHIVED hoặc sai bước bị từ chối qua service. |
| Đáp án lưu đúng một dạng | **Bước 3.** Nhận MCQ, text, cặp nối, token hoặc TIMEOUT hợp lệ. Từ chối 0 hoặc nhiều dạng, JSON null, thiếu kind, sai kiểu phần tử và TIMEOUT có kết quả đúng. Kiểm cả payload phi trắc nghiệm của câu hỏi. **Bước 4–5.** Từ chối dạng không khớp câu đã phát và xác nhận chỉ số MCQ đã xáo được ánh xạ về vị trí gốc. |
| Bloom theo bước | **Bước 3.** Nhận cấu hình có ba tỷ lệ hợp lệ tổng 100 và SQL NULL khi dùng mặc định. Từ chối thiếu/thừa khóa, tỷ lệ ngoài miền, chuỗi hoặc số lẻ, tổng khác 100, bước ngoài phạm vi và cấu hình trên mốc THEORY. **Bước 4–5.** Kiểm bộ phát đề đọc đúng override và quay về preset ở bước thiếu cấu hình. |
| Danh mục nhiệm vụ và nhận thưởng | **Bước 3.** Thêm mã mới không cần đổi CHECK. FK chặn mã ngoài danh mục, PK chặn claim cùng ngày. **Bước 4–5.** Hai thời điểm 16:59:59Z và 17:00:00Z vào hai ngày Việt Nam, nhận đồng thời cùng ngày chỉ có một phần thưởng, mã mới chưa có điều kiện không claim được. Kiểm thêm quà tân thủ và quota theo tuần. |
| Hai người, hiệp và kết quả trận | **Bước 3.** Nhận trận đủ hai suất, chặn trận có 0/1 người, xóa làm thiếu người hoặc chèn người thứ ba. Chặn hai WIN và lượt theo người/hiệp thuộc trận khác. **Bước 4–5.** Chặn câu khác môn, hiệp không liên tiếp và thay đổi trận đã chốt. Kiểm WIN + LOSE, DRAW + DRAW, đầu hàng, hủy và hết giờ. |
| HP, Xu, EXP, điểm âm và thứ tự trùng | **Bước 3.** CHECK chặn giá trị âm ở cột có miền không âm và hạn mức EXP vượt 1.500. View kẹp HP ở 0, không có cột HP để ghi thủ công. UNIQUE chặn trùng thứ tự chương/mốc cùng cha. **Bước 4–5.** Kiểm sát thương 12/+3, hiển thị HP và nhận EXP khi chạm trần từ hai phiên đồng thời. |
| Chốt mùa | **Bước 3.** Chặn hai mùa mở, trùng người–môn–mùa và trận có tham chiếu mùa không hợp lệ. **Bước 4–5.** Kiểm cửa sổ 56 ngày, ranh giới khi chốt trận, chốt mùa hai lần không thưởng lại và điểm cũ được giữ. |
| Sổ Xu chỉ ghi thêm và số dư nhất quán | **Bước 3.** Role runtime không có quyền UPDATE, DELETE hoặc TRUNCATE trên ledger. Dùng role kiểm thử có quyền UPDATE/DELETE để xác minh trigger từ chối cả hai lệnh, rồi rollback. Đối soát mọi tài khoản sau ca thưởng, mua và rollback. **Bước 4–5.** Cố ý gây lỗi giữa INSERT ledger và UPDATE số dư, cả hai phải rollback. Hai giao dịch cùng người nối tiếp theo khóa dòng, không mất cập nhật. |

Bộ `verify_v1.sql` ghi PASS/FAIL cho các ca Bước 3. Mỗi ca có transaction và rollback, riêng ca trigger hoãn chạy `SET CONSTRAINTS ... IMMEDIATE` trước khi rollback. Dùng role runtime để kiểm quyền thực tế. Các quy tắc chuyển vào giao dịch backend được xác minh qua đường ghi của ứng dụng. Ca câu khác môn là yêu cầu bắt buộc của Bước 4. Ca đồng thời dùng hai kết nối localhost. Fixture thử tách seed và kiểm sạch sau rollback/dọn ca đồng thời. Đường chạy Bước 2 gồm DDL, seed từ manifest repo và rollback chạy lại được trên đúng tên DB local.

**Phạm vi thay đổi.** Danh mục là schema đích đã duyệt, gồm cả HP và Xu thưởng tính khi đọc. Nếu phát hiện nghiệp vụ chưa được schema biểu diễn, ghi bằng chứng vào báo cáo để duyệt trước khi đổi schema.
