(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const groupIds={courses:'sidebar-courses-group',shop:'sidebar-shop-group'};
  let activeView='hub',courseFilter='all',shopSection='shop-pets',openGroup=null;
  let requestedFilter=null,requestedAnchor=null;
  let spy=null,spyResize=null,readyObserver=null,readyTimer=0,jumpRevision=0;
  let locked=false,lockTimer=0,scrollEnd=null;
  const root=()=>document.getElementById('app-main-scroll');
  const shop=()=>document.getElementById('view-shop');
  function setGroup(group){
    if(document.getElementById('app-sidebar').classList.contains('collapsed'))return;
    openGroup=group;
    const sidebar=document.getElementById('app-sidebar');
    if(group)sidebar.dataset.sidebarGroup=group;else delete sidebar.dataset.sidebarGroup;
    for(const [name,id] of Object.entries(groupIds)){
      const el=document.getElementById(id),opened=name===group;
      el.classList.toggle('is-open',opened);el.setAttribute('aria-hidden',String(!opened));
      el.firstElementChild.inert=!opened;
      document.getElementById(name==='courses'?'nav-catalog':'nav-shop').setAttribute('aria-expanded',String(opened));
    }
  }
  function pillTarget(){
    if(activeView==='enrolled'||activeView==='catalog'){
      if(openGroup==='courses')return document.getElementById(activeView==='catalog'?'nav-all-courses':courseFilter==='completed'?'nav-completed-courses':'nav-enrolled');
      return document.getElementById('nav-catalog');
    }
    if(activeView==='shop')return document.getElementById(openGroup==='shop'?(shopSection==='shop-accessories'?'nav-shop-items':'nav-shop-pets'):'nav-shop');
    return document.getElementById('nav-'+(['battle','extreme'].includes(activeView)?'minigame':activeView));
  }
  function syncMenu(){
    const target=pillTarget();
    document.querySelectorAll('#app-sidebar nav button').forEach(button=>{
      const active=button===target;button.classList.toggle('tt-sidebar-active',active);
      if(active)button.setAttribute('aria-current','page');else button.removeAttribute('aria-current');
    });
  }
  function toggle(group){
    if(document.getElementById('app-sidebar').classList.contains('collapsed'))return;
    if(openGroup===group){setGroup(null);syncMenu();window.AppMotion?.movePill(true);return;}
    setGroup(group);
    if(group==='courses')openCourses('all');else openShop('shop-pets');
  }
  function openCourses(filter){
    requestedFilter=filter==='completed'?'completed':'all';
    setGroup('courses');
    navTo(filter==='catalog'?'catalog':'enrolled');
  }
  function selectShop(id){
    shopSection=id;syncMenu();window.AppMotion?.movePill(true);
  }
  function clearReady(){clearTimeout(readyTimer);readyObserver?.disconnect();readyObserver=null;}
  function releaseLock(){
    locked=false;clearTimeout(lockTimer);
    if(scrollEnd)root().removeEventListener('scrollend',scrollEnd);scrollEnd=null;
  }
  function teardownShop(){
    jumpRevision++;clearReady();releaseLock();
    spy?.disconnect();spy=null;spyResize?.disconnect();spyResize=null;
    root()?.classList.remove('tt-shop-anchors');
  }
  function updateTail(){
    const section=document.getElementById('shop-accessories');
    shop().style.setProperty('--shop-anchor-tail',Math.max(0,root().clientHeight*.6-section.offsetHeight*.5)+'px');
  }
  function attachSpy(){
    teardownShop();root().classList.add('tt-shop-anchors');updateTail();
    const rebuild=()=>{
      if(activeView!=='shop')return;
      updateTail();spy?.disconnect();
      // W3C resolves rootMargin percentages against root WIDTH. Convert the
      // requested 35%/55% vertical reading band to pixels so wide screens work.
      const height=root().clientHeight;
      const intersecting=new Set();
      spy=new IntersectionObserver(entries=>{
        entries.forEach(entry=>{if(entry.isIntersecting)intersecting.add(entry.target);else intersecting.delete(entry.target)});
        if(locked||activeView!=='shop')return;
        // A tall pets section can stay intersecting throughout a jump. Keep its
        // previous entry, since a later callback may contain only items leaving.
        const line=root().getBoundingClientRect().top+height*.4;
        const distance=el=>{const r=el.getBoundingClientRect();return r.top>line?r.top-line:line>r.bottom?line-r.bottom:0};
        const section=[...intersecting].sort((a,b)=>distance(a)-distance(b))[0];
        if(section)selectShop(section.id);
      },{root:root(),rootMargin:`-${height*.35}px 0px -${height*.55}px 0px`,threshold:0});
      shop().querySelectorAll('[data-section]').forEach(section=>spy.observe(section));
    };
    rebuild();
    let width=root().clientWidth,height=root().clientHeight;
    spyResize=new ResizeObserver(()=>{
      if(activeView!=='shop')return;
      updateTail();
      if(width!==root().clientWidth||height!==root().clientHeight){width=root().clientWidth;height=root().clientHeight;rebuild();}
    });
    spyResize.observe(root());shop().querySelectorAll('[data-section]').forEach(section=>spyResize.observe(section));
  }
  function jumpTo(id){
    clearReady();const revision=++jumpRevision;let waiting=false,scheduled=false;
    releaseLock();locked=true;
    selectShop(id);
    const run=()=>{
      if(revision!==jumpRevision||activeView!=='shop')return;
      if(waiting||scheduled)return;
      const el=document.getElementById(id),grid=el?.querySelector('#shop-pets-grid,#shop-items-grid');
      if(!el||!grid?.childElementCount)return;
      const entering=shop().getAnimations().filter(animation=>animation.animationName==='tt-motion-view-in'&&animation.playState==='running');
      if(entering.length){waiting=true;Promise.allSettled(entering.map(animation=>animation.finished)).then(()=>{waiting=false;run()});return;}
      clearReady();updateTail();scheduled=true;
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(revision!==jumpRevision||activeView!=='shop')return;
        releaseLock();locked=true;
        selectShop(id);
        scrollEnd=()=>releaseLock();root().addEventListener('scrollend',scrollEnd,{once:true});
        const box=root().getBoundingClientRect(),rect=el.getBoundingClientRect();
        const tall=id==='shop-pets'||rect.height>root().clientHeight*.9;
        const inset=tall?parseFloat(getComputedStyle(el).scrollMarginTop)||18:(root().clientHeight-rect.height)/2;
        const top=Math.max(0,Math.min(root().scrollHeight-root().clientHeight,root().scrollTop+rect.top-box.top-inset));
        const started=performance.now();
        const fallback=()=>{
          if(Math.abs(root().scrollTop-top)>2&&performance.now()-started<1800)lockTimer=setTimeout(fallback,100);
          else releaseLock();
        };
        lockTimer=setTimeout(fallback,700);
        root().scrollTo({top,behavior:reduced.matches?'auto':'smooth'});
      }));
    };
    readyObserver=new MutationObserver(run);
    readyObserver.observe(shop(),{subtree:true,childList:true});
    // Keep waiting for genuine rendered products if the network is slow. The
    // readiness observer is cancelled by another jump or by leaving Shop.
    readyTimer=setTimeout(releaseLock,700);
    run();
  }
  function openShop(id){
    requestedAnchor=id;setGroup('shop');
    if(activeView!=='shop')navTo('shop');
    else{requestedAnchor=null;jumpTo(id);}
  }
  function view(viewName){
    const previous=activeView;activeView=viewName;
    if(viewName!=='shop'){requestedAnchor=null;teardownShop();}
    if(viewName!=='enrolled')requestedFilter=null;
    if(viewName==='enrolled'){
      const next=requestedFilter||'all';
      courseFilter=next;requestedFilter=null;
      document.getElementById('view-enrolled').dataset.courseFilter=courseFilter;
      renderEnrolledCourses();
      document.querySelector('#view-enrolled h2').textContent=courseFilter==='completed'?'Đã hoàn thành':'Môn học đang tham gia';
      if(courseFilter==='completed')setPageHeader('Đã hoàn thành');
      setGroup('courses');
    }else if(viewName==='catalog'){requestedFilter=null;setGroup('courses');}
    else if(viewName==='shop'){
      setGroup('shop');
      if(previous!=='shop'){shopSection='shop-pets';attachSpy();}
    }else setGroup(null);
    syncMenu();
  }
  function afterView(viewName){
    if(viewName==='enrolled')window.AppMotion?.enterTab('course-menu',courseFilter,document.getElementById('view-enrolled'));
    if(viewName==='shop'&&requestedAnchor){const id=requestedAnchor;requestedAnchor=null;jumpTo(id);}
  }
  function init(){setGroup(null);syncMenu();}
  window.SidebarNavigation={toggle,openCourses,openShop,pillTarget,view,afterView};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
