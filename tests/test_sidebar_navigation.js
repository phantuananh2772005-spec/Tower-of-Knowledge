const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const puppeteer=require('puppeteer-core');
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

test('course submenus reuse progress and Shop anchors survive a 100-pet catalog',async()=>{
  const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,protocolTimeout:15000});
  try{
    const page=await browser.newPage(),errors=[];
    page.setDefaultTimeout(10000);
    page.on('pageerror',error=>errors.push(error.message));
    await page.setViewport({width:1280,height:700});
    await page.goto(process.env.MOTION_BASE_URL||'http://127.0.0.1:3000',{waitUntil:'networkidle2'});
    await page.waitForFunction(()=>window.SidebarNavigation&&window.AppMotion&&document.getElementById('tt-nav-pill')?.style.transform);
    await page.evaluate(()=>{
      document.querySelectorAll('[id^="modal-"]').forEach(el=>el.classList.add('hidden'));
      window.GuidedTour={close(){},view(){}};
      // These fixtures live only in this disposable browser. They never reach an API.
      window.originalSidebarData={courses:myEnrolledCourses,pets:allPets,items:accessoryCatalog};
      myEnrolledCourses=[
        {id:'ui-active',slug:'ui-active',name:'UI active fixture',total_milestones:10,completed_milestones:9,completion_percent:100},
        {id:'ui-done',slug:'ui-done',name:'UI completed fixture',total_milestones:10,completed_milestones:10,completion_percent:100},
        {id:'ui-empty',slug:'ui-empty',name:'UI zero fixture',total_milestones:0,completed_milestones:0,completion_percent:100}
      ];
      document.getElementById('sidebar-enrolled-count').textContent=myEnrolledCourses.length;
      document.getElementById('sidebar-enrolled-count').style.display='inline-block';
      allPets=Array.from({length:100},(_,i)=>({id:'ui-pet-'+i,name:'UI Pet fixture '+i,price:10,buff:'UI-only scrolling fixture',image:'/assets/sparky_idle.gif',role:'learner',status:'ACTIVE',requiredLevel:1}));
      accessoryCatalog=[{id:'ui-item',name:'UI item fixture',description:'Not a real product',status:'LOCKED',minimum_level:1,price_coins:10,owned:false}];
      renderEnrolledCourses();renderShopPets();renderAccessories();
      window.sidebarEntries=[];
      document.addEventListener('animationstart',event=>{if(event.animationName==='tt-motion-view-in')sidebarEntries.push(event.target.id)});
      navTo('hub');
    });
    await delay(600);
    console.log('sidebar: fixtures ready');
    assert.equal(await page.$$eval('#app-sidebar nav>button',els=>els.length),6);
    assert(await page.$eval('#nav-enrolled',el=>el.parentElement.parentElement.id==='sidebar-courses-group'));
    assert.equal(await page.$$eval('.tt-sidebar-group',els=>els.length),2);
    await page.click('#nav-catalog');await delay(550);
    console.log('sidebar: course group opened');
    assert.equal(await page.evaluate(()=>currentAppView),'enrolled');
    assert(await page.$eval('#sidebar-courses-group',el=>el.classList.contains('is-open')));
    assert.equal(await page.$$eval('#enrolled-courses-grid [id^="btn_enrolled_vaoleothap_"]',els=>els.length),3);
    for(const [id,view] of [['nav-all-courses','catalog'],['nav-completed-courses','enrolled']]){
      const positions=await page.evaluate(id=>new Promise(resolve=>{
        document.getElementById(id).click();const positions=[],start=performance.now();
        function frame(now){positions.push(new DOMMatrix(getComputedStyle(document.getElementById('tt-nav-pill')).transform).m42);if(now-start<530)requestAnimationFrame(frame);else resolve(positions)}
        requestAnimationFrame(frame);
      }),id);
      assert(positions.every((value,i)=>!i||value>=positions[i-1]-.1),'course pill reversed');
      assert.equal(await page.evaluate(()=>currentAppView),view);
    }
    assert.equal(await page.$eval('#view-enrolled',el=>el.dataset.courseFilter),'completed');
    assert.equal(await page.$$eval('#enrolled-courses-grid [id^="btn_enrolled_vaoleothap_"]',els=>els.length),1);
    assert(await page.$eval('#enrolled-courses-grid',el=>el.textContent.includes('UI completed fixture')&&!el.textContent.includes('UI active fixture')&&!el.textContent.includes('UI zero fixture')));
    assert.equal(await page.$eval('#sidebar-enrolled-count',el=>el.textContent),'3');
    console.log('sidebar: completed courses verified');
    await page.click('#nav-catalog');await delay(550);
    assert.equal(await page.evaluate(()=>currentAppView),'enrolled');
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-catalog');
    assert.equal(await page.$eval('#sidebar-courses-group',el=>el.getBoundingClientRect().height),0);
    await page.evaluate(()=>navTo('enrolled'));await delay(550);
    assert.equal(await page.$eval('#view-enrolled',el=>el.dataset.courseFilter),'all');
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-enrolled');
    const direct=await page.evaluate(()=>new Promise(resolve=>{
      SidebarNavigation.openCourses('completed');const values=[],start=performance.now();
      function frame(now){values.push(new DOMMatrix(getComputedStyle(document.getElementById('tt-nav-pill')).transform).m42);if(now-start<530)requestAnimationFrame(frame);else resolve(values)}
      requestAnimationFrame(frame);
    }));
    assert(direct.at(-1)-direct[0]>40,'same-component course navigation snapped instead of sliding');
    assert(direct.every((value,i)=>!i||value>=direct[i-1]-.1));
    await page.evaluate(()=>navTo('hub'));await delay(450);
    await page.click('#btn_hub_xem_tatca_mon');await delay(550);
    assert.equal(await page.evaluate(()=>currentAppView),'enrolled','legacy home link failed');
    console.log('sidebar: legacy links verified');

    await page.click('#nav-shop');await delay(1300);
    console.log('sidebar: shop entered');
    assert.equal(await page.evaluate(()=>currentAppView),'shop');
    assert(!await page.$eval('#sidebar-courses-group',el=>el.classList.contains('is-open')));
    assert(await page.$eval('#sidebar-shop-group',el=>el.classList.contains('is-open')));
    assert.equal(await page.$$eval('#shop-pets-grid>[data-pet-id]',els=>els.length),100);
    const petAlignment=await page.evaluate(()=>{
      const el=document.getElementById('shop-pets').getBoundingClientRect(),root=document.getElementById('app-main-scroll').getBoundingClientRect();
      return {top:el.top-root.top,height:el.height,rootHeight:root.height};
    });
    console.log('sidebar: pet alignment',petAlignment);
    assert(Math.abs(petAlignment.top-18)<3&&petAlignment.height>petAlignment.rootHeight*.9,'long pet section must align at its heading');
    const before=await page.evaluate(()=>sidebarEntries.length);
    await page.click('#nav-shop-items');
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-shop-items');
    console.log('sidebar: short anchor verified');
    await delay(1400);
    assert.equal(await page.evaluate(()=>sidebarEntries.length),before,'Shop anchor replayed page animation');
    assert(await page.evaluate(()=>{
      const el=document.getElementById('shop-accessories').getBoundingClientRect(),root=document.getElementById('app-main-scroll').getBoundingClientRect();
      return Math.abs((el.top+el.height/2)-(root.top+root.height/2))<3;
    }),'short item section must center');
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-shop-items');
    // Manual scrolling exercises the observer in both directions after the lock.
    await page.evaluate(()=>document.getElementById('app-main-scroll').scrollTo({top:0,behavior:'instant'}));await delay(600);
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-shop-pets');
    await page.evaluate(()=>{const root=document.getElementById('app-main-scroll');root.scrollTo({top:root.scrollHeight,behavior:'instant'})});await delay(650);
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-shop-items');
    await page.click('#nav-hub');await delay(550);
    assert(!await page.$eval('#app-main-scroll',el=>el.classList.contains('tt-shop-anchors')));
    const homeBefore=await page.evaluate(()=>sidebarEntries.length);
    await page.evaluate(()=>SidebarNavigation.openShop('shop-accessories'));await delay(1700);
    assert.equal(await page.evaluate(()=>currentAppView),'shop');
    assert.equal(await page.evaluate(()=>sidebarEntries.length),homeBefore+1);
    assert.equal(await page.evaluate(()=>SidebarNavigation.pillTarget().id),'nav-shop-items');
    assert(await page.evaluate(()=>{const el=document.getElementById('shop-accessories').getBoundingClientRect(),root=document.getElementById('app-main-scroll').getBoundingClientRect();return Math.abs(el.top+el.height/2-root.top-root.height/2)<3}));
    await page.evaluate(()=>{navTo('hub');document.getElementById('shop-items-grid').replaceChildren()});await delay(500);
    await page.evaluate(()=>SidebarNavigation.openShop('shop-accessories'));await delay(550);
    assert(await page.$eval('#app-main-scroll',el=>el.scrollTop<2),'scrolled before items existed');
    await page.evaluate(()=>renderAccessories());await delay(1400);
    assert(await page.evaluate(()=>{const el=document.getElementById('shop-accessories').getBoundingClientRect(),root=document.getElementById('app-main-scroll').getBoundingClientRect();return Math.abs(el.top+el.height/2-root.top-root.height/2)<3}),'late items were not awaited');

    fs.mkdirSync('outputs',{recursive:true});
    for(const [width,height] of [[1280,600],[1280,700],[844,390],[390,844]]){
      await page.setViewport({width,height});await delay(550);
      for(const group of ['courses','shop']){
        await page.evaluate(group=>group==='courses'?SidebarNavigation.openCourses('all'):SidebarNavigation.openShop('shop-pets'),group);await delay(700);
        const layout=await page.evaluate(()=>{
          const side=document.getElementById('app-sidebar'),last=document.getElementById('sidebar-shop-group').classList.contains('is-open')?document.getElementById('nav-shop-items'):document.getElementById('nav-shop');
          return {display:getComputedStyle(side).display,scrollHeight:side.scrollHeight,height:side.clientHeight,footer:side.querySelector('.sidebar-footer').getBoundingClientRect().top,last:last.getBoundingClientRect().bottom,overflow:document.documentElement.scrollWidth>innerWidth};
        });
        assert(!layout.overflow);
        if(width>=768){assert(layout.scrollHeight<=layout.height+1,'sidebar scroll overflow');assert(layout.last<=layout.footer+1,'sidebar footer overlap');}
        else assert.equal(layout.display,'none');
      }
      if(width>=768)await page.screenshot({path:`outputs/sidebar-groups-${width}-${height}.png`});
    }
    await page.setViewport({width:1280,height:700});
    await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
    await page.evaluate(()=>SidebarNavigation.openShop('shop-accessories'));await delay(100);
    assert.equal(await page.$eval('#sidebar-shop-group',el=>getComputedStyle(el).transitionDuration),'0s');
    assert(await page.evaluate(()=>{const el=document.getElementById('shop-accessories').getBoundingClientRect(),root=document.getElementById('app-main-scroll').getBoundingClientRect();return Math.abs(el.top+el.height/2-root.top-root.height/2)<3}));
    await page.evaluate(()=>{allPets=allPets.slice(0,1);renderShopPets();SidebarNavigation.openShop('shop-pets')});await delay(150);
    assert(await page.evaluate(()=>{const el=document.getElementById('shop-pets').getBoundingClientRect(),root=document.getElementById('app-main-scroll').getBoundingClientRect();return Math.abs(el.top+el.height/2-root.top-root.height/2)<3}),'short first section must also center');
    // Restore every in-memory fixture; no test records were written to PostgreSQL.
    await page.evaluate(()=>{myEnrolledCourses=originalSidebarData.courses;allPets=originalSidebarData.pets;accessoryCatalog=originalSidebarData.items;renderEnrolledCourses();renderShopPets();renderAccessories();navTo('hub')});
    assert.deepEqual(errors,[]);
    console.log('PASS completion counts, legacy links, exclusive groups, live pill, 100-pet anchors, center/start alignment, scroll-spy, 4 viewports, reduced motion, fixture cleanup');
  }catch(error){console.error('sidebar test failure:',error);throw error}
  finally{await browser.close()}
});
