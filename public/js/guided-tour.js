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
    MULTIPLE_CHOICE: 'Chọn một đáp án rồi xem phản hồi.',
    FILL_BLANK: 'Chọn từ phù hợp để điền vào chỗ trống.',
    MATCHING: 'Chọn một mục bên trái rồi chọn mục tương ứng bên phải.',
    ORDERING: 'Chọn từng cụm từ theo thứ tự để tạo câu hoàn chỉnh.'
  };
  let tip = null;
  let tipKey = null;

  function close() {
    tip?.remove();
    tip = null;
    tipKey = null;
  }

  function progress() {
    return currentUserAccount?.tourProgress || {};
  }

  function save(context) {
    const account = currentUserAccount;
    account.tourProgress = {
      step: 'contextual-guide-v2', layout: innerWidth < 768 ? 'mobile' : 'desktop',
      completed: context.experience === 'experienced', context
    };
    queuePreferenceSave({ tutorial_progress: account.tourProgress });
  }

  function floating(title, message, actions) {
    close();
    const box = document.createElement('aside');
    box.className = 'companion-guide';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', title);
    const image = document.createElement('img');
    image.src = '/assets/sparky_idle.gif';
    image.alt = 'Sparky';
    image.width = 56;
    image.height = 56;
    const heading = document.createElement('strong');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = message;
    const buttons = document.createElement('div');
    actions.forEach(([label, action]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.onclick = action;
      buttons.append(button);
    });
    box.append(image, heading, text, buttons);
    document.body.append(box);
    tip = box;
    return box;
  }

  function chooseExperience() {
    if (!currentUserAccount?.userId) return;
    floating('Sparky làm quen', 'Bạn đã từng dùng Tháp Tri Thức chưa?', [
      ['Mình là người mới', () => {
        save({ ...progress().context, experience: 'new', guides: {} });
        close();
        view(currentAppView, true);
      }],
      ['Mình đã biết cách dùng', () => {
        save({ ...progress().context, experience: 'experienced' });
        close();
      }]
    ]);
  }

  function show(key, anchor, message, force = false) {
    if (!currentUserAccount?.userId || !anchor?.getClientRects().length || !message) return;
    if (tipKey === key && tip?.isConnected) return;
    const context = progress().context || {};
    if (!context.experience && !force) {
      if (!isUnboxingInProgress) chooseExperience();
      return;
    }
    const state = context.guides?.[key];
    if (!force && (context.experience === 'experienced' || state)) return;
    const mark = status => {
      const latest = progress().context || {};
      save({ ...latest, guides: { ...latest.guides, [key]: {
        status, at: new Date().toISOString()
      } } });
    };
    const accepted = () => {
      mark('started');
      floating('Cùng thử nhé', message, [
        ['Mình đã hiểu', () => { mark('completed'); close(); }],
        ['Để sau', () => { mark('deferred'); close(); }]
      ]);
      tipKey = key;
    };
    floating('Sparky đồng hành', 'Bạn có muốn mình hướng dẫn phần này không?', [
      ['Hướng dẫn mình', accepted],
      ['Bỏ qua phần này', () => { mark('skipped'); close(); }]
    ]);
    tipKey = key;
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

  window.GuidedTour = { view, question, close, chooseExperience, get active() { return Boolean(tip?.isConnected); } };
  window.startPetOnboardingTour = () => view(currentAppView, true);
  window.skipPetTour = close;
  window.nextPetTourStep = close;
  window.prevPetTourStep = close;
  window.finishPetTour = close;
  window.hasClaimedOnboardingGift = () => Boolean(dailyQuestsState?.onboardingClaimed);
})();
