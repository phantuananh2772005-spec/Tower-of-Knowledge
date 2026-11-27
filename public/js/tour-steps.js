(() => {
  const step = (target, text, clickable = false) => ({ target: ['minigame','pet'].includes(target) ? '[data-tour="' + target + '"], [data-tour="mobile-' + target + '"]' : '[data-tour="' + target + '"]', text, clickable });
  window.SparkyTourSteps = {
    home: { view: 'hub', steps: [
      step('level', 'Đây là cấp và EXP của bạn. Học và thi đấu để lên cấp nhé!'),
      step('quests', 'Mỗi ngày có ba nhiệm vụ nhỏ. Hoàn thành rồi nhận Xu tại đây.'),
      step('coins', 'Xu của bạn ở đây. Dùng Xu chăm Pet và mua đồ ở Cửa hàng.'),
      step('catalog', 'Mở Kho môn để chọn môn học đầu tiên nhé.', true)
    ] },
    kho: { view: 'catalog', steps: [
      step('enroll', 'Chọn môn bạn muốn học rồi bấm Đăng ký. Thao tác này đăng ký môn thật.', true),
      step('minigame', 'Tiếp theo mình xem các chế độ thi đấu nhé.', true)
    ] },
    mini: { view: 'minigame', steps: [
      step('casual', 'Đấu thường cho phép luyện với Bot hoặc chơi cùng bạn bè.'),
      step('extreme', 'Cực Hạn là chế độ chơi một mình với năm mạng.'),
      step('ranked', 'Đấu hạng dành cho thi đấu xếp hạng với người chơi thật.'),
      step('leaderboard', 'Bảng xếp hạng hiển thị thành tích trong mùa.'),
      step('pet', 'Giờ ghé thăm bạn đồng hành của bạn nhé.', true)
    ] },
    pet: { view: 'pet', steps: [
      step('feed', 'Cho Pet ăn tốn 10 Xu.'),
      step('stroke', 'Vuốt ve Pet miễn phí.'),
      step('shop', 'Qua Cửa hàng để xem các bạn đồng hành khác.', true)
    ] },
    shop: { view: 'shop', steps: [
      step('shop-pet', 'Xem giá, cấp yêu cầu và ảnh Pet trước khi quyết định mua.'),
      step('settings', 'Bạn có thể mở lại hướng dẫn từ Cài đặt.', true)
    ] },
    set: { view: 'settings', steps: [
      step('replay', 'Chọn Hướng dẫn cùng Pet khi muốn xem lại từ đầu.')
    ] }
  };
})();
