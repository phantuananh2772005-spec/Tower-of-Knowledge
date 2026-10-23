/**
 * Dữ liệu Môn Chuyển Đổi Số - Chương 1: Tổng quan về Chuyển đổi số
 * 3 Mốc bài học + 29 Câu hỏi (20 câu gốc trường + 9 câu mở rộng Bloom 3/4, Nối cặp, Sắp xếp, Điền từ)
 * Tuân thủ quy tắc: Câu bẫy dài bằng/hơn câu đúng, đáp án đúng phân bố đều A, B, C, D
 */

const checkpointsCh1 = [
  {
    ma_moc: 'moc_cds_01_01',
    ma_chuong: 'ch_cds_01',
    tieu_de: 'Mốc 1.1: Khái niệm Cốt lõi & Ranh giới Số hóa - Tin học hóa - CĐS',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 1,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Số hóa (Digitization)
- **Khái niệm**: Là quá trình chuyển đổi thông tin, dữ liệu từ dạng vật lý (tài liệu giấy, hình ảnh, âm thanh) sang dạng kỹ thuật số (digital binary 0 và 1) để lưu trữ, tìm kiếm và chia sẻ dễ dàng hơn.
- **Bản chất**: Thay đổi hình thức biểu diễn của dữ liệu, chưa thay đổi quy trình làm việc hay mô hình hoạt động. Dữ liệu số tạo ra chính là "nguyên liệu đầu vào" cho toàn bộ hệ sinh thái số sau này.
- **Ví dụ**: Quét hồ sơ bệnh án giấy sang tệp PDF, nhập sổ sách thủ công vào bảng tính Excel, xuất hóa đơn điện tử thay cho hóa đơn giấy in.

### 2. Tin học hóa (Informatization)
- **Khái niệm**: Là việc ứng dụng công nghệ thông tin (phần mềm, cơ sở dữ liệu, mạng máy tính) để số hóa và tự động hóa các quy trình nghiệp vụ sẵn có nhằm nâng cao năng suất, độ chính xác và giảm chi phí.
- **Bản chất**: Thay đổi công cụ và phương thức làm việc nhưng **giữ nguyên mô hình vận hành và cơ cấu tổ chức**. Là cầu nối trung gian giữa Số hóa và Chuyển đổi số.
- **Ví dụ**: Doanh nghiệp dùng phần mềm kế toán MISA, triển khai hệ thống CRM quản lý khách hàng, trường học dùng cổng thông tin đăng ký tín chỉ trực tuyến.

### 3. Chuyển đổi số (Digital Transformation)
- **Khái niệm**: Quá trình thay đổi tổng thể và toàn diện của cá nhân, tổ chức về cách sống, cách làm việc và phương thức sản xuất dựa trên các công nghệ số.
- **Bản chất**: Tái cấu trúc mô hình hoạt động, đổi mới văn hóa tổ chức, kiến tạo sản phẩm/dịch vụ mới và sinh ra các giá trị kinh doanh mới dựa trên dữ liệu làm trung tâm.
- **Mối quan hệ kế thừa**: **Số hóa** (điều kiện cần, tạo nguyên liệu) $\\rightarrow$ **Tin học hóa** (bước đệm tối ưu quy trình) $\\rightarrow$ **Chuyển đổi số** (đích đến thay đổi mô hình và tạo giá trị mới).`
  },
  {
    ma_moc: 'moc_cds_01_02',
    ma_chuong: 'ch_cds_01',
    tieu_de: 'Mốc 1.2: Ba Làn Sóng 4.0 & Năm Cấp Độ Trưởng Thành Số',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 2,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Ba làn sóng công nghệ trong 30 năm qua
- **Làn sóng 1 (1985 - 1999)**: Gắn liền với máy vi tính để bàn (PC), trọng tâm là "số hóa thông tin" từ giấy sang bản điện tử.
- **Làn sóng 2 (2000 - 2015)**: Gắn với Internet, mạng viễn thông và thiết bị di động, trọng tâm là "tin học hóa quy trình nghiệp vụ".
- **Làn sóng 3 (2015 - 2030)**: Bùng nổ Cách mạng công nghiệp 4.0 với AI, IoT, Big Data, Cloud, Blockchain; đưa toàn bộ hoạt động của xã hội thực lên không gian mạng (Chuyển đổi số).

### 2. Năm cấp độ trưởng thành số của tổ chức
- **Cấp độ 1 - Số hóa dữ liệu (Digitization)**: Chuyển tài liệu vật lý sang tệp số để lưu trữ và tra cứu.
- **Cấp độ 2 - Tin học hóa quy trình (Informatization)**: Dùng các phần mềm riêng lẻ (HRM, kế toán) để tăng năng suất nghiệp vụ.
- **Cấp độ 3 - Tích hợp và kết nối dữ liệu (Integration)**: Đồng bộ các hệ thống thông tin rời rạc thành CSDL tập trung liên thông.
- **Cấp độ 4 - Tổ chức số (Digital Organization)**: Mọi quyết định vận hành đều dựa trên dữ liệu (data-driven), văn hóa làm việc linh hoạt.
- **Cấp độ 5 - Đổi mới và dẫn dắt chuyển đổi số (Digital Transformation Leadership)**: Kiến tạo mô hình kinh doanh số đột phá và dẫn dắt hệ sinh thái.

### 3. Cơ hội và Thách thức khi Chuyển đổi số
- **Cơ hội**: Tăng vọt năng suất, mở rộng thị trường toàn cầu, cá nhân hóa trải nghiệm khách hàng, đổi mới sáng tạo mô hình kinh doanh.
- **Thách thức**: Thiếu hụt kỹ năng số, văn hóa ngại thay đổi, thiếu chiến lược từ lãnh đạo, rủi ro an ninh mạng và chi phí đầu tư ban đầu.`
  },
  {
    ma_moc: 'moc_cds_01_03',
    ma_chuong: 'ch_cds_01',
    tieu_de: 'Mốc 1.3 [BOSS]: Thảm Họa Nokia & Sáng Tạo Phá Hủy',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 3,
    diem_thuong: 35,
    xu_thuong: 30,
    noi_dung_ly_thuyet: `### 1. Khái niệm Sáng tạo phá hủy (Disruptive Innovation)
Sáng tạo phá hủy là sự đổi mới mang tính cách mạng, tạo ra một thị trường và mạng lưới giá trị hoàn toàn mới, làm suy giảm hoặc phá vỡ vị thế thống trị của các doanh nghiệp truyền thống dẫn đầu.

### 2. Case study kinh điển: Thảm họa Nokia vs iPhone/Android
- Năm 2007, Tập đoàn Nokia nắm giữ hơn **50% thị phần điện thoại di động toàn cầu** với dòng máy phím cứng và hệ điều hành Symbian cổ điển.
- Sự ra đời của Apple iPhone (2007) và Google Android (2008) mang đến màn hình cảm ứng điện dung cùng hệ sinh thái ứng dụng trực tuyến App Store / Google Play.
- Nokia chậm trễ trong nhận thức, vẫn coi điện thoại chỉ là thiết bị thoại cơ học thay vì một "nền tảng máy tính bỏ túi đa dịch vụ". Chỉ trong vài năm, thị phần của Nokia rơi tự do xuống dưới 2% và buộc phải bán mảng di động cho Microsoft.

### 3. Case study: Ngân hàng số không chi nhánh (Digital-only Banking)
- Ngân hàng truyền thống cần hàng trăm chi nhánh, trụ sở nguy nga và đội ngũ giao dịch viên thủ công.
- Ngân hàng số (Alipay, Timo, Cake) cho phép mở tài khoản trực tuyến tức thì bằng eKYC, xử lý hàng chục nghìn giao dịch mỗi giây, quản lý hàng trăm tỷ USD tiền gửi mà không cần một chi nhánh vật lý nào.`
  }
];

const questionsCh1 = [
  // ==========================================
  // CHECKPOINT 1.1 (10 câu: 7 câu gốc + 3 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_01_01_01',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khái niệm Số hóa (Digitization) được hiểu chính xác nhất là gì?',
    dap_an_a: 'Ứng dụng công nghệ điện toán đám mây để thay đổi toàn diện mô hình tổ chức và cơ cấu quản lý nhân sự.',
    dap_an_b: 'Chuyển đổi dữ liệu và thông tin từ dạng vật lý sang dạng số nhị phân để thuận tiện lưu trữ và chia sẻ.',
    dap_an_c: 'Tự động hóa hoàn toàn mọi công đoạn trong dây chuyền sản xuất cơ khí và đóng gói hàng hóa.',
    dap_an_d: 'Tái cấu trúc văn hóa doanh nghiệp nhằm thúc đẩy năng lực đổi mới sáng tạo dựa trên nền tảng trí tuệ nhân tạo.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.1 (Trang 1): Số hóa là quá trình chuyển đổi thông tin, dữ liệu từ dạng vật lý sang dạng kỹ thuật số để lưu trữ và chia sẻ.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_01_01_02',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tin học hóa (Informatization) khác biệt căn bản so với Số hóa ở điểm cốt lõi nào?',
    dap_an_a: 'Chỉ dừng lại ở mức quét tài liệu giấy sang định dạng PDF để phục vụ việc gửi nhận email nội bộ hàng ngày.',
    dap_an_b: 'Tập trung vào việc sử dụng CNTT để tự động hóa quy trình nghiệp vụ hiện có nhằm nâng cao hiệu suất làm việc.',
    dap_an_c: 'Hoàn toàn loại bỏ yếu tố con người và không cần sử dụng bất kỳ hệ thống cơ sở dữ liệu điện tử nào.',
    dap_an_d: 'Thay đổi toàn diện chiến lược kinh doanh và kiến tạo các mô hình cung cấp dịch vụ số hoàn toàn mới lạ.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.2 (Trang 1): Tin học hóa là việc ứng dụng CNTT vào hoạt động quản lý, vận hành để tự động hóa quy trình nghiệp vụ sẵn có.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_01_03',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Bản chất thực sự của Chuyển đổi số (Digital Transformation) là quá trình nào sau đây?',
    dap_an_a: 'Mua sắm và lắp đặt hệ thống máy tính để bàn thế hệ mới nhất cho toàn bộ nhân viên văn phòng.',
    dap_an_b: 'Ứng dụng công nghệ số để thay đổi tổng thể mô hình hoạt động, quy trình sản xuất và văn hóa tổ chức.',
    dap_an_c: 'Chỉ đơn thuần lưu trữ dữ liệu kế toán và tài chính lên các dịch vụ đám mây công cộng như Google Drive.',
    dap_an_d: 'Thay thế toàn bộ công nhân đứng máy bằng các cánh tay robot công nghiệp tự động nhập khẩu.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.3 (Trang 2): Chuyển đổi số là quá trình thay đổi tổng thể và toàn diện về cách sống, làm việc và mô hình hoạt động dựa trên công nghệ số.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_01_01_04',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Mối quan hệ phát triển giữa Số hóa, Tin học hóa và Chuyển đổi số được hiểu đúng nhất là:',
    dap_an_a: 'Ba giai đoạn tách rời độc lập, tổ chức có thể thực hiện chuyển đổi số trực tiếp mà không cần có dữ liệu số.',
    dap_an_b: 'Số hóa là bước đầu tạo nguyên liệu, tin học hóa là bước đệm tối ưu, chuyển đổi số là mục tiêu cuối cùng.',
    dap_an_c: 'Tin học hóa là cấp độ cao nhất bao trùm toàn bộ, còn chuyển đổi số chỉ là một phần nhỏ trong tin học hóa.',
    dap_an_d: 'Chuyển đổi số diễn ra trước để định hình tổ chức, sau đó mới quay lại số hóa từng bảng biểu tài liệu giấy.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.4 (Trang 3): Theo Cẩm nang CĐS (Bộ TT&TT, 2021), số hóa là nền tảng, tin học hóa là trung gian, chuyển đổi số là đích đến.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_01_05',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Điểm khác biệt cốt lõi nhất giữa Tin học hóa và Chuyển đổi số nằm ở yếu tố nào?',
    dap_an_a: 'Tin học hóa tập trung vào công cụ tối ưu quy trình cũ, còn chuyển đổi số tập trung vào giá trị mới và đổi mới mô hình.',
    dap_an_b: 'Tin học hóa đòi hỏi nguồn kinh phí khổng lồ từ nhà nước, trong khi chuyển đổi số hoàn toàn không cần vốn đầu tư.',
    dap_an_c: 'Tin học hóa chỉ sử dụng trong các cơ quan nhà nước, còn chuyển đổi số là thuật ngữ độc quyền của doanh nghiệp.',
    dap_an_d: 'Tin học hóa bắt buộc sử dụng trí tuệ nhân tạo, trong khi chuyển đổi số chỉ cần ứng dụng các bảng tính Excel.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.5 (Trang 4): Tin học hóa cải thiện quy trình hiện có, còn chuyển đổi số biến đổi mô hình, hướng tới đổi mới sáng tạo và tạo giá trị mới.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_01_06',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Đâu là sự khác biệt cơ bản về mục tiêu định hướng giữa Tin học hóa và Chuyển đổi số?',
    dap_an_a: 'Tin học hóa nhằm xóa bỏ hoàn toàn máy tính để bàn, chuyển đổi số nhằm thay thế nhân sự bằng phần mềm.',
    dap_an_b: 'Tin học hóa nhằm cải thiện quy trình hiện có, chuyển đổi số nhằm kiến tạo mô hình kinh doanh và dịch vụ mới.',
    dap_an_c: 'Tin học hóa chỉ triển khai cho phòng kỹ thuật CNTT, chuyển đổi số chỉ dành riêng cho phòng tiếp thị marketing.',
    dap_an_d: 'Tin học hóa tạo ra sự thay đổi tổng thể về văn hóa, còn chuyển đổi số chỉ nâng cấp đường truyền Internet.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.5 (Trang 4): Tin học hóa tối ưu quy trình sẵn có; chuyển đổi số tạo ra mô hình vận hành và giá trị kinh doanh mới.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_01_07',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một trường đại học triển khai hệ thống cổng thông tin cho sinh viên đăng ký học phần trực tuyến thay vì nộp phiếu giấy tại phòng đào tạo. Đây là ví dụ tiêu biểu của cấp độ nào?',
    dap_an_a: 'Số hóa dữ liệu thuần túy (Digitization) vì chỉ chuyển đổi hình thức hiển thị danh sách môn học.',
    dap_an_b: 'Chuyển đổi số toàn diện (Digital Transformation) vì đã thay đổi hoàn toàn triết lý giáo dục của nhà trường.',
    dap_an_c: 'Tin học hóa (Informatization) vì ứng dụng phần mềm CNTT để tối ưu và tự động hóa quy trình nghiệp vụ sẵn có.',
    dap_an_d: 'Đổi mới sáng tạo phá hủy (Disruptive Innovation) vì đã loại bỏ hoàn toàn vai trò của giảng viên đứng lớp.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Cổng đăng ký tín chỉ chỉ là việc dùng phần mềm để tự động hóa một quy trình nghiệp vụ đã có từ trước (thay cho phiếu giấy), quy trình đào tạo và mô hình trường học không đổi, do đó đây là Tin học hóa.',
    do_kho: 3
  },
  // Câu mở rộng: Nối cặp
  {
    ma_cau_hoi: 'q_cds_01_01_08',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 khái niệm bên Trái và 1 bản chất tương ứng bên Phải để ghép cặp chính xác:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Số hóa (Digitization)', right: 'Chuyển đổi dữ liệu vật lý sang tệp nhị phân số' },
        { left: 'Tin học hóa (Informatization)', right: 'Ứng dụng phần mềm tự động hóa quy trình sẵn có' },
        { left: 'Chuyển đổi số (Digital Transformation)', right: 'Thay đổi tổng thể mô hình hoạt động và văn hóa' },
        { left: 'Dữ liệu số (Digital Data)', right: 'Nguyên liệu đầu vào của hệ sinh thái số' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác bản chất và vai trò của Số hóa, Tin học hóa và Chuyển đổi số theo Cẩm nang Bộ TT&TT.',
    do_kho: 2
  },
  // Câu mở rộng: Sắp xếp
  {
    ma_cau_hoi: 'q_cds_01_01_09',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ để sắp xếp đúng tiến trình tiến hóa công nghệ tự nhiên:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp chuỗi tiến hóa từ thấp đến cao:',
      correct_order: [
        'Số hóa dữ liệu vật lý',
        'Tin học hóa quy trình nghiệp vụ',
        'Tích hợp và liên thông dữ liệu',
        'Chuyển đổi số toàn diện tổ chức'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Tiến trình chuẩn: Số hóa tạo dữ liệu -> Tin học hóa tự động hóa quy trình -> Tích hợp CSDL liên thông -> Chuyển đổi số toàn diện.',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_01_01_10',
    ma_moc: 'moc_cds_01_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Theo Cẩm nang Chuyển đổi số của Bộ TT&TT, số hóa là nền tảng, tin học hóa là bước đệm, còn chuyển đổi số là {blank} cuối cùng.',
      options: ['mục tiêu', 'công cụ', 'chi phí', 'thách thức'],
      blank_answer: 'mục tiêu'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Chuyển đổi số là đích đến / mục tiêu cuối cùng của toàn bộ tiến trình ứng dụng công nghệ.',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 1.2 (9 câu: 7 câu gốc + 2 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_01_02_01',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tập hợp các công nghệ số tiêu biểu thúc đẩy Cách mạng công nghiệp 4.0 bao gồm:',
    dap_an_a: 'Trí tuệ nhân tạo (AI), Internet vạn vật (IoT), Điện toán đám mây (Cloud) và Dữ liệu lớn (Big Data).',
    dap_an_b: 'Mạng điện thoại cố định có dây, máy fax truyền số liệu và hệ thống tổng đài bưu điện tương tự.',
    dap_an_c: 'Máy in kim văn phòng, máy photocopy laser tốc độ cao và màn hình máy tính huỳnh quang CRT.',
    dap_an_d: 'Động cơ hơi nước áp suất cao, dây chuyền sản xuất cơ khí hàng loạt và máy phát điện xoay chiều.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 1, Mục 1.2.1 (Trang 4, 6): Bốn công nghệ số tiêu biểu cốt lõi của CMCN 4.0 là AI, IoT, Big Data và Cloud Computing.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_01_02_02',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Cuộc Cách mạng công nghiệp lần thứ tư (CMCN 4.0) gắn liền với bước nhảy vọt nào sau đây?',
    dap_an_a: 'Cơ giới hóa nền sản xuất thủ công nhờ vào sự phát minh ra động cơ hơi nước của James Watt.',
    dap_an_b: 'Điện khí hóa các phân xưởng và phát triển dây chuyền sản xuất công nghiệp hàng loạt quy mô lớn.',
    dap_an_c: 'Tự động hóa thông minh dựa trên sự hội tụ giữa thế giới thực và thế giới ảo qua công nghệ số.',
    dap_an_d: 'Thương mại hóa động cơ đốt trong sử dụng nhiên liệu hóa thạch và mở rộng mạng lưới đường sắt.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 1, Mục 1.2.2 (Trang 5): CMCN 4.0 gắn liền với sự phát triển đột phá của tự động hóa thông minh và công nghệ số kết nối thực - ảo.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_01_02_03',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Yếu tố nào sau đây KHÔNG PHẢI là cơ hội mà chuyển đổi số mang lại cho tổ chức doanh nghiệp?',
    dap_an_a: 'Tăng vọt năng suất lao động và tối ưu hóa chi phí vận hành nhờ vào các giải pháp tự động hóa.',
    dap_an_b: 'Mở rộng thị trường kinh doanh xuyên biên giới và tiếp cận khách hàng tiềm năng trên quy mô toàn cầu.',
    dap_an_c: 'Gia tăng mức độ phức tạp quản trị, tăng chi phí vận hành thủ công và làm chậm tốc độ phản ứng.',
    dap_an_d: 'Nâng cao chất lượng trải nghiệm cá nhân hóa và gia tăng tỷ lệ hài lòng trung thành của người tiêu dùng.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 1, Mục 1.5.1 (Trang 9): Gia tăng chi phí và phức tạp quản trị là thách thức hoặc hệ quả tiêu cực khi triển khai sai lầm, không phải cơ hội.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_02_04',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một trong những thách thức hàng đầu đối với các doanh nghiệp Việt Nam khi thực hiện chuyển đổi số là:',
    dap_an_a: 'Sự thiếu hụt trầm trọng nguồn nhân lực chất lượng cao sở hữu kỹ năng số và tư duy đổi mới sáng tạo.',
    dap_an_b: 'Có quá nhiều quỹ đầu tư mạo hiểm quốc tế tranh giành rót vốn hỗ trợ chuyển đổi số miễn phí.',
    dap_an_c: 'Đội ngũ nhân viên quá hào hứng và dễ dàng từ bỏ ngay lập tức mọi thói quen làm việc truyền thống lâu đời.',
    dap_an_d: 'Thị trường không có bất kỳ giải pháp phần mềm hay nhà cung cấp dịch vụ công nghệ số nào hoạt động.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 1, Mục 1.5.2 (Trang 9): Thiếu hụt kỹ năng số và nhân lực công nghệ thông tin là một trong những rào cản lớn nhất.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_02_05',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Chuyển đổi số trong lĩnh vực giáo dục hướng tới mục tiêu cốt lõi nào sau đây?',
    dap_an_a: 'Sa thải toàn bộ đội ngũ giảng viên và thay thế hoàn toàn việc giảng bài bằng các video bài giảng phát lại.',
    dap_an_b: 'Nâng cao chất lượng dạy và học, thúc đẩy học tập suốt đời và cá nhân hóa trải nghiệm cho người học.',
    dap_an_c: 'Hạn chế tối đa việc cho học sinh sinh viên truy cập Internet để tránh xao nhãng bài học trên lớp.',
    dap_an_d: 'Tăng cường in ấn sách giáo khoa giấy số lượng lớn để phân phối về các vùng sâu vùng xa.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.4 (Trang 8): CĐS giáo dục hướng tới nâng cao chất lượng dạy và học, cá nhân hóa lộ trình học và xây dựng xã hội học tập suốt đời.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_02_06',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Doanh nghiệp triển khai phần mềm CRM để tự động hóa quy trình quản lý khách hàng thì thuộc cấp độ nào?',
    dap_an_a: 'Cấp độ 1 - Số hóa dữ liệu (Digitization).',
    dap_an_b: 'Cấp độ 4 - Tổ chức số (Digital Organization).',
    dap_an_c: 'Cấp độ 5 - Dẫn dắt chuyển đổi số (Digital Transformation Leadership).',
    dap_an_d: 'Cấp độ 2 - Tin học hóa quy trình (Informatization).',
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Căn cứ Chương 1, Mục 1.3 (Trang 6): Triển khai các phần mềm nghiệp vụ riêng lẻ (như CRM, ERP, HRM) để tự động hóa một quy trình thuộc Cấp độ 2 - Tin học hóa quy trình.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_02_07',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Cấp độ trưởng thành số cao nhất (Cấp độ 5) đòi hỏi tổ chức, doanh nghiệp phải đạt được năng lực gì?',
    dap_an_a: 'Quét được toàn bộ kho tài liệu lưu trữ cổ xưa sang định dạng tệp PDF có thể tìm kiếm toàn văn.',
    dap_an_b: 'Trang bị máy tính cá nhân có gắn vi xử lý AI mới nhất cho 100% cán bộ công nhân viên.',
    dap_an_c: 'Thuê bao dịch vụ lưu trữ đám mây của nhà cung cấp nước ngoài với dung lượng không giới hạn.',
    dap_an_d: 'Chủ động đổi mới sáng tạo, kiến tạo mô hình kinh doanh số mới và dẫn dắt hệ sinh thái số.',
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Căn cứ Chương 1, Mục 1.3 (Trang 7): Cấp độ 5 (Đổi mới và dẫn dắt CĐS) là cấp độ cao nhất khi tổ chức làm chủ công nghệ, tạo mô hình kinh doanh mới và dẫn dắt thị trường.',
    do_kho: 1
  },
  // Câu mở rộng: Nối cặp 3 làn sóng
  {
    ma_cau_hoi: 'q_cds_01_02_08',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 mốc thời gian bên Trái và 1 đặc trưng công nghệ tương ứng bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Làn sóng 1 (1985 - 1999)', right: 'Số hóa thông tin giấy tờ nhờ máy vi tính PC' },
        { left: 'Làn sóng 2 (2000 - 2015)', right: 'Tin học hóa quy trình nhờ Internet & Di động' },
        { left: 'Làn sóng 3 (2015 - 2030)', right: 'Chuyển đổi số xã hội thực lên mạng với AI/IoT' },
        { left: 'Động lực CMCN 4.0', right: 'Dữ liệu lớn, Điện toán đám mây & Blockchain' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép nối chuẩn xác 3 làn sóng công nghệ trong hơn 30 năm qua theo bài giảng Chương 1.',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_01_02_09',
    ma_moc: 'moc_cds_01_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Trong mô hình 5 cấp độ trưởng thành số, cấp độ 4 là giai đoạn tổ chức trở thành {blank}, nơi mọi quyết định đều dựa trên dữ liệu (data-driven).',
      options: ['tổ chức số', 'xưởng cơ khí', 'cửa hàng ảo', 'trung tâm dữ liệu'],
      blank_answer: 'tổ chức số'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Cấp độ 4 trong mô hình 5 cấp độ trưởng thành số là Tổ chức số (Digital Organization).',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 1.3 [BOSS] (10 câu: 6 câu gốc + 4 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_01_03_01',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Yếu tố nền tảng mang tính chất quyết định sự thành công hay thất bại của một chiến dịch Chuyển đổi số là:',
    dap_an_a: 'Quy mô nguồn vốn ngân sách tài chính khổng lồ dành riêng cho việc mua sắm trang thiết bị ngoại nhập.',
    dap_an_b: 'Văn hóa đổi mới sáng tạo cởi mở và sự quyết tâm, thấu hiểu, năng lực dẫn dắt của con người.',
    dap_an_c: 'Việc sở hữu độc quyền các phần mềm giải pháp mã nguồn đóng đắt đỏ nhất trên thị trường quốc tế.',
    dap_an_d: 'Tốc độ đường truyền cáp quang băng thông rộng kết nối trực tiếp đến các trung tâm dữ liệu ngoài nước.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.5.2 (Trang 10): Con người và văn hóa đổi mới sáng tạo là yếu tố tiên quyết quyết định thành bại của chuyển đổi số.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_03_02',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một công ty du lịch lữ hành quyết định đóng cửa toàn bộ chi nhánh phòng vé vật lý, chuyển dịch hoàn toàn sang mô hình bán tour và chăm sóc khách 24/7 trên ứng dụng di động thông minh. Hành động này phản ánh cấp độ nào?',
    dap_an_a: 'Số hóa dữ liệu (Digitization) vì đã chuyển danh mục giá tour từ tờ rơi giấy sang bảng điện tử.',
    dap_an_b: 'Tin học hóa nội bộ (Informatization) vì chỉ cài thêm phần mềm hỗ trợ nhân viên văn phòng tính tiền.',
    dap_an_c: 'Chuyển đổi số toàn diện (Digital Transformation) vì đã tái cấu trúc hoàn toàn mô hình kinh doanh và phương thức vận hành.',
    dap_an_d: 'Bảo trì hệ thống định kỳ (System Maintenance) vì không có phát sinh thêm sản phẩm hay điểm đến du lịch mới.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 1, Mục 1.3 (Trang 7): Đóng cửa kênh vật lý truyền thống để chuyển đổi hoàn toàn sang mô hình kinh doanh số là bản chất của Chuyển đổi số.',
    do_kho: 3
  },
  {
    ma_cau_hoi: 'q_cds_01_03_03',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Xu hướng "Tích hợp Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)" mang lại giá trị thiết thực nào cho tổ chức?',
    dap_an_a: 'Loại bỏ hoàn toàn sự hiện diện và vai trò đưa ra quyết định của hội đồng quản trị doanh nghiệp.',
    dap_an_b: 'Phân tích dữ liệu lớn để nhận diện hành vi, dự đoán xu hướng tương lai và cá nhân hóa trải nghiệm khách hàng.',
    dap_an_c: 'Bắt buộc tất cả các tài liệu số hóa phải được dịch tự động sang định dạng mã máy nhị phân 0 và 1.',
    dap_an_d: 'Tăng chi phí tuyển dụng thêm hàng nghìn kỹ thuật viên lập trình cho các công việc sao chép văn bản lặp lại.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.4 (Trang 7): AI và ML giúp khai thác Big Data để dự đoán xu hướng và cá nhân hóa sâu sắc trải nghiệm người dùng.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_03_04',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Lợi ích lớn nhất mà công nghệ Điện toán đám mây (Cloud Computing) đem lại cho doanh nghiệp trong chuyển đổi số là:',
    dap_an_a: 'Bắt buộc doanh nghiệp phải mua sắm và duy trì nhiều phòng máy chủ vật lý cồng kềnh với chi phí bảo dưỡng lớn.',
    dap_an_b: 'Hạn chế khả năng truy cập tài nguyên từ xa nhằm ngăn chặn nhân viên làm việc bên ngoài trụ sở công ty.',
    dap_an_c: 'Gia tăng tính linh hoạt, khả năng mở rộng quy mô tính toán tức thì theo nhu cầu và tối ưu chi phí hạ tầng.',
    dap_an_d: 'Đảm bảo dữ liệu chỉ có thể được lưu trữ và sao lưu cục bộ duy nhất trên ổ cứng máy tính xách tay của giám đốc.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 1, Mục 1.4 & Chương 2 Mục 2.2: Cloud mang lại tính linh hoạt cao, mở rộng quy mô tức thì và tiết kiệm chi phí CapEx.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_03_05',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Chuyển đổi số trong khu vực hành chính công và Chính phủ mang lại tác động tích cực nhất là:',
    dap_an_a: 'Làm phát sinh thêm nhiều biểu mẫu giấy tờ và tăng thời gian chờ đợi nhận kết quả thủ tục hành chính.',
    dap_an_b: 'Nâng cao tính công khai, minh bạch, giảm tham nhũng vặt và nâng cao chất lượng phục vụ người dân, doanh nghiệp.',
    dap_an_c: 'Ngừng cung cấp hoàn toàn các dịch vụ công thiết yếu cho các đối tượng người dân không có điện thoại thông minh.',
    dap_an_d: 'Hạn chế việc liên thông và ngăn cấm việc chia sẻ dữ liệu dân cư giữa các bộ ban ngành với nhau.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.4 (Trang 8): Chính phủ số giúp tăng cường minh bạch, hiệu quả điều hành và phục vụ người dân thuận tiện qua dịch vụ công trực tuyến.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_01_03_06',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Theo Cẩm nang của Bộ Thông tin và Truyền thông, yếu tố nào giữ vai trò quyết định sự thành bại của chuyển đổi số?',
    dap_an_a: 'Các công nghệ lõi và thiết bị máy móc hiện đại nhất được nhập khẩu nguyên chiếc từ nước ngoài.',
    dap_an_b: 'Nhận thức, tầm nhìn quyết liệt của người lãnh đạo và năng lực thích ứng, văn hóa của con người.',
    dap_an_c: 'Quy mô diện tích trụ sở văn phòng làm việc và số lượng chi nhánh chi nhánh giao dịch vật lý.',
    dap_an_d: 'Số lượng các ứng dụng phần mềm được cài đặt tràn lan trên máy tính của các phòng ban.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 1, Mục 1.1.3 & 1.5.2 (Trang 2, 10): Bộ TT&TT khẳng định con người và lãnh đạo là yếu tố quyết định thành bại của chuyển đổi số, công nghệ chỉ là công cụ.',
    do_kho: 2
  },
  // Câu mở rộng Boss: Case Nokia (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_01_03_07',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nguyên nhân cốt lõi khiến gã khổng lồ viễn thông Nokia sụp đổ nhanh chóng trước Apple iPhone và Android dù từng chiếm 50% thị phần toàn cầu là gì?',
    dap_an_a: 'Nokia không đủ tiềm lực tài chính để trả lương cho công nhân sản xuất tại các nhà máy ở châu Âu.',
    dap_an_b: 'Nokia coi điện thoại là thiết bị phần cứng thoại cơ học đơn thuần, chậm trễ nhận thức rằng tương lai thuộc về hệ sinh thái phần mềm và nền tảng dịch vụ số.',
    dap_an_c: 'Apple đã sao chép nguyên mẫu kiểu dáng công nghiệp của Nokia nhưng bán với mức giá rẻ hơn một nửa.',
    dap_an_d: 'Chính phủ Phần Lan ra quy định cấm các tập đoàn công nghệ trong nước xuất khẩu điện thoại di động.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Nokia thất bại vì không kịp nhận ra quy luật Sáng tạo phá hủy (Disruptive Innovation): Apple định nghĩa lại điện thoại thành một nền tảng dịch vụ số kết hợp kho ứng dụng App Store, trong khi Nokia vẫn trung thành với bàn phím cơ và hệ điều hành đóng Symbian.',
    do_kho: 4
  },
  // Câu mở rộng Boss: Case Highlands Coffee (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_01_03_08',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một chuỗi cà phê in mã QR dán tại bàn để khách quét xem menu ảnh chụp dạng PDF. Một chuỗi cà phê khác phát triển siêu ứng dụng (App) tích hợp định danh, tích điểm theo hành vi, đề xuất đồ uống theo thời tiết và tự động giao hàng tận nơi. Nhận định nào sau đây là chính xác?',
    dap_an_a: 'Cả hai chuỗi cà phê trên đều đã hoàn tất quá trình Chuyển đổi số toàn diện theo chuẩn quốc tế.',
    dap_an_b: 'Chuỗi thứ nhất chỉ dừng lại ở mức Số hóa thông tin (Digitization), trong khi chuỗi thứ hai đang thực hiện Chuyển đổi số (Digital Transformation).',
    dap_an_c: 'Chuỗi thứ nhất là Tin học hóa cao cấp, còn chuỗi thứ hai chỉ là một thử nghiệm tiếp thị truyền thông ngắn hạn.',
    dap_an_d: 'Chuỗi thứ hai gây lãng phí chi phí vô ích vì việc in mã QR xem PDF đã đáp ứng 100% nhu cầu người dùng.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Quét mã QR xem menu ảnh PDF chỉ là Số hóa hình thức biểu diễn (Digitization). Còn chuỗi thứ hai thay đổi trải nghiệm, mô hình bán hàng O2O và khai thác dữ liệu để cá nhân hóa, đó là Chuyển đổi số.',
    do_kho: 4
  },
  // Câu mở rộng Boss: Sắp xếp
  {
    ma_cau_hoi: 'q_cds_01_03_09',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để sắp xếp đúng chuỗi nguyên nhân - kết quả trong thảm họa sụp đổ của Nokia:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp diễn biến thất bại của Nokia:',
      correct_order: [
        'Nokia thống trị 50% thị phần điện thoại toàn cầu',
        'Apple ra mắt iPhone với màn hình cảm ứng và App Store',
        'Nokia chậm trễ thay đổi vì bám giữ hệ điều hành Symbian cũ',
        'Thị phần Nokia sụt giảm dưới 2% và bị thâu tóm'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Trình tự lịch sử minh chứng cho sự Sáng tạo phá hủy của công nghệ số đối với tập đoàn bảo thủ.',
    do_kho: 3
  },
  // Câu mở rộng Boss: Điền từ
  {
    ma_cau_hoi: 'q_cds_01_03_10',
    ma_moc: 'moc_cds_01_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Sự ra đời của iPhone và Android tạo nên hiện tượng {blank}, làm thay đổi hoàn toàn trật tự ngành công nghiệp di động thế giới.',
      options: ['sáng tạo phá hủy', 'tin học hóa quy trình', 'bảo trì phần mềm', 'cải tiến tuần tự'],
      blank_answer: 'sáng tạo phá hủy'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Disruptive Innovation dịch chuẩn là Sáng tạo phá hủy.',
    do_kho: 2
  }
];

module.exports = { checkpointsCh1, questionsCh1 };
