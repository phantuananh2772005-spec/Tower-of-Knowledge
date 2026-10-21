const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Google edit box in HTML
content = content.replace(
  /<div class="p-3 rounded-2xl bg-\[var\(--background\)\] border border-\[var\(--border\)\] flex items-center justify-between">[\s\S]*?<span class="text-\[10px\] uppercase font-bold text-\[var\(--muted-foreground\)\] block">Tài khoản GG<\/span>[\s\S]*?<div id="auth-google-action-slot">[\s\S]*?<\/div>\s*<\/div>/,
  `<div class="p-3 rounded-2xl bg-[var(--background)] border border-[var(--border)] space-y-2">
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] uppercase font-bold text-[var(--muted-foreground)] block">Tài khoản Google</span>
                  <div id="auth-google-display-slot" class="mt-0.5"></div>
                </div>
                <div id="auth-google-action-slot"></div>
              </div>
              <div id="edit-box-google" class="hidden pt-2 border-t border-[var(--border)] flex items-center gap-2">
                <input type="email" id="input-edit-google" placeholder="Nhập địa chỉ Gmail..." class="flex-1 px-2.5 py-1.5 bg-[var(--card)] border border-[var(--border)] rounded-lg text-xs font-mono focus:outline-none focus:border-emerald-500">
                <button onclick="saveEditGoogle()" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer">
                  Lưu
                </button>
              </div>
            </div>`
);

// 2. updateLinkedEmail
content = content.replace(/function updateLinkedEmail\(\)\s*\{[\s\S]*?\}\s*function unlinkGoogleAccount/, `function updateLinkedEmail() {
      const box = document.getElementById('edit-box-google');
      const input = document.getElementById('input-edit-google');
      if (input) input.value = currentUserAccount.email || '';
      if (box) box.classList.toggle('hidden');
    }

    function unlinkGoogleAccount`);

// 3. unlinkGoogleAccount
content = content.replace(/function unlinkGoogleAccount\(\)\s*\{[\s\S]*?\}\s*function linkGoogleAccount/, `function unlinkGoogleAccount() {
      currentUserAccount.hasGoogleLinked = false;
      currentUserAccount.email = '';
      renderAuthGoogleSlot();
      syncUserDataToUI();
      showToast('Đã hủy liên kết Google.');
    }

    function linkGoogleAccount`);

// 4. linkGoogleAccount
content = content.replace(/function linkGoogleAccount\(\)\s*\{[\s\S]*?\}\s*function logoutAndOpenAuth/, `function linkGoogleAccount() {
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
      showToast('✓ Đã cập nhật email liên kết thành công!');
    }

    function logoutAndOpenAuth`);

// 5. logoutAndOpenAuth
content = content.replace(/function logoutAndOpenAuth\(\)\s*\{[\s\S]*?\}\s*let currentAvatar/, `function logoutAndOpenAuth() {
      closeSettingsModal();
      localStorage.removeItem('tok_token');
      showToast('✓ Đã đăng xuất khỏi tài khoản.');
      setTimeout(() => {
        openAuthModal('login');
      }, 300);
    }

    let currentAvatar`);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched index.html with regex');
