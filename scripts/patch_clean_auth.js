const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'public', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove subtitle in modal header
content = content.replace(
  /<h3 id="auth-modal-title" class="font-bold text-base sm:text-lg tracking-tight">Tạo tài khoản học tập<\/h3>\s*<p class="text-\[11px\] text-\[var\(--muted-foreground\)\]">Hỗ trợ tạo nhanh không cần Gmail hoặc 1 chạm Google<\/p>/,
  '<h3 id="auth-modal-title" class="font-bold text-base sm:text-lg tracking-tight">Tạo tài khoản</h3>'
);

// 2. Clean tab texts
content = content.replace('✨ Tạo tài khoản mới', 'Tạo tài khoản mới');
content = content.replace('🔑 Đăng nhập', 'Đăng nhập');

// 3. Clean divider
content = content.replace('HOẶC DÙNG TÊN ĐĂNG NHẬP (KHÔNG CẦN GMAIL)', 'HOẶC');

// 4. Clean username label & remove badge
content = content.replace(
  /<div class="flex items-center justify-between">\s*<label class="text-\[11px\] font-bold text-\[var\(--muted-foreground\)\]">Tên đăng nhập \(Username\)<\/label>\s*<span class="text-\[9px\] text-emerald-600 font-bold bg-emerald-500\/10 px-1\.5 py-0\.2 rounded">Không cần email<\/span>\s*<\/div>/,
  '<label class="text-[11px] font-bold text-[var(--muted-foreground)]">Tên đăng nhập hoặc Email</label>'
);

// 5. Clean placeholders
content = content.replace('placeholder="Ví dụ: hoctap2026, student99..."', 'placeholder="Nhập tên đăng nhập hoặc email..."');
content = content.replace('placeholder="Tối thiểu 4 ký tự..."', 'placeholder="Nhập mật khẩu..."');
content = content.replace('placeholder="Xác nhận lại mật khẩu..."', 'placeholder="Nhập lại mật khẩu..."');

// 6. Remove Tien loi box
content = content.replace(
  /\s*<div class="p-2\.5 rounded-xl bg-emerald-500\/10 border border-emerald-500\/20 text-\[11px\] text-emerald-700 dark:text-emerald-400">\s*💡 <strong>Tiện lợi:<\/strong>[\s\S]*?<\/div>/,
  ''
);

// 7. Clean submit button & toggle button
content = content.replace('🚀 Tạo tài khoản & Vào học ngay', 'Tạo tài khoản');
content = content.replace('Đã có tài khoản? <span class="font-bold underline">Đăng nhập ngay</span>', 'Đã có tài khoản? <span class="font-bold underline">Đăng nhập</span>');

// 8. In JS authTab
content = content.replace("if (title) title.textContent = 'Đăng nhập Tháp Tri Thức';", "if (title) title.textContent = 'Đăng nhập';");
content = content.replace("if (submitBtn) submitBtn.innerHTML = '🔑 Đăng nhập ngay';", "if (submitBtn) submitBtn.innerHTML = 'Đăng nhập';");
content = content.replace("if (toggleBtn) toggleBtn.innerHTML = 'Chưa có tài khoản? <span class=\"font-bold underline\">Tạo tài khoản mới</span>';", "if (toggleBtn) toggleBtn.innerHTML = 'Chưa có tài khoản? <span class=\"font-bold underline\">Tạo tài khoản</span>';");

content = content.replace("if (title) title.textContent = 'Tạo tài khoản học tập';", "if (title) title.textContent = 'Tạo tài khoản';");
content = content.replace("if (submitBtn) submitBtn.innerHTML = '🚀 Tạo tài khoản & Vào học ngay';", "if (submitBtn) submitBtn.innerHTML = 'Tạo tài khoản';");
content = content.replace("if (toggleBtn) toggleBtn.innerHTML = 'Đã có tài khoản? <span class=\"font-bold underline\">Đăng nhập ngay</span>';", "if (toggleBtn) toggleBtn.innerHTML = 'Đã có tài khoản? <span class=\"font-bold underline\">Đăng nhập</span>';");

// 9. Remove quickFillAdminLogin
content = content.replace(/function quickFillAdminLogin\(\)\s*\{[\s\S]*?\}\s*/, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched index.html');
