const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Sidebar default display name from "Đang tải..." to "Chưa đăng nhập"
content = content.replace(
  /<span class="user-display-name font-bold text-xs tracking-tight block leading-tight text-\[var\(--foreground\)\] group-hover:text-emerald-600 transition truncate">\s*Đang tải\.\.\.\s*<\/span>/,
  '<span class="user-display-name font-bold text-xs tracking-tight block leading-tight text-[var(--foreground)] group-hover:text-emerald-600 transition truncate">\n              Chưa đăng nhập\n            </span>'
);

// 2. Arena BXH button: remove <span>BXH</span> so it's only the trophy icon
content = content.replace(
  /<button onclick="arenaTab\('rank'\)" class="([^"]*?)" title="Bảng xếp hạng đấu trường">\s*<span class="text-base group-hover:scale-110 transition-transform">🏆<\/span>\s*<span class="text-xs font-bold text-\[var\(--foreground\)\] hidden sm:inline">BXH<\/span>\s*<\/button>/,
  '<button onclick="arenaTab(\'rank\')" class="$1 flex items-center justify-center" title="Bảng xếp hạng đấu trường">\n            <span class="text-base group-hover:scale-110 transition-transform">🏆</span>\n          </button>'
);

// 3. Arena default tier HTML
content = content.replace(
  /<p id="lobby-sub-tier" class="font-bold text-amber-600"><\/p>\s*<p id="lobby-sub-pts" class="font-mono font-bold text-base"><\/p>/,
  '<p id="lobby-sub-tier" class="font-bold text-amber-600">🌱 Khởi nguyên I</p>\n              <p id="lobby-sub-pts" class="font-mono font-bold text-base">0 điểm</p>'
);
content = content.replace(
  /<p id="lobby-all-tier" class="font-bold text-amber-600"><\/p>\s*<p id="lobby-all-pts" class="font-mono font-bold text-base"><\/p>/,
  '<p id="lobby-all-tier" class="font-bold text-amber-600">🌱 Khởi nguyên I</p>\n              <p id="lobby-all-pts" class="font-mono font-bold text-base">0 điểm</p>'
);

// 4. Settings: inline Google edit box instead of prompt()
const oldGgBox = `<div class="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] flex items-center justify-between">
              <div>
                <span class="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Tài khoản GG</span>
                <div id="auth-google-display-slot" class="mt-0.5">
                  <!-- Render động qua renderAuthGoogleSlot() -->
                </div>
              </div>
              <div id="auth-google-action-slot">
                <!-- Render động qua renderAuthGoogleSlot() -->
              </div>
            </div>`;

const newGgBox = `<div class="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Tài khoản Google</span>
                  <div id="auth-google-display-slot" class="mt-0.5">
                    <!-- Render động qua renderAuthGoogleSlot() -->
                  </div>
                </div>
                <div id="auth-google-action-slot">
                  <!-- Render động qua renderAuthGoogleSlot() -->
                </div>
              </div>
              <!-- Hộp sửa / liên kết Gmail ẩn -->
              <div id="edit-box-google" class="hidden pt-2 border-t border-[var(--border)] flex items-center gap-2">
                <input type="email" id="input-edit-google" placeholder="Nhập địa chỉ Gmail..." class="flex-1 px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500">
                <button onclick="saveEditGoogle()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer">
                  Lưu
                </button>
              </div>
            </div>`;

content = content.replace(oldGgBox, newGgBox);

// 5. Replace prompt & confirm in Settings JS
const oldSettingsAuthJs = `    function updateLinkedEmail() {
      const newEmail = prompt('Nhập địa chỉ Gmail mới để liên kết:', currentUserAccount.email || 'hocvien@gmail.com');
      if (newEmail !== null) {
        const trimmed = newEmail.trim();
        if (!trimmed.includes('@')) {
          showToast('Địa chỉ email không hợp lệ!', 'error');
          return;
        }
        currentUserAccount.email = trimmed;
        currentUserAccount.hasGoogleLinked = true;
        renderAuthGoogleSlot();
        syncUserDataToUI();
        showToast('Đã cập nhật Gmail liên kết thành công!');
      }
    }

    function unlinkGoogleAccount() {
      if (confirm('Bạn có chắc chắn muốn hủy liên kết Google? Bạn vẫn có thể đăng nhập bằng Tên đăng nhập & Mật khẩu.')) {
        currentUserAccount.hasGoogleLinked = false;
        currentUserAccount.email = '';
        renderAuthGoogleSlot();
        syncUserDataToUI();
        showToast('Đã hủy liên kết Google.');
      }
    }

    function linkGoogleAccount() {
      const email = prompt('Nhập địa chỉ Gmail để liên kết tài khoản:', 'hocvien@gmail.com');
      if (email && email.trim() && email.includes('@')) {
        currentUserAccount.hasGoogleLinked = true;
        currentUserAccount.email = email.trim();
        renderAuthGoogleSlot();
        syncUserDataToUI();
        showToast('✓ Đã liên kết tài khoản Google thành công!');
      }
    }

    function logoutAndOpenAuth() {
      if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi tài khoản hiện tại?')) {
        closeSettingsModal();
        showToast('Đã đăng xuất.');
        setTimeout(() => {
          openAuthModal('login');
        }, 300);
      }
    }`;

const newSettingsAuthJs = `    function updateLinkedEmail() {
      const box = document.getElementById('edit-box-google');
      const input = document.getElementById('input-edit-google');
      if (input) input.value = currentUserAccount.email || '';
      if (box) box.classList.toggle('hidden');
    }

    function unlinkGoogleAccount() {
      currentUserAccount.hasGoogleLinked = false;
      currentUserAccount.email = '';
      renderAuthGoogleSlot();
      syncUserDataToUI();
      showToast('Đã hủy liên kết Google.');
    }

    function linkGoogleAccount() {
      const box = document.getElementById('edit-box-google');
      const input = document.getElementById('input-edit-google');
      if (input) input.value = '';
      if (box) box.classList.toggle('hidden');
    }

    function saveEditGoogle() {
      const input = document.getElementById('input-edit-google');
      const email = input ? input.value.trim() : '';
      if (!email || !email.includes('@')) {
        showToast('Địa chỉ email không hợp lệ!', 'error');
        return;
      }
      currentUserAccount.hasGoogleLinked = true;
      currentUserAccount.email = email;
      const box = document.getElementById('edit-box-google');
      if (box) box.classList.add('hidden');
      renderAuthGoogleSlot();
      syncUserDataToUI();
      showToast('✓ Đã cập nhật Gmail liên kết thành công!');
    }

    function logoutAndOpenAuth() {
      closeSettingsModal();
      localStorage.removeItem('tok_token');
      showToast('✓ Đã đăng xuất khỏi tài khoản.');
      setTimeout(() => {
        openAuthModal('login');
      }, 300);
    }`;

content = content.replace(oldSettingsAuthJs, newSettingsAuthJs);

// 6. Streak fallback in syncUserDataToUI (: 5 -> : 0) and sync sidebar rank
content = content.replace(
  "if (streakEl) streakEl.textContent = '🔥 ' + (typeof userStreak !== 'undefined' ? userStreak : 5);",
  "if (streakEl) streakEl.textContent = '🔥 ' + (typeof userStreak !== 'undefined' ? userStreak : 0);\n      const rankEl = document.getElementById('sidebar-user-rank');\n      if (rankEl) rankEl.textContent = currentUserAccount.rankTitle || '🌱 Khởi nguyên I';"
);

// 7. Global alert override to showToast
content = content.replace(
  "function showToast(message, type = 'success') {",
  "window.alert = function(msg) { if (typeof showToast === 'function') showToast(msg); };\n    function showToast(message, type = 'success') {"
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched arena, settings, and sidebar in index.html');
