(() => {
  let dialog, previousFocus;
  window.openPasswordRecovery = function () {
    if (dialog) return;
    previousFocus = document.activeElement;
    dialog = document.createElement('div');
    dialog.id = 'modal-password-recovery';
    dialog.className = 'fixed inset-0 z-[95] flex items-center justify-center p-3 bg-black/60';
    dialog.innerHTML = `<section role="dialog" aria-modal="true" aria-labelledby="recovery-title" class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-5 w-full max-w-sm max-h-[90dvh] overflow-y-auto space-y-4">
      <div class="flex justify-between items-center"><h2 id="recovery-title" class="font-bold">Lấy lại mật khẩu</h2><button type="button" id="recovery-close" aria-label="Đóng" class="w-11 h-11">×</button></div>
      <p class="text-xs">Chỉ áp dụng cho tài khoản đã đăng ký và liên kết email Google. Email nhập lúc đăng ký mà chưa liên kết Google chưa đủ điều kiện. Bạn cũng có thể đăng nhập trực tiếp bằng Google đã liên kết.</p>
      <button id="recovery-google" type="button" class="w-full p-3 rounded-xl bg-emerald-600 text-white">1. Xác minh bằng Google đã liên kết</button>
      <p id="recovery-verified" class="text-xs" role="status"></p>
      <form id="recovery-form" class="space-y-3">
        <div id="recovery-email-flow" hidden>
        <label class="block text-xs">Email Google đã liên kết<input id="recovery-email" type="email" autocomplete="email" maxlength="255" required class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label>
        <button id="recovery-send" type="button" class="w-full p-3 rounded-xl border border-emerald-500 text-emerald-600">Gửi mã khôi phục</button>
        <label class="block text-xs">Mã 6 chữ số<input id="recovery-code" type="text" inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]{6}" maxlength="6" required class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label>
        </div>
        <div id="recovery-password-flow" hidden class="space-y-3">
        <label class="block text-xs">Mật khẩu mới (ít nhất 8 ký tự)<input id="recovery-password" type="password" autocomplete="new-password" minlength="8" required class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label>
        <label class="block text-xs">Nhập lại mật khẩu mới<input id="recovery-confirm" type="password" autocomplete="new-password" minlength="8" required class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label>
        <button id="recovery-submit" class="w-full p-3 rounded-xl bg-emerald-600 text-white" type="submit">2. Đặt lại mật khẩu</button>
        </div>
        <p id="recovery-status" role="status" aria-live="polite" class="text-xs"></p>
      </form></section>`;
    const activeDialog = dialog;
    const find = id => activeDialog.querySelector('#recovery-' + id);
    let busy = false, resendAt = 0, recoveryToken = null, verifiedEmail = null;
    const status = message => { find('status').textContent = message; };
    const close = () => { window.removeEventListener('tok-google-recovery',onGoogleProof); recoveryToken=null;dialog?.remove(); dialog = null; previousFocus?.focus(); };
    function onGoogleProof(event) {
      recoveryToken=event.detail.recoveryToken;verifiedEmail=event.detail.email;
      find('email-flow').hidden=true;find('email').required=find('code').required=false;
      find('verified').textContent='Đã xác minh '+verifiedEmail+'. Nhập mật khẩu mới trong vòng 10 phút.';
      find('password-flow').hidden=false;status('');find('password').focus();
    }
    window.addEventListener('tok-google-recovery',onGoogleProof);
    find('google').onclick=()=>window.openGoogleDialog('recover');
    find('email').required=find('code').required=false;
    fetch('/api/auth/config').then(response=>response.json()).then(result=>{
      if(dialog!==activeDialog)return;
      find('google').disabled=!result.data?.googleClientId;
      if(result.data?.passwordRecoveryEmail){
        find('email-flow').hidden=false;find('email').required=find('code').required=true;
      }
    }).catch(()=>status('Chưa tải được cấu hình. Hãy đóng và mở lại.'));
    find('close').onclick = close;
    activeDialog.addEventListener('keydown', event => {
      if (event.key === 'Escape') close();
      if (event.key === 'Tab') {
        const items = [...activeDialog.querySelectorAll('button,input')].filter(item=>!item.disabled);
        if (event.shiftKey && document.activeElement === items[0]) {event.preventDefault();items.at(-1).focus();}
        else if (!event.shiftKey && document.activeElement === items.at(-1)) {event.preventDefault();items[0].focus();}
      }
    });
    async function post(action, body) {
      const response = await fetch('/api/auth/password-recovery/' + action, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok || !result.success) throw Error(result.error?.message || 'Chưa xử lý được yêu cầu. Hãy thử lại.');
      return result.data;
    }
    async function run(action) {
      if (busy) return;
      busy = true; find('send').disabled = find('submit').disabled = true;
      status('Đang xử lý…');
      try { await action(); } catch (error) { status(error.message || 'Lỗi kết nối. Hãy thử lại.'); }
      finally {busy=false;find('send').disabled=find('submit').disabled=false;}
    }
    find('send').onclick = () => {
      if (!find('email').reportValidity()) return;
      if (Date.now()<resendAt) {status('Đợi ít nhất 60 giây trước khi yêu cầu mã khác.');return;}
      run(async()=>{const result=await post('request',{email:find('email').value});resendAt=Date.now()+60000;recoveryToken=null;verifiedEmail=null;find('password-flow').hidden=false;status(result.message);find('code').focus();});
    };
    find('form').onsubmit = event => {
      event.preventDefault();
      if (find('password').value!==find('confirm').value) {status('Hai mật khẩu chưa trùng nhau.');return;}
      run(async()=>{
        const result=await post('reset',{email:recoveryToken?verifiedEmail:find('email').value,...(recoveryToken?{recovery_token:recoveryToken}:{code:find('code').value}),password:find('password').value});
        find('password').value=find('confirm').value=find('code').value='';
        status(result.message);
        recoveryToken=null;find('password-flow').hidden=true;
        find('verified').textContent='';find('email-flow').hidden=true;
        find('google').textContent='Trở về đăng nhập';find('google').disabled=false;
        find('google').onclick=()=>{close();openAuthModal('login');};
        if(localStorage.getItem('tok_token')){clearUserDataAndUI();localStorage.removeItem('tok_token');localStorage.removeItem('tok_admin_token');}
      });
    };
    document.body.appendChild(activeDialog); find('google').focus();
  };
})();
