/**
 * Seed Rich Question Bank with Duolingo Stepping & Bloom Taxonomy
 * Populates 4 steps for each milestone:
 * Step 1: 100% NHO (Remember)
 * Step 2: 80% NHO - 20% HIEU (Understand)
 * Step 3: 50% NHO - 40% HIEU - 10% VAN DUNG (Apply)
 * Step 4: 10% NHO - 60% HIEU - 30% VAN DUNG (Apply/Analyze)
 * Supported Question Types: TRAC_NGHIEM_4, NOI_CAP, DIEN_TU, SAP_XEP_CAU
 */

const db = require('../database/db');

const questions = [
  // =========================================================================
  // MỐC 1.1: Khái niệm CSDL & Các Mức Trừu Tượng Dữ Liệu
  // =========================================================================

  // --- BƯỚC 1: 100% NHỚ ---
  {
    ma_cau_hoi: 'q_csdl_01_s1_01',
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
    ma_cau_hoi: 'q_csdl_01_s1_02',
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
    ma_cau_hoi: 'q_csdl_01_s1_03',
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
    giai_thich: 'DBMS là phần mềm hệ thống cung cấp các dịch vụ định nghĩa, lưu trữ, truy vấn và bảo mật CSDL.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_04',
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
    giai_thich: 'Kiến trúc ANSI/SPARC gồm 3 mức: Mức Ngoài (Khung nhìn), Mức Quan niệm (Logic) và Mức Trong (Vật lý).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_05',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Hệ Quản trị Cơ sở Dữ liệu cung cấp cơ chế kiểm soát truy cập đồng thời để bảo đảm tính {blank} của dữ liệu khi nhiều người cùng thao tác.',
      blank_answer: 'nhất quán',
      options: ['nhất quán', 'phức tạp', 'vật lý', 'dư thừa']
    }),
    giai_thich: 'Kiểm soát đồng thời bảo đảm tính nhất quán (Consistency) của dữ liệu.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_06',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Trong kiến trúc ANSI/SPARC, mức {blank} mô tả toàn bộ cấu trúc logic của cơ sở dữ liệu mà không phụ thuộc vào thiết bị lưu trữ.',
      blank_answer: 'quan niệm',
      options: ['quan niệm', 'vật lý', 'ngoài', 'phần cứng']
    }),
    giai_thich: 'Mức quan niệm (Conceptual level) đặc tả toàn bộ thực thể, thuộc tính và mối quan hệ logic của tổ chức.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_07',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Hãy nối các khái niệm trong kiến trúc CSDL với đặc trưng cốt lõi:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Mức Ngoài (External)', right: 'Góc nhìn dữ liệu riêng cho từng nhóm ứng dụng' },
        { left: 'Mức Quan niệm (Conceptual)', right: 'Mô tả cấu trúc logic toàn diện của tổ chức' },
        { left: 'Mức Trong (Internal)', right: 'Đặc tả cấu trúc lưu trữ và phân vùng trên đĩa' },
        { left: 'Độc lập Dữ liệu Logic', right: 'Đổi lược đồ quan niệm mà không sửa ứng dụng' }
      ]
    }),
    giai_thich: 'Mỗi mức trong ANSI/SPARC đảm bảo tính trừu tượng và độc lập dữ liệu đa tầng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_08',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ theo đúng thứ tự để tạo thành định nghĩa chuẩn xác:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép định nghĩa về Độc lập Dữ liệu Vật lý:',
      correct_order: ['Độc lập dữ liệu vật lý', 'là khả năng', 'thay đổi cấu trúc lưu trữ đĩa', 'mà không làm đổi', 'lược đồ quan niệm'],
      distractors: ['làm hỏng ứng dụng', 'xóa hết dữ liệu']
    }),
    giai_thich: 'Độc lập dữ liệu vật lý cho phép thay đổi phần cứng, chỉ mục, khối đĩa mà không ảnh hưởng lược đồ logic.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_09',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ai là nhà khoa học máy tính đề xuất Mô hình Dữ liệu Quan hệ vào năm 1970 tại IBM?',
    dap_an_a: 'Edgar Frank Codd (E. F. Codd).',
    dap_an_b: 'Alan Mathison Turing.',
    dap_an_c: 'Donald Ervin Knuth.',
    dap_an_d: 'Tim Berners-Lee.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'E. F. Codd đề xuất mô hình quan hệ dựa trên lý thuyết tập hợp toán học vào năm 1970.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_01_s1_10',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Cơ sở dữ liệu được lưu trữ trên các thiết bị bộ nhớ {blank} để dữ liệu không bị mất đi khi mất nguồn điện.',
      blank_answer: 'phụ (thứ cấp)',
      options: ['phụ (thứ cấp)', 'RAM tạm thời', 'cache CPU', 'thanh ghi']
    }),
    giai_thich: 'Bộ nhớ phụ (Secondary storage như HDD, SSD) có tính bền vững (Non-volatile).',
    do_kho: 1
  },

  // --- BƯỚC 2: 80% NHỚ - 20% HIỂU ---
  {
    ma_cau_hoi: 'q_csdl_01_s2_01',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tại sao mô hình hệ thống tập tin (File System) lại dễ dẫn đến tình trạng không nhất quán dữ liệu (Data Inconsistency)?',
    dap_an_a: 'Do dữ liệu bị trùng lặp ở nhiều tệp khác nhau nhưng không được đồng bộ khi cập nhật.',
    dap_an_b: 'Do dung lượng tập tin luôn bị giới hạn dưới mức dung lượng khả dụng của ổ đĩa cứng.',
    dap_an_c: 'Do hệ điều hành từ chối cho phép nhiều chương trình cùng thực thi tại một thời điểm.',
    dap_an_d: 'Do tốc độ xung nhịp của bộ vi xử lý máy tính không đáp ứng kịp các truy vấn phức tạp.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Trùng lặp dữ liệu (Redundancy) dẫn đến việc khi sửa ở tệp này nhưng quên sửa ở tệp khác gây mất nhất quán.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_02',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Phát biểu nào sau đây phân biệt ĐÚNG NHẤT giữa Mức Quan niệm và Mức Khung nhìn (Mức ngoài)?',
    dap_an_a: 'Mức Quan niệm là toàn cảnh dữ liệu duy nhất; Mức Khung nhìn là các góc nhìn cục bộ.',
    dap_an_b: 'Mức Quan niệm do người dùng cuối điều chỉnh; Mức Khung nhìn do quản trị viên cấu hình.',
    dap_an_c: 'Mức Quan niệm lưu dữ liệu dưới dạng nhị phân; Mức Khung nhìn lưu dưới dạng chuỗi ký tự.',
    dap_an_d: 'Mức Quan niệm phụ thuộc vào thiết bị đĩa; Mức Khung nhìn độc lập hoàn toàn với máy tính.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Mỗi hệ thống chỉ có một mức quan niệm mô tả toàn bộ tổ chức, nhưng có thể có vô số khung nhìn mức ngoài.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_03',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Khi người quản trị thêm một cột mới vào bảng mà không làm ảnh hưởng ứng dụng hiện có, điều đó thể hiện tính độc lập dữ liệu {blank}.',
      blank_answer: 'logic',
      options: ['logic', 'vật lý', 'phần cứng', 'mạng']
    }),
    giai_thich: 'Thêm cột vào bảng là sửa đổi ở mức quan niệm, không ảnh hưởng mức ngoài là độc lập logic.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_04',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối vai trò của các đối tượng sử dụng hệ thống CSDL:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Quản trị viên CSDL (DBA)', right: 'Cấp quyền, sao lưu, phục hồi và tối ưu hiệu năng' },
        { left: 'Nhà thiết kế CSDL (Designer)', right: 'Xác định cấu trúc dữ liệu, ràng buộc và mô hình ERD' },
        { left: 'Lập trình viên ứng dụng', right: 'Viết mã truy xuất dữ liệu qua câu lệnh SQL và API' },
        { left: 'Người dùng cuối (End-user)', right: 'Thao tác với dữ liệu qua giao diện ứng dụng hoàn chỉnh' }
      ]
    }),
    giai_thich: 'Mỗi nhóm đối tượng có trách nhiệm và mức quyền hạn khác nhau trong vòng đời CSDL.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_05',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Giải thích vì sao DBMS giúp giảm dư thừa dữ liệu:',
      correct_order: ['DBMS tập trung dữ liệu', 'vào một nơi duy nhất', 'tránh trùng lặp thông tin', 'giữa các phòng ban'],
      distractors: ['phân mảnh tệp tin', 'xóa hết tài liệu']
    }),
    giai_thich: 'Tập trung hóa dữ liệu trong DBMS là giải pháp căn bản để loại bỏ dư thừa không cần thiết.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_06',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Lợi ích cốt lõi của tính năng Kiểm soát Đồng thời (Concurrency Control) trong DBMS là gì?',
    dap_an_a: 'Cho phép nhiều giao dịch truy cập cùng lúc mà vẫn đảm bảo tính chính xác của dữ liệu.',
    dap_an_b: 'Ngăn chặn hoàn toàn việc người dùng truy cập vào cơ sở dữ liệu trong giờ cao điểm.',
    dap_an_c: 'Tự động xóa các bản ghi cũ khi dung lượng bộ nhớ đệm đạt đến ngưỡng tám mươi phần trăm.',
    dap_an_d: 'Tăng tốc độ đọc ghi dữ liệu trên đĩa bằng cách bỏ qua các ràng buộc khóa ngoại đã tạo.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Kiểm soát đồng thời cho phép đa truy cập an toàn mà không gây xung đột hay hỏng dữ liệu.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_07',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Từ điển dữ liệu (Data Dictionary hay System Catalog) chứa {blank}, tức là dữ liệu mô tả về chính cấu trúc của dữ liệu.',
      blank_answer: 'siêu dữ liệu (metadata)',
      options: ['siêu dữ liệu (metadata)', 'tệp nhị phân rỗng', 'mã độc gián điệp', 'bản ghi tạm thời']
    }),
    giai_thich: 'Metadata là dữ liệu mô tả cấu trúc, kiểu dữ liệu, quan hệ và ràng buộc của CSDL.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s2_08',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi quản trị viên cơ sở dữ liệu thay đổi kiểu chỉ mục từ Hash Index sang B-Tree Index, loại độc lập dữ liệu nào được thể hiện?',
    dap_an_a: 'Độc lập dữ liệu vật lý (Physical Data Independence).',
    dap_an_b: 'Độc lập dữ liệu logic (Logical Data Independence).',
    dap_an_c: 'Độc lập giao diện người dùng (UI Independence).',
    dap_an_d: 'Độc lập giao thức truyền thông mạng (Network Independence).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Chỉ mục (Index) thuộc mức trong (vật lý), đổi chỉ mục không làm đổi bảng logic là độc lập vật lý.',
    do_kho: 2
  },

  // --- BƯỚC 3: 50% NHỚ - 40% HIỂU - 10% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_01_s3_01',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các thành phần kiến trúc DBMS với nhiệm vụ chuyên trách tương ứng:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Bộ tối ưu truy vấn (Query Optimizer)', right: 'Lựa chọn kế hoạch thực thi hiệu quả với chi phí tối ưu' },
        { left: 'Bộ quản lý bộ đệm (Buffer Manager)', right: 'Điều phối việc chuyển nạp trang dữ liệu giữa RAM và đĩa' },
        { left: 'Bộ quản lý giao dịch (Transaction Manager)', right: 'Bảo đảm tính nguyên tử và cô lập khi thao tác đồng thời' },
        { left: 'Bộ quản lý phục hồi (Recovery Manager)', right: 'Khôi phục CSDL về trạng thái nhất quán sau sự cố' }
      ]
    }),
    giai_thich: 'Kiến trúc hạt nhân DBMS phân chia rõ ràng trách nhiệm để đạt hiệu năng và độ tin cậy tối đa.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s3_02',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong ngân hàng, thao tác chuyển khoản gồm trừ tiền tài khoản A và cộng tiền tài khoản B. Tính chất ACID nào bảo đảm cả hai phải cùng thành công hoặc cùng bị hủy bỏ?',
    dap_an_a: 'Tính Nguyên tử (Atomicity).',
    dap_an_b: 'Tính Nhất quán (Consistency).',
    dap_an_c: 'Tính Cô lập (Isolation).',
    dap_an_d: 'Tính Bền vững (Durability).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Tính nguyên tử (Atomicity - All or Nothing) bảo đảm giao dịch không bao giờ thực hiện dang dở.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s3_03',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Cơ chế ghi nhật ký trước {blank} bảo đảm mọi thay đổi phải được ghi xuống đĩa nhật ký trước khi cập nhật vào tệp CSDL chính.',
      blank_answer: 'WAL (Write-Ahead Logging)',
      options: ['WAL (Write-Ahead Logging)', 'RAM Cache Buffer', 'DNS Round Robin', 'RAID Mirroring']
    }),
    giai_thich: 'Giao thức WAL là nền tảng cốt lõi giúp DBMS phục hồi dữ liệu an toàn sau khi sập nguồn.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s3_04',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ theo đúng thứ tự từ mức người dùng xuống mức thiết bị vật lý:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp chiều trừu tượng dữ liệu từ trên xuống dưới:',
      correct_order: ['Mức Ngoài (Khung nhìn)', '-> Mức Quan niệm (Logic)', '-> Mức Trong (Vật lý)', '-> Thiết bị đĩa lưu trữ'],
      distractors: ['-> Mạng Internet', '-> Cổng USB']
    }),
    giai_thich: 'Mức ngoài gần người dùng nhất, mức trong tiếp xúc trực tiếp với khối lưu trữ đĩa.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s3_05',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một lập trình viên tạo thêm View (Khung nhìn) chỉ cho nhân viên kế toán xem cột Luong mà không xem được thông tin khác. Thao tác này can thiệp vào mức nào?',
    dap_an_a: 'Mức Ngoài (External Level).',
    dap_an_b: 'Mức Trong (Internal Level).',
    dap_an_c: 'Mức Vật lý (Physical Level).',
    dap_an_d: 'Mức Phần cứng (Hardware Level).',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Tạo View giới hạn cho nhóm người dùng chuyên biệt là xây dựng lược đồ mức ngoài.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_csdl_01_s3_06',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tình huống nào sau đây thể hiện rõ hiện tượng Đọc bẩn (Dirty Read) vi phạm tính cô lập dữ liệu?',
    dap_an_a: 'Giao dịch B đọc được dữ liệu tạm thời chưa được commit của giao dịch A.',
    dap_an_b: 'Giao dịch A ghi dữ liệu thành công và đã nhận được thông báo commit.',
    dap_an_c: 'Giao dịch B thực hiện đọc dữ liệu hai lần liên tiếp và đều ra cùng kết quả.',
    dap_an_d: 'Hai giao dịch cùng đọc một bảng dữ liệu nhưng không có giao dịch nào sửa.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Đọc bẩn xảy ra khi giao dịch đọc phải dữ liệu mà giao dịch khác chưa chắc chắn commit (có thể bị rollback).',
    do_kho: 2
  },

  // --- BƯỚC 4: 10% NHỚ - 60% HIỂU - 30% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_01_s4_01',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các từ để tạo thành câu kết luận phân tích về Độc lập Dữ liệu Logic:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép câu phân tích bản chất Độc lập Dữ liệu Logic:',
      correct_order: ['Lược đồ mức quan niệm', 'có thể mở rộng thêm cột', 'mà người dùng mức ngoài', 'hoàn toàn không bị ảnh hưởng'],
      distractors: ['phải xóa sạch bảng', 'dừng hoạt động máy chủ']
    }),
    giai_thich: 'Độc lập logic cách ly ứng dụng khỏi sự thay đổi cấu trúc của toàn bộ hệ thống.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_csdl_01_s4_02',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Doanh nghiệp thay thế toàn bộ ổ cứng HDD bằng SSD và thay đổi cấu trúc bảng phân đoạn khối đĩa. Nhận định nào sau đây là CHÍNH XÁC NHẤT?',
    dap_an_a: 'Chỉ có Mức Trong thay đổi; Mức Quan niệm và các chương trình ứng dụng mức ngoài giữ nguyên.',
    dap_an_b: 'Bắt buộc phải viết lại toàn bộ mã nguồn các ứng dụng web và di động kết nối vào cơ sở dữ liệu.',
    dap_an_c: 'Tất cả các bảng dữ liệu, khóa chính và khóa ngoại phải được định nghĩa lại từ đầu bằng DDL.',
    dap_an_d: 'Cơ sở dữ liệu sẽ mất toàn bộ tính độc lập dữ liệu và buộc phải hạ cấp về hệ thống tệp truyền thống.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Thay đổi phần cứng và cách lưu trữ vật lý được cô lập hoàn toàn tại mức trong nhờ tính độc lập vật lý.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_csdl_01_s4_03',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các hiện tượng bất thường khi không kiểm soát đồng thời với định nghĩa:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Đọc bẩn (Dirty Read)', right: 'Đọc dữ liệu chưa commit của giao dịch khác' },
        { left: 'Mất cập nhật (Lost Update)', right: 'Hai giao dịch cùng ghi đè làm mất thao tác' },
        { left: 'Không lặp lại được', right: 'Đọc cùng dòng 2 lần cho 2 giá trị khác nhau' },
        { left: 'Bóng ma (Phantom Read)', right: 'Truy vấn lại xuất hiện thêm các dòng mới chèn' }
      ]
    }),
    giai_thich: 'Các mức cô lập (Read Committed, Repeatable Read, Serializable) được thiết kế để khắc phục lần lượt các hiện tượng này.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_csdl_01_s4_04',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Để ngăn ngừa dị thường Đọc bẩn, chuẩn SQL quy định mức cô lập tối thiểu cần áp dụng là {blank}.',
      blank_answer: 'READ COMMITTED',
      options: ['READ COMMITTED', 'READ UNCOMMITTED', 'NO LOCK', 'DIRTY WRITE']
    }),
    giai_thich: 'Mức READ COMMITTED chỉ cho phép đọc dữ liệu đã được commit chính thức.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_01_s4_05',
    ma_moc: 'moc_csdl_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Máy chủ sập nguồn khi lệnh COMMIT vừa gửi thành công nhưng dữ liệu chưa kịp ghi xuống đĩa. DBMS làm gì khi khởi động lại?',
    dap_an_a: 'Sử dụng nhật ký REDO để ghi lại các thay đổi của giao dịch đã commit lên đĩa dữ liệu.',
    dap_an_b: 'Tự động hủy bỏ giao dịch và trả lại thông báo lỗi yêu cầu khách hàng thực hiện lại từ đầu.',
    dap_an_c: 'Xóa toàn bộ tệp cơ sở dữ liệu vì cấu trúc bảng đã bị tổn hại nghiêm trọng không thể phục hồi.',
    dap_an_d: 'Bỏ qua lỗi và để mặc cho số dư tài khoản của khách hàng không khớp với số tiền thực tế đã rút.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Giao dịch đã commit thì tính bền vững (Durability) yêu cầu dùng bản ghi REDO trong nhật ký WAL để hoàn tất cập nhật.',
    do_kho: 3
  },

  // =========================================================================
  // MỐC 2.1: Mô hình Quan hệ & Mô hình Thực thể - Quan hệ (ERD)
  // =========================================================================
  // --- BƯỚC 1: 100% NHỚ ---
  {
    ma_cau_hoi: 'q_csdl_02_s1_01',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong mô hình dữ liệu quan hệ, một Quan hệ (Relation) tương ứng với khái niệm nào trong thực tế triển khai bảng?',
    dap_an_a: 'Một bảng dữ liệu 2 chiều gồm các dòng và cột có cấu trúc xác định.',
    dap_an_b: 'Một con trỏ chỉ mục trỏ đến một vị trí byte trên thiết bị đĩa cứng.',
    dap_an_c: 'Một câu lệnh truy vấn viết bằng ngôn ngữ lập trình Java hoặc C#.',
    dap_an_d: 'Một thư mục chứa các tệp văn bản phi cấu trúc trên hệ điều hành.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Quan hệ trong mô hình quan hệ là một bảng 2 chiều gồm các hàng (bộ) và cột (thuộc tính).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_02_s1_02',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khái niệm "Bộ" (Tuple) trong mô hình dữ liệu quan hệ tương đương với thành phần nào trong bảng?',
    dap_an_a: 'Một hàng (dòng dữ liệu) đại diện cho một cá thể đối tượng cụ thể.',
    dap_an_b: 'Một cột (thuộc tính) mô tả đặc tính của tập hợp các đối tượng.',
    dap_an_c: 'Tiêu đề của toàn bộ bảng được định nghĩa trong câu lệnh tạo bảng.',
    dap_an_d: 'Tệp nhật ký ghi lại các thao tác thay đổi dữ liệu của giao dịch.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Bộ (Tuple) là một dòng dữ liệu chứa các giá trị thuộc tính của một đối tượng đơn lẻ.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_02_s1_03',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Tập hợp tất cả các giá trị hợp lệ mà một thuộc tính có thể nhận được gọi là {blank} của thuộc tính.',
      blank_answer: 'miền giá trị (Domain)',
      options: ['miền giá trị (Domain)', 'khóa chính (Primary Key)', 'bộ (Tuple)', 'quan hệ (Relation)']
    }),
    giai_thich: 'Miền giá trị (Domain) quy định kiểu dữ liệu và giới hạn giá trị của một thuộc tính.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_02_s1_04',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Hãy nối các thuật ngữ trong mô hình quan hệ với thuật ngữ bảng CSDL tương đương:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Quan hệ (Relation)', right: 'Bảng (Table)' },
        { left: 'Bộ (Tuple)', right: 'Hàng (Row / Record)' },
        { left: 'Thuộc tính (Attribute)', right: 'Cột (Column / Field)' },
        { left: 'Bậc của quan hệ (Degree)', right: 'Số lượng thuộc tính (cột) trong bảng' }
      ]
    }),
    giai_thich: 'Đây là các thuật ngữ cơ bản đối sánh giữa lý thuyết quan hệ và cơ sở dữ liệu quan hệ thực tế.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_02_s1_05',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ theo đúng thứ tự để tạo thành quy tắc Toàn vẹn Thực thể:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép quy tắc Toàn vẹn Thực thể (Entity Integrity):',
      correct_order: ['Không có bất kỳ thuộc tính nào', 'thuộc khóa chính', 'được phép mang', 'giá trị NULL'],
      distractors: ['được mang số nguyên', 'phải là khóa ngoại']
    }),
    giai_thich: 'Toàn vẹn thực thể yêu cầu khóa chính phải phân biệt duy nhất từng cá thể, do đó không được NULL.',
    do_kho: 1
  },

  // --- BƯỚC 2: 80% NHỚ - 20% HIỂU ---
  {
    ma_cau_hoi: 'q_csdl_02_s2_01',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Điểm khác biệt cốt lõi giữa Khóa Ứng Viên (Candidate Key) và Siêu Khóa (Super Key) là gì?',
    dap_an_a: 'Khóa ứng viên là một siêu khóa tối thiểu, không thể bỏ bớt thuộc tính nào mà vẫn là khóa.',
    dap_an_b: 'Khóa ứng viên luôn chứa nhiều thuộc tính hơn so với bất kỳ siêu khóa nào trong bảng.',
    dap_an_c: 'Khóa ứng viên được phép mang giá trị NULL còn siêu khóa thì tuyệt đối không được phép.',
    dap_an_d: 'Khóa ứng viên chỉ được định nghĩa trên bảng phụ còn siêu khóa chỉ tồn tại ở bảng chính.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Khóa ứng viên là siêu khóa tối thiểu (Minimal Superkey).',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_02_s2_02',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ràng buộc Toàn vẹn Tham chiếu (Referential Integrity Constraint) quy định điều gì đối với Khóa Ngoại?',
    dap_an_a: 'Giá trị khóa ngoại phải khớp với một giá trị khóa chính đang tồn tại hoặc phải mang giá trị NULL.',
    dap_an_b: 'Khóa ngoại bắt buộc phải có tên gọi hoàn toàn giống với tên của khóa chính được tham chiếu.',
    dap_an_c: 'Mỗi bảng dữ liệu chỉ được phép chứa tối đa một khóa ngoại duy nhất liên kết với bảng cha.',
    dap_an_d: 'Khóa ngoại phải được tạo trước khi bảng chứa khóa chính được định nghĩa trong hệ thống.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Khóa ngoại không được trỏ đến một giá trị không tồn tại ở bảng tham chiếu.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_02_s2_03',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các loại khóa trong CSDL quan hệ với định nghĩa chính xác:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Khóa chính (Primary Key)', right: 'Khóa ứng viên được chọn làm định danh chính, cấm NULL' },
        { left: 'Khóa ngoại (Foreign Key)', right: 'Tham chiếu đến khóa chính hoặc khóa duy nhất bảng khác' },
        { left: 'Khóa phức hợp (Composite Key)', right: 'Khóa được ghép từ hai hoặc nhiều thuộc tính' },
        { left: 'Khóa nhân tạo (Surrogate Key)', right: 'Khóa tự sinh (Auto Increment/UUID) không có ý nghĩa nghiệp vụ' }
      ]
    }),
    giai_thich: 'Hiểu đúng các loại khóa là điều kiện tiên quyết để thiết kế CSDL chuẩn xác.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_02_s2_04',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Trong mô hình ERD, mối quan hệ nhiều - nhiều (N - N) giữa hai thực thể khi chuyển sang mô hình quan hệ bắt buộc phải tạo thành một {blank}.',
      blank_answer: 'bảng liên kết trung gian',
      options: ['bảng liên kết trung gian', 'thuộc tính đa trị', 'khóa chính độc lập', 'chỉ mục phức hợp']
    }),
    giai_thich: 'Quan hệ N-N được chuyển thành bảng trung gian (Junction table) chứa 2 khóa ngoại tham chiếu.',
    do_kho: 2
  },

  // --- BƯỚC 3: 50% NHỚ - 40% HIỂU - 10% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_02_s3_01',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Giả sử có bảng SinhVien(MaSV, Email, CCCD, HoTen). Trong đó MaSV, Email, CCCD đều là duy nhất và tối thiểu. Bảng này có bao nhiêu Khóa Ứng Viên?',
    dap_an_a: '3 khóa ứng viên (MaSV, Email, CCCD).',
    dap_an_b: '1 khóa ứng viên duy nhất (chỉ có MaSV).',
    dap_an_c: '4 khóa ứng viên bao gồm cả cột HoTen.',
    dap_an_d: '0 khóa ứng viên vì chưa chỉ định khóa chính.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Cả 3 thuộc tính đều là siêu khóa tối thiểu, do đó đều là khóa ứng viên (Candidate Keys).',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_02_s3_02',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ theo đúng thứ tự để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Quy tắc chuyển đổi mối quan hệ 1 - N sang mô hình quan hệ:',
      correct_order: ['Lấy khóa chính bên 1', 'đưa sang làm khóa ngoại', 'tại bảng bên N', 'để tạo liên kết'],
      distractors: ['tách thành ba bảng', 'xóa bỏ bảng bên N']
    }),
    giai_thich: 'Quan hệ 1-N được ánh xạ bằng cách đưa PK của bên 1 sang làm FK ở bên N.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_02_s3_03',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các hành vi kích hoạt khi xóa khóa ngoại (ON DELETE Action) với ý nghĩa tương ứng:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'CASCADE', right: 'Tự động xóa các bản ghi con tham chiếu khi bản ghi cha bị xóa' },
        { left: 'RESTRICT / NO ACTION', right: 'Từ chối thao tác xóa cha nếu vẫn còn bản ghi con tham chiếu' },
        { left: 'SET NULL', right: 'Đặt giá trị khóa ngoại ở bản ghi con thành NULL khi cha bị xóa' },
        { left: 'SET DEFAULT', right: 'Gán giá trị mặc định cho khóa ngoại ở con khi cha bị xóa' }
      ]
    }),
    giai_thich: 'Các tùy chọn ON DELETE duy trì tính toàn vẹn tham chiếu tự động.',
    do_kho: 2
  },

  // --- BƯỚC 4: 10% NHỚ - 60% HIỂU - 30% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_02_s4_01',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Cho bảng KetQua(MaSV, MaMH, Diem). Khóa chính là tập hợp (MaSV, MaMH). Thuộc tính Diem phụ thuộc vào thành phần nào?',
    dap_an_a: 'Phụ thuộc hàm đầy đủ vào toàn bộ khóa chính phức hợp (MaSV, MaMH).',
    dap_an_b: 'Chỉ phụ thuộc vào MaSV vì sinh viên là đối tượng chính nhận điểm.',
    dap_an_c: 'Chỉ phụ thuộc vào MaMH vì mỗi môn học có mức độ khó khác nhau.',
    dap_an_d: 'Không phụ thuộc vào bất kỳ thuộc tính nào trong lược đồ quan hệ.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Điểm số của một sinh viên chỉ xác định khi biết cả sinh viên đó VÀ môn học cụ thể.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_csdl_02_s4_02',
    ma_moc: 'moc_csdl_02_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để tạo thành câu hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Quy tắc xác định khóa chính tối ưu cho bảng dữ liệu:',
      correct_order: ['Khóa chính nên là', 'giá trị ngắn gọn, bất biến,', 'không chứa thông tin nhạy cảm', 'và đảm bảo tính duy nhất'],
      distractors: ['thường xuyên thay đổi', 'dài tối đa']
    }),
    giai_thich: 'Khóa chính tối ưu cần ổn định, ngắn gọn để tăng tốc index và hạn chế cập nhật cascade.',
    do_kho: 3
  },

  // =========================================================================
  // MỐC 3.1: Ngôn ngữ SQL Cốt lõi (DDL, DML & JOIN)
  // =========================================================================
  // --- BƯỚC 1: 100% NHỚ ---
  {
    ma_cau_hoi: 'q_csdl_03_s1_01',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tập hợp các câu lệnh nào sau đây thuộc nhóm DDL (Data Definition Language) trong SQL?',
    dap_an_a: 'CREATE, ALTER, DROP, TRUNCATE dùng để định nghĩa cấu trúc bảng.',
    dap_an_b: 'SELECT, INSERT, UPDATE, DELETE dùng để thao tác trên dữ liệu.',
    dap_an_c: 'GRANT, REVOKE, DENY dùng để phân quyền bảo mật người dùng.',
    dap_an_d: 'COMMIT, ROLLBACK, SAVEPOINT dùng để kiểm soát giao dịch an toàn.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'DDL quản lý cấu trúc bảng, lược đồ và chỉ mục (CREATE, ALTER, DROP, TRUNCATE).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_03_s1_02',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các nhóm câu lệnh SQL với chức năng cốt lõi tương ứng:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'DDL (Data Definition Language)', right: 'Tạo lập, sửa đổi cấu trúc bảng và lược đồ (CREATE, ALTER, DROP)' },
        { left: 'DML (Data Manipulation Language)', right: 'Truy vấn, thêm mới, cập nhật và xóa dữ liệu (SELECT, INSERT, UPDATE)' },
        { left: 'DCL (Data Control Language)', right: 'Cấp quyền và thu hồi quyền hạn bảo mật (GRANT, REVOKE)' },
        { left: 'TCL (Transaction Control Language)', right: 'Xác nhận hoặc hoàn tác giao dịch dữ liệu (COMMIT, ROLLBACK)' }
      ]
    }),
    giai_thich: 'SQL được phân chia thành 4 phân nhánh ngôn ngữ rõ rệt.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_03_s1_03',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Phép kết bảng {blank} chỉ trả về những dòng có giá trị tương ứng ở cả hai bảng kết nối.',
      blank_answer: 'INNER JOIN',
      options: ['INNER JOIN', 'FULL OUTER JOIN', 'CROSS JOIN', 'LEFT JOIN']
    }),
    giai_thich: 'INNER JOIN là phép kết trong, chỉ giữ lại các dòng khớp khóa ở cả hai phía.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_03_s1_04',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các từ theo đúng thứ tự logic thực thi truy vấn của SQL Engine:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Thứ tự thực thi logic của câu lệnh SELECT:',
      correct_order: ['FROM & JOIN', '-> WHERE', '-> GROUP BY', '-> HAVING', '-> SELECT', '-> ORDER BY'],
      distractors: ['-> COMMIT', '-> DROP TABLE']
    }),
    giai_thich: 'Trình tối ưu SQL luôn xác định nguồn dữ liệu (FROM) trước khi lọc (WHERE) và gom nhóm (GROUP BY).',
    do_kho: 1
  },

  // --- BƯỚC 2: 80% NHỚ - 20% HIỂU ---
  {
    ma_cau_hoi: 'q_csdl_03_s2_01',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Sự khác biệt căn bản giữa mệnh đề WHERE và HAVING trong SQL là gì?',
    dap_an_a: 'WHERE lọc từng dòng trước khi gom nhóm; HAVING lọc trên kết quả tổng hợp sau GROUP BY.',
    dap_an_b: 'WHERE chỉ sử dụng cho các bảng đơn lẻ; HAVING chỉ dùng khi thực hiện liên kết nhiều bảng.',
    dap_an_c: 'WHERE bắt buộc phải đi cùng các hàm gộp; HAVING nghiêm cấm sử dụng các hàm toán học.',
    dap_an_d: 'WHERE và HAVING hoàn toàn đồng nghĩa và có thể thay thế cho nhau trong mọi câu lệnh.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'WHERE áp dụng lọc trên từng bộ dữ liệu thô, còn HAVING lọc trên các nhóm sau khi gom nhóm.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_03_s2_02',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các loại phép kết bảng JOIN với tập kết quả trả về:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'INNER JOIN', right: 'Chỉ trả về các dòng khớp điều kiện ở cả hai bảng' },
        { left: 'LEFT JOIN', right: 'Giữ toàn bộ dòng bảng trái, ghép bên phải (nếu thiếu điền NULL)' },
        { left: 'RIGHT JOIN', right: 'Giữ toàn bộ dòng bảng phải, ghép bên trái (nếu thiếu điền NULL)' },
        { left: 'FULL OUTER JOIN', right: 'Giữ lại toàn bộ dòng của cả hai bảng, thiếu bên nào điền NULL' }
      ]
    }),
    giai_thich: 'Mỗi loại JOIN quyết định cách xử lý các bản ghi không khớp khóa giữa hai bảng.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_03_s2_03',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Muốn đếm số lượng sinh viên duy nhất trong từng lớp học, câu lệnh cần dùng là COUNT({blank} MaSV).',
      blank_answer: 'DISTINCT',
      options: ['DISTINCT', 'ALL', 'UNIQUE', 'PRIMARY']
    }),
    giai_thich: 'Từ khóa DISTINCT loại bỏ các giá trị trùng lặp trước khi hàm COUNT thực hiện tính toán.',
    do_kho: 2
  },

  // --- BƯỚC 3: 50% NHỚ - 40% HIỂU - 10% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_03_s3_01',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Bảng NhanVien có 10 dòng, bảng PhongBan có 3 dòng. Một câu truy vấn CROSS JOIN giữa hai bảng này sẽ trả về chính xác bao nhiêu dòng kết quả?',
    dap_an_a: '30 dòng kết quả (tích đề-các của 10 và 3).',
    dap_an_b: '13 dòng kết quả (tổng số lượng của cả hai bảng).',
    dap_an_c: '10 dòng kết quả (lấy theo số dòng của bảng lớn nhất).',
    dap_an_d: '0 dòng kết quả nếu không có điều kiện khóa ngoại.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'CROSS JOIN tạo tích Cartesian (10 x 3 = 30 dòng).',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_03_s3_02',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để tạo thành câu truy vấn chuẩn đếm số sinh viên theo khoa có trên 50 người:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Ghép thứ tự câu lệnh truy vấn lọc nhóm:',
      correct_order: ['SELECT MaKhoa, COUNT(MaSV)', 'FROM SinhVien', 'GROUP BY MaKhoa', 'HAVING COUNT(MaSV) > 50'],
      distractors: ['WHERE COUNT(MaSV) > 50', 'ORDER BY NULL']
    }),
    giai_thich: 'Hàm COUNT(MaSV) > 50 bắt buộc phải đặt trong mệnh đề HAVING vì là điều kiện trên nhóm.',
    do_kho: 3
  },

  // --- BƯỚC 4: 10% NHỚ - 60% HIỂU - 30% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_03_s4_01',
    ma_moc: 'moc_csdl_03_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Lệnh DELETE FROM NhanVien khác biệt cơ bản như thế nào so với lệnh TRUNCATE TABLE NhanVien?',
    dap_an_a: 'DELETE ghi log từng dòng và có thể kích hoạt Trigger; TRUNCATE giải phóng toàn bộ trang đĩa nhanh hơn.',
    dap_an_b: 'DELETE xóa toàn bộ cấu trúc bảng khỏi cơ sở dữ liệu; TRUNCATE chỉ xóa các dữ liệu có chứa giá trị NULL.',
    dap_an_c: 'TRUNCATE yêu cầu quyền truy cập của người dùng cuối; DELETE chỉ dành riêng cho tài khoản quản trị hệ thống.',
    dap_an_d: 'Cả hai lệnh hoàn toàn giống hệt nhau về cả cơ chế ghi nhật ký lẫn tốc độ giải phóng khối lưu trữ vật lý.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'TRUNCATE là lệnh DDL giải phóng trang bộ nhớ và reset identity, trong khi DELETE là lệnh DML ghi log từng dòng.',
    do_kho: 3
  },

  // =========================================================================
  // MỐC 4.1: Phụ thuộc hàm & Chuẩn hóa CSDL (1NF - 3NF)
  // =========================================================================
  // --- BƯỚC 1: 100% NHỚ ---
  {
    ma_cau_hoi: 'q_csdl_04_s1_01',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Mục đích tối thượng của quá trình Chuẩn hóa Cơ sở Dữ liệu (Normalization) là gì?',
    dap_an_a: 'Khử dư thừa dữ liệu và ngăn ngừa các dị thường khi thêm, xóa, sửa.',
    dap_an_b: 'Tăng kích thước tệp cơ sở dữ liệu để tận dụng tối đa dung lượng ổ đĩa.',
    dap_an_c: 'Giảm số lượng bảng dữ liệu xuống mức tối thiểu (chỉ còn duy nhất một bảng).',
    dap_an_d: 'Tự động mã hóa toàn bộ dữ liệu người dùng bằng các giải thuật mật mã đối xứng.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Chuẩn hóa giúp loại bỏ dư thừa và triệt tiêu các dị thường thêm, sửa, xóa (Anomalies).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_04_s1_02',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Một quan hệ đạt Dạng chuẩn 1 (1NF) khi tất cả các thuộc tính đều chứa giá trị {blank}, không có thuộc tính đa trị hay thuộc tính lặp.',
      blank_answer: 'nguyên tố (Atomic)',
      options: ['nguyên tố (Atomic)', 'phức hợp', 'mảng danh sách', 'chuỗi JSON']
    }),
    giai_thich: '1NF yêu cầu mọi miền giá trị đều là giá trị nguyên tử (Atomic values).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_csdl_04_s1_03',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Hãy nối các Dạng chuẩn CSDL với điều kiện tiên quyết cần đạt được:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Dạng chuẩn 1 (1NF)', right: 'Mọi giá trị thuộc tính đều là nguyên tố (Atomic), không có lặp' },
        { left: 'Dạng chuẩn 2 (2NF)', right: 'Đạt 1NF và không tồn tại phụ thuộc hàm một phần vào khóa chính' },
        { left: 'Dạng chuẩn 3 (3NF)', right: 'Đạt 2NF và không tồn tại phụ thuộc hàm bắc cầu qua thuộc tính không khóa' },
        { left: 'Dạng chuẩn BCNF', right: 'Mọi phụ thuộc hàm X -> Y thì X đều bắt buộc phải là một siêu khóa' }
      ]
    }),
    giai_thich: 'Các dạng chuẩn tạo thành một chuỗi kế thừa nghiêm ngặt (1NF -> 2NF -> 3NF -> BCNF).',
    do_kho: 1
  },

  // --- BƯỚC 2: 80% NHỚ - 20% HIỂU ---
  {
    ma_cau_hoi: 'q_csdl_04_s2_01',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nếu một bảng đã đạt chuẩn 1NF và Khóa chính của bảng chỉ gồm DUY NHẤT MỘT THUỘC TÍNH (khóa đơn), bảng đó có tự động đạt 2NF không?',
    dap_an_a: 'Chắc chắn đạt 2NF vì không thể tồn tại phụ thuộc một phần vào một khóa đơn.',
    dap_an_b: 'Không bao giờ đạt 2NF vì khóa đơn luôn tạo ra các phụ thuộc hàm dư thừa.',
    dap_an_c: 'Chỉ đạt 2NF khi bảng chứa ít hơn mười dòng dữ liệu trong thực tế triển khai.',
    dap_an_d: 'Tùy thuộc vào việc bảng đó có chứa các trường kiểu văn bản hay kiểu số nguyên.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Phụ thuộc một phần chỉ xảy ra khi khóa chính là khóa phức hợp gồm từ 2 thuộc tính trở lên.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_csdl_04_s2_02',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để tạo thành câu hoàn chỉnh về điều kiện 3NF:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Quy tắc đạt Dạng chuẩn 3 (3NF):',
      correct_order: ['Bảng phải đạt 2NF', 'và mọi thuộc tính không khóa', 'phải phụ thuộc trực tiếp', 'vào khóa chính'],
      distractors: ['phụ thuộc bắc cầu', 'không cần có khóa']
    }),
    giai_thich: '3NF triệt tiêu hoàn toàn hiện tượng phụ thuộc hàm bắc cầu qua các thuộc tính không khóa.',
    do_kho: 2
  },

  // --- BƯỚC 3: 50% NHỚ - 40% HIỂU - 10% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_04_s3_01',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Cho quan hệ DonHang(MaDH, MaSP, SoLuong, TenSP, DonGia). Khóa chính là (MaDH, MaSP). Biết MaSP -> (TenSP, DonGia). Quan hệ này đang ở dạng chuẩn nào và vi phạm gì?',
    dap_an_a: 'Đạt 1NF nhưng vi phạm 2NF vì TenSP và DonGia phụ thuộc một phần vào MaSP.',
    dap_an_b: 'Đã đạt 3NF vì không có bất kỳ thuộc tính nào mang giá trị trùng lặp trong thực tế.',
    dap_an_c: 'Chưa đạt 1NF vì cột DonGia có thể chứa nhiều giá trị phân cách bằng dấu phẩy.',
    dap_an_d: 'Đạt chuẩn BCNF vì cặp (MaDH, MaSP) đã là một siêu khóa duy nhất của toàn bảng.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'TenSP và DonGia chỉ phụ thuộc vào MaSP (một phần của khóa chính), do đó vi phạm 2NF.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_csdl_04_s3_02',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Nối các loại dị thường dữ liệu với kịch bản phát sinh trong thực tế:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Dị thường Thêm mới (Insertion)', right: 'Không thể thêm khoa mới nếu chưa có sinh viên nào theo học' },
        { left: 'Dị thường Xóa (Deletion)', right: 'Xóa sinh viên cuối cùng vô tình làm mất luôn thông tin về khoa' },
        { left: 'Dị thường Cập nhật (Update)', right: 'Đổi trưởng khoa ở một dòng nhưng quên đổi ở các dòng khác' },
        { left: 'Phân rã bảo toàn thông tin', right: 'Ghép tự nhiên các bảng con thu lại chính xác bảng ban đầu' }
      ]
    }),
    giai_thich: 'Các dị thường này là bằng chứng rõ ràng chứng minh lược đồ cần được chuẩn hóa.',
    do_kho: 3
  },

  // --- BƯỚC 4: 10% NHỚ - 60% HIỂU - 30% VẬN DỤNG ---
  {
    ma_cau_hoi: 'q_csdl_04_s4_01',
    ma_moc: 'moc_csdl_04_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Để chuẩn hóa quan hệ DonHang(MaDH, MaSP, SoLuong, TenSP, DonGia) vi phạm 2NF ở trên về 2NF, giải pháp chuẩn hóa phân rã lược đồ là gì?',
    dap_an_a: 'Tách thành DonHangChiTiet(MaDH, MaSP, SoLuong) và SanPham(MaSP, TenSP, DonGia).',
    dap_an_b: 'Gộp toàn bộ thông tin khách hàng và ngày đặt hàng vào chung một bảng duy nhất.',
    dap_an_c: 'Xóa bỏ hai cột TenSP và DonGia khỏi cơ sở dữ liệu và nhập trực tiếp khi in hóa đơn.',
    dap_an_d: 'Tạo thêm một bảng trung gian chứa ba khóa ngoại liên kết với ba bảng phụ trợ khác.',
    vi_tri_dap_an_dung: 0,
    giai_thich: 'Tách các thuộc tính phụ thuộc một phần ra bảng riêng với khóa chính là phần khóa đó.',
    do_kho: 3
  }
];

async function seed() {
  console.log(`--- Seeding ${questions.length} Rich Questions with Bloom Stepping ---`);

  for (const q of questions) {
    const existing = await db.queryOne('SELECT ma_cau_hoi FROM cau_hoi WHERE ma_cau_hoi = $1', [q.ma_cau_hoi]);

    if (existing) {
      // Update
      await db.execute(`
        UPDATE cau_hoi SET
          ma_moc = $1,
          buoc_luyen_tap = $2,
          muc_bloom = $3,
          loai_cau_hoi = $4,
          noi_dung = $5,
          dap_an_a = $6,
          dap_an_b = $7,
          dap_an_c = $8,
          dap_an_d = $9,
          vi_tri_dap_an_dung = $10,
          du_lieu_cau_hoi = $11,
          giai_thich = $12,
          do_kho = $13
        WHERE ma_cau_hoi = $14
      `, [
        q.ma_moc, q.buoc_luyen_tap, q.muc_bloom, q.loai_cau_hoi, q.noi_dung,
        q.dap_an_a || null, q.dap_an_b || null, q.dap_an_c || null, q.dap_an_d || null,
        q.vi_tri_dap_an_dung !== undefined ? q.vi_tri_dap_an_dung : null,
        q.du_lieu_cau_hoi || null, q.giai_thich || null, q.do_kho || 1,
        q.ma_cau_hoi
      ]);
    } else {
      // Insert
      await db.execute(`
        INSERT INTO cau_hoi (
          ma_cau_hoi, ma_moc, buoc_luyen_tap, muc_bloom, loai_cau_hoi,
          noi_dung, dap_an_a, dap_an_b, dap_an_c, dap_an_d,
          vi_tri_dap_an_dung, du_lieu_cau_hoi, giai_thich, do_kho
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      `, [
        q.ma_cau_hoi, q.ma_moc, q.buoc_luyen_tap, q.muc_bloom, q.loai_cau_hoi,
        q.noi_dung, q.dap_an_a || null, q.dap_an_b || null, q.dap_an_c || null, q.dap_an_d || null,
        q.vi_tri_dap_an_dung !== undefined ? q.vi_tri_dap_an_dung : null,
        q.du_lieu_cau_hoi || null, q.giai_thich || null, q.do_kho || 1
      ]);
    }
  }

  console.log(`✓ Seeded ${questions.length} questions successfully into database!`);
}

seed()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Seed questions failed:', err);
    process.exit(1);
  });
