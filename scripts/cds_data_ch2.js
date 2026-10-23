/**
 * Dữ liệu Môn Chuyển Đổi Số - Chương 2: Các trụ cột của Chuyển đổi số
 * 3 Mốc bài học + 29 Câu hỏi (20 câu gốc trường + 9 câu mở rộng Bloom 3/4, Nối cặp, Sắp xếp, Điền từ)
 * Tuân thủ quy tắc: Câu bẫy dài bằng/hơn câu đúng, đáp án đúng phân bố đều A, B, C, D
 */

const checkpointsCh2 = [
  {
    ma_moc: 'moc_cds_02_01',
    ma_chuong: 'ch_cds_02',
    tieu_de: 'Mốc 2.1: Dữ liệu Tài sản Cốt lõi & Nghị định 13/2023/NĐ-CP',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 1,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Dữ liệu - "Nguồn tài nguyên mới"
- Trong kỷ nguyên số, dữ liệu được ví như **nguồn tài nguyên mới, "dầu mỏ" hay "nhiên liệu"** vận hành toàn bộ nền kinh tế số.
- Chuyển đổi từ mô hình quản trị theo kinh nghiệm cảm tính sang mô hình **quản trị thông minh, ra quyết định dựa trên bằng chứng dữ liệu (data-driven)**.

### 2. Quy trình quản trị & khai thác dữ liệu 3 bước
1. **Thu thập dữ liệu**: Tự động ghi nhận từ cảm biến IoT, camera thông minh, lịch sử giao dịch trực tuyến, nhật ký ứng dụng và mạng xã hội.
2. **Xử lý và phân tích**: Dữ liệu thô được làm sạch (Data Cleaning), chuẩn hóa và phân tích bằng các thuật toán Big Data, AI và Data Mining nhằm phát hiện các tri thức ẩn.
3. **Khai thác và chia sẻ**: Dữ liệu chỉ tạo ra giá trị cao nhất khi được **kết nối, chia sẻ liên thông và tái sử dụng** an toàn giữa các bộ phận, doanh nghiệp hoặc cơ quan nhà nước qua cổng Dữ liệu mở (Open Data).

### 3. Đạo đức và Pháp lý dữ liệu: Nghị định 13/2023/NĐ-CP
- **Nghị định 13/2023/NĐ-CP** (hiệu lực từ 01/07/2023) là văn bản pháp quy quan trọng nhất của Việt Nam về **Bảo vệ dữ liệu cá nhân**.
- Quy định rõ quyền của chủ thể dữ liệu (biết, đồng ý, xóa dữ liệu) và nghĩa vụ bắt buộc của các tổ chức thu thập, xử lý dữ liệu phải áp dụng các biện pháp bảo mật, phòng chống rò rỉ thông tin cá nhân.`
  },
  {
    ma_moc: 'moc_cds_02_02',
    ma_chuong: 'ch_cds_02',
    tieu_de: 'Mốc 2.2: Bộ Tứ Công Nghệ Nền Tảng & Hình Tượng Cơ Thể Người',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 2,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Hình tượng ví von Công nghệ với Cơ thể người
- **IoT (Internet of Things)** = **Giác quan**: Thu nhận tín hiệu từ môi trường thực (nhiệt độ, độ ẩm, hình ảnh, âm thanh) và truyền dữ liệu về trung tâm.
- **Big Data** = **Bộ não / Kho tri thức**: Lưu trữ lượng dữ liệu khổng lồ với đặc trưng 3Vs (Volume - Quy mô lớn, Variety - Đa dạng, Velocity - Tốc độ nhanh).
- **Cloud Computing** = **Cơ bắp**: Cung cấp sức mạnh tính toán, lưu trữ co giãn linh hoạt theo nhu cầu mà không cần mua máy chủ vật lý.
- **AI (Trí tuệ nhân tạo)** = **Trí tuệ suy luận**: Xử lý dữ liệu, học hỏi và đưa ra dự đoán thông minh.
- **Blockchain** = **Sổ cái bất biến / Trí nhớ minh bạch**: Lưu trữ dữ liệu phân tán, chống sửa đổi, mã hóa bảo mật cao.

### 2. Nền tảng No-code / Low-code
- Cho phép người dùng nghiệp vụ (không có chuyên môn lập trình) kéo thả để tạo ra ứng dụng nhanh chóng, giúp rút ngắn thời gian triển khai từ nhiều tháng xuống vài ngày.`
  },
  {
    ma_moc: 'moc_cds_02_03',
    ma_chuong: 'ch_cds_02',
    tieu_de: 'Mốc 2.3 [BOSS]: Hạ Tầng Số NQ 03 & Kiềng Ba Chân Hợp Nhất',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 3,
    diem_thuong: 35,
    xu_thuong: 30,
    noi_dung_ly_thuyet: `### 1. Hạ tầng số quốc gia theo Nghị quyết 03/NQ-CP
Hạ tầng số là xương sống của nền kinh tế số, bao gồm 4 thành phần:
1. **Hạ tầng kết nối**: Mạng viễn thông cáp quang băng rộng, phủ sóng 4G/5G, vệ tinh. Mục tiêu đến năm 2025: **100% xã có cáp quang và phủ sóng 4G/5G**.
2. **Hạ tầng dữ liệu**: Các Trung tâm dữ liệu (Data Center), Điện toán đám mây và Cơ sở dữ liệu quốc gia (dân cư, đất đai, doanh nghiệp).
3. **Hạ tầng nền tảng số**: Định danh điện tử (VNeID), cổng thanh toán số quốc gia, dịch vụ công trực tuyến.
4. **Hạ tầng an toàn, an ninh mạng**: Hệ thống phòng chống tấn công mạng quốc gia.

### 2. Ba chủ thể con người trong chuyển đổi số
- **Nhà lãnh đạo số**: Người có tầm nhìn, kiên định và quan trọng nhất là **biết đặt bài toán đúng đắn**.
- **Chuyên gia công nghệ số**: Người tiếp nhận bài toán từ lãnh đạo, đơn giản hóa câu chuyện phức tạp và đưa ra giải pháp công nghệ.
- **Người tham gia**: Đội ngũ cán bộ nhân viên, tích cực học hỏi kỹ năng mới và thay đổi thói quen làm việc.

### 3. Hệ sinh thái Kiềng ba chân hợp nhất
- **Dữ liệu là Nhiên liệu** $\\leftrightarrow$ **Công nghệ là Động cơ** $\\leftrightarrow$ **Con người là Người lái**.
- Chuyển đổi số chỉ thành công khi cả 3 yếu tố này kết hợp hài hòa trong một hệ thống thống nhất.`
  }
];

const questionsCh2 = [
  // ==========================================
  // CHECKPOINT 2.1 (10 câu: 7 câu gốc + 3 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_02_01_01',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong kỷ nguyên chuyển đổi số hiện đại, Dữ liệu (Data) được ví như yếu tố nào sau đây?',
    dap_an_a: 'Tài sản phụ trợ chỉ dùng để đối chiếu khi có đoàn thanh tra thuế đến làm việc.',
    dap_an_b: 'Nguồn tài nguyên mới, nhiên liệu quý giá và yếu tố trung tâm của mọi quyết định.',
    dap_an_c: 'Công cụ có thể thay thế hoàn toàn và sa thải 100% lực lượng lao động trong doanh nghiệp.',
    dap_an_d: 'Sản phẩm phụ phát sinh tự nhiên cần phải được xóa bỏ định kỳ hàng tháng để tiết kiệm đĩa.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Dữ liệu được xem là nguồn tài nguyên mới và yếu tố trung tâm giúp chuyển từ quản trị cảm tính sang quản trị thông minh (data-driven).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_01_02',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Quy trình quản trị và khai thác dữ liệu chuẩn mực trong tổ chức bao gồm các bước nào?',
    dap_an_a: 'Chỉ phân tích các nguồn dữ liệu mở miễn phí được tải ngẫu nhiên từ mạng xã hội về máy tính.',
    dap_an_b: 'Thu thập dữ liệu $\\rightarrow$ Xử lý & Phân tích $\\rightarrow$ Khai thác, chia sẻ liên thông & Tái sử dụng.',
    dap_an_c: 'Mã hóa bí mật $\\rightarrow$ Khóa quyền truy cập của nhân viên $\\rightarrow$ Tiêu hủy toàn bộ sau 30 ngày.',
    dap_an_d: 'Tự động hóa dây chuyền cơ khí $\\rightarrow$ Số hóa tài liệu giấy $\\rightarrow$ In ấn lưu trữ vào kho lưu trữ.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Quản trị dữ liệu gồm 3 bước: Thu thập -> Xử lý & Phân tích -> Khai thác, chia sẻ & tái sử dụng.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_01_03',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Dữ liệu số chỉ thực sự phát huy giá trị to lớn và tạo ra lợi ích kinh tế khi nào?',
    dap_an_a: 'Được bảo quản bí mật tuyệt đối trong một ngăn kéo máy chủ và nghiêm cấm bất kỳ ai truy xuất.',
    dap_an_b: 'Được kết nối, chia sẻ liên thông và tái sử dụng an toàn giữa các hệ thống, phòng ban và đối tác.',
    dap_an_c: 'Chỉ được in ra các tập tài liệu giấy dày hàng trăm trang để đóng dấu đỏ lưu kho lưu trữ.',
    dap_an_d: 'Được lưu trữ cục bộ duy nhất trên ổ cứng máy tính cá nhân của một nhân viên duy nhất trong công ty.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Dữ liệu tạo ra giá trị thực sự khi được chia sẻ, kết nối liên thông và tái sử dụng.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_01_04',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tại Việt Nam, Nghị định số 13/2023/NĐ-CP của Chính phủ ban hành quy định về nội dung pháp lý nào?',
    dap_an_a: 'Quy định về việc đăng ký tên miền Internet và quản lý trang thông tin điện tử tổng hợp.',
    dap_an_b: 'Bảo vệ dữ liệu cá nhân, quyền của chủ thể dữ liệu và nghĩa vụ bảo mật của bên xử lý dữ liệu.',
    dap_an_c: 'Quy hoạch xây dựng các trạm phát sóng viễn thông băng rộng thế hệ 5G trên toàn quốc.',
    dap_an_d: 'Quy định mức thuế thu nhập doanh nghiệp đối với các công ty khởi nghiệp trong lĩnh vực công nghệ.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Nghị định 13/2023/NĐ-CP của Chính phủ quy định về Bảo vệ dữ liệu cá nhân.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_01_05',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trí tuệ nhân tạo (Artificial Intelligence - AI) được định nghĩa chuẩn xác nhất là gì?',
    dap_an_a: 'Một phần mềm máy tính chuyên dùng để quét sạch các tập tin tài liệu rác trên hệ điều hành Windows.',
    dap_an_b: 'Công nghệ mô phỏng, giúp máy tính có khả năng học hỏi từ dữ liệu, suy luận và giải quyết vấn đề như con người.',
    dap_an_c: 'Thiết bị phần cứng máy chủ có gắn đèn tín hiệu quang học để đo nhiệt độ phòng làm việc.',
    dap_an_d: 'Hệ thống lưu trữ dữ liệu dạng bảng tính cho phép người dùng nhập liệu thông qua bàn phím.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.2 (Trang 16): AI là công nghệ giúp máy tính có khả năng học tập, suy luận và xử lý thông tin thông minh như con người.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_01_06',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Internet vạn vật (IoT) được ví như "giác quan" của con người trong môi trường số vì lý do nào?',
    dap_an_a: 'IoT chỉ có thể kết nối được với các máy móc cơ khí thời kỳ Cách mạng công nghiệp lần thứ nhất.',
    dap_an_b: 'Sử dụng các cảm biến để cảm nhận, thu thập dữ liệu thời gian thực từ thế giới thực và truyền về hệ thống xử lý.',
    dap_an_c: 'Là một giao thức phần mềm mã nguồn mở dùng để thay thế hoàn toàn mạng viễn thông toàn cầu.',
    dap_an_d: 'Có khả năng tự động sáng tác các tác phẩm âm nhạc và hội họa mà không cần dữ liệu đầu vào.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.2 (Trang 17): IoT sử dụng cảm biến giúp các đồ vật thu thập và truyền dữ liệu thời gian thực, đóng vai trò như các giác quan.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_01_07',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một doanh nghiệp bán lẻ thu thập số điện thoại, địa chỉ nhà và lịch sử mua sắm của khách hàng nhưng không áp dụng biện pháp mã hóa, dẫn đến việc dữ liệu bị rò rỉ và bán ra chợ đen. Doanh nghiệp này đã vi phạm nghiêm trọng văn bản pháp lý nào?',
    dap_an_a: 'Luật Giao thông đường bộ về việc vận chuyển hàng hóa thương mại điện tử đường dài.',
    dap_an_b: 'Nghị định 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân.',
    dap_an_c: 'Nghị quyết 03/NQ-CP về quy chuẩn xây dựng trạm thu phát sóng viễn thông di động.',
    dap_an_d: 'Luật Xây dựng về quy chuẩn phòng cháy chữa cháy trong trung tâm dữ liệu máy chủ.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Nghị định 13/2023/NĐ-CP quy định nghĩa vụ bắt buộc bảo vệ dữ liệu cá nhân của khách hàng đối với các tổ chức, doanh nghiệp thu thập dữ liệu.',
    do_kho: 3
  },
  // Câu mở rộng: Nối cặp
  {
    ma_cau_hoi: 'q_cds_02_01_08',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 bước quản trị dữ liệu bên Trái và 1 nội dung tương ứng bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Bước 1: Thu thập dữ liệu', right: 'Ghi nhận từ cảm biến IoT, giao dịch và ứng dụng' },
        { left: 'Bước 2: Xử lý & Phân tích', right: 'Làm sạch, chuẩn hóa và khai phá tri thức với AI' },
        { left: 'Bước 3: Khai thác & Chia sẻ', right: 'Liên thông dữ liệu mở (Open Data) đa ngành' },
        { left: 'Nghị định 13/2023/NĐ-CP', right: 'Hành lang pháp lý bảo vệ dữ liệu cá nhân' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 3 bước quản trị dữ liệu và văn bản pháp lý bảo vệ dữ liệu cá nhân.',
    do_kho: 2
  },
  // Câu mở rộng: Sắp xếp
  {
    ma_cau_hoi: 'q_cds_02_01_09',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ để sắp xếp đúng quy trình quản trị và khai thác dữ liệu trong tổ chức:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp quy trình khai thác dữ liệu:',
      correct_order: [
        'Thu thập dữ liệu từ cảm biến và ứng dụng',
        'Làm sạch và chuẩn hóa dữ liệu thô',
        'Phân tích dữ liệu bằng công cụ AI và Big Data',
        'Chia sẻ và tái sử dụng dữ liệu qua cổng liên thông'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Quy trình chuẩn: Thu thập -> Làm sạch & chuẩn hóa -> Phân tích khai phá -> Chia sẻ và tái sử dụng.',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_02_01_10',
    ma_moc: 'moc_cds_02_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn số hiệu văn bản thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Tại Việt Nam, {blank} là nghị định của Chính phủ quy định chi tiết về bảo vệ dữ liệu cá nhân, có hiệu lực từ tháng 7/2023.',
      options: ['Nghị định 13/2023/NĐ-CP', 'Nghị định 72/2013/NĐ-CP', 'Nghị quyết 03/NQ-CP', 'Quyết định 749/QĐ-TTg'],
      blank_answer: 'Nghị định 13/2023/NĐ-CP'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Nghị định 13/2023/NĐ-CP quy định về bảo vệ dữ liệu cá nhân.',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 2.2 (9 câu: 7 câu gốc + 2 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_02_02_01',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ba đặc trưng cơ bản (mô hình 3Vs) định nghĩa về Dữ liệu lớn (Big Data) bao gồm những yếu tố nào?',
    dap_an_a: 'Chỉ gồm dữ liệu văn bản có cấu trúc chuẩn hóa, lưu trữ cố định trên đĩa mềm dung lượng nhỏ.',
    dap_an_b: 'Dữ liệu không bao giờ có thể xử lý được bằng bất kỳ hệ thống máy tính hiện đại nào.',
    dap_an_c: 'Khối lượng cực lớn (Volume), tốc độ sinh ra nhanh (Velocity) và đa dạng về thể loại (Variety).',
    dap_an_d: 'Tập hợp các tài liệu mật chỉ áp dụng trong phạm vi an ninh quốc phòng và tài chính ngân hàng.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 2, Mục 2.2 (Trang 17): Big Data có 3 đặc trưng cốt lõi là Volume, Velocity và Variety (3Vs).',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_02_02',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Công nghệ Điện toán đám mây (Cloud Computing) đem lại giải pháp ưu việt nào cho doanh nghiệp?',
    dap_an_a: 'Bắt buộc doanh nghiệp phải mua sắm máy chủ vật lý và thuê kỹ sư quản trị phần cứng trực ca 24/7.',
    dap_an_b: 'Cho phép thuê tài nguyên lưu trữ và xử lý tính toán linh hoạt qua Internet theo đúng nhu cầu sử dụng.',
    dap_an_c: 'Hoạt động hoàn toàn độc lập và không cần đến sự kết nối của mạng Internet toàn cầu.',
    dap_an_d: 'Chỉ có thể cung cấp các phần mềm kế toán nội bộ và không hỗ trợ mở rộng quy mô kinh doanh.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.2 (Trang 17): Cloud Computing cung cấp tài nguyên tính toán theo nhu cầu qua mạng Internet, giúp co giãn linh hoạt và tiết kiệm chi phí.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_02_03',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Đặc điểm kỹ thuật nổi bật nhất của công nghệ Chuỗi khối (Blockchain) là:',
    dap_an_a: 'Dữ liệu được lưu trữ tập trung tại một máy chủ duy nhất để dễ dàng xóa bỏ và chỉnh sửa.',
    dap_an_b: 'Hệ thống hoàn toàn khép kín và không thể hiện tính minh bạch đối với các bên tham gia.',
    dap_an_c: 'Lưu trữ sổ cái phân tán, mã hóa bảo mật cao và dữ liệu có tính bất biến, chống giả mạo.',
    dap_an_d: 'Chỉ có thể được ứng dụng duy nhất cho các đồng tiền mã hóa và trò chơi trực tuyến.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 2, Mục 2.2 (Trang 18): Blockchain là sổ cái phân tán, phi tập trung, mã hóa bảo mật cao và dữ liệu không thể bị sửa đổi tùy tiện.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_02_04',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nền tảng No-code / Low-code đem lại bước tiến vượt bậc nào trong tiến trình chuyển đổi số?',
    dap_an_a: 'Làm tăng chi phí và kéo dài thời gian phát triển ứng dụng phần mềm lên gấp nhiều lần.',
    dap_an_b: 'Giúp người dùng không có chuyên môn lập trình vẫn có thể tự tạo lập ứng dụng nghiệp vụ nhanh chóng.',
    dap_an_c: 'Xóa bỏ hoàn toàn ngành công nghiệp phát triển phần mềm và làm các kỹ sư CNTT mất việc.',
    dap_an_d: 'Chỉ có thể chạy được trên các thiết bị máy tính bảng phục vụ cho việc dạy học mầm non.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.2 (Trang 18): No-code/Low-code giúp rút ngắn thời gian phát triển, trao quyền cho người không biết lập trình vẫn tạo được ứng dụng nghiệp vụ.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_02_05',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Phẩm chất và năng lực quan trọng nhất của một Nhà lãnh đạo chuyển đổi số là gì?',
    dap_an_a: 'Phải là một lập trình viên xuất sắc, nắm rõ từng dòng mã lệnh của các hệ điều hành máy tính.',
    dap_an_b: 'Có tầm nhìn chiến lược số rõ ràng, truyền cảm hứng và quan trọng nhất là biết đặt ra bài toán đúng đắn.',
    dap_an_c: 'Trực tiếp phụ trách việc lắp đặt dây cáp mạng và bảo trì phần cứng máy chủ hàng tuần.',
    dap_an_d: 'Ủy quyền toàn bộ cho phòng CNTT và không cần tham gia vào bất kỳ cuộc họp chiến lược nào.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.3 (Trang 19): Nhà lãnh đạo chuyển đổi số không nhất thiết phải giỏi kỹ thuật mà quan trọng nhất là có tầm nhìn và biết đặt bài toán đúng đắn.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_02_06',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Vai trò cốt lõi của Chuyên gia công nghệ số trong quá trình chuyển đổi số là gì?',
    dap_an_a: 'Biến những vấn đề nghiệp vụ đơn giản thành các dự án kỹ thuật cực kỳ phức tạp và tốn kém.',
    dap_an_b: 'Tiếp nhận bài toán từ lãnh đạo, đơn giản hóa vấn đề và đưa ra giải pháp công nghệ phù hợp để giải quyết.',
    dap_an_c: 'Chỉ thực hiện các công việc hành chính văn phòng và không giao tiếp với ban lãnh đạo doanh nghiệp.',
    dap_an_d: 'Tự ý áp dụng các công nghệ đắt đỏ nhất trên thế giới mà không cần quan tâm đến mục tiêu của công ty.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.3 (Trang 19): Chuyên gia công nghệ số có năng lực đơn giản hóa vấn đề phức tạp và giải bài toán của lãnh đạo bằng công nghệ phù hợp.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_02_07',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Giá trị nào sau đây KHÔNG THUỘC VỀ văn hóa doanh nghiệp số (Digital Culture)?',
    dap_an_a: 'Cởi mở, minh bạch và sẵn sàng chia sẻ thông tin giữa các phòng ban chức năng.',
    dap_an_b: 'Khả năng hợp tác linh hoạt đa ngành và tinh thần thích ứng, sẵn sàng thử nghiệm cái mới.',
    dap_an_c: 'Khép kín thông tin, xây dựng "ốc đảo dữ liệu" nhằm củng cố quyền lực cá nhân của trưởng phòng.',
    dap_an_d: 'Đặt trải nghiệm của con người và khách hàng làm trung tâm của mọi sáng kiến cải tiến.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 2, Mục 2.3 (Trang 20): Khép kín thông tin và cục bộ "ốc đảo dữ liệu" đi ngược lại hoàn toàn với tinh thần cởi mở, liên thông của văn hóa số.',
    do_kho: 2
  },
  // Câu mở rộng: Nối cặp hình tượng cơ thể người
  {
    ma_cau_hoi: 'q_cds_02_02_08',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 công nghệ 4.0 bên Trái và hình tượng cơ thể người tương ứng bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Internet vạn vật (IoT)', right: 'Giác quan cảm nhận môi trường thực' },
        { left: 'Dữ liệu lớn (Big Data)', right: 'Bộ não và kho tri thức lưu trữ' },
        { left: 'Điện toán đám mây (Cloud)', right: 'Cơ bắp cung cấp sức mạnh tính toán' },
        { left: 'Chuỗi khối (Blockchain)', right: 'Sổ cái bất biến, trí nhớ minh bạch' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác hình tượng ví von các công nghệ 4.0 với các bộ phận cơ thể người theo bài giảng Chương 2.',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_02_02_09',
    ma_moc: 'moc_cds_02_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Điện toán đám mây cho phép doanh nghiệp chuyển đổi chi phí đầu tư tài sản cố định mua máy chủ (CapEx) sang chi phí {blank} theo nhu cầu sử dụng thực tế (OpEx).',
      options: ['vận hành', 'nhân sự', 'mặt bằng', 'quảng cáo'],
      blank_answer: 'vận hành'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Cloud giúp chuyển CapEx (Capital Expenditure) sang OpEx (Operational Expenditure - Chi phí vận hành).',
    do_kho: 2
  },

  // ==========================================
  // CHECKPOINT 2.3 [BOSS] (10 câu: 6 câu gốc + 4 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_02_03_01',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nguyên lý "Đặt con người làm trung tâm" trong chuyển đổi số được hiểu đúng nhất là:',
    dap_an_a: 'Công nghệ là yếu tố quyết định tối cao, con người chỉ cần phục tùng theo sự điều khiển của máy móc.',
    dap_an_b: 'Mọi quyết định kinh doanh đều phó thác cho thuật toán trí tuệ nhân tạo mà không cần xem xét tác động đạo đức.',
    dap_an_c: 'Công nghệ chỉ là công cụ hỗ trợ, mục tiêu cuối cùng của mọi sáng kiến số là phục vụ và nâng tầm con người.',
    dap_an_d: 'Cắt giảm tối đa quyền lợi và phúc lợi của người lao động để dồn toàn bộ nguồn lực tài chính mua sắm phần mềm.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 2, Mục 2.3 & 2.5 (Trang 20, 22): Công nghệ chỉ là công cụ, đích đến tối thượng của chuyển đổi số là phục vụ hạnh phúc, năng suất và phát triển con người.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_03_02',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Theo định hướng của Bộ Thông tin và Truyền thông, Hạ tầng số quốc gia bao gồm 4 thành phần nào?',
    dap_an_a: 'Chỉ bao gồm các sợi dây cáp mạng Internet nội bộ được kết nối giữa các phòng ban văn phòng.',
    dap_an_b: 'Hạ tầng kết nối mạng, Hạ tầng dữ liệu, Hạ tầng nền tảng số và Hạ tầng bảo đảm an toàn an ninh mạng.',
    dap_an_c: 'Mạng lưới đường điện cao thế quốc gia và hệ thống nhà máy nhiệt điện cung cấp năng lượng.',
    dap_an_d: 'Tập hợp các máy in, máy scan và máy hủy tài liệu được mua sắm trang bị cho các công chức.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.4 (Trang 20-21): Hạ tầng số quốc gia gồm 4 thành phần: Kết nối, Dữ liệu, Nền tảng số và An toàn an ninh mạng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_03_03',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trung tâm dữ liệu (Data Center) và dịch vụ Điện toán đám mây thuộc nhóm hạ tầng nào sau đây?',
    dap_an_a: 'Hạ tầng mạng kết nối viễn thông.',
    dap_an_b: 'Hạ tầng nền tảng dịch vụ số.',
    dap_an_c: 'Hạ tầng dữ liệu (Data Infrastructure).',
    dap_an_d: 'Hạ tầng thiết bị văn phòng cơ bản.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 2, Mục 2.4 (Trang 21): Data Center và Điện toán đám mây thuộc nhóm Hạ tầng dữ liệu.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_03_04',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nghị quyết số 03/NQ-CP của Chính phủ đặt mục tiêu đến năm 2025 về hạ tầng viễn thông như thế nào?',
    dap_an_a: 'Ngừng đầu tư phát triển mạng cáp quang để quay về sử dụng đường truyền điện thoại quay số tương tự.',
    dap_an_b: '100% các xã trên toàn quốc có mạng cáp quang băng rộng và được phủ sóng mạng di động 4G/5G.',
    dap_an_c: 'Chỉ ưu tiên phát sóng mạng di động 3G tại các thành phố lớn và tạm dừng kết nối mạng ở nông thôn.',
    dap_an_d: 'Thay thế toàn bộ mạng không dây bằng hệ thống dây dẫn tín hiệu đồng truyền thống.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.4 (Trang 21): Nghị quyết 03/NQ-CP đặt mục tiêu đến 2025: 100% xã có cáp quang và phủ sóng 4G/5G.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_02_03_05',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ba trụ cột Dữ liệu - Công nghệ - Con người trong hệ sinh thái chuyển đổi số liên kết chặt chẽ theo cơ chế nào?',
    dap_an_a: 'Ba yếu tố hoạt động hoàn toàn độc lập và không có bất kỳ mối quan hệ tương hỗ nào với nhau.',
    dap_an_b: 'Công nghệ giúp thu thập xử lý dữ liệu $\\rightarrow$ Dữ liệu cung cấp tri thức $\\rightarrow$ Con người ra quyết định và kiến tạo giá trị.',
    dap_an_c: 'Dữ liệu thay thế hoàn toàn vai trò của con người và tự động điều khiển việc mua sắm máy móc công nghệ.',
    dap_an_d: 'Con người chỉ đóng vai trò bảo dưỡng thiết bị máy móc mà không có quyền can thiệp vào các báo cáo dữ liệu.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 2, Mục 2.5 (Trang 22-23): Ba trụ cột tạo chu trình khép kín: Công nghệ xử lý dữ liệu -> Dữ liệu cung cấp tri thức -> Con người ra quyết định & kiến tạo giá trị.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_02_03_06',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một chiến dịch chuyển đổi số của tổ chức chỉ thực sự được coi là thành công bền vững khi nào?',
    dap_an_a: 'Doanh nghiệp chi tiêu vượt mức ngân sách cho phép để sở hữu các phần mềm đắt đỏ nhất trên thị trường.',
    dap_an_b: 'Thu thập được khối lượng dữ liệu khổng lồ nhưng không một nhân viên nào biết cách khai thác sử dụng.',
    dap_an_c: 'Ba chân kiềng Dữ liệu, Công nghệ và Con người kết hợp hài hòa, đồng bộ trong một hệ sinh thái thống nhất.',
    dap_an_d: 'Tổ chức áp dụng rập khuôn 100% mô hình của nước ngoài mà không cần điều chỉnh theo văn hóa bản địa.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 2, Mục 2.5 (Trang 23): CĐS thành công khi và chỉ khi dữ liệu, công nghệ và con người kết hợp hài hòa trong hệ sinh thái thống nhất.',
    do_kho: 2
  },
  // Câu mở rộng Boss: Tình huống rào cản văn hóa (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_02_03_07',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tổng giám đốc một công ty sản xuất chi 10 tỷ VNĐ mua phần mềm quản lý ERP hiện đại của Đức, nhưng sau 1 năm nhân viên các bộ phận vẫn lén lút dùng sổ sách ghi tay và Excel riêng vì sợ minh bạch dữ liệu sẽ làm mất quyền lực cá nhân. Lỗi sai cốt tử của ban lãnh đạo ở đây là gì?',
    dap_an_a: 'Chọn phần mềm quá rẻ tiền, cần phải nâng cấp lên phiên bản phần mềm đám mây của Mỹ đắt gấp đôi.',
    dap_an_b: 'Chỉ chú trọng mua sắm công nghệ (động cơ) mà bỏ quên yếu tố con người và văn hóa chia sẻ dữ liệu (người lái), dẫn đến việc kiềng 3 chân bị gãy.',
    dap_an_c: 'Không sa thải ngay lập tức toàn bộ 100% nhân viên cũ để tuyển mới đội ngũ sinh viên mới ra trường.',
    dap_an_d: 'Chính phủ chưa ban hành đủ các văn bản hướng dẫn chi tiết cách thức nhập số liệu vào phần mềm ERP.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Chuyển đổi số thất bại phổ biến nhất là do "ngộ nhận công nghệ": chỉ mua công cụ mà không làm công tác chuyển đổi con người, văn hóa và quản trị thay đổi.',
    do_kho: 4
  },
  // Câu mở rộng Boss: Tình huống Hạ tầng số Make in Vietnam (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_02_03_08',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tại sao trong chiến lược phát triển hạ tầng số quốc gia theo Nghị quyết 03/NQ-CP, Chính phủ Việt Nam lại đặc biệt ưu tiên và khuyến khích các cơ quan nhà nước sử dụng nền tảng Điện toán đám mây "Make in Vietnam" (như Viettel Cloud, VNPT Cloud, CMC Cloud)?',
    dap_an_a: 'Vì các doanh nghiệp công nghệ trong nước tài trợ miễn phí 100% kinh phí sử dụng vĩnh viễn cho nhà nước.',
    dap_an_b: 'Để đảm bảo chủ quyền dữ liệu số quốc gia, tối ưu an toàn an ninh mạng và không bị phụ thuộc vào hạ tầng nước ngoài.',
    dap_an_c: 'Vì các nền tảng quốc tế lớn như AWS hay Microsoft Azure không hỗ trợ giao diện ngôn ngữ tiếng Việt.',
    dap_an_d: 'Để giảm bớt việc phải cử các cán bộ công chức đi đào tạo tập huấn về an toàn thông tin hàng năm.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Hạ tầng số và dữ liệu là huyết mạch quốc gia; dùng Cloud Make in Vietnam giúp bảo đảm an ninh, tuân thủ Luật An ninh mạng và khẳng định chủ quyền dữ liệu số của Việt Nam.',
    do_kho: 4
  },
  // Câu mở rộng Boss: Sắp xếp
  {
    ma_cau_hoi: 'q_cds_02_03_09',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để sắp xếp đúng mối quan hệ phối hợp giữa 3 chủ thể con người trong CĐS:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp quy trình phối hợp giữa các chủ thể:',
      correct_order: [
        'Nhà lãnh đạo xác định tầm nhìn và đặt bài toán đúng',
        'Chuyên gia công nghệ đơn giản hóa và chọn giải pháp',
        'Đội ngũ nhân sự học hỏi và tuân thủ quy trình số mới',
        'Tổ chức đánh giá hiệu quả và hoàn thiện văn hóa số'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Quy trình chuẩn: Lãnh đạo đặt bài toán -> Chuyên gia giải bài toán bằng công nghệ -> Nhân viên thực thi quy trình số -> Tổ chức củng cố văn hóa.',
    do_kho: 3
  },
  // Câu mở rộng Boss: Điền từ
  {
    ma_cau_hoi: 'q_cds_02_03_10',
    ma_moc: 'moc_cds_02_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Nghị quyết 03/NQ-CP đề ra mục tiêu đến năm 2025, 100% số xã trên toàn quốc đều có mạng cáp quang và được phủ sóng mạng {blank}.',
      options: ['di động 4G/5G', 'vệ tinh Starlink', 'quay số dial-up', 'truyền hình cáp'],
      blank_answer: 'di động 4G/5G'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Mục tiêu NQ 03/NQ-CP đến năm 2025: 100% xã có cáp quang và phủ sóng di động 4G/5G.',
    do_kho: 1
  }
];

module.exports = { checkpointsCh2, questionsCh2 };
