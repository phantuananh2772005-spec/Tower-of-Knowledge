let preferenceTimer;
let pendingPreferences = {};
let preferenceUserId = null;
let preferenceQueue = Promise.resolve();
let preferenceSaving = false;

function queuePreferenceSave(changes) {
  const userId = currentUserAccount?.userId;
  if (!userId) return;
  if (preferenceUserId !== userId) pendingPreferences = {};
  preferenceUserId = userId;
  Object.assign(pendingPreferences, changes);
  clearTimeout(preferenceTimer);
  preferenceTimer = setTimeout(flushPreferences, 250);
}
function flushPreferences() {
  clearTimeout(preferenceTimer);
  if (preferenceSaving) return preferenceQueue;
  const changes = pendingPreferences;
  const token = localStorage.getItem('tok_token');
  const userId = preferenceUserId;
  pendingPreferences = {};
  if (!token || !Object.keys(changes).length) return preferenceQueue;
  preferenceSaving = true;
  preferenceQueue = (async () => {
    try {
      if (userId !== currentUserAccount?.userId || token !== localStorage.getItem('tok_token')) return;
      const response = await fetch('/api/auth/settings', {
        method:'PUT', headers:{'Content-Type':'application/json',Authorization:'Bearer '+token}, body:JSON.stringify(changes)
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error?.message || 'Không lưu được cài đặt.');
    } catch (error) { showToast('Chưa lưu được cài đặt. Kiểm tra kết nối và thử lại.', 'error'); }
    finally {
      preferenceSaving = false;
      if (Object.keys(pendingPreferences).length) return flushPreferences();
    }
  })();
  return preferenceQueue;
}
function applySavedPreferences(user) {
  window.applyingSavedPreferences = true;
  try {
    const saved = user.cai_dat_am_thanh;
    const defaults = {quiz:true,reward:true,battle:true,outcome:true,bgm:false};
    audioSettings = saved ? {...defaults,...saved} : Object.fromEntries(Object.entries(defaults).map(([key,value]) => [key, user.bat_am_thanh ? value : false]));
    localStorage.setItem('app-theme',user.che_do_giao_dien === 'SANG' ? 'light' : 'dark');
    document.documentElement.classList.toggle('dark',user.che_do_giao_dien !== 'SANG');
    syncAudioSummary();
  } finally { window.applyingSavedPreferences = false; }
}
function renderLevelProgress() {
  const info = LevelRules.progress(currentUserAccount?.exp);
  currentUserAccount.level = info.level;
  currentUserAccount.levelProgress = info;
  const label = document.getElementById('hub-level-label');
  if (label) label.textContent = `Cấp ${info.level} · ${info.label}`;
  const exp = document.getElementById('hub-exp-label');
  if (exp) exp.textContent = `${info.totalExp.toLocaleString('vi-VN')} EXP`;
  const bar = document.getElementById('hub-exp-bar');
  if (bar) bar.style.width = info.percent + '%';
  const next = document.getElementById('hub-next-level');
  if (next) next.textContent = info.nextExp ? `Còn ${info.remaining.toLocaleString('vi-VN')} EXP lên Cấp ${info.nextLevel} · Mốc ${info.nextExp.toLocaleString('vi-VN')} EXP` : 'Bạn đã đạt cấp cao nhất. Tiếp tục tích lũy EXP!';
  const sidebar = document.getElementById('sidebar-user-rank');
  if (sidebar) sidebar.textContent = `Cấp ${info.level} · ${info.icon} ${info.label}`;
}
window.addEventListener('resize', () => {
  if (typeof currentUserAccount === 'undefined') return;
  const admin = document.getElementById('btn-topbar-admin-portal');
  if (admin) admin.style.display = currentUserAccount?.vai_tro === 'QUAN_TRI_VIEN' && innerWidth >= 768 ? 'flex' : 'none';
});
document.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role="button"][tabindex="0"]')) {
    event.preventDefault(); event.target.click();
  }
});
