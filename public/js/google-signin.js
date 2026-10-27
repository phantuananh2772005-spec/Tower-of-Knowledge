let googleIdentityAvailable=false;
let googleSdkPromise;
let googleDialog;
async function loadGoogleSdk(){
  if(window.google?.accounts?.id)return;
  if(!googleSdkPromise)googleSdkPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client?hl=vi';script.async=true;
    const timer=setTimeout(()=>reject(Error('Không tải được Google. Hãy kiểm tra kết nối hoặc dùng mật khẩu.')),12000);
    script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);reject(Error('Không tải được Google. Hãy dùng tên đăng nhập và mật khẩu.'));};
    document.head.appendChild(script);
  }).catch(error=>{googleSdkPromise=null;throw error;});
  return googleSdkPromise;
}
function closeGoogleDialog(){googleDialog?.remove();googleDialog=null;}
async function openGoogleDialog(mode='login'){
  if(!googleIdentityAvailable){showToast('Google chưa được cấu hình. Hãy dùng tên đăng nhập và mật khẩu.','info');return;}
  closeGoogleDialog();
  const dialog=document.createElement('div');googleDialog=dialog;dialog.id='modal-google-identity';
  dialog.className='fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60';
  dialog.innerHTML='<div role="dialog" aria-labelledby="google-dialog-title" class="bg-[var(--card)] border border-[var(--border)] rounded-3xl p-6 w-full max-w-sm space-y-4"><div class="flex items-center justify-between"><h3 id="google-dialog-title" class="font-bold text-base"></h3><button id="btn_close_google_identity" type="button" class="w-11 h-11 rounded-xl border border-[var(--border)]" aria-label="Đóng">×</button></div><p id="google-dialog-status" class="text-xs text-[var(--muted-foreground)]">Đang kết nối Google…</p><p class="text-xs text-[var(--muted-foreground)]">Google cung cấp tên và email để xác minh, liên kết tài khoản học tập. <a href="/privacy.html" target="_blank" rel="noopener" class="text-emerald-600 underline">Xem chính sách quyền riêng tư</a>.</p><div id="google-identity-button" class="flex justify-center"></div></div>';
  dialog.querySelector('h3').textContent=mode==='link'?'Liên kết tài khoản Google':'Đăng nhập bằng Google';
  dialog.querySelector('button').onclick=closeGoogleDialog;dialog.onclick=event=>{if(event.target===dialog)closeGoogleDialog();};document.body.appendChild(dialog);
  const status=dialog.querySelector('#google-dialog-status');
  try{
    const token=localStorage.getItem('tok_token');
    const response=await fetch('/api/auth/google/challenge?mode='+mode,{headers:mode==='link'?{Authorization:'Bearer '+token}:{}}),result=await response.json();
    if(!result.success)throw Error(result.error?.message||'Chưa mở được phiên Google.');
    await loadGoogleSdk();if(googleDialog!==dialog)return;
    const challenge=result.data;
    google.accounts.id.initialize({client_id:challenge.clientId,nonce:challenge.nonce,auto_select:false,callback:async credential=>{
      if(googleDialog!==dialog)return;
      status.textContent='Đang xác minh tài khoản…';
      try{
        if(mode==='link'&&token!==localStorage.getItem('tok_token'))throw Error('Tài khoản đã thay đổi. Hãy mở lại phần liên kết.');
        const response=await fetch('/api/auth/google'+(mode==='link'?'/link':''),{method:'POST',headers:{'Content-Type':'application/json',...(mode==='link'?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({credential:credential.credential,csrf:challenge.csrf})});
        const result=await response.json();if(!result.success)throw Error(result.error?.message||'Không xác thực được Google.');
        if(mode==='link'){
          if(token!==localStorage.getItem('tok_token'))return;
          applyUserData(result.data);renderGoogleAccountSettings();showToast('Đã lưu liên kết Google.','success');
        }else{
          clearUserDataAndUI();localStorage.setItem('tok_token',result.data.token);applyUserData(result.data.nguoi_dung);closeAuthModal(true);
          if(result.data.nguoi_dung.vai_tro==='QUAN_TRI_VIEN'){localStorage.setItem('tok_admin_token',result.data.token);location.href='/admin/';return;}
          navTo('hub');await reloadAllAccountData();showToast('Đã đăng nhập bằng tài khoản Google của bạn.','success');
        }
        closeGoogleDialog();
      }catch(error){status.textContent=error.message||'Xác thực chưa thành công. Hãy đóng và thử lại.';}
    }});
    google.accounts.id.renderButton(dialog.querySelector('#google-identity-button'),{theme:'outline',size:'large',locale:'vi',width:Math.min(320,innerWidth-100)});
    status.textContent=mode==='link'?'Chọn tài khoản Google bạn muốn liên kết.':'Chọn tài khoản của bạn trong cửa sổ Google để tiếp tục.';
  }catch(error){status.textContent=error.message||'Không kết nối được Google.';}
}
function renderGoogleAccountSettings(){
  const display=document.getElementById('auth-google-display-slot'),actions=document.getElementById('auth-google-action-slot');if(!display||!actions)return;
  display.replaceChildren();actions.replaceChildren();
  if(currentUserAccount.hasGoogleLinked){
    const email=document.createElement('span');email.className='text-xs break-all';email.textContent=currentUserAccount.googleEmail;display.appendChild(email);
    const unlink=document.createElement('button');unlink.id='btn_unlink_google_account';unlink.className='text-xs px-3 py-2 rounded-xl border border-[var(--border)]';unlink.textContent='Hủy liên kết';unlink.onclick=unlinkVerifiedGoogle;actions.appendChild(unlink);
  }else{
    const button=document.createElement('button');button.id='btn_link_google_account';button.className='text-xs font-bold text-emerald-600 py-2';
    button.textContent=googleIdentityAvailable?'Liên kết bằng Google':'Google chưa được cấu hình';button.disabled=!googleIdentityAvailable;button.onclick=()=>openGoogleDialog('link');display.appendChild(button);
  }
}
async function unlinkVerifiedGoogle(){
  if(!currentUserAccount.hasPassword){showToast('Hãy tạo mật khẩu trước khi hủy liên kết Google.','info');return;}
  if(!confirm('Hủy liên kết Google? Bạn vẫn có thể đăng nhập bằng mật khẩu.'))return;
  const token=localStorage.getItem('tok_token');
  try{const response=await fetch('/api/auth/google/link',{method:'DELETE',headers:{Authorization:'Bearer '+token}}),result=await response.json();
    if(!result.success)throw Error(result.error?.message||'Không hủy được liên kết.');
    if(token!==localStorage.getItem('tok_token'))return;applyUserData(result.data);renderGoogleAccountSettings();showToast('Đã hủy liên kết Google.','success');
  }catch(error){showToast(error.message||'Lỗi kết nối.','error');}
}
async function initGoogleAvailability(){
  try{const result=await(await fetch('/api/auth/config')).json();googleIdentityAvailable=Boolean(result.success&&result.data.googleClientId);}catch{googleIdentityAvailable=false;}
  const button=document.getElementById('btn_auth_google_login'),text=document.getElementById('auth-google-btn-text');
  if(button)button.disabled=!googleIdentityAvailable;
  if(text)text.textContent=googleIdentityAvailable?'Tiếp tục bằng tài khoản Google':'Google chưa được cấu hình · Dùng tài khoản bên dưới';
  if(typeof currentUserAccount!=='undefined')renderGoogleAccountSettings();
}
window.addEventListener('DOMContentLoaded',initGoogleAvailability);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&googleDialog)closeGoogleDialog();});
