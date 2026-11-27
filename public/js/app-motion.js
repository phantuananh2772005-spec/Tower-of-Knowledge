(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const progressSelector = '#hub-exp-bar,[id^="quest-progress-"][id$="-bar"],#pet-mood-bar,#res-exp-bar,#res-sub-bar,#res-all-bar,.garden-course-progress>span,#enrolled-courses-grid .h-full[style*="width"],.journey-course-progress [role="progressbar"]>i';
  const numberSelector = '.user-coins-val,#lobby-sub-pts,#lobby-all-pts,#profile-rank-pts,#profile-stat-coins';
  const numberValues = new WeakMap(), progressFrames = new Map(), tabKeys = new Map();
  let pill, nav, pillGeometry = null, pillFrame = 0, pillTargetId = 'nav-hub', pageKey;
  const visible = el => el?.isConnected && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden';
  const restart = (el, name) => {
    if (!el || reduced.matches || !visible(el)) return;
    el.classList.remove(name); void el.offsetWidth; el.classList.add(name);
  };
  function targetGeometry() {
    const target = window.SidebarNavigation?.pillTarget() || document.getElementById(pillTargetId);
    if (!nav || !visible(target)) return null;
    const n = nav.getBoundingClientRect(), t = target.getBoundingClientRect();
    return {x:t.left-n.left+nav.scrollLeft,y:t.top-n.top+nav.scrollTop,w:t.width,h:t.height};
  }
  function movePill(animate = false) {
    cancelAnimationFrame(pillFrame);pillFrame = 0;
    if (!pill) return;
    const from = pillGeometry, start = performance.now();
    const duration = animate && from && !reduced.matches ? 460 : 0;
    const frame = now => {
      const target = targetGeometry(); // Read live geometry during every layout frame.
      if (!target) { pill.hidden = true;pillFrame = 0; return; }
      pill.hidden = false;
      const k = duration ? Math.min(1,(now-start)/duration) : 1;
      const ease = k < .5 ? 4*k*k*k : 1-Math.pow(-2*k+2,3)/2;
      const initial = from || target;
      pillGeometry = Object.fromEntries(['x','y','w','h'].map(key=>[key,initial[key]+(target[key]-initial[key])*ease]));
      pill.style.width = pillGeometry.w+'px';pill.style.height = pillGeometry.h+'px';
      pill.style.transform = `translate(${pillGeometry.x}px,${pillGeometry.y}px)`;
      pillFrame = k < 1 ? requestAnimationFrame(frame) : 0;
    };
    pillFrame = requestAnimationFrame(frame);
  }
  function animateProgress(root) {
    if (!root || reduced.matches) return;
    root.querySelectorAll(progressSelector).forEach(el => {
      if (!visible(el)) return;
      cancelAnimationFrame(progressFrames.get(el));
      // Keep the actual inline value untouched, including updates arriving
      // during these two frames. Only its initial presentation is zeroed.
      el.classList.add('tt-motion-progress-from'); void el.offsetWidth;
      progressFrames.set(el,requestAnimationFrame(()=>{
        progressFrames.set(el,requestAnimationFrame(()=>{
          el.classList.remove('tt-motion-progress-from');progressFrames.delete(el);
        }));
      }));
    });
  }
  function enterPage(el, key) {
    if (!el || !visible(el)) return;
    const navKey = ['battle','extreme'].includes(key) ? 'minigame' : key;
    pillTargetId = 'nav-'+navKey;
    if(!window.SidebarNavigation)nav?.querySelectorAll('button[id^="nav-"]').forEach(button=>{
      if(button.id===pillTargetId)button.setAttribute('aria-current','page');
      else button.removeAttribute('aria-current');
    });
    const target = targetGeometry();
    const moved = target && pillGeometry && ['x','y','w','h'].some(axis=>Math.abs(target[axis]-pillGeometry[axis])>1);
    movePill(pageKey !== undefined && (pageKey !== key || moved));
    if(pageKey === key)return;
    pageKey = key;
    // The learning map intentionally returns to the active node in navTo.
    // Preserve that existing focus behavior instead of resetting its scroll.
    if(key !== 'saga')document.getElementById('app-main-scroll')?.scrollTo({top:0,behavior:'instant'});
    restart(el,'tt-motion-enter');animateProgress(el);
  }
  function enterTab(group, key, el) {
    if(!el || !visible(el) || tabKeys.get(group)===key)return;
    tabKeys.set(group,key);
    // A page entry already animates this subtree; do not double its movement.
    const page = el.closest('[id^="view-"]');
    if(page && page.id !== 'view-'+pageKey)return;
    if(el.classList.contains('tt-motion-enter'))return;
    restart(el,'tt-motion-enter');animateProgress(el);
  }
  function sidebar() {
    movePill(true);
  }
  function trackNumber(el) {
    const value = el.textContent.trim(), previous = numberValues.get(el);
    numberValues.set(el,value);
    if(previous !== undefined && previous !== value && /\d/.test(value))restart(el,'tt-motion-bump');
  }
  function init() {
    document.documentElement.classList.add('tt-motion-ready');
    nav = document.querySelector('#app-sidebar nav');
    if(nav){
      pill = document.createElement('div');pill.id = 'tt-nav-pill';pill.setAttribute('aria-hidden','true');
      nav.prepend(pill);movePill();
      new ResizeObserver(()=>{if(!pillFrame)movePill()}).observe(nav);
    }
    document.querySelectorAll(numberSelector).forEach(trackNumber);
    new MutationObserver(records=>{
      const changed = new Set();
      for(const record of records){
        const el = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
        const number = el?.closest(numberSelector);if(number)changed.add(number);
        record.addedNodes.forEach(node=>{
          if(node.nodeType!==Node.ELEMENT_NODE)return;
          if(node.matches(numberSelector))changed.add(node);
          node.querySelectorAll(numberSelector).forEach(el=>changed.add(el));
        });
      }
      changed.forEach(trackNumber);
    }).observe(document.body,{subtree:true,childList:true,characterData:true});
    document.addEventListener('animationend',event=>{
      if(event.animationName==='tt-motion-number')event.target.classList.remove('tt-motion-bump');
      if(event.animationName==='tt-motion-view-in')event.target.classList.remove('tt-motion-enter');
    });
    window.addEventListener('resize',()=>movePill());
    reduced.addEventListener('change',()=>{
      cancelAnimationFrame(pillFrame);movePill();
      progressFrames.forEach((frame,el)=>{cancelAnimationFrame(frame);el.classList.remove('tt-motion-progress-from')});
      progressFrames.clear();
      document.querySelectorAll('.tt-motion-enter,.tt-motion-bump').forEach(el=>el.classList.remove('tt-motion-enter','tt-motion-bump'));
    });
    const current = [...document.querySelectorAll('#app-main-scroll>section[id^="view-"]')].find(visible);
    if(current)enterPage(current,current.id.slice(5));
  }
  window.AppMotion = {enterPage,enterTab,sidebar,movePill,animateProgress};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
