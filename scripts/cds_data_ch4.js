/**
 * Dữ liệu Môn Chuyển Đổi Số - Chương 4: Các công nghệ trong Chuyển đổi số
 * 3 Mốc bài học + 29 Câu hỏi (20 câu gốc từ giáo trình trang 55-58 + 9 câu mở rộng)
 * Tuân thủ quy tắc: Câu bẫy dài bằng/hơn câu đúng, đáp án đúng phân bố đều A, B, C, D
 */

const checkpointsCh4 = [
  {
    ma_moc: 'moc_cds_04_01',
    ma_chuong: 'ch_cds_04',
    tieu_de: 'Mốc 4.1: Trí Tuệ Nhân Tạo & Điện Toán Đám Mây Make In Vietnam',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 1,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)
- **Trong y tế**: AI phân tích hình ảnh y khoa chẩn đoán chính xác hơn và phát hiện sớm các bệnh hiểm nghèo. Tiêu biểu tại Việt Nam là nền tảng **DrAid™ của VinBrain** ứng dụng AI phân tích ảnh chụp X-quang để phát hiện hàng chục bệnh lý phổi và ung thư.
- **Trong giáo dục**: AI giúp cá nhân hóa lộ trình học tập, tiêu biểu như ứng dụng học ngôn ngữ **Duolingo** dùng AI để tự động phân tích điểm yếu và gợi ý bài học phù hợp cho từng cá nhân.
- **Trong ngân hàng & tài chính**: AI tự động hóa quy trình nghiệp vụ, nhận diện hành vi bất thường và phát hiện các giao dịch gian lận thẻ tín dụng trong mili-giây.

### 2. Điện toán đám mây (Cloud Computing)
- **Lợi ích cốt lõi**: Khả năng triển khai dịch vụ cực nhanh, linh hoạt mở rộng quy mô tính toán tức thì theo lượng truy cập và tối ưu chi phí hạ tầng.
- **Trường hợp điển hình**: **Netflix** sử dụng hạ tầng Cloud để lưu trữ kho phim khổng lồ và phát trực tuyến (streaming) mượt mà cho hàng trăm triệu người dùng trên toàn cầu cùng lúc.
- **Hạ tầng Cloud "Make in Vietnam"**: Để bảo đảm an toàn an ninh mạng và chủ quyền dữ liệu số quốc gia, Việt Nam đã xây dựng 4 nền tảng Cloud lớn đạt chuẩn quốc tế: **VNPT Cloud, Viettel Cloud, CMC Cloud và FPT Cloud**.`
  },
  {
    ma_moc: 'moc_cds_04_02',
    ma_chuong: 'ch_cds_04',
    tieu_de: 'Mốc 4.2: Dữ Liệu Lớn Thương Mại Điện Tử & IoT VNPT SmartAgri',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 2,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Dữ liệu lớn (Big Data)
- **Khác biệt cốt lõi**: Khối lượng cực lớn (Volume), đa dạng nhiều định dạng có cấu trúc và phi cấu trúc (Variety), và tốc độ sinh ra cập nhật theo thời gian thực rất nhanh (Velocity).
- **Ứng dụng thương mại điện tử**: Các sàn như **Tiki, Shopee, Lazada** phân tích lịch sử duyệt web, giỏ hàng để gợi ý sản phẩm cá nhân hóa và dự đoán xu hướng tiêu dùng theo mùa.
- **Cơ sở dữ liệu quốc gia về dân cư**: Ví dụ điển hình của Big Data trong khu vực công tại Việt Nam, quản lý thông tin của gần 100 triệu người dân, liên thông giải quyết thủ tục hành chính.

### 2. Internet vạn vật (IoT) trong Đời sống & Nông nghiệp
- **Khái niệm**: Mạng lưới các thiết bị, máy móc có gắn cảm biến kết nối Internet để tự động thu thập và trao đổi dữ liệu mà không cần con người can thiệp trực tiếp.
- **Nhà thông minh (Smart Home)**: Điều khiển đèn, rèm cửa, điều hòa nhiệt độ từ xa hoặc qua khẩu lệnh giọng nói.
- **Nông nghiệp thông minh (Smart Agriculture)**: Nền tảng **VNPT SmartAgri** sử dụng mạng cảm biến IoT đo độ ẩm đất, độ ẩm không khí, nồng độ pH/EC để tự động kích hoạt hệ thống tưới tiêu và cảnh báo sâu bệnh kịp thời.`
  },
  {
    ma_moc: 'moc_cds_04_03',
    ma_chuong: 'ch_cds_04',
    tieu_de: 'Mốc 4.3 [BOSS]: Blockchain TPBank & Chống Giả Mạo Văn Bằng',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 3,
    diem_thuong: 35,
    xu_thuong: 30,
    noi_dung_ly_thuyet: `### 1. Công nghệ Chuỗi khối (Blockchain)
- **Đặc tính kỹ thuật**: Sổ cái phân tán (Distributed Ledger), phi tập trung, mã hóa bảo mật bằng thuật toán mật mã học và **tính bất biến** (dữ liệu một khi đã ghi vào khối thì cực kỳ khó hoặc không thể bị sửa đổi hay làm giả).

### 2. Các ứng dụng thực tế đột phá của Blockchain
- **Truy xuất nguồn gốc nông sản**: Ghi nhận bất biến toàn bộ hành trình từ gieo hạt, bón phân, thu hoạch đến đóng gói vận chuyển. Người tiêu dùng chỉ cần quét mã QR là biết rõ toàn bộ chuỗi cung ứng minh bạch.
- **Chống gian lận bằng cấp (Education Credentialing)**: Các viện đại học hàng đầu như **MIT và Harvard** đã ứng dụng Blockchain để phát hành văn bằng, chứng chỉ số bất biến, giúp nhà tuyển dụng xác thực tức thì và loại bỏ hoàn toàn nạn bằng giả.
- **Tài chính - Ngân hàng**: Tại Việt Nam, **TPBank** là ngân hàng tiên phong ứng dụng công nghệ Blockchain (qua mạng lưới liên ngân hàng quốc tế RippleNet) giúp chuyển tiền quốc tế an toàn, minh bạch và hoàn tất chỉ trong vài phút thay vì nhiều ngày.`
  }
];

const questionsCh4 = [
  // ==========================================
  // CHECKPOINT 4.1 (10 câu: 7 câu gốc + 3 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_04_01_01',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trí tuệ nhân tạo (AI) trong lĩnh vực y tế giúp mang lại lợi ích chính nào sau đây?',
    dap_an_a: 'Làm gia tăng đáng kể thời gian chờ đợi khám chữa bệnh của bệnh nhân tại các phòng khám chuyên khoa.',
    dap_an_b: 'Hỗ trợ bác sĩ chẩn đoán chính xác hơn, phát hiện sớm các tổn thương bệnh lý nguy hiểm và cá nhân hóa phác đồ điều trị.',
    dap_an_c: 'Làm suy giảm nghiêm trọng khả năng tổng hợp và phân tích dữ liệu lâm sàng của các thiết bị y tế hiện đại.',
    dap_an_d: 'Sa thải toàn bộ đội ngũ y bác sĩ, điều dưỡng để thay thế hoàn toàn bằng các hệ thống rô-bốt tự phẫu thuật.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 1, Bài tập Chương 4 (Trang 55): AI trong y tế giúp chẩn đoán chính xác hơn và phát hiện bệnh sớm.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_01_02',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Hệ thống DrAid™ do công ty VinBrain (Việt Nam) phát triển chủ yếu được ứng dụng trong công việc gì?',
    dap_an_a: 'Tự động dịch thuật các văn bản ngoại giao đa ngôn ngữ phục vụ cho các hội nghị quốc tế của chính phủ.',
    dap_an_b: 'Phân tích hình ảnh X-quang y tế ứng dụng AI để phát hiện chính xác hàng chục bệnh lý phổi, tim và ung thư.',
    dap_an_c: 'Tạo lập các mô hình dự báo thời tiết dài hạn và cảnh báo sớm hiện tượng bão lũ thiên tai phức tạp.',
    dap_an_d: 'Quản lý việc thu thuế giá trị gia tăng và theo dõi việc kê khai tài sản của các doanh nghiệp kinh doanh.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 2, Bài tập Chương 4 (Trang 55): DrAid™ của VinBrain chủ yếu dùng để phân tích X-quang phát hiện nhiều bệnh lý.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_01_03',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ứng dụng Trí tuệ nhân tạo (AI) trong lĩnh vực tài chính - ngân hàng mang lại giá trị nào sau đây?',
    dap_an_a: 'Tự động hóa các quy trình nghiệp vụ thẩm định tín dụng, phát hiện gian lận giao dịch và hỗ trợ khách hàng qua Chatbot 24/7.',
    dap_an_b: 'Tăng mức phí duy trì tài khoản hàng tháng và tăng phí rút tiền mặt tại các cây ATM ngân hàng.',
    dap_an_c: 'Làm suy giảm tính bảo mật dữ liệu tài khoản và khiến các giao dịch chuyển tiền bị gián đoạn thường xuyên.',
    dap_an_d: 'Sa thải toàn bộ nhân viên giao dịch viên và đóng cửa hoàn toàn các trụ sở ngân hàng trên toàn quốc.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 3, Bài tập Chương 4 (Trang 55): AI trong ngân hàng giúp tự động hóa quy trình, phát hiện gian lận.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_01_04',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ứng dụng học ngoại ngữ nổi tiếng Duolingo sử dụng Trí tuệ nhân tạo (AI) nhằm mục đích gì?',
    dap_an_a: 'Theo dõi chỉ số nhịp tim và đếm số bước chân vận động hàng ngày của người học trên điện thoại.',
    dap_an_b: 'Phân tích trình độ, phát hiện điểm yếu ngữ pháp và tự động gợi ý bài học cá nhân hóa phù hợp cho từng người dùng.',
    dap_an_c: 'Điều phối hệ thống đèn tín hiệu giao thông thông minh tại các ngã tư đô thị lớn vào giờ cao điểm.',
    dap_an_d: 'Dự báo biến động giá cổ phiếu và tỷ giá hối đoái của các ngân hàng thương mại trên thế giới.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 4, Bài tập Chương 4 (Trang 55): Duolingo sử dụng AI để gợi ý bài học phù hợp từng cá nhân.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_01_05',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Điểm mạnh nổi bật và mang tính quyết định của công nghệ Điện toán đám mây (Cloud Computing) là:',
    dap_an_a: 'Tốc độ truy cập tài nguyên dữ liệu luôn bị giới hạn chậm hơn nhiều so với việc lưu trữ trên ổ đĩa mềm.',
    dap_an_b: 'Hệ thống có cấu trúc đóng kín mít, cực kỳ khó khăn hoặc không thể mở rộng quy mô khi lượng người dùng tăng.',
    dap_an_c: 'Khả năng triển khai nhanh chóng, linh hoạt mở rộng quy mô tính toán tức thì theo nhu cầu và tiết kiệm chi phí đầu tư.',
    dap_an_d: 'Bắt buộc doanh nghiệp phải mua sắm và tự bảo trì hàng trăm máy chủ vật lý đắt đỏ tại trụ sở công ty.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Câu 5, Bài tập Chương 4 (Trang 55): Điểm mạnh nổi bật của Cloud là triển khai nhanh, linh hoạt, tiết kiệm chi phí.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_01_06',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tập đoàn giải trí trực tuyến Netflix sử dụng nền tảng Điện toán đám mây (Cloud Computing) để làm gì?',
    dap_an_a: 'Lưu trữ kho nội dung video khổng lồ và phát trực tuyến (streaming) mượt mà cho hàng trăm triệu người dùng trên toàn cầu.',
    dap_an_b: 'Sản xuất và in ấn sách giáo khoa giấy để phát hành miễn phí cho các thư viện trường học vùng sâu.',
    dap_an_c: 'Quản lý việc cấp phát giấy chứng nhận quyền sử dụng đất và cấp sổ đỏ cho người dân tại các đô thị.',
    dap_an_d: 'Điều khiển các cánh tay robot cơ khí tự động trong các nhà máy lắp ráp xe ô tô điện thể thao.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 6, Bài tập Chương 4 (Trang 55): Netflix sử dụng nền tảng Cloud để lưu trữ video và phát trực tuyến cho hàng triệu người dùng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_01_07',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ở Việt Nam, nhóm các nền tảng Điện toán đám mây "Make in Vietnam" tiêu biểu được sử dụng rộng rãi gồm:',
    dap_an_a: 'VNPT Cloud, Viettel Cloud, CMC Cloud và FPT Cloud.',
    dap_an_b: 'Tiktok Cloud, Youtube Cloud, Twitter Cloud và Instagram Cloud.',
    dap_an_c: 'OnlyFans Cloud, Bigo Cloud, Kuaishou Cloud và Douyin Cloud.',
    dap_an_d: 'Alibaba Cloud EU, Baidu Cloud China, Naver Cloud Korea và Tencent Cloud.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 7, Bài tập Chương 4 (Trang 56): Nền tảng Cloud Make in Vietnam gồm: VNPT Cloud, Viettel Cloud, CMC Cloud, FPT Cloud.',
    do_kho: 1
  },
  // Câu mở rộng: Nối cặp Cloud & AI
  {
    ma_cau_hoi: 'q_cds_04_01_08',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 sản phẩm/nền tảng công nghệ bên Trái và ứng dụng thực tế bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'DrAid™ (VinBrain)', right: 'AI phân tích X-quang phát hiện tổn thương phổi' },
        { left: 'Duolingo AI', right: 'Gợi ý bài tập ngữ pháp cá nhân hóa cho người học' },
        { left: 'Netflix Cloud', right: 'Streaming video chất lượng cao cho hàng triệu người' },
        { left: 'Viettel / VNPT Cloud', right: 'Hạ tầng đám mây Make in Vietnam bảo vệ dữ liệu' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác các case study thực tế về AI và Cloud Computing tiêu biểu trong nước và quốc tế.',
    do_kho: 2
  },
  // Câu mở rộng: Sắp xếp
  {
    ma_cau_hoi: 'q_cds_04_01_09',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ để sắp xếp đúng các mô hình dịch vụ Điện toán đám mây theo mức độ kiểm soát của người dùng:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp mô hình Cloud từ quản lý nhiều đến ít:',
      correct_order: [
        'On-Premises (Tự quản trị 100% phần cứng & phần mềm)',
        'IaaS - Hạ tầng như một dịch vụ (Thuê máy chủ & mạng)',
        'PaaS - Nền tảng như một dịch vụ (Thuê môi trường lập trình)',
        'SaaS - Phần mềm như một dịch vụ (Chỉ sử dụng ứng dụng web)'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Trình tự quản lý: On-Premises (tự quản lý hết) -> IaaS -> PaaS -> SaaS (nhà cung cấp quản lý hết).',
    do_kho: 3
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_04_01_10',
    ma_moc: 'moc_cds_04_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn tên sản phẩm thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Nền tảng {blank} do VinBrain phát triển là sản phẩm y tế ứng dụng AI đạt chuẩn FDA Hoa Kỳ, hỗ trợ chẩn đoán hình ảnh X-quang phổi tại nhiều bệnh viện lớn ở Việt Nam.',
      options: ['DrAid™', 'VNPT SmartAgri', 'eCabinet', 'TPBank Blockchain'],
      blank_answer: 'DrAid™'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'DrAid™ của VinBrain là giải pháp AI phân tích X-quang hàng đầu của Việt Nam.',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 4.2 (9 câu: 7 câu gốc + 2 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_04_02_01',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ứng dụng Điện toán đám mây (Cloud) trong lĩnh vực giáo dục và đào tạo đem lại lợi ích nào?',
    dap_an_a: 'Làm giảm sút khả năng tham gia học tập trực tuyến của sinh viên ở các vùng ngoại thành.',
    dap_an_b: 'Lưu trữ học liệu số tập trung, hỗ trợ học và thi trực tuyến ổn định, kết nối mọi lúc mọi nơi.',
    dap_an_c: 'Chỉ hỗ trợ cho giảng viên lưu giáo án và hoàn toàn không cho phép sinh viên tra cứu tài liệu.',
    dap_an_d: 'Làm tăng vọt chi phí xây dựng phòng học truyền thống và tăng ngân sách mua bảng phấn.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 8, Bài tập Chương 4 (Trang 56): Cloud trong giáo dục giúp lưu trữ học liệu, học và thi trực tuyến ổn định.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_02_02',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Dữ liệu lớn (Big Data) khác biệt căn bản so với dữ liệu truyền thống ở những đặc tính nào sau đây?',
    dap_an_a: 'Hoàn toàn không thể lưu trữ được trên bất kỳ thiết bị đĩa cứng điện tử hiện đại nào.',
    dap_an_b: 'Khối lượng dữ liệu cực lớn, cấu trúc đa dạng nhiều loại và tốc độ sinh ra cập nhật rất nhanh.',
    dap_an_c: 'Luôn luôn chứa các thông tin sai lệch vô giá trị và không thể phân tích được.',
    dap_an_d: 'Chỉ có thể tồn tại dưới dạng văn bản viết tay truyền thống trên các trang sách cổ xưa.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 9, Bài tập Chương 4 (Trang 56): Big Data khác dữ liệu truyền thống ở 3 đặc trưng (3Vs): Volume, Variety, Velocity.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_02_03',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ứng dụng phân tích Dữ liệu lớn (Big Data) trong thương mại điện tử giúp doanh nghiệp làm gì?',
    dap_an_a: 'Làm giảm sự hài lòng và gia tăng tỷ lệ khiếu nại đổi trả hàng hóa của người tiêu dùng.',
    dap_an_b: 'Phân tích sở thích, lịch sử mua hàng để tự động gợi ý sản phẩm phù hợp cho từng cá nhân khách hàng.',
    dap_an_c: 'Chỉ lưu trữ duy nhất các tập tin hình ảnh sản phẩm mà không lưu thông tin giá cả.',
    dap_an_d: 'Làm mất hoàn toàn khả năng dự đoán nhu cầu tiêu dùng của thị trường trong các dịp lễ tết.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 10, Bài tập Chương 4 (Trang 56): Big Data trong TMĐT giúp phân tích hành vi và gợi ý sản phẩm cá nhân hóa.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_02_04',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Hệ thống Cơ sở dữ liệu quốc gia về dân cư ở Việt Nam là một ví dụ điển hình về Big Data phục vụ mục đích gì?',
    dap_an_a: 'Theo dõi diễn biến dự báo thời tiết và lượng mưa hàng ngày tại các trạm khí tượng thủy văn.',
    dap_an_b: 'Quản lý thông tin định danh công dân tập trung, phục vụ giải quyết thủ tục hành chính toàn diện.',
    dap_an_c: 'Kiểm tra chất lượng và thời hạn sử dụng của các sản phẩm thực phẩm đông lạnh nhập khẩu.',
    dap_an_d: 'Dự báo doanh số bán hàng của các sàn thương mại điện tử quốc tế trên thị trường nội địa.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 11, Bài tập Chương 4 (Trang 56): CSDL quốc gia về dân cư ở Việt Nam là ví dụ Big Data quản lý thông tin người dân toàn quốc.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_02_05',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Các doanh nghiệp thương mại điện tử hàng đầu như Tiki hay Shopee khai thác Dữ liệu lớn (Big Data) để làm gì?',
    dap_an_a: 'Gợi ý sản phẩm phù hợp theo sở thích cá nhân, tối ưu chuỗi cung ứng và dự đoán xu hướng tiêu dùng.',
    dap_an_b: 'Tự động tăng giá sản phẩm một cách ngẫu nhiên nhằm làm khó người tiêu dùng khi thanh toán.',
    dap_an_c: 'Xóa sạch toàn bộ lịch sử mua sắm của khách hàng ngay sau khi họ đóng ứng dụng mua hàng.',
    dap_an_d: 'Chỉ phục vụ duy nhất cho việc kiểm kê đếm số lượng thùng hàng nằm trong kho bãi.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 12, Bài tập Chương 4 (Trang 56): Doanh nghiệp như Tiki, Shopee dùng Big Data để gợi ý sản phẩm, dự đoán xu hướng tiêu dùng.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_02_06',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Internet vạn vật (Internet of Things - IoT) được hiểu là công nghệ cho phép điều gì?',
    dap_an_a: 'Các thiết bị vật lý kết nối mạng Internet, tự động thu thập và trao đổi dữ liệu với nhau thời gian thực.',
    dap_an_b: 'Các máy móc công nghiệp hoạt động hoàn toàn độc lập mà không cần bất kỳ tín hiệu dữ liệu nào.',
    dap_an_c: 'Làm suy giảm khả năng tự động hóa và bắt buộc phải có người túc trực điều khiển công tắc tay.',
    dap_an_d: 'Chỉ có thể kết nối được các bóng đèn sợi đốt trong phòng ngủ gia đình.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 13, Bài tập Chương 4 (Trang 56-57): IoT là công nghệ cho phép các thiết bị kết nối Internet và trao đổi dữ liệu.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_02_07',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một ví dụ tiêu biểu và rõ nét nhất của việc ứng dụng công nghệ IoT trong nông nghiệp thông minh là:',
    dap_an_a: 'Lắp đặt các camera giám sát tốc độ phương tiện trên đường cao tốc liên tỉnh.',
    dap_an_b: 'Hệ thống cảm biến đo độ ẩm đất, nhiệt độ và tự động kích hoạt van tưới tiêu chính xác theo nhu cầu cây trồng.',
    dap_an_c: 'Sử dụng máy in laser văn phòng để in ấn các báo cáo thống kê sản lượng cây vụ đông.',
    dap_an_d: 'Trang bị máy tính để bàn có kết nối mạng LAN cho các thủ kho bảo quản phân bón hóa học.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 14, Bài tập Chương 4 (Trang 57): Ví dụ tiêu biểu của IoT nông nghiệp là cảm biến đo độ ẩm và tự động tưới tiêu.',
    do_kho: 1
  },
  // Câu mở rộng: Nối cặp IoT & Smart Home
  {
    ma_cau_hoi: 'q_cds_04_02_08',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 lĩnh vực ứng dụng IoT bên Trái và ví dụ tiêu biểu bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Nhà thông minh (Smart Home)', right: 'Điều khiển đèn, máy lạnh từ xa hoặc qua giọng nói' },
        { left: 'Nông nghiệp thông minh', right: 'VNPT SmartAgri cảm biến độ ẩm tự động tưới tiêu' },
        { left: 'Logistics thông minh', right: 'Cảm biến RFID theo dõi vị trí và nhiệt độ xe lạnh' },
        { left: 'Đô thị thông minh (Smart City)', right: 'Camera AI phát hiện ùn tắc và điều phối đèn giao thông' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác các ứng dụng thực tế phong phú của IoT trong các lĩnh vực kinh tế - xã hội.',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_04_02_09',
    ma_moc: 'moc_cds_04_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn tên giải pháp thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Tại Việt Nam, giải pháp {blank} của tập đoàn VNPT là nền tảng nông nghiệp thông minh ứng dụng mạng cảm biến IoT để giám sát vi khí hậu nhà màng và điều khiển tưới nhỏ giọt tự động.',
      options: ['VNPT SmartAgri', 'VNPT eCabinet', 'DrAid™ VinBrain', 'Tiki AI'],
      blank_answer: 'VNPT SmartAgri'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'VNPT SmartAgri là giải pháp IoT nông nghiệp thông minh tiêu biểu tại Việt Nam.',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 4.3 [BOSS] (10 câu: 6 câu gốc + 4 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_04_03_01',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Giải pháp nhà thông minh (Smart Home) ứng dụng công nghệ IoT cho phép người dùng:',
    dap_an_a: 'Điều khiển bật tắt các thiết bị điện tử, chiếu sáng, khóa cửa từ xa hoặc thông qua trợ lý ảo giọng nói.',
    dap_an_b: 'Bắt buộc phải viết tin nhắn giấy thủ công gửi qua bưu điện để yêu cầu bật điều hòa không khí.',
    dap_an_c: 'Không thể kiểm soát hoặc theo dõi trạng thái thiết bị khi người dùng đi ra khỏi ngôi nhà.',
    dap_an_d: 'Làm hỏng toàn bộ các thiết bị gia dụng và gây đoản mạch hệ thống điện lưới trong nhà.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 15, Bài tập Chương 4 (Trang 57): Ứng dụng IoT trong Smart Home gồm điều khiển thiết bị bằng giọng nói hoặc từ xa qua ứng dụng.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_03_02',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nền tảng VNPT SmartAgri được phát triển tại Việt Nam mang lại công năng chính nào cho người nông dân?',
    dap_an_a: 'Điều khiển tự động các dòng xe ô tô tải tự lái trên đường cao tốc Bắc Nam.',
    dap_an_b: 'Giám sát trang trại theo thời gian thực thông qua mạng cảm biến IoT đo độ ẩm, nhiệt độ và dinh dưỡng.',
    dap_an_c: 'Quản lý hồ sơ bệnh án điện tử và điều phối xe cấp cứu tại các bệnh viện trung ương.',
    dap_an_d: 'Tự động tính lương và xuất hóa đơn thuế giá trị gia tăng cho các nhà máy dệt may.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 16, Bài tập Chương 4 (Trang 57): Tại Việt Nam, VNPT SmartAgri giúp giám sát nông trại qua cảm biến IoT.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_03_03',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Đặc điểm kỹ thuật ưu việt nhất khiến công nghệ Blockchain trở nên đáng tin cậy trong các giao dịch số là:',
    dap_an_a: 'Dữ liệu lưu trữ tập trung tại một máy tính cá nhân nên bất kỳ ai cũng có thể tùy ý sửa đổi dễ dàng.',
    dap_an_b: 'Tính chất phân tán phi tập trung, mã hóa bảo mật cao và dữ liệu có tính bất biến, cực kỳ khó làm giả.',
    dap_an_c: 'Hệ thống hoàn toàn chỉ phục vụ cho việc giải trí chơi game trực tuyến và không có giá trị thương mại.',
    dap_an_d: 'Không hỗ trợ việc lưu trữ hay kiểm tra đối chiếu lịch sử của bất kỳ giao dịch chuyển khoản nào.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 17, Bài tập Chương 4 (Trang 57): Công nghệ Blockchain có đặc điểm nổi bật là phi tập trung, minh bạch và khó làm giả.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_03_04',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Ứng dụng công nghệ Blockchain trong việc truy xuất nguồn gốc nông sản mang lại lợi ích thiết thực nào?',
    dap_an_a: 'Làm giá thành xuất xưởng của các loại rau củ tăng lên gấp mười lần so với giá thị trường.',
    dap_an_b: 'Lưu trữ bất biến, minh bạch thông tin toàn bộ chuỗi sản xuất, vận chuyển từ nông trại đến bàn ăn của người tiêu dùng.',
    dap_an_c: 'Ẩn giấu hoàn toàn danh tính của nhà sản xuất để người tiêu dùng không thể khiếu nại chất lượng.',
    dap_an_d: 'Chỉ có thể áp dụng cho các loại trái cây nhiệt đới xuất khẩu và không thể dùng cho các nông sản khác.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 18, Bài tập Chương 4 (Trang 57): Blockchain truy xuất nguồn gốc giúp lưu trữ thông tin toàn bộ chuỗi sản xuất - vận chuyển một cách minh bạch, chống gian lận.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_04_03_05',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Các viện đại học danh tiếng hàng đầu thế giới như MIT và Harvard đã ứng dụng công nghệ Blockchain vào mục đích gì?',
    dap_an_a: 'Cấp phát và xác thực văn bằng, chứng chỉ số nhằm chống gian lận và loại bỏ triệt để nạn làm bằng giả.',
    dap_an_b: 'Phát hành các bộ sưu tập tranh ảnh kỹ thuật số NFT để bán đấu giá gây quỹ từ thiện.',
    dap_an_c: 'Quản lý vị trí đỗ xe của sinh viên trong khuôn viên ký túc xá vào các buổi tối cuối tuần.',
    dap_an_d: 'Tự động điều phối các chuyến xe buýt đưa đón học sinh sinh viên đến các giảng đường.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Câu 19, Bài tập Chương 4 (Trang 57): MIT và Harvard dùng Blockchain để chống gian lận trong chứng chỉ và bằng cấp.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_04_03_06',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tại Việt Nam, ngân hàng Tiên Phong (TPBank) đã tiên phong ứng dụng công nghệ Blockchain chủ yếu vào dịch vụ nào?',
    dap_an_a: 'Phát hành tiền ảo và các đồng token kỹ thuật số không có tài sản bảo đảm trên thị trường tự do.',
    dap_an_b: 'Chuyển tiền quốc tế hai chiều an toàn, minh bạch với tốc độ cao tính bằng phút thông qua mạng liên ngân hàng.',
    dap_an_c: 'Điểm danh nhận diện khuôn mặt sinh viên tại các cổng trường đại học thành viên liên kết.',
    dap_an_d: 'Điều khiển hệ thống thiết bị cảm biến nhiệt độ tại các cây ATM rút tiền ngoài mặt phố.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Câu 20, Bài tập Chương 4 (Trang 58): TPBank sử dụng Blockchain chủ yếu để chuyển tiền quốc tế nhanh và an toàn qua mạng RippleNet.',
    do_kho: 1
  },
  // Câu mở rộng Boss: Tình huống tích hợp IoT + Blockchain trong xuất khẩu thanh long (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_04_03_07',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một hợp tác xã xuất khẩu thanh long tại Bình Thuận muốn xuất khẩu sang thị trường khó tính châu Âu (EU). EU yêu cầu chứng minh nhiệt độ bảo quản trong thùng xe lạnh luôn duy trì từ 2°C đến 5°C trong suốt 15 ngày vận chuyển biển và không thể bị tài xế gian lận tắt máy lạnh để tiết kiệm dầu. Giải pháp công nghệ số kết hợp hoàn hảo nhất là gì?',
    dap_an_a: 'Yêu cầu tài xế chụp ảnh nhiệt kế bằng điện thoại mỗi giờ rồi gửi tin nhắn Zalo về cho ban giám đốc.',
    dap_an_b: 'Trang bị cảm biến nhiệt độ IoT gắn trong thùng lạnh tự động gửi dữ liệu định kỳ và ghi trực tiếp vào sổ cái Blockchain bất biến, khiến không ai có thể làm sai lệch dữ liệu.',
    dap_an_c: 'In sẵn một tập phiếu cam kết bảo quản nhiệt độ chuẩn có đóng dấu mộc đỏ của hợp tác xã để kẹp vào hồ sơ hải quan.',
    dap_an_d: 'Chuyển sang sử dụng dịch vụ đám mây công cộng miễn phí để lưu trữ danh bạ số điện thoại của lái xe tải.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Cảm biến IoT tự động đo nhiệt độ thời gian thực kết hợp Blockchain lưu trữ dữ liệu bất biến là giải pháp chuẩn quốc tế chống gian lận chuỗi cung ứng lạnh (Cold Chain).',
    do_kho: 4
  },
  // Câu mở rộng Boss: Tình huống AI phát hiện gian lận ngân hàng (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_04_03_08',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khách hàng A đang ở Hà Nội vừa quẹt thẻ tín dụng mua cà phê lúc 10h00 sáng, nhưng đến 10h05 sáng cùng ngày hệ thống ghi nhận một giao dịch rút 50 triệu VNĐ tại một máy ATM ở Paris (Pháp). Thuật toán AI phòng chống gian lận của ngân hàng sẽ xử lý như thế nào dựa trên dữ liệu lớn?',
    dap_an_a: 'Lập tức gửi thư mời họp hội đồng kỷ luật giao dịch viên chi nhánh đã mở thẻ cho khách hàng A.',
    dap_an_b: 'Tự động nhận diện đây là hành vi bất thường bất khả thi về mặt địa lý (Anomaly Detection), tạm khóa giao dịch đáng ngờ và gửi cảnh báo xác thực OTP/gọi điện ngay cho khách hàng A.',
    dap_an_c: 'Tiến hành trừ tiền ngay lập tức và cộng thêm điểm thưởng tích lũy du lịch nước ngoài cho khách hàng.',
    dap_an_d: 'Xóa toàn bộ hồ sơ dữ liệu lịch sử của khách hàng A khỏi cơ sở dữ liệu của ngân hàng để tránh phiền phức.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'AI ngân hàng ứng dụng thuật toán phát hiện bất thường (Anomaly Detection) trên dữ liệu thời gian thực để ngăn chặn tội phạm trộm cắp thông tin thẻ xuyên quốc gia.',
    do_kho: 4
  },
  // Câu mở rộng Boss: Sắp xếp
  {
    ma_cau_hoi: 'q_cds_04_03_09',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để sắp xếp đúng quy trình vận hành khép kín của một hệ thống IoT hoàn chỉnh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp quy trình xử lý IoT 4 bước:',
      correct_order: [
        'Cảm biến (Sensors) thu thập tín hiệu từ môi trường thực',
        'Mạng kết nối (Connectivity) truyền dữ liệu qua Internet/4G',
        'Bộ xử lý máy chủ (Data Processing) phân tích dữ liệu',
        'Giao diện điều khiển (User Interface) đưa ra lệnh phản hồi'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Quy trình 4 yếu tố then chốt của IoT: Cảm biến -> Kết nối -> Xử lý dữ liệu -> Giao diện phản hồi/điều khiển.',
    do_kho: 3
  },
  // Câu mở rộng Boss: Điền từ
  {
    ma_cau_hoi: 'q_cds_04_03_10',
    ma_moc: 'moc_cds_04_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Nhờ vào tính chất phân tán và mật mã học, công nghệ {blank} giúp lưu trữ thông tin có tính bất biến, được các trường đại học MIT và Harvard ứng dụng để ngăn chặn bằng cấp giả mạo.',
      options: ['Blockchain', 'Điện toán đám mây', 'Big Data', 'Mạng LAN'],
      blank_answer: 'Blockchain'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Blockchain có tính bất biến, chống làm giả văn bằng chứng chỉ hiệu quả.',
    do_kho: 1
  }
];

module.exports = { checkpointsCh4, questionsCh4 };
