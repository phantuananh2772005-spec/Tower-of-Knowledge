/**
 * Dữ liệu Môn Chuyển Đổi Số - Chương 6: Kỹ năng số, Phân tích dữ liệu & An toàn thông tin cho người học
 * 3 Mốc bài học + 29 Câu hỏi (20 câu gốc từ giáo trình trang 85-88 + 9 câu mở rộng)
 * Tuân thủ quy tắc: Câu bẫy dài bằng/hơn câu đúng, đáp án đúng phân bố đều A, B, C, D
 */

const checkpointsCh6 = [
  {
    ma_moc: 'moc_cds_06_01',
    ma_chuong: 'ch_cds_06',
    tieu_de: 'Mốc 6.1: Bộ Công Cụ Số, Nghệ Thuật Prompting AI & Mô Hình CRAAP',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 1,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Vai trò của Trí tuệ nhân tạo (AI) và Công cụ số Doanh nghiệp
- **AI trong tự động hóa**: Giúp giải phóng con người khỏi **các tác vụ lặp đi lặp lại** (như nhập liệu, phân loại email, trích xuất hóa đơn), giúp nhân sự tập trung vào tư duy sáng tạo và chiến lược.
- **Hệ thống ERP và CRM**: Nền tảng cốt lõi giúp doanh nghiệp **tích hợp dữ liệu liên phòng ban và tối ưu hóa toàn bộ quy trình** vận hành, sản xuất và chăm sóc khách hàng.
- **Công cụ Business Intelligence (Power BI, Tableau)**: Dùng để **trực quan hóa và phân tích chuyên sâu dữ liệu**, biến hàng triệu dòng số thô thành các báo cáo biểu đồ trực quan phục vụ ra quyết định tức thì.
- **Nền tảng Điện toán đám mây (Cloud)**: Hỗ trợ đắc lực việc **lưu trữ dữ liệu an toàn, cộng tác thời gian thực và làm việc từ xa linh hoạt**.

### 2. Kỹ năng Prompting & Thẩm định thông tin CRAAP
- **Kỹ năng Prompting**: Nghệ thuật thiết kế câu lệnh để **giao tiếp hiệu quả với AI tạo sinh (GenAI)**, cung cấp đầy đủ bối cảnh (Context), vai trò (Role), nhiệm vụ cụ thể (Task) và định dạng mong muốn.
- **Tư duy phản biện số (Critical Evaluation)**: Kỹ năng **kiểm tra, phân tích và đánh giá tính đúng đắn, khách quan** của thông tin trên mạng trước khi tin tưởng hoặc chia sẻ.
- **Kỹ thuật tìm kiếm với Google**: Sử dụng toán tử tìm kiếm nâng cao (như \`site:edu.vn\` để giới hạn kết quả trong các trang web giáo dục đào tạo chính thống tại Việt Nam).
- **Mô hình CRAAP đánh giá nguồn tin số**:
  - **C (Currency)**: Tính hiện tại, tính mới và thời điểm cập nhật của thông tin.
  - **R (Relevance)**: Mức độ liên quan và phù hợp của thông tin đối với đề tài nghiên cứu.
  - **A (Authority)**: Uy tín, thẩm quyền và danh tính của tác giả hoặc tổ chức phát hành.
  - **A (Accuracy)**: Độ chính xác, tính trung thực và khả năng kiểm chứng nguồn dữ liệu.
  - **P (Purpose)**: Mục đích xuất bản thông tin (chia sẻ học thuật, giải trí hay quảng cáo trục lợi).`
  },
  {
    ma_moc: 'moc_cds_06_02',
    ma_chuong: 'ch_cds_06',
    tieu_de: 'Mốc 6.2: Khoa Học Dữ Liệu Với DataFrame, Làm Sạch & Trực Quan Hóa',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 2,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Cấu trúc dữ liệu & Quy trình Làm sạch dữ liệu
- **Lưu trữ đám mây (Google Drive, OneDrive)**: Công cụ tiêu biểu để **lưu trữ, sao lưu và sắp xếp thông tin** số khoa học, hỗ trợ làm việc nhóm đa nền tảng.
- **DataFrame trong Khoa học dữ liệu**: Cấu trúc dữ liệu dạng **bảng hai chiều gồm nhiều dòng và nhiều cột** (phổ biến trong thư viện Pandas của Python hoặc các bảng tính), trong đó mỗi cột đại diện cho một thuộc tính và mỗi dòng là một bản ghi.
- **Mục tiêu của Làm sạch dữ liệu (Data Cleaning)**: Bước bắt buộc đầu tiên trong phân tích dữ liệu nhằm **loại bỏ lỗi sai, xử lý giá trị bị khuyết (missing values), xóa bỏ các bản ghi trùng lặp (duplicates)** và chuẩn hóa định dạng số liệu, đảm bảo dữ liệu đầu vào chuẩn xác.

### 2. Trực quan hóa dữ liệu & Tư duy số (Digital Literacy)
- **Lựa chọn biểu đồ chuẩn trong phân tích số liệu**:
  - **Biểu đồ đường (Line Chart)**: Thể hiện **xu hướng biến thiên, tăng trưởng của dữ liệu theo chuỗi thời gian** (doanh thu theo tháng, nhiệt độ theo giờ).
  - **Biểu đồ tròn (Pie Chart)**: Thể hiện cơ cấu tỷ lệ phần trăm các thành phần trong một tổng thể 100%.
  - **Biểu đồ cột (Bar Chart)**: So sánh tương quan độ lớn giữa các danh mục độc lập.
- **Khung năng lực Tư duy số (Digital Literacy)**: Bao gồm đọc hiểu dữ liệu, phân tích thông tin số, giao tiếp số văn minh, an toàn bảo mật; **không bao gồm việc bắt buộc phải lập trình chuyên sâu hệ thống máy chủ (Backend Programming)**.`
  },
  {
    ma_moc: 'moc_cds_06_03',
    ma_chuong: 'ch_cds_06',
    tieu_de: 'Mốc 6.3 [BOSS TRÙM CUỐI]: An Toàn Số, Chống Phishing & Bảo Vệ Danh Tính',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 3,
    diem_thuong: 50,
    xu_thuong: 40,
    noi_dung_ly_thuyet: `### 1. Đổi mới sáng tạo & Giao tiếp số
- **Đổi mới sáng tạo (Digital Innovation)**: Ứng dụng công nghệ mới để **cải tiến quy trình làm việc cũ, tạo ra giá trị mới** và nâng cao chất lượng trải nghiệm của khách hàng/người dân.
- **Kỹ năng giao tiếp số (Digital Communication)**: Khả năng soạn thảo email chuyên nghiệp, trình bày báo cáo trực tuyến, trao đổi văn minh trên các diễn đàn và ứng dụng cộng tác nhóm (Slack, Microsoft Teams).

### 2. An toàn thông tin & Phòng chống lừa đảo trực tuyến
- **Tấn công lừa đảo (Phishing)**: Hình thức tội phạm mạng **giả mạo email, tin nhắn mạo danh ngân hàng, cơ quan công an hoặc tổ chức uy tín** kèm theo đường link độc hại nhằm lừa người dùng cung cấp mật khẩu, thông tin cá nhân và mã OTP tài khoản.
- **Nguyên tắc mật khẩu an toàn**: Mật khẩu phải có độ dài tối thiểu 12 ký tự, kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt; **tuyệt đối KHÔNG sử dụng một mật khẩu giống nhau cho nhiều tài khoản** khác nhau trên mạng.
- **Xác thực hai yếu tố (2FA - Two-Factor Authentication)**: Cơ chế tăng cường bảo mật tài khoản bằng cách yêu cầu thêm **lớp bảo vệ bổ sung thứ hai** (mã gửi qua SMS, ứng dụng Google Authenticator, hoặc dấu vân tay) sau khi nhập đúng mật khẩu.
- **Pháp lý tại Việt Nam**: Tuân thủ Luật An toàn thông tin mạng và **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân, nghiêm cấm các hành vi mua bán, thu thập và phát tán dữ liệu công dân trái phép.`
  }
];

const questionsCh6 = [
  // --- MỐC 6.1: CÔNG CỤ SỐ, PROMPTING & CRAAP (10 câu) ---
  // Câu 1 (Gốc p.85 - Q1): Vai trò chính của AI trong tự động hóa -> B
  {
    ma_cau_hoi: 'q_cds_06_01_01',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong các hoạt động vận hành của tổ chức hiện đại, vai trò chính của trí tuệ nhân tạo (AI) trong tự động hóa quy trình là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Làm gia tăng đáng kể các chi phí bảo trì hệ thống và tiêu tốn nguồn năng lượng điện toán hàng tháng',
        'Tự động hóa các tác vụ lặp đi lặp lại để giải phóng thời gian cho nhân sự tập trung vào công việc giá trị cao',
        'Làm suy giảm nghiêm trọng khả năng phân tích dữ liệu và giảm tốc độ xử lý các giao dịch kế toán nội bộ',
        'Hạn chế và ngăn chặn mọi sự tương tác phản hồi thông tin giữa đội ngũ nhân viên với khách hàng thân thiết'
      ]
    }),
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'AI giúp tự động hóa các tác vụ lặp lại (RPA + GenAI) như nhập liệu, trả lời tin nhắn mẫu, trích xuất dữ liệu.',
    do_kho: 1
  },
  // Câu 2 (Gốc p.85 - Q2): Công cụ ERP và CRM giúp doanh nghiệp làm gì? -> C
  {
    ma_cau_hoi: 'q_cds_06_01_02',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Các bộ giải pháp công nghệ số doanh nghiệp như ERP (Hoạch định nguồn lực) và CRM (Quản lý quan hệ khách hàng) giúp doanh nghiệp thực hiện điều gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Tuyển dụng ồ ạt thêm thật nhiều nhân sự hành chính trung gian để quản lý hồ sơ sổ sách lưu trữ nội bộ',
        'Ngừng việc thu thập và sử dụng dữ liệu khách hàng nhằm tránh nguy cơ xảy ra sự cố rò rỉ thông tin cá nhân',
        'Tích hợp liền mạch dữ liệu giữa các phòng ban chức năng và tối ưu hóa toàn diện quy trình vận hành',
        'Loại bỏ hoàn toàn nhu cầu xuất bản các báo cáo tài chính định kỳ theo quy định của cơ quan thuế nhà nước'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'ERP tích hợp nguồn lực nội bộ và CRM tối ưu quan hệ khách hàng, liên thông dữ liệu toàn doanh nghiệp.',
    do_kho: 2
  },
  // Câu 3 (Gốc p.85 - Q3): Công cụ BI Power BI, Tableau dùng để làm gì? -> B -> chuyển sang D
  {
    ma_cau_hoi: 'q_cds_06_01_03',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Các công cụ trí tuệ kinh doanh (Business Intelligence) hàng đầu hiện nay như Microsoft Power BI hay Tableau được ứng dụng chủ yếu vào mục đích nào?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Chỉnh sửa và lồng ghép các hiệu ứng kỹ xảo điện ảnh phức tạp cho các video quảng cáo truyền thông số',
        'Lập trình và xây dựng các trò chơi tương tác thực tế ảo trên thiết bị di động thông minh cho giới trẻ',
        'Lưu trữ dữ liệu tĩnh ở chế độ ngoại tuyến hoàn toàn trên các ổ cứng thể rắn di động cá nhân truyền thống',
        'Trực quan hóa số liệu qua các bảng điều khiển thông minh và phân tích sâu các chỉ số kinh doanh then chốt'
      ]
    }),
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Power BI và Tableau là các công cụ BI hàng đầu giúp trực quan hóa và phân tích dữ liệu đa chiều.',
    do_kho: 2
  },
  // Câu 4 (Gốc p.85 - Q4): Kỹ năng Prompting dùng để làm gì? -> B -> chuyển sang A
  {
    ma_cau_hoi: 'q_cds_06_01_04',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong kỷ nguyên bùng nổ của trí tuệ nhân tạo, kỹ năng "Prompting" (Kỹ nghệ tạo câu lệnh) được hiểu chính xác nhất là năng lực nào?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Thiết kế ngữ cảnh, vai trò và mệnh lệnh chuẩn xác để giao tiếp hiệu quả và khai thác tối đa năng lực AI tạo sinh',
        'Soạn thảo các đoạn mã độc hại để xâm nhập trái phép vào máy chủ của các tổ chức tài chính quốc tế',
        'Thiết lập tường lửa bảo mật để chủ động ngăn chặn toàn bộ các kết nối truy cập Internet của nhân viên nội bộ',
        'Tạo ra chuỗi các ký tự mật khẩu ngẫu nhiên có độ phức tạp cao nhằm bảo vệ hòm thư điện tử cá nhân'
      ]
    }),
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Prompting là kỹ năng giao tiếp, ra lệnh chuẩn xác với AI tạo sinh để AI đưa ra câu trả lời chất lượng nhất.',
    do_kho: 1
  },
  // Câu 5 (Gốc p.85 - Q5): Nền tảng Cloud dùng nhiều nhất vào mục đích nào? -> B
  {
    ma_cau_hoi: 'q_cds_06_01_05',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Các nền tảng điện toán đám mây (Cloud Computing như Google Cloud, AWS, VNPT Cloud) được các tổ chức sử dụng nhiều nhất vào mục đích nào?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Tải các trò chơi giải trí ngoại tuyến về cài đặt trên máy tính cá nhân để chơi khi không có mạng cáp quang',
        'Lưu trữ dữ liệu tập trung, hỗ trợ làm việc cộng tác trực tuyến đa điểm và vận hành từ xa linh hoạt',
        'Tự động tăng gấp đôi tốc độ xử lý vật lý của bộ vi xử lý CPU máy tính để bàn mà không cần lắp thêm RAM',
        'Tự động kích hoạt cơ chế xóa vĩnh viễn toàn bộ các tập tin dữ liệu đã lưu trữ sau mỗi 24 giờ làm việc'
      ]
    }),
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Cloud dùng chủ yếu để lưu trữ, sao lưu, chia sẻ và cộng tác làm việc từ xa mọi lúc mọi nơi.',
    do_kho: 1
  },
  // Câu 6 (Gốc p.85 - Q6): ERP và CRM thuộc nhóm kỹ năng nào trong CĐS? -> B -> chuyển sang C
  {
    ma_cau_hoi: 'q_cds_06_01_06',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khả năng sử dụng và tương tác thành thạo trên các hệ thống như ERP và CRM thuộc nhóm năng lực số nào của người lao động hiện đại?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Kỹ năng tư duy nghệ thuật, cảm thụ thị giác và sáng tạo các tác phẩm hội họa kỹ thuật số trên máy tính',
        'Kỹ năng lập trình phát triển các thuật toán học sâu nâng cao và thiết kế kiến trúc vi mạch bán dẫn mới',
        'Kỹ năng vận hành công cụ số chuyên nghiệp và làm chủ hệ thống quy trình nghiệp vụ số của tổ chức',
        'Kỹ năng sư phạm và nghệ thuật diễn thuyết truyền cảm hứng trong các buổi giảng dạy trước đám đông'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Sử dụng ERP/CRM thuộc nhóm kỹ năng vận hành công cụ số và làm chủ hệ thống thông tin tổ chức.',
    do_kho: 2
  },
  // Câu 7 (Gốc p.85-86 - Q7): Critical Evaluation trong tư duy số -> C -> chuyển sang D
  {
    ma_cau_hoi: 'q_cds_06_01_07',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khái niệm "Critical Evaluation" (Đánh giá phản biện) trong khung năng lực tư duy số có ý nghĩa bản chất là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Tuyệt đối tin tưởng và chấp nhận toàn bộ các luồng thông tin, bài viết được tìm thấy trên các công cụ tìm kiếm',
        'Tham gia vào các hội nhóm trực tuyến để tìm kiếm cơ hội trao đổi, mua bán thông tin cơ sở dữ liệu cá nhân',
        'Đọc lướt qua thật nhiều trang web với tốc độ tối đa mà không cần dừng lại suy ngẫm về nội dung cốt lõi',
        'Chủ động phân tích, đối chiếu và kiểm tra tính xác thực, độ tin cậy cùng mục đích ẩn sau của thông tin'
      ]
    }),
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Critical Evaluation là năng lực phân tích, đánh giá phản biện tính chính xác và tin cậy của thông tin số.',
    do_kho: 2
  },
  // Câu 8 (Gốc p.86 - Q8): Kỹ năng tìm kiếm: xác định gì trước? -> B -> chuyển sang A
  {
    ma_cau_hoi: 'q_cds_06_01_08',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trước khi bắt đầu thực hiện thao tác tra cứu trên các công cụ tìm kiếm trực tuyến, bước đầu tiên và quan trọng nhất người học cần xác định rõ là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Xác định rõ ràng mục tiêu thông tin, phạm vi kiến thức và các từ khóa cốt lõi cần phải tìm kiếm',
        'Tra cứu họ tên và chức danh khoa học đầy đủ của người đã lập trình ra thuật toán công cụ tìm kiếm',
        'Kiểm tra màu sắc giao diện biểu tượng đồ họa của trang chủ công cụ tìm kiếm có hiển thị chuẩn xác không',
        'Đo đạc chính xác tốc độ truyền tải gói tin băng thông mạng quốc tế tại thời điểm gửi truy vấn'
      ]
    }),
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Trước khi tra cứu, việc xác định mục tiêu thông tin và từ khóa chuẩn xác quyết định 80% độ chính xác của kết quả.',
    do_kho: 1
  },
  // Câu 9 (Mở rộng thực tế VN): Cú pháp Google Search site:gov.vn -> C
  {
    ma_cau_hoi: 'q_cds_06_01_09',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi sinh viên cần tìm kiếm các văn bản quy phạm pháp luật và nghị định chính thức của Chính phủ Việt Nam trên Google, cú pháp tra cứu nào đem lại kết quả chuẩn xác và tin cậy nhất?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'nhập từ khóa: nghị định chuyển đổi số và tìm kiếm trong mục hình ảnh trên mạng xã hội Facebook',
        'nhập từ khóa: "chuyển đổi số" filetype:mp3 trên các diễn đàn chia sẻ nhạc trực tuyến miễn phí',
        'nhập từ khóa: "chuyển đổi số" site:chinhphu.vn hoặc site:gov.vn để lọc trong cổng thông tin nhà nước',
        'nhập từ khóa: chính sách nhà nước kèm theo tên của một người nổi tiếng có nhiều người theo dõi trên TikTok'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Cú pháp toán tử site:gov.vn hoặc site:chinhphu.vn giúp thu hẹp phạm vi tìm kiếm chỉ trên tên miền chính thống của Chính phủ.',
    do_kho: 2
  },
  // Câu 10 (Mở rộng Nối cặp): Nối cặp mô hình CRAAP
  {
    ma_cau_hoi: 'q_cds_06_01_10',
    ma_moc: 'moc_cds_06_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Hãy chạm vào các ô tương ứng ở hai cột để ghép đúng 4 tiêu chí của mô hình thẩm định thông tin CRAAP với câu hỏi đánh giá tương ứng:',
    du_lieu_cau_hoi: JSON.stringify({
      left_items: [
        { id: 'l1', text: 'Currency (Tính mới/Thời điểm)' },
        { id: 'l2', text: 'Relevance (Tính liên quan)' },
        { id: 'l3', text: 'Authority (Thẩm quyền tác giả)' },
        { id: 'l4', text: 'Accuracy (Độ chính xác)' }
      ],
      right_items: [
        { id: 'r1', text: 'Thông tin được xuất bản khi nào, số liệu có còn cập nhật không?' },
        { id: 'r2', text: 'Nội dung có trả lời đúng câu hỏi và phù hợp với đề tài cần tìm không?' },
        { id: 'r3', text: 'Ai là tác giả hoặc cơ quan chịu trách nhiệm xuất bản bài viết này?' },
        { id: 'r4', text: 'Dữ liệu có trích dẫn nguồn kiểm chứng và bằng chứng xác thực không?' }
      ],
      matches: { l1: 'r1', l2: 'r2', l3: 'r3', l4: 'r4' }
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Bộ tiêu chí CRAAP: Currency (Thời điểm), Relevance (Mức liên quan), Authority (Thẩm quyền), Accuracy (Chính xác).',
    do_kho: 2
  },

  // --- MỐC 6.2: DATAFRAME, LÀM SẠCH & TRỰC QUAN HÓA (9 câu) ---
  // Câu 11 (Gốc p.86 - Q9): Cú pháp "site:edu.vn" -> B
  {
    ma_cau_hoi: 'q_cds_06_02_01',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi thực hiện tìm kiếm trên Google, việc đưa cú pháp "site:edu.vn" vào chuỗi truy vấn có tác dụng kỹ thuật gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Tự động kích hoạt tính năng tìm kiếm các đoạn hội thoại trao đổi trên tất cả các nền tảng mạng xã hội',
        'Giới hạn kết quả trả về chỉ nằm trong phạm vi các trang web của các trường học, viện nghiên cứu tại Việt Nam',
        'Tự động tải về máy tính toàn bộ các phần mềm và công cụ giải trí có gắn tên miền của các trường học',
        'Tự động kiểm tra lỗi chính tả tiếng Việt trong văn bản đang soạn thảo trên màn hình máy tính'
      ]
    }),
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Toán tử site:edu.vn lọc kết quả chỉ xuất hiện từ các website giáo dục đào tạo có tên miền .edu.vn.',
    do_kho: 1
  },
  // Câu 12 (Gốc p.86 - Q10): Trong mô hình CRAAP "Currency" là gì? -> C
  {
    ma_cau_hoi: 'q_cds_06_02_02',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong bộ tiêu chí chuẩn mực CRAAP dùng để đánh giá độ tin cậy của thông tin số, chữ "Currency" mang hàm nghĩa là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Mức độ chuẩn xác tuyệt đối của từng câu từ ngữ pháp trong nội dung văn bản',
        'Động cơ và mục đích thương mại hoặc giải trí vụ lợi của người biên soạn bài viết',
        'Tính hiện tại, tính cập nhật về mặt thời gian và độ mới của thông tin được công bố',
        'Học vị, chức danh và hồ sơ năng lực chuyên môn của tác giả đứng tên xuất bản'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Currency trong CRAAP nói về tính mới, tính thời sự cập nhật của dữ liệu.',
    do_kho: 1
  },
  // Câu 13 (Gốc p.86 - Q11): Google Drive và OneDrive dùng để làm gì? -> B -> chuyển sang D
  {
    ma_cau_hoi: 'q_cds_06_02_03',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Các dịch vụ lưu trữ đám mây quen thuộc như Google Drive hay Microsoft OneDrive phục vụ mục đích thiết thực nào cho người dùng?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Tạo ra các đoạn mã phần mềm độc hại để thử nghiệm khả năng phòng thủ của hệ điều hành máy tính',
        'Chủ động phát tán các mã độc tống tiền (Ransomware) vào mạng máy tính nội bộ của trường đại học',
        'Thực hiện các cuộc tấn công mạng nhằm bẻ khóa và đánh cắp mật khẩu tài khoản ngân hàng của người khác',
        'Lưu trữ, đồng bộ hóa dữ liệu an toàn, sắp xếp tài liệu khoa học và chia sẻ cộng tác làm việc nhóm'
      ]
    }),
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Google Drive và OneDrive là dịch vụ lưu trữ đám mây giúp đồng bộ, quản lý tệp và cộng tác nhóm.',
    do_kho: 1
  },
  // Câu 14 (Gốc p.86 - Q12): "DataFrame" trong phân tích dữ liệu là gì? -> B
  {
    ma_cau_hoi: 'q_cds_06_02_04',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong lĩnh vực phân tích dữ liệu và khoa học dữ liệu (Data Science), thuật ngữ "DataFrame" được định nghĩa là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Một tệp video có độ phân giải siêu nét được nén dưới định dạng kỹ thuật số để phục vụ hội nghị trực tuyến',
        'Một cấu trúc dữ liệu dạng bảng 2 chiều có cấu trúc, bao gồm nhiều dòng (bản ghi) và nhiều cột (thuộc tính)',
        'Một tập tin văn bản thuần túy không chứa bất kỳ định dạng tiêu đề, bảng biểu hay hàng cột nào',
        'Một ứng dụng phần mềm đồ họa chuyên dụng dùng để chỉnh sửa ảnh chụp chân dung kỹ thuật số'
      ]
    }),
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'DataFrame là bảng dữ liệu 2 chiều có cấu trúc gồm các hàng và cột (phổ biến trong Pandas, R, SQL).',
    do_kho: 2
  },
  // Câu 15 (Gốc p.86 - Q13): Mục tiêu của làm sạch dữ liệu -> B -> chuyển sang A
  {
    ma_cau_hoi: 'q_cds_06_02_05',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong quy trình khai phá và phân tích số liệu, mục tiêu cốt lõi của công đoạn Làm sạch dữ liệu (Data Cleaning) là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Loại bỏ các bản ghi trùng lặp, xử lý các giá trị bị khuyết thiếu (NULL), sửa đổi các lỗi sai sót và chuẩn hóa định dạng',
        'Làm cho tập dữ liệu trở nên phức tạp hơn bằng cách cố tình chèn thêm các ký tự ngẫu nhiên vào các trường thông tin',
        'Xóa bỏ hoàn toàn toàn bộ cơ sở dữ liệu hiện có để tiến hành nhập tay lại từ đầu từ các cuốn sổ giấy',
        'Mã hóa toàn bộ các con số thống kê thành các tệp hình ảnh để giảm dung lượng lưu trữ trên máy chủ'
      ]
    }),
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Làm sạch dữ liệu nhằm loại bỏ sai sót, xử lý giá trị khuyết thiếu và trùng lặp, chuẩn hóa để sẵn sàng phân tích.',
    do_kho: 2
  },
  // Câu 16 (Gốc p.87 - Q14): Biểu đồ đường thường dùng để thể hiện điều gì? -> B -> chuyển sang C
  {
    ma_cau_hoi: 'q_cds_06_02_06',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi thiết kế các báo cáo trực quan hóa dữ liệu trong kinh doanh, biểu đồ đường (Line Chart) là lựa chọn tối ưu nhất khi muốn thể hiện:',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Mối quan hệ chính trị, ngoại giao phức tạp giữa các quốc gia và vùng lãnh thổ trên bản đồ thế giới',
        'Cơ cấu tỷ lệ phần trăm đóng góp của các nhóm mặt hàng trong tổng doanh số 100% của một cửa hàng',
        'Xu hướng biến thiên, dao động hoặc tốc độ tăng trưởng liên tục của một chỉ số theo chuỗi thời gian',
        'Vị trí địa lý tọa độ kinh độ và vĩ độ của các cửa hàng bán lẻ trên nền tảng bản đồ số không gian'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Biểu đồ đường (Line chart) dùng chuẩn xác nhất để phản ánh xu hướng biến thiên theo thời gian.',
    do_kho: 1
  },
  // Câu 17 (Gốc p.87 - Q15): Digital Literacy KHÔNG gồm nội dung nào? -> D
  {
    ma_cau_hoi: 'q_cds_06_02_07',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khung năng lực số cơ bản dành cho công dân (Digital Literacy) KHÔNG bắt buộc phải bao gồm năng lực kỹ thuật chuyên sâu nào dưới đây?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Năng lực đọc hiểu dữ liệu và khai thác thông tin từ các biểu đồ báo cáo số liệu kinh doanh cơ bản',
        'Kỹ năng giao tiếp số và trao đổi thông tin cộng tác văn minh, tôn trọng người khác trên không gian mạng',
        'Khả năng tìm kiếm, phân tích, đánh giá độ tin cậy và hiểu đúng bản chất của các luồng thông tin số',
        'Kỹ năng lập trình nâng cao phát triển hạ tầng máy chủ backend, vi mạch phần cứng và hệ điều hành nhân'
      ]
    }),
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Tư duy năng lực số (Digital Literacy) là kỹ năng nền tảng phổ cập cho mọi công dân, không đòi hỏi lập trình máy chủ backend chuyên sâu.',
    do_kho: 2
  },
  // Câu 18 (Mở rộng thực tế VN): Trực quan hóa dữ liệu tỷ trọng kinh tế số trong GDP -> A
  {
    ma_cau_hoi: 'q_cds_06_02_08',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Để trình bày tỷ trọng đóng góp của 3 thành phần: Kinh tế số ICT, Kinh tế số Internet/nền tảng và Kinh tế số ngành trong tổng quy mô kinh tế số Việt Nam (tổng thể 100%), loại biểu đồ nào là trực quan và chuẩn mực nhất?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Biểu đồ tròn (Pie Chart) hoặc Biểu đồ vành khăn (Donut Chart) thể hiện rõ cơ cấu thành phần trên 100%',
        'Biểu đồ tán xạ (Scatter Plot) dùng để tìm kiếm mối tương quan phân tán giữa hai biến số liên tục',
        'Biểu đồ nến Nhật Bản (Candlestick Chart) chuyên dùng để theo dõi giá cổ phiếu trên thị trường chứng khoán',
        'Biểu đồ radar mạng nhện (Radar Chart) dùng để đánh giá năng lực đa chiều của một ứng viên tuyển dụng'
      ]
    }),
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Biểu đồ tròn/vành khăn là chuẩn mực để thể hiện cơ cấu tỷ lệ % của các thành phần trong một tổng thể 100%.',
    do_kho: 2
  },
  // Câu 19 (Mở rộng Sắp xếp): Sắp xếp 4 bước quy trình phân tích dữ liệu
  {
    ma_cau_hoi: 'q_cds_06_02_09',
    ma_moc: 'moc_cds_06_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ để sắp xếp đúng trình tự 4 bước khoa học của một quy trình phân tích dữ liệu phục vụ ra quyết định kinh doanh:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp quy trình phân tích dữ liệu chuẩn 4 bước:',
      correct_order: [
        'Thu thập dữ liệu thô từ nhiều nguồn (Data Collection)',
        'Làm sạch và tiền xử lý dữ liệu (Data Cleaning & Preprocessing)',
        'Phân tích và khám phá mô hình dữ liệu (Data Analysis & Modeling)',
        'Trực quan hóa và diễn giải báo cáo kết quả (Data Visualization & Insights)'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Quy trình phân tích dữ liệu: Thu thập -> Làm sạch -> Phân tích -> Trực quan hóa & Báo cáo.',
    do_kho: 2
  },

  // --- MỐC 6.3 [BOSS TRÙM CUỐI]: AN TOÀN SỐ & BẢO VỆ DANH TÍNH (10 câu) ---
  // Câu 20 (Gốc p.87 - Q16): Yếu tố của đổi mới sáng tạo -> B
  {
    ma_cau_hoi: 'q_cds_06_03_01',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong kỷ nguyên số, một trong những yếu tố cốt lõi nhất thể hiện tinh thần Đổi mới sáng tạo (Innovation) của một tổ chức là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Sao chép nguyên xi toàn bộ mô hình và ý tưởng sản phẩm của đối thủ cạnh tranh mà không có sự cải tiến nào',
        'Ứng dụng linh hoạt công nghệ số mới nhằm cải tiến quy trình, gia tăng hiệu suất và nâng tầm giá trị dịch vụ',
        'Chủ động cắt giảm chất lượng tiêu chuẩn của sản phẩm dịch vụ nhằm thu hút đối tượng khách hàng ham giá rẻ',
        'Nghiêm cấm nhân viên cấp dưới đưa ra các đề xuất ý tưởng thử nghiệm mới vì sợ rủi ro phát sinh chi phí'
      ]
    }),
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Đổi mới sáng tạo trong thời đại số là dùng công nghệ cải tiến quy trình, nâng cao giá trị mang lại.',
    do_kho: 2
  },
  // Câu 21 (Gốc p.87 - Q17): Ví dụ về kỹ năng giao tiếp số -> A -> chuyển sang C
  {
    ma_cau_hoi: 'q_cds_06_03_02',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Hành vi nào dưới đây là biểu hiện tiêu biểu của một người có kỹ năng giao tiếp số (Digital Communication) chuẩn mực trong môi trường học thuật và công việc?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Tự ý viết và phát tán mã độc gián điệp vào hòm thư điện tử của đồng nghiệp để kiểm tra tính cảnh giác',
        'Ghi chép toàn bộ mật khẩu đăng nhập các hệ thống quan trọng ra các mẩu giấy ghi chú dán công khai trên bàn',
        'Soạn thảo thư điện tử (email) rõ ràng, lịch sự, đúng nghi thức và biết cách trình bày báo cáo trực tuyến mạch lạc',
        'Xóa toàn bộ lịch sử duyệt web và các tệp tải về trên máy tính dùng chung của phòng ban sau khi sử dụng xong'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Kỹ năng giao tiếp số thể hiện qua việc soạn email chuyên nghiệp, tương tác văn minh và trình bày trực tuyến hiệu quả.',
    do_kho: 1
  },
  // Câu 22 (Gốc p.87 - Q18): Rủi ro "Phishing" là gì? -> B
  {
    ma_cau_hoi: 'q_cds_06_03_03',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Hình thức tấn công an ninh mạng có tên gọi "Phishing" (Tấn công lừa đảo) hoạt động theo phương thức nguy hiểm nào?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Sử dụng các thiết bị phát sóng âm thanh siêu tần số cao để gây nhiễu loạn đường truyền kết nối Wi-Fi gia đình',
        'Giả mạo email, tin nhắn của ngân hàng hoặc tổ chức uy tín chứa đường link giả nhằm lừa nạn nhân cung cấp mật khẩu và OTP',
        'Chỉ là hiện tượng lỗi ngữ pháp hoặc sai sót chính tả ngẫu nhiên xuất hiện trên các trang tin tức báo chí trực tuyến',
        'Tình trạng các đường cáp quang biển bị đứt gãy dẫn đến việc tốc độ truy cập các trang mạng quốc tế bị suy giảm'
      ]
    }),
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Phishing là hình thức lừa đảo giả mạo cơ quan, ngân hàng bằng tin nhắn/email để chiếm đoạt tài khoản, OTP.',
    do_kho: 2
  },
  // Câu 23 (Gốc p.87 - Q19): Nguyên tắc mật khẩu an toàn KHÔNG phải là gì? -> B -> chuyển sang D
  {
    ma_cau_hoi: 'q_cds_06_03_04',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong các phát biểu dưới đây về an toàn thông tin cá nhân, phát biểu nào KHÔNG PHẢI là nguyên tắc đặt mật khẩu bảo mật chuẩn mực?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Mật khẩu nên có độ dài tối thiểu từ 12 ký tự trở lên để ngăn chặn các thuật toán tấn công vét cạn (Brute-force)',
        'Mật khẩu nên phối hợp hài hòa giữa các chữ cái viết hoa, chữ thường, chữ số và các ký tự đặc biệt như @, #, $',
        'Người dùng nên chủ động thay đổi mật khẩu định kỳ hoặc sử dụng các phần mềm quản lý mật khẩu tin cậy',
        'Nên sử dụng một mật khẩu duy nhất giống nhau cho tất cả các tài khoản mạng xã hội, email và ngân hàng để tránh bị quên'
      ]
    }),
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Dùng một mật khẩu cho mọi tài khoản là sai lầm nguy hiểm nhất (Credential Stuffing), một tài khoản lộ sẽ mất sạch.',
    do_kho: 1
  },
  // Câu 24 (Gốc p.88 - Q20): Xác thực hai bước (2FA) dùng để làm gì? -> B -> chuyển sang A
  {
    ma_cau_hoi: 'q_cds_06_03_05',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Cơ chế xác thực hai bước (2FA - Two-Factor Authentication) được tích hợp trong các ứng dụng số nhằm mục đích chủ yếu nào?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Gia tăng bảo mật tài khoản bằng cách bổ sung thêm một lớp xác thực thứ hai độc lập ngoài mật khẩu đăng nhập',
        'Cho phép người dùng tự động mở đồng thời nhiều tab trình duyệt cùng lúc khi lướt web trên máy tính',
        'Ngăn chặn tạm thời không cho máy tính hoặc thiết bị di động khởi động lại sau khi cập nhật hệ điều hành',
        'Tự động sao lưu toàn bộ các tệp tin trong thư mục mặc định lên dịch vụ đám mây công cộng của bên thứ ba'
      ]
    }),
    vi_tri_dap_an_dung: 0, // A
    giai_thich: '2FA tăng cường bảo mật bằng lớp bảo vệ thứ hai (OTP, Authenticator app, khóa FIDO) phòng trường hợp lộ mật khẩu.',
    do_kho: 1
  },
  // Câu 25 (Mở rộng Boss): Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân tại VN -> C
  {
    ma_cau_hoi: 'q_cds_06_03_06',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Theo Nghị định số 13/2023/NĐ-CP của Chính phủ Việt Nam về Bảo vệ dữ liệu cá nhân, hành vi nào dưới đây bị nghiêm cấm tuyệt đối?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Cá nhân sử dụng các dịch vụ lưu trữ đám mây có máy chủ đặt tại nước ngoài để lưu trữ ảnh chụp gia đình',
        'Cơ quan nhà nước số hóa hồ sơ thủ tục hành chính của công dân để phục vụ dịch vụ công trực tuyến toàn trình',
        'Thu thập, chuyển giao, mua bán dữ liệu cá nhân của người dân khi chưa có sự đồng ý của chủ thể dữ liệu',
        'Doanh nghiệp sử dụng phần mềm kế toán và phần mềm quản trị quan hệ khách hàng có bản quyền hợp pháp'
      ]
    }),
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Nghị định 13/2023/NĐ-CP nghiêm cấm tuyệt đối hành vi mua bán, chia sẻ trái phép dữ liệu cá nhân khi chưa được chủ thể đồng ý.',
    do_kho: 2
  },
  // Câu 26 (Mở rộng Boss): Kịch bản Phishing giả danh công an/ngân hàng -> D
  {
    ma_cau_hoi: 'q_cds_06_03_07',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Nếu bạn nhận được một tin nhắn SMS hoặc cuộc gọi tự xưng là cán bộ công an hoặc nhân viên ngân hàng thông báo tài khoản của bạn bị khóa và yêu cầu nhấp vào link "https://vietcombank-xacthuc.online" để nhập mật khẩu và mã OTP, hành động đúng đắn và an toàn nhất bạn cần làm là gì?',
    du_lieu_cau_hoi: JSON.stringify({
      options: [
        'Lập tức nhấp vào đường link trên và nhập ngay mật khẩu cùng mã OTP gửi về máy để nhanh chóng mở khóa tài khoản',
        'Chuyển tiếp tin nhắn này cho người thân và bạn bè để nhờ họ cùng đăng nhập vào đường link hỗ trợ xác minh giúp',
        'Chụp ảnh màn hình tin nhắn rồi đăng tải công khai lên mạng xã hội kèm theo số điện thoại cá nhân để nhờ cộng đồng giải đáp',
        'Tuyệt đối không bấm vào link lạ, không cung cấp OTP cho bất kỳ ai; chủ động liên hệ hotline chính thức của ngân hàng để xác minh'
      ]
    }),
    vi_tri_dap_an_dung: 3, // D
    giai_thich: 'Cơ quan công an và ngân hàng không bao giờ yêu cầu gửi OTP hoặc đăng nhập link lạ qua tin nhắn SMS/Zalo. Đây là thủ đoạn lừa đảo Phishing tinh vi.',
    do_kho: 3
  },
  // Câu 27 (Mở rộng Boss Nối cặp): Nối cặp 4 giải pháp an toàn bảo mật số
  {
    ma_cau_hoi: 'q_cds_06_03_08',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Hãy chạm vào các ô tương ứng ở hai cột để nối đúng từng giải pháp an toàn số với công dụng phòng vệ tương ứng:',
    du_lieu_cau_hoi: JSON.stringify({
      left_items: [
        { id: 'l1', text: 'Xác thực 2 bước (2FA)' },
        { id: 'l2', text: 'Password Manager' },
        { id: 'l3', text: 'VPN (Mạng riêng ảo)' },
        { id: 'l4', text: 'Chữ ký số (Digital Signature)' }
      ],
      right_items: [
        { id: 'r1', text: 'Bảo vệ tài khoản dù mật khẩu chính bị lộ nhờ mã OTP/khóa cứng' },
        { id: 'r2', text: 'Tạo và lưu trữ an toàn các mật khẩu dài, ngẫu nhiên, không trùng lặp' },
        { id: 'r3', text: 'Mã hóa đường truyền dữ liệu khi kết nối vào mạng Wi-Fi công cộng' },
        { id: 'r4', text: 'Xác thực danh tính người ký và bảo đảm tính toàn vẹn của văn bản điện tử' }
      ],
      matches: { l1: 'r1', l2: 'r2', l3: 'r3', l4: 'r4' }
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Các công cụ an toàn số then chốt: 2FA (bảo vệ 2 lớp), Password Manager (quản lý mật khẩu), VPN (mã hóa đường truyền), Chữ ký số (toàn vẹn văn bản).',
    do_kho: 2
  },
  // Câu 28 (Mở rộng Boss Sắp xếp): Quy trình xử lý khi phát hiện tài khoản bị xâm nhập
  {
    ma_cau_hoi: 'q_cds_06_03_09',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ để sắp xếp đúng quy trình phản ứng an ninh 4 bước khẩn cấp khi bạn nghi ngờ tài khoản email hoặc ngân hàng bị lộ thông tin:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp quy trình phản ứng sự cố tài khoản bị xâm nhập:',
      correct_order: [
        'Đăng xuất ngay tài khoản khỏi tất cả các thiết bị lạ từ bảng quản trị',
        'Đổi ngay mật khẩu chính thành mật khẩu mạnh mới chưa từng sử dụng',
        'Kích hoạt hoặc làm mới cơ chế xác thực hai bước (2FA / Authenticator)',
        'Kiểm tra nhật ký hoạt động gần đây và báo cho bộ phận an ninh/ngân hàng nếu phát hiện giao dịch lạ'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Quy trình xử lý sự cố an toàn tài khoản: Đăng xuất thiết bị lạ -> Đổi mật khẩu -> Bật/Đổi 2FA -> Kiểm tra nhật ký giao dịch.',
    do_kho: 3
  },
  // Câu 29 (Mở rộng Boss Điền từ): Điền từ về bảo vệ dữ liệu cá nhân
  {
    ma_cau_hoi: 'q_cds_06_03_10',
    ma_moc: 'moc_cds_06_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Cơ chế xác thực {blank} (2FA) đòi hỏi người dùng phải cung cấp hai bằng chứng xác minh danh tính khác nhau trước khi được cấp quyền truy cập vào tài khoản trực tuyến.',
      options: ['hai yếu tố', 'đơn tầng', 'công cộng', 'tùy chọn'],
      blank_answer: 'hai yếu tố'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Xác thực hai yếu tố (2FA - Two-Factor Authentication) là lớp phòng vệ thiết yếu của công dân số.',
    do_kho: 1
  }
];

module.exports = { checkpointsCh6, questionsCh6 };
