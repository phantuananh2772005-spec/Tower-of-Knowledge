(() => {
  let tip = null;
  let tipKey = null;
  let offerTimer = null;
  let shrinkTimer = null;

  function close() {
    clearTimeout(offerTimer);
    clearTimeout(shrinkTimer);
    tip?.remove();
    tip = null;
    tipKey = null;
  }

  function progress() {
    let local = {};
    try { local = JSON.parse(localStorage.getItem('tok_tour_v3_'+(currentUserAccount?.userId || 'guest')) || '{}'); } catch {}
    const remote = currentUserAccount?.tourProgress || {};
    return {...remote, context:{...local.context,...remote.context,
      tourState:{...local.context?.tourState,...remote.context?.tourState}}};
  }

  function save(context) {
    const account = currentUserAccount;
    account.tourProgress = {
      step: 'contextual-guide-v3', layout: innerWidth < 768 ? 'mobile' : 'desktop',
      completed: context.experience === 'experienced', context
    };
    try { localStorage.setItem('tok_tour_v3_'+(account.userId || 'guest'),JSON.stringify(account.tourProgress)); } catch {}
    queuePreferenceSave({ tutorial_progress: account.tourProgress });
  }

  function floating(title, message, actions) {
    close();
    const box = document.createElement('aside');
    box.className = 'companion-guide';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', title);
    const image = document.createElement('img');
    image.src = matchMedia('(prefers-reduced-motion:reduce)').matches ? '/assets/sparky_still.png' : '/assets/sparky_idle.gif';
    image.onerror = () => {
      if (image.dataset.fallback) { image.style.visibility='hidden'; return; }
      image.dataset.fallback='true'; image.src='/assets/sparky_still.png';
    };
    image.alt = 'Sparky';
    image.width = 56;
    image.height = 56;
    const heading = document.createElement('strong');
    heading.textContent = title;
    const text = document.createElement('p');
    text.textContent = message;
    const buttons = document.createElement('div');
    actions.forEach(([label, action]) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = label;
      button.onclick = action;
      buttons.append(button);
    });
    box.append(image, heading, text, buttons);
    document.body.append(box);
    tip = box;
    return box;
  }

  function chooseExperience() {
    if (!currentUserAccount?.userId) return;
    floating('Sparky làm quen', 'Bạn đã từng dùng Tháp Tri Thức chưa?', [
      ['Mình là người mới', () => {
        save({ ...progress().context, experience: 'new', guides: {} });
        close();
        view(currentAppView, true);
      }],
      ['Mình đã biết cách dùng', () => {
        save({ ...progress().context, experience: 'experienced' });
        close();
      }]
    ]);
  }

  let tour = null;
  let version = 0;
  let cleanup = () => {};
  const stages = ['home','kho','mini','pet','shop','set'];
  const stageForView = {hub:'home',catalog:'kho',minigame:'mini',pet:'pet',shop:'shop',settings:'set'};
  const reduced = () => matchMedia('(prefers-reduced-motion:reduce)').matches;

  function blocked() {
    return !navigator.onLine || ['play','battle','extreme','login'].includes(currentAppView)
      || typeof currentLiveMatch !== 'undefined' && currentLiveMatch && !currentLiveMatch.over
      || typeof isUnboxingInProgress !== 'undefined' && isUnboxingInProgress;
  }

  function tourClose() {
    version++;
    const focus = tour?.focus;
    cleanup();
    cleanup = () => {};
    document.querySelector('.tour-portal')?.remove();
    tour = null;
    close();
    if (focus?.isConnected) focus.focus({preventScroll:true});
  }

  function visibleTarget(selector) {
    return [...document.querySelectorAll(selector)].find(element => {
      const rect = element.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0 && getComputedStyle(element).visibility !== 'hidden';
    });
  }

  function waitTarget(selector, token) {
    const found = visibleTarget(selector);
    if (found) return Promise.resolve(found);
    return new Promise(resolve => {
      let timer;
      const finish = target => {
        clearTimeout(timer);
        observer.disconnect();
        resolve(target);
      };
      const observer = new MutationObserver(() => {
        if (token !== version) { finish(null); return; }
        const target = visibleTarget(selector);
        if (target) finish(target);
      });
      observer.observe(document.body,{childList:true,subtree:true,attributes:true});
      timer=setTimeout(()=>finish(null),3000);
      cleanup=()=>finish(null);
    });
  }

  function waitForPosition(target, token) {
    return new Promise(resolve => {
      const started=performance.now();
      let previous=null, stable=0, frame;
      const check=()=>{
        if(token!==version){resolve();return;}
        const rect=target.getBoundingClientRect();
        const position=[rect.left,rect.top,rect.width,rect.height].join(',');
        stable=position===previous?stable+1:0;
        previous=position;
        if(stable>=3 || performance.now()-started>=600){resolve();return;}
        frame=requestAnimationFrame(check);
      };
      frame=requestAnimationFrame(check);
      cleanup=()=>{cancelAnimationFrame(frame);resolve();};
    });
  }

  function stageDone(stage, status) {
    const context = progress().context || {};
    save({...context, tourState:{...context.tourState,[stage]:status}});
  }

  async function advanceStage(status) {
    if (!tour) return;
    const index = stages.indexOf(tour.stage);
    stageDone(tour.stage,status);
    if (index === stages.length - 1) {
      tourClose();
      floating('Sparky chúc mừng', 'Bạn đã xem xong hướng dẫn.', [
        ['Nhận quà hoàn thành', claimTourReward], ['Đóng', close]
      ]);
      return;
    }
    startStage(stages[index + 1]);
  }

  let claiming = false;
  async function claimTourReward() {
    if (claiming) return;
    claiming = true;
    try {
      const token = localStorage.getItem('tok_token');
      const headers = {'Content-Type':'application/json',Authorization:'Bearer '+token};
      const saved = await fetch('/api/auth/settings', {
        method:'PUT', headers,
        body:JSON.stringify({tutorial_progress:currentUserAccount.tourProgress})
      }).then(response=>response.json());
      if (!saved.success) throw new Error(saved.error?.message || 'Chưa lưu được tiến độ.');
      const result = await fetch('/api/economy/tour-reward',{method:'POST',headers}).then(response=>response.json());
      if (!result.success) throw new Error(result.error?.message || 'Chưa nhận được quà.');
      await refreshUserData();
      floating('Sparky chúc mừng', result.data.already_claimed
        ? 'Quà hoàn thành hướng dẫn đã được nhận trước đó.'
        : 'Bạn nhận được 10 Xu hoàn thành hướng dẫn!', [['Xong',close]]);
    } catch (error) {
      floating('Chưa nhận được quà',error.message,[['Thử lại',claimTourReward],['Đóng',close]]);
    } finally { claiming=false; }
  }

  async function startStage(stage) {
    const config = window.SparkyTourSteps?.[stage];
    if (!config || blocked()) return;
    tourClose();
    const resume = progress().context?.tourCursor;
    const index = resume?.stage === stage && Number.isInteger(resume.index)
      ? Math.max(0, Math.min(config.steps.length - 1, resume.index)) : 0;
    tour = {stage,index,missing:false,focus:document.activeElement};
    if (config.view === 'settings') openSettingsModal();
    else if (currentAppView !== config.view) navTo(config.view);
    await renderStep();
  }

  async function renderStep() {
    cleanup();
    document.querySelector('.tour-portal')?.remove();
    const active = tour;
    if (!active || blocked()) { tourClose(); return; }
    const context = progress().context || {};
    save({...context,tourCursor:{stage:active.stage,index:active.index}});
    const token = ++version;
    const steps = window.SparkyTourSteps[active.stage].steps;
    const step = steps[active.index];
    if (!step) { await advanceStage(active.missing ? 'skipped' : 'done'); return; }
    const mobile = innerWidth <= 700;
    const selector = typeof step.target === 'string' ? step.target : (mobile ? step.target.mobile : step.target.desktop);
    if (selector === '[data-tour="enroll"]' && typeof myEnrolledCourses !== 'undefined' && myEnrolledCourses.length) {
      active.index++;
      return renderStep();
    }
    const menuTarget = mobile && ['[data-tour="shop"]','[data-tour="settings"]'].includes(selector);
    if (menuTarget) openMobileMoreSheet();
    const effectiveSelector = menuTarget
      ? selector.replace('data-tour="','data-tour="mobile-') : selector;
    const sidebar = document.getElementById('app-sidebar');
    const revealSidebar = mobile && selector === '[data-tour="coins"]';
    if (revealSidebar) sidebar?.classList.add('tour-sidebar-open');
    const target = await waitTarget(effectiveSelector,token);
    if (token !== version || active !== tour) return;
    if (!target) {
      console.warn('[tour] Missing target',selector);
      sidebar?.classList.remove('tour-sidebar-open');
      active.missing = true;
      active.index++;
      return renderStep();
    }
    const fixed = (() => { for(let e=target;e;e=e.parentElement) if(['fixed','sticky'].includes(getComputedStyle(e).position)) return true; return false; })();
    const previousScrollMargin=target.style.scrollMarginTop;
    if (!fixed) {
      target.style.scrollMarginTop = '80px';
      target.scrollIntoView({block:mobile || target.getBoundingClientRect().height>innerHeight*.6?'start':'center',behavior:reduced()?'instant':'smooth'});
    }
    await waitForPosition(target,token);
    if (token !== version || active !== tour) { target.style.scrollMarginTop=previousScrollMargin; return; }
    const portal = document.createElement('div');
    portal.className = 'tour-portal';
    const spot = document.createElement('div');
    spot.className = 'tour-spot';
    const unit = document.createElement('section');
    unit.className = 'tour-unit';
    unit.style.transition = 'none';
    unit.style.visibility = 'hidden';
    unit.setAttribute('role','dialog');
    unit.setAttribute('aria-label','Hướng dẫn cùng Sparky');
    unit.setAttribute('aria-live','polite');
    const petBox = document.createElement('div');
    petBox.className = 'tour-pet-box';
    const pet = document.createElement('img');
    pet.width = 72; pet.height = 72;
    pet.alt = 'Sparky';
    pet.onload = () => pet.style.opacity = '1';
    pet.onerror = () => {
      if (pet.dataset.fallback) { pet.style.opacity='0'; return; }
      pet.dataset.fallback='true'; pet.src='/assets/sparky_still.png';
    };
    pet.src = reduced()?'/assets/sparky_still.png':'/assets/sparky_idle.gif';
    petBox.append(pet);
    const message = document.createElement('p');
    const letters = [...step.text].map(character => {
      const span=document.createElement('span');
      span.textContent=character;
      span.style.visibility=reduced()?'visible':'hidden';
      message.append(span);
      return span;
    });
    let letterIndex=0;
    const reveal=()=>letters.forEach(letter=>letter.style.visibility='visible');
    const typing=reduced()?null:setInterval(()=>{
      if(letterIndex>=letters.length){clearInterval(typing);return;}
      letters[letterIndex++].style.visibility='visible';
    },18);
    message.onclick=()=>{clearInterval(typing);reveal();};
    const counter = document.createElement('small');
    counter.textContent = (active.index+1)+' / '+steps.length;
    const controls = document.createElement('div');
    const button = (text,action) => {
      const b=document.createElement('button'); b.type='button'; b.textContent=text; b.onclick=action; controls.append(b); return b;
    };
    button('Thoát',()=>{ const focus=active.focus; tourClose(); focus?.focus(); });
    button('Bỏ qua phần này',()=>advanceStage('skipped'));
    if(active.index>0) button('Quay lại',()=>{active.index--;renderStep();});
    const next=button('Tiếp →',()=>{active.index++;renderStep();});
    unit.append(petBox,message,counter,controls);
    portal.append(spot,unit);
    document.body.append(portal);
    let frame=0;
    const place=()=>{
      const rect=target.getBoundingClientRect();
      const vw=visualViewport?.width||innerWidth,vh=visualViewport?.height||innerHeight;
      const left=Math.max(8,rect.left-8),top=Math.max(8,rect.top-8);
      const right=Math.min(vw-8,rect.right+8);
      const unitHeight=unit.offsetHeight;
      const large=rect.height>vh*.6;
      const availableHeight=Math.max(44,vh-unitHeight-110);
      const bottom=Math.min(vh-8,rect.bottom+8,large?top+availableHeight:Infinity);
      spot.style.cssText='left:'+left+'px;top:'+top+'px;width:'+Math.max(0,right-left)+'px;height:'+Math.max(0,bottom-top)+'px';
      const width=unit.offsetWidth,height=unit.offsetHeight;
      const choices=[
        {x:left,y:bottom+14,space:vh-bottom,fit:bottom+14+height<vh-12},
        {x:left,y:top-height-14,space:top,fit:top-height-14>12},
        {x:right+14,y:top,space:vw-right,fit:right+14+width<vw-12},
        {x:left-width-14,y:top,space:left,fit:left-width-14>12}
      ];
      const choice=choices.filter(c=>c.fit).sort((a,b)=>b.space-a.space)[0]||{x:vw-width-12,y:vh-height-80};
      let x=Math.max(12,Math.min(vw-width-12,choice.x));
      let y=Math.max(12,Math.min(vh-height-12,choice.y));
      if(vw<=700){
        x=12;
        const below=vh-height-78;
        y=below>=bottom+14 ? below : top>=height+26 ? 12 : Math.max(12,bottom+14);
      }
      unit.style.transform='translate('+x+'px,'+y+'px)';
      const centerX=(left+right)/2, centerY=(top+bottom)/2;
      const side=y>=bottom?'top':y+height<=top?'bottom':x>=right?'left':'right';
      unit.dataset.side=side;
      unit.style.setProperty('--tour-tail-x',Math.max(18,Math.min(width-18,centerX-x))+'px');
      unit.style.setProperty('--tour-tail-y',Math.max(18,Math.min(height-18,centerY-y))+'px');
      pet.style.transform=x>=right?'scaleX(-1)':'';
    };
    const schedule=()=>{
      cancelAnimationFrame(frame);
      frame=requestAnimationFrame(()=>{
        if ((innerWidth<=700)!==mobile || !target.isConnected) {
          renderStep();
          return;
        }
        place();
      });
    };
    const observer=new ResizeObserver(schedule);observer.observe(target);observer.observe(unit);
    const intercept=event=>{
      if(unit.contains(event.target))return;
      if(step.clickable && target.contains(event.target)) {
        const at=version;
        if (active.clickPending) { event.preventDefault(); return; }
        active.clickPending = true;
        const check = async () => {
          if (at !== version || tour !== active) return;
          if (effectiveSelector.includes('enroll') && !myEnrolledCourses.length) {
            active.clickPending = false;
            return;
          }
          active.clickPending = false;
          active.index++;
          await renderStep();
        };
        if (!effectiveSelector.includes('enroll')) setTimeout(check,700);
        return;
      }
      event.preventDefault();event.stopImmediatePropagation();
      unit.animate([{opacity:1},{opacity:.65},{opacity:1}],{duration:180});
    };
    const lock=event=>{if(!unit.contains(event.target))event.preventDefault();};
    const keys=event=>{
      if(event.key==='Tab') {
        const choices=[...unit.querySelectorAll('button:not(:disabled)')];
        if(step.clickable) choices.push(target);
        const current=choices.indexOf(document.activeElement);
        event.preventDefault();
        const next=(current+(event.shiftKey?-1:1)+choices.length)%choices.length;
        choices[next]?.focus();
      }
      if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();tourClose();}
      if(event.key==='ArrowRight'){event.preventDefault();active.index++;renderStep();}
      if(event.key==='ArrowLeft'&&active.index>0){event.preventDefault();active.index--;renderStep();}
    };
    document.addEventListener('click',intercept,true);
    document.addEventListener('wheel',lock,{passive:false});
    document.addEventListener('touchmove',lock,{passive:false});
    document.addEventListener('keydown',keys,true);
    window.addEventListener('offline',tourClose);
    window.addEventListener('resize',schedule);
    visualViewport?.addEventListener('resize',schedule);
    window.addEventListener('scroll',schedule,true);
    cleanup=()=>{
      sidebar?.classList.remove('tour-sidebar-open');
      target.style.scrollMarginTop=previousScrollMargin;
      clearInterval(typing);
      cancelAnimationFrame(frame);observer.disconnect();
      document.removeEventListener('click',intercept,true);
      document.removeEventListener('wheel',lock);
      document.removeEventListener('touchmove',lock);
      document.removeEventListener('keydown',keys,true);
      window.removeEventListener('offline',tourClose);
      window.removeEventListener('resize',schedule);
      visualViewport?.removeEventListener('resize',schedule);
      window.removeEventListener('scroll',schedule,true);
    };
    place();
    unit.style.visibility = 'visible';
    requestAnimationFrame(() => { if (unit.isConnected) unit.style.transition = ''; });
    next.focus({preventScroll:true});
  }

  function view(key, force=false) {
    if(tour) {
      const expected = window.SparkyTourSteps[tour.stage]?.view;
      if (key !== expected && key !== 'settings' && !tour.clickPending) tourClose();
      return;
    }
    const stage=stageForView[key];
    if(!stage || blocked())return;
    const context=progress().context||{};
    if(!force && (context.experience==='experienced'||context.tourState?.[stage]))return;
    if(!context.experience&&!force){chooseExperience();return;}
    close();
    offerTimer = setTimeout(() => {
      if (blocked() || tour || stageForView[currentAppView] !== stage) return;
      const modal = [...document.querySelectorAll('[id^="modal-"]')].some(element => {
        if (element.classList.contains('hidden')) return false;
        const style=getComputedStyle(element);
        return style.display!=='none' && style.visibility!=='hidden' && element.getClientRects().length;
      });
      if (modal || document.querySelector('dialog[open]')) return;
      const contextNow=progress().context||{};
      if(!force && contextNow.offers?.[stage])return;
      save({...contextNow,offers:{...contextNow.offers,[stage]:'shown'}});
      const box=floating('Sparky đồng hành','Bạn có muốn mình hướng dẫn phần này không?',[
        ['Hướng dẫn mình',()=>{close();startStage(stage);}],
        ['Bỏ qua phần này',()=>{stageDone(stage,'skipped');close();}]
      ]);
      shrinkTimer=setTimeout(()=>{
        if(tip!==box)return;
        box.classList.add('tour-offer-small');
        const reopen=document.createElement('button');
        reopen.type='button';reopen.className='tour-offer-reopen';
        reopen.textContent='Hướng dẫn';
        reopen.onclick=()=>{box.classList.remove('tour-offer-small');reopen.remove();};
        box.append(reopen);
      },10000);
    },600);
  }

  window.GuidedTour={view,
    action(name) {
      if(name==='enroll' && tour?.clickPending) {
        tour.clickPending=false;
        tour.index++;
        renderStep();
      }
    },
    question:()=>{},close:()=>{if(!tour)close();},chooseExperience,startStage,get active(){return !!tour||!!tip?.isConnected;}};
  window.startPetOnboardingTour=()=>{
    const context=progress().context||{};
    save({...context,tourState:{},tourCursor:null});
    startStage('home');
  };
  window.skipPetTour=tourClose;
  window.nextPetTourStep=()=>{if(tour){tour.index++;renderStep();}};
  window.prevPetTourStep=()=>{if(tour&&tour.index>0){tour.index--;renderStep();}};
  window.finishPetTour=tourClose;
  window.hasClaimedOnboardingGift=()=>Boolean(dailyQuestsState?.onboardingClaimed);
})();
