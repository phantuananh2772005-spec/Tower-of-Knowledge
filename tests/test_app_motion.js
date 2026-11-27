const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const puppeteer=require('puppeteer-core');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

test('motion on the real app preserves navigation, geometry, data and reduced-motion',async()=>{
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
  try{
    const page=await browser.newPage(),errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewport({width:1280,height:700});
    await page.goto(process.env.MOTION_BASE_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle2'});
    await page.waitForFunction(()=>window.AppMotion&&document.getElementById('tt-nav-pill')?.style.transform);
    await page.evaluate(()=>{
      // Guest-only UI test. No registration, purchases or database writes.
      document.querySelectorAll('[id^="modal-"]').forEach(el=>el.classList.add('hidden'));
      window.GuidedTour={close(){},view(){}};
      window.motionEntries=[];
      document.addEventListener('animationstart',event=>{
        if(event.animationName==='tt-motion-view-in')motionEntries.push(event.target.id);
      });
      navTo('hub');
    });
    await delay(600);
    assert.equal(await page.$$eval('#app-sidebar nav>button',els=>els.length),6);
    assert.equal(await page.$$eval('#app-sidebar nav #tt-nav-pill',els=>els.length),1);
    const collect=async view=>page.evaluate(view=>new Promise(resolve=>{
      navTo(view);const values=[],start=performance.now();
      function sample(now){values.push(new DOMMatrix(getComputedStyle(document.getElementById('tt-nav-pill')).transform).m42);if(now-start<520)requestAnimationFrame(sample);else resolve(values)}
      requestAnimationFrame(sample);
    }),view);
    for(const view of ['catalog','shop','enrolled']){
      const values=await collect(view),sign=Math.sign(values.at(-1)-values[0]);
      assert(values.every((v,i)=>!i||(v-values[i-1])*sign>=-.1),'pill reversed direction');
      assert(await page.evaluate(view=>{
        const pill=document.getElementById('tt-nav-pill').getBoundingClientRect(),target=SidebarNavigation.pillTarget().getBoundingClientRect();
        return Math.abs(pill.top-target.top)<1&&Math.abs(pill.width-target.width)<1;
      },view));
      assert(await page.$eval('#view-'+view,el=>getComputedStyle(el).display!=='none'));
    }
    await page.evaluate(()=>navTo('shop'));await delay(100);
    await collect('catalog');
    const movingTarget=await page.evaluate(()=>new Promise(resolve=>{
      navTo('shop');const positions=[],start=performance.now();
      setTimeout(()=>document.getElementById('nav-hub').style.minHeight='68px',100);
      function sample(now){positions.push(new DOMMatrix(getComputedStyle(document.getElementById('tt-nav-pill')).transform).m42);if(now-start<530)requestAnimationFrame(sample);else resolve(positions)}
      requestAnimationFrame(sample);
    }));
    assert(movingTarget.every((value,i)=>!i||value>=movingTarget[i-1]-.1),'pill reversed while destination moved');
    await page.evaluate(()=>{document.getElementById('nav-hub').style.minHeight='';navTo('catalog')});await delay(550);
    const before=await page.evaluate(()=>motionEntries.length);
    await page.evaluate(()=>navTo('catalog'));await delay(500);
    assert.equal(await page.evaluate(()=>motionEntries.length),before,'same page flashed');
    await page.evaluate(()=>document.getElementById('catalog-courses-grid').dispatchEvent(new Event('input',{bubbles:true})));
    await delay(100);assert.equal(await page.evaluate(()=>motionEntries.length),before,'filter flashed page');

    const iconLeft=await page.$eval('#nav-hub .app-nav-art',el=>el.getBoundingClientRect().left);
    await page.evaluate(()=>toggleSidebar());await delay(450);
    assert(await page.$eval('#app-sidebar',el=>el.getBoundingClientRect().width<1&&el.inert));
    await page.evaluate(()=>toggleSidebar());await delay(500);
    assert.equal(await page.$eval('#app-sidebar',el=>Math.round(el.getBoundingClientRect().width)),256);
    assert(Math.abs(await page.$eval('#nav-hub .app-nav-art',el=>el.getBoundingClientRect().left)-iconLeft)<1);

    await page.evaluate(()=>navTo('hub'));await delay(500);
    assert(await page.evaluate(()=>{
      const bar=document.getElementById('hub-exp-bar');bar.style.width='65%';
      AppMotion.animateProgress(document.getElementById('view-hub'));
      const zero=bar.getBoundingClientRect().width<1&&bar.style.width==='65%';
      // A real update arriving during the two-frame entry must win.
      bar.style.width='80%';return zero;
    }));
    await delay(1050);
    assert(await page.$eval('#hub-exp-bar',el=>el.style.width==='80%'&&Math.abs(el.getBoundingClientRect().width/el.parentElement.getBoundingClientRect().width-.8)<.01));
    await page.evaluate(()=>document.getElementById('sidebar-coins-val').textContent='21');
    await page.waitForFunction(()=>document.getElementById('sidebar-coins-val').classList.contains('tt-motion-bump'));
    await delay(450);
    assert(!await page.$eval('#sidebar-coins-val',el=>el.classList.contains('tt-motion-bump')));

    await page.evaluate(()=>showToast('First motion test','info'));await delay(1000);
    await page.evaluate(()=>showToast('Second motion test','info'));await delay(1000);
    assert(await page.$eval('#app-toast',el=>el.classList.contains('opacity-100')&&el.textContent.includes('Second motion test')));
    await delay(900);assert(await page.$eval('#app-toast',el=>el.classList.contains('opacity-0')));

    await page.evaluate(()=>{openAuthModal('login');authTab('login')});await delay(500);
    const authBefore=await page.evaluate(()=>motionEntries.length);
    await page.evaluate(()=>authTab('register'));await delay(500);
    assert.equal(await page.evaluate(()=>motionEntries.length),authBefore+1);
    await page.evaluate(()=>authTab('register'));await delay(450);
    assert.equal(await page.evaluate(()=>motionEntries.length),authBefore+1,'unchanged auth tab flashed');
    await page.evaluate(()=>closeAuthModal(true));
    assert(await page.$eval('#modal-auth',el=>el.classList.contains('hidden')));
    await page.evaluate(()=>navTo('minigame'));await delay(500);
    const arenaBefore=await page.evaluate(()=>motionEntries.length);
    await page.evaluate(()=>selectArenaMode('arcade'));await delay(500);
    assert.equal(await page.evaluate(()=>motionEntries.length),arenaBefore+1);
    await page.evaluate(()=>selectArenaMode('arcade'));await delay(450);
    assert.equal(await page.evaluate(()=>motionEntries.length),arenaBefore+1,'same arena tab flashed');
    await page.evaluate(()=>selectArenaMode(null));await delay(500);
    assert.equal(await page.evaluate(()=>motionEntries.length),arenaBefore+2);
    await page.evaluate(()=>navTo('hub'));await delay(500);

    fs.mkdirSync('outputs',{recursive:true});
    for(const [width,height] of [[1280,600],[1280,700],[1920,1080],[768,650],[390,844],[844,390]]){
      await page.setViewport({width,height});await delay(500);
      const geometry=await page.evaluate(()=>{
        const sidebar=document.getElementById('app-sidebar'),footer=sidebar.querySelector('.sidebar-footer').getBoundingClientRect(),last=document.getElementById('nav-shop').getBoundingClientRect();
        const main=document.getElementById('app-main-scroll').getBoundingClientRect();
        return {overflow:document.documentElement.scrollWidth>innerWidth,mainHeight:main.height,sidebar:getComputedStyle(sidebar).display,footerBottom:footer.bottom,footerTop:footer.top,lastBottom:last.bottom,innerHeight};
      });
      assert(!geometry.overflow);assert(geometry.mainHeight>100);
      if(width>=768){assert(geometry.footerBottom<=height+1);assert(geometry.lastBottom<=geometry.footerTop+1,'menu overlaps pinned footer')}
      else assert.equal(geometry.sidebar,'none');
      if(width===1280||width===390)await page.screenshot({path:`outputs/motion-app-${width}-${height}.png`});
    }
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.evaluate(()=>{navTo('pet');toggleTheme();document.getElementById('sidebar-coins-val').textContent='22'});
    await delay(100);
    assert(await page.evaluate(()=>[...document.querySelectorAll('body *')].every(el=>getComputedStyle(el).animationName==='none'&&getComputedStyle(el).transitionDuration.split(',').every(value=>parseFloat(value)===0))));
    assert.equal(await page.evaluate(()=>document.getAnimations().filter(animation=>animation.playState==='running').length),0);
    assert.deepEqual(errors,[]);
    console.log('PASS live pill, interrupted clicks, page/tab gating, progress race, coin bump, toast replacement, 6 viewports and reduced motion');
  }finally{await browser.close()}
});
