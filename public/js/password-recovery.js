(() => {
  let dialog;
  window.openPasswordRecovery = function () {
    if (dialog) return;
    const previousFocus=document.activeElement;
    const panel=document.createElement('div');dialog=panel;
    panel.id='modal-password-recovery';panel.className='fixed inset-0 z-[95] flex items-center justify-center p-3 bg-black/60';
    panel.innerHTML=`<section role="dialog" aria-modal="true" aria-labelledby="recovery-title" class="bg-[var(--card)] text-[var(--foreground)] border border-[var(--border)] rounded-2xl p-5 w-full max-w-sm max-h-[90dvh] overflow-y-auto space-y-4">
      <div class="flex justify-between items-center"><h2 id="recovery-title" class="font-bold">Quên mật khẩu</h2><button type="button" id="recovery-close" aria-label="Đóng" class="w-11 h-11">×</button></div>
      <p class="text-xs">Nhập tên đăng nhập để tìm tài khoản của bạn.</p>
      <form id="recovery-search" class="space-y-3"><label class="block text-xs">Tên đăng nhập<input id="recovery-username" autocomplete="username" required maxlength="100" class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label><button id="recovery-find" class="w-full p-3 rounded-xl bg-emerald-600 text-white">Tìm tài khoản</button></form>
      <div id="recovery-google-flow" hidden class="space-y-3"><p id="recovery-hint" class="text-xs break-all"></p><button id="recovery-google" type="button" class="w-full p-3 rounded-xl bg-emerald-600 text-white">Tiếp tục với Google</button><button id="recovery-back" type="button" class="w-full p-2 text-xs underline">Tìm tài khoản khác</button></div>
      <p id="recovery-verified" class="text-xs break-all" role="status"></p>
      <form id="recovery-form" class="space-y-3"><div id="recovery-password-flow" hidden class="space-y-3">
        <label class="block text-xs">Mật khẩu mới (ít nhất 8 ký tự)<input id="recovery-password" type="password" autocomplete="new-password" minlength="8" required class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label>
        <label class="block text-xs">Nhập lại mật khẩu mới<input id="recovery-confirm" type="password" autocomplete="new-password" minlength="8" required class="block w-full mt-1 p-3 rounded-xl border border-[var(--border)] bg-[var(--background)]"></label>
        <button id="recovery-submit" class="w-full p-3 rounded-xl bg-emerald-600 text-white">Lưu mật khẩu mới</button></div></form>
      <p id="recovery-status" role="status" aria-live="polite" class="text-xs"></p></section>`;
    const find=id=>panel.querySelector('#recovery-'+id);
    let lookupToken=null,recoveryToken=null,email=null,busy=false;
    const status=value=>find('status').textContent=value;
    function close(){window.removeEventListener('tok-google-recovery',verified);lookupToken=recoveryToken=null;panel.remove();dialog=null;previousFocus?.focus();}
    function verified(event){
      if(!lookupToken)return;
      recoveryToken=event.detail.recoveryToken;email=event.detail.email;
      find('google-flow').hidden=true;find('password-flow').hidden=false;
      find('verified').textContent='Xác minh thành công. Bạn có thể đặt mật khẩu mới.';
      status('');find('password').focus();
    }
    window.addEventListener('tok-google-recovery',verified);
    find('close').onclick=close;
    panel.addEventListener('keydown',event=>{
      if(event.key==='Escape')close();
      if(event.key==='Tab'){
        const items=[...panel.querySelectorAll('button,input')].filter(el=>!el.disabled&&el.getClientRects().length);
        if(event.shiftKey&&document.activeElement===items[0]){event.preventDefault();items.at(-1).focus();}
        else if(!event.shiftKey&&document.activeElement===items.at(-1)){event.preventDefault();items[0].focus();}
      }
    });
    async function post(action,body){const response=await fetch('/api/auth/password-recovery/'+action,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const result=await response.json();if(!response.ok||!result.success)throw Error(result.error?.message||'Chưa xử lý được yêu cầu.');return result.data;}
    async function run(action){if(busy)return;busy=true;find('find').disabled=find('submit').disabled=true;status('Đang xử lý…');try{await action();}catch(error){status(error.message||'Lỗi kết nối. Hãy thử lại.');}finally{busy=false;find('find').disabled=find('submit').disabled=false;}}
    find('search').onsubmit=event=>{event.preventDefault();run(async()=>{
      lookupToken=recoveryToken=null;
      const result=await post('lookup',{username:find('username').value});
      if(dialog!==panel)return;
      lookupToken=result.lookupToken;find('hint').textContent='Để đặt lại mật khẩu, hãy đăng nhập bằng tài khoản Google '+result.maskedEmail+'.';
      find('search').hidden=true;find('google-flow').hidden=false;status('');find('google').focus();
    });};
    find('google').onclick=()=>openGoogleDialog('recover',lookupToken);
    find('back').onclick=()=>{lookupToken=recoveryToken=null;find('google-flow').hidden=true;find('search').hidden=false;status('');find('username').focus();};
    find('form').onsubmit=event=>{event.preventDefault();if(!recoveryToken){status('Hãy xác minh bằng Google trước.');return;}if(find('password').value!==find('confirm').value){status('Hai mật khẩu chưa trùng nhau.');return;}run(async()=>{
      const result=await post('reset',{email,recovery_token:recoveryToken,password:find('password').value});
      find('password').value=find('confirm').value='';recoveryToken=lookupToken=null;find('password-flow').hidden=true;find('verified').textContent='';status(result.message);
      find('google-flow').hidden=false;find('hint').textContent='';find('back').hidden=true;find('google').textContent='Trở về đăng nhập';find('google').onclick=()=>{close();openAuthModal('login');};
      if(localStorage.getItem('tok_token')){clearUserDataAndUI();localStorage.removeItem('tok_token');localStorage.removeItem('tok_admin_token');}
    });};
    document.body.appendChild(panel);find('username').focus();
  };
})();

