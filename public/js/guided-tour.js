/* Interaction tour: real clicks open real screens; each layout has its own route. */
(function () {
  'use strict';
  const VERSION = 2;
  const state = { active:false, steps:[], index:0, target:null, run:0, waiting:false, mobile:false, history:[], contexts:{} };
  const visible = el => Boolean(el && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && getComputedStyle(el).display !== 'none');
  function find(selector) {
    if (typeof selector === 'function') return selector();
    return [...document.querySelectorAll(selector || '__missing__')].find(visible) || null;
  }
  const shown = selector => () => Boolean(find(selector));
  const gone = selector => () => !find(selector);
  const screen = view => () => currentAppView === view && Boolean(find('#view-' + view));
  const pause = ms => new Promise(resolve => setTimeout(resolve,ms));
  let geometryFrame=0;
  function watchGeometry() {
    if(!state.active)return;
    const waitingStep=state.steps[state.index];
    if(state.pendingAction===state.run && !state.waiting && waitingStep?.repeat && waitingStep.expect?.()){
      state.pendingAction=null;advance();
    }
    if(state.target&&!state.target.isConnected){const step=state.steps[state.index];state.target=find(step.target)||find(step.fallback);}
    const rect=state.target?.getBoundingClientRect(),dialog=document.getElementById('pet-tour-dialog');
    const key=rect?[rect.left,rect.top,rect.width,rect.height,dialog.offsetWidth,dialog.offsetHeight,innerWidth,innerHeight].join(','):'none';
    if(key!==state.geometryKey){state.geometryKey=key;layout(false);}
    geometryFrame=requestAnimationFrame(watchGeometry);
  }
  function read(id,target,title,text,extra={}) { return {id,target,title,text,...extra}; }
  function click(id,target,title,text,expect,extra={}) { return {id,target,title,text,expect,action:true,...extra}; }
  function buildSteps(mobile) {
    const steps=[];
    let section='Bắt đầu';
    const add = (...items) => steps.push(...items.map(step=>({...step,section})));
    const more = suffix => add(click('more-'+suffix,'#btn_m_nav_more','Mở menu Thêm','Chạm “Thêm” ở cuối thanh bên dưới. Các mục Kho môn, Cửa hàng, Hồ sơ và Cài đặt nằm trong menu này.',shown('#modal-mobile-more')));
    const nav = (view,label) => {
      const direct=['hub','saga','minigame','pet'].includes(view);
      if(mobile && !direct) more(view);
      add(click('nav-'+view,mobile ? (direct?'#btn_m_nav_'+view:'#btn_m_more_'+view) : '#nav-'+view,
        (mobile?'Chạm ':'Bấm ')+label, mobile ? `Chạm nút “${label}” đang được viền sáng. Trang chỉ đổi sau khi bạn tự chạm nút.` : `Bấm “${label}” trên thanh bên trái. Hãy thực hiện trên nút đang sáng để nhớ vị trí của chức năng.`, screen(view), {view}));
    };
    add(read('welcome','#hub-welcome-title','Cùng khám phá từng thao tác',`Bạn sẽ tự ${mobile?'chạm các nút trên thanh dưới':'bấm các nút trên thanh bên'} để đi qua hệ thống. Mỗi bước chỉ vào đúng một vùng. Bạn có thể tạm dừng và tiếp tục sau.`),
      read('level','#hub-level-progress','Cấp độ và EXP của bạn','EXP tích lũy khi học và thi đấu. Thanh này ghi cấp hiện tại, tổng EXP và lượng còn thiếu để lên cấp. Tiêu Xu để mua Pet không làm mất EXP.'),
      read('streak','#hub-streak-badge','Chuỗi ngày học tập','Streak thể hiện số ngày học liên tiếp theo giờ Việt Nam. Hãy quay lại học mỗi ngày để duy trì chuỗi.'),
      read('continue','#hub-focus-title','Tiếp tục đúng nơi đã dừng','Tên mốc và phần thưởng nằm trong card này. Sau chuyến hướng dẫn, bấm “Bắt đầu học ngay” để tiếp tục mốc đang mở.'),
      read('continue-rewards','#hub-focus-reward','Phần thưởng của mốc học','Hai con số này ghi EXP và Xu được thưởng khi hoàn thành mốc. EXP giúp lên cấp; Xu dùng trong cửa hàng.'),
      read('continue-button','#hub-continue-learning-card button','Nút bắt đầu học','Sau khi xem hết hướng dẫn, bấm nút này để mở bài học ở đúng mốc đang học.'),
      read('quests-home','#hub-daily-quests > div','Ba nhiệm vụ mỗi ngày','Học bài, tham gia đấu trường và chăm sóc Pet có tiến độ riêng. Khi hoàn thành, bấm nút quà để nhận thưởng. Hoàn thành và đã nhận là hai trạng thái khác nhau.'));
    if (mobile) add(click('quests-open','#btn_m_nav_quests','Mở nhiệm vụ trên điện thoại','Chạm “Nhiệm vụ” trên thanh dưới để xem danh sách mà không cần cuộn về trang chủ.',shown('#modal-daily-quests')),
      read('quests-panel','#modal-daily-quests > div > div','Xem tiến độ nhiệm vụ','Mỗi nhiệm vụ hiển thị mục tiêu và phần thưởng. Nút hành động dẫn bạn đến tính năng phù hợp; nút quà chỉ dùng sau khi hoàn thành.'),
      click('quests-close','#btn_close_daily_quests_modal','Đóng bảng nhiệm vụ','Chạm dấu × để trở lại trang chủ.',gone('#modal-daily-quests')));

    section='Môn học'; nav('catalog','Kho môn học');
    add(read('catalog-card','#catalog-courses-grid > div','Đọc thông tin môn trước khi học','Mỗi card có tên môn, giới thiệu và nút đăng ký hoặc học tiếp. Chọn một môn phù hợp; đăng ký giúp môn đó xuất hiện trong danh sách đang học.'),
      click('catalog-enter',() => find('[id^="btn_catalog_enroll_"]') || find('[id^="btn_catalog_study_"]'), 'Mở hành trình của một môn','Bấm nút đăng ký hoặc học tiếp trên card đang sáng. Đợi bản đồ của môn đó tải xong.',screen('saga')),
      read('map-first',()=>find('[id^="btn_moc_active_"]')||find('[id^="btn_moc_done_"]'),'Bạn đã vào bản đồ của môn','Bản đồ xếp các mốc theo thứ tự. Hoàn thành mốc trước để mở mốc tiếp theo. Mốc đã hoàn thành có thể mở lại để ôn tập.'));
    nav('enrolled','Môn đang theo học');
    add(read('enrolled-card','#enrolled-courses-grid > div','Quản lý những môn đã đăng ký','Card hiển thị tiến độ của từng môn. Nút vào leo tháp mở đúng bản đồ môn đó. Dùng mục này khi muốn đổi môn đang học.'),
      read('enrolled-progress','#enrolled-courses-grid > div:first-child p','Tiến độ theo tài khoản','Tiến độ học được lấy từ máy chủ. Bài chưa hoàn thành và bài đã hoàn thành được phân biệt khi bạn mở bản đồ.'));
    section='Bản đồ & bài học'; nav('saga','Lộ trình');
    add(read('map-progress','#topbar-title','Mốc, sao và chương đang học','Thanh tiến độ cho biết số mốc đã qua. Nếu có huy hiệu sao của chương, đó là kết quả học trong chương đang chọn.'),
      click('checkpoint-open',()=>find('[id^="btn_moc_active_"]')||find('[id^="btn_moc_done_"]'), 'Mở một mốc đang học','Bấm mốc được viền sáng trên bản đồ. Hệ thống mở phần tổng quan, lý thuyết hoặc bài luyện tùy loại mốc.',()=>Boolean(find('#modal-checkpoint')||find('#modal-theory')||find('#view-play')), {optional:true}),
      read('checkpoint-summary',()=>find('#cp-modal-title')||find('#theory-title')||find('#card-title'),'Đọc hướng dẫn của mốc','Mốc lý thuyết có nội dung bài giảng; mốc luyện tập chia thành các chặng. Chặng khóa sẽ mở khi bạn hoàn thành chặng trước.'),
      read('checkpoint-steps',()=>find('#cp-modal-steps-container > div')||find('#theory-content')||find('#card-content'),'Cách học từng chặng','Đọc bài trước, chọn “Bắt đầu” ở chặng đang mở, rồi làm từng câu. Trắc nghiệm: chọn một đáp án. Nối cặp: chọn hai ô tương ứng. Điền từ: chọn từ phù hợp. Ghép câu: chạm các thẻ theo thứ tự.'),
      read('checkpoint-feedback',()=>find('#cp-modal-steps-container')||find('#theory-content')||find('#btn-next-card')||find('#play-practice-container'),'Kiểm tra đáp án và nhận thưởng','Sau khi chọn, bấm Kiểm tra nếu câu hỏi yêu cầu. Đọc giải thích rồi tiếp tục. Câu sai cần luyện lại. Hoàn thành các chặng để nhận EXP, Xu và mở mốc tiếp theo.'),
      click('lesson-cards','#btn-next-card','Tự lật các thẻ bài giảng','Đọc thẻ đang hiện rồi bấm nút Tiếp tục của bài học. Hãy tiếp tục lật từng thẻ cho đến khi phần câu hỏi xuất hiện.',shown('#q-prompt'),{repeat:true,optional:true}),
      read('lesson-question','#q-prompt','Đọc kỹ câu hỏi trước khi chọn','Đây là nội dung bạn cần giải. Đọc cả yêu cầu và những lựa chọn bên dưới. Chọn đáp án theo kiến thức vừa học.'),
      click('lesson-answer',()=>find('#q-options-container > .grid')||find('#q-options-container > div')||find('#q-options-container'),'Thử thao tác trả lời',()=>{
        const q=currentMocSession?.questionsQueue?.[0]||currentQuizSession?.questions?.[currentQuizSession?.qIndex||0];
        return ({NOI_CAP:'Chọn một ô thuật ngữ, rồi chọn ô định nghĩa tương ứng. Tiếp tục ghép hết các cặp; cặp sai có thể chọn lại.',DIEN_TU:'Chạm một thẻ từ để điền vào chỗ trống. Bạn có thể đổi từ trước khi bấm Kiểm tra.',SAP_XEP_CAU:'Chạm lần lượt các thẻ từ để xếp câu. Chạm lại từ trong vùng ghép để bỏ; dùng Làm lại nếu muốn bắt đầu lại.'})[q?.loai_cau_hoi]||'Bấm một đáp án. Câu trắc nghiệm được kiểm tra ngay khi chọn; hãy đọc phản hồi hiện ra trước khi sang câu mới.';
      },()=>Boolean(find('#q-feedback-box')||currentMocSession?.dienTuChosen||currentMocSession?.arrangedTokens?.length),{repeat:true,optional:true}),
      click('lesson-check',()=>find('#q-feedback-box')?find('#q-feedback-title'):find('#btn-next-step'),'Kiểm tra câu trả lời','Nếu chưa có phản hồi, bấm nút Kiểm tra của bài học. Câu trắc nghiệm và nối cặp tự kiểm tra sau thao tác; nếu đã thấy kết quả, bấm vùng phản hồi đang sáng để đọc tiếp.',shown('#q-feedback-box'),{optional:true}),
      read('lesson-explanation','#q-feedback-desc','Đọc lý do đúng hoặc sai','Đừng chỉ nhìn màu xanh hoặc đỏ. Phần giải thích giúp bạn hiểu đáp án. Nếu sai, câu hỏi sẽ được đưa về cuối hàng đợi để bạn thử lại.'),
      read('lesson-next','#btn-next-step','Tiếp tục học và lưu kết quả','Nút của bài học đưa bạn sang câu kế tiếp. Làm hết hàng đợi để hoàn thành. Khi cần rời sớm, bấm ×; ứng dụng lưu những câu đã làm trước khi quay về bản đồ.'),
      click('checkpoint-close',()=>find('#btn_close_cp_modal')||find('#btn_theory_modal_close_x')||find('#btn_play_ve_bando'),'Trở lại bản đồ','Bấm nút đóng đang sáng. Nếu đang làm bài, đọc lựa chọn lưu kết quả trước khi rời.',()=>!find('#modal-checkpoint')&&!find('#modal-theory')&&currentAppView!=='play',{optional:true}));

    section='Linh vật'; nav('pet','Linh vật');
    add(read('pet-current','#current-pet-name','Pet đang đồng hành','Tên và hình ở đây là Pet đang được trang bị. Pet này cũng xuất hiện ở trang chủ, thanh bên và sảnh đấu trường.'),
      click('pet-care','#btn_vuotve_pet','Thử vuốt ve Pet','Bấm “Vuốt ve” để tương tác miễn phí với Pet. Đây là thao tác chăm sóc, khác với chỉ mở trang Linh vật.',null),
      read('pet-feed','#btn_choan_pet','Cho ăn sử dụng Xu','Nút ghi rõ chi phí 10 Xu. Chỉ xác nhận khi bạn muốn chi số Xu này; số dư sẽ được lưu trên máy chủ.'),
      read('pet-owned','#owned-pets-list > div','Đổi Pet đã sở hữu','Chỉ Pet đã mở khóa mới nằm trong bộ sưu tập. Bấm một Pet để đổi; thông báo “Đã lưu” xác nhận máy chủ đã nhận lựa chọn của bạn.'),
      click('pet-shop','#btn_pet_to_shop','Đi tới cửa hàng','Bấm “Cửa hàng” ngay trong phần bộ sưu tập để xem Pet có thể mở khóa.',screen('shop')),
      read('shop-card','#shop-pets-grid > div','Giá Xu và điều kiện cấp','Mỗi Pet ghi giá hoặc cấp độ cần đạt. Khi mua, hộp xác nhận ghi số Xu sẽ dùng. Bạn có thể hủy nếu chưa muốn mua.'),
      read('shop-admin',()=>find('#shop-pets-grid [data-pet-role="admin"]')||find('#shop-pets-grid > div:last-child'),'Pet dành cho quản trị viên','Pet có huy hiệu Admin chỉ được máy chủ cho phép trang bị khi tài khoản hiện tại là quản trị viên. Học viên có thể xem hình nhưng không thể mua hoặc dùng.'),
      read('shop-items','#shop-accessories','Vật phẩm trang trí','Xem trạng thái khả dụng trên từng vật phẩm. Chỉ vật phẩm có chức năng lưu và trang bị thật mới cho phép mua; bản xem trước không trừ Xu.',{optional:true}));

    section='Đấu trường'; nav('minigame','Minigame');
    add(read('arena-modes','#card-mode-ranked','Chọn chế độ trước khi tìm trận','Đấu hạng, giao hữu và thử thách có luật riêng. Trước khi bắt đầu, kiểm tra môn thi và Pet của bạn.'),
      click('ranked-open','#card-mode-ranked','Mở sảnh Đấu hạng','Bấm card Đấu hạng 1v1 để mở các lựa chọn ghép trận.',shown('#arena-fight')),
      read('ranked-subject','#lobby-subject','Chọn môn để đối kháng','Danh sách này chọn ngân hàng câu hỏi dùng cho trận đấu. Chọn môn đã học để luyện tập hiệu quả.',{fallback:'#arena-fight select'}),
      read('ranked-pet','#arena-pet-select','Chọn Pet trước trận','Bạn có thể đổi sang một Pet đã sở hữu từ danh sách. Lựa chọn được lưu như khi đổi ở trang Linh vật.'),
      read('ranked-start','#btn_timtran_1v1','Tìm đối thủ và diễn biến trận','Bấm tìm trận khi sẵn sàng. Bạn có thể hủy lúc đang chờ. Nếu không có đối thủ, hệ thống có thể ghép Bot. Khi trận bắt đầu, trả lời câu hỏi để gây sát thương; xem kết quả và thưởng khi kết thúc.',{fallback:'#arena-fight button[onclick*="startMatchmaking"]'}),
      click('ranked-back','#btn_back_modes_ranked','Quay lại chọn chế độ','Bấm nút quay lại chế độ để xem phần giao hữu.',shown('#arena-modes-bar')),
      click('casual-open','#card-mode-casual','Mở Đấu giao hữu','Bấm card giao hữu để xem mã phòng và các lựa chọn chơi với bạn bè hoặc Bot.',shown('#arena-casual')),
      read('casual-code','#casual-room-code-display','Mời bạn bằng mã phòng','Bấm mã phòng để sao chép và gửi cho người bạn muốn mời. Người kia nhập mã vào ô tham gia phòng. Chỉ bắt đầu khi cả hai đã sẵn sàng.'),
      read('casual-join','#input_casual_room_code','Tham gia phòng của bạn bè','Nhập mã được bạn bè gửi, rồi bấm Tham gia. Kiểm tra tên đối thủ, môn và Pet trước khi bắt đầu.',{fallback:'#arena-casual input'}),
      read('casual-bot','#btn_dauthuong_bot','Luyện tập với Bot','Nút này thêm Bot vào phòng tập. Khi đối thủ đã xuất hiện, bấm bắt đầu để luyện tập theo câu hỏi của môn đã chọn.'),
      read('casual-start','#btn_casual_start_friend','Bắt đầu và rời trận','Nút bắt đầu chỉ dùng khi bạn đã sẵn sàng chơi. Khi trận đang diễn ra, muốn rời hãy đọc hộp cảnh báo; việc rời có thể được tính là đầu hàng.'),
      click('casual-back','#btn_back_modes_casual','Trở lại sảnh chế độ','Bấm quay lại để xem thử thách cực hạn.',shown('#arena-modes-bar')),
      click('arcade-open','#card-mode-arcade','Mở chuẩn bị Cực hạn','Bấm card Cực hạn để đọc luật và chọn môn trước khi bắt đầu.',shown('#modal-extreme-setup')),

      read('extreme-subject','#extreme-subject-select','Chọn môn trong thử thách','Bạn có 5 sinh mạng. Trả lời sai mất mạng; chuỗi 10 câu đúng liên tiếp hồi 1 mạng. Chọn môn tại đây trước khi bắt đầu.'),
      read('extreme-start','#btn_start_extreme_play','Bắt đầu, tạm dừng và xem kết quả','Bấm bắt đầu khi muốn chơi thật. Trong trận, nút rời mở lựa chọn kết thúc và lưu kết quả. Nếu có phiên đang dở, giao diện hiển thị lựa chọn tiếp tục.'),
      click('extreme-close','#btn_close_extreme_setup','Đóng phần chuẩn bị','Bấm × để trở lại sảnh mà chưa bắt đầu trận.',gone('#modal-extreme-setup')),

      click('leaderboard-open','#btn_bxh_dautruong','Mở bảng xếp hạng','Bấm nút Bảng xếp hạng ở đầu sảnh.',shown('#arena-rank')),
      read('leaderboard-filter','#rank-subject','Lọc bảng xếp hạng','Chọn phạm vi môn hoặc tổng hợp. Dòng của bạn dựa trên mã tài khoản; tên giống nhau không có nghĩa là cùng một người.'),
      read('leaderboard-list','#rank-list > div','Đọc số liệu xếp hạng','Các chỉ số cần lấy từ kết quả thực trên máy chủ. Nếu chưa có dữ liệu, hệ thống phải ghi chưa có dữ liệu thay vì tạo số để hiển thị.'),
      click('leaderboard-close','#btn_ve_sanh_dau','Trở lại sảnh','Bấm về sảnh để tiếp tục phần hồ sơ và cài đặt.',shown('#arena-modes-bar')));

    section='Hồ sơ & cài đặt';
    if (mobile) more('profile');
    add(click('profile-open', mobile?'#btn_m_more_profile':'#app-sidebar [onclick="openProfileModal()"]','Mở hồ sơ của bạn',mobile?'Chạm “Hồ sơ” trong menu Thêm.':'Bấm tên hoặc ảnh đại diện ở đầu thanh bên trái.',shown('#modal-profile')),
      read('profile-level','#profile-rank-badge','Cấp và danh hiệu trong hồ sơ','Danh hiệu, cấp và tiến độ EXP dùng cùng quy tắc với trang chủ. Thanh tiến độ chỉ tính khoảng EXP của cấp hiện tại.'),
      read('profile-stats','#profile-stat-streak','Xem thành tích của tài khoản','Streak, số mốc đã hoàn thành và số dư Xu là các thông tin riêng của bạn. Huy hiệu chưa đạt có trạng thái khóa và điều kiện mở.'),
      click('profile-settings','#btn_profile_open_settings','Mở Cài đặt từ hồ sơ','Bấm bánh răng để mở Cài đặt. Bạn cũng có thể mở từ thanh đầu trang trên PC hoặc menu Thêm trên điện thoại.',shown('#modal-settings')),
      click('settings-account','#settings-open-account','Mở Tài khoản & bảo mật','Bấm mục này để xem tên hiển thị, tên đăng nhập và phần mật khẩu.',shown('#settings-view-auth')),
      read('settings-name','#auth-display-name-val','Tên hiển thị và tên đăng nhập','Tên hiển thị là tên mọi người nhìn thấy. Tên đăng nhập dùng để đăng nhập. Bấm Sửa ở đúng dòng, nhập giá trị rồi Lưu khi muốn thay đổi.'),
      click('password-open','#btn_settings_edit_password','Xem cách đổi mật khẩu','Bấm Sửa mật khẩu để xem các trường cần nhập. Chưa cần thay đổi mật khẩu trong hướng dẫn.',shown('#edit-box-password')),
      read('password-fields','#edit-box-password','Nhập và xác nhận mật khẩu','Nhập mật khẩu hiện tại và mật khẩu mới theo yêu cầu, rồi bấm Cập nhật khi thật sự muốn đổi. Giữ thông tin đăng nhập của bạn an toàn.'),
      click('password-cancel','#btn_settings_cancel_password','Đóng phần đổi mật khẩu','Bấm Hủy để giữ nguyên thông tin và tiếp tục chuyến hướng dẫn.',gone('#edit-box-password')),
      click('account-back','#btn_settings_auth_back','Quay về Cài đặt','Bấm mũi tên quay lại ở đầu bảng.',shown('#settings-view-main')),
      click('settings-audio','#settings-open-audio','Mở điều chỉnh âm thanh','Bấm Âm thanh hiệu ứng để chỉnh từng nhóm âm.',shown('#settings-view-audio')),
      read('audio-quiz','#toggle-audio-quiz','Âm khi làm bài','Công tắc này bật hoặc tắt âm của câu hỏi. Nút Nghe thử giúp bạn chọn mức trải nghiệm trước khi học.'),
      read('audio-reward','#toggle-audio-reward','Âm phần thưởng','Bạn có thể tắt âm nhận thưởng mà vẫn giữ âm trả lời hoặc chiến đấu. Các lựa chọn được lưu theo tài khoản.',{fallback:'#toggle-audio-coin'}),
      read('audio-battle','#toggle-audio-battle','Âm chiến đấu','Công tắc này điều khiển các hiệu ứng trong đấu trường. Điều chỉnh trước khi bắt đầu trận.'),
      read('audio-outcome','#toggle-audio-outcome','Âm kết quả và nhạc nền','Bạn có thể tùy chọn âm thắng/thua và nhạc nền riêng. Nhạc nền chỉ phát sau tương tác của bạn theo quy định trình duyệt.',{fallback:'#toggle-audio-bgm'}),
      click('audio-back','#btn_settings_sound_back','Quay về Cài đặt','Bấm quay lại để xem cách mở lại hướng dẫn và đăng xuất.',shown('#settings-view-main')),
      read('settings-guide','#settings-open-guide','Mở lại hoặc tiếp tục hướng dẫn','Mục này mở chuyến hướng dẫn bất cứ lúc nào. Nếu đã tạm dừng, bạn có thể tiếp tục đúng bước; xem lại không nhận quà thêm lần nữa.'),
      read('settings-logout','#btn_dangxuat','Đăng xuất khi dùng máy chung','Bấm Đăng xuất khi bạn muốn kết thúc phiên đăng nhập. Trong chuyến hướng dẫn này, hãy bấm Tiếp tục để xem phần đổi giao diện.'),
      click('settings-close','#btn_settings_close_main','Đóng Cài đặt','Bấm × để trở lại ứng dụng.',gone('#modal-settings')));
    if (mobile) more('theme');
    add(click('theme-change',mobile?'#btn_m_more_theme':'#btn-theme-toggle','Thử đổi giao diện sáng/tối','Bấm nút đổi giao diện một lần. Màn hình đổi ngay và lựa chọn được lưu theo tài khoản.',null));
    if(mobile) add(click('theme-close','#btn_close_mobile_more','Đóng menu Thêm','Chạm × để trở lại màn hình chính.',gone('#modal-mobile-more')));
    section='Hoàn tất'; nav('hub','Trang chủ');
    add(read('finish','#hub-continue-learning-card','Bạn đã biết đường đi trong Tháp Tri Thức','Bây giờ hãy bắt đầu một bài học, chăm sóc Pet hoặc chọn một trận luyện tập. Bạn có thể mở lại hướng dẫn trong Cài đặt. Quà tân thủ chỉ nhận một lần theo tài khoản.'));
    return steps;
  }

  function installDialog() {
    const modal=document.getElementById('modal-pet-onboarding');
    const dialog=document.getElementById('pet-tour-dialog');
    dialog.innerHTML=`<div class="tour-header flex items-center justify-between border-b border-[var(--border)] pb-3 gap-3"><div><div id="tour-chapter" class="tour-chapter"></div><strong id="pet-tour-name" class="text-xs text-emerald-600">Linh thú hướng dẫn</strong></div><span id="pet-tour-step-badge" class="text-xs font-mono text-emerald-600"></span></div><div class="space-y-1.5"><h3 id="pet-tour-title" class="font-bold"></h3><p id="pet-tour-text" class="text-[var(--muted-foreground)]"></p><div id="tour-action-hint" class="tour-action-hint"></div></div><div class="tour-progress-track"><div id="tour-progress" class="tour-progress-fill"></div></div><div class="tour-controls pt-2 border-t border-[var(--border)]"><button id="btn_pet_tour_skip" type="button" class="text-xs text-[var(--muted-foreground)]">Tạm dừng</button><div class="tour-control-main"><button id="btn_pet_tour_prev" type="button" class="text-xs border border-[var(--border)] rounded-xl px-3">← Quay lại</button><button id="btn_pet_tour_next" type="button" class="text-xs font-bold bg-emerald-600 text-white rounded-xl px-3">Tiếp tục →</button><button id="btn_pet_tour_finish" type="button" class="hidden text-xs font-bold bg-emerald-600 text-white rounded-xl px-3">Hoàn tất</button></div></div>`;
    dialog.setAttribute('role','dialog'); dialog.setAttribute('aria-labelledby','pet-tour-title'); dialog.setAttribute('aria-describedby','pet-tour-text');
    for(let i=0;i<4;i++){const shade=document.createElement('div');shade.className='tour-shade';shade.dataset.side=i;modal.appendChild(shade);}
    document.getElementById('btn_pet_tour_skip').onclick=stop;
    document.getElementById('btn_pet_tour_prev').onclick=back;
    document.getElementById('btn_pet_tour_next').onclick=next;
    document.getElementById('btn_pet_tour_finish').onclick=finish;
  }
  function save(completed=false) {
    const step=state.steps[state.index]; if(!step) return;
    const context = captureContext();
    state.contexts[state.index] = context;
    const progress={version:VERSION,step:step.id,layout:state.mobile?'mobile':'desktop',completed,context};
    localStorage.setItem('tok_tour_v2_'+currentUserAccount.userId,JSON.stringify(progress));
    currentUserAccount.tourProgress=progress;
    queuePreferenceSave({tien_do_huong_dan:progress});
  }
  function cleanupModals() {
    for(const id of ['modal-checkpoint','modal-theory','modal-profile','modal-settings','modal-mobile-more','modal-daily-quests','modal-extreme-setup']) document.getElementById(id)?.classList.add('hidden');
    document.body.style.overflow='';
  }
  function captureContext() {
    return {view:currentAppView,course:typeof currentActiveCourseSlug==='string'?currentActiveCourseSlug:null,
      mocId:typeof currentMocSession!=='undefined'?currentMocSession?.mocId:null,
      arena:typeof currentArenaMode!=='undefined'?currentArenaMode:null,rank:Boolean(find('#arena-rank')),
      modal:['modal-checkpoint','modal-theory','modal-profile','modal-settings','modal-mobile-more','modal-daily-quests','modal-extreme-setup'].find(id=>find('#'+id))||null,
      settings:find('#settings-view-auth')?'auth':find('#settings-view-audio')?'audio':'main',
      editing:['name','username','password','google'].find(field=>find('#edit-box-'+field))||null};
  }
  async function restoreContext(context) {
    cleanupModals();
    if(context.course && ['saga','play'].includes(context.view)) {
      currentActiveCourseSlug=context.course; await loadCourseRoadmap(context.course);
    }
    if(context.view==='play'&&context.mocId) await startMocLearning(context.mocId);
    else navTo(['hub','catalog','enrolled','saga','pet','shop','minigame'].includes(context.view)?context.view:'hub');
    if(context.view==='minigame'){selectArenaMode(context.arena||null);if(context.rank)arenaTab('rank');}
    if(context.modal==='modal-profile')openProfileModal();
    if(context.modal==='modal-mobile-more')openMobileMoreSheet();
    if(context.modal==='modal-daily-quests')openDailyQuestsModal();
    if(context.modal==='modal-extreme-setup')openExtremeSetupModal();
    if(context.modal==='modal-settings'){
      openSettingsModal();if(context.settings==='auth'){openSettingsAuthView();if(context.editing)toggleEditField(context.editing);}if(context.settings==='audio')openSettingsAudioView();
    }
  }
  async function start() {
    if(!currentUserAccount?.userId){showToast('Hãy đăng nhập trước khi mở hướng dẫn.','info');return;}
    if(['battle','extreme','play'].includes(currentAppView)){showToast('Hãy kết thúc hoặc lưu phiên đang chơi trước khi mở hướng dẫn.','info');return;}
    cleanupModals(); document.getElementById('tour-resume-banner')?.remove();
    state.mobile=innerWidth<768; state.steps=buildSteps(state.mobile); state.index=0;state.history=[];state.contexts={};
    let saved=currentUserAccount.tourProgress;
    if(!saved){try{saved=JSON.parse(localStorage.getItem('tok_tour_v2_'+currentUserAccount.userId));}catch{}}
    if(saved && !saved.completed && saved.layout===(state.mobile?'mobile':'desktop')) {
      const index=state.steps.findIndex(step=>step.id===saved.step);
      if(index>=0 && saved.context){state.index=index;await restoreContext(saved.context);}
    }
    if(state.index===0)navTo('hub');
    const sidebar=document.getElementById('app-sidebar'); if(!state.mobile) sidebar?.classList.remove('collapsed');
    state.active=true;document.getElementById('modal-pet-onboarding').classList.remove('hidden');
    cancelAnimationFrame(geometryFrame);state.geometryKey='';geometryFrame=requestAnimationFrame(watchGeometry);
    // A resumed chapter starts with a real navigation click; no automatic page jumps.
    await render();
  }
  async function render() {
    if(state.restoreTargetStyle){state.restoreTargetStyle();state.restoreTargetStyle=null;}
    const run=++state.run; state.waiting=false; state.target=null;state.pendingAction=null;
    document.getElementById('pet-tour-dialog').style.maxHeight='';
    const step=state.steps[state.index]; if(!step) return;
    save();
    document.getElementById('pet-tour-name').textContent=currentEquippedPet?.name||'Linh thú hướng dẫn';
    document.getElementById('tour-chapter').textContent=step.section+' · '+(state.mobile?'Điện thoại':'Máy tính');
    document.getElementById('pet-tour-step-badge').textContent=`${state.index+1}/${state.steps.length}`;
    document.getElementById('pet-tour-title').textContent=step.title;
    document.getElementById('pet-tour-text').textContent=typeof step.text==='function'?step.text():step.text;
    document.getElementById('tour-progress').style.width=((state.index+1)/state.steps.length*100)+'%';
    const last=state.index===state.steps.length-1;
    const nextBtn=document.getElementById('btn_pet_tour_next');
    nextBtn.classList.toggle('hidden',last); nextBtn.disabled=Boolean(step.action&&!step.optional);
    nextBtn.textContent=step.action?(step.optional?'Bỏ bước này →':'Chờ thao tác ↑'):'Tiếp tục →';
    document.getElementById('btn_pet_tour_finish').classList.toggle('hidden',!last);
    document.getElementById('btn_pet_tour_prev').disabled=state.index===0;
    const hint=document.getElementById('tour-action-hint');hint.textContent=step.action?'Thực hiện trên nút đang sáng để sang bước kế tiếp.':'Đọc phần được viền sáng, rồi bấm Tiếp tục.';
    let target;
    for(let n=0;n<30;n++){target=find(step.target)||find(step.fallback);if(target)break;await pause(100);if(!state.active||run!==state.run)return;}
    if(!target){
      hint.textContent='Tài khoản hiện chưa có phần này hoặc nội dung chưa tải xong. Bạn có thể bỏ bước này để tiếp tục.';
      nextBtn.disabled=false;nextBtn.textContent='Tiếp tục →';layout();return;
    }
    state.target=target;
    if(step.id==='lesson-answer'){
      const oldStyle=target.getAttribute('style');
      target.style.maxHeight=Math.floor(innerHeight*.36)+'px';target.style.minHeight='0';target.style.overflowY='auto';
      state.restoreTargetStyle=()=>{if(oldStyle===null)target.removeAttribute('style');else target.setAttribute('style',oldStyle);};
    }
    target.scrollIntoView({block:state.mobile?'start':'center',inline:'nearest',behavior:'instant'});
    await pause(100);if(run!==state.run)return;
    layout(true);
    if(step.action) target.focus?.({preventScroll:true});
  }
  function layout(adjustScroll=false) {
    if(!state.active)return;
    const dialog=document.getElementById('pet-tour-dialog');
    const spot=document.getElementById('pet-tour-spotlight');
    const w=innerWidth,h=innerHeight;
    dialog.style.transform='none';dialog.style.bottom='auto';dialog.style.right='auto';
    const dw=dialog.offsetWidth;let dh=dialog.offsetHeight;
    let r=visible(state.target)?state.target.getBoundingClientRect():null;
    let left=Math.max(10,(w-dw)/2),top=Math.max(10,h-dh-12);
    if(r){
      const spaces=[{left:r.right+16,top:Math.max(12,Math.min(h-dh-12,r.top)),fits:r.right+16+dw<=w-12},
        {left:r.left-dw-16,top:Math.max(12,Math.min(h-dh-12,r.top)),fits:r.left-dw-16>=12},
        {left:Math.max(12,Math.min(w-dw-12,r.left)),top:r.bottom+14,fits:r.bottom+14+dh<=h-12},
        {left:Math.max(12,Math.min(w-dw-12,r.left)),top:r.top-dh-14,fits:r.top-dh-14>=12}];
      let place=state.mobile?spaces.slice(2).find(p=>p.fits):spaces.find(p=>p.fits);
      if(!place){
        const above=Math.max(0,r.top-24),below=Math.max(0,h-r.bottom-24);
        const capacity=Math.max(above,below);
        if(capacity>=160 && capacity<dh){
          dialog.style.maxHeight=Math.floor(capacity)+'px';dh=dialog.offsetHeight;
          place={left:Math.max(12,Math.min(w-dw-12,r.left)),top:above>=below?r.top-dh-14:r.bottom+14};
        }
      }
      if(place){left=place.left;top=place.top;}
      else if(state.mobile && r.top>h/2){top=10;}
      // Move scrollable content into the free portion of the viewport when the panel needs space.
      const overlap=left<r.right&&left+dw>r.left&&top<r.bottom&&top+dh>r.top;
      if(overlap && adjustScroll===true){
        let scroller=state.target.parentElement;
        while(scroller&&scroller!==document.body){if(scroller.scrollHeight>scroller.clientHeight+8 && /(auto|scroll)/.test(getComputedStyle(scroller).overflowY))break;scroller=scroller.parentElement;}
        if(scroller&&scroller!==document.body){
          const desired=top>h/2?Math.max(72,(top-Math.min(r.height,180))/2):top+dh+18;
          scroller.scrollTop+=r.top-desired;r=state.target.getBoundingClientRect();
        }
      }
    }
    dialog.style.left=Math.max(10,Math.min(w-dw-10,left))+'px';dialog.style.top=Math.max(10,Math.min(h-dh-10,top))+'px';
    const shades=[...document.querySelectorAll('.tour-shade')];
    if(!r){spot.classList.add('hidden');shades.forEach((el,i)=>Object.assign(el.style,{left:'0px',top:'0px',width:i?'0px':w+'px',height:i?'0px':h+'px'}));return;}
    const x=Math.max(0,r.left-5),y=Math.max(0,r.top-5),right=Math.min(w,r.right+5),bottom=Math.min(h,r.bottom+5);
    const boxes=[[0,0,w,y],[0,y,x,Math.max(0,bottom-y)],[right,y,w-right,Math.max(0,bottom-y)],[0,bottom,w,h-bottom]];
    shades.forEach((el,i)=>{const [sx,sy,sw,sh]=boxes[i];Object.assign(el.style,{left:sx+'px',top:sy+'px',width:Math.max(0,sw)+'px',height:Math.max(0,sh)+'px'});});
    Object.assign(spot.style,{left:x+'px',top:y+'px',width:Math.max(0,right-x)+'px',height:Math.max(0,bottom-y)+'px'});spot.classList.remove('hidden');
  }
  function next(){if(!state.active)return;const step=state.steps[state.index];if(step.action&&!step.optional&&state.target)return;advance();}
  async function advance(){state.history.push(state.index);if(state.index<state.steps.length-1){state.index++;await render();}}
  async function back(){if(state.index===0)return;
    const previous=state.index-1;
    if(state.contexts[previous])await restoreContext(state.contexts[previous]);
    state.index=previous;await render();
  }
  function stop(){save();state.restoreTargetStyle?.();state.restoreTargetStyle=null;state.active=false;++state.run;document.getElementById('modal-pet-onboarding').classList.add('hidden');showToast('Đã lưu chặng hướng dẫn. Mở lại từ Cài đặt để tiếp tục.','info');flushPreferences();}
  async function finish(){
    if(!state.active)return;state.active=false;++state.run;save(true);document.getElementById('modal-pet-onboarding').classList.add('hidden');
    try{const response=await fetch('/api/economy/onboarding-gift',{method:'POST',headers:{Authorization:'Bearer '+localStorage.getItem('tok_token')}});const result=await response.json();if(!result.success)throw Error(result.error?.message);
      showToast(result.data.alreadyClaimed?'Đã hoàn tất hướng dẫn. Chúc bạn học tốt!':'Hoàn tất hướng dẫn! Bạn nhận 20 Xu và 30 EXP.','success');await refreshUserData();await loadDailyQuests();
    }catch{showToast('Đã hoàn tất hướng dẫn. Chưa nhận được quà do kết nối; hãy thử lại khi có mạng.','error');}
    flushPreferences();
  }
  document.addEventListener('click',async event=>{
    if(!state.active||state.waiting||!state.target)return;
    const step=state.steps[state.index];if(!step.action||!state.target.contains(event.target))return;
    state.waiting=true;const run=state.run;state.pendingAction=run;
    await pause(100);
    if(step.repeat && step.expect && !step.expect()){state.waiting=false;document.getElementById('tour-action-hint').textContent='Tiếp tục thao tác trong vùng sáng. Hướng dẫn sẽ chuyển bước khi phần này hoàn tất.';layout();return;}
    if(step.expect){let ready=false;for(let n=0;n<200;n++){if(run!==state.run||!state.active)return;if(step.expect()){ready=true;break;}await pause(100);}if(!ready){state.waiting=false;document.getElementById('tour-action-hint').textContent='Thao tác chưa hoàn tất. Kiểm tra thông báo của ứng dụng rồi thử lại.';layout();return;}}
    if(run===state.run&&state.active)advance();
  },true);
  window.addEventListener('resize',()=>{if(state.active&&(innerWidth<768)!==state.mobile){stop();showToast('Bố cục đã đổi. Mở lại hướng dẫn phù hợp với kích thước màn hình mới.','info');}else layout();});
  document.addEventListener('scroll',event=>{
    if(document.getElementById('pet-tour-dialog').contains(event.target))return;
    requestAnimationFrame(()=>layout(false));
  },true);
  document.addEventListener('keydown',event=>{if(state.active&&event.key==='Escape')stop();});
  installDialog();
  window.startPetOnboardingTour=start;window.skipPetTour=stop;window.nextPetTourStep=next;window.prevPetTourStep=back;window.finishPetTour=finish;
  window.hasClaimedOnboardingGift=()=>Boolean(dailyQuestsState?.onboardingClaimed);
  window.GuidedTour={get active(){return state.active;},get target(){return state.target;},get step(){return state.steps[state.index]?.id;},get steps(){return state.steps.map(s=>({id:s.id,title:s.title,action:!!s.action,repeat:!!s.repeat}));}};
})();
