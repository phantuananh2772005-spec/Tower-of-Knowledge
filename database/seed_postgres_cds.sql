-- =======================================================================
-- SEED DATA: seed_postgres_cds.sql
-- Course: Chuyen doi so & Kinh te so (mon_cds / chuyen-doi-so)
-- Auto-generated with 6 Chapters, 18 Checkpoints, 174 Questions
-- =======================================================================

-- 1. MON HOC
INSERT INTO mon_hoc (ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu)
VALUES ('mon_cds', 'Chuyển đổi số & Kinh tế số (Digital Transformation)', 'chuyen-doi-so', 'Giáo trình đào tạo toàn diện chuẩn Đại học về Chuyển đổi số, Hạ tầng dữ liệu, Kinh tế số, Công nghệ 4.0, Chính phủ số & Kỹ năng số cho kỷ nguyên mới.', 'banner_cds.jpg', 2)
ON CONFLICT (ma_mon) DO UPDATE SET
  ten_mon = EXCLUDED.ten_mon,
  slug = EXCLUDED.slug,
  mo_ta = EXCLUDED.mo_ta,
  anh_bia = EXCLUDED.anh_bia,
  thu_tu = EXCLUDED.thu_tu;

-- 2. CHUONG HOC (6 CHUONG)
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES ('ch_cds_01', 'mon_cds', 'Chương 1: Tổng quan về Chuyển đổi số', 1, 'Khái niệm số hóa vs chuyển đổi số, 3 trụ cột CĐS quốc gia (QĐ 749/QĐ-TTg) và bài học thất bại sống còn giữa Nokia và Apple iPhone.')
ON CONFLICT (ma_chuong) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  thu_tu = EXCLUDED.thu_tu,
  mo_ta = EXCLUDED.mo_ta;
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES ('ch_cds_02', 'mon_cds', 'Chương 2: Dữ liệu và Quản trị dữ liệu số', 2, 'Dữ liệu như nguồn dầu mỏ mới, chu trình quản trị dữ liệu (Thu thập -> Xử lý -> Chia sẻ), Open Data và Luật Bảo vệ dữ liệu cá nhân NĐ 13/2023.')
ON CONFLICT (ma_chuong) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  thu_tu = EXCLUDED.thu_tu,
  mo_ta = EXCLUDED.mo_ta;
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES ('ch_cds_03', 'mon_cds', 'Chương 3: Kinh tế số & Mô hình kinh doanh số', 3, '3 cấu phần kinh tế số theo OECD, kinh tế nền tảng hai phía, mô hình O2O JioMart - Kirana, Highlands Coffee và cơ cấu chỉ số DTI Việt Nam.')
ON CONFLICT (ma_chuong) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  thu_tu = EXCLUDED.thu_tu,
  mo_ta = EXCLUDED.mo_ta;
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES ('ch_cds_04', 'mon_cds', 'Chương 4: Các công nghệ cốt lõi trong Chuyển đổi số', 4, 'Trí tuệ nhân tạo (AI y tế DrAid VinBrain), Đám mây Make in Vietnam, Dữ liệu lớn Tiki/Shopee, IoT VNPT SmartAgri và Blockchain TPBank.')
ON CONFLICT (ma_chuong) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  thu_tu = EXCLUDED.thu_tu,
  mo_ta = EXCLUDED.mo_ta;
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES ('ch_cds_05', 'mon_cds', 'Chương 5: Xã hội số, Chính phủ số & Ngành trọng yếu', 5, 'Công dân số thời 4.0, thanh toán MoMo/VNPay, Trục NDXP, phòng họp eCabinet, ERP doanh nghiệp, CĐS Y tế - Giáo dục và bài học thành công Amazon.')
ON CONFLICT (ma_chuong) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  thu_tu = EXCLUDED.thu_tu,
  mo_ta = EXCLUDED.mo_ta;
INSERT INTO chuong_hoc (ma_chuong, ma_mon, tieu_de, thu_tu, mo_ta)
VALUES ('ch_cds_06', 'mon_cds', 'Chương 6: Kỹ năng số, Phân tích dữ liệu & An toàn thông tin', 6, 'Nghệ thuật Prompting AI, thẩm định nguồn tin số CRAAP, phân tích DataFrame & Power BI, an toàn số phòng chống Phishing và bảo vệ 2FA.')
ON CONFLICT (ma_chuong) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  thu_tu = EXCLUDED.thu_tu,
  mo_ta = EXCLUDED.mo_ta;

-- 3. MOC BAI HOC (18 MOC)
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_01_01', 'ch_cds_01', 'Mốc 1.1: Khái niệm Cốt lõi & Ranh giới Số hóa - Tin học hóa - CĐS', 'TRAC_NGHIEM', '### 1. Số hóa (Digitization)
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
- **Mối quan hệ kế thừa**: **Số hóa** (điều kiện cần, tạo nguyên liệu) $\rightarrow$ **Tin học hóa** (bước đệm tối ưu quy trình) $\rightarrow$ **Chuyển đổi số** (đích đến thay đổi mô hình và tạo giá trị mới).', 20, 15, 1, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_01_02', 'ch_cds_01', 'Mốc 1.2: Ba Làn Sóng 4.0 & Năm Cấp Độ Trưởng Thành Số', 'TRAC_NGHIEM', '### 1. Ba làn sóng công nghệ trong 30 năm qua
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
- **Thách thức**: Thiếu hụt kỹ năng số, văn hóa ngại thay đổi, thiếu chiến lược từ lãnh đạo, rủi ro an ninh mạng và chi phí đầu tư ban đầu.', 20, 15, 2, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_01_03', 'ch_cds_01', 'Mốc 1.3 [BOSS]: Thảm Họa Nokia & Sáng Tạo Phá Hủy', 'THU_THACH_BOSS', '### 1. Khái niệm Sáng tạo phá hủy (Disruptive Innovation)
Sáng tạo phá hủy là sự đổi mới mang tính cách mạng, tạo ra một thị trường và mạng lưới giá trị hoàn toàn mới, làm suy giảm hoặc phá vỡ vị thế thống trị của các doanh nghiệp truyền thống dẫn đầu.

### 2. Case study kinh điển: Thảm họa Nokia vs iPhone/Android
- Năm 2007, Tập đoàn Nokia nắm giữ hơn **50% thị phần điện thoại di động toàn cầu** với dòng máy phím cứng và hệ điều hành Symbian cổ điển.
- Sự ra đời của Apple iPhone (2007) và Google Android (2008) mang đến màn hình cảm ứng điện dung cùng hệ sinh thái ứng dụng trực tuyến App Store / Google Play.
- Nokia chậm trễ trong nhận thức, vẫn coi điện thoại chỉ là thiết bị thoại cơ học thay vì một "nền tảng máy tính bỏ túi đa dịch vụ". Chỉ trong vài năm, thị phần của Nokia rơi tự do xuống dưới 2% và buộc phải bán mảng di động cho Microsoft.

### 3. Case study: Ngân hàng số không chi nhánh (Digital-only Banking)
- Ngân hàng truyền thống cần hàng trăm chi nhánh, trụ sở nguy nga và đội ngũ giao dịch viên thủ công.
- Ngân hàng số (Alipay, Timo, Cake) cho phép mở tài khoản trực tuyến tức thì bằng eKYC, xử lý hàng chục nghìn giao dịch mỗi giây, quản lý hàng trăm tỷ USD tiền gửi mà không cần một chi nhánh vật lý nào.', 35, 30, 3, 5, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_02_01', 'ch_cds_02', 'Mốc 2.1: Dữ liệu Tài sản Cốt lõi & Nghị định 13/2023/NĐ-CP', 'TRAC_NGHIEM', '### 1. Dữ liệu - "Nguồn tài nguyên mới"
- Trong kỷ nguyên số, dữ liệu được ví như **nguồn tài nguyên mới, "dầu mỏ" hay "nhiên liệu"** vận hành toàn bộ nền kinh tế số.
- Chuyển đổi từ mô hình quản trị theo kinh nghiệm cảm tính sang mô hình **quản trị thông minh, ra quyết định dựa trên bằng chứng dữ liệu (data-driven)**.

### 2. Quy trình quản trị & khai thác dữ liệu 3 bước
1. **Thu thập dữ liệu**: Tự động ghi nhận từ cảm biến IoT, camera thông minh, lịch sử giao dịch trực tuyến, nhật ký ứng dụng và mạng xã hội.
2. **Xử lý và phân tích**: Dữ liệu thô được làm sạch (Data Cleaning), chuẩn hóa và phân tích bằng các thuật toán Big Data, AI và Data Mining nhằm phát hiện các tri thức ẩn.
3. **Khai thác và chia sẻ**: Dữ liệu chỉ tạo ra giá trị cao nhất khi được **kết nối, chia sẻ liên thông và tái sử dụng** an toàn giữa các bộ phận, doanh nghiệp hoặc cơ quan nhà nước qua cổng Dữ liệu mở (Open Data).

### 3. Đạo đức và Pháp lý dữ liệu: Nghị định 13/2023/NĐ-CP
- **Nghị định 13/2023/NĐ-CP** (hiệu lực từ 01/07/2023) là văn bản pháp quy quan trọng nhất của Việt Nam về **Bảo vệ dữ liệu cá nhân**.
- Quy định rõ quyền của chủ thể dữ liệu (biết, đồng ý, xóa dữ liệu) và nghĩa vụ bắt buộc của các tổ chức thu thập, xử lý dữ liệu phải áp dụng các biện pháp bảo mật, phòng chống rò rỉ thông tin cá nhân.', 20, 15, 1, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_02_02', 'ch_cds_02', 'Mốc 2.2: Bộ Tứ Công Nghệ Nền Tảng & Hình Tượng Cơ Thể Người', 'TRAC_NGHIEM', '### 1. Hình tượng ví von Công nghệ với Cơ thể người
- **IoT (Internet of Things)** = **Giác quan**: Thu nhận tín hiệu từ môi trường thực (nhiệt độ, độ ẩm, hình ảnh, âm thanh) và truyền dữ liệu về trung tâm.
- **Big Data** = **Bộ não / Kho tri thức**: Lưu trữ lượng dữ liệu khổng lồ với đặc trưng 3Vs (Volume - Quy mô lớn, Variety - Đa dạng, Velocity - Tốc độ nhanh).
- **Cloud Computing** = **Cơ bắp**: Cung cấp sức mạnh tính toán, lưu trữ co giãn linh hoạt theo nhu cầu mà không cần mua máy chủ vật lý.
- **AI (Trí tuệ nhân tạo)** = **Trí tuệ suy luận**: Xử lý dữ liệu, học hỏi và đưa ra dự đoán thông minh.
- **Blockchain** = **Sổ cái bất biến / Trí nhớ minh bạch**: Lưu trữ dữ liệu phân tán, chống sửa đổi, mã hóa bảo mật cao.

### 2. Nền tảng No-code / Low-code
- Cho phép người dùng nghiệp vụ (không có chuyên môn lập trình) kéo thả để tạo ra ứng dụng nhanh chóng, giúp rút ngắn thời gian triển khai từ nhiều tháng xuống vài ngày.', 20, 15, 2, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_02_03', 'ch_cds_02', 'Mốc 2.3 [BOSS]: Hạ Tầng Số NQ 03 & Kiềng Ba Chân Hợp Nhất', 'THU_THACH_BOSS', '### 1. Hạ tầng số quốc gia theo Nghị quyết 03/NQ-CP
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
- **Dữ liệu là Nhiên liệu** $\leftrightarrow$ **Công nghệ là Động cơ** $\leftrightarrow$ **Con người là Người lái**.
- Chuyển đổi số chỉ thành công khi cả 3 yếu tố này kết hợp hài hòa trong một hệ thống thống nhất.', 35, 30, 3, 5, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_03_01', 'ch_cds_03', 'Mốc 3.1: Tầm Nhìn Chiến Lược & Lộ Trình 5 Bước Schallmo', 'TRAC_NGHIEM', '### 1. Tầm nhìn và Chiến lược Chuyển đổi số
- **Tầm nhìn số**: Bức tranh dài hạn, ngắn gọn, truyền cảm hứng và định hướng tương lai số của tổ chức.
- **Chiến lược số**: Kế hoạch tổng thể để hiện thực hóa tầm nhìn thông qua các mục tiêu cụ thể (SMART), **phải gắn liền và phục vụ trực tiếp mục tiêu phát triển cốt lõi của tổ chức**, không được tách rời.

### 2. Lộ trình 5 bước theo Mô hình Schallmo (Schallmo Roadmap)
1. **Digital Reality (Thực tế số)**: Khảo sát, đánh giá hiện trạng mô hình kinh doanh, quy trình, hạ tầng CNTT và những thách thức đang gặp phải.
2. **Digital Ambition (Tham vọng số)**: Xác định tầm nhìn số, sứ mệnh và thiết lập các mục tiêu chuyển đổi số cụ thể (SMART).
3. **Digital Potential (Tiềm năng số)**: Nghiên cứu các bài học thành công (best practices), định hình các sáng kiến số và kịch bản mô hình kinh doanh tiềm năng.
4. **Digital Fit (Phù hợp số)**: Đánh giá, sàng lọc và lựa chọn các giải pháp công nghệ phù hợp nhất với năng lực, nguồn lực tài chính và văn hóa tổ chức.
5. **Digital Implementation (Triển khai số)**: Thực thi các dự án thử nghiệm (pilot), đo lường kết quả, hoàn thiện và nhân rộng ra toàn bộ hệ thống.', 20, 15, 1, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_03_02', 'ch_cds_03', 'Mốc 3.2: Quản Trị Thay Đổi ADKAR & Bộ Chỉ Số DTI Việt Nam', 'TRAC_NGHIEM', '### 1. Quản trị thay đổi (Change Management) & Mô hình ADKAR
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
- **Triết lý**: "Không đo lường thì không quản lý được. Không quản lý thì không chuyển đổi số thành công được".', 20, 15, 2, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_03_03', 'ch_cds_03', 'Mốc 3.3 [BOSS]: Đại Chiến Bán Lẻ JioMart O2O & Kirana Ấn Độ', 'THU_THACH_BOSS', '### 1. Bối cảnh và Thách thức của Reliance Retail
- Reliance Retail là tập đoàn bán lẻ lớn nhất Ấn Độ nhưng đối mặt với chuỗi cung ứng phân tán và sự thâm nhập thần tốc của Amazon và Flipkart.
- Toàn Ấn Độ có hơn **15 triệu cửa hàng tạp hóa truyền thống nhỏ lẻ (Kirana)** len lỏi khắp mọi ngõ ngách, chiếm 90% doanh số bán lẻ cả nước.

### 2. Ứng dụng Mô hình Schallmo tại JioMart
- **Digital Reality**: Nhận ra điểm nghẽn chuỗi cung ứng và sức mạnh mạng lưới của 15 triệu tiệm Kirana.
- **Digital Ambition**: Tầm nhìn xây dựng nền tảng bán lẻ O2O (Online-to-Offline) hàng đầu, hợp tác kết nối Kirana thay vì tiêu diệt họ.
- **Digital Potential**: Sáng kiến tích hợp ứng dụng đặt hàng JioMart ngay trên WhatsApp (ứng dụng nhắn tin quốc dân có 400+ triệu người dùng ở Ấn Độ).
- **Digital Fit**: Mô hình đôi bên cùng có lợi: Reliance cung cấp nguồn hàng giá sỉ và máy POS thông minh; Kirana đóng vai trò kho hàng chặng cuối (last-mile delivery) giao hàng siêu tốc trong 30 phút.
- **Digital Implementation**: Trang bị thiết bị số cho hàng triệu Kirana, bùng nổ doanh số trong đại dịch Covid-19 với hàng trăm nghìn đơn mỗi ngày.', 35, 30, 3, 5, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_04_01', 'ch_cds_04', 'Mốc 4.1: Trí Tuệ Nhân Tạo & Điện Toán Đám Mây Make In Vietnam', 'TRAC_NGHIEM', '### 1. Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)
- **Trong y tế**: AI phân tích hình ảnh y khoa chẩn đoán chính xác hơn và phát hiện sớm các bệnh hiểm nghèo. Tiêu biểu tại Việt Nam là nền tảng **DrAid™ của VinBrain** ứng dụng AI phân tích ảnh chụp X-quang để phát hiện hàng chục bệnh lý phổi và ung thư.
- **Trong giáo dục**: AI giúp cá nhân hóa lộ trình học tập, tiêu biểu như ứng dụng học ngôn ngữ **Duolingo** dùng AI để tự động phân tích điểm yếu và gợi ý bài học phù hợp cho từng cá nhân.
- **Trong ngân hàng & tài chính**: AI tự động hóa quy trình nghiệp vụ, nhận diện hành vi bất thường và phát hiện các giao dịch gian lận thẻ tín dụng trong mili-giây.

### 2. Điện toán đám mây (Cloud Computing)
- **Lợi ích cốt lõi**: Khả năng triển khai dịch vụ cực nhanh, linh hoạt mở rộng quy mô tính toán tức thì theo lượng truy cập và tối ưu chi phí hạ tầng.
- **Trường hợp điển hình**: **Netflix** sử dụng hạ tầng Cloud để lưu trữ kho phim khổng lồ và phát trực tuyến (streaming) mượt mà cho hàng trăm triệu người dùng trên toàn cầu cùng lúc.
- **Hạ tầng Cloud "Make in Vietnam"**: Để bảo đảm an toàn an ninh mạng và chủ quyền dữ liệu số quốc gia, Việt Nam đã xây dựng 4 nền tảng Cloud lớn đạt chuẩn quốc tế: **VNPT Cloud, Viettel Cloud, CMC Cloud và FPT Cloud**.', 20, 15, 1, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_04_02', 'ch_cds_04', 'Mốc 4.2: Dữ Liệu Lớn Thương Mại Điện Tử & IoT VNPT SmartAgri', 'TRAC_NGHIEM', '### 1. Dữ liệu lớn (Big Data)
- **Khác biệt cốt lõi**: Khối lượng cực lớn (Volume), đa dạng nhiều định dạng có cấu trúc và phi cấu trúc (Variety), và tốc độ sinh ra cập nhật theo thời gian thực rất nhanh (Velocity).
- **Ứng dụng thương mại điện tử**: Các sàn như **Tiki, Shopee, Lazada** phân tích lịch sử duyệt web, giỏ hàng để gợi ý sản phẩm cá nhân hóa và dự đoán xu hướng tiêu dùng theo mùa.
- **Cơ sở dữ liệu quốc gia về dân cư**: Ví dụ điển hình của Big Data trong khu vực công tại Việt Nam, quản lý thông tin của gần 100 triệu người dân, liên thông giải quyết thủ tục hành chính.

### 2. Internet vạn vật (IoT) trong Đời sống & Nông nghiệp
- **Khái niệm**: Mạng lưới các thiết bị, máy móc có gắn cảm biến kết nối Internet để tự động thu thập và trao đổi dữ liệu mà không cần con người can thiệp trực tiếp.
- **Nhà thông minh (Smart Home)**: Điều khiển đèn, rèm cửa, điều hòa nhiệt độ từ xa hoặc qua khẩu lệnh giọng nói.
- **Nông nghiệp thông minh (Smart Agriculture)**: Nền tảng **VNPT SmartAgri** sử dụng mạng cảm biến IoT đo độ ẩm đất, độ ẩm không khí, nồng độ pH/EC để tự động kích hoạt hệ thống tưới tiêu và cảnh báo sâu bệnh kịp thời.', 20, 15, 2, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_04_03', 'ch_cds_04', 'Mốc 4.3 [BOSS]: Blockchain TPBank & Chống Giả Mạo Văn Bằng', 'THU_THACH_BOSS', '### 1. Công nghệ Chuỗi khối (Blockchain)
- **Đặc tính kỹ thuật**: Sổ cái phân tán (Distributed Ledger), phi tập trung, mã hóa bảo mật bằng thuật toán mật mã học và **tính bất biến** (dữ liệu một khi đã ghi vào khối thì cực kỳ khó hoặc không thể bị sửa đổi hay làm giả).

### 2. Các ứng dụng thực tế đột phá của Blockchain
- **Truy xuất nguồn gốc nông sản**: Ghi nhận bất biến toàn bộ hành trình từ gieo hạt, bón phân, thu hoạch đến đóng gói vận chuyển. Người tiêu dùng chỉ cần quét mã QR là biết rõ toàn bộ chuỗi cung ứng minh bạch.
- **Chống gian lận bằng cấp (Education Credentialing)**: Các viện đại học hàng đầu như **MIT và Harvard** đã ứng dụng Blockchain để phát hành văn bằng, chứng chỉ số bất biến, giúp nhà tuyển dụng xác thực tức thì và loại bỏ hoàn toàn nạn bằng giả.
- **Tài chính - Ngân hàng**: Tại Việt Nam, **TPBank** là ngân hàng tiên phong ứng dụng công nghệ Blockchain (qua mạng lưới liên ngân hàng quốc tế RippleNet) giúp chuyển tiền quốc tế an toàn, minh bạch và hoàn tất chỉ trong vài phút thay vì nhiều ngày.', 35, 30, 3, 5, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_05_01', 'ch_cds_05', 'Mốc 5.1: Xã Hội Số & Chuẩn Mực Công Dân Số Thời Đại 4.0', 'TRAC_NGHIEM', '### 1. Bản chất của Xã hội số
- **Định nghĩa**: Xã hội số là xã hội tích hợp sâu sắc công nghệ số vào mọi mặt đời sống nhân dân, lấy **người dân làm trung tâm**, hướng tới việc nâng cao chất lượng cuộc sống, tạo bình đẳng về cơ hội tiếp cận dịch vụ và **thu hẹp khoảng cách số** giữa thành thị với nông thôn, vùng sâu vùng xa.
- **3 Trụ cột Quốc gia (QĐ 749/QĐ-TTg)**:
  1. **Chính phủ số**: Nâng cao năng lực quản trị công, cung cấp dịch vụ công trực tuyến toàn trình mọi lúc, mọi nơi.
  2. **Kinh tế số**: Phát triển doanh nghiệp công nghệ số, kinh tế nền tảng và gia tăng tỷ trọng kinh tế số trong GDP.
  3. **Xã hội số**: Phổ cập kỹ năng số toàn dân, hình thành nếp sống số văn minh, an toàn và hòa nhập.

### 2. Công dân số & Thanh toán không tiền mặt
- **Công dân số (Digital Citizen)**: Cá nhân sở hữu danh tính số tin cậy, thành thạo kỹ năng số, có ý thức đạo đức, văn hóa trên không gian mạng và năng lực học tập suốt đời.
- **Thanh toán không dùng tiền mặt**: Được thúc đẩy mạnh mẽ qua các ví điện tử (MoMo, ZaloPay, Viettel Money), ứng dụng ngân hàng số quét mã VietQR và tài khoản Mobile Money, giúp minh bạch dòng tiền và tối ưu giao dịch xã hội.
- **Dịch vụ y tế & giáo dục số**: Ứng dụng VNeID tích hợp BHYT điện tử, Sổ sức khỏe điện tử (theo dõi lịch sử tiêm chủng, khám chữa bệnh) và các nền tảng học tập số mở rộng tri thức không giới hạn.', 20, 15, 1, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_05_02', 'ch_cds_05', 'Mốc 5.2: Chính Phủ Số, Trục NDXP & Họp Không Giấy eCabinet', 'TRAC_NGHIEM', '### 1. Chuyển đổi số trong Khu vực công (Chính phủ số)
- **Mục tiêu then chốt**: Chuyển từ "quản lý hành chính thủ công sang phục vụ nhân dân dựa trên dữ liệu", nâng cao tính minh bạch, giảm giấy tờ và giải quyết thủ tục hành chính mọi lúc mọi nơi.
- **Nền tảng tích hợp, chia sẻ dữ liệu quốc gia (NDXP)**: Trục xương sống kết nối và luân chuyển dữ liệu liên thông giữa các bộ, cơ quan ngang bộ, cơ quan thuộc Chính phủ và 63 tỉnh/thành phố trên cả nước, xóa bỏ tình trạng "cát cứ thông tin".
- **Hệ thống eCabinet (Phòng họp không giấy tờ)**: Đưa toàn bộ tài liệu các phiên họp Chính phủ và UBND các cấp lên môi trường số an toàn, cho phép biểu quyết tức thì qua máy tính bảng, tiết kiệm hàng chục tỷ đồng in ấn mỗi năm.
- **Thách thức lớn nhất**: Tình trạng dữ liệu phân tán (Data Silos), thiếu hụt nguồn nhân lực công nghệ cao tại cơ quan nhà nước và rào cản tâm lý ngại đổi mới quy trình cũ.

### 2. Cấp độ chuyển đổi số trong Doanh nghiệp
- **Digitization (Số hóa thông tin)**: Chuyển dữ liệu vật lý (hồ sơ giấy, sổ sách kế toán ghi tay) sang dạng số (PDF, file scan, Excel).
- **Digitalization (Số hóa quy trình)**: Tích hợp phần mềm vào quy trình vận hành (CRM, ERP, HRM) để tự động hóa nghiệp vụ và nâng cao hiệu suất làm việc nội bộ.
- **Digital Transformation (Chuyển đổi số toàn diện)**: Tái cấu trúc mô hình kinh doanh, văn hóa tổ chức và trải nghiệm khách hàng dựa trên nền tảng dữ liệu số.
- **Hệ thống ERP (Enterprise Resource Planning)**: Nền tảng hợp nhất dữ liệu tài chính, kho vận, nhân sự và sản xuất trên một cơ sở dữ liệu duy nhất.', 20, 15, 2, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_05_03', 'ch_cds_05', 'Mốc 5.3 [BOSS]: CĐS 5 Ngành Trọng Điểm & Bài Học Thành Công Amazon', 'THU_THACH_BOSS', '### 1. Chuyển đổi số trong 5 Ngành trọng yếu
- **Giáo dục số**: Đào tạo trực tuyến kết hợp (Blended Learning) với chỉ tiêu tối thiểu 20% thời lượng chương trình, số hóa học liệu mở OER và cá nhân hóa trải nghiệm học theo năng lực người học.
- **Tài chính - Ngân hàng**: Kiến trúc ngân hàng mở (Open Banking API), định danh điện tử eKYC mở tài khoản trong 1 phút, tích hợp FinTech và thanh toán xuyên biên giới.
- **Nông nghiệp thông minh**: Ứng dụng cảm biến IoT đo độ ẩm đất, thiết bị bay không người lái (Drone) phun thuốc chính xác và truy xuất nguồn gốc nông sản xuất khẩu qua mã QR/Blockchain.
- **Y tế số**: Bệnh án điện tử (EMR) thay thế hoàn toàn sổ khám giấy, hệ thống PACS truyền hình ảnh y khoa không cần phim và hội chẩn khám bệnh từ xa (Telehealth).

### 2. Điểm chung cốt lõi của các bài học thành công
- **Kinh nghiệm từ Amazon**: Triết lý "Customer Obsession" (Lấy khách hàng làm trung tâm), tự động hóa kho hàng bằng robot Kiva, tối ưu chuỗi cung ứng thông minh và văn hóa sẵn sàng thử nghiệm thất bại nhanh.
- **Nguyên lý vàng**: **Chuyển đổi số bản chất là chuyển đổi về CON NGƯỜI, VĂN HÓA và QUY TRÌNH; Công nghệ chỉ đóng vai trò là công cụ hỗ trợ (Enabler).** Nếu chỉ mua phần mềm đắt tiền mà không đổi mới tư duy và quy trình làm việc thì chuyển đổi số chắc chắn thất bại.', 35, 30, 3, 5, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_06_01', 'ch_cds_06', 'Mốc 6.1: Bộ Công Cụ Số, Nghệ Thuật Prompting AI & Mô Hình CRAAP', 'TRAC_NGHIEM', '### 1. Vai trò của Trí tuệ nhân tạo (AI) và Công cụ số Doanh nghiệp
- **AI trong tự động hóa**: Giúp giải phóng con người khỏi **các tác vụ lặp đi lặp lại** (như nhập liệu, phân loại email, trích xuất hóa đơn), giúp nhân sự tập trung vào tư duy sáng tạo và chiến lược.
- **Hệ thống ERP và CRM**: Nền tảng cốt lõi giúp doanh nghiệp **tích hợp dữ liệu liên phòng ban và tối ưu hóa toàn bộ quy trình** vận hành, sản xuất và chăm sóc khách hàng.
- **Công cụ Business Intelligence (Power BI, Tableau)**: Dùng để **trực quan hóa và phân tích chuyên sâu dữ liệu**, biến hàng triệu dòng số thô thành các báo cáo biểu đồ trực quan phục vụ ra quyết định tức thì.
- **Nền tảng Điện toán đám mây (Cloud)**: Hỗ trợ đắc lực việc **lưu trữ dữ liệu an toàn, cộng tác thời gian thực và làm việc từ xa linh hoạt**.

### 2. Kỹ năng Prompting & Thẩm định thông tin CRAAP
- **Kỹ năng Prompting**: Nghệ thuật thiết kế câu lệnh để **giao tiếp hiệu quả với AI tạo sinh (GenAI)**, cung cấp đầy đủ bối cảnh (Context), vai trò (Role), nhiệm vụ cụ thể (Task) và định dạng mong muốn.
- **Tư duy phản biện số (Critical Evaluation)**: Kỹ năng **kiểm tra, phân tích và đánh giá tính đúng đắn, khách quan** của thông tin trên mạng trước khi tin tưởng hoặc chia sẻ.
- **Kỹ thuật tìm kiếm với Google**: Sử dụng toán tử tìm kiếm nâng cao (như `site:edu.vn` để giới hạn kết quả trong các trang web giáo dục đào tạo chính thống tại Việt Nam).
- **Mô hình CRAAP đánh giá nguồn tin số**:
  - **C (Currency)**: Tính hiện tại, tính mới và thời điểm cập nhật của thông tin.
  - **R (Relevance)**: Mức độ liên quan và phù hợp của thông tin đối với đề tài nghiên cứu.
  - **A (Authority)**: Uy tín, thẩm quyền và danh tính của tác giả hoặc tổ chức phát hành.
  - **A (Accuracy)**: Độ chính xác, tính trung thực và khả năng kiểm chứng nguồn dữ liệu.
  - **P (Purpose)**: Mục đích xuất bản thông tin (chia sẻ học thuật, giải trí hay quảng cáo trục lợi).', 20, 15, 1, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_06_02', 'ch_cds_06', 'Mốc 6.2: Khoa Học Dữ Liệu Với DataFrame, Làm Sạch & Trực Quan Hóa', 'TRAC_NGHIEM', '### 1. Cấu trúc dữ liệu & Quy trình Làm sạch dữ liệu
- **Lưu trữ đám mây (Google Drive, OneDrive)**: Công cụ tiêu biểu để **lưu trữ, sao lưu và sắp xếp thông tin** số khoa học, hỗ trợ làm việc nhóm đa nền tảng.
- **DataFrame trong Khoa học dữ liệu**: Cấu trúc dữ liệu dạng **bảng hai chiều gồm nhiều dòng và nhiều cột** (phổ biến trong thư viện Pandas của Python hoặc các bảng tính), trong đó mỗi cột đại diện cho một thuộc tính và mỗi dòng là một bản ghi.
- **Mục tiêu của Làm sạch dữ liệu (Data Cleaning)**: Bước bắt buộc đầu tiên trong phân tích dữ liệu nhằm **loại bỏ lỗi sai, xử lý giá trị bị khuyết (missing values), xóa bỏ các bản ghi trùng lặp (duplicates)** và chuẩn hóa định dạng số liệu, đảm bảo dữ liệu đầu vào chuẩn xác.

### 2. Trực quan hóa dữ liệu & Tư duy số (Digital Literacy)
- **Lựa chọn biểu đồ chuẩn trong phân tích số liệu**:
  - **Biểu đồ đường (Line Chart)**: Thể hiện **xu hướng biến thiên, tăng trưởng của dữ liệu theo chuỗi thời gian** (doanh thu theo tháng, nhiệt độ theo giờ).
  - **Biểu đồ tròn (Pie Chart)**: Thể hiện cơ cấu tỷ lệ phần trăm các thành phần trong một tổng thể 100%.
  - **Biểu đồ cột (Bar Chart)**: So sánh tương quan độ lớn giữa các danh mục độc lập.
- **Khung năng lực Tư duy số (Digital Literacy)**: Bao gồm đọc hiểu dữ liệu, phân tích thông tin số, giao tiếp số văn minh, an toàn bảo mật; **không bao gồm việc bắt buộc phải lập trình chuyên sâu hệ thống máy chủ (Backend Programming)**.', 20, 15, 2, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;
INSERT INTO moc_bai_hoc (ma_moc, ma_chuong, tieu_de, loai_moc, noi_dung_ly_thuyet, diem_thuong, xu_thuong, thu_tu, tong_so_buoc, so_cau_moi_buoc)
VALUES ('moc_cds_06_03', 'ch_cds_06', 'Mốc 6.3 [BOSS TRÙM CUỐI]: An Toàn Số, Chống Phishing & Bảo Vệ Danh Tính', 'TRAC_NGHIEM', '### 1. Đổi mới sáng tạo & Giao tiếp số
- **Đổi mới sáng tạo (Digital Innovation)**: Ứng dụng công nghệ mới để **cải tiến quy trình làm việc cũ, tạo ra giá trị mới** và nâng cao chất lượng trải nghiệm của khách hàng/người dân.
- **Kỹ năng giao tiếp số (Digital Communication)**: Khả năng soạn thảo email chuyên nghiệp, trình bày báo cáo trực tuyến, trao đổi văn minh trên các diễn đàn và ứng dụng cộng tác nhóm (Slack, Microsoft Teams).

### 2. An toàn thông tin & Phòng chống lừa đảo trực tuyến
- **Tấn công lừa đảo (Phishing)**: Hình thức tội phạm mạng **giả mạo email, tin nhắn mạo danh ngân hàng, cơ quan công an hoặc tổ chức uy tín** kèm theo đường link độc hại nhằm lừa người dùng cung cấp mật khẩu, thông tin cá nhân và mã OTP tài khoản.
- **Nguyên tắc mật khẩu an toàn**: Mật khẩu phải có độ dài tối thiểu 12 ký tự, kết hợp chữ hoa, chữ thường, chữ số và ký tự đặc biệt; **tuyệt đối KHÔNG sử dụng một mật khẩu giống nhau cho nhiều tài khoản** khác nhau trên mạng.
- **Xác thực hai yếu tố (2FA - Two-Factor Authentication)**: Cơ chế tăng cường bảo mật tài khoản bằng cách yêu cầu thêm **lớp bảo vệ bổ sung thứ hai** (mã gửi qua SMS, ứng dụng Google Authenticator, hoặc dấu vân tay) sau khi nhập đúng mật khẩu.
- **Pháp lý tại Việt Nam**: Tuân thủ Luật An toàn thông tin mạng và **Nghị định 13/2023/NĐ-CP** về bảo vệ dữ liệu cá nhân, nghiêm cấm các hành vi mua bán, thu thập và phát tán dữ liệu công dân trái phép.', 50, 40, 3, 4, 10)
ON CONFLICT (ma_moc) DO UPDATE SET
  tieu_de = EXCLUDED.tieu_de,
  loai_moc = EXCLUDED.loai_moc,
  noi_dung_ly_thuyet = EXCLUDED.noi_dung_ly_thuyet,
  diem_thuong = EXCLUDED.diem_thuong,
  xu_thuong = EXCLUDED.xu_thuong,
  thu_tu = EXCLUDED.thu_tu,
  tong_so_buoc = EXCLUDED.tong_so_buoc,
  so_cau_moi_buoc = EXCLUDED.so_cau_moi_buoc;

-- 4. CAU HOI (174 CAU)
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_01', 'moc_cds_01_01', 'Khái niệm Số hóa (Digitization) được hiểu chính xác nhất là gì?', 'TRAC_NGHIEM_4', 'Ứng dụng công nghệ điện toán đám mây để thay đổi toàn diện mô hình tổ chức và cơ cấu quản lý nhân sự.', 'Tự động hóa hoàn toàn mọi công đoạn trong dây chuyền sản xuất cơ khí và đóng gói hàng hóa.', 'Tái cấu trúc văn hóa doanh nghiệp nhằm thúc đẩy năng lực đổi mới sáng tạo dựa trên nền tảng trí tuệ nhân tạo.', 'Chuyển đổi dữ liệu và thông tin từ dạng vật lý sang dạng số nhị phân để thuận tiện lưu trữ và chia sẻ.', 3, 'Căn cứ Chương 1, Mục 1.1.1 (Trang 1): Số hóa là quá trình chuyển đổi thông tin, dữ liệu từ dạng vật lý sang dạng kỹ thuật số để lưu trữ và chia sẻ.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_02', 'moc_cds_01_01', 'Tin học hóa (Informatization) khác biệt căn bản so với Số hóa ở điểm cốt lõi nào?', 'TRAC_NGHIEM_4', 'Chỉ dừng lại ở mức quét tài liệu giấy sang định dạng PDF để phục vụ việc gửi nhận email nội bộ hàng ngày.', 'Hoàn toàn loại bỏ yếu tố con người và không cần sử dụng bất kỳ hệ thống cơ sở dữ liệu điện tử nào.', 'Thay đổi toàn diện chiến lược kinh doanh và kiến tạo các mô hình cung cấp dịch vụ số hoàn toàn mới lạ.', 'Tập trung vào việc sử dụng CNTT để tự động hóa quy trình nghiệp vụ hiện có nhằm nâng cao hiệu suất làm việc.', 3, 'Căn cứ Chương 1, Mục 1.1.2 (Trang 1): Tin học hóa là việc ứng dụng CNTT vào hoạt động quản lý, vận hành để tự động hóa quy trình nghiệp vụ sẵn có.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_03', 'moc_cds_01_01', 'Bản chất thực sự của Chuyển đổi số (Digital Transformation) là quá trình nào sau đây?', 'TRAC_NGHIEM_4', 'Mua sắm và lắp đặt hệ thống máy tính để bàn thế hệ mới nhất cho toàn bộ nhân viên văn phòng.', 'Chỉ đơn thuần lưu trữ dữ liệu kế toán và tài chính lên các dịch vụ đám mây công cộng như Google Drive.', 'Thay thế toàn bộ công nhân đứng máy bằng các cánh tay robot công nghiệp tự động nhập khẩu.', 'Ứng dụng công nghệ số để thay đổi tổng thể mô hình hoạt động, quy trình sản xuất và văn hóa tổ chức.', 3, 'Căn cứ Chương 1, Mục 1.1.3 (Trang 2): Chuyển đổi số là quá trình thay đổi tổng thể và toàn diện về cách sống, làm việc và mô hình hoạt động dựa trên công nghệ số.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_04', 'moc_cds_01_01', 'Mối quan hệ phát triển giữa Số hóa, Tin học hóa và Chuyển đổi số được hiểu đúng nhất là:', 'TRAC_NGHIEM_4', 'Ba giai đoạn tách rời độc lập, tổ chức có thể thực hiện chuyển đổi số trực tiếp mà không cần có dữ liệu số.', 'Tin học hóa là cấp độ cao nhất bao trùm toàn bộ, còn chuyển đổi số chỉ là một phần nhỏ trong tin học hóa.', 'Chuyển đổi số diễn ra trước để định hình tổ chức, sau đó mới quay lại số hóa từng bảng biểu tài liệu giấy.', 'Số hóa là bước đầu tạo nguyên liệu, tin học hóa là bước đệm tối ưu, chuyển đổi số là mục tiêu cuối cùng.', 3, 'Căn cứ Chương 1, Mục 1.1.4 (Trang 3): Theo Cẩm nang CĐS (Bộ TT&TT, 2021), số hóa là nền tảng, tin học hóa là trung gian, chuyển đổi số là đích đến.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_05', 'moc_cds_01_01', 'Điểm khác biệt cốt lõi nhất giữa Tin học hóa và Chuyển đổi số nằm ở yếu tố nào?', 'TRAC_NGHIEM_4', 'Tin học hóa đòi hỏi nguồn kinh phí khổng lồ từ nhà nước, trong khi chuyển đổi số hoàn toàn không cần vốn đầu tư.', 'Tin học hóa chỉ sử dụng trong các cơ quan nhà nước, còn chuyển đổi số là thuật ngữ độc quyền của doanh nghiệp.', 'Tin học hóa bắt buộc sử dụng trí tuệ nhân tạo, trong khi chuyển đổi số chỉ cần ứng dụng các bảng tính Excel.', 'Tin học hóa tập trung vào công cụ tối ưu quy trình cũ, còn chuyển đổi số tập trung vào giá trị mới và đổi mới mô hình.', 3, 'Căn cứ Chương 1, Mục 1.1.5 (Trang 4): Tin học hóa cải thiện quy trình hiện có, còn chuyển đổi số biến đổi mô hình, hướng tới đổi mới sáng tạo và tạo giá trị mới.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_06', 'moc_cds_01_01', 'Đâu là sự khác biệt cơ bản về mục tiêu định hướng giữa Tin học hóa và Chuyển đổi số?', 'TRAC_NGHIEM_4', 'Tin học hóa nhằm cải thiện quy trình hiện có, chuyển đổi số nhằm kiến tạo mô hình kinh doanh và dịch vụ mới.', 'Tin học hóa nhằm xóa bỏ hoàn toàn máy tính để bàn, chuyển đổi số nhằm thay thế nhân sự bằng phần mềm.', 'Tin học hóa chỉ triển khai cho phòng kỹ thuật CNTT, chuyển đổi số chỉ dành riêng cho phòng tiếp thị marketing.', 'Tin học hóa tạo ra sự thay đổi tổng thể về văn hóa, còn chuyển đổi số chỉ nâng cấp đường truyền Internet.', 0, 'Căn cứ Chương 1, Mục 1.1.5 (Trang 4): Tin học hóa tối ưu quy trình sẵn có; chuyển đổi số tạo ra mô hình vận hành và giá trị kinh doanh mới.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_07', 'moc_cds_01_01', 'Một trường đại học triển khai hệ thống cổng thông tin cho sinh viên đăng ký học phần trực tuyến thay vì nộp phiếu giấy tại phòng đào tạo. Đây là ví dụ tiêu biểu của cấp độ nào?', 'TRAC_NGHIEM_4', 'Tin học hóa (Informatization) vì ứng dụng phần mềm CNTT để tối ưu và tự động hóa quy trình nghiệp vụ sẵn có.', 'Số hóa dữ liệu thuần túy (Digitization) vì chỉ chuyển đổi hình thức hiển thị danh sách môn học.', 'Chuyển đổi số toàn diện (Digital Transformation) vì đã thay đổi hoàn toàn triết lý giáo dục của nhà trường.', 'Đổi mới sáng tạo phá hủy (Disruptive Innovation) vì đã loại bỏ hoàn toàn vai trò của giảng viên đứng lớp.', 0, 'Cổng đăng ký tín chỉ chỉ là việc dùng phần mềm để tự động hóa một quy trình nghiệp vụ đã có từ trước (thay cho phiếu giấy), quy trình đào tạo và mô hình trường học không đổi, do đó đây là Tin học hóa.', 3, 'VAN_DUNG', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_01', 'moc_cds_01_02', 'Tập hợp các công nghệ số tiêu biểu thúc đẩy Cách mạng công nghiệp 4.0 bao gồm:', 'TRAC_NGHIEM_4', 'Trí tuệ nhân tạo (AI), Internet vạn vật (IoT), Điện toán đám mây (Cloud) và Dữ liệu lớn (Big Data).', 'Mạng điện thoại cố định có dây, máy fax truyền số liệu và hệ thống tổng đài bưu điện tương tự.', 'Máy in kim văn phòng, máy photocopy laser tốc độ cao và màn hình máy tính huỳnh quang CRT.', 'Động cơ hơi nước áp suất cao, dây chuyền sản xuất cơ khí hàng loạt và máy phát điện xoay chiều.', 0, 'Căn cứ Chương 1, Mục 1.2.1 (Trang 4, 6): Bốn công nghệ số tiêu biểu cốt lõi của CMCN 4.0 là AI, IoT, Big Data và Cloud Computing.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_02', 'moc_cds_01_02', 'Cuộc Cách mạng công nghiệp lần thứ tư (CMCN 4.0) gắn liền với bước nhảy vọt nào sau đây?', 'TRAC_NGHIEM_4', 'Tự động hóa thông minh dựa trên sự hội tụ giữa thế giới thực và thế giới ảo qua công nghệ số.', 'Cơ giới hóa nền sản xuất thủ công nhờ vào sự phát minh ra động cơ hơi nước của James Watt.', 'Điện khí hóa các phân xưởng và phát triển dây chuyền sản xuất công nghiệp hàng loạt quy mô lớn.', 'Thương mại hóa động cơ đốt trong sử dụng nhiên liệu hóa thạch và mở rộng mạng lưới đường sắt.', 0, 'Căn cứ Chương 1, Mục 1.2.2 (Trang 5): CMCN 4.0 gắn liền với sự phát triển đột phá của tự động hóa thông minh và công nghệ số kết nối thực - ảo.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_03', 'moc_cds_01_02', 'Yếu tố nào sau đây KHÔNG PHẢI là cơ hội mà chuyển đổi số mang lại cho tổ chức doanh nghiệp?', 'TRAC_NGHIEM_4', 'Gia tăng mức độ phức tạp quản trị, tăng chi phí vận hành thủ công và làm chậm tốc độ phản ứng.', 'Tăng vọt năng suất lao động và tối ưu hóa chi phí vận hành nhờ vào các giải pháp tự động hóa.', 'Mở rộng thị trường kinh doanh xuyên biên giới và tiếp cận khách hàng tiềm năng trên quy mô toàn cầu.', 'Nâng cao chất lượng trải nghiệm cá nhân hóa và gia tăng tỷ lệ hài lòng trung thành của người tiêu dùng.', 0, 'Căn cứ Chương 1, Mục 1.5.1 (Trang 9): Gia tăng chi phí và phức tạp quản trị là thách thức hoặc hệ quả tiêu cực khi triển khai sai lầm, không phải cơ hội.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_04', 'moc_cds_01_02', 'Một trong những thách thức hàng đầu đối với các doanh nghiệp Việt Nam khi thực hiện chuyển đổi số là:', 'TRAC_NGHIEM_4', 'Sự thiếu hụt trầm trọng nguồn nhân lực chất lượng cao sở hữu kỹ năng số và tư duy đổi mới sáng tạo.', 'Có quá nhiều quỹ đầu tư mạo hiểm quốc tế tranh giành rót vốn hỗ trợ chuyển đổi số miễn phí.', 'Đội ngũ nhân viên quá hào hứng và dễ dàng từ bỏ ngay lập tức mọi thói quen làm việc truyền thống lâu đời.', 'Thị trường không có bất kỳ giải pháp phần mềm hay nhà cung cấp dịch vụ công nghệ số nào hoạt động.', 0, 'Căn cứ Chương 1, Mục 1.5.2 (Trang 9): Thiếu hụt kỹ năng số và nhân lực công nghệ thông tin là một trong những rào cản lớn nhất.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_05', 'moc_cds_01_02', 'Chuyển đổi số trong lĩnh vực giáo dục hướng tới mục tiêu cốt lõi nào sau đây?', 'TRAC_NGHIEM_4', 'Sa thải toàn bộ đội ngũ giảng viên và thay thế hoàn toàn việc giảng bài bằng các video bài giảng phát lại.', 'Nâng cao chất lượng dạy và học, thúc đẩy học tập suốt đời và cá nhân hóa trải nghiệm cho người học.', 'Hạn chế tối đa việc cho học sinh sinh viên truy cập Internet để tránh xao nhãng bài học trên lớp.', 'Tăng cường in ấn sách giáo khoa giấy số lượng lớn để phân phối về các vùng sâu vùng xa.', 1, 'Căn cứ Chương 1, Mục 1.4 (Trang 8): CĐS giáo dục hướng tới nâng cao chất lượng dạy và học, cá nhân hóa lộ trình học và xây dựng xã hội học tập suốt đời.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_06', 'moc_cds_01_02', 'Doanh nghiệp triển khai phần mềm CRM để tự động hóa quy trình quản lý khách hàng thì thuộc cấp độ nào?', 'TRAC_NGHIEM_4', 'Cấp độ 1 - Số hóa dữ liệu (Digitization).', 'Cấp độ 2 - Tin học hóa quy trình (Informatization).', 'Cấp độ 4 - Tổ chức số (Digital Organization).', 'Cấp độ 5 - Dẫn dắt chuyển đổi số (Digital Transformation Leadership).', 1, 'Căn cứ Chương 1, Mục 1.3 (Trang 6): Triển khai các phần mềm nghiệp vụ riêng lẻ (như CRM, ERP, HRM) để tự động hóa một quy trình thuộc Cấp độ 2 - Tin học hóa quy trình.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_07', 'moc_cds_01_02', 'Cấp độ trưởng thành số cao nhất (Cấp độ 5) đòi hỏi tổ chức, doanh nghiệp phải đạt được năng lực gì?', 'TRAC_NGHIEM_4', 'Quét được toàn bộ kho tài liệu lưu trữ cổ xưa sang định dạng tệp PDF có thể tìm kiếm toàn văn.', 'Chủ động đổi mới sáng tạo, kiến tạo mô hình kinh doanh số mới và dẫn dắt hệ sinh thái số.', 'Trang bị máy tính cá nhân có gắn vi xử lý AI mới nhất cho 100% cán bộ công nhân viên.', 'Thuê bao dịch vụ lưu trữ đám mây của nhà cung cấp nước ngoài với dung lượng không giới hạn.', 1, 'Căn cứ Chương 1, Mục 1.3 (Trang 7): Cấp độ 5 (Đổi mới và dẫn dắt CĐS) là cấp độ cao nhất khi tổ chức làm chủ công nghệ, tạo mô hình kinh doanh mới và dẫn dắt thị trường.', 1, 'NHO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_01', 'moc_cds_01_03', 'Yếu tố nền tảng mang tính chất quyết định sự thành công hay thất bại của một chiến dịch Chuyển đổi số là:', 'TRAC_NGHIEM_4', 'Quy mô nguồn vốn ngân sách tài chính khổng lồ dành riêng cho việc mua sắm trang thiết bị ngoại nhập.', 'Văn hóa đổi mới sáng tạo cởi mở và sự quyết tâm, thấu hiểu, năng lực dẫn dắt của con người.', 'Việc sở hữu độc quyền các phần mềm giải pháp mã nguồn đóng đắt đỏ nhất trên thị trường quốc tế.', 'Tốc độ đường truyền cáp quang băng thông rộng kết nối trực tiếp đến các trung tâm dữ liệu ngoài nước.', 1, 'Căn cứ Chương 1, Mục 1.5.2 (Trang 10): Con người và văn hóa đổi mới sáng tạo là yếu tố tiên quyết quyết định thành bại của chuyển đổi số.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_02', 'moc_cds_01_03', 'Một công ty du lịch lữ hành quyết định đóng cửa toàn bộ chi nhánh phòng vé vật lý, chuyển dịch hoàn toàn sang mô hình bán tour và chăm sóc khách 24/7 trên ứng dụng di động thông minh. Hành động này phản ánh cấp độ nào?', 'TRAC_NGHIEM_4', 'Số hóa dữ liệu (Digitization) vì đã chuyển danh mục giá tour từ tờ rơi giấy sang bảng điện tử.', 'Chuyển đổi số toàn diện (Digital Transformation) vì đã tái cấu trúc hoàn toàn mô hình kinh doanh và phương thức vận hành.', 'Tin học hóa nội bộ (Informatization) vì chỉ cài thêm phần mềm hỗ trợ nhân viên văn phòng tính tiền.', 'Bảo trì hệ thống định kỳ (System Maintenance) vì không có phát sinh thêm sản phẩm hay điểm đến du lịch mới.', 1, 'Căn cứ Chương 1, Mục 1.3 (Trang 7): Đóng cửa kênh vật lý truyền thống để chuyển đổi hoàn toàn sang mô hình kinh doanh số là bản chất của Chuyển đổi số.', 3, 'VAN_DUNG', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_03', 'moc_cds_01_03', 'Xu hướng "Tích hợp Trí tuệ nhân tạo (AI) và Học máy (Machine Learning)" mang lại giá trị thiết thực nào cho tổ chức?', 'TRAC_NGHIEM_4', 'Loại bỏ hoàn toàn sự hiện diện và vai trò đưa ra quyết định của hội đồng quản trị doanh nghiệp.', 'Bắt buộc tất cả các tài liệu số hóa phải được dịch tự động sang định dạng mã máy nhị phân 0 và 1.', 'Phân tích dữ liệu lớn để nhận diện hành vi, dự đoán xu hướng tương lai và cá nhân hóa trải nghiệm khách hàng.', 'Tăng chi phí tuyển dụng thêm hàng nghìn kỹ thuật viên lập trình cho các công việc sao chép văn bản lặp lại.', 2, 'Căn cứ Chương 1, Mục 1.4 (Trang 7): AI và ML giúp khai thác Big Data để dự đoán xu hướng và cá nhân hóa sâu sắc trải nghiệm người dùng.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_04', 'moc_cds_01_03', 'Lợi ích lớn nhất mà công nghệ Điện toán đám mây (Cloud Computing) đem lại cho doanh nghiệp trong chuyển đổi số là:', 'TRAC_NGHIEM_4', 'Bắt buộc doanh nghiệp phải mua sắm và duy trì nhiều phòng máy chủ vật lý cồng kềnh với chi phí bảo dưỡng lớn.', 'Hạn chế khả năng truy cập tài nguyên từ xa nhằm ngăn chặn nhân viên làm việc bên ngoài trụ sở công ty.', 'Gia tăng tính linh hoạt, khả năng mở rộng quy mô tính toán tức thì theo nhu cầu và tối ưu chi phí hạ tầng.', 'Đảm bảo dữ liệu chỉ có thể được lưu trữ và sao lưu cục bộ duy nhất trên ổ cứng máy tính xách tay của giám đốc.', 2, 'Căn cứ Chương 1, Mục 1.4 & Chương 2 Mục 2.2: Cloud mang lại tính linh hoạt cao, mở rộng quy mô tức thì và tiết kiệm chi phí CapEx.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_05', 'moc_cds_01_03', 'Chuyển đổi số trong khu vực hành chính công và Chính phủ mang lại tác động tích cực nhất là:', 'TRAC_NGHIEM_4', 'Làm phát sinh thêm nhiều biểu mẫu giấy tờ và tăng thời gian chờ đợi nhận kết quả thủ tục hành chính.', 'Ngừng cung cấp hoàn toàn các dịch vụ công thiết yếu cho các đối tượng người dân không có điện thoại thông minh.', 'Nâng cao tính công khai, minh bạch, giảm tham nhũng vặt và nâng cao chất lượng phục vụ người dân, doanh nghiệp.', 'Hạn chế việc liên thông và ngăn cấm việc chia sẻ dữ liệu dân cư giữa các bộ ban ngành với nhau.', 2, 'Căn cứ Chương 1, Mục 1.4 (Trang 8): Chính phủ số giúp tăng cường minh bạch, hiệu quả điều hành và phục vụ người dân thuận tiện qua dịch vụ công trực tuyến.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_06', 'moc_cds_01_03', 'Theo Cẩm nang của Bộ Thông tin và Truyền thông, yếu tố nào giữ vai trò quyết định sự thành bại của chuyển đổi số?', 'TRAC_NGHIEM_4', 'Các công nghệ lõi và thiết bị máy móc hiện đại nhất được nhập khẩu nguyên chiếc từ nước ngoài.', 'Quy mô diện tích trụ sở văn phòng làm việc và số lượng chi nhánh chi nhánh giao dịch vật lý.', 'Nhận thức, tầm nhìn quyết liệt của người lãnh đạo và năng lực thích ứng, văn hóa của con người.', 'Số lượng các ứng dụng phần mềm được cài đặt tràn lan trên máy tính của các phòng ban.', 2, 'Căn cứ Chương 1, Mục 1.1.3 & 1.5.2 (Trang 2, 10): Bộ TT&TT khẳng định con người và lãnh đạo là yếu tố quyết định thành bại của chuyển đổi số, công nghệ chỉ là công cụ.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_07', 'moc_cds_01_03', 'Nguyên nhân cốt lõi khiến gã khổng lồ viễn thông Nokia sụp đổ nhanh chóng trước Apple iPhone và Android dù từng chiếm 50% thị phần toàn cầu là gì?', 'TRAC_NGHIEM_4', 'Nokia không đủ tiềm lực tài chính để trả lương cho công nhân sản xuất tại các nhà máy ở châu Âu.', 'Apple đã sao chép nguyên mẫu kiểu dáng công nghiệp của Nokia nhưng bán với mức giá rẻ hơn một nửa.', 'Nokia coi điện thoại là thiết bị phần cứng thoại cơ học đơn thuần, chậm trễ nhận thức rằng tương lai thuộc về hệ sinh thái phần mềm và nền tảng dịch vụ số.', 'Chính phủ Phần Lan ra quy định cấm các tập đoàn công nghệ trong nước xuất khẩu điện thoại di động.', 2, 'Nokia thất bại vì không kịp nhận ra quy luật Sáng tạo phá hủy (Disruptive Innovation): Apple định nghĩa lại điện thoại thành một nền tảng dịch vụ số kết hợp kho ứng dụng App Store, trong khi Nokia vẫn trung thành với bàn phím cơ và hệ điều hành đóng Symbian.', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_08', 'moc_cds_01_03', 'Một chuỗi cà phê in mã QR dán tại bàn để khách quét xem menu ảnh chụp dạng PDF. Một chuỗi cà phê khác phát triển siêu ứng dụng (App) tích hợp định danh, tích điểm theo hành vi, đề xuất đồ uống theo thời tiết và tự động giao hàng tận nơi. Nhận định nào sau đây là chính xác?', 'TRAC_NGHIEM_4', 'Cả hai chuỗi cà phê trên đều đã hoàn tất quá trình Chuyển đổi số toàn diện theo chuẩn quốc tế.', 'Chuỗi thứ nhất là Tin học hóa cao cấp, còn chuỗi thứ hai chỉ là một thử nghiệm tiếp thị truyền thông ngắn hạn.', 'Chuỗi thứ nhất chỉ dừng lại ở mức Số hóa thông tin (Digitization), trong khi chuỗi thứ hai đang thực hiện Chuyển đổi số (Digital Transformation).', 'Chuỗi thứ hai gây lãng phí chi phí vô ích vì việc in mã QR xem PDF đã đáp ứng 100% nhu cầu người dùng.', 2, 'Quét mã QR xem menu ảnh PDF chỉ là Số hóa hình thức biểu diễn (Digitization). Còn chuỗi thứ hai thay đổi trải nghiệm, mô hình bán hàng O2O và khai thác dữ liệu để cá nhân hóa, đó là Chuyển đổi số.', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_08', 'moc_cds_01_01', 'Chạm chọn 1 khái niệm bên Trái và 1 bản chất tương ứng bên Phải để ghép cặp chính xác:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác bản chất và vai trò của Số hóa, Tin học hóa và Chuyển đổi số theo Cẩm nang Bộ TT&TT.', 2, 'HIEU', 4, '{"pairs":[{"left":"Số hóa (Digitization)","right":"Chuyển đổi dữ liệu vật lý sang tệp nhị phân số"},{"left":"Tin học hóa (Informatization)","right":"Ứng dụng phần mềm tự động hóa quy trình sẵn có"},{"left":"Chuyển đổi số (Digital Transformation)","right":"Thay đổi tổng thể mô hình hoạt động và văn hóa"},{"left":"Dữ liệu số (Digital Data)","right":"Nguyên liệu đầu vào của hệ sinh thái số"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_09', 'moc_cds_01_01', 'Chạm vào các thẻ để sắp xếp đúng tiến trình tiến hóa công nghệ tự nhiên:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Tiến trình chuẩn: Số hóa tạo dữ liệu -> Tin học hóa tự động hóa quy trình -> Tích hợp CSDL liên thông -> Chuyển đổi số toàn diện.', 2, 'HIEU', 4, '{"prompt":"Sắp xếp chuỗi tiến hóa từ thấp đến cao:","correct_order":["Số hóa dữ liệu vật lý","Tin học hóa quy trình nghiệp vụ","Tích hợp và liên thông dữ liệu","Chuyển đổi số toàn diện tổ chức"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_01_10', 'moc_cds_01_01', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Chuyển đổi số là đích đến / mục tiêu cuối cùng của toàn bộ tiến trình ứng dụng công nghệ.', 1, 'NHO', 4, '{"sentence_template":"Theo Cẩm nang Chuyển đổi số của Bộ TT&TT, số hóa là nền tảng, tin học hóa là bước đệm, còn chuyển đổi số là {blank} cuối cùng.","options":["mục tiêu","công cụ","chi phí","thách thức"],"blank_answer":"mục tiêu"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_08', 'moc_cds_01_02', 'Chạm chọn 1 mốc thời gian bên Trái và 1 đặc trưng công nghệ tương ứng bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép nối chuẩn xác 3 làn sóng công nghệ trong hơn 30 năm qua theo bài giảng Chương 1.', 2, 'HIEU', 4, '{"pairs":[{"left":"Làn sóng 1 (1985 - 1999)","right":"Số hóa thông tin giấy tờ nhờ máy vi tính PC"},{"left":"Làn sóng 2 (2000 - 2015)","right":"Tin học hóa quy trình nhờ Internet & Di động"},{"left":"Làn sóng 3 (2015 - 2030)","right":"Chuyển đổi số xã hội thực lên mạng với AI/IoT"},{"left":"Động lực CMCN 4.0","right":"Dữ liệu lớn, Điện toán đám mây & Blockchain"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_02_09', 'moc_cds_01_02', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Cấp độ 4 trong mô hình 5 cấp độ trưởng thành số là Tổ chức số (Digital Organization).', 1, 'NHO', 4, '{"sentence_template":"Trong mô hình 5 cấp độ trưởng thành số, cấp độ 4 là giai đoạn tổ chức trở thành {blank}, nơi mọi quyết định đều dựa trên dữ liệu (data-driven).","options":["tổ chức số","xưởng cơ khí","cửa hàng ảo","trung tâm dữ liệu"],"blank_answer":"tổ chức số"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_09', 'moc_cds_01_03', 'Chạm vào các thẻ từ để sắp xếp đúng chuỗi nguyên nhân - kết quả trong thảm họa sụp đổ của Nokia:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Trình tự lịch sử minh chứng cho sự Sáng tạo phá hủy của công nghệ số đối với tập đoàn bảo thủ.', 3, 'HIEU', 4, '{"prompt":"Sắp xếp diễn biến thất bại của Nokia:","correct_order":["Nokia thống trị 50% thị phần điện thoại toàn cầu","Apple ra mắt iPhone với màn hình cảm ứng và App Store","Nokia chậm trễ thay đổi vì bám giữ hệ điều hành Symbian cũ","Thị phần Nokia sụt giảm dưới 2% và bị thâu tóm"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_01_03_10', 'moc_cds_01_03', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Disruptive Innovation dịch chuẩn là Sáng tạo phá hủy.', 2, 'NHO', 4, '{"sentence_template":"Sự ra đời của iPhone và Android tạo nên hiện tượng {blank}, làm thay đổi hoàn toàn trật tự ngành công nghiệp di động thế giới.","options":["sáng tạo phá hủy","tin học hóa quy trình","bảo trì phần mềm","cải tiến tuần tự"],"blank_answer":"sáng tạo phá hủy"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_01', 'moc_cds_02_01', 'Trong kỷ nguyên chuyển đổi số hiện đại, Dữ liệu (Data) được ví như yếu tố nào sau đây?', 'TRAC_NGHIEM_4', 'Tài sản phụ trợ chỉ dùng để đối chiếu khi có đoàn thanh tra thuế đến làm việc.', 'Công cụ có thể thay thế hoàn toàn và sa thải 100% lực lượng lao động trong doanh nghiệp.', 'Sản phẩm phụ phát sinh tự nhiên cần phải được xóa bỏ định kỳ hàng tháng để tiết kiệm đĩa.', 'Nguồn tài nguyên mới, nhiên liệu quý giá và yếu tố trung tâm của mọi quyết định.', 3, 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Dữ liệu được xem là nguồn tài nguyên mới và yếu tố trung tâm giúp chuyển từ quản trị cảm tính sang quản trị thông minh (data-driven).', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_02', 'moc_cds_02_01', 'Quy trình quản trị và khai thác dữ liệu chuẩn mực trong tổ chức bao gồm các bước nào?', 'TRAC_NGHIEM_4', 'Chỉ phân tích các nguồn dữ liệu mở miễn phí được tải ngẫu nhiên từ mạng xã hội về máy tính.', 'Mã hóa bí mật $\rightarrow$ Khóa quyền truy cập của nhân viên $\rightarrow$ Tiêu hủy toàn bộ sau 30 ngày.', 'Tự động hóa dây chuyền cơ khí $\rightarrow$ Số hóa tài liệu giấy $\rightarrow$ In ấn lưu trữ vào kho lưu trữ.', 'Thu thập dữ liệu $\rightarrow$ Xử lý & Phân tích $\rightarrow$ Khai thác, chia sẻ liên thông & Tái sử dụng.', 3, 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Quản trị dữ liệu gồm 3 bước: Thu thập -> Xử lý & Phân tích -> Khai thác, chia sẻ & tái sử dụng.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_03', 'moc_cds_02_01', 'Dữ liệu số chỉ thực sự phát huy giá trị to lớn và tạo ra lợi ích kinh tế khi nào?', 'TRAC_NGHIEM_4', 'Được bảo quản bí mật tuyệt đối trong một ngăn kéo máy chủ và nghiêm cấm bất kỳ ai truy xuất.', 'Chỉ được in ra các tập tài liệu giấy dày hàng trăm trang để đóng dấu đỏ lưu kho lưu trữ.', 'Được lưu trữ cục bộ duy nhất trên ổ cứng máy tính cá nhân của một nhân viên duy nhất trong công ty.', 'Được kết nối, chia sẻ liên thông và tái sử dụng an toàn giữa các hệ thống, phòng ban và đối tác.', 3, 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Dữ liệu tạo ra giá trị thực sự khi được chia sẻ, kết nối liên thông và tái sử dụng.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_04', 'moc_cds_02_01', 'Tại Việt Nam, Nghị định số 13/2023/NĐ-CP của Chính phủ ban hành quy định về nội dung pháp lý nào?', 'TRAC_NGHIEM_4', 'Quy định về việc đăng ký tên miền Internet và quản lý trang thông tin điện tử tổng hợp.', 'Quy hoạch xây dựng các trạm phát sóng viễn thông băng rộng thế hệ 5G trên toàn quốc.', 'Quy định mức thuế thu nhập doanh nghiệp đối với các công ty khởi nghiệp trong lĩnh vực công nghệ.', 'Bảo vệ dữ liệu cá nhân, quyền của chủ thể dữ liệu và nghĩa vụ bảo mật của bên xử lý dữ liệu.', 3, 'Căn cứ Chương 2, Mục 2.1 (Trang 15): Nghị định 13/2023/NĐ-CP của Chính phủ quy định về Bảo vệ dữ liệu cá nhân.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_05', 'moc_cds_02_01', 'Trí tuệ nhân tạo (Artificial Intelligence - AI) được định nghĩa chuẩn xác nhất là gì?', 'TRAC_NGHIEM_4', 'Một phần mềm máy tính chuyên dùng để quét sạch các tập tin tài liệu rác trên hệ điều hành Windows.', 'Thiết bị phần cứng máy chủ có gắn đèn tín hiệu quang học để đo nhiệt độ phòng làm việc.', 'Hệ thống lưu trữ dữ liệu dạng bảng tính cho phép người dùng nhập liệu thông qua bàn phím.', 'Công nghệ mô phỏng, giúp máy tính có khả năng học hỏi từ dữ liệu, suy luận và giải quyết vấn đề như con người.', 3, 'Căn cứ Chương 2, Mục 2.2 (Trang 16): AI là công nghệ giúp máy tính có khả năng học tập, suy luận và xử lý thông tin thông minh như con người.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_06', 'moc_cds_02_01', 'Internet vạn vật (IoT) được ví như "giác quan" của con người trong môi trường số vì lý do nào?', 'TRAC_NGHIEM_4', 'Sử dụng các cảm biến để cảm nhận, thu thập dữ liệu thời gian thực từ thế giới thực và truyền về hệ thống xử lý.', 'IoT chỉ có thể kết nối được với các máy móc cơ khí thời kỳ Cách mạng công nghiệp lần thứ nhất.', 'Là một giao thức phần mềm mã nguồn mở dùng để thay thế hoàn toàn mạng viễn thông toàn cầu.', 'Có khả năng tự động sáng tác các tác phẩm âm nhạc và hội họa mà không cần dữ liệu đầu vào.', 0, 'Căn cứ Chương 2, Mục 2.2 (Trang 17): IoT sử dụng cảm biến giúp các đồ vật thu thập và truyền dữ liệu thời gian thực, đóng vai trò như các giác quan.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_07', 'moc_cds_02_01', 'Một doanh nghiệp bán lẻ thu thập số điện thoại, địa chỉ nhà và lịch sử mua sắm của khách hàng nhưng không áp dụng biện pháp mã hóa, dẫn đến việc dữ liệu bị rò rỉ và bán ra chợ đen. Doanh nghiệp này đã vi phạm nghiêm trọng văn bản pháp lý nào?', 'TRAC_NGHIEM_4', 'Nghị định 13/2023/NĐ-CP của Chính phủ về Bảo vệ dữ liệu cá nhân.', 'Luật Giao thông đường bộ về việc vận chuyển hàng hóa thương mại điện tử đường dài.', 'Nghị quyết 03/NQ-CP về quy chuẩn xây dựng trạm thu phát sóng viễn thông di động.', 'Luật Xây dựng về quy chuẩn phòng cháy chữa cháy trong trung tâm dữ liệu máy chủ.', 0, 'Nghị định 13/2023/NĐ-CP quy định nghĩa vụ bắt buộc bảo vệ dữ liệu cá nhân của khách hàng đối với các tổ chức, doanh nghiệp thu thập dữ liệu.', 3, 'VAN_DUNG', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_01', 'moc_cds_02_02', 'Ba đặc trưng cơ bản (mô hình 3Vs) định nghĩa về Dữ liệu lớn (Big Data) bao gồm những yếu tố nào?', 'TRAC_NGHIEM_4', 'Khối lượng cực lớn (Volume), tốc độ sinh ra nhanh (Velocity) và đa dạng về thể loại (Variety).', 'Chỉ gồm dữ liệu văn bản có cấu trúc chuẩn hóa, lưu trữ cố định trên đĩa mềm dung lượng nhỏ.', 'Dữ liệu không bao giờ có thể xử lý được bằng bất kỳ hệ thống máy tính hiện đại nào.', 'Tập hợp các tài liệu mật chỉ áp dụng trong phạm vi an ninh quốc phòng và tài chính ngân hàng.', 0, 'Căn cứ Chương 2, Mục 2.2 (Trang 17): Big Data có 3 đặc trưng cốt lõi là Volume, Velocity và Variety (3Vs).', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_02', 'moc_cds_02_02', 'Công nghệ Điện toán đám mây (Cloud Computing) đem lại giải pháp ưu việt nào cho doanh nghiệp?', 'TRAC_NGHIEM_4', 'Cho phép thuê tài nguyên lưu trữ và xử lý tính toán linh hoạt qua Internet theo đúng nhu cầu sử dụng.', 'Bắt buộc doanh nghiệp phải mua sắm máy chủ vật lý và thuê kỹ sư quản trị phần cứng trực ca 24/7.', 'Hoạt động hoàn toàn độc lập và không cần đến sự kết nối của mạng Internet toàn cầu.', 'Chỉ có thể cung cấp các phần mềm kế toán nội bộ và không hỗ trợ mở rộng quy mô kinh doanh.', 0, 'Căn cứ Chương 2, Mục 2.2 (Trang 17): Cloud Computing cung cấp tài nguyên tính toán theo nhu cầu qua mạng Internet, giúp co giãn linh hoạt và tiết kiệm chi phí.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_03', 'moc_cds_02_02', 'Đặc điểm kỹ thuật nổi bật nhất của công nghệ Chuỗi khối (Blockchain) là:', 'TRAC_NGHIEM_4', 'Lưu trữ sổ cái phân tán, mã hóa bảo mật cao và dữ liệu có tính bất biến, chống giả mạo.', 'Dữ liệu được lưu trữ tập trung tại một máy chủ duy nhất để dễ dàng xóa bỏ và chỉnh sửa.', 'Hệ thống hoàn toàn khép kín và không thể hiện tính minh bạch đối với các bên tham gia.', 'Chỉ có thể được ứng dụng duy nhất cho các đồng tiền mã hóa và trò chơi trực tuyến.', 0, 'Căn cứ Chương 2, Mục 2.2 (Trang 18): Blockchain là sổ cái phân tán, phi tập trung, mã hóa bảo mật cao và dữ liệu không thể bị sửa đổi tùy tiện.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_04', 'moc_cds_02_02', 'Nền tảng No-code / Low-code đem lại bước tiến vượt bậc nào trong tiến trình chuyển đổi số?', 'TRAC_NGHIEM_4', 'Làm tăng chi phí và kéo dài thời gian phát triển ứng dụng phần mềm lên gấp nhiều lần.', 'Giúp người dùng không có chuyên môn lập trình vẫn có thể tự tạo lập ứng dụng nghiệp vụ nhanh chóng.', 'Xóa bỏ hoàn toàn ngành công nghiệp phát triển phần mềm và làm các kỹ sư CNTT mất việc.', 'Chỉ có thể chạy được trên các thiết bị máy tính bảng phục vụ cho việc dạy học mầm non.', 1, 'Căn cứ Chương 2, Mục 2.2 (Trang 18): No-code/Low-code giúp rút ngắn thời gian phát triển, trao quyền cho người không biết lập trình vẫn tạo được ứng dụng nghiệp vụ.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_05', 'moc_cds_02_02', 'Phẩm chất và năng lực quan trọng nhất của một Nhà lãnh đạo chuyển đổi số là gì?', 'TRAC_NGHIEM_4', 'Phải là một lập trình viên xuất sắc, nắm rõ từng dòng mã lệnh của các hệ điều hành máy tính.', 'Có tầm nhìn chiến lược số rõ ràng, truyền cảm hứng và quan trọng nhất là biết đặt ra bài toán đúng đắn.', 'Trực tiếp phụ trách việc lắp đặt dây cáp mạng và bảo trì phần cứng máy chủ hàng tuần.', 'Ủy quyền toàn bộ cho phòng CNTT và không cần tham gia vào bất kỳ cuộc họp chiến lược nào.', 1, 'Căn cứ Chương 2, Mục 2.3 (Trang 19): Nhà lãnh đạo chuyển đổi số không nhất thiết phải giỏi kỹ thuật mà quan trọng nhất là có tầm nhìn và biết đặt bài toán đúng đắn.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_06', 'moc_cds_02_02', 'Vai trò cốt lõi của Chuyên gia công nghệ số trong quá trình chuyển đổi số là gì?', 'TRAC_NGHIEM_4', 'Biến những vấn đề nghiệp vụ đơn giản thành các dự án kỹ thuật cực kỳ phức tạp và tốn kém.', 'Tiếp nhận bài toán từ lãnh đạo, đơn giản hóa vấn đề và đưa ra giải pháp công nghệ phù hợp để giải quyết.', 'Chỉ thực hiện các công việc hành chính văn phòng và không giao tiếp với ban lãnh đạo doanh nghiệp.', 'Tự ý áp dụng các công nghệ đắt đỏ nhất trên thế giới mà không cần quan tâm đến mục tiêu của công ty.', 1, 'Căn cứ Chương 2, Mục 2.3 (Trang 19): Chuyên gia công nghệ số có năng lực đơn giản hóa vấn đề phức tạp và giải bài toán của lãnh đạo bằng công nghệ phù hợp.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_07', 'moc_cds_02_02', 'Giá trị nào sau đây KHÔNG THUỘC VỀ văn hóa doanh nghiệp số (Digital Culture)?', 'TRAC_NGHIEM_4', 'Cởi mở, minh bạch và sẵn sàng chia sẻ thông tin giữa các phòng ban chức năng.', 'Khép kín thông tin, xây dựng "ốc đảo dữ liệu" nhằm củng cố quyền lực cá nhân của trưởng phòng.', 'Khả năng hợp tác linh hoạt đa ngành và tinh thần thích ứng, sẵn sàng thử nghiệm cái mới.', 'Đặt trải nghiệm của con người và khách hàng làm trung tâm của mọi sáng kiến cải tiến.', 1, 'Căn cứ Chương 2, Mục 2.3 (Trang 20): Khép kín thông tin và cục bộ "ốc đảo dữ liệu" đi ngược lại hoàn toàn với tinh thần cởi mở, liên thông của văn hóa số.', 2, 'HIEU', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_01', 'moc_cds_02_03', 'Nguyên lý "Đặt con người làm trung tâm" trong chuyển đổi số được hiểu đúng nhất là:', 'TRAC_NGHIEM_4', 'Công nghệ là yếu tố quyết định tối cao, con người chỉ cần phục tùng theo sự điều khiển của máy móc.', 'Công nghệ chỉ là công cụ hỗ trợ, mục tiêu cuối cùng của mọi sáng kiến số là phục vụ và nâng tầm con người.', 'Mọi quyết định kinh doanh đều phó thác cho thuật toán trí tuệ nhân tạo mà không cần xem xét tác động đạo đức.', 'Cắt giảm tối đa quyền lợi và phúc lợi của người lao động để dồn toàn bộ nguồn lực tài chính mua sắm phần mềm.', 1, 'Căn cứ Chương 2, Mục 2.3 & 2.5 (Trang 20, 22): Công nghệ chỉ là công cụ, đích đến tối thượng của chuyển đổi số là phục vụ hạnh phúc, năng suất và phát triển con người.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_02', 'moc_cds_02_03', 'Theo định hướng của Bộ Thông tin và Truyền thông, Hạ tầng số quốc gia bao gồm 4 thành phần nào?', 'TRAC_NGHIEM_4', 'Chỉ bao gồm các sợi dây cáp mạng Internet nội bộ được kết nối giữa các phòng ban văn phòng.', 'Hạ tầng kết nối mạng, Hạ tầng dữ liệu, Hạ tầng nền tảng số và Hạ tầng bảo đảm an toàn an ninh mạng.', 'Mạng lưới đường điện cao thế quốc gia và hệ thống nhà máy nhiệt điện cung cấp năng lượng.', 'Tập hợp các máy in, máy scan và máy hủy tài liệu được mua sắm trang bị cho các công chức.', 1, 'Căn cứ Chương 2, Mục 2.4 (Trang 20-21): Hạ tầng số quốc gia gồm 4 thành phần: Kết nối, Dữ liệu, Nền tảng số và An toàn an ninh mạng.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_03', 'moc_cds_02_03', 'Trung tâm dữ liệu (Data Center) và dịch vụ Điện toán đám mây thuộc nhóm hạ tầng nào sau đây?', 'TRAC_NGHIEM_4', 'Hạ tầng mạng kết nối viễn thông.', 'Hạ tầng nền tảng dịch vụ số.', 'Hạ tầng dữ liệu (Data Infrastructure).', 'Hạ tầng thiết bị văn phòng cơ bản.', 2, 'Căn cứ Chương 2, Mục 2.4 (Trang 21): Data Center và Điện toán đám mây thuộc nhóm Hạ tầng dữ liệu.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_04', 'moc_cds_02_03', 'Nghị quyết số 03/NQ-CP của Chính phủ đặt mục tiêu đến năm 2025 về hạ tầng viễn thông như thế nào?', 'TRAC_NGHIEM_4', 'Ngừng đầu tư phát triển mạng cáp quang để quay về sử dụng đường truyền điện thoại quay số tương tự.', 'Chỉ ưu tiên phát sóng mạng di động 3G tại các thành phố lớn và tạm dừng kết nối mạng ở nông thôn.', '100% các xã trên toàn quốc có mạng cáp quang băng rộng và được phủ sóng mạng di động 4G/5G.', 'Thay thế toàn bộ mạng không dây bằng hệ thống dây dẫn tín hiệu đồng truyền thống.', 2, 'Căn cứ Chương 2, Mục 2.4 (Trang 21): Nghị quyết 03/NQ-CP đặt mục tiêu đến 2025: 100% xã có cáp quang và phủ sóng 4G/5G.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_05', 'moc_cds_02_03', 'Ba trụ cột Dữ liệu - Công nghệ - Con người trong hệ sinh thái chuyển đổi số liên kết chặt chẽ theo cơ chế nào?', 'TRAC_NGHIEM_4', 'Ba yếu tố hoạt động hoàn toàn độc lập và không có bất kỳ mối quan hệ tương hỗ nào với nhau.', 'Dữ liệu thay thế hoàn toàn vai trò của con người và tự động điều khiển việc mua sắm máy móc công nghệ.', 'Công nghệ giúp thu thập xử lý dữ liệu $\rightarrow$ Dữ liệu cung cấp tri thức $\rightarrow$ Con người ra quyết định và kiến tạo giá trị.', 'Con người chỉ đóng vai trò bảo dưỡng thiết bị máy móc mà không có quyền can thiệp vào các báo cáo dữ liệu.', 2, 'Căn cứ Chương 2, Mục 2.5 (Trang 22-23): Ba trụ cột tạo chu trình khép kín: Công nghệ xử lý dữ liệu -> Dữ liệu cung cấp tri thức -> Con người ra quyết định & kiến tạo giá trị.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_06', 'moc_cds_02_03', 'Một chiến dịch chuyển đổi số của tổ chức chỉ thực sự được coi là thành công bền vững khi nào?', 'TRAC_NGHIEM_4', 'Doanh nghiệp chi tiêu vượt mức ngân sách cho phép để sở hữu các phần mềm đắt đỏ nhất trên thị trường.', 'Thu thập được khối lượng dữ liệu khổng lồ nhưng không một nhân viên nào biết cách khai thác sử dụng.', 'Ba chân kiềng Dữ liệu, Công nghệ và Con người kết hợp hài hòa, đồng bộ trong một hệ sinh thái thống nhất.', 'Tổ chức áp dụng rập khuôn 100% mô hình của nước ngoài mà không cần điều chỉnh theo văn hóa bản địa.', 2, 'Căn cứ Chương 2, Mục 2.5 (Trang 23): CĐS thành công khi và chỉ khi dữ liệu, công nghệ và con người kết hợp hài hòa trong hệ sinh thái thống nhất.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_07', 'moc_cds_02_03', 'Tổng giám đốc một công ty sản xuất chi 10 tỷ VNĐ mua phần mềm quản lý ERP hiện đại của Đức, nhưng sau 1 năm nhân viên các bộ phận vẫn lén lút dùng sổ sách ghi tay và Excel riêng vì sợ minh bạch dữ liệu sẽ làm mất quyền lực cá nhân. Lỗi sai cốt tử của ban lãnh đạo ở đây là gì?', 'TRAC_NGHIEM_4', 'Chọn phần mềm quá rẻ tiền, cần phải nâng cấp lên phiên bản phần mềm đám mây của Mỹ đắt gấp đôi.', 'Không sa thải ngay lập tức toàn bộ 100% nhân viên cũ để tuyển mới đội ngũ sinh viên mới ra trường.', 'Chỉ chú trọng mua sắm công nghệ (động cơ) mà bỏ quên yếu tố con người và văn hóa chia sẻ dữ liệu (người lái), dẫn đến việc kiềng 3 chân bị gãy.', 'Chính phủ chưa ban hành đủ các văn bản hướng dẫn chi tiết cách thức nhập số liệu vào phần mềm ERP.', 2, 'Chuyển đổi số thất bại phổ biến nhất là do "ngộ nhận công nghệ": chỉ mua công cụ mà không làm công tác chuyển đổi con người, văn hóa và quản trị thay đổi.', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_08', 'moc_cds_02_03', 'Tại sao trong chiến lược phát triển hạ tầng số quốc gia theo Nghị quyết 03/NQ-CP, Chính phủ Việt Nam lại đặc biệt ưu tiên và khuyến khích các cơ quan nhà nước sử dụng nền tảng Điện toán đám mây "Make in Vietnam" (như Viettel Cloud, VNPT Cloud, CMC Cloud)?', 'TRAC_NGHIEM_4', 'Vì các doanh nghiệp công nghệ trong nước tài trợ miễn phí 100% kinh phí sử dụng vĩnh viễn cho nhà nước.', 'Vì các nền tảng quốc tế lớn như AWS hay Microsoft Azure không hỗ trợ giao diện ngôn ngữ tiếng Việt.', 'Để giảm bớt việc phải cử các cán bộ công chức đi đào tạo tập huấn về an toàn thông tin hàng năm.', 'Để đảm bảo chủ quyền dữ liệu số quốc gia, tối ưu an toàn an ninh mạng và không bị phụ thuộc vào hạ tầng nước ngoài.', 3, 'Hạ tầng số và dữ liệu là huyết mạch quốc gia; dùng Cloud Make in Vietnam giúp bảo đảm an ninh, tuân thủ Luật An ninh mạng và khẳng định chủ quyền dữ liệu số của Việt Nam.', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_08', 'moc_cds_02_01', 'Chạm chọn 1 bước quản trị dữ liệu bên Trái và 1 nội dung tương ứng bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác 3 bước quản trị dữ liệu và văn bản pháp lý bảo vệ dữ liệu cá nhân.', 2, 'HIEU', 4, '{"pairs":[{"left":"Bước 1: Thu thập dữ liệu","right":"Ghi nhận từ cảm biến IoT, giao dịch và ứng dụng"},{"left":"Bước 2: Xử lý & Phân tích","right":"Làm sạch, chuẩn hóa và khai phá tri thức với AI"},{"left":"Bước 3: Khai thác & Chia sẻ","right":"Liên thông dữ liệu mở (Open Data) đa ngành"},{"left":"Nghị định 13/2023/NĐ-CP","right":"Hành lang pháp lý bảo vệ dữ liệu cá nhân"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_09', 'moc_cds_02_01', 'Chạm vào các thẻ để sắp xếp đúng quy trình quản trị và khai thác dữ liệu trong tổ chức:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình chuẩn: Thu thập -> Làm sạch & chuẩn hóa -> Phân tích khai phá -> Chia sẻ và tái sử dụng.', 2, 'HIEU', 4, '{"prompt":"Sắp xếp quy trình khai thác dữ liệu:","correct_order":["Thu thập dữ liệu từ cảm biến và ứng dụng","Làm sạch và chuẩn hóa dữ liệu thô","Phân tích dữ liệu bằng công cụ AI và Big Data","Chia sẻ và tái sử dụng dữ liệu qua cổng liên thông"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_01_10', 'moc_cds_02_01', 'Chọn số hiệu văn bản thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Nghị định 13/2023/NĐ-CP quy định về bảo vệ dữ liệu cá nhân.', 1, 'NHO', 4, '{"sentence_template":"Tại Việt Nam, {blank} là nghị định của Chính phủ quy định chi tiết về bảo vệ dữ liệu cá nhân, có hiệu lực từ tháng 7/2023.","options":["Nghị định 13/2023/NĐ-CP","Nghị định 72/2013/NĐ-CP","Nghị quyết 03/NQ-CP","Quyết định 749/QĐ-TTg"],"blank_answer":"Nghị định 13/2023/NĐ-CP"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_08', 'moc_cds_02_02', 'Chạm chọn 1 công nghệ 4.0 bên Trái và hình tượng cơ thể người tương ứng bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác hình tượng ví von các công nghệ 4.0 với các bộ phận cơ thể người theo bài giảng Chương 2.', 2, 'HIEU', 4, '{"pairs":[{"left":"Internet vạn vật (IoT)","right":"Giác quan cảm nhận môi trường thực"},{"left":"Dữ liệu lớn (Big Data)","right":"Bộ não và kho tri thức lưu trữ"},{"left":"Điện toán đám mây (Cloud)","right":"Cơ bắp cung cấp sức mạnh tính toán"},{"left":"Chuỗi khối (Blockchain)","right":"Sổ cái bất biến, trí nhớ minh bạch"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_02_09', 'moc_cds_02_02', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Cloud giúp chuyển CapEx (Capital Expenditure) sang OpEx (Operational Expenditure - Chi phí vận hành).', 2, 'NHO', 4, '{"sentence_template":"Điện toán đám mây cho phép doanh nghiệp chuyển đổi chi phí đầu tư tài sản cố định mua máy chủ (CapEx) sang chi phí {blank} theo nhu cầu sử dụng thực tế (OpEx).","options":["vận hành","nhân sự","mặt bằng","quảng cáo"],"blank_answer":"vận hành"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_09', 'moc_cds_02_03', 'Chạm vào các thẻ từ để sắp xếp đúng mối quan hệ phối hợp giữa 3 chủ thể con người trong CĐS:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình chuẩn: Lãnh đạo đặt bài toán -> Chuyên gia giải bài toán bằng công nghệ -> Nhân viên thực thi quy trình số -> Tổ chức củng cố văn hóa.', 3, 'HIEU', 4, '{"prompt":"Sắp xếp quy trình phối hợp giữa các chủ thể:","correct_order":["Nhà lãnh đạo xác định tầm nhìn và đặt bài toán đúng","Chuyên gia công nghệ đơn giản hóa và chọn giải pháp","Đội ngũ nhân sự học hỏi và tuân thủ quy trình số mới","Tổ chức đánh giá hiệu quả và hoàn thiện văn hóa số"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_02_03_10', 'moc_cds_02_03', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Mục tiêu NQ 03/NQ-CP đến năm 2025: 100% xã có cáp quang và phủ sóng di động 4G/5G.', 1, 'NHO', 4, '{"sentence_template":"Nghị quyết 03/NQ-CP đề ra mục tiêu đến năm 2025, 100% số xã trên toàn quốc đều có mạng cáp quang và được phủ sóng mạng {blank}.","options":["di động 4G/5G","vệ tinh Starlink","quay số dial-up","truyền hình cáp"],"blank_answer":"di động 4G/5G"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_01', 'moc_cds_03_01', 'Tầm nhìn chuyển đổi số (Digital Vision) đóng vai trò then chốt nào đối với tổ chức?', 'TRAC_NGHIEM_4', 'Tuyển dụng thêm thật nhiều kỹ sư phần mềm cao cấp để thay thế toàn bộ nhân viên kế toán.', 'Tự động hóa tuyệt đối 100% mọi công đoạn thủ công mà không cần đến sự kiểm soát của con người.', 'Cắt giảm toàn bộ chi phí vận hành thường niên xuống mức 0 đồng để dồn tiền đầu tư máy móc.', 'Xác định rõ ràng hướng đi dài hạn, khát vọng và đích đến của tổ chức trong kỷ nguyên số.', 3, 'Căn cứ Chương 3, Mục 3.1 (Trang 28): Tầm nhìn số giúp định hướng chiến lược và xác định mục tiêu dài hạn cho tổ chức.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_02', 'moc_cds_03_01', 'Một bản Tầm nhìn chuyển đổi số có tính khả thi và hiệu quả cao cần hội tụ các tiêu chí nào?', 'TRAC_NGHIEM_4', 'Phải thật dài hàng trăm trang giấy với vô số thuật ngữ kỹ thuật phức tạp khó hiểu.', 'Mơ hồ, chung chung để bất kỳ khi nào thất bại cũng có thể dễ dàng giải thích bao biện.', 'Chỉ tập trung duy nhất vào thông số kỹ thuật của các dòng máy tính chủ cần mua sắm.', 'Ngắn gọn, rõ ràng, truyền cảm hứng mạnh mẽ và định hướng tương lai lấy con người làm trung tâm.', 3, 'Căn cứ Chương 3, Mục 3.1 (Trang 28): Tầm nhìn số hiệu quả cần ngắn gọn, rõ ràng, truyền cảm hứng và hướng tới tương lai.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_03', 'moc_cds_03_01', 'Chiến lược chuyển đổi số của doanh nghiệp bắt buộc phải gắn kết chặt chẽ với yếu tố nào?', 'TRAC_NGHIEM_4', 'Các trào lưu và xu hướng video ngắn đang nổi tiếng nhất trên các trang mạng xã hội.', 'Mức thu nhập và tổng tài sản tài chính cá nhân của riêng người đứng đầu doanh nghiệp.', 'Tổng số lượng máy vi tính để bàn hiện đang được phân bổ trong các phòng ban làm việc.', 'Mục tiêu chiến lược phát triển chung, sứ mệnh và giá trị cốt lõi của toàn bộ tổ chức.', 3, 'Căn cứ Chương 3, Mục 3.1 (Trang 29): Chiến lược CĐS không thể tách rời mà phải phục vụ sứ mệnh và mục tiêu cốt lõi của tổ chức.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_04', 'moc_cds_03_01', 'Trong quá trình xây dựng và thực thi chiến lược chuyển đổi số, người Lãnh đạo đóng vai trò gì?', 'TRAC_NGHIEM_4', 'Chỉ đứng ngoài quan sát và tuyệt đối không can thiệp vào bất kỳ quyết định ứng dụng nào.', 'Khoán trắng toàn bộ trách nhiệm và rủi ro chuyển đổi cho riêng trưởng phòng công nghệ thông tin.', 'Chỉ làm nhiệm vụ ký duyệt các hóa đơn thanh toán tiền mua bản quyền phần mềm nước ngoài.', 'Định hướng tầm nhìn, cam kết bố trí nguồn lực và trực tiếp dẫn dắt tổ chức vượt qua lực cản.', 3, 'Căn cứ Chương 3, Mục 3.1 (Trang 29): Người lãnh đạo đóng vai trò kiến trúc sư, dẫn dắt, định hướng và cam kết đồng hành.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_05', 'moc_cds_03_01', 'Trong mô hình lộ trình 5 bước của Schallmo, giai đoạn "Digital Reality" tập trung vào nhiệm vụ nào?', 'TRAC_NGHIEM_4', 'Triển khai cài đặt hệ thống phần mềm quản trị doanh nghiệp ERP trên quy mô toàn tập đoàn.', 'Đo lường các chỉ số doanh thu và lợi nhuận thực tế đạt được sau 3 năm chuyển đổi số.', 'Tối ưu hóa các thuật toán trí tuệ nhân tạo để tự động hóa việc chấm công nhân viên.', 'Khảo sát, phân tích hiện trạng mô hình kinh doanh, chuỗi giá trị và các thách thức đang gặp phải.', 3, 'Căn cứ Chương 3, Mục 3.2.1 (Trang 30, 33): Digital Reality là bước đầu tiên khảo sát, đánh giá hiện trạng và thách thức trước khi chuyển đổi.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_06', 'moc_cds_03_01', 'Mục tiêu cốt lõi của giai đoạn "Digital Ambition" trong mô hình Schallmo là:', 'TRAC_NGHIEM_4', 'Xác định tầm nhìn số, sứ mệnh và đặt ra các mục tiêu chuyển đổi số cụ thể (SMART).', 'Mua sắm các thiết bị kính thực tế ảo tăng cường cho toàn bộ nhân viên bán hàng.', 'Thử nghiệm các ứng dụng phần mềm nhỏ lẻ trên một nhóm nhỏ khách hàng ngẫu nhiên.', 'Ký hợp đồng thuê đường truyền mạng cáp quang tốc độ cao từ các nhà cung cấp viễn thông.', 0, 'Căn cứ Chương 3, Mục 3.2.1 (Trang 31, 33): Digital Ambition tập trung xác định tầm nhìn số và các mục tiêu chiến lược SMART.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_07', 'moc_cds_03_01', 'Giai đoạn "Digital Potential" trong mô hình Schallmo hướng trọng tâm vào hoạt động nào?', 'TRAC_NGHIEM_4', 'Nghiên cứu bài học thành công, định hình các sáng kiến và kịch bản mô hình kinh doanh số mới.', 'Kiểm tra lỗi bảo mật phần mềm và tiến hành vá các lỗ hổng của hệ thống cơ sở dữ liệu.', 'Đánh giá xếp loại thi đua khen thưởng cuối năm cho đội ngũ nhân viên phòng hành chính.', 'Cắt giảm ngân sách dự phòng và thanh lý các máy tính để bàn đời cũ không còn sử dụng.', 0, 'Căn cứ Chương 3, Mục 3.2.1 (Trang 31, 34): Digital Potential nghiên cứu cơ hội, định hình sáng kiến và kịch bản mô hình kinh doanh số mới.', 2, 'HIEU', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_01', 'moc_cds_03_02', 'Vì sao giai đoạn "Digital Fit" trong mô hình Schallmo lại được đánh giá là đặc biệt quan trọng?', 'TRAC_NGHIEM_4', 'Giúp tổ chức sắp xếp, sàng lọc ưu tiên chiến lược và chọn giải pháp phù hợp nhất với năng lực thực tế.', 'Vì giai đoạn này tập trung vào việc sa thải cắt giảm nhân sự nhằm tiết kiệm quỹ lương tối đa.', 'Đảm bảo doanh nghiệp chỉ cần lập kế hoạch trên giấy mà không bao giờ cần phải triển khai dự án.', 'Tạo ra các báo cáo hành chính đẹp mắt để phục vụ mục đích nộp hồ sơ xin cấp giấy phép kinh doanh.', 0, 'Căn cứ Chương 3, Mục 3.2.1 (Trang 31, 35): Digital Fit đánh giá tính khả thi, lựa chọn giải pháp và ưu tiên chiến lược phù hợp nhất với nguồn lực.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_02', 'moc_cds_03_02', 'Trong giai đoạn cuối cùng "Digital Implementation", tổ chức doanh nghiệp sẽ tiến hành công việc gì?', 'TRAC_NGHIEM_4', 'Triển khai công nghệ vào thực tế, thực hiện dự án thử nghiệm (pilot) và đo lường kết quả để nhân rộng.', 'Xây dựng lại từ đầu bản tuyên bố sứ mệnh và tầm nhìn chung của hội đồng quản trị.', 'Tiến hành các cuộc khảo sát thị trường trên diện rộng để tìm hiểu nhu cầu của khách hàng mới.', 'Tuyển dụng thêm các cộng tác viên bán hàng trực tiếp tại các quầy hàng chợ truyền thống.', 0, 'Căn cứ Chương 3, Mục 3.2.1 (Trang 32, 36): Digital Implementation thực thi các dự án số, thử nghiệm pilot và đo lường kết quả thực tế.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_03', 'moc_cds_03_02', 'Trình tự thực thi chuẩn xác của 5 giai đoạn trong mô hình chuyển đổi số Schallmo là:', 'TRAC_NGHIEM_4', 'Reality $\rightarrow$ Ambition $\rightarrow$ Potential $\rightarrow$ Fit $\rightarrow$ Implementation.', 'Potential $\rightarrow$ Fit $\rightarrow$ Reality $\rightarrow$ Ambition $\rightarrow$ Implementation.', 'Ambition $\rightarrow$ Reality $\rightarrow$ Fit $\rightarrow$ Potential $\rightarrow$ Implementation.', 'Fit $\rightarrow$ Potential $\rightarrow$ Reality $\rightarrow$ Implementation $\rightarrow$ Ambition.', 0, 'Căn cứ Chương 3, Mục 3.2.1 (Trang 30): Lộ trình chuẩn 5 bước Schallmo: Reality -> Ambition -> Potential -> Fit -> Implementation.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_04', 'moc_cds_03_02', 'Mục tiêu cốt lõi của công tác Quản trị thay đổi (Change Management) trong chuyển đổi số là gì?', 'TRAC_NGHIEM_4', 'Giúp nhân sự hiểu rõ lý do, vượt qua tâm lý e ngại và chủ động thích ứng với phương thức làm việc mới.', 'Tự động hóa toàn bộ các hoạt động nội bộ bằng phần mềm mà không cần sự hiện diện của nhân viên.', 'Giải thể các phòng ban chuyên môn cũ để thành lập các phòng ban mang tên công nghệ mới.', 'Gia tăng số lượng các văn bản quy định và chế tài xử phạt hành chính đối với nhân viên chậm trễ.', 0, 'Căn cứ Chương 3, Mục 3.3 (Trang 36-37): Quản trị thay đổi nhằm chuẩn bị, hỗ trợ con người thấu hiểu và thích ứng thành công với phương thức số mới.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_05', 'moc_cds_03_02', 'Trong mô hình quản trị thay đổi ADKAR, giai đoạn "Awareness" (Nhận thức) có ý nghĩa là:', 'TRAC_NGHIEM_4', 'Nhân viên đã hoàn thành xuất sắc các khóa đào tạo chuyên sâu về kỹ năng viết mã phần mềm.', 'Nhân viên hiểu rõ lý do và sự cần thiết cấp bách vì sao tổ chức bắt buộc phải thực hiện chuyển đổi số.', 'Nhân viên trực tiếp áp dụng thành thạo phần mềm mới vào công việc xử lý số liệu hàng ngày.', 'Tổ chức tiến hành trao thưởng và vinh danh những cá nhân có thành tích xuất sắc nhất tháng.', 1, 'Căn cứ Chương 3, Mục 3.3 (Trang 37): Awareness (Nhận thức) là giai đoạn đầu tiên giúp cá nhân hiểu rõ lý do tại sao sự thay đổi lại cần thiết.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_06', 'moc_cds_03_02', 'Giai đoạn "Desire" (Mong muốn) trong mô hình ADKAR đề cập đến trạng thái tâm lý nào của nhân viên?', 'TRAC_NGHIEM_4', 'Việc đánh giá và chấm điểm định kỳ mức độ hoàn thành nhiệm vụ của các kỹ sư công nghệ.', 'Sự khao khát, mong muốn cá nhân và cam kết tự nguyện tham gia ủng hộ quá trình chuyển đổi số.', 'Quá trình tự động hóa các dây chuyền lắp ráp điện tử thông qua việc tích hợp mạng máy tính.', 'Yêu cầu phòng tài chính kế toán xuất các báo cáo doanh thu dưới dạng biểu đồ trực quan.', 1, 'Căn cứ Chương 3, Mục 3.3 (Trang 37): Desire (Mong muốn) khơi gợi sự khao khát và cam kết cá nhân tham gia hỗ trợ chuyển đổi.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_07', 'moc_cds_03_02', 'Rào cản tâm lý phổ biến nhất của đội ngũ nhân sự khi doanh nghiệp chuyển đổi sang quy trình số là:', 'TRAC_NGHIEM_4', 'Nhân viên quá hào hứng và liên tục đề xuất thêm các sáng kiến công nghệ mới cho ban giám đốc.', 'Tâm lý ngại thay đổi, sợ mất vị thế quyền lực hoặc sợ bị đào thải do thiếu hụt kỹ năng công nghệ mới.', 'Công nghệ được mua sắm luôn quá hoàn hảo đến mức không còn bất kỳ lỗi kỹ thuật nào phát sinh.', 'Doanh nghiệp luôn có nguồn kinh phí dư thừa vô hạn để tài trợ cho mọi hoạt động vui chơi giải trí.', 1, 'Căn cứ Chương 3, Mục 3.3 (Trang 38): Tâm lý ngại thay đổi, rời khỏi vùng an toàn là rào cản thách thức phổ biến nhất trong quản trị thay đổi.', 2, 'HIEU', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_01', 'moc_cds_03_03', 'Trước khi thực hiện chiến lược chuyển đổi số, Tập đoàn bán lẻ Reliance Retail của Ấn Độ đối mặt với thách thức lớn nhất là gì?', 'TRAC_NGHIEM_4', 'Tập đoàn hoàn toàn không có bất kỳ cửa hàng bán lẻ truyền thống nào trên toàn lãnh thổ Ấn Độ.', 'Chuỗi cung ứng truyền thống phân tán, khó mở rộng và đối mặt với sự cạnh tranh gay gắt từ Amazon, Flipkart.', 'Không thể tuyển dụng được nhân viên do mức lương đề xuất quá thấp so với mặt bằng chung thị trường.', 'Chính phủ Ấn Độ ban hành luật cấm các tập đoàn lớn kinh doanh mặt hàng nhu yếu phẩm thực phẩm.', 1, 'Căn cứ Chương 3, Mục 3.2.2 (Trang 33): Reliance Retail đối mặt rào cản chuỗi cung ứng truyền thống phân tán và áp lực cạnh tranh gay gắt từ các gã khổng lồ e-commerce ngoại quốc.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_02', 'moc_cds_03_03', 'Tầm nhìn chuyển đổi số đột phá của nền tảng JioMart (Reliance) trong giai đoạn Digital Ambition là gì?', 'TRAC_NGHIEM_4', 'Xây dựng thêm hàng chục nghìn đại siêu thị mặt đất để tiêu diệt toàn bộ các cửa hàng tạp hóa nhỏ lẻ.', 'Trở thành nền tảng bán lẻ O2O (Online-to-Offline) kết nối hàng triệu cửa hàng Kirana truyền thống.', 'Đóng cửa toàn bộ mảng kinh doanh hàng tiêu dùng để chuyển sang sản xuất linh kiện điện tử vi mạch.', 'Chỉ bán hàng cho các khách hàng giàu có tại các đô thị loại một thông qua website tiếng Anh.', 1, 'Căn cứ Chương 3, Mục 3.2.2 (Trang 33-34): JioMart đặt tầm nhìn xây dựng nền tảng bán lẻ O2O kết nối tiểu thương Kirana thay vì đối đầu tiêu diệt họ.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_03', 'moc_cds_03_03', 'Sáng kiến số nổi bật nhất của JioMart trong giai đoạn Digital Potential nhằm kết nối khách hàng là gì?', 'TRAC_NGHIEM_4', 'Phát hành thẻ mua hàng bằng giấy in ấn truyền thống và gửi qua đường bưu điện cho từng hộ gia đình.', 'Xây dựng các tổng đài điện thoại cố định quy mô lớn với hàng nghìn nhân viên trực nghe điện thoại.', 'Ứng dụng công nghệ số tích hợp việc đặt hàng JioMart trực tiếp ngay trên ứng dụng tin nhắn quốc dân WhatsApp.', 'Tập trung toàn bộ ngân sách để mở các điểm bán hàng trực tiếp trên các tuyến phố đi bộ trung tâm.', 2, 'Căn cứ Chương 3, Mục 3.2.2 (Trang 34): Sáng kiến kết nối cửa hàng Kirana với người tiêu dùng qua ứng dụng WhatsApp với hơn 400 triệu người dùng tại Ấn Độ.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_04', 'moc_cds_03_03', 'Bản chất của mô hình O2O (Online-to-Offline) mà JioMart áp dụng thành công rực rỡ là gì?', 'TRAC_NGHIEM_4', 'Chỉ cho phép khách hàng đến xem hàng trực tiếp tại siêu thị rồi sau đó về nhà thanh toán tiền mặt.', 'Bán hàng thông qua các kênh quảng cáo truyền hình tương tác vào ban đêm trên các đài địa phương.', 'Kết hợp linh hoạt giữa việc đặt hàng trực tuyến trên mạng và nhận hàng/giao hàng trực tiếp từ các cửa hàng Kirana gần nhất.', 'Vận chuyển hàng hóa trực tiếp từ các kho bãi sản xuất lớn ở nước ngoài về cảng biển trung chuyển.', 2, 'Căn cứ Chương 3, Mục 3.2.2 (Trang 33, 36): Mô hình O2O (Online-to-Offline) kết hợp đặt hàng trực tuyến và mạng lưới cửa hàng Kirana làm điểm phân phối chặng cuối.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_05', 'moc_cds_03_03', 'Yếu tố quyết định giúp JioMart tăng trưởng thần tốc và xử lý hàng trăm nghìn đơn hàng mỗi ngày trong đại dịch Covid-19 là:', 'TRAC_NGHIEM_4', 'Tập đoàn đã cho sa thải toàn bộ nhân viên giao hàng để cắt giảm chi phí tiền lương trong mùa dịch.', 'Đóng cửa toàn bộ hoạt động kinh doanh trực tuyến để chờ đợi khi nào hết dịch bệnh mới mở lại.', 'Hệ sinh thái công nghệ số linh hoạt và mô hình liên kết biến hàng triệu tiệm Kirana thành các kho hàng chặng cuối siêu tốc.', 'Tập trung bán hàng độc quyền các sản phẩm xa xỉ phẩm cho các đại gia bất động sản.', 2, 'Căn cứ Chương 3, Mục 3.2.2 (Trang 36): Nền tảng số mạnh mẽ và sự liên kết linh hoạt với mạng lưới Kirana giúp tăng trưởng bứt phá trong đại dịch.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_06', 'moc_cds_03_03', 'Trong Bộ chỉ số DTI của Việt Nam, cơ cấu tỷ trọng điểm số giữa 3 trụ cột được phân bổ chuẩn xác như thế nào?', 'TRAC_NGHIEM_4', 'Chính phủ số: 33.3%, Kinh tế số: 33.3%, Xã hội số: 33.3% chia đều tuyệt đối cho cả 3 trụ cột.', 'Chính phủ số: 60%, Kinh tế số: 20%, Xã hội số: 20% tổng số điểm đánh giá.', 'Chính phủ số: 40%, Kinh tế số: 35%, Xã hội số: 25% tổng số điểm đánh giá.', 'Chính phủ số: 10%, Kinh tế số: 80%, Xã hội số: 10% tổng số điểm đánh giá.', 2, 'Căn cứ Chương 3, Mục 3.4 (Trang 39): Bộ chỉ số DTI phân bổ: Chính phủ số chiếm 40%, Kinh tế số chiếm 35%, Xã hội số chiếm 25%.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_07', 'moc_cds_03_03', 'Khi bệnh viện triển khai hệ thống Bệnh án điện tử (EMR) thay cho sổ bệnh án giấy, nhiều bác sĩ lâu năm phàn nàn và từ chối sử dụng vì cho rằng "viết tay nhanh hơn bấm bàn phím" và lo ngại làm lộ thông tin bệnh nhân. Ban Giám đốc cần kích hoạt giai đoạn nào đầu tiên trong mô hình ADKAR để giải tỏa sự kháng cự này?', 'TRAC_NGHIEM_4', 'Giai đoạn Ability: Bắt buộc các bác sĩ phải thực hiện kỳ thi đánh giá tốc độ gõ bàn phím hàng tuần.', 'Giai đoạn Reinforcement: Phạt tiền trừ lương đối với bất kỳ bác sĩ nào còn cầm bút viết tay.', 'Giai đoạn Awareness: Tổ chức đối thoại giải thích rõ ràng lý do, lợi ích giảm sai sót y khoa và tính bảo mật của bệnh án điện tử.', 'Giai đoạn Knowledge: Đưa các bác sĩ đi đào tạo chuyên sâu về ngôn ngữ lập trình cơ sở dữ liệu SQL.', 2, 'Giai đoạn đầu tiên và quan trọng nhất trong ADKAR để giải tỏa kháng cự là Awareness (Nhận thức): nhân viên chỉ ủng hộ khi họ hiểu rõ "Tại sao phải thay đổi?" và "Nếu không thay đổi thì hậu quả là gì?".', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_08', 'moc_cds_03_03', 'Một tỉnh đạt điểm rất cao về hạ tầng cáp quang và tỷ lệ số hóa hồ sơ thủ tục hành chính công (Chính phủ số), nhưng tỷ lệ doanh nghiệp sử dụng hợp đồng điện tử và tỷ lệ người dân thanh toán số không tiền mặt lại rất thấp. Tỉnh này cần tập trung cải thiện trụ cột nào trong Bộ chỉ số DTI để cải thiện thứ hạng?', 'TRAC_NGHIEM_4', 'Chỉ cần chi thêm ngân sách xây dựng thêm nhiều tòa nhà trụ sở ủy ban nhân dân tỉnh khang trang hơn.', 'Cắt giảm bớt các trạm phát sóng viễn thông 4G/5G để dồn kinh phí in ấn thêm tờ rơi hướng dẫn.', 'Tập trung cải thiện 2 trụ cột: Kinh tế số (thúc đẩy DN dùng nền tảng số) và Xã hội số (phổ cập kỹ năng số và thanh toán số cho người dân).', 'Ngừng công bố chỉ số DTI hàng năm để tránh bị so sánh với các tỉnh thành phố lân cận.', 2, 'DTI đo lường cả 3 trụ cột (Chính phủ số 40%, Kinh tế số 35%, Xã hội số 25%). Khi Chính phủ số đã tốt nhưng thương mại và người dân chưa số hóa, tỉnh phải tập trung nâng cao chỉ số Kinh tế số và Xã hội số.', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_08', 'moc_cds_03_01', 'Chạm chọn 1 giai đoạn của mô hình Schallmo bên Trái và nội dung tương ứng bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác 4 bước đầu tiên trong lộ trình 5 bước theo Mô hình Schallmo.', 2, 'HIEU', 4, '{"pairs":[{"left":"Digital Reality (Thực tế số)","right":"Khảo sát hiện trạng và nhận diện thách thức"},{"left":"Digital Ambition (Tham vọng số)","right":"Xác định tầm nhìn số và mục tiêu SMART"},{"left":"Digital Potential (Tiềm năng số)","right":"Khám phá bài học kinh nghiệm và mô hình mới"},{"left":"Digital Fit (Phù hợp số)","right":"Sàng lọc giải pháp khả thi với nguồn lực tổ chức"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_09', 'moc_cds_03_01', 'Chạm vào các thẻ từ để sắp xếp đúng trình tự 5 bước theo Mô hình Schallmo:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Trình tự chuẩn của lộ trình Schallmo: Reality -> Ambition -> Potential -> Fit -> Implementation.', 2, 'NHO', 4, '{"prompt":"Sắp xếp chuẩn trình tự 5 bước Schallmo:","correct_order":["Digital Reality (Thực tế số)","Digital Ambition (Tham vọng số)","Digital Potential (Tiềm năng số)","Digital Fit (Phù hợp số)","Digital Implementation (Triển khai số)"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_01_10', 'moc_cds_03_01', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Digital Fit (Phù hợp số) là bước lựa chọn, thẩm định tính khả thi của giải pháp với tổ chức.', 1, 'NHO', 4, '{"sentence_template":"Trong mô hình Schallmo, giai đoạn {blank} đóng vai trò thẩm định, đánh giá tính khả thi và lựa chọn các sáng kiến số phù hợp nhất với văn hóa và nguồn lực tổ chức.","options":["Digital Fit","Digital Reality","Digital Ambition","Digital Potential"],"blank_answer":"Digital Fit"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_08', 'moc_cds_03_02', 'Chạm chọn 1 chữ cái trong mô hình ADKAR bên Trái và ý nghĩa tương ứng bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác các thành phần của mô hình Quản trị thay đổi ADKAR (Prosci).', 2, 'HIEU', 4, '{"pairs":[{"left":"A - Awareness (Nhận thức)","right":"Hiểu rõ lý do vì sao bắt buộc phải thay đổi"},{"left":"D - Desire (Mong muốn)","right":"Khao khát và cam kết tự nguyện tham gia"},{"left":"K - Knowledge (Kiến thức)","right":"Đào tạo kỹ năng và kiến thức sử dụng công cụ mới"},{"left":"R - Reinforcement (Củng cố)","right":"Khen thưởng để duy trì thói quen và không tái phạm"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_02_09', 'moc_cds_03_02', 'Chọn tỷ trọng thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Bộ chỉ số DTI: Chính phủ số chiếm 40%, Kinh tế số chiếm 35%, Xã hội số chiếm 25%.', 1, 'NHO', 4, '{"sentence_template":"Trong Bộ chỉ số đánh giá chuyển đổi số (DTI) của Việt Nam, trụ cột Chính phủ số chiếm {blank} trong cơ cấu tổng số điểm đánh giá.","options":["40%","35%","25%","50%"],"blank_answer":"40%"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_09', 'moc_cds_03_03', 'Chạm vào các thẻ từ để sắp xếp đúng trình tự 5 giai đoạn tâm lý trong mô hình ADKAR:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình chuẩn ADKAR: Awareness -> Desire -> Knowledge -> Ability -> Reinforcement.', 2, 'HIEU', 4, '{"prompt":"Sắp xếp chuẩn trình tự 5 giai đoạn ADKAR:","correct_order":["Awareness (Hiểu lý do cần thay đổi)","Desire (Khao khát và cam kết tham gia)","Knowledge (Học hỏi kiến thức kỹ năng số)","Ability (Chuyển hóa thành năng lực thực hành)","Reinforcement (Khen thưởng và củng cố thói quen)"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_03_03_10', 'moc_cds_03_03', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Mô hình O2O (Online-to-Offline) là chìa khóa thành công của JioMart.', 1, 'NHO', 4, '{"sentence_template":"JioMart của tập đoàn Reliance Retail đã áp dụng mô hình bán lẻ {blank}, kết nối người mua trực tuyến với hơn 15 triệu tiệm tạp hóa Kirana truyền thống tại Ấn Độ.","options":["O2O (Online-to-Offline)","B2B thuần túy","C2C phi tập trung","Bán hàng đa cấp"],"blank_answer":"O2O (Online-to-Offline)"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_01', 'moc_cds_04_01', 'Trí tuệ nhân tạo (AI) trong lĩnh vực y tế giúp mang lại lợi ích chính nào sau đây?', 'TRAC_NGHIEM_4', 'Làm gia tăng đáng kể thời gian chờ đợi khám chữa bệnh của bệnh nhân tại các phòng khám chuyên khoa.', 'Làm suy giảm nghiêm trọng khả năng tổng hợp và phân tích dữ liệu lâm sàng của các thiết bị y tế hiện đại.', 'Sa thải toàn bộ đội ngũ y bác sĩ, điều dưỡng để thay thế hoàn toàn bằng các hệ thống rô-bốt tự phẫu thuật.', 'Hỗ trợ bác sĩ chẩn đoán chính xác hơn, phát hiện sớm các tổn thương bệnh lý nguy hiểm và cá nhân hóa phác đồ điều trị.', 3, 'Căn cứ Câu 1, Bài tập Chương 4 (Trang 55): AI trong y tế giúp chẩn đoán chính xác hơn và phát hiện bệnh sớm.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_02', 'moc_cds_04_01', 'Hệ thống DrAid™ do công ty VinBrain (Việt Nam) phát triển chủ yếu được ứng dụng trong công việc gì?', 'TRAC_NGHIEM_4', 'Tự động dịch thuật các văn bản ngoại giao đa ngôn ngữ phục vụ cho các hội nghị quốc tế của chính phủ.', 'Tạo lập các mô hình dự báo thời tiết dài hạn và cảnh báo sớm hiện tượng bão lũ thiên tai phức tạp.', 'Quản lý việc thu thuế giá trị gia tăng và theo dõi việc kê khai tài sản của các doanh nghiệp kinh doanh.', 'Phân tích hình ảnh X-quang y tế ứng dụng AI để phát hiện chính xác hàng chục bệnh lý phổi, tim và ung thư.', 3, 'Căn cứ Câu 2, Bài tập Chương 4 (Trang 55): DrAid™ của VinBrain chủ yếu dùng để phân tích X-quang phát hiện nhiều bệnh lý.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_03', 'moc_cds_04_01', 'Ứng dụng Trí tuệ nhân tạo (AI) trong lĩnh vực tài chính - ngân hàng mang lại giá trị nào sau đây?', 'TRAC_NGHIEM_4', 'Tăng mức phí duy trì tài khoản hàng tháng và tăng phí rút tiền mặt tại các cây ATM ngân hàng.', 'Làm suy giảm tính bảo mật dữ liệu tài khoản và khiến các giao dịch chuyển tiền bị gián đoạn thường xuyên.', 'Sa thải toàn bộ nhân viên giao dịch viên và đóng cửa hoàn toàn các trụ sở ngân hàng trên toàn quốc.', 'Tự động hóa các quy trình nghiệp vụ thẩm định tín dụng, phát hiện gian lận giao dịch và hỗ trợ khách hàng qua Chatbot 24/7.', 3, 'Căn cứ Câu 3, Bài tập Chương 4 (Trang 55): AI trong ngân hàng giúp tự động hóa quy trình, phát hiện gian lận.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_04', 'moc_cds_04_01', 'Ứng dụng học ngoại ngữ nổi tiếng Duolingo sử dụng Trí tuệ nhân tạo (AI) nhằm mục đích gì?', 'TRAC_NGHIEM_4', 'Theo dõi chỉ số nhịp tim và đếm số bước chân vận động hàng ngày của người học trên điện thoại.', 'Điều phối hệ thống đèn tín hiệu giao thông thông minh tại các ngã tư đô thị lớn vào giờ cao điểm.', 'Dự báo biến động giá cổ phiếu và tỷ giá hối đoái của các ngân hàng thương mại trên thế giới.', 'Phân tích trình độ, phát hiện điểm yếu ngữ pháp và tự động gợi ý bài học cá nhân hóa phù hợp cho từng người dùng.', 3, 'Căn cứ Câu 4, Bài tập Chương 4 (Trang 55): Duolingo sử dụng AI để gợi ý bài học phù hợp từng cá nhân.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_05', 'moc_cds_04_01', 'Điểm mạnh nổi bật và mang tính quyết định của công nghệ Điện toán đám mây (Cloud Computing) là:', 'TRAC_NGHIEM_4', 'Tốc độ truy cập tài nguyên dữ liệu luôn bị giới hạn chậm hơn nhiều so với việc lưu trữ trên ổ đĩa mềm.', 'Hệ thống có cấu trúc đóng kín mít, cực kỳ khó khăn hoặc không thể mở rộng quy mô khi lượng người dùng tăng.', 'Bắt buộc doanh nghiệp phải mua sắm và tự bảo trì hàng trăm máy chủ vật lý đắt đỏ tại trụ sở công ty.', 'Khả năng triển khai nhanh chóng, linh hoạt mở rộng quy mô tính toán tức thì theo nhu cầu và tiết kiệm chi phí đầu tư.', 3, 'Căn cứ Câu 5, Bài tập Chương 4 (Trang 55): Điểm mạnh nổi bật của Cloud là triển khai nhanh, linh hoạt, tiết kiệm chi phí.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_06', 'moc_cds_04_01', 'Tập đoàn giải trí trực tuyến Netflix sử dụng nền tảng Điện toán đám mây (Cloud Computing) để làm gì?', 'TRAC_NGHIEM_4', 'Lưu trữ kho nội dung video khổng lồ và phát trực tuyến (streaming) mượt mà cho hàng trăm triệu người dùng trên toàn cầu.', 'Sản xuất và in ấn sách giáo khoa giấy để phát hành miễn phí cho các thư viện trường học vùng sâu.', 'Quản lý việc cấp phát giấy chứng nhận quyền sử dụng đất và cấp sổ đỏ cho người dân tại các đô thị.', 'Điều khiển các cánh tay robot cơ khí tự động trong các nhà máy lắp ráp xe ô tô điện thể thao.', 0, 'Căn cứ Câu 6, Bài tập Chương 4 (Trang 55): Netflix sử dụng nền tảng Cloud để lưu trữ video và phát trực tuyến cho hàng triệu người dùng.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_07', 'moc_cds_04_01', 'Ở Việt Nam, nhóm các nền tảng Điện toán đám mây "Make in Vietnam" tiêu biểu được sử dụng rộng rãi gồm:', 'TRAC_NGHIEM_4', 'VNPT Cloud, Viettel Cloud, CMC Cloud và FPT Cloud.', 'Tiktok Cloud, Youtube Cloud, Twitter Cloud và Instagram Cloud.', 'OnlyFans Cloud, Bigo Cloud, Kuaishou Cloud và Douyin Cloud.', 'Alibaba Cloud EU, Baidu Cloud China, Naver Cloud Korea và Tencent Cloud.', 0, 'Căn cứ Câu 7, Bài tập Chương 4 (Trang 56): Nền tảng Cloud Make in Vietnam gồm: VNPT Cloud, Viettel Cloud, CMC Cloud, FPT Cloud.', 1, 'NHO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_01', 'moc_cds_04_02', 'Ứng dụng Điện toán đám mây (Cloud) trong lĩnh vực giáo dục và đào tạo đem lại lợi ích nào?', 'TRAC_NGHIEM_4', 'Lưu trữ học liệu số tập trung, hỗ trợ học và thi trực tuyến ổn định, kết nối mọi lúc mọi nơi.', 'Làm giảm sút khả năng tham gia học tập trực tuyến của sinh viên ở các vùng ngoại thành.', 'Chỉ hỗ trợ cho giảng viên lưu giáo án và hoàn toàn không cho phép sinh viên tra cứu tài liệu.', 'Làm tăng vọt chi phí xây dựng phòng học truyền thống và tăng ngân sách mua bảng phấn.', 0, 'Căn cứ Câu 8, Bài tập Chương 4 (Trang 56): Cloud trong giáo dục giúp lưu trữ học liệu, học và thi trực tuyến ổn định.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_02', 'moc_cds_04_02', 'Dữ liệu lớn (Big Data) khác biệt căn bản so với dữ liệu truyền thống ở những đặc tính nào sau đây?', 'TRAC_NGHIEM_4', 'Khối lượng dữ liệu cực lớn, cấu trúc đa dạng nhiều loại và tốc độ sinh ra cập nhật rất nhanh.', 'Hoàn toàn không thể lưu trữ được trên bất kỳ thiết bị đĩa cứng điện tử hiện đại nào.', 'Luôn luôn chứa các thông tin sai lệch vô giá trị và không thể phân tích được.', 'Chỉ có thể tồn tại dưới dạng văn bản viết tay truyền thống trên các trang sách cổ xưa.', 0, 'Căn cứ Câu 9, Bài tập Chương 4 (Trang 56): Big Data khác dữ liệu truyền thống ở 3 đặc trưng (3Vs): Volume, Variety, Velocity.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_03', 'moc_cds_04_02', 'Ứng dụng phân tích Dữ liệu lớn (Big Data) trong thương mại điện tử giúp doanh nghiệp làm gì?', 'TRAC_NGHIEM_4', 'Phân tích sở thích, lịch sử mua hàng để tự động gợi ý sản phẩm phù hợp cho từng cá nhân khách hàng.', 'Làm giảm sự hài lòng và gia tăng tỷ lệ khiếu nại đổi trả hàng hóa của người tiêu dùng.', 'Chỉ lưu trữ duy nhất các tập tin hình ảnh sản phẩm mà không lưu thông tin giá cả.', 'Làm mất hoàn toàn khả năng dự đoán nhu cầu tiêu dùng của thị trường trong các dịp lễ tết.', 0, 'Căn cứ Câu 10, Bài tập Chương 4 (Trang 56): Big Data trong TMĐT giúp phân tích hành vi và gợi ý sản phẩm cá nhân hóa.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_04', 'moc_cds_04_02', 'Hệ thống Cơ sở dữ liệu quốc gia về dân cư ở Việt Nam là một ví dụ điển hình về Big Data phục vụ mục đích gì?', 'TRAC_NGHIEM_4', 'Theo dõi diễn biến dự báo thời tiết và lượng mưa hàng ngày tại các trạm khí tượng thủy văn.', 'Quản lý thông tin định danh công dân tập trung, phục vụ giải quyết thủ tục hành chính toàn diện.', 'Kiểm tra chất lượng và thời hạn sử dụng của các sản phẩm thực phẩm đông lạnh nhập khẩu.', 'Dự báo doanh số bán hàng của các sàn thương mại điện tử quốc tế trên thị trường nội địa.', 1, 'Căn cứ Câu 11, Bài tập Chương 4 (Trang 56): CSDL quốc gia về dân cư ở Việt Nam là ví dụ Big Data quản lý thông tin người dân toàn quốc.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_05', 'moc_cds_04_02', 'Các doanh nghiệp thương mại điện tử hàng đầu như Tiki hay Shopee khai thác Dữ liệu lớn (Big Data) để làm gì?', 'TRAC_NGHIEM_4', 'Tự động tăng giá sản phẩm một cách ngẫu nhiên nhằm làm khó người tiêu dùng khi thanh toán.', 'Gợi ý sản phẩm phù hợp theo sở thích cá nhân, tối ưu chuỗi cung ứng và dự đoán xu hướng tiêu dùng.', 'Xóa sạch toàn bộ lịch sử mua sắm của khách hàng ngay sau khi họ đóng ứng dụng mua hàng.', 'Chỉ phục vụ duy nhất cho việc kiểm kê đếm số lượng thùng hàng nằm trong kho bãi.', 1, 'Căn cứ Câu 12, Bài tập Chương 4 (Trang 56): Doanh nghiệp như Tiki, Shopee dùng Big Data để gợi ý sản phẩm, dự đoán xu hướng tiêu dùng.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_06', 'moc_cds_04_02', 'Internet vạn vật (Internet of Things - IoT) được hiểu là công nghệ cho phép điều gì?', 'TRAC_NGHIEM_4', 'Các máy móc công nghiệp hoạt động hoàn toàn độc lập mà không cần bất kỳ tín hiệu dữ liệu nào.', 'Các thiết bị vật lý kết nối mạng Internet, tự động thu thập và trao đổi dữ liệu với nhau thời gian thực.', 'Làm suy giảm khả năng tự động hóa và bắt buộc phải có người túc trực điều khiển công tắc tay.', 'Chỉ có thể kết nối được các bóng đèn sợi đốt trong phòng ngủ gia đình.', 1, 'Căn cứ Câu 13, Bài tập Chương 4 (Trang 56-57): IoT là công nghệ cho phép các thiết bị kết nối Internet và trao đổi dữ liệu.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_07', 'moc_cds_04_02', 'Một ví dụ tiêu biểu và rõ nét nhất của việc ứng dụng công nghệ IoT trong nông nghiệp thông minh là:', 'TRAC_NGHIEM_4', 'Lắp đặt các camera giám sát tốc độ phương tiện trên đường cao tốc liên tỉnh.', 'Hệ thống cảm biến đo độ ẩm đất, nhiệt độ và tự động kích hoạt van tưới tiêu chính xác theo nhu cầu cây trồng.', 'Sử dụng máy in laser văn phòng để in ấn các báo cáo thống kê sản lượng cây vụ đông.', 'Trang bị máy tính để bàn có kết nối mạng LAN cho các thủ kho bảo quản phân bón hóa học.', 1, 'Căn cứ Câu 14, Bài tập Chương 4 (Trang 57): Ví dụ tiêu biểu của IoT nông nghiệp là cảm biến đo độ ẩm và tự động tưới tiêu.', 1, 'NHO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_01', 'moc_cds_04_03', 'Giải pháp nhà thông minh (Smart Home) ứng dụng công nghệ IoT cho phép người dùng:', 'TRAC_NGHIEM_4', 'Bắt buộc phải viết tin nhắn giấy thủ công gửi qua bưu điện để yêu cầu bật điều hòa không khí.', 'Điều khiển bật tắt các thiết bị điện tử, chiếu sáng, khóa cửa từ xa hoặc thông qua trợ lý ảo giọng nói.', 'Không thể kiểm soát hoặc theo dõi trạng thái thiết bị khi người dùng đi ra khỏi ngôi nhà.', 'Làm hỏng toàn bộ các thiết bị gia dụng và gây đoản mạch hệ thống điện lưới trong nhà.', 1, 'Căn cứ Câu 15, Bài tập Chương 4 (Trang 57): Ứng dụng IoT trong Smart Home gồm điều khiển thiết bị bằng giọng nói hoặc từ xa qua ứng dụng.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_02', 'moc_cds_04_03', 'Nền tảng VNPT SmartAgri được phát triển tại Việt Nam mang lại công năng chính nào cho người nông dân?', 'TRAC_NGHIEM_4', 'Điều khiển tự động các dòng xe ô tô tải tự lái trên đường cao tốc Bắc Nam.', 'Giám sát trang trại theo thời gian thực thông qua mạng cảm biến IoT đo độ ẩm, nhiệt độ và dinh dưỡng.', 'Quản lý hồ sơ bệnh án điện tử và điều phối xe cấp cứu tại các bệnh viện trung ương.', 'Tự động tính lương và xuất hóa đơn thuế giá trị gia tăng cho các nhà máy dệt may.', 1, 'Căn cứ Câu 16, Bài tập Chương 4 (Trang 57): Tại Việt Nam, VNPT SmartAgri giúp giám sát nông trại qua cảm biến IoT.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_03', 'moc_cds_04_03', 'Đặc điểm kỹ thuật ưu việt nhất khiến công nghệ Blockchain trở nên đáng tin cậy trong các giao dịch số là:', 'TRAC_NGHIEM_4', 'Dữ liệu lưu trữ tập trung tại một máy tính cá nhân nên bất kỳ ai cũng có thể tùy ý sửa đổi dễ dàng.', 'Hệ thống hoàn toàn chỉ phục vụ cho việc giải trí chơi game trực tuyến và không có giá trị thương mại.', 'Tính chất phân tán phi tập trung, mã hóa bảo mật cao và dữ liệu có tính bất biến, cực kỳ khó làm giả.', 'Không hỗ trợ việc lưu trữ hay kiểm tra đối chiếu lịch sử của bất kỳ giao dịch chuyển khoản nào.', 2, 'Căn cứ Câu 17, Bài tập Chương 4 (Trang 57): Công nghệ Blockchain có đặc điểm nổi bật là phi tập trung, minh bạch và khó làm giả.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_04', 'moc_cds_04_03', 'Ứng dụng công nghệ Blockchain trong việc truy xuất nguồn gốc nông sản mang lại lợi ích thiết thực nào?', 'TRAC_NGHIEM_4', 'Làm giá thành xuất xưởng của các loại rau củ tăng lên gấp mười lần so với giá thị trường.', 'Ẩn giấu hoàn toàn danh tính của nhà sản xuất để người tiêu dùng không thể khiếu nại chất lượng.', 'Lưu trữ bất biến, minh bạch thông tin toàn bộ chuỗi sản xuất, vận chuyển từ nông trại đến bàn ăn của người tiêu dùng.', 'Chỉ có thể áp dụng cho các loại trái cây nhiệt đới xuất khẩu và không thể dùng cho các nông sản khác.', 2, 'Căn cứ Câu 18, Bài tập Chương 4 (Trang 57): Blockchain truy xuất nguồn gốc giúp lưu trữ thông tin toàn bộ chuỗi sản xuất - vận chuyển một cách minh bạch, chống gian lận.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_05', 'moc_cds_04_03', 'Các viện đại học danh tiếng hàng đầu thế giới như MIT và Harvard đã ứng dụng công nghệ Blockchain vào mục đích gì?', 'TRAC_NGHIEM_4', 'Phát hành các bộ sưu tập tranh ảnh kỹ thuật số NFT để bán đấu giá gây quỹ từ thiện.', 'Quản lý vị trí đỗ xe của sinh viên trong khuôn viên ký túc xá vào các buổi tối cuối tuần.', 'Cấp phát và xác thực văn bằng, chứng chỉ số nhằm chống gian lận và loại bỏ triệt để nạn làm bằng giả.', 'Tự động điều phối các chuyến xe buýt đưa đón học sinh sinh viên đến các giảng đường.', 2, 'Căn cứ Câu 19, Bài tập Chương 4 (Trang 57): MIT và Harvard dùng Blockchain để chống gian lận trong chứng chỉ và bằng cấp.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_06', 'moc_cds_04_03', 'Tại Việt Nam, ngân hàng Tiên Phong (TPBank) đã tiên phong ứng dụng công nghệ Blockchain chủ yếu vào dịch vụ nào?', 'TRAC_NGHIEM_4', 'Phát hành tiền ảo và các đồng token kỹ thuật số không có tài sản bảo đảm trên thị trường tự do.', 'Điểm danh nhận diện khuôn mặt sinh viên tại các cổng trường đại học thành viên liên kết.', 'Chuyển tiền quốc tế hai chiều an toàn, minh bạch với tốc độ cao tính bằng phút thông qua mạng liên ngân hàng.', 'Điều khiển hệ thống thiết bị cảm biến nhiệt độ tại các cây ATM rút tiền ngoài mặt phố.', 2, 'Căn cứ Câu 20, Bài tập Chương 4 (Trang 58): TPBank sử dụng Blockchain chủ yếu để chuyển tiền quốc tế nhanh và an toàn qua mạng RippleNet.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_07', 'moc_cds_04_03', 'Một hợp tác xã xuất khẩu thanh long tại Bình Thuận muốn xuất khẩu sang thị trường khó tính châu Âu (EU). EU yêu cầu chứng minh nhiệt độ bảo quản trong thùng xe lạnh luôn duy trì từ 2°C đến 5°C trong suốt 15 ngày vận chuyển biển và không thể bị tài xế gian lận tắt máy lạnh để tiết kiệm dầu. Giải pháp công nghệ số kết hợp hoàn hảo nhất là gì?', 'TRAC_NGHIEM_4', 'Yêu cầu tài xế chụp ảnh nhiệt kế bằng điện thoại mỗi giờ rồi gửi tin nhắn Zalo về cho ban giám đốc.', 'In sẵn một tập phiếu cam kết bảo quản nhiệt độ chuẩn có đóng dấu mộc đỏ của hợp tác xã để kẹp vào hồ sơ hải quan.', 'Trang bị cảm biến nhiệt độ IoT gắn trong thùng lạnh tự động gửi dữ liệu định kỳ và ghi trực tiếp vào sổ cái Blockchain bất biến, khiến không ai có thể làm sai lệch dữ liệu.', 'Chuyển sang sử dụng dịch vụ đám mây công cộng miễn phí để lưu trữ danh bạ số điện thoại của lái xe tải.', 2, 'Cảm biến IoT tự động đo nhiệt độ thời gian thực kết hợp Blockchain lưu trữ dữ liệu bất biến là giải pháp chuẩn quốc tế chống gian lận chuỗi cung ứng lạnh (Cold Chain).', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_08', 'moc_cds_04_03', 'Khách hàng A đang ở Hà Nội vừa quẹt thẻ tín dụng mua cà phê lúc 10h00 sáng, nhưng đến 10h05 sáng cùng ngày hệ thống ghi nhận một giao dịch rút 50 triệu VNĐ tại một máy ATM ở Paris (Pháp). Thuật toán AI phòng chống gian lận của ngân hàng sẽ xử lý như thế nào dựa trên dữ liệu lớn?', 'TRAC_NGHIEM_4', 'Lập tức gửi thư mời họp hội đồng kỷ luật giao dịch viên chi nhánh đã mở thẻ cho khách hàng A.', 'Tiến hành trừ tiền ngay lập tức và cộng thêm điểm thưởng tích lũy du lịch nước ngoài cho khách hàng.', 'Xóa toàn bộ hồ sơ dữ liệu lịch sử của khách hàng A khỏi cơ sở dữ liệu của ngân hàng để tránh phiền phức.', 'Tự động nhận diện đây là hành vi bất thường bất khả thi về mặt địa lý (Anomaly Detection), tạm khóa giao dịch đáng ngờ và gửi cảnh báo xác thực OTP/gọi điện ngay cho khách hàng A.', 3, 'AI ngân hàng ứng dụng thuật toán phát hiện bất thường (Anomaly Detection) trên dữ liệu thời gian thực để ngăn chặn tội phạm trộm cắp thông tin thẻ xuyên quốc gia.', 4, 'VAN_DUNG_CAO', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_08', 'moc_cds_04_01', 'Chạm chọn 1 sản phẩm/nền tảng công nghệ bên Trái và ứng dụng thực tế bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác các case study thực tế về AI và Cloud Computing tiêu biểu trong nước và quốc tế.', 2, 'HIEU', 4, '{"pairs":[{"left":"DrAid™ (VinBrain)","right":"AI phân tích X-quang phát hiện tổn thương phổi"},{"left":"Duolingo AI","right":"Gợi ý bài tập ngữ pháp cá nhân hóa cho người học"},{"left":"Netflix Cloud","right":"Streaming video chất lượng cao cho hàng triệu người"},{"left":"Viettel / VNPT Cloud","right":"Hạ tầng đám mây Make in Vietnam bảo vệ dữ liệu"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_09', 'moc_cds_04_01', 'Chạm vào các thẻ để sắp xếp đúng các mô hình dịch vụ Điện toán đám mây theo mức độ kiểm soát của người dùng:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Trình tự quản lý: On-Premises (tự quản lý hết) -> IaaS -> PaaS -> SaaS (nhà cung cấp quản lý hết).', 3, 'HIEU', 4, '{"prompt":"Sắp xếp mô hình Cloud từ quản lý nhiều đến ít:","correct_order":["On-Premises (Tự quản trị 100% phần cứng & phần mềm)","IaaS - Hạ tầng như một dịch vụ (Thuê máy chủ & mạng)","PaaS - Nền tảng như một dịch vụ (Thuê môi trường lập trình)","SaaS - Phần mềm như một dịch vụ (Chỉ sử dụng ứng dụng web)"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_01_10', 'moc_cds_04_01', 'Chọn tên sản phẩm thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'DrAid™ của VinBrain là giải pháp AI phân tích X-quang hàng đầu của Việt Nam.', 1, 'NHO', 4, '{"sentence_template":"Nền tảng {blank} do VinBrain phát triển là sản phẩm y tế ứng dụng AI đạt chuẩn FDA Hoa Kỳ, hỗ trợ chẩn đoán hình ảnh X-quang phổi tại nhiều bệnh viện lớn ở Việt Nam.","options":["DrAid™","VNPT SmartAgri","eCabinet","TPBank Blockchain"],"blank_answer":"DrAid™"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_08', 'moc_cds_04_02', 'Chạm chọn 1 lĩnh vực ứng dụng IoT bên Trái và ví dụ tiêu biểu bên Phải:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Ghép cặp chuẩn xác các ứng dụng thực tế phong phú của IoT trong các lĩnh vực kinh tế - xã hội.', 2, 'HIEU', 4, '{"pairs":[{"left":"Nhà thông minh (Smart Home)","right":"Điều khiển đèn, máy lạnh từ xa hoặc qua giọng nói"},{"left":"Nông nghiệp thông minh","right":"VNPT SmartAgri cảm biến độ ẩm tự động tưới tiêu"},{"left":"Logistics thông minh","right":"Cảm biến RFID theo dõi vị trí và nhiệt độ xe lạnh"},{"left":"Đô thị thông minh (Smart City)","right":"Camera AI phát hiện ùn tắc và điều phối đèn giao thông"}]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_02_09', 'moc_cds_04_02', 'Chọn tên giải pháp thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'VNPT SmartAgri là giải pháp IoT nông nghiệp thông minh tiêu biểu tại Việt Nam.', 1, 'NHO', 4, '{"sentence_template":"Tại Việt Nam, giải pháp {blank} của tập đoàn VNPT là nền tảng nông nghiệp thông minh ứng dụng mạng cảm biến IoT để giám sát vi khí hậu nhà màng và điều khiển tưới nhỏ giọt tự động.","options":["VNPT SmartAgri","VNPT eCabinet","DrAid™ VinBrain","Tiki AI"],"blank_answer":"VNPT SmartAgri"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_09', 'moc_cds_04_03', 'Chạm vào các thẻ từ để sắp xếp đúng quy trình vận hành khép kín của một hệ thống IoT hoàn chỉnh:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình 4 yếu tố then chốt của IoT: Cảm biến -> Kết nối -> Xử lý dữ liệu -> Giao diện phản hồi/điều khiển.', 3, 'HIEU', 4, '{"prompt":"Sắp xếp quy trình xử lý IoT 4 bước:","correct_order":["Cảm biến (Sensors) thu thập tín hiệu từ môi trường thực","Mạng kết nối (Connectivity) truyền dữ liệu qua Internet/4G","Bộ xử lý máy chủ (Data Processing) phân tích dữ liệu","Giao diện điều khiển (User Interface) đưa ra lệnh phản hồi"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_04_03_10', 'moc_cds_04_03', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Blockchain có tính bất biến, chống làm giả văn bằng chứng chỉ hiệu quả.', 1, 'NHO', 4, '{"sentence_template":"Nhờ vào tính chất phân tán và mật mã học, công nghệ {blank} giúp lưu trữ thông tin có tính bất biến, được các trường đại học MIT và Harvard ứng dụng để ngăn chặn bằng cấp giả mạo.","options":["Blockchain","Điện toán đám mây","Big Data","Mạng LAN"],"blank_answer":"Blockchain"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_01', 'moc_cds_05_01', 'Chuyển đổi số trong lĩnh vực xã hội hướng đến mục tiêu cốt lõi và nhân văn nhất là gì?', 'TRAC_NGHIEM_4', 'Tập trung tối đa hóa lợi nhuận tài chính cho các tập đoàn thương mại điện tử đa quốc gia', 'Cắt giảm tối đa ngân sách chi tiêu công và hạn chế đầu tư các dịch vụ phúc lợi xã hội căn bản', 'Thay thế toàn bộ lực lượng lao động phổ thông trong xã hội bằng các dây chuyền robot tự động', 'Lấy người dân làm trung tâm, nâng cao chất lượng cuộc sống và thu hẹp khoảng cách phát triển', 3, 'Chuyển đổi số xã hội luôn lấy người dân làm trung tâm, nâng cao trải nghiệm sống và bảo đảm không ai bị bỏ lại phía sau.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_02', 'moc_cds_05_01', 'Theo Quyết định số 749/QĐ-TTg của Thủ tướng Chính phủ, Chương trình Chuyển đổi số quốc gia tại Việt Nam được xây dựng vững chắc dựa trên 3 trụ cột nào sau đây?', 'TRAC_NGHIEM_4', 'Kinh tế số - Doanh nghiệp công nghệ số - Hạ tầng viễn thông 5G thế hệ mới đồng bộ', 'Chính phủ số - Hiện đại hóa giáo dục số - Đẩy mạnh xã hội hóa các cơ sở y tế tư nhân', 'Kinh tế số - Nền tảng công nghệ số - Bảo tồn và phát huy bản sắc văn hóa số truyền thống', 'Chính phủ số - Kinh tế số - Xã hội số', 3, '3 trụ cột quốc gia được xác định rõ tại Quyết định 749/QĐ-TTg là: Chính phủ số, Kinh tế số và Xã hội số.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_03', 'moc_cds_05_01', 'Một trong những mục tiêu có ý nghĩa xã hội sâu sắc nhất của công cuộc chuyển đổi số hướng đến người dân là:', 'TRAC_NGHIEM_4', 'Thay thế hoàn toàn vai trò giảng dạy của đội ngũ giáo viên đứng lớp bằng hệ thống AI trợ giảng', 'Giảm tỷ lệ gia tăng dân số cơ học tại các đô thị lớn thông qua việc giám sát căn cước định danh', 'Xóa bỏ hoàn toàn mọi hình thức tiếp nhận và xử lý thủ tục hành chính trực tiếp tại bộ phận một cửa', 'Thu hẹp khoảng cách số giữa khu vực thành thị với vùng nông thôn và nhóm người yếu thế', 3, 'Thu hẹp khoảng cách số (Digital Divide) giúp người dân ở mọi vùng miền tiếp cận bình đẳng dịch vụ công, tri thức và y tế.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_04', 'moc_cds_05_01', 'Dịch vụ công trực tuyến cấp độ cao (dịch vụ công trực tuyến toàn trình) mang lại lợi ích thiết thực nào trực tiếp cho người dân và doanh nghiệp?', 'TRAC_NGHIEM_4', 'Cho phép người dân thực hiện các thủ tục xác thực danh tính mà hoàn toàn không cần kết nối mạng Internet', 'Tự động miễn giảm thuế thu nhập cá nhân và thuế thu nhập doanh nghiệp cho mọi đối tượng tham gia nộp hồ sơ', 'Tự động cấp quyền thay đổi quốc tịch và chuyển nhượng quyền sử dụng đất mà không cần qua thẩm tra pháp lý', 'Cho phép nộp hồ sơ, thanh toán phí lệ phí và nhận kết quả giải quyết thủ tục mọi lúc, mọi nơi', 3, 'Dịch vụ công trực tuyến toàn trình xử lý khép kín trên môi trường điện tử từ nộp hồ sơ, thanh toán đến trả kết quả.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_05', 'moc_cds_05_01', 'Ứng dụng Sổ sức khỏe điện tử (tích hợp trên ứng dụng VNeID và VssID) đem lại giá trị thiết thực nào cho người bệnh khi đi khám chữa bệnh?', 'TRAC_NGHIEM_4', 'Cắt giảm hoàn toàn tiền lương và các chế độ phụ cấp chuyên môn của đội ngũ y bác sĩ tại bệnh viện', 'Thay thế triệt để các cơ sở y tế và bệnh viện điều trị nội trú bằng các phần mềm tư vấn trực tuyến', 'Cho phép người bệnh tự kê đơn mua các loại thuốc đặc trị chuyên sâu mà không cần sự thăm khám của bác sĩ', 'Lưu trữ đồng bộ, liên thông toàn bộ lịch sử khám chữa bệnh, đơn thuốc và lịch tiêm chủng trọn đời', 3, 'Sổ sức khỏe điện tử lưu trữ lịch sử y khoa, kết quả xét nghiệm và tiêm chủng liên thông, giúp bác sĩ chẩn đoán chính xác hơn.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_06', 'moc_cds_05_01', 'Các nền tảng học tập trực tuyến (MOOC, E-learning) kết hợp với hệ thống thư viện số trường đại học đóng vai trò gì đối với sinh viên và cộng đồng?', 'TRAC_NGHIEM_4', 'Nâng cao kỹ năng số, mở rộng tri thức chuyên môn và bồi dưỡng năng lực học tập suốt đời cho người dân', 'Hạn chế khối lượng tri thức tiếp cận để giảm thiểu hiện tượng quá tải thông tin cho người học', 'Thay thế hoàn toàn bằng cấp và loại bỏ toàn bộ các trường đại học truyền thống trong hệ thống quốc dân', 'Ràng buộc sinh viên chỉ được phép sử dụng các bài giảng miễn phí mà không được tham khảo tài liệu học liệu khác', 0, 'Học tập trực tuyến và tài nguyên số giúp mở rộng tri thức linh hoạt, bồi đắp văn hóa học tập suốt đời.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_07', 'moc_cds_05_01', 'Phương tiện nào dưới đây là ví dụ điển hình nhất về các giải pháp thanh toán không dùng tiền mặt đang rất phổ biến tại Việt Nam?', 'TRAC_NGHIEM_4', 'Ví điện tử MoMo, ZaloPay, dịch vụ VNPay-QR và ứng dụng ngân hàng số tích hợp VietQR', 'Mở sổ tiết kiệm kỳ hạn truyền thống bằng cách nộp tiền mặt trực tiếp tại quầy giao dịch ngân hàng', 'Sử dụng séc bảo chi ngân hàng bằng giấy để ký phát trực tiếp khi mua sắm hàng hóa tại siêu thị', 'Hợp đồng vay vốn tín dụng tiêu dùng dạng văn bản viết tay giữa các cá nhân ngoài xã hội', 0, 'MoMo, ZaloPay, VNPay, VietQR là các giải pháp công nghệ thanh toán số không dùng tiền mặt điển hình.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_08', 'moc_cds_05_01', 'Để trở thành một công dân số gương mẫu và có trách nhiệm trên không gian mạng, người học cần trang bị những phẩm chất then chốt nào sau đây?', 'TRAC_NGHIEM_4', 'Kỹ năng số thành thạo, năng lực học tập suốt đời, cùng đạo đức và văn hóa ứng xử chuẩn mực trên môi trường số', 'Chỉ cần tích cực sử dụng mạng xã hội, thường xuyên đăng tải các bài viết thu hút tương tác của đám đông', 'Có điều kiện kinh tế giàu có để luôn mua sắm sở hữu những thiết bị công nghệ và điện thoại đắt tiền nhất', 'Chỉ tập trung vào công việc chuyên môn truyền thống mà không cần quan tâm học hỏi thêm công nghệ mới', 0, 'Công dân số đòi hỏi cả kỹ năng số, văn hóa đạo đức ứng xử số và năng lực học tập thích nghi liên tục.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_09', 'moc_cds_05_01', 'Tại Việt Nam, ứng dụng Định danh điện tử quốc gia (VNeID) khi được nâng cấp lên mức độ 2 cho phép công dân thay thế những loại giấy tờ tùy thân vật lý nào?', 'TRAC_NGHIEM_4', 'Thay thế CCCD gắn chip, tích hợp giấy phép lái xe, thẻ bảo hiểm y tế và thông tin đăng ký xe cơ giới', 'Thay thế toàn bộ hộ chiếu xuất nhập cảnh quốc tế khi công dân làm thủ tục định cư tại bất kỳ quốc gia nào', 'Thay thế hợp đồng lao động doanh nghiệp và tự động cấp miễn visa thị thực cho mọi chuyến bay quốc tế', 'Thay thế bằng tốt nghiệp đại học và chứng chỉ hành nghề luật sư, bác sĩ khi tham gia ứng tuyển việc làm', 0, 'Tài khoản VNeID mức 2 tích hợp CCCD gắn chip, bằng lái xe, thẻ BHYT, giấy đăng ký xe theo quy định của Đề án 06.', 2, 'VAN_DUNG', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_01', 'moc_cds_05_02', 'Mục tiêu trọng tâm và xuyên suốt của việc chuyển đổi số trong khu vực công (xây dựng Chính phủ số, Chính quyền số) là gì?', 'TRAC_NGHIEM_4', 'Nâng cao hiệu quả quản trị công vụ và cung cấp dịch vụ công chất lượng cao, minh bạch cho nhân dân', 'Chỉ tập trung mua sắm các thiết bị phần cứng đời mới nhất để nâng cấp phòng làm việc cơ quan', 'Cắt giảm toàn bộ hệ thống thuế quan và bãi bỏ các chế tài xử phạt vi phạm hành chính', 'Cắt giảm toàn bộ biên chế đội ngũ cán bộ công chức nhà nước và đóng cửa các trụ sở hành chính', 0, 'Chính phủ số hướng đến phục vụ người dân tốt hơn, nâng cao hiệu lực quản lý nhà nước và tính minh bạch công khai.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_02', 'moc_cds_05_02', 'Nền tảng tích hợp, chia sẻ dữ liệu quốc gia (NDXP - National Data Exchange Platform) do Bộ Thông tin và Truyền thông chủ trì vận hành có vai trò gì?', 'TRAC_NGHIEM_4', 'Kết nối, liên thông và điều phối chia sẻ dữ liệu số giữa các bộ, ngành, địa phương và cơ sở dữ liệu quốc gia', 'Tổ chức các hội nghị truyền hình trực tuyến phục vụ các cuộc họp thường kỳ giữa các cơ quan bộ ngành', 'Thanh toán trực tiếp hóa đơn tiêu thụ điện lưới, nước sạch sinh hoạt cho các hộ gia đình trên cả nước', 'Quảng bá các sản phẩm hàng hóa xuất khẩu của doanh nghiệp vừa và nhỏ lên các sàn thương mại điện tử', 0, 'NDXP là nền tảng trục liên thông dữ liệu quốc gia giúp chia sẻ dữ liệu giữa các bộ ngành địa phương thông suốt.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_03', 'moc_cds_05_02', 'Hệ thống thông tin phục vụ họp và xử lý công việc của Chính phủ (eCabinet) mang lại giá trị cốt lõi nào trong cải cách hành chính?', 'TRAC_NGHIEM_4', 'Gia tăng gấp đôi số lượng văn bản hồ sơ in ấn bằng giấy để lưu trữ đối chiếu song song trong kho tài liệu', 'Lưu trữ, gửi nhận, lấy ý kiến và biểu quyết tài liệu điện tử an toàn, thay thế phòng họp giấy truyền thống', 'Thay thế hoàn toàn chức năng ra quyết định của các thành viên Chính phủ bằng thuật toán tự động', 'Là phần mềm kế toán nội bộ độc quyền chỉ được phép cấp phép triển khai trong khối doanh nghiệp tư nhân', 1, 'eCabinet giúp các phiên họp Chính phủ trở thành họp không giấy tờ, biểu quyết văn bản điện tử tức thì và bảo mật cao.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_04', 'moc_cds_05_02', 'Thách thức lớn nhất mang tính nội tại làm chậm tiến độ chuyển đổi số trong khu vực hành chính công tại nhiều địa phương hiện nay là gì?', 'TRAC_NGHIEM_4', 'Quy mô dân số Việt Nam quá đông dẫn đến việc các hệ thống máy tính máy chủ luôn trong tình trạng sập nguồn', 'Thiếu hụt trầm trọng nhân lực công nghệ thông tin chuyên trách, dữ liệu còn phân tán và thói quen ngại đổi mới', 'Hệ thống mạng lưới ngân hàng thương mại tại Việt Nam chưa đủ năng lực cung cấp các tiện ích thanh toán', 'Trình độ ứng dụng công nghệ của học sinh và sinh viên trong hệ thống giáo dục quốc gia quá vượt trội', 1, 'Thách thức chính trong CĐS khu vực công là nhân lực CNTT chất lượng cao khan hiếm và tư duy chia sẻ dữ liệu giữa các đơn vị.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_05', 'moc_cds_05_02', 'Việc đẩy mạnh tiến trình chuyển đổi số trong hoạt động sản xuất kinh doanh mang lại lợi ích chiến lược nào cho doanh nghiệp?', 'TRAC_NGHIEM_4', 'Chỉ nhằm mục đích chạy các chiến dịch quảng cáo trực tuyến trên mạng xã hội để tăng lượt xem', 'Tăng năng suất lao động, cắt giảm chi phí vận hành, tối ưu trải nghiệm và nâng cao năng lực cạnh tranh', 'Chủ động cắt giảm số lượng khách hàng tiềm năng để tập trung chăm sóc nhóm khách hàng thân thiết', 'Cắt giảm toàn bộ đội ngũ nhân sự hiện có để thay thế bằng các robot tự hành nhập khẩu đắt tiền', 1, 'CĐS giúp doanh nghiệp tối ưu chi phí, nâng cao năng suất và tạo lợi thế cạnh tranh mới trên thị trường.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_06', 'moc_cds_05_02', 'Trong thang tiến hóa chuyển đổi số, khái niệm "Digitalization" (Số hóa quy trình) được hiểu chính xác nhất là gì?', 'TRAC_NGHIEM_4', 'Chỉ đơn thuần quét (scan) văn bản giấy và lưu trữ thành các tệp tin hình ảnh hoặc PDF tĩnh trên máy tính', 'Tích hợp công nghệ số vào các quy trình nghiệp vụ nội bộ nhằm tự động hóa và nâng cao hiệu suất làm việc', 'Tái cấu trúc triệt để toàn bộ mô hình kinh doanh và thay thế ban lãnh đạo doanh nghiệp bằng trí tuệ nhân tạo', 'Dừng áp dụng mọi công nghệ thông tin để chuyển sang cơ chế quản lý truyền thống nhằm tiết kiệm chi phí', 1, 'Digitalization là ứng dụng công nghệ để cải tiến và tự động hóa quy trình nghiệp vụ (khác Digitization là chỉ số hóa dữ liệu).', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_07', 'moc_cds_05_02', 'Việc triển khai hệ thống hoạch định nguồn lực doanh nghiệp (ERP - Enterprise Resource Planning) mang lại hiệu quả vượt trội nào?', 'TRAC_NGHIEM_4', 'Làm gia tăng đáng kể các thủ tục giấy tờ ký duyệt phê duyệt phê chuẩn giữa các phòng ban chức năng', 'Hợp nhất và quản lý đồng bộ dữ liệu tài chính, kế toán, nhân sự, chuỗi cung ứng và sản xuất trên một hệ thống', 'Thay thế toàn bộ vai trò hoạch định chiến lược và điều hành kinh doanh của Tổng Giám đốc (CEO)', 'Làm gia tăng chi phí vận hành thường niên và khiến dòng tiền luân chuyển nội bộ bị đình trệ kéo dài', 1, 'Hệ thống ERP đồng bộ toàn bộ nguồn lực tài chính, kho vận, nhân sự trên cùng một cơ sở dữ liệu duy nhất.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_08', 'moc_cds_05_02', 'Hiện tượng "cát cứ dữ liệu" (Data Silos) trong các cơ quan nhà nước tại Việt Nam gây ra hệ lụy tiêu cực trực tiếp nào cho công dân?', 'TRAC_NGHIEM_4', 'Khiến đường truyền Internet cáp quang quốc gia thường xuyên bị gián đoạn lưu lượng truy cập', 'Buộc người dân phải đi lại nhiều nơi xin xác nhận và nộp đi nộp lại nhiều bản sao giấy tờ vốn đã có trong cơ sở dữ liệu', 'Khiến công dân bắt buộc phải chi trả thêm các khoản phí sử dụng điện thoại di động hàng tháng', 'Làm giảm dung lượng bộ nhớ khả dụng trên điện thoại thông minh cá nhân của mỗi người dùng', 1, 'Cát cứ dữ liệu khiến các cơ quan không liên thông thông tin, bắt người dân phải nộp lại nhiều giấy tờ mà hệ thống nhà nước đã có.', 2, 'VAN_DUNG', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_01', 'moc_cds_05_03', 'Theo định hướng của Bộ Giáo dục và Đào tạo, chuyển đổi số trong giáo dục đại học và phổ thông hướng tới mục tiêu nào sau đây?', 'TRAC_NGHIEM_4', 'Loại bỏ hoàn toàn vai trò của người thầy và đóng cửa các phòng thí nghiệm, giảng đường thực tế', 'Bắt buộc toàn bộ học sinh, sinh viên chỉ được phép sử dụng sách giáo khoa in giấy truyền thống', 'Dạy học trực tuyến tối thiểu 20% chương trình, phát triển học liệu số và giáo dục cá thể hóa theo người học', 'Hạ thấp chuẩn đầu ra và tiêu chí đánh giá học lực của sinh viên để nâng cao tỷ lệ tốt nghiệp', 2, 'CĐS giáo dục hướng tới học tập kết hợp (Blended Learning) tối thiểu 20% trực tuyến, số hóa bài giảng và cá thể hóa giáo dục.', 2, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_02', 'moc_cds_05_03', 'Chuyển đổi số trong lĩnh vực tài chính - ngân hàng tại Việt Nam tập trung đẩy mạnh những đột phá nào?', 'TRAC_NGHIEM_4', 'Bắt buộc người dân chỉ được sử dụng tiền mặt trong mọi giao dịch mua bán bất động sản và xe cộ', 'Ngừng cung cấp các dịch vụ thanh toán số cho đồng bào tại các huyện đảo và vùng nông thôn', 'Xây dựng hệ sinh thái ngân hàng số, định danh điện tử eKYC, thanh toán trực tuyến và tích hợp Fintech', 'Tạm ngừng toàn bộ các giao dịch chuyển tiền điện tử liên ngân hàng vào các ngày nghỉ cuối tuần', 2, 'CĐS ngành ngân hàng phát triển ngân hàng số thế hệ mới, mở tài khoản eKYC và mở cổng thanh toán mở Open Banking kết nối Fintech.', 1, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_03', 'moc_cds_05_03', 'Trong lĩnh vực nông nghiệp thông minh, mạng lưới thiết bị cảm biến IoT đóng vai trò cốt lõi nào giúp tối ưu năng suất cây trồng?', 'TRAC_NGHIEM_4', 'Loại bỏ hoàn toàn sự hiện diện và vai trò quản lý điều hành của người nông dân trên đồng ruộng', 'Khiến nông sản sau thu hoạch không cần phải đưa ra lưu thông buôn bán tại các hệ thống chợ tiêu thụ', 'Thu thập liên tục và giám sát theo thời gian thực độ ẩm đất, độ ẩm không khí, ánh sáng và sâu bệnh hại', 'Bắt buộc người nông dân phải quay trở lại sử dụng hoàn toàn phương pháp canh tác thủ công thời cổ xưa', 2, 'IoT trong nông nghiệp giúp theo dõi thời gian thực các chỉ số môi trường, tự động tưới tiêu và cảnh báo sâu bệnh chính xác.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_04', 'moc_cds_05_03', 'Mô hình chuyển đổi số thành công vang dội của tập đoàn thương mại điện tử Amazon tập trung vào triết lý cốt lõi nào?', 'TRAC_NGHIEM_4', 'Duy trì mô hình kinh doanh truyền thống chỉ độc quyền kinh doanh mặt hàng sách in ấn bản giấy', 'Chỉ tập trung lắp đặt robot trong kho bãi mà không thu thập hay phân tích bất kỳ dữ liệu hành vi nào', 'Lấy khách hàng làm trung tâm tuyệt đối (Customer Obsession) kết hợp tự động hóa tối đa chuỗi cung ứng', 'Loại bỏ hoàn toàn các thuật toán trí tuệ nhân tạo ra khỏi hệ thống gợi ý sản phẩm cho người tiêu dùng', 2, 'Amazon thành công nhờ triết lý Customer Obsession, tự động hóa chuỗi cung ứng và logistics thông minh.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_05', 'moc_cds_05_03', 'Bài học đắt giá và điểm chung quan trọng nhất rút ra từ các doanh nghiệp chuyển đổi số thành công trên toàn cầu là gì?', 'TRAC_NGHIEM_4', 'Chuyển đổi số chỉ thuần túy là việc đầu tư ngân sách thật lớn để mua sắm công nghệ đắt đỏ nhất', 'Doanh nghiệp chỉ cần sa thải nhân viên cũ và tuyển dụng lập trình viên là chuyển đổi số thành công', 'Chuyển đổi số bản chất là chuyển đổi về con người, văn hóa và quy trình tổ chức; công nghệ chỉ là công cụ hỗ trợ', 'Chỉ cần ký hợp đồng thuê phần mềm đóng gói sẵn từ nước ngoài mà không cần phải thay đổi quy trình nội bộ', 2, 'CĐS là chuyển đổi về Con người, Văn hóa và Quy trình. Công nghệ chỉ là công cụ hỗ trợ (Enabler).', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_06', 'moc_cds_05_03', 'Khi các bệnh viện lớn tại Việt Nam (như BV Bạch Mai, ĐH Y Dược TP.HCM) công bố đạt chuẩn "Bệnh viện không giấy tờ" nhờ Bệnh án điện tử (EMR), lợi ích vượt trội nhất là gì?', 'TRAC_NGHIEM_4', 'Giảm bớt thời gian thăm khám trực tiếp để bác sĩ có thời gian viết các bài đăng trên mạng xã hội', 'Cho phép người nhà bệnh nhân tự ý truy cập vào phòng mổ để giám sát qua camera mà không cần sự đồng ý của bác sĩ', 'Loại bỏ hoàn toàn hồ sơ giấy tờ, phim chụp cồng kềnh; liên thông lịch sử bệnh án giúp chẩn đoán nhanh và an toàn thuốc', 'Tự động tăng giá dịch vụ viện phí thêm 50% đối với những bệnh nhân không mang theo điện thoại thông minh', 2, 'EMR giúp bệnh viện bỏ hoàn toàn sổ giấy và phim chụp nhựa, liên thông xét nghiệm, giảm sai sót thuốc và tiết kiệm hàng tỷ đồng.', 3, 'VAN_DUNG', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_07', 'moc_cds_05_03', 'Chỉ số đánh giá chuyển đổi số cấp tỉnh (DTI - Digital Transformation Index) do Bộ Thông tin và Truyền thông công bố hàng năm gồm 3 trụ cột với cơ cấu tỷ trọng điểm nào sau đây?', 'TRAC_NGHIEM_4', 'Chính phủ số chiếm 80%, Kinh tế số chiếm 10%, Xã hội số chiếm 10% tổng điểm số đánh giá hàng năm', 'Chính phủ số chiếm 20%, Kinh tế số chiếm 60%, Xã hội số chiếm 20% tổng điểm số đánh giá hàng năm', 'Cả ba trụ cột được chia đều tỷ lệ điểm số bằng nhau là 33.3% mà không có sự phân hóa độ ưu tiên', 'Chính quyền số (400 điểm - 40%), Kinh tế số (350 điểm - 35%), Xã hội số (250 điểm - 25%) trên thang 1000 điểm', 3, 'Khung chỉ số DTI cấp tỉnh gồm 1000 điểm: Chính quyền số 400 điểm (40%), Kinh tế số 350 điểm (35%), Xã hội số 250 điểm (25%).', 3, 'HIEU', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_01_10', 'moc_cds_05_01', 'Hãy chạm vào các ô tương ứng ở hai cột để ghép đúng 4 trụ cột năng lực công dân số (theo khung DQ Institute) với ý nghĩa tương ứng:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, '4 trụ cột cơ bản của chỉ số thông minh kỹ thuật số DQ: Danh tính số, An toàn số, Văn hóa cảm xúc số và Kỹ năng số.', 2, 'HIEU', 3, '{"left_items":[{"id":"l1","text":"Danh tính số (Digital Identity)"},{"id":"l2","text":"An toàn số (Digital Safety)"},{"id":"l3","text":"Văn hóa số (Digital Emotional)"},{"id":"l4","text":"Kỹ năng số (Digital Literacy)"}],"right_items":[{"id":"r1","text":"Quản lý thông tin cá nhân và dấu chân kỹ thuật số an toàn"},{"id":"r2","text":"Nhận biết mã độc, lừa đảo trực tuyến và bảo vệ tài khoản"},{"id":"r3","text":"Giao tiếp văn minh, tôn trọng bản quyền và thấu cảm trên mạng"},{"id":"r4","text":"Tìm kiếm, đánh giá, sáng tạo nội dung và vận hành công cụ số"}],"matches":{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_02_09', 'moc_cds_05_02', 'Chạm vào các thẻ từ để sắp xếp đúng tiến trình 3 nấc thang chuyển đổi số của một doanh nghiệp từ thấp đến cao:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, '3 nấc thang tiến hóa số chuẩn mực: Digitization (Số hóa dữ liệu) -> Digitalization (Số hóa quy trình) -> Digital Transformation (Chuyển đổi số toàn diện).', 2, 'HIEU', 3, '{"prompt":"Sắp xếp 3 nấc thang tiến hóa số trong doanh nghiệp:","correct_order":["Digitization: Số hóa thông tin từ văn bản giấy sang định dạng số (PDF, Scan, Excel)","Digitalization: Số hóa quy trình bằng cách tích hợp phần mềm chuyên dụng (CRM, ERP)","Digital Transformation: Chuyển đổi số toàn diện mô hình kinh doanh và trải nghiệm khách hàng"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_08', 'moc_cds_05_03', 'Hãy chạm vào các ô tương ứng ở hai cột để nối đúng sáng kiến chuyển đổi số đột phá với ngành tương ứng tại Việt Nam:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Các sáng kiến CĐS tiêu biểu của 4 ngành: Y tế (EMR/Telehealth), Nông nghiệp (IoT/Mã vùng trồng), Giáo dục (MOOC/OER), Ngân hàng (eKYC/Open Banking).', 2, 'VAN_DUNG', 4, '{"left_items":[{"id":"l1","text":"Ngành Y tế"},{"id":"l2","text":"Ngành Nông nghiệp"},{"id":"l3","text":"Ngành Giáo dục"},{"id":"l4","text":"Ngành Ngân hàng"}],"right_items":[{"id":"r1","text":"Triển khai Bệnh án điện tử EMR và Telehealth khám bệnh từ xa"},{"id":"r2","text":"Cảm biến IoT VNPT SmartAgri và cấp mã số vùng trồng xuất khẩu"},{"id":"r3","text":"Nền tảng học tập số, MOOC và kho học liệu mở OER dùng chung"},{"id":"r4","text":"Xác thực sinh trắc học eKYC và mở cổng thanh toán Open Banking"}],"matches":{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_09', 'moc_cds_05_03', 'Chạm vào các thẻ để sắp xếp đúng trình tự trải nghiệm mua sắm không chạm ứng dụng công nghệ Just Walk Out tại chuỗi siêu thị Amazon Go:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình Amazon Go: Quét mã vào cửa -> Camera nhận diện món đồ -> Cập nhật giỏ hàng ảo -> Bước ra ngoài tự trừ tiền.', 3, 'VAN_DUNG', 4, '{"prompt":"Sắp xếp quy trình mua sắm tự động Just Walk Out của Amazon Go:","correct_order":["Khách hàng quét mã QR trên ứng dụng Amazon tại cửa xoay để vào cửa hàng","Camera thị giác máy tính và cảm biến trọng lượng nhận diện món đồ khách lấy khỏi kệ","Hệ thống tự động thêm mặt hàng đó vào giỏ hàng ảo trên tài khoản của khách","Khách bước ra khỏi cửa hàng, thẻ thanh toán tự động bị trừ tiền và nhận hóa đơn điện tử"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_05_03_10', 'moc_cds_05_03', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Cốt lõi của CĐS là thay đổi Con người, Văn hóa và Quy trình.', 1, 'HIEU', 4, '{"sentence_template":"Chuyển đổi số trước hết là sự chuyển đổi về tư duy, văn hóa và {blank}, trong đó công nghệ chỉ đóng vai trò là công cụ hỗ trợ cho sự thay đổi đó.","options":["quy trình","thiết bị máy chủ","tiền vốn","quảng cáo"],"blank_answer":"quy trình"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_01', 'moc_cds_06_01', 'Trong các hoạt động vận hành của tổ chức hiện đại, vai trò chính của trí tuệ nhân tạo (AI) trong tự động hóa quy trình là gì?', 'TRAC_NGHIEM_4', 'Làm gia tăng đáng kể các chi phí bảo trì hệ thống và tiêu tốn nguồn năng lượng điện toán hàng tháng', 'Làm suy giảm nghiêm trọng khả năng phân tích dữ liệu và giảm tốc độ xử lý các giao dịch kế toán nội bộ', 'Hạn chế và ngăn chặn mọi sự tương tác phản hồi thông tin giữa đội ngũ nhân viên với khách hàng thân thiết', 'Tự động hóa các tác vụ lặp đi lặp lại để giải phóng thời gian cho nhân sự tập trung vào công việc giá trị cao', 3, 'AI giúp tự động hóa các tác vụ lặp lại (RPA + GenAI) như nhập liệu, trả lời tin nhắn mẫu, trích xuất dữ liệu.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_02', 'moc_cds_06_01', 'Các bộ giải pháp công nghệ số doanh nghiệp như ERP (Hoạch định nguồn lực) và CRM (Quản lý quan hệ khách hàng) giúp doanh nghiệp thực hiện điều gì?', 'TRAC_NGHIEM_4', 'Tuyển dụng ồ ạt thêm thật nhiều nhân sự hành chính trung gian để quản lý hồ sơ sổ sách lưu trữ nội bộ', 'Ngừng việc thu thập và sử dụng dữ liệu khách hàng nhằm tránh nguy cơ xảy ra sự cố rò rỉ thông tin cá nhân', 'Loại bỏ hoàn toàn nhu cầu xuất bản các báo cáo tài chính định kỳ theo quy định của cơ quan thuế nhà nước', 'Tích hợp liền mạch dữ liệu giữa các phòng ban chức năng và tối ưu hóa toàn diện quy trình vận hành', 3, 'ERP tích hợp nguồn lực nội bộ và CRM tối ưu quan hệ khách hàng, liên thông dữ liệu toàn doanh nghiệp.', 2, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_03', 'moc_cds_06_01', 'Các công cụ trí tuệ kinh doanh (Business Intelligence) hàng đầu hiện nay như Microsoft Power BI hay Tableau được ứng dụng chủ yếu vào mục đích nào?', 'TRAC_NGHIEM_4', 'Chỉnh sửa và lồng ghép các hiệu ứng kỹ xảo điện ảnh phức tạp cho các video quảng cáo truyền thông số', 'Lập trình và xây dựng các trò chơi tương tác thực tế ảo trên thiết bị di động thông minh cho giới trẻ', 'Lưu trữ dữ liệu tĩnh ở chế độ ngoại tuyến hoàn toàn trên các ổ cứng thể rắn di động cá nhân truyền thống', 'Trực quan hóa số liệu qua các bảng điều khiển thông minh và phân tích sâu các chỉ số kinh doanh then chốt', 3, 'Power BI và Tableau là các công cụ BI hàng đầu giúp trực quan hóa và phân tích dữ liệu đa chiều.', 2, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_04', 'moc_cds_06_01', 'Trong kỷ nguyên bùng nổ của trí tuệ nhân tạo, kỹ năng "Prompting" (Kỹ nghệ tạo câu lệnh) được hiểu chính xác nhất là năng lực nào?', 'TRAC_NGHIEM_4', 'Soạn thảo các đoạn mã độc hại để xâm nhập trái phép vào máy chủ của các tổ chức tài chính quốc tế', 'Thiết lập tường lửa bảo mật để chủ động ngăn chặn toàn bộ các kết nối truy cập Internet của nhân viên nội bộ', 'Tạo ra chuỗi các ký tự mật khẩu ngẫu nhiên có độ phức tạp cao nhằm bảo vệ hòm thư điện tử cá nhân', 'Thiết kế ngữ cảnh, vai trò và mệnh lệnh chuẩn xác để giao tiếp hiệu quả và khai thác tối đa năng lực AI tạo sinh', 3, 'Prompting là kỹ năng giao tiếp, ra lệnh chuẩn xác với AI tạo sinh để AI đưa ra câu trả lời chất lượng nhất.', 1, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_05', 'moc_cds_06_01', 'Các nền tảng điện toán đám mây (Cloud Computing như Google Cloud, AWS, VNPT Cloud) được các tổ chức sử dụng nhiều nhất vào mục đích nào?', 'TRAC_NGHIEM_4', 'Tải các trò chơi giải trí ngoại tuyến về cài đặt trên máy tính cá nhân để chơi khi không có mạng cáp quang', 'Tự động tăng gấp đôi tốc độ xử lý vật lý của bộ vi xử lý CPU máy tính để bàn mà không cần lắp thêm RAM', 'Tự động kích hoạt cơ chế xóa vĩnh viễn toàn bộ các tập tin dữ liệu đã lưu trữ sau mỗi 24 giờ làm việc', 'Lưu trữ dữ liệu tập trung, hỗ trợ làm việc cộng tác trực tuyến đa điểm và vận hành từ xa linh hoạt', 3, 'Cloud dùng chủ yếu để lưu trữ, sao lưu, chia sẻ và cộng tác làm việc từ xa mọi lúc mọi nơi.', 1, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_06', 'moc_cds_06_01', 'Khả năng sử dụng và tương tác thành thạo trên các hệ thống như ERP và CRM thuộc nhóm năng lực số nào của người lao động hiện đại?', 'TRAC_NGHIEM_4', 'Kỹ năng vận hành công cụ số chuyên nghiệp và làm chủ hệ thống quy trình nghiệp vụ số của tổ chức', 'Kỹ năng tư duy nghệ thuật, cảm thụ thị giác và sáng tạo các tác phẩm hội họa kỹ thuật số trên máy tính', 'Kỹ năng lập trình phát triển các thuật toán học sâu nâng cao và thiết kế kiến trúc vi mạch bán dẫn mới', 'Kỹ năng sư phạm và nghệ thuật diễn thuyết truyền cảm hứng trong các buổi giảng dạy trước đám đông', 0, 'Sử dụng ERP/CRM thuộc nhóm kỹ năng vận hành công cụ số và làm chủ hệ thống thông tin tổ chức.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_07', 'moc_cds_06_01', 'Khái niệm "Critical Evaluation" (Đánh giá phản biện) trong khung năng lực tư duy số có ý nghĩa bản chất là gì?', 'TRAC_NGHIEM_4', 'Chủ động phân tích, đối chiếu và kiểm tra tính xác thực, độ tin cậy cùng mục đích ẩn sau của thông tin', 'Tuyệt đối tin tưởng và chấp nhận toàn bộ các luồng thông tin, bài viết được tìm thấy trên các công cụ tìm kiếm', 'Tham gia vào các hội nhóm trực tuyến để tìm kiếm cơ hội trao đổi, mua bán thông tin cơ sở dữ liệu cá nhân', 'Đọc lướt qua thật nhiều trang web với tốc độ tối đa mà không cần dừng lại suy ngẫm về nội dung cốt lõi', 0, 'Critical Evaluation là năng lực phân tích, đánh giá phản biện tính chính xác và tin cậy của thông tin số.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_08', 'moc_cds_06_01', 'Trước khi bắt đầu thực hiện thao tác tra cứu trên các công cụ tìm kiếm trực tuyến, bước đầu tiên và quan trọng nhất người học cần xác định rõ là gì?', 'TRAC_NGHIEM_4', 'Xác định rõ ràng mục tiêu thông tin, phạm vi kiến thức và các từ khóa cốt lõi cần phải tìm kiếm', 'Tra cứu họ tên và chức danh khoa học đầy đủ của người đã lập trình ra thuật toán công cụ tìm kiếm', 'Kiểm tra màu sắc giao diện biểu tượng đồ họa của trang chủ công cụ tìm kiếm có hiển thị chuẩn xác không', 'Đo đạc chính xác tốc độ truyền tải gói tin băng thông mạng quốc tế tại thời điểm gửi truy vấn', 0, 'Trước khi tra cứu, việc xác định mục tiêu thông tin và từ khóa chuẩn xác quyết định 80% độ chính xác của kết quả.', 1, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_09', 'moc_cds_06_01', 'Khi sinh viên cần tìm kiếm các văn bản quy phạm pháp luật và nghị định chính thức của Chính phủ Việt Nam trên Google, cú pháp tra cứu nào đem lại kết quả chuẩn xác và tin cậy nhất?', 'TRAC_NGHIEM_4', 'nhập từ khóa: "chuyển đổi số" site:chinhphu.vn hoặc site:gov.vn để lọc trong cổng thông tin nhà nước', 'nhập từ khóa: nghị định chuyển đổi số và tìm kiếm trong mục hình ảnh trên mạng xã hội Facebook', 'nhập từ khóa: "chuyển đổi số" filetype:mp3 trên các diễn đàn chia sẻ nhạc trực tuyến miễn phí', 'nhập từ khóa: chính sách nhà nước kèm theo tên của một người nổi tiếng có nhiều người theo dõi trên TikTok', 0, 'Cú pháp toán tử site:gov.vn hoặc site:chinhphu.vn giúp thu hẹp phạm vi tìm kiếm chỉ trên tên miền chính thống của Chính phủ.', 2, 'VAN_DUNG', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_01', 'moc_cds_06_02', 'Khi thực hiện tìm kiếm trên Google, việc đưa cú pháp "site:edu.vn" vào chuỗi truy vấn có tác dụng kỹ thuật gì?', 'TRAC_NGHIEM_4', 'Giới hạn kết quả trả về chỉ nằm trong phạm vi các trang web của các trường học, viện nghiên cứu tại Việt Nam', 'Tự động kích hoạt tính năng tìm kiếm các đoạn hội thoại trao đổi trên tất cả các nền tảng mạng xã hội', 'Tự động tải về máy tính toàn bộ các phần mềm và công cụ giải trí có gắn tên miền của các trường học', 'Tự động kiểm tra lỗi chính tả tiếng Việt trong văn bản đang soạn thảo trên màn hình máy tính', 0, 'Toán tử site:edu.vn lọc kết quả chỉ xuất hiện từ các website giáo dục đào tạo có tên miền .edu.vn.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_02', 'moc_cds_06_02', 'Trong bộ tiêu chí chuẩn mực CRAAP dùng để đánh giá độ tin cậy của thông tin số, chữ "Currency" mang hàm nghĩa là gì?', 'TRAC_NGHIEM_4', 'Tính hiện tại, tính cập nhật về mặt thời gian và độ mới của thông tin được công bố', 'Mức độ chuẩn xác tuyệt đối của từng câu từ ngữ pháp trong nội dung văn bản', 'Động cơ và mục đích thương mại hoặc giải trí vụ lợi của người biên soạn bài viết', 'Học vị, chức danh và hồ sơ năng lực chuyên môn của tác giả đứng tên xuất bản', 0, 'Currency trong CRAAP nói về tính mới, tính thời sự cập nhật của dữ liệu.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_03', 'moc_cds_06_02', 'Các dịch vụ lưu trữ đám mây quen thuộc như Google Drive hay Microsoft OneDrive phục vụ mục đích thiết thực nào cho người dùng?', 'TRAC_NGHIEM_4', 'Tạo ra các đoạn mã phần mềm độc hại để thử nghiệm khả năng phòng thủ của hệ điều hành máy tính', 'Lưu trữ, đồng bộ hóa dữ liệu an toàn, sắp xếp tài liệu khoa học và chia sẻ cộng tác làm việc nhóm', 'Chủ động phát tán các mã độc tống tiền (Ransomware) vào mạng máy tính nội bộ của trường đại học', 'Thực hiện các cuộc tấn công mạng nhằm bẻ khóa và đánh cắp mật khẩu tài khoản ngân hàng của người khác', 1, 'Google Drive và OneDrive là dịch vụ lưu trữ đám mây giúp đồng bộ, quản lý tệp và cộng tác nhóm.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_04', 'moc_cds_06_02', 'Trong lĩnh vực phân tích dữ liệu và khoa học dữ liệu (Data Science), thuật ngữ "DataFrame" được định nghĩa là gì?', 'TRAC_NGHIEM_4', 'Một tệp video có độ phân giải siêu nét được nén dưới định dạng kỹ thuật số để phục vụ hội nghị trực tuyến', 'Một cấu trúc dữ liệu dạng bảng 2 chiều có cấu trúc, bao gồm nhiều dòng (bản ghi) và nhiều cột (thuộc tính)', 'Một tập tin văn bản thuần túy không chứa bất kỳ định dạng tiêu đề, bảng biểu hay hàng cột nào', 'Một ứng dụng phần mềm đồ họa chuyên dụng dùng để chỉnh sửa ảnh chụp chân dung kỹ thuật số', 1, 'DataFrame là bảng dữ liệu 2 chiều có cấu trúc gồm các hàng và cột (phổ biến trong Pandas, R, SQL).', 2, 'NHO', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_05', 'moc_cds_06_02', 'Trong quy trình khai phá và phân tích số liệu, mục tiêu cốt lõi của công đoạn Làm sạch dữ liệu (Data Cleaning) là gì?', 'TRAC_NGHIEM_4', 'Làm cho tập dữ liệu trở nên phức tạp hơn bằng cách cố tình chèn thêm các ký tự ngẫu nhiên vào các trường thông tin', 'Loại bỏ các bản ghi trùng lặp, xử lý các giá trị bị khuyết thiếu (NULL), sửa đổi các lỗi sai sót và chuẩn hóa định dạng', 'Xóa bỏ hoàn toàn toàn bộ cơ sở dữ liệu hiện có để tiến hành nhập tay lại từ đầu từ các cuốn sổ giấy', 'Mã hóa toàn bộ các con số thống kê thành các tệp hình ảnh để giảm dung lượng lưu trữ trên máy chủ', 1, 'Làm sạch dữ liệu nhằm loại bỏ sai sót, xử lý giá trị khuyết thiếu và trùng lặp, chuẩn hóa để sẵn sàng phân tích.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_06', 'moc_cds_06_02', 'Khi thiết kế các báo cáo trực quan hóa dữ liệu trong kinh doanh, biểu đồ đường (Line Chart) là lựa chọn tối ưu nhất khi muốn thể hiện:', 'TRAC_NGHIEM_4', 'Mối quan hệ chính trị, ngoại giao phức tạp giữa các quốc gia và vùng lãnh thổ trên bản đồ thế giới', 'Xu hướng biến thiên, dao động hoặc tốc độ tăng trưởng liên tục của một chỉ số theo chuỗi thời gian', 'Cơ cấu tỷ lệ phần trăm đóng góp của các nhóm mặt hàng trong tổng doanh số 100% của một cửa hàng', 'Vị trí địa lý tọa độ kinh độ và vĩ độ của các cửa hàng bán lẻ trên nền tảng bản đồ số không gian', 1, 'Biểu đồ đường (Line chart) dùng chuẩn xác nhất để phản ánh xu hướng biến thiên theo thời gian.', 1, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_07', 'moc_cds_06_02', 'Khung năng lực số cơ bản dành cho công dân (Digital Literacy) KHÔNG bắt buộc phải bao gồm năng lực kỹ thuật chuyên sâu nào dưới đây?', 'TRAC_NGHIEM_4', 'Năng lực đọc hiểu dữ liệu và khai thác thông tin từ các biểu đồ báo cáo số liệu kinh doanh cơ bản', 'Kỹ năng lập trình nâng cao phát triển hạ tầng máy chủ backend, vi mạch phần cứng và hệ điều hành nhân', 'Kỹ năng giao tiếp số và trao đổi thông tin cộng tác văn minh, tôn trọng người khác trên không gian mạng', 'Khả năng tìm kiếm, phân tích, đánh giá độ tin cậy và hiểu đúng bản chất của các luồng thông tin số', 1, 'Tư duy năng lực số (Digital Literacy) là kỹ năng nền tảng phổ cập cho mọi công dân, không đòi hỏi lập trình máy chủ backend chuyên sâu.', 2, 'HIEU', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_08', 'moc_cds_06_02', 'Để trình bày tỷ trọng đóng góp của 3 thành phần: Kinh tế số ICT, Kinh tế số Internet/nền tảng và Kinh tế số ngành trong tổng quy mô kinh tế số Việt Nam (tổng thể 100%), loại biểu đồ nào là trực quan và chuẩn mực nhất?', 'TRAC_NGHIEM_4', 'Biểu đồ tán xạ (Scatter Plot) dùng để tìm kiếm mối tương quan phân tán giữa hai biến số liên tục', 'Biểu đồ tròn (Pie Chart) hoặc Biểu đồ vành khăn (Donut Chart) thể hiện rõ cơ cấu thành phần trên 100%', 'Biểu đồ nến Nhật Bản (Candlestick Chart) chuyên dùng để theo dõi giá cổ phiếu trên thị trường chứng khoán', 'Biểu đồ radar mạng nhện (Radar Chart) dùng để đánh giá năng lực đa chiều của một ứng viên tuyển dụng', 1, 'Biểu đồ tròn/vành khăn là chuẩn mực để thể hiện cơ cấu tỷ lệ % của các thành phần trong một tổng thể 100%.', 2, 'VAN_DUNG', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_01', 'moc_cds_06_03', 'Trong kỷ nguyên số, một trong những yếu tố cốt lõi nhất thể hiện tinh thần Đổi mới sáng tạo (Innovation) của một tổ chức là gì?', 'TRAC_NGHIEM_4', 'Sao chép nguyên xi toàn bộ mô hình và ý tưởng sản phẩm của đối thủ cạnh tranh mà không có sự cải tiến nào', 'Chủ động cắt giảm chất lượng tiêu chuẩn của sản phẩm dịch vụ nhằm thu hút đối tượng khách hàng ham giá rẻ', 'Ứng dụng linh hoạt công nghệ số mới nhằm cải tiến quy trình, gia tăng hiệu suất và nâng tầm giá trị dịch vụ', 'Nghiêm cấm nhân viên cấp dưới đưa ra các đề xuất ý tưởng thử nghiệm mới vì sợ rủi ro phát sinh chi phí', 2, 'Đổi mới sáng tạo trong thời đại số là dùng công nghệ cải tiến quy trình, nâng cao giá trị mang lại.', 2, 'HIEU', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_02', 'moc_cds_06_03', 'Hành vi nào dưới đây là biểu hiện tiêu biểu của một người có kỹ năng giao tiếp số (Digital Communication) chuẩn mực trong môi trường học thuật và công việc?', 'TRAC_NGHIEM_4', 'Tự ý viết và phát tán mã độc gián điệp vào hòm thư điện tử của đồng nghiệp để kiểm tra tính cảnh giác', 'Ghi chép toàn bộ mật khẩu đăng nhập các hệ thống quan trọng ra các mẩu giấy ghi chú dán công khai trên bàn', 'Soạn thảo thư điện tử (email) rõ ràng, lịch sự, đúng nghi thức và biết cách trình bày báo cáo trực tuyến mạch lạc', 'Xóa toàn bộ lịch sử duyệt web và các tệp tải về trên máy tính dùng chung của phòng ban sau khi sử dụng xong', 2, 'Kỹ năng giao tiếp số thể hiện qua việc soạn email chuyên nghiệp, tương tác văn minh và trình bày trực tuyến hiệu quả.', 1, 'NHO', 1, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_03', 'moc_cds_06_03', 'Hình thức tấn công an ninh mạng có tên gọi "Phishing" (Tấn công lừa đảo) hoạt động theo phương thức nguy hiểm nào?', 'TRAC_NGHIEM_4', 'Sử dụng các thiết bị phát sóng âm thanh siêu tần số cao để gây nhiễu loạn đường truyền kết nối Wi-Fi gia đình', 'Chỉ là hiện tượng lỗi ngữ pháp hoặc sai sót chính tả ngẫu nhiên xuất hiện trên các trang tin tức báo chí trực tuyến', 'Giả mạo email, tin nhắn của ngân hàng hoặc tổ chức uy tín chứa đường link giả nhằm lừa nạn nhân cung cấp mật khẩu và OTP', 'Tình trạng các đường cáp quang biển bị đứt gãy dẫn đến việc tốc độ truy cập các trang mạng quốc tế bị suy giảm', 2, 'Phishing là hình thức lừa đảo giả mạo cơ quan, ngân hàng bằng tin nhắn/email để chiếm đoạt tài khoản, OTP.', 2, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_04', 'moc_cds_06_03', 'Trong các phát biểu dưới đây về an toàn thông tin cá nhân, phát biểu nào KHÔNG PHẢI là nguyên tắc đặt mật khẩu bảo mật chuẩn mực?', 'TRAC_NGHIEM_4', 'Mật khẩu nên có độ dài tối thiểu từ 12 ký tự trở lên để ngăn chặn các thuật toán tấn công vét cạn (Brute-force)', 'Mật khẩu nên phối hợp hài hòa giữa các chữ cái viết hoa, chữ thường, chữ số và các ký tự đặc biệt như @, #, $', 'Nên sử dụng một mật khẩu duy nhất giống nhau cho tất cả các tài khoản mạng xã hội, email và ngân hàng để tránh bị quên', 'Người dùng nên chủ động thay đổi mật khẩu định kỳ hoặc sử dụng các phần mềm quản lý mật khẩu tin cậy', 2, 'Dùng một mật khẩu cho mọi tài khoản là sai lầm nguy hiểm nhất (Credential Stuffing), một tài khoản lộ sẽ mất sạch.', 1, 'HIEU', 2, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_05', 'moc_cds_06_03', 'Cơ chế xác thực hai bước (2FA - Two-Factor Authentication) được tích hợp trong các ứng dụng số nhằm mục đích chủ yếu nào?', 'TRAC_NGHIEM_4', 'Cho phép người dùng tự động mở đồng thời nhiều tab trình duyệt cùng lúc khi lướt web trên máy tính', 'Ngăn chặn tạm thời không cho máy tính hoặc thiết bị di động khởi động lại sau khi cập nhật hệ điều hành', 'Gia tăng bảo mật tài khoản bằng cách bổ sung thêm một lớp xác thực thứ hai độc lập ngoài mật khẩu đăng nhập', 'Tự động sao lưu toàn bộ các tệp tin trong thư mục mặc định lên dịch vụ đám mây công cộng của bên thứ ba', 2, '2FA tăng cường bảo mật bằng lớp bảo vệ thứ hai (OTP, Authenticator app, khóa FIDO) phòng trường hợp lộ mật khẩu.', 1, 'NHO', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_06', 'moc_cds_06_03', 'Theo Nghị định số 13/2023/NĐ-CP của Chính phủ Việt Nam về Bảo vệ dữ liệu cá nhân, hành vi nào dưới đây bị nghiêm cấm tuyệt đối?', 'TRAC_NGHIEM_4', 'Cá nhân sử dụng các dịch vụ lưu trữ đám mây có máy chủ đặt tại nước ngoài để lưu trữ ảnh chụp gia đình', 'Cơ quan nhà nước số hóa hồ sơ thủ tục hành chính của công dân để phục vụ dịch vụ công trực tuyến toàn trình', 'Thu thập, chuyển giao, mua bán dữ liệu cá nhân của người dân khi chưa có sự đồng ý của chủ thể dữ liệu', 'Doanh nghiệp sử dụng phần mềm kế toán và phần mềm quản trị quan hệ khách hàng có bản quyền hợp pháp', 2, 'Nghị định 13/2023/NĐ-CP nghiêm cấm tuyệt đối hành vi mua bán, chia sẻ trái phép dữ liệu cá nhân khi chưa được chủ thể đồng ý.', 2, 'VAN_DUNG', 3, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_07', 'moc_cds_06_03', 'Nếu bạn nhận được một tin nhắn SMS hoặc cuộc gọi tự xưng là cán bộ công an hoặc nhân viên ngân hàng thông báo tài khoản của bạn bị khóa và yêu cầu nhấp vào link "https://vietcombank-xacthuc.online" để nhập mật khẩu và mã OTP, hành động đúng đắn và an toàn nhất bạn cần làm là gì?', 'TRAC_NGHIEM_4', 'Lập tức nhấp vào đường link trên và nhập ngay mật khẩu cùng mã OTP gửi về máy để nhanh chóng mở khóa tài khoản', 'Chuyển tiếp tin nhắn này cho người thân và bạn bè để nhờ họ cùng đăng nhập vào đường link hỗ trợ xác minh giúp', 'Chụp ảnh màn hình tin nhắn rồi đăng tải công khai lên mạng xã hội kèm theo số điện thoại cá nhân để nhờ cộng đồng giải đáp', 'Tuyệt đối không bấm vào link lạ, không cung cấp OTP cho bất kỳ ai; chủ động liên hệ hotline chính thức của ngân hàng để xác minh', 3, 'Cơ quan công an và ngân hàng không bao giờ yêu cầu gửi OTP hoặc đăng nhập link lạ qua tin nhắn SMS/Zalo. Đây là thủ đoạn lừa đảo Phishing tinh vi.', 3, 'VAN_DUNG', 4, NULL)
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_01_10', 'moc_cds_06_01', 'Hãy chạm vào các ô tương ứng ở hai cột để ghép đúng 4 tiêu chí của mô hình thẩm định thông tin CRAAP với câu hỏi đánh giá tương ứng:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Bộ tiêu chí CRAAP: Currency (Thời điểm), Relevance (Mức liên quan), Authority (Thẩm quyền), Accuracy (Chính xác).', 2, 'HIEU', 3, '{"left_items":[{"id":"l1","text":"Currency (Tính mới/Thời điểm)"},{"id":"l2","text":"Relevance (Tính liên quan)"},{"id":"l3","text":"Authority (Thẩm quyền tác giả)"},{"id":"l4","text":"Accuracy (Độ chính xác)"}],"right_items":[{"id":"r1","text":"Thông tin được xuất bản khi nào, số liệu có còn cập nhật không?"},{"id":"r2","text":"Nội dung có trả lời đúng câu hỏi và phù hợp với đề tài cần tìm không?"},{"id":"r3","text":"Ai là tác giả hoặc cơ quan chịu trách nhiệm xuất bản bài viết này?"},{"id":"r4","text":"Dữ liệu có trích dẫn nguồn kiểm chứng và bằng chứng xác thực không?"}],"matches":{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_02_09', 'moc_cds_06_02', 'Chạm vào các thẻ để sắp xếp đúng trình tự 4 bước khoa học của một quy trình phân tích dữ liệu phục vụ ra quyết định kinh doanh:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình phân tích dữ liệu: Thu thập -> Làm sạch -> Phân tích -> Trực quan hóa & Báo cáo.', 2, 'VAN_DUNG', 3, '{"prompt":"Sắp xếp quy trình phân tích dữ liệu chuẩn 4 bước:","correct_order":["Thu thập dữ liệu thô từ nhiều nguồn (Data Collection)","Làm sạch và tiền xử lý dữ liệu (Data Cleaning & Preprocessing)","Phân tích và khám phá mô hình dữ liệu (Data Analysis & Modeling)","Trực quan hóa và diễn giải báo cáo kết quả (Data Visualization & Insights)"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_08', 'moc_cds_06_03', 'Hãy chạm vào các ô tương ứng ở hai cột để nối đúng từng giải pháp an toàn số với công dụng phòng vệ tương ứng:', 'NOI_CAP', NULL, NULL, NULL, NULL, NULL, 'Các công cụ an toàn số then chốt: 2FA (bảo vệ 2 lớp), Password Manager (quản lý mật khẩu), VPN (mã hóa đường truyền), Chữ ký số (toàn vẹn văn bản).', 2, 'VAN_DUNG', 4, '{"left_items":[{"id":"l1","text":"Xác thực 2 bước (2FA)"},{"id":"l2","text":"Password Manager"},{"id":"l3","text":"VPN (Mạng riêng ảo)"},{"id":"l4","text":"Chữ ký số (Digital Signature)"}],"right_items":[{"id":"r1","text":"Bảo vệ tài khoản dù mật khẩu chính bị lộ nhờ mã OTP/khóa cứng"},{"id":"r2","text":"Tạo và lưu trữ an toàn các mật khẩu dài, ngẫu nhiên, không trùng lặp"},{"id":"r3","text":"Mã hóa đường truyền dữ liệu khi kết nối vào mạng Wi-Fi công cộng"},{"id":"r4","text":"Xác thực danh tính người ký và bảo đảm tính toàn vẹn của văn bản điện tử"}],"matches":{"l1":"r1","l2":"r2","l3":"r3","l4":"r4"}}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_09', 'moc_cds_06_03', 'Chạm vào các thẻ để sắp xếp đúng quy trình phản ứng an ninh 4 bước khẩn cấp khi bạn nghi ngờ tài khoản email hoặc ngân hàng bị lộ thông tin:', 'SAP_XEP_CAU', NULL, NULL, NULL, NULL, NULL, 'Quy trình xử lý sự cố an toàn tài khoản: Đăng xuất thiết bị lạ -> Đổi mật khẩu -> Bật/Đổi 2FA -> Kiểm tra nhật ký giao dịch.', 3, 'VAN_DUNG', 4, '{"prompt":"Sắp xếp quy trình phản ứng sự cố tài khoản bị xâm nhập:","correct_order":["Đăng xuất ngay tài khoản khỏi tất cả các thiết bị lạ từ bảng quản trị","Đổi ngay mật khẩu chính thành mật khẩu mạnh mới chưa từng sử dụng","Kích hoạt hoặc làm mới cơ chế xác thực hai bước (2FA / Authenticator)","Kiểm tra nhật ký hoạt động gần đây và báo cho bộ phận an ninh/ngân hàng nếu phát hiện giao dịch lạ"]}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
INSERT INTO cau_hoi (ma_cau_hoi, ma_moc, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, vi_tri_dap_an_dung, giai_thich, do_kho, muc_bloom, buoc_luyen_tap, du_lieu_cau_hoi)
VALUES ('q_cds_06_03_10', 'moc_cds_06_03', 'Chọn từ thích hợp từ ngân hàng từ bên dưới để điền vào chỗ trống:', 'DIEN_TU', NULL, NULL, NULL, NULL, NULL, 'Xác thực hai yếu tố (2FA - Two-Factor Authentication) là lớp phòng vệ thiết yếu của công dân số.', 1, 'NHO', 4, '{"sentence_template":"Cơ chế xác thực {blank} (2FA) đòi hỏi người dùng phải cung cấp hai bằng chứng xác minh danh tính khác nhau trước khi được cấp quyền truy cập vào tài khoản trực tuyến.","options":["hai yếu tố","đơn tầng","công cộng","tùy chọn"],"blank_answer":"hai yếu tố"}')
ON CONFLICT (ma_cau_hoi) DO UPDATE SET
  noi_dung = EXCLUDED.noi_dung,
  loai_cau_hoi = EXCLUDED.loai_cau_hoi,
  dap_an_a = EXCLUDED.dap_an_a,
  dap_an_b = EXCLUDED.dap_an_b,
  dap_an_c = EXCLUDED.dap_an_c,
  dap_an_d = EXCLUDED.dap_an_d,
  vi_tri_dap_an_dung = EXCLUDED.vi_tri_dap_an_dung,
  giai_thich = EXCLUDED.giai_thich,
  do_kho = EXCLUDED.do_kho,
  muc_bloom = EXCLUDED.muc_bloom,
  buoc_luyen_tap = EXCLUDED.buoc_luyen_tap,
  du_lieu_cau_hoi = EXCLUDED.du_lieu_cau_hoi;
