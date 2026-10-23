/**
 * Dữ liệu Môn Chuyển Đổi Số - Chương 3: Lộ trình và Quản trị Chuyển đổi số
 * 3 Mốc bài học + 29 Câu hỏi (20 câu gốc trường + 9 câu mở rộng Bloom 3/4, Nối cặp, Sắp xếp, Điền từ)
 * Tuân thủ quy tắc: Câu bẫy dài bằng/hơn câu đúng, đáp án đúng phân bố đều A, B, C, D
 */

const checkpointsCh3 = [
  {
    ma_moc: 'moc_cds_03_01',
    ma_chuong: 'ch_cds_03',
    tieu_de: 'Mốc 3.1: Tầm Nhìn Chiến Lược & Lộ Trình 5 Bước Schallmo',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 1,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Tầm nhìn và Chiến lược Chuyển đổi số
- **Tầm nhìn số**: Bức tranh dài hạn, ngắn gọn, truyền cảm hứng và định hướng tương lai số của tổ chức.
- **Chiến lược số**: Kế hoạch tổng thể để hiện thực hóa tầm nhìn thông qua các mục tiêu cụ thể (SMART), **phải gắn liền và phục vụ trực tiếp mục tiêu phát triển cốt lõi của tổ chức**, không được tách rời.

### 2. Lộ trình 5 bước theo Mô hình Schallmo (Schallmo Roadmap)
1. **Digital Reality (Thực tế số)**: Khảo sát, đánh giá hiện trạng mô hình kinh doanh, quy trình, hạ tầng CNTT và những thách thức đang gặp phải.
2. **Digital Ambition (Tham vọng số)**: Xác định tầm nhìn số, sứ mệnh và thiết lập các mục tiêu chuyển đổi số cụ thể (SMART).
3. **Digital Potential (Tiềm năng số)**: Nghiên cứu các bài học thành công (best practices), định hình các sáng kiến số và kịch bản mô hình kinh doanh tiềm năng.
4. **Digital Fit (Phù hợp số)**: Đánh giá, sàng lọc và lựa chọn các giải pháp công nghệ phù hợp nhất với năng lực, nguồn lực tài chính và văn hóa tổ chức.
5. **Digital Implementation (Triển khai số)**: Thực thi các dự án thử nghiệm (pilot), đo lường kết quả, hoàn thiện và nhân rộng ra toàn bộ hệ thống.`
  },
  {
    ma_moc: 'moc_cds_03_02',
    ma_chuong: 'ch_cds_03',
    tieu_de: 'Mốc 3.2: Quản Trị Thay Đổi ADKAR & Bộ Chỉ Số DTI Việt Nam',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 2,
    diem_thuong: 20,
    xu_thuong: 15,
    noi_dung_ly_thuyet: `### 1. Quản trị thay đổi (Change Management) & Mô hình ADKAR
Chuyển đổi số là cuộc cách mạng về con người. Để vượt qua "tâm lý ngại thay đổi" và rời khỏi vùng an toàn, tổ chức áp dụng mô hình ADKAR gồm 5 giai đoạn:
1. **Awareness (Nhận thức)**: Tuyên truyền giúp nhân viên hiểu rõ lý do vì sao tổ chức bắt buộc phải chuyển đổi số.
2. **Desire (Mong muốn)**: Khơi gợi sự khao khát, cam kết và đồng hành của mỗi cá nhân trong quá trình thay đổi.
3. **Knowledge (Kiến thức)**: Đào tạo kiến thức chuyên môn và kỹ năng số cần thiết để vận hành công cụ mới.
4. **Ability (Khả năng)**: Hướng dẫn, hỗ trợ nhân viên chuyển hóa kiến thức thành năng lực thực hành trong công việc hàng ngày.
5. **Reinforcement (Củng cố)**: Khen thưởng, ghi nhận thành tích và củng cố thói quen mới để không quay lại lối mòn cũ.

### 2. Bộ chỉ số Đánh giá Chuyển đổi số Quốc gia (DTI)
Do Bộ TT&TT ban hành nhằm đo lường mức độ chuyển đổi số của các bộ, ngành, địa phương. Gồm 3 trụ cột với tỷ trọng:
- **Trụ cột Chính phủ số**: Chiếm **40%** tổng số điểm (Thể chế, hạ tầng, an toàn thông tin, dịch vụ công trực tuyến).
- **Trụ cột Kinh tế số**: Chiếm **35%** tổng số điểm (Ứng dụng công nghệ trong doanh nghiệp, tỷ trọng kinh tế số trong GRDP).
- **Trụ cột Xã hội số**: Chiếm **25%** tổng số điểm (Tỷ lệ người dân dùng dịch vụ số, kỹ năng số, mức độ hài lòng).
- **Triết lý**: "Không đo lường thì không quản lý được. Không quản lý thì không chuyển đổi số thành công được".`
  },
  {
    ma_moc: 'moc_cds_03_03',
    ma_chuong: 'ch_cds_03',
    tieu_de: 'Mốc 3.3 [BOSS]: Đại Chiến Bán Lẻ JioMart O2O & Kirana Ấn Độ',
    loai_moc: 'TRAC_NGHIEM',
    thu_tu: 3,
    diem_thuong: 35,
    xu_thuong: 30,
    noi_dung_ly_thuyet: `### 1. Bối cảnh và Thách thức của Reliance Retail
- Reliance Retail là tập đoàn bán lẻ lớn nhất Ấn Độ nhưng đối mặt với chuỗi cung ứng phân tán và sự thâm nhập thần tốc của Amazon và Flipkart.
- Toàn Ấn Độ có hơn **15 triệu cửa hàng tạp hóa truyền thống nhỏ lẻ (Kirana)** len lỏi khắp mọi ngõ ngách, chiếm 90% doanh số bán lẻ cả nước.

### 2. Ứng dụng Mô hình Schallmo tại JioMart
- **Digital Reality**: Nhận ra điểm nghẽn chuỗi cung ứng và sức mạnh mạng lưới của 15 triệu tiệm Kirana.
- **Digital Ambition**: Tầm nhìn xây dựng nền tảng bán lẻ O2O (Online-to-Offline) hàng đầu, hợp tác kết nối Kirana thay vì tiêu diệt họ.
- **Digital Potential**: Sáng kiến tích hợp ứng dụng đặt hàng JioMart ngay trên WhatsApp (ứng dụng nhắn tin quốc dân có 400+ triệu người dùng ở Ấn Độ).
- **Digital Fit**: Mô hình đôi bên cùng có lợi: Reliance cung cấp nguồn hàng giá sỉ và máy POS thông minh; Kirana đóng vai trò kho hàng chặng cuối (last-mile delivery) giao hàng siêu tốc trong 30 phút.
- **Digital Implementation**: Trang bị thiết bị số cho hàng triệu Kirana, bùng nổ doanh số trong đại dịch Covid-19 với hàng trăm nghìn đơn mỗi ngày.`
  }
];

const questionsCh3 = [
  // ==========================================
  // CHECKPOINT 3.1 (10 câu: 7 câu gốc + 3 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_03_01_01',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tầm nhìn chuyển đổi số (Digital Vision) đóng vai trò then chốt nào đối với tổ chức?',
    dap_an_a: 'Tuyển dụng thêm thật nhiều kỹ sư phần mềm cao cấp để thay thế toàn bộ nhân viên kế toán.',
    dap_an_b: 'Xác định rõ ràng hướng đi dài hạn, khát vọng và đích đến của tổ chức trong kỷ nguyên số.',
    dap_an_c: 'Tự động hóa tuyệt đối 100% mọi công đoạn thủ công mà không cần đến sự kiểm soát của con người.',
    dap_an_d: 'Cắt giảm toàn bộ chi phí vận hành thường niên xuống mức 0 đồng để dồn tiền đầu tư máy móc.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.1 (Trang 28): Tầm nhìn số giúp định hướng chiến lược và xác định mục tiêu dài hạn cho tổ chức.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_01_02',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một bản Tầm nhìn chuyển đổi số có tính khả thi và hiệu quả cao cần hội tụ các tiêu chí nào?',
    dap_an_a: 'Phải thật dài hàng trăm trang giấy với vô số thuật ngữ kỹ thuật phức tạp khó hiểu.',
    dap_an_b: 'Mơ hồ, chung chung để bất kỳ khi nào thất bại cũng có thể dễ dàng giải thích bao biện.',
    dap_an_c: 'Ngắn gọn, rõ ràng, truyền cảm hứng mạnh mẽ và định hướng tương lai lấy con người làm trung tâm.',
    dap_an_d: 'Chỉ tập trung duy nhất vào thông số kỹ thuật của các dòng máy tính chủ cần mua sắm.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 3, Mục 3.1 (Trang 28): Tầm nhìn số hiệu quả cần ngắn gọn, rõ ràng, truyền cảm hứng và hướng tới tương lai.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_01_03',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Chiến lược chuyển đổi số của doanh nghiệp bắt buộc phải gắn kết chặt chẽ với yếu tố nào?',
    dap_an_a: 'Các trào lưu và xu hướng video ngắn đang nổi tiếng nhất trên các trang mạng xã hội.',
    dap_an_b: 'Mức thu nhập và tổng tài sản tài chính cá nhân của riêng người đứng đầu doanh nghiệp.',
    dap_an_c: 'Mục tiêu chiến lược phát triển chung, sứ mệnh và giá trị cốt lõi của toàn bộ tổ chức.',
    dap_an_d: 'Tổng số lượng máy vi tính để bàn hiện đang được phân bổ trong các phòng ban làm việc.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 3, Mục 3.1 (Trang 29): Chiến lược CĐS không thể tách rời mà phải phục vụ sứ mệnh và mục tiêu cốt lõi của tổ chức.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_01_04',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong quá trình xây dựng và thực thi chiến lược chuyển đổi số, người Lãnh đạo đóng vai trò gì?',
    dap_an_a: 'Chỉ đứng ngoài quan sát và tuyệt đối không can thiệp vào bất kỳ quyết định ứng dụng nào.',
    dap_an_b: 'Định hướng tầm nhìn, cam kết bố trí nguồn lực và trực tiếp dẫn dắt tổ chức vượt qua lực cản.',
    dap_an_c: 'Khoán trắng toàn bộ trách nhiệm và rủi ro chuyển đổi cho riêng trưởng phòng công nghệ thông tin.',
    dap_an_d: 'Chỉ làm nhiệm vụ ký duyệt các hóa đơn thanh toán tiền mua bản quyền phần mềm nước ngoài.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.1 (Trang 29): Người lãnh đạo đóng vai trò kiến trúc sư, dẫn dắt, định hướng và cam kết đồng hành.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_01_05',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong mô hình lộ trình 5 bước của Schallmo, giai đoạn "Digital Reality" tập trung vào nhiệm vụ nào?',
    dap_an_a: 'Khảo sát, phân tích hiện trạng mô hình kinh doanh, chuỗi giá trị và các thách thức đang gặp phải.',
    dap_an_b: 'Triển khai cài đặt hệ thống phần mềm quản trị doanh nghiệp ERP trên quy mô toàn tập đoàn.',
    dap_an_c: 'Đo lường các chỉ số doanh thu và lợi nhuận thực tế đạt được sau 3 năm chuyển đổi số.',
    dap_an_d: 'Tối ưu hóa các thuật toán trí tuệ nhân tạo để tự động hóa việc chấm công nhân viên.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.1 (Trang 30, 33): Digital Reality là bước đầu tiên khảo sát, đánh giá hiện trạng và thách thức trước khi chuyển đổi.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_01_06',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Mục tiêu cốt lõi của giai đoạn "Digital Ambition" trong mô hình Schallmo là:',
    dap_an_a: 'Mua sắm các thiết bị kính thực tế ảo tăng cường cho toàn bộ nhân viên bán hàng.',
    dap_an_b: 'Thử nghiệm các ứng dụng phần mềm nhỏ lẻ trên một nhóm nhỏ khách hàng ngẫu nhiên.',
    dap_an_c: 'Xác định tầm nhìn số, sứ mệnh và đặt ra các mục tiêu chuyển đổi số cụ thể (SMART).',
    dap_an_d: 'Ký hợp đồng thuê đường truyền mạng cáp quang tốc độ cao từ các nhà cung cấp viễn thông.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.1 (Trang 31, 33): Digital Ambition tập trung xác định tầm nhìn số và các mục tiêu chiến lược SMART.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_01_07',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Giai đoạn "Digital Potential" trong mô hình Schallmo hướng trọng tâm vào hoạt động nào?',
    dap_an_a: 'Nghiên cứu bài học thành công, định hình các sáng kiến và kịch bản mô hình kinh doanh số mới.',
    dap_an_b: 'Kiểm tra lỗi bảo mật phần mềm và tiến hành vá các lỗ hổng của hệ thống cơ sở dữ liệu.',
    dap_an_c: 'Đánh giá xếp loại thi đua khen thưởng cuối năm cho đội ngũ nhân viên phòng hành chính.',
    dap_an_d: 'Cắt giảm ngân sách dự phòng và thanh lý các máy tính để bàn đời cũ không còn sử dụng.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.1 (Trang 31, 34): Digital Potential nghiên cứu cơ hội, định hình sáng kiến và kịch bản mô hình kinh doanh số mới.',
    do_kho: 2
  },
  // Câu mở rộng: Nối cặp 5 bước Schallmo
  {
    ma_cau_hoi: 'q_cds_03_01_08',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 giai đoạn của mô hình Schallmo bên Trái và nội dung tương ứng bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'Digital Reality (Thực tế số)', right: 'Khảo sát hiện trạng và nhận diện thách thức' },
        { left: 'Digital Ambition (Tham vọng số)', right: 'Xác định tầm nhìn số và mục tiêu SMART' },
        { left: 'Digital Potential (Tiềm năng số)', right: 'Khám phá bài học kinh nghiệm và mô hình mới' },
        { left: 'Digital Fit (Phù hợp số)', right: 'Sàng lọc giải pháp khả thi với nguồn lực tổ chức' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác 4 bước đầu tiên trong lộ trình 5 bước theo Mô hình Schallmo.',
    do_kho: 2
  },
  // Câu mở rộng: Sắp xếp 5 bước Schallmo
  {
    ma_cau_hoi: 'q_cds_03_01_09',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để sắp xếp đúng trình tự 5 bước theo Mô hình Schallmo:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp chuẩn trình tự 5 bước Schallmo:',
      correct_order: [
        'Digital Reality (Thực tế số)',
        'Digital Ambition (Tham vọng số)',
        'Digital Potential (Tiềm năng số)',
        'Digital Fit (Phù hợp số)',
        'Digital Implementation (Triển khai số)'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Trình tự chuẩn của lộ trình Schallmo: Reality -> Ambition -> Potential -> Fit -> Implementation.',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ
  {
    ma_cau_hoi: 'q_cds_03_01_10',
    ma_moc: 'moc_cds_03_01',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Trong mô hình Schallmo, giai đoạn {blank} đóng vai trò thẩm định, đánh giá tính khả thi và lựa chọn các sáng kiến số phù hợp nhất với văn hóa và nguồn lực tổ chức.',
      options: ['Digital Fit', 'Digital Reality', 'Digital Ambition', 'Digital Potential'],
      blank_answer: 'Digital Fit'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Digital Fit (Phù hợp số) là bước lựa chọn, thẩm định tính khả thi của giải pháp với tổ chức.',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 3.2 (9 câu: 7 câu gốc + 2 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_03_02_01',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Vì sao giai đoạn "Digital Fit" trong mô hình Schallmo lại được đánh giá là đặc biệt quan trọng?',
    dap_an_a: 'Vì giai đoạn này tập trung vào việc sa thải cắt giảm nhân sự nhằm tiết kiệm quỹ lương tối đa.',
    dap_an_b: 'Giúp tổ chức sắp xếp, sàng lọc ưu tiên chiến lược và chọn giải pháp phù hợp nhất với năng lực thực tế.',
    dap_an_c: 'Đảm bảo doanh nghiệp chỉ cần lập kế hoạch trên giấy mà không bao giờ cần phải triển khai dự án.',
    dap_an_d: 'Tạo ra các báo cáo hành chính đẹp mắt để phục vụ mục đích nộp hồ sơ xin cấp giấy phép kinh doanh.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.1 (Trang 31, 35): Digital Fit đánh giá tính khả thi, lựa chọn giải pháp và ưu tiên chiến lược phù hợp nhất với nguồn lực.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_02_02',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 1,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong giai đoạn cuối cùng "Digital Implementation", tổ chức doanh nghiệp sẽ tiến hành công việc gì?',
    dap_an_a: 'Xây dựng lại từ đầu bản tuyên bố sứ mệnh và tầm nhìn chung của hội đồng quản trị.',
    dap_an_b: 'Triển khai công nghệ vào thực tế, thực hiện dự án thử nghiệm (pilot) và đo lường kết quả để nhân rộng.',
    dap_an_c: 'Tiến hành các cuộc khảo sát thị trường trên diện rộng để tìm hiểu nhu cầu của khách hàng mới.',
    dap_an_d: 'Tuyển dụng thêm các cộng tác viên bán hàng trực tiếp tại các quầy hàng chợ truyền thống.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.1 (Trang 32, 36): Digital Implementation thực thi các dự án số, thử nghiệm pilot và đo lường kết quả thực tế.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_02_03',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trình tự thực thi chuẩn xác của 5 giai đoạn trong mô hình chuyển đổi số Schallmo là:',
    dap_an_a: 'Potential $\\rightarrow$ Fit $\\rightarrow$ Reality $\\rightarrow$ Ambition $\\rightarrow$ Implementation.',
    dap_an_b: 'Reality $\\rightarrow$ Ambition $\\rightarrow$ Potential $\\rightarrow$ Fit $\\rightarrow$ Implementation.',
    dap_an_c: 'Ambition $\\rightarrow$ Reality $\\rightarrow$ Fit $\\rightarrow$ Potential $\\rightarrow$ Implementation.',
    dap_an_d: 'Fit $\\rightarrow$ Potential $\\rightarrow$ Reality $\\rightarrow$ Implementation $\\rightarrow$ Ambition.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.1 (Trang 30): Lộ trình chuẩn 5 bước Schallmo: Reality -> Ambition -> Potential -> Fit -> Implementation.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_02_04',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Mục tiêu cốt lõi của công tác Quản trị thay đổi (Change Management) trong chuyển đổi số là gì?',
    dap_an_a: 'Tự động hóa toàn bộ các hoạt động nội bộ bằng phần mềm mà không cần sự hiện diện của nhân viên.',
    dap_an_b: 'Giúp nhân sự hiểu rõ lý do, vượt qua tâm lý e ngại và chủ động thích ứng với phương thức làm việc mới.',
    dap_an_c: 'Giải thể các phòng ban chuyên môn cũ để thành lập các phòng ban mang tên công nghệ mới.',
    dap_an_d: 'Gia tăng số lượng các văn bản quy định và chế tài xử phạt hành chính đối với nhân viên chậm trễ.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.3 (Trang 36-37): Quản trị thay đổi nhằm chuẩn bị, hỗ trợ con người thấu hiểu và thích ứng thành công với phương thức số mới.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_02_05',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong mô hình quản trị thay đổi ADKAR, giai đoạn "Awareness" (Nhận thức) có ý nghĩa là:',
    dap_an_a: 'Nhân viên hiểu rõ lý do và sự cần thiết cấp bách vì sao tổ chức bắt buộc phải thực hiện chuyển đổi số.',
    dap_an_b: 'Nhân viên đã hoàn thành xuất sắc các khóa đào tạo chuyên sâu về kỹ năng viết mã phần mềm.',
    dap_an_c: 'Nhân viên trực tiếp áp dụng thành thạo phần mềm mới vào công việc xử lý số liệu hàng ngày.',
    dap_an_d: 'Tổ chức tiến hành trao thưởng và vinh danh những cá nhân có thành tích xuất sắc nhất tháng.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 3, Mục 3.3 (Trang 37): Awareness (Nhận thức) là giai đoạn đầu tiên giúp cá nhân hiểu rõ lý do tại sao sự thay đổi lại cần thiết.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_02_06',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 3,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Giai đoạn "Desire" (Mong muốn) trong mô hình ADKAR đề cập đến trạng thái tâm lý nào của nhân viên?',
    dap_an_a: 'Sự khao khát, mong muốn cá nhân và cam kết tự nguyện tham gia ủng hộ quá trình chuyển đổi số.',
    dap_an_b: 'Việc đánh giá và chấm điểm định kỳ mức độ hoàn thành nhiệm vụ của các kỹ sư công nghệ.',
    dap_an_c: 'Quá trình tự động hóa các dây chuyền lắp ráp điện tử thông qua việc tích hợp mạng máy tính.',
    dap_an_d: 'Yêu cầu phòng tài chính kế toán xuất các báo cáo doanh thu dưới dạng biểu đồ trực quan.',
    vi_tri_dap_an_dung: 0, // A
    giai_thich: 'Căn cứ Chương 3, Mục 3.3 (Trang 37): Desire (Mong muốn) khơi gợi sự khao khát và cam kết cá nhân tham gia hỗ trợ chuyển đổi.',
    do_kho: 1
  },
  {
    ma_cau_hoi: 'q_cds_03_02_07',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Rào cản tâm lý phổ biến nhất của đội ngũ nhân sự khi doanh nghiệp chuyển đổi sang quy trình số là:',
    dap_an_a: 'Nhân viên quá hào hứng và liên tục đề xuất thêm các sáng kiến công nghệ mới cho ban giám đốc.',
    dap_an_b: 'Tâm lý ngại thay đổi, sợ mất vị thế quyền lực hoặc sợ bị đào thải do thiếu hụt kỹ năng công nghệ mới.',
    dap_an_c: 'Công nghệ được mua sắm luôn quá hoàn hảo đến mức không còn bất kỳ lỗi kỹ thuật nào phát sinh.',
    dap_an_d: 'Doanh nghiệp luôn có nguồn kinh phí dư thừa vô hạn để tài trợ cho mọi hoạt động vui chơi giải trí.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.3 (Trang 38): Tâm lý ngại thay đổi, rời khỏi vùng an toàn là rào cản thách thức phổ biến nhất trong quản trị thay đổi.',
    do_kho: 2
  },
  // Câu mở rộng: Nối cặp ADKAR
  {
    ma_cau_hoi: 'q_cds_03_02_08',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'NOI_CAP',
    noi_dung: 'Chạm chọn 1 chữ cái trong mô hình ADKAR bên Trái và ý nghĩa tương ứng bên Phải:',
    du_lieu_cau_hoi: JSON.stringify({
      pairs: [
        { left: 'A - Awareness (Nhận thức)', right: 'Hiểu rõ lý do vì sao bắt buộc phải thay đổi' },
        { left: 'D - Desire (Mong muốn)', right: 'Khao khát và cam kết tự nguyện tham gia' },
        { left: 'K - Knowledge (Kiến thức)', right: 'Đào tạo kỹ năng và kiến thức sử dụng công cụ mới' },
        { left: 'R - Reinforcement (Củng cố)', right: 'Khen thưởng để duy trì thói quen và không tái phạm' }
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Ghép cặp chuẩn xác các thành phần của mô hình Quản trị thay đổi ADKAR (Prosci).',
    do_kho: 2
  },
  // Câu mở rộng: Điền từ DTI
  {
    ma_cau_hoi: 'q_cds_03_02_09',
    ma_moc: 'moc_cds_03_02',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn tỷ trọng thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'Trong Bộ chỉ số đánh giá chuyển đổi số (DTI) của Việt Nam, trụ cột Chính phủ số chiếm {blank} trong cơ cấu tổng số điểm đánh giá.',
      options: ['40%', '35%', '25%', '50%'],
      blank_answer: '40%'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Bộ chỉ số DTI: Chính phủ số chiếm 40%, Kinh tế số chiếm 35%, Xã hội số chiếm 25%.',
    do_kho: 1
  },

  // ==========================================
  // CHECKPOINT 3.3 [BOSS] (10 câu: 6 câu gốc + 4 câu mở rộng)
  // ==========================================
  {
    ma_cau_hoi: 'q_cds_03_03_01',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trước khi thực hiện chiến lược chuyển đổi số, Tập đoàn bán lẻ Reliance Retail của Ấn Độ đối mặt với thách thức lớn nhất là gì?',
    dap_an_a: 'Tập đoàn hoàn toàn không có bất kỳ cửa hàng bán lẻ truyền thống nào trên toàn lãnh thổ Ấn Độ.',
    dap_an_b: 'Chuỗi cung ứng truyền thống phân tán, khó mở rộng và đối mặt với sự cạnh tranh gay gắt từ Amazon, Flipkart.',
    dap_an_c: 'Không thể tuyển dụng được nhân viên do mức lương đề xuất quá thấp so với mặt bằng chung thị trường.',
    dap_an_d: 'Chính phủ Ấn Độ ban hành luật cấm các tập đoàn lớn kinh doanh mặt hàng nhu yếu phẩm thực phẩm.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.2 (Trang 33): Reliance Retail đối mặt rào cản chuỗi cung ứng truyền thống phân tán và áp lực cạnh tranh gay gắt từ các gã khổng lồ e-commerce ngoại quốc.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_03_02',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 1,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Tầm nhìn chuyển đổi số đột phá của nền tảng JioMart (Reliance) trong giai đoạn Digital Ambition là gì?',
    dap_an_a: 'Xây dựng thêm hàng chục nghìn đại siêu thị mặt đất để tiêu diệt toàn bộ các cửa hàng tạp hóa nhỏ lẻ.',
    dap_an_b: 'Trở thành nền tảng bán lẻ O2O (Online-to-Offline) kết nối hàng triệu cửa hàng Kirana truyền thống.',
    dap_an_c: 'Đóng cửa toàn bộ mảng kinh doanh hàng tiêu dùng để chuyển sang sản xuất linh kiện điện tử vi mạch.',
    dap_an_d: 'Chỉ bán hàng cho các khách hàng giàu có tại các đô thị loại một thông qua website tiếng Anh.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.2 (Trang 33-34): JioMart đặt tầm nhìn xây dựng nền tảng bán lẻ O2O kết nối tiểu thương Kirana thay vì đối đầu tiêu diệt họ.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_03_03',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Sáng kiến số nổi bật nhất của JioMart trong giai đoạn Digital Potential nhằm kết nối khách hàng là gì?',
    dap_an_a: 'Phát hành thẻ mua hàng bằng giấy in ấn truyền thống và gửi qua đường bưu điện cho từng hộ gia đình.',
    dap_an_b: 'Ứng dụng công nghệ số tích hợp việc đặt hàng JioMart trực tiếp ngay trên ứng dụng tin nhắn quốc dân WhatsApp.',
    dap_an_c: 'Xây dựng các tổng đài điện thoại cố định quy mô lớn với hàng nghìn nhân viên trực nghe điện thoại.',
    dap_an_d: 'Tập trung toàn bộ ngân sách để mở các điểm bán hàng trực tiếp trên các tuyến phố đi bộ trung tâm.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.2 (Trang 34): Sáng kiến kết nối cửa hàng Kirana với người tiêu dùng qua ứng dụng WhatsApp với hơn 400 triệu người dùng tại Ấn Độ.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_03_04',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 2,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Bản chất của mô hình O2O (Online-to-Offline) mà JioMart áp dụng thành công rực rỡ là gì?',
    dap_an_a: 'Chỉ cho phép khách hàng đến xem hàng trực tiếp tại siêu thị rồi sau đó về nhà thanh toán tiền mặt.',
    dap_an_b: 'Kết hợp linh hoạt giữa việc đặt hàng trực tuyến trên mạng và nhận hàng/giao hàng trực tiếp từ các cửa hàng Kirana gần nhất.',
    dap_an_c: 'Bán hàng thông qua các kênh quảng cáo truyền hình tương tác vào ban đêm trên các đài địa phương.',
    dap_an_d: 'Vận chuyển hàng hóa trực tiếp từ các kho bãi sản xuất lớn ở nước ngoài về cảng biển trung chuyển.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.2 (Trang 33, 36): Mô hình O2O (Online-to-Offline) kết hợp đặt hàng trực tuyến và mạng lưới cửa hàng Kirana làm điểm phân phối chặng cuối.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_03_05',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Yếu tố quyết định giúp JioMart tăng trưởng thần tốc và xử lý hàng trăm nghìn đơn hàng mỗi ngày trong đại dịch Covid-19 là:',
    dap_an_a: 'Tập đoàn đã cho sa thải toàn bộ nhân viên giao hàng để cắt giảm chi phí tiền lương trong mùa dịch.',
    dap_an_b: 'Hệ sinh thái công nghệ số linh hoạt và mô hình liên kết biến hàng triệu tiệm Kirana thành các kho hàng chặng cuối siêu tốc.',
    dap_an_c: 'Đóng cửa toàn bộ hoạt động kinh doanh trực tuyến để chờ đợi khi nào hết dịch bệnh mới mở lại.',
    dap_an_d: 'Tập trung bán hàng độc quyền các sản phẩm xa xỉ phẩm cho các đại gia bất động sản.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.2.2 (Trang 36): Nền tảng số mạnh mẽ và sự liên kết linh hoạt với mạng lưới Kirana giúp tăng trưởng bứt phá trong đại dịch.',
    do_kho: 2
  },
  {
    ma_cau_hoi: 'q_cds_03_03_06',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 3,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Trong Bộ chỉ số DTI của Việt Nam, cơ cấu tỷ trọng điểm số giữa 3 trụ cột được phân bổ chuẩn xác như thế nào?',
    dap_an_a: 'Chính phủ số: 33.3%, Kinh tế số: 33.3%, Xã hội số: 33.3% chia đều tuyệt đối cho cả 3 trụ cột.',
    dap_an_b: 'Chính phủ số: 40%, Kinh tế số: 35%, Xã hội số: 25% tổng số điểm đánh giá.',
    dap_an_c: 'Chính phủ số: 60%, Kinh tế số: 20%, Xã hội số: 20% tổng số điểm đánh giá.',
    dap_an_d: 'Chính phủ số: 10%, Kinh tế số: 80%, Xã hội số: 10% tổng số điểm đánh giá.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'Căn cứ Chương 3, Mục 3.4 (Trang 39): Bộ chỉ số DTI phân bổ: Chính phủ số chiếm 40%, Kinh tế số chiếm 35%, Xã hội số chiếm 25%.',
    do_kho: 2
  },
  // Câu mở rộng Boss: Tình huống ADKAR xử lý phản kháng nhân viên (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_03_03_07',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Khi bệnh viện triển khai hệ thống Bệnh án điện tử (EMR) thay cho sổ bệnh án giấy, nhiều bác sĩ lâu năm phàn nàn và từ chối sử dụng vì cho rằng "viết tay nhanh hơn bấm bàn phím" và lo ngại làm lộ thông tin bệnh nhân. Ban Giám đốc cần kích hoạt giai đoạn nào đầu tiên trong mô hình ADKAR để giải tỏa sự kháng cự này?',
    dap_an_a: 'Giai đoạn Ability: Bắt buộc các bác sĩ phải thực hiện kỳ thi đánh giá tốc độ gõ bàn phím hàng tuần.',
    dap_an_b: 'Giai đoạn Reinforcement: Phạt tiền trừ lương đối với bất kỳ bác sĩ nào còn cầm bút viết tay.',
    dap_an_c: 'Giai đoạn Awareness: Tổ chức đối thoại giải thích rõ ràng lý do, lợi ích giảm sai sót y khoa và tính bảo mật của bệnh án điện tử.',
    dap_an_d: 'Giai đoạn Knowledge: Đưa các bác sĩ đi đào tạo chuyên sâu về ngôn ngữ lập trình cơ sở dữ liệu SQL.',
    vi_tri_dap_an_dung: 2, // C
    giai_thich: 'Giai đoạn đầu tiên và quan trọng nhất trong ADKAR để giải tỏa kháng cự là Awareness (Nhận thức): nhân viên chỉ ủng hộ khi họ hiểu rõ "Tại sao phải thay đổi?" và "Nếu không thay đổi thì hậu quả là gì?".',
    do_kho: 4
  },
  // Câu mở rộng Boss: Tình huống Đánh giá DTI địa phương (Bloom 4)
  {
    ma_cau_hoi: 'q_cds_03_03_08',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'VAN_DUNG_CAO',
    loai_cau_hoi: 'TRAC_NGHIEM_4',
    noi_dung: 'Một tỉnh đạt điểm rất cao về hạ tầng cáp quang và tỷ lệ số hóa hồ sơ thủ tục hành chính công (Chính phủ số), nhưng tỷ lệ doanh nghiệp sử dụng hợp đồng điện tử và tỷ lệ người dân thanh toán số không tiền mặt lại rất thấp. Tỉnh này cần tập trung cải thiện trụ cột nào trong Bộ chỉ số DTI để cải thiện thứ hạng?',
    dap_an_a: 'Chỉ cần chi thêm ngân sách xây dựng thêm nhiều tòa nhà trụ sở ủy ban nhân dân tỉnh khang trang hơn.',
    dap_an_b: 'Tập trung cải thiện 2 trụ cột: Kinh tế số (thúc đẩy DN dùng nền tảng số) và Xã hội số (phổ cập kỹ năng số và thanh toán số cho người dân).',
    dap_an_c: 'Cắt giảm bớt các trạm phát sóng viễn thông 4G/5G để dồn kinh phí in ấn thêm tờ rơi hướng dẫn.',
    dap_an_d: 'Ngừng công bố chỉ số DTI hàng năm để tránh bị so sánh với các tỉnh thành phố lân cận.',
    vi_tri_dap_an_dung: 1, // B
    giai_thich: 'DTI đo lường cả 3 trụ cột (Chính phủ số 40%, Kinh tế số 35%, Xã hội số 25%). Khi Chính phủ số đã tốt nhưng thương mại và người dân chưa số hóa, tỉnh phải tập trung nâng cao chỉ số Kinh tế số và Xã hội số.',
    do_kho: 4
  },
  // Câu mở rộng Boss: Sắp xếp ADKAR
  {
    ma_cau_hoi: 'q_cds_03_03_09',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'HIEU',
    loai_cau_hoi: 'SAP_XEP_CAU',
    noi_dung: 'Chạm vào các thẻ từ để sắp xếp đúng trình tự 5 giai đoạn tâm lý trong mô hình ADKAR:',
    du_lieu_cau_hoi: JSON.stringify({
      prompt: 'Sắp xếp chuẩn trình tự 5 giai đoạn ADKAR:',
      correct_order: [
        'Awareness (Hiểu lý do cần thay đổi)',
        'Desire (Khao khát và cam kết tham gia)',
        'Knowledge (Học hỏi kiến thức kỹ năng số)',
        'Ability (Chuyển hóa thành năng lực thực hành)',
        'Reinforcement (Khen thưởng và củng cố thói quen)'
      ]
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Quy trình chuẩn ADKAR: Awareness -> Desire -> Knowledge -> Ability -> Reinforcement.',
    do_kho: 2
  },
  // Câu mở rộng Boss: Điền từ
  {
    ma_cau_hoi: 'q_cds_03_03_10',
    ma_moc: 'moc_cds_03_03',
    buoc_luyen_tap: 4,
    muc_bloom: 'NHO',
    loai_cau_hoi: 'DIEN_TU',
    noi_dung: 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:',
    du_lieu_cau_hoi: JSON.stringify({
      sentence_template: 'JioMart của tập đoàn Reliance Retail đã áp dụng mô hình bán lẻ {blank}, kết nối người mua trực tuyến với hơn 15 triệu tiệm tạp hóa Kirana truyền thống tại Ấn Độ.',
      options: ['O2O (Online-to-Offline)', 'B2B thuần túy', 'C2C phi tập trung', 'Bán hàng đa cấp'],
      blank_answer: 'O2O (Online-to-Offline)'
    }),
    vi_tri_dap_an_dung: null,
    giai_thich: 'Mô hình O2O (Online-to-Offline) là chìa khóa thành công của JioMart.',
    do_kho: 1
  }
];

module.exports = { checkpointsCh3, questionsCh3 };
