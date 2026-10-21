/**
 * Seed Chapter 1 with 5 Checkpoints (1.1, 1.2, 1.3, 1.4, 1.5)
 * Each checkpoint contains 12 - 15 rich questions (TRAC_NGHIEM_4, NOI_CAP, DIEN_TU, SAP_XEP_CAU)
 * and 4 bite-sized flashcard theory sections.
 */

const db = require('../database/db');

const checkpoints = [
  {
    ma_moc: 'moc_csdl_01_01',
    ma_chuong: 'ch_csdl_01',
    tieu_de: 'Mốc 1.1: Khái niệm CSDL & Các Mức Trừu Tượng Dữ Liệu',
    loai_moc: 'LY_THUYET',
    thu_tu: 1,
    diem_thuong: 15,
    xu_thuong: 10,
    noi_dung_ly_thuyet: `### 1. Dữ liệu (Data) và Thông tin (Information)
- **Dữ liệu**: Là các sự kiện, số liệu thô chưa qua xử lý (ví dụ: điểm số 8.5, chuỗi ký tự "Nguyen Van A").
- **Thông tin**: Là dữ liệu đã được xử lý, tổ chức và đặt vào ngữ cảnh có ý nghĩa (ví dụ: "Sinh viên Nguyen Van A đạt điểm tổng kết 8.5 xếp loại Giỏi").

### 2. Định nghĩa Hệ Cơ sở Dữ liệu (DBMS)
Một **Hệ Quản trị Cơ sở Dữ liệu (Database Management System - DBMS)** là phần mềm hệ thống cho phép định nghĩa, tạo lập, lưu trữ, truy vấn và quản lý an toàn dữ liệu trên bộ nhớ phụ.

### 3. Kiến trúc 3 mức trừu tượng ANSI/SPARC
1. **Mức Ngoài (External Level / View Level)**: Khung nhìn dữ liệu cho từng nhóm người dùng hoặc ứng dụng cụ thể.
2. **Mức Quan niệm (Conceptual Level / Logical Level)**: Mô tả toàn bộ cấu trúc dữ liệu của tổ chức (các thực thể, quan hệ, kiểu dữ liệu, ràng buộc). Không phụ thuộc cách lưu trữ vật lý.
3. **Mức Trong / Vật lý (Internal / Physical Level)**: Mô tả chi tiết cách dữ liệu được ghi trên đĩa (cấu trúc file, B-Tree index, băm, phân đoạn đĩa).

### 4. Tính Độc lập Dữ liệu (Data Independence)
- **Độc lập Dữ liệu Logic**: Khả năng thay đổi lược đồ quan niệm mà không làm thay đổi các ứng dụng ở mức ngoài.
- **Độc lập Dữ liệu Vật lý**: Khả năng thay đổi cấu trúc lưu trữ hoặc thiết bị đĩa vật lý mà không cần sửa đổi lược đồ logic hay ứng dụng.`
  },
  {
    ma_moc: 'moc_csdl_01_02',
    ma_chuong: 'ch_csdl_01',
    tieu_de: 'Mốc 1.2: Hệ Quản Trị CSDL & Kiến Trúc Client-Server',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 2,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Thành phần Cốt lõi của DBMS
- **Bộ Xử lý Truy vấn (Query Processor)**: Tiếp nhận câu lệnh SQL, phân tích cú pháp (Parser), tối ưu hóa đường dẫn thực thi (Query Optimizer) và tạo kế hoạch thực thi.
- **Bộ Quản lý Lưu trữ (Storage Engine)**: Quản lý đọc/ghi các trang dữ liệu (Pages) giữa bộ nhớ đệm Buffer Pool trong RAM và đĩa cứng.

### 2. Ngôn ngữ DDL và DML
- **DDL (Data Definition Language)**: Ngôn ngữ định nghĩa cấu trúc dữ liệu gồm các lệnh: CREATE, ALTER, DROP, TRUNCATE.
- **DML (Data Manipulation Language)**: Ngôn ngữ thao tác với dữ liệu gồm các lệnh: SELECT, INSERT, UPDATE, DELETE.

### 3. Kiến trúc Client - Server trong CSDL
- **Kiến trúc 2 tầng (2-Tier)**: Ứng dụng Client kết nối trực tiếp đến Database Server (thường dùng trong mạng nội bộ hoặc hệ thống cũ).
- **Kiến trúc 3 tầng (3-Tier)**: Client giao tiếp với Application Server (Web API / Business Logic), sau đó App Server mới truy vấn CSDL. Giúp tăng tính bảo mật, dễ mở rộng và giảm tải máy chủ CSDL.

### 4. Vai trò của Quản trị viên CSDL (DBA)
- **DBA (Database Administrator)**: Chuyên gia chịu trách nhiệm thiết kế vật lý, giám sát hiệu năng, cấu hình sao lưu và phục hồi (Backup & Recovery), phân quyền tài khoản và phòng chống rò rỉ dữ liệu.`
  },
  {
    ma_moc: 'moc_csdl_01_03',
    ma_chuong: 'ch_csdl_01',
    tieu_de: 'Mốc 1.3: Các Mô Hình Dữ Liệu & Ràng Buộc Toàn Vẹn',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 3,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Tiến hóa của các Mô hình Dữ liệu
- **Mô hình Phân cấp (Hierarchical)**: Dữ liệu dạng cây (Tree), một nút con chỉ có duy nhất một nút cha.
- **Mô hình Mạng (Network)**: Dữ liệu dạng đồ thị (Graph), một bản ghi con có thể có nhiều bản ghi cha.
- **Mô hình Quan hệ (Relational)**: Đề xuất năm 1970 bởi E. F. Codd, dữ liệu tổ chức dưới dạng bảng (Tables) gồm các hàng (tuples) và cột (attributes).

### 2. Toàn vẹn Thực thể (Entity Integrity)
- Mọi bảng quan hệ phải có ít nhất một **Khóa chính (Primary Key)** để phân biệt duy nhất từng bản ghi.
- Quy tắc bắt buộc: Khóa chính không bao giờ được phép nhận giá trị NULL hoặc giá trị trùng lặp.

### 3. Toàn vẹn Tham chiếu (Referential Integrity)
- Được bảo đảm thông qua **Khóa ngoại (Foreign Key)** nối từ bảng con đến khóa chính bảng cha.
- Quy tắc: Giá trị khóa ngoại phải bằng một giá trị khóa chính đang tồn tại ở bảng cha, hoặc phải nhận giá trị NULL.

### 4. Toàn vẹn Miền giá trị (Domain Integrity)
- Mọi giá trị nhập vào một cột phải thuộc kiểu dữ liệu, định dạng và khoảng giá trị hợp lệ đã khai báo trước (ví dụ: Điểm số từ 0 đến 10, Tuổi lớn hơn 0).`
  },
  {
    ma_moc: 'moc_csdl_01_04',
    ma_chuong: 'ch_csdl_01',
    tieu_de: 'Mốc 1.4: Luyện Tập Củng Cố & Kết Nối Kiến Thức Chương 1',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 4,
    diem_thuong: 25,
    xu_thuong: 20,
    noi_dung_ly_thuyet: `### 1. Tập tin truyền thống vs CSDL Hiện đại
- **Hệ thống tập tin**: Dữ liệu lưu rời rạc theo file, dư thừa cao, dễ mâu thuẫn, không hỗ trợ kiểm soát đồng thời khi nhiều người cùng ghi.
- **DBMS hiện đại**: Quản lý tập trung, chia sẻ an toàn, bảo đảm tính toàn vẹn và hỗ trợ khôi phục khi có sự cố mất điện.

### 2. Các mức Trừu tượng và Cơ chế Ánh xạ (Mapping)
- **Ánh xạ Ngoài - Quan niệm**: Chuyển đổi giữa góc nhìn người dùng và cấu trúc logic, đảm bảo độc lập dữ liệu logic.
- **Ánh xạ Quan niệm - Vật lý**: Chuyển đổi giữa cấu trúc logic và cấu trúc lưu trữ đĩa, đảm bảo độc lập dữ liệu vật lý.

### 3. Quy tắc Xác định Khóa Quan hệ
- **Siêu khóa (Superkey)**: Tập một hoặc nhiều thuộc tính định danh duy nhất một bộ.
- **Khóa ứng viên (Candidate Key)**: Siêu khóa tối thiểu (không thể bỏ bớt bất kỳ thuộc tính nào mà vẫn định danh được bộ).
- **Khóa chính (Primary Key)**: Khóa ứng viên được người thiết kế chọn làm đại diện chính thức.

### 4. Khai báo Cú pháp DDL Tạo bảng Cơ bản
- Cú pháp chuẩn: \`CREATE TABLE SinhVien ( MaSV INT PRIMARY KEY, HoTen VARCHAR(100) NOT NULL, MaLop INT REFERENCES Lop(MaLop) );\``
  },
  {
    ma_moc: 'moc_csdl_01_05',
    ma_chuong: 'ch_csdl_01',
    tieu_de: 'Mốc 1.5: Thử Thách Vượt Ải Cột Mốc Chương 1',
    loai_moc: 'THU_THACH_BOSS',
    thu_tu: 5,
    diem_thuong: 35,
    xu_thuong: 30,
    noi_dung_ly_thuyet: `### 1. Trọng tâm Cột mốc Vượt ải Chương 1
Bạn chuẩn bị bước vào ải thử thách tổng hợp để mở khóa Chương 2 (Mô hình ERD & Thiết kế CSDL). Ải này bao gồm các câu hỏi từ kiến thức nền tảng đến bài tập thực tế.

### 2. Chiến thuật làm bài Nối cặp & Điền từ
- Đối với bài nối cặp: Ghép những cặp khái niệm bạn nắm chắc nhất trước để dọn sạch bảng nhanh chóng.
- Đối với bài điền từ: Đọc kỹ câu văn để chọn từ khóa kỹ thuật chính xác nhất.

### 3. Lưu ý về Sắp xếp Cú pháp và Ràng buộc
- Độc lập logic: Mức ngoài <-> Mức quan niệm.
- Độc lập vật lý: Mức quan niệm <-> Mức trong.
- Khóa chính không bao giờ được NULL; Khóa ngoại tham chiếu khóa chính bảng cha.

### 4. Đạt chuẩn để Vượt Cấp lên Chương 2
Đạt độ chính xác từ 60% trở lên để nhận cúp vinh danh, mở khóa Mốc 2.1 và đón nhận thêm nhiều phần thưởng EXP và Xu!`
  }
];

// 12 to 15 questions per checkpoint
const questionsList = [
  // ==========================================
  // CHECKPOINT 1.1 (12 QUESTIONS)
  // ==========================================
  {
    ma_cau_hoi: 'q_csdl_01_01_01',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Định nghĩa cơ bản về Dữ liệu (Data) trong khoa học máy tính là gì?',
    dap_an_a: 'Là các sự kiện, số liệu thô chưa qua phân tích hay xử lý.',
    dap_an_b: 'Là kết quả thống kê đã được trình bày dưới dạng biểu đồ.',
    dap_an_c: 'Là các tri thức đã được áp dụng vào hoạt động thực tiễn.',
    dap_an_d: 'Là các thuật toán xử lý luồng thông tin trên bộ nhớ RAM.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Dữ liệu (Data) là các sự kiện, số liệu thô chưa qua xử lý hay đặt vào ngữ cảnh cụ thể.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_02',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Định nghĩa về Thông tin (Information) có điểm khác biệt cốt lõi nào so với Dữ liệu?',
    dap_an_a: 'Dữ liệu đã được xử lý và đặt trong ngữ cảnh có ý nghĩa rõ ràng.',
    dap_an_b: 'Dữ liệu thô thu thập từ các thiết bị cảm biến mà chưa qua phân tích.',
    dap_an_c: 'Tập hợp các bit 0 và 1 lưu trữ dưới dạng tệp nhị phân trên đĩa.',
    dap_an_d: 'Các phần mềm ứng dụng được cài đặt trên hệ điều hành máy tính.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Thông tin là dữ liệu đã được xử lý, tổ chức và đặt vào ngữ cảnh có ý nghĩa thực tiễn.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_03',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Hệ Quản trị Cơ sở Dữ liệu (DBMS) được định nghĩa là loại phần mềm gì?',
    dap_an_a: 'Phần mềm ứng dụng dành riêng cho việc vẽ sơ đồ và thiết kế giao diện đồ họa.',
    dap_an_b: 'Phần mềm hệ thống cho phép định nghĩa, tạo lập, lưu trữ và quản trị dữ liệu.',
    dap_an_c: 'Phần mềm diệt virus kiểm soát an toàn kết nối mạng giữa các máy chủ từ xa.',
    dap_an_d: 'Hệ điều hành quản lý việc phân phối bộ nhớ và tiến trình của vi xử lý CPU.',
    vi_tri_dap_an_dung: 1,
    giai_thich: 'DBMS là phần mềm hệ thống cung cấp các phương tiện quản lý và truy cập CSDL an toàn.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_04',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Kiến trúc 3 mức trừu tượng ANSI/SPARC bao gồm những mức nào?',
    dap_an_a: 'Mức Ngoài (External), Mức Quan niệm (Conceptual), Mức Trong (Internal).',
    dap_an_b: 'Mức Phần cứng (Hardware), Mức Hệ điều hành (OS), Mức Ứng dụng (App).',
    dap_an_c: 'Mức Khách (Client), Mức Máy chủ (Server), Mức Đám mây (Cloud storage).',
    dap_an_d: 'Mức Bảng (Table), Mức Hàng (Row/Tuple), Mức Cột (Column/Attribute).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Kiến trúc ANSI/SPARC chia CSDL thành 3 mức: Ngoài (Views), Quan niệm (Logic), Trong (Physical).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_05',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Hệ Quản trị Cơ sở Dữ liệu cung cấp cơ chế kiểm soát truy cập đồng thời để bảo đảm tính {blank} của dữ liệu khi nhiều người cùng thao tác.',
      options: ['nhất quán', 'phức tạp', 'dư thừa', 'vật lý'],
      blank_answer: 'nhất quán'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Kiểm soát đồng thời bảo đảm tính nhất quán (Consistency) của dữ liệu.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_06',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Trong kiến trúc ANSI/SPARC, mức {blank} mô tả toàn bộ cấu trúc logic của cơ sở dữ liệu mà không phụ thuộc vào thiết bị lưu trữ.',
      options: ['quan niệm', 'ngoài', 'vật lý', 'phần cứng'],
      blank_answer: 'quan niệm'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Mức Quan niệm (Conceptual) mô tả toàn bộ cấu trúc logic độc lập với thiết bị lưu trữ.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_07',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Mức Ngoài (External)', right: 'Khung nhìn cho từng người dùng' },
        { left: 'Mức Quan niệm', right: 'Toàn bộ cấu trúc logic của CSDL' },
        { left: 'Mức Trong (Internal)', right: 'Cấu trúc lưu trữ vật lý trên đĩa' },
        { left: 'Độc lập logic', right: 'Đổi mức quan niệm không đổi mức ngoài' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 3 mức kiến trúc ANSI/SPARC và tính độc lập dữ liệu logic.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_08',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ theo đúng thứ tự để tạo thành định nghĩa chuẩn xác:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép định nghĩa về Độc lập Dữ liệu Vật lý:',
      correct_order: [
        'Độc lập dữ liệu vật lý',
        'là khả năng',
        'thay đổi cấu trúc lưu trữ đĩa',
        'mà không làm đổi',
        'lược đồ quan niệm'
      ],
      distractors: ['làm hỏng ứng dụng', 'xóa hết dữ liệu']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Độc lập dữ liệu vật lý là khả năng thay đổi cấu trúc lưu trữ đĩa mà không làm thay đổi lược đồ quan niệm.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_09',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ai là nhà khoa học máy tính đề xuất Mô hình Dữ liệu Quan hệ vào năm 1970 tại IBM?',
    dap_an_a: 'Edgar Frank Codd (E. F. Codd).',
    dap_an_b: 'Alan Mathison Turing.',
    dap_an_c: 'Donald Ervin Knuth.',
    dap_an_d: 'Tim Berners-Lee.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'E. F. Codd công bố bài báo lịch sử về mô hình quan hệ năm 1970 tại IBM.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_10',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Cơ sở dữ liệu được lưu trữ trên các thiết bị bộ nhớ {blank} để dữ liệu không bị mất đi khi mất nguồn điện.',
      options: ['phụ (thứ cấp)', 'RAM tạm thời', 'thanh ghi', 'cache CPU'],
      blank_answer: 'phụ (thứ cấp)'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'CSDL cần tính bền vững (Durability) nên bắt buộc lưu trên bộ nhớ phụ thứ cấp (SSD, HDD).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_11',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi một tổ chức thêm một cột mới vào bảng KhachHang ở mức quan niệm, các ứng dụng hiện tại ở mức ngoài không bị ảnh hưởng. Đây là minh chứng của:',
    dap_an_a: 'Tính độc lập dữ liệu logic (Logical Data Independence).',
    dap_an_b: 'Tính độc lập dữ liệu vật lý (Physical Data Independence).',
    dap_an_c: 'Tính kiểm soát truy cập đồng thời (Concurrency Control).',
    dap_an_d: 'Tính toàn vẹn tham chiếu khóa ngoại (Foreign Key Integrity).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Thay đổi lược đồ quan niệm mà không sửa ứng dụng mức ngoài là Độc lập dữ liệu logic.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_01_12',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép định nghĩa về Độc lập Dữ liệu Logic:',
      correct_order: [
        'Độc lập dữ liệu logic',
        'cho phép sửa đổi',
        'lược đồ quan niệm',
        'mà không cần viết lại',
        'các chương trình ứng dụng'
      ],
      distractors: ['gây mất an toàn', 'làm chậm CPU']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Độc lập dữ liệu logic cho phép sửa đổi lược đồ quan niệm mà không cần viết lại các chương trình ứng dụng.',
    do_kho: 2
  },

  // ==========================================
  // CHECKPOINT 1.2 (12 QUESTIONS)
  // ==========================================
  {
    ma_cau_hoi: 'q_csdl_01_02_01',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Bộ Tối ưu hóa Truy vấn (Query Optimizer) trong hệ quản trị CSDL có vai trò gì?',
    dap_an_a: 'Phân tích và lựa chọn kế hoạch thực thi câu lệnh SQL hiệu quả nhất.',
    dap_an_b: 'Format định dạng code SQL đẹp mắt cho lập trình viên dễ đọc.',
    dap_an_c: 'Tự động sao lưu dự phòng toàn bộ CSDL ra ổ cứng ngoài hàng ngày.',
    dap_an_d: 'Tạo giao diện người dùng đồ họa hiển thị các bảng dữ liệu trên web.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Query Optimizer ước lượng chi phí và chọn chiến lược thực thi truy vấn tối ưu nhất.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_02',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nhóm lệnh nào sau đây thuộc ngôn ngữ định nghĩa dữ liệu DDL (Data Definition Language)?',
    dap_an_a: 'CREATE, ALTER, DROP, TRUNCATE.',
    dap_an_b: 'SELECT, INSERT, UPDATE, DELETE.',
    dap_an_c: 'GRANT, REVOKE, DENY, COMMIT.',
    dap_an_d: 'BEGIN, ROLLBACK, SAVEPOINT, CHECKPOINT.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'DDL dùng để định nghĩa cấu trúc: CREATE, ALTER, DROP, TRUNCATE.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_03',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nhóm lệnh nào sau đây thuộc ngôn ngữ thao tác dữ liệu DML (Data Manipulation Language)?',
    dap_an_a: 'SELECT, INSERT, UPDATE, DELETE.',
    dap_an_b: 'CREATE, ALTER, DROP, TRUNCATE.',
    dap_an_c: 'GRANT, REVOKE, BACKUP, RESTORE.',
    dap_an_d: 'EXEC, DECLARE, SET, PRINT.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'DML thao tác trên các bản ghi dữ liệu: SELECT, INSERT, UPDATE, DELETE.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_04',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Kiến trúc CSDL {blank} tầng bao gồm Client giao diện, Application Server xử lý logic và Database Server lưu trữ.',
      options: ['3', '2', '1', '4'],
      blank_answer: '3'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Kiến trúc 3 tầng (3-tier) phân tách rõ Client, Application Server và Database Server.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_05',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Query Optimizer', right: 'Tối ưu kế hoạch thực thi truy vấn' },
        { left: 'Storage Engine', right: 'Quản lý đọc ghi khối đĩa và RAM' },
        { left: 'Transaction Manager', right: 'Bảo đảm giao dịch tuân thủ ACID' },
        { left: 'Quản trị viên DBA', right: 'Sao lưu và giám sát bảo mật hệ thống' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác vai trò của các module trong hệ quản trị CSDL.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_06',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Bộ đệm {blank} trong DBMS lưu trữ các trang dữ liệu thường dùng trong RAM để giảm thiểu thao tác đọc đĩa vật lý.',
      options: ['Buffer Pool', 'File Index', 'Log Writer', 'Socket Client'],
      blank_answer: 'Buffer Pool'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Buffer Pool lưu các pages dữ liệu trong RAM giúp tăng tốc độ đọc ghi.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_07',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép định nghĩa về Ngôn ngữ DDL:',
      correct_order: [
        'Ngôn ngữ DDL',
        'dùng để định nghĩa',
        'và thay đổi cấu trúc',
        'của các bảng',
        'trong cơ sở dữ liệu'
      ],
      distractors: ['sửa từng bản ghi', 'xóa tài khoản']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ngôn ngữ DDL dùng để định nghĩa và thay đổi cấu trúc của các bảng trong cơ sở dữ liệu.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_08',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nhiệm vụ nào sau đây KHÔNG thuộc trách nhiệm chính của Quản trị viên CSDL (DBA)?',
    dap_an_a: 'Lập trình thiết kế giao diện đồ họa người dùng (UI/UX) cho ứng dụng mobile.',
    dap_an_b: 'Cấu hình và thực hiện sao lưu dự phòng (Backup) và phục hồi (Recovery) dữ liệu.',
    dap_an_c: 'Phân quyền truy cập, bảo mật và phòng chống tấn công rò rỉ dữ liệu hệ thống.',
    dap_an_d: 'Giám sát tài nguyên phần cứng, phát hiện điểm nghẽn và tinh chỉnh chỉ mục (Index).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'DBA quản lý hệ thống dữ liệu, không phụ trách lập trình giao diện UI/UX người dùng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_09',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Lệnh {blank} trong SQL được dùng để làm rỗng toàn bộ dữ liệu trong bảng với tốc độ cao mà không xóa cấu trúc bảng.',
      options: ['TRUNCATE', 'DROP', 'UPDATE', 'MODIFY'],
      blank_answer: 'TRUNCATE'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'TRUNCATE xóa toàn bộ hàng nhanh chóng mà giữ nguyên cấu trúc bảng.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_10',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ưu thế nổi trội nhất của kiến trúc 3 tầng (3-Tier) so với kiến trúc 2 tầng (2-Tier) là gì?',
    dap_an_a: 'Bảo mật tốt hơn vì Client không trực tiếp kết nối và nắm quyền vào máy chủ CSDL.',
    dap_an_b: 'Không cần sử dụng mạng Internet để kết nối các máy tính với nhau.',
    dap_an_c: 'Hoàn toàn loại bỏ nhu cầu sử dụng máy chủ ứng dụng Web Server.',
    dap_an_d: 'Tự động sửa lỗi cú pháp SQL mà lập trình viên vô tình viết sai.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Kiến trúc 3 tầng ngăn Client chạm thẳng CSDL, tăng bảo mật và dễ mở rộng nghiệp vụ.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_11',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép nguyên lý kiến trúc 3 tầng:',
      correct_order: [
        'Kiến trúc ba tầng',
        'giúp tăng cường bảo mật',
        'và giảm tải',
        'cho máy chủ',
        'cơ sở dữ liệu'
      ],
      distractors: ['làm mất dữ liệu', 'bỏ qua mạng']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Kiến trúc ba tầng giúp tăng cường bảo mật và giảm tải cho máy chủ cơ sở dữ liệu.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_02_12',
    ma_moc: 'moc_csdl_01_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'CREATE TABLE', right: 'Lệnh DDL định nghĩa cấu trúc bảng' },
        { left: 'INSERT INTO', right: 'Lệnh DML thêm bản ghi mới' },
        { left: 'ALTER TABLE', right: 'Lệnh DDL sửa đổi cấu trúc cột' },
        { left: 'DROP TABLE', right: 'Lệnh DDL xóa hoàn toàn bảng' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác giữa cú pháp SQL và phân loại ngôn ngữ DDL / DML.',
    do_kho: 2
  },

  // ==========================================
  // CHECKPOINT 1.3 (12 QUESTIONS)
  // ==========================================
  {
    ma_cau_hoi: 'q_csdl_01_03_01',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Mô hình dữ liệu mạng (Network Model) tổ chức dữ liệu theo cấu trúc toán học nào?',
    dap_an_a: 'Cấu trúc đồ thị (Graph), một bản ghi con có thể có nhiều bản ghi cha.',
    dap_an_b: 'Cấu trúc cây (Tree), một bản ghi con chỉ có duy nhất một bản ghi cha.',
    dap_an_c: 'Cấu trúc bảng hai chiều phẳng hoàn toàn không có liên kết con trỏ.',
    dap_an_d: 'Cấu trúc ngăn xếp (Stack) tuân theo nguyên tắc vào sau ra trước.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Mô hình mạng biểu diễn dữ liệu dạng đồ thị Graph, cho phép quan hệ N-N linh hoạt.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_02',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ràng buộc toàn vẹn thực thể (Entity Integrity) trong CSDL quan hệ bắt buộc điều gì?',
    dap_an_a: 'Khóa chính của bảng phải có giá trị duy nhất và không được nhận giá trị NULL.',
    dap_an_b: 'Mỗi bảng phải có ít nhất mười cột dữ liệu và một trăm hàng bản ghi.',
    dap_an_c: 'Tất cả các cột trong bảng đều phải thuộc kiểu dữ liệu số nguyên INT.',
    dap_an_d: 'Khóa ngoại bắt buộc phải trùng tên với khóa chính của bảng tham chiếu.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Toàn vẹn thực thể yêu cầu khóa chính phải duy nhất và NOT NULL để định danh từng bộ.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_03',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Ràng buộc toàn vẹn {blank} bảo đảm giá trị khóa ngoại phải tham chiếu đến một khóa chính hợp lệ đang tồn tại hoặc nhận giá trị NULL.',
      options: ['tham chiếu', 'thực thể', 'miền giá trị', 'người dùng'],
      blank_answer: 'tham chiếu'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Toàn vẹn tham chiếu (Referential Integrity) được thực thi bởi khóa ngoại.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_04',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Ràng buộc toàn vẹn {blank} quy định mọi giá trị nhập vào một cột phải thuộc khoảng giá trị và kiểu dữ liệu hợp lệ.',
      options: ['miền giá trị', 'thực thể', 'tham chiếu', 'ngoại lai'],
      blank_answer: 'miền giá trị'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Toàn vẹn miền giá trị (Domain Integrity) kiểm soát phạm vi và định dạng cột.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_05',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Toàn vẹn thực thể', right: 'Khóa chính không được NULL' },
        { left: 'Toàn vẹn tham chiếu', right: 'Khóa ngoại trỏ đúng khóa chính' },
        { left: 'Toàn vẹn miền giá trị', right: 'Dữ liệu cột đúng kiểu và phạm vi' },
        { left: 'Khóa ứng viên', right: 'Siêu khóa tối thiểu định danh bộ' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 3 loại ràng buộc toàn vẹn và khái niệm khóa ứng viên.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_06',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép định nghĩa về Khóa ngoại:',
      correct_order: [
        'Khóa ngoại là thuộc tính',
        'dùng để liên kết',
        'và tham chiếu',
        'đến khóa chính',
        'của bảng quan hệ khác'
      ],
      distractors: ['xóa hết cột', 'chứa mật khẩu']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Khóa ngoại là thuộc tính dùng để liên kết và tham chiếu đến khóa chính của bảng quan hệ khác.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_07',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một bảng trong CSDL quan hệ có thể có bao nhiêu Khóa chính (Primary Key)?',
    dap_an_a: 'Chỉ có duy nhất 1 khóa chính (nhưng có thể gồm 1 hoặc nhiều cột kết hợp).',
    dap_an_b: 'Có thể có vô số khóa chính tùy ý người dùng mong muốn đặt tên.',
    dap_an_c: 'Mỗi cột trong bảng đều tự động trở thành một khóa chính độc lập.',
    dap_an_d: 'Tối đa 5 khóa chính cho mỗi bảng theo tiêu chuẩn quốc tế SQL.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Mỗi bảng chỉ có 1 Primary Key duy nhất (có thể là Composite Primary Key).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_08',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Khóa {blank} là siêu khóa tối thiểu có khả năng xác định duy nhất từng bộ dữ liệu trong quan hệ.',
      options: ['ứng viên', 'ngoại lai', 'nhị phân', 'mở rộng'],
      blank_answer: 'ứng viên'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Candidate Key là siêu khóa tối thiểu (minimal superkey).',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_09',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi xóa một bản ghi ở bảng cha mà bảng con đang liên kết qua khóa ngoại với tùy chọn ON DELETE CASCADE, điều gì sẽ xảy ra?',
    dap_an_a: 'Tất cả các bản ghi liên quan ở bảng con sẽ tự động bị xóa đồng thời.',
    dap_an_b: 'Hệ quản trị CSDL báo lỗi chặn lại và không cho phép xóa bản ghi cha.',
    dap_an_c: 'Khóa ngoại ở bảng con sẽ tự động được gán giá trị bằng 0.',
    dap_an_d: 'Toàn bộ bảng con bị xóa vĩnh viễn cấu trúc khỏi cơ sở dữ liệu.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'ON DELETE CASCADE tự động xóa các bản ghi phụ thuộc ở bảng con khi bản ghi cha bị xóa.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_10',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép ý nghĩa của Ràng buộc Toàn vẹn:',
      correct_order: [
        'Ràng buộc toàn vẹn',
        'giúp ngăn chặn dữ liệu rác',
        'và duy trì',
        'tính nhất quán',
        'của toàn bộ hệ thống'
      ],
      distractors: ['làm treo máy tính', 'tăng dung lượng file']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ràng buộc toàn vẹn giúp ngăn chặn dữ liệu rác và duy trì tính nhất quán của toàn bộ hệ thống.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_11',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'CASCADE', right: 'Xóa hoặc cập nhật lan truyền sang bảng con' },
        { left: 'SET NULL', right: 'Gán khóa ngoại thành rỗng khi cha bị xóa' },
        { left: 'RESTRICT / NO ACTION', right: 'Từ chối xóa bản ghi cha nếu có con trỏ tới' },
        { left: 'SET DEFAULT', right: 'Gán khóa ngoại về giá trị mặc định định sẵn' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 hành vi tham chiếu của Foreign Key khi dữ liệu cha thay đổi.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_03_12',
    ma_moc: 'moc_csdl_01_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nếu một bảng có 3 ứng viên khóa (Candidate Keys), người thiết kế chọn 1 làm Khóa chính (Primary Key). Hai khóa còn lại được gọi là:',
    dap_an_a: 'Khóa thay thế (Alternate Keys).',
    dap_an_b: 'Khóa ngoại lai (Foreign Keys).',
    dap_an_c: 'Siêu khóa vô dụng (Dead Keys).',
    dap_an_d: 'Khóa tham chiếu ảo (Virtual Keys).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Các khóa ứng viên không được chọn làm Primary Key được gọi là Alternate Keys.',
    do_kho: 2
  },

  // ==========================================
  // CHECKPOINT 1.4 (12 QUESTIONS)
  // ==========================================
  {
    ma_cau_hoi: 'q_csdl_01_04_01',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'So với hệ thống tập tin truyền thống, ưu điểm vượt trội nhất của Hệ quản trị CSDL là gì?',
    dap_an_a: 'Giảm thiểu dư thừa, kiểm soát đồng thời và khôi phục sự cố an toàn.',
    dap_an_b: 'Cho phép lưu trữ video và hình ảnh với dung lượng không giới hạn.',
    dap_an_c: 'Không cần sử dụng bộ nhớ RAM khi truy vấn dữ liệu.',
    dap_an_d: 'Tự động viết code backend thay thế hoàn toàn cho lập trình viên.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'DBMS giảm dư thừa dữ liệu, hỗ trợ giao dịch ACID và bảo vệ dữ liệu tập trung.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_02',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong mô hình quan hệ, thuật ngữ toán học "Bộ" (Tuple) tương ứng với khái niệm thực tế nào?',
    dap_an_a: 'Một hàng (Row / Record) trong bảng đại diện cho một cá thể.',
    dap_an_b: 'Một cột (Column) đại diện cho một thuộc tính của thực thể.',
    dap_an_c: 'Tên của toàn bộ bảng dữ liệu trong cơ sở dữ liệu.',
    dap_an_d: 'Tệp nhị phân chứa mã thực thi của máy chủ cơ sở dữ liệu.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Tuple tương ứng với một Hàng (Row / Record) trong bảng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_03',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Bảng dữ liệu hai chiều trong mô hình quan hệ theo thuật ngữ lý thuyết được gọi là một {blank}.',
      options: ['quan hệ', 'tập tin', 'chỉ mục', 'thủ tục'],
      blank_answer: 'quan hệ'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Table tương ứng với khái niệm Relation (Quan hệ).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_04',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Quan hệ (Relation)', right: 'Bảng hai chiều gồm hàng và cột' },
        { left: 'Bộ (Tuple)', right: 'Hàng dữ liệu biểu diễn cá thể' },
        { left: 'Thuộc tính (Attribute)', right: 'Cột mô tả đặc trưng của thực thể' },
        { left: 'Miền giá trị (Domain)', right: 'Tập hợp các giá trị hợp lệ của cột' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 thuật ngữ lý thuyết CSDL quan hệ với định nghĩa thực tế.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_05',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép cú pháp DDL tạo bảng SQL:',
      correct_order: [
        'Lệnh CREATE TABLE',
        'dùng để khai báo',
        'tên bảng các cột',
        'và chỉ định',
        'ràng buộc khóa chính'
      ],
      distractors: ['chèn bản ghi', 'tính trung bình']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Lệnh CREATE TABLE dùng để khai báo tên bảng các cột và chỉ định ràng buộc khóa chính.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_06',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Cú pháp SQL nào sau đây khai báo cột MaSV là khóa chính kiểu số nguyên hợp lệ nhất?',
    dap_an_a: 'MaSV INT PRIMARY KEY',
    dap_an_b: 'MaSV VARCHAR(20) FOREIGN KEY',
    dap_an_c: 'MaSV FLOAT DEFAULT 0',
    dap_an_d: 'MaSV TEXT CHECK (MaSV > 0)',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Cú pháp chuẩn: [TenCot] [KieuDuLieu] PRIMARY KEY.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_07',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Để bắt buộc người dùng không được để trống một cột dữ liệu, ta dùng ràng buộc {blank}.',
      options: ['NOT NULL', 'DEFAULT', 'CASCADE', 'INDEX'],
      blank_answer: 'NOT NULL'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ràng buộc NOT NULL ngăn chặn việc chèn giá trị rỗng NULL vào cột.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_08',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'PRIMARY KEY', right: 'Khóa chính duy nhất và không được NULL' },
        { left: 'FOREIGN KEY', right: 'Khóa ngoại liên kết tham chiếu bảng khác' },
        { left: 'UNIQUE', right: 'Bảo đảm giá trị cột không bị trùng lặp' },
        { left: 'CHECK', right: 'Kiểm tra biểu thức logic hợp lệ của cột' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 ràng buộc toàn vẹn phổ biến nhất trong SQL.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_09',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép ý nghĩa ràng buộc CHECK:',
      correct_order: [
        'Ràng buộc CHECK',
        'cho phép giới hạn',
        'miền giá trị của cột',
        'theo một biểu thức',
        'điều kiện logic'
      ],
      distractors: ['xóa hết bảng', 'chặn mạng']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ràng buộc CHECK cho phép giới hạn miền giá trị của cột theo một biểu thức điều kiện logic.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_10',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi thực hiện lệnh INSERT một giá trị đã tồn tại vào cột có ràng buộc UNIQUE, hệ thống sẽ:',
    dap_an_a: 'Từ chối giao dịch và báo lỗi vi phạm ràng buộc tính duy nhất.',
    dap_an_b: 'Tự động ghi đè lên bản ghi cũ mà không thông báo gì.',
    dap_an_c: 'Tự động cộng thêm số 1 vào cuối chuỗi để không bị trùng.',
    dap_an_d: 'Tự động chuyển giá trị đó về NULL và cho phép lưu trữ.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Ràng buộc UNIQUE bắt buộc mọi giá trị khác NULL phải duy nhất, nếu trùng sẽ ném lỗi.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_11',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Để tự động gán một giá trị định sẵn khi người dùng không truyền dữ liệu vào cột, ta sử dụng từ khóa {blank}.',
      options: ['DEFAULT', 'UNIQUE', 'PRIMARY', 'CASCADE'],
      blank_answer: 'DEFAULT'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'DEFAULT gán giá trị mặc định cho cột khi INSERT không truyền giá trị.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_04_12',
    ma_moc: 'moc_csdl_01_04',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Sự khác biệt quan trọng giữa PRIMARY KEY và UNIQUE trong SQL là gì?',
    dap_an_a: 'Bảng chỉ có 1 PRIMARY KEY và không được NULL; còn UNIQUE có thể đặt trên nhiều cột và cho phép NULL.',
    dap_an_b: 'PRIMARY KEY chỉ áp dụng cho số nguyên, còn UNIQUE chỉ áp dụng cho chuỗi ký tự.',
    dap_an_c: 'UNIQUE bắt buộc phải có Foreign Key tham chiếu tới, còn PRIMARY KEY thì không.',
    dap_an_d: 'Không có bất kỳ sự khác biệt nào giữa PRIMARY KEY và UNIQUE trong chuẩn SQL.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'PRIMARY KEY không được NULL và duy nhất 1 trên bảng; UNIQUE có thể nhiều cột và cho phép giá trị NULL.',
    do_kho: 2
  },

  // ==========================================
  // CHECKPOINT 1.5 (15 QUESTIONS - BOSS CHALLENGE)
  // ==========================================
  {
    ma_cau_hoi: 'q_csdl_01_05_01',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: '[THỬ THÁCH 1/15] Mức trừu tượng nào trong kiến trúc ANSI/SPARC tương tác trực tiếp nhất với người dùng cuối?',
    dap_an_a: 'Mức Ngoài (External Level / Views).',
    dap_an_b: 'Mức Quan niệm (Conceptual Level).',
    dap_an_c: 'Mức Trong / Vật lý (Internal Level).',
    dap_an_d: 'Mức Thiết bị lưu trữ đĩa từ (Storage Media).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Mức Ngoài cung cấp các khung nhìn cá nhân hóa cho từng nhóm người dùng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_02',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: '[THỬ THÁCH 2/15] Thuộc tính nào sau đây thích hợp nhất để chọn làm Khóa chính (Primary Key) cho bảng SinhVien?',
    dap_an_a: 'MaSinhVien (Mã số sinh viên duy nhất không trùng lặp).',
    dap_an_b: 'HoVaTen (Họ và tên đầy đủ của sinh viên).',
    dap_an_c: 'NgaySinh (Ngày tháng năm sinh của sinh viên).',
    dap_an_d: 'QueQuan (Tỉnh thành quê quán của sinh viên).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'MaSinhVien là duy nhất và không bao giờ rỗng, tối ưu nhất làm khóa chính.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_03',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: '[THỬ THÁCH 3/15] Chọn từ thích hợp để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Độc lập dữ liệu {blank} bảo đảm việc nâng cấp từ ổ đĩa HDD sang SSD không làm thay đổi lược đồ quan niệm của CSDL.',
      options: ['vật lý', 'logic', 'nghiệp vụ', 'ngoài'],
      blank_answer: 'vật lý'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Đổi ổ cứng/cấu trúc đĩa thuộc phạm vi Độc lập dữ liệu vật lý.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_04',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: '[THỬ THÁCH 4/15] Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Mô hình phân cấp', right: 'Cấu trúc cây quan hệ cha con 1-N' },
        { left: 'Mô hình mạng', right: 'Cấu trúc đồ thị quan hệ N-N' },
        { left: 'Mô hình quan hệ', right: 'Tổ chức dữ liệu dạng bảng 2 chiều' },
        { left: 'Mô hình hướng đối tượng', right: 'Đóng gói dữ liệu kèm phương thức' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 mô hình dữ liệu kinh điển.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_05',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: '[THỬ THÁCH 5/15] Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép nguyên lý toàn vẹn thực thể:',
      correct_order: [
        'Toàn vẹn thực thể',
        'yêu cầu khóa chính',
        'phải có giá trị duy nhất',
        'và không được phép',
        'chứa giá trị rỗng'
      ],
      distractors: ['chứa ký tự lạ', 'bị xóa bỏ']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Toàn vẹn thực thể yêu cầu khóa chính phải có giá trị duy nhất và không được phép chứa giá trị rỗng (NOT NULL).',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_06',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: '[THỬ THÁCH 6/15] Tại sao việc kiểm soát dư thừa dữ liệu (Data Redundancy) trong CSDL lại vô cùng quan trọng?',
    dap_an_a: 'Tránh lãng phí bộ nhớ và ngăn ngừa nguy cơ mâu thuẫn dữ liệu khi cập nhật.',
    dap_an_b: 'Để máy tính không bị quá nóng khi chạy các tác vụ đồ họa 3D.',
    dap_an_c: 'Vì chuẩn SQL quốc tế cấm tuyệt đối việc tạo bảng có trên mười cột.',
    dap_an_d: 'Giúp tự động gửi email thông báo cho quản trị viên mỗi khi có người đăng nhập.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Dư thừa dẫn đến mâu thuẫn (Inconsistency) khi một nơi sửa mà nơi khác quên sửa.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_07',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: '[THỬ THÁCH 7/15] Chọn từ thích hợp để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Một {blank} khóa là tập hợp các thuộc tính tối thiểu có thể xác định duy nhất một bộ dữ liệu.',
      options: ['ứng viên', 'ngoại lai', 'mở rộng', 'tự do'],
      blank_answer: 'ứng viên'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Khóa ứng viên là tập tối thiểu định danh duy nhất một bộ.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_08',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: '[THỬ THÁCH 8/15] Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'DDL', right: 'Định nghĩa cấu trúc (CREATE, ALTER, DROP)' },
        { left: 'DML', right: 'Thao tác dữ liệu (SELECT, INSERT, UPDATE)' },
        { left: 'DCL', right: 'Kiểm soát quyền truy cập (GRANT, REVOKE)' },
        { left: 'TCL', right: 'Quản lý giao dịch (COMMIT, ROLLBACK)' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 phân nhóm ngôn ngữ SQL chuẩn ISO/ANSI.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_09',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: '[THỬ THÁCH 9/15] Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép nguyên lý toàn vẹn tham chiếu:',
      correct_order: [
        'Toàn vẹn tham chiếu',
        'đảm bảo khóa ngoại',
        'phải trỏ tới',
        'khóa chính hợp lệ',
        'hoặc nhận giá trị NULL'
      ],
      distractors: ['bị lỗi cú pháp', 'xóa hết CSDL']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Toàn vẹn tham chiếu đảm bảo khóa ngoại phải trỏ tới khóa chính hợp lệ hoặc nhận giá trị NULL.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_10',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: '[THỬ THÁCH 10/15] Một giao dịch (Transaction) trong CSDL muốn bảo đảm tính toàn vẹn phải tuân thủ 4 tính chất nào?',
    dap_an_a: 'ACID (Atomicity, Consistency, Isolation, Durability).',
    dap_an_b: 'BASE (Basic Availability, Soft state, Eventual consistency).',
    dap_an_c: 'CRUD (Create, Read, Update, Delete).',
    dap_an_d: 'SOLID (Single responsibility, Open-closed, Liskov, Interface, Dependency).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'ACID là 4 tính chất cốt lõi của giao dịch trong DBMS quan hệ.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_11',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: '[THỬ THÁCH 11/15] Chọn từ thích hợp để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Tính chất {blank} trong ACID đảm bảo rằng một giao dịch hoặc phải thành công trọn vẹn, hoặc phải hoàn tác toàn bộ như chưa từng xảy ra.',
      options: ['nguyên tử (Atomicity)', 'cô lập (Isolation)', 'bền vững (Durability)', 'nhất quán (Consistency)'],
      blank_answer: 'nguyên tử (Atomicity)'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Atomicity (Tính nguyên tử): Tất cả hoặc không có gì (All or Nothing).',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_12',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: '[THỬ THÁCH 12/15] Cho câu lệnh: ALTER TABLE SinhVien ADD CONSTRAINT chk_Diem CHECK (DiemTB >= 0 AND DiemTB <= 10); Câu lệnh này thể hiện loại toàn vẹn nào?',
    dap_an_a: 'Toàn vẹn miền giá trị (Domain Integrity).',
    dap_an_b: 'Toàn vẹn thực thể (Entity Integrity).',
    dap_an_c: 'Toàn vẹn tham chiếu (Referential Integrity).',
    dap_an_d: 'Toàn vẹn vật lý đĩa (Physical Integrity).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Giới hạn khoảng giá trị điểm từ 0 đến 10 là Toàn vẹn miền giá trị.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_13',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: '[THỬ THÁCH 13/15] Chạm các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép nguyên lý tính bền vững Durability:',
      correct_order: [
        'Tính bền vững đảm bảo',
        'khi giao dịch hoàn tất',
        'dữ liệu sẽ được ghi',
        'vào bộ nhớ phụ',
        'ngay cả khi mất điện'
      ],
      distractors: ['bị mất sạch', 'không lưu trữ']
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Tính bền vững (Durability) bảo đảm dữ liệu tồn tại ngay cả khi hệ thống gặp sự cố mất điện.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_14',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: '[THỬ THÁCH 14/15] Chạm chọn 1 mục bên Trái và 1 mục tương ứng bên Phải để ghép cặp:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Atomicity (Nguyên tử)', right: 'Hoặc thành công hết hoặc hoàn tác hết' },
        { left: 'Consistency (Nhất quán)', right: 'Chuyển CSDL từ trạng thái hợp lệ này sang hợp lệ khác' },
        { left: 'Isolation (Cô lập)', right: 'Các giao dịch đồng thời không can thiệp nhau' },
        { left: 'Durability (Bền vững)', right: 'Dữ liệu được ghi vĩnh viễn không mất khi cúp điện' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 tính chất ACID kinh điển của hệ quản trị CSDL.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_05_15',
    ma_moc: 'moc_csdl_01_05',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: '[THỬ THÁCH 15/15] Chúc mừng bạn đã tới câu cuối cùng của Chương 1! Sau khi vượt qua ải này, bạn sẽ mở khóa:',
    dap_an_a: 'Chương 2: Mô hình Dữ liệu Quan hệ & Thiết kế ERD (Mốc 2.1).',
    dap_an_b: 'Khóa toàn bộ tài khoản và yêu cầu đăng ký lại từ đầu.',
    dap_an_c: 'Kết thúc hoàn toàn khóa học mà không còn nội dung nào khác.',
    dap_an_d: 'Tự động trừ 50 xu trong Ví Tri Thức của người dùng.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Vượt qua Mốc 1.5 sẽ chính thức mở khóa Chương 2 (Mốc 2.1) trên Bản đồ Leo Tháp!',
    do_kho: 1
  }
];

async function runSeed() {
  console.log('[SEED_CH1] Bắt đầu seed 5 mốc học và câu hỏi chuẩn cho Chương 1...');

  for (const c of checkpoints) {
    const existing = await db.queryOne('SELECT ma_moc FROM moc_bai_hoc WHERE ma_moc = $1', [c.ma_moc]);
    if (existing) {
      await db.execute(`
        UPDATE moc_bai_hoc
        SET tieu_de = $1,
            loai_moc = $2,
            noi_dung_ly_thuyet = $3,
            diem_thuong = $4,
            xu_thuong = $5,
            thu_tu = $6
        WHERE ma_moc = $7
      `, [c.tieu_de, c.loai_moc, c.noi_dung_ly_thuyet, c.diem_thuong, c.xu_thuong, c.thu_tu, c.ma_moc]);
      console.log(`[SEED_CH1] Đã cập nhật mốc: ${c.ma_moc} (${c.tieu_de})`);
    } else {
      await db.execute(`
        INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [c.ma_moc, c.ma_chuong, c.tieu_de, c.loai_moc, c.noi_dung_ly_thuyet, c.diem_thuong, c.xu_thuong, c.thu_tu]);
      console.log(`[SEED_CH1] Đã thêm mới mốc: ${c.ma_moc} (${c.tieu_de})`);
    }
  }

  // Delete old questions of these 5 checkpoints to avoid duplicates
  for (const c of checkpoints) {
    await db.execute('DELETE FROM cau_hoi WHERE ma_moc = $1', [c.ma_moc]);
  }

  let count = 0;
  for (const q of questionsList) {
    await db.execute(`
      INSERT INTO cau_hoi (
        ma_cau_hoi, ma_moc, noi_dung, dap_an_a, dap_an_b, dap_an_c, dap_an_d,
        vi_tri_dap_an_dung, giai_thich, do_kho, loai_cau_hoi, du_lieu_cau_hoi,
        muc_bloom, buoc_luyen_tap
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
    `, [
      q.ma_cau_hoi,
      q.ma_moc,
      q.noi_dung,
      q.dap_an_a || null,
      q.dap_an_b || null,
      q.dap_an_c || null,
      q.dap_an_d || null,
      q.vi_tri_dap_an_dung !== undefined ? q.vi_tri_dap_an_dung : null,
      q.giai_thich,
      q.do_kho || 1,
      q.loai_cau_hoi,
      q.du_lieu_cau_hoi || null,
      q.muc_bloom,
      q.buoc_luyen_tap
    ]);
    count++;
  }

  console.log(`[SEED_CH1] Đã seed thành công ${count} câu hỏi cho 5 mốc học Chương 1!`);
}

if (require.main === module) {
  runSeed()
    .then(() => {
      console.log('[SEED_CH1] Hoàn tất 100%!');
      process.exit(0);
    })
    .catch(err => {
      console.error('[SEED_CH1] Lỗi:', err);
      process.exit(1);
    });
}

module.exports = { runSeed, checkpoints, questionsList };
