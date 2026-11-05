(() => {
  const tips = {
    hub: ['#hub-welcome-title', 'Bấm “Bắt đầu học” để tiếp tục mốc đang mở. Nếu chưa có môn, chọn một môn trong Kho môn.'],
    catalog: ['#view-catalog', 'Chọn môn bạn muốn học, rồi mở lộ trình của môn đó.'],
    enrolled: ['#view-enrolled', 'Chọn môn đang học để quay về lộ trình.'],
    saga: ['.garden-intro', 'Bấm mốc đang mở để xem lý thuyết hoặc luyện tập.'],
    minigame: ['#arena-header-banner', 'Chọn chế độ thi đấu. Điểm hạng dành cho trận xếp hạng giữa hai người chơi thật.'],
    ranked: ['.arena-garden-controls', 'Chọn môn rồi bấm “Tìm trận đấu 1v1”.'],
    casual: ['#arena-casual', 'Chia sẻ mã phòng để mời bạn, hoặc nhập mã bạn nhận được để vào phòng.'],
    pet: ['#view-pet', 'Chọn Pet đã sở hữu rồi bấm mang theo để đổi bạn đồng hành.'],
    shop: ['#view-shop', 'Dùng Xu để mua Pet. Xem giá và điều kiện mở trước khi mua.'],
    settings: ['#settings-open-guide', 'Tại đây bạn có thể đổi giao diện, âm thanh và thông tin tài khoản.'],
    audio: ['#settings-view-audio', 'Đây là nơi bật hoặc tắt các hiệu ứng âm thanh trong hệ thống.']
  };
  const questions = {
    TRAC_NGHIEM_4: 'Chọn một đáp án rồi xem phản hồi.',
    DIEN_TU: 'Chọn từ phù hợp để điền vào chỗ trống.',
    NOI_CAP: 'Chọn một mục bên trái rồi chọn mục tương ứng bên phải.',
    SAP_XEP_CAU: 'Chọn từng cụm từ theo thứ tự để tạo câu hoàn chỉnh.'
  };
  let tip = null;
  let tipKey = null;

  function close() {
    tip?.remove();
    tip = null;
    tipKey = null;
  }

  function show(key, anchor, message, force = false) {
    const account = currentUserAccount;
    if (!account?.userId || !anchor?.getClientRects().length || !message) return;
    if (tipKey === key && tip?.isConnected) return;
    const progress = account.tourProgress;
    const storageKey = 'tok_feature_tips_v1_' + account.userId;
    let local = {};
    try { local = JSON.parse(localStorage.getItem(storageKey) || '{}') || {}; } catch {}
    const seen = { ...progress?.context?.featureTips, ...local };
    close();
    if (!force && (seen[key] || progress?.completed)) return;

    const box = document.createElement('aside');
    box.className = 'flex items-start gap-3 my-2 p-3 rounded-xl border text-xs leading-relaxed bg-[var(--card)] border-[var(--border)]';
    box.setAttribute('aria-label', 'Gợi ý sử dụng');
    const text = document.createElement('span');
    text.className = 'flex-1';
    text.textContent = message;
    const dismiss = document.createElement('button');
    dismiss.type = 'button';
    dismiss.className = 'shrink-0 font-semibold px-2 py-1 rounded border border-[var(--border)]';
    dismiss.textContent = 'Đã hiểu';
    dismiss.onclick = close;
    box.append(text, dismiss);
    if (anchor.id.startsWith('view-') || anchor.id === 'arena-casual' || anchor.id === 'settings-view-audio') anchor.prepend(box);
    else anchor.before(box);
    tip = box;
    tipKey = key;

    seen[key] = true;
    try { localStorage.setItem(storageKey, JSON.stringify(seen)); } catch {}
    account.tourProgress = {
      step: 'feature-tips', layout: innerWidth < 768 ? 'mobile' : 'desktop',
      completed: Boolean(progress?.completed), context: { featureTips: seen }
    };
    queuePreferenceSave({ tien_do_huong_dan: account.tourProgress });
  }

  function view(key, force = false) {
    const entry = tips[key];
    if (entry) show(key, document.querySelector(entry[0]), entry[1], force);
  }

  function question(type) {
    const anchor = document.querySelector('#play-practice-container:not(.hidden) #q-options-container')
      || document.getElementById('q-options-container');
    show('question-' + type, anchor, questions[type]);
  }

  window.GuidedTour = { view, question, close, get active() { return Boolean(tip?.isConnected); } };
  window.startPetOnboardingTour = () => view(currentAppView, true);
  window.skipPetTour = close;
  window.nextPetTourStep = close;
  window.prevPetTourStep = close;
  window.finishPetTour = close;
  window.hasClaimedOnboardingGift = () => Boolean(dailyQuestsState?.onboardingClaimed);
})();
