const assert = require('node:assert/strict');
const fs = require('node:fs');
const { test } = require('node:test');
const puppeteer = require('puppeteer-core');

test('tour steps keep the target clear and release the portal on Escape', async () => {
  const executablePath = process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
  const browser = await puppeteer.launch({ executablePath, headless: true });
  try {
    for (const [width, height] of [[1920,1080],[1366,768],[768,1024],[390,844],[360,640]]) {
      const page = await browser.newPage();
      await page.setViewport({ width, height });
      await page.setContent('<div data-tour="level" style="position:absolute;top:120px;left:20px;width:210px;height:70px">Level</div>');
      await page.addStyleTag({ content: fs.readFileSync('public/css/guided-tour.css', 'utf8') });
      await page.addScriptTag({ content: `
        let currentUserAccount={userId:'fixture',tourProgress:{context:{experience:'new'}}};
        let currentAppView='hub',isUnboxingInProgress=false;
        function queuePreferenceSave(){}
        function navTo(view){currentAppView=view}
      ` });
      for (const name of ['tour-steps','guided-tour']) {
        await page.addScriptTag({ content: fs.readFileSync('public/js/'+name+'.js','utf8') });
      }
      await page.evaluate(() => GuidedTour.startStage('home'));
      await page.waitForSelector('.tour-unit');
      const position = await page.evaluate(() => {
        const unit = document.querySelector('.tour-unit').getBoundingClientRect();
        const spot = document.querySelector('.tour-spot').getBoundingClientRect();
        return {
          fits: unit.left >= 0 && unit.top >= 0 && unit.right <= innerWidth && unit.bottom <= innerHeight,
          overlaps: unit.left < spot.right && unit.right > spot.left && unit.top < spot.bottom && unit.bottom > spot.top
        };
      });
      assert.equal(position.fits,true);
      assert.equal(position.overlaps,false);
      await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
      for (const edge of ['left','right','top','bottom']) {
        await page.evaluate(edge => {
          const element=document.querySelector('[data-tour="level"]');
          const positions={
            left:[12,innerHeight/2-35],right:[innerWidth-222,innerHeight/2-35],
            top:[innerWidth/2-105,12],bottom:[innerWidth/2-105,innerHeight-82]
          };
          const [x,y]=positions[edge];
          element.style.left=x+'px';element.style.top=y+'px';
          window.dispatchEvent(new Event('resize'));
        },edge);
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
        const clear=await page.evaluate(()=>{
          const a=document.querySelector('.tour-unit').getBoundingClientRect();
          const b=document.querySelector('.tour-spot').getBoundingClientRect();
          return !(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top);
        });
        assert.equal(clear,true, width+'x'+height+' target '+edge);
      }
      await page.evaluate(()=>{
        const target=document.querySelector('[data-tour="level"]');
        target.style.top='80px';target.style.left='12px';
        target.style.height=(innerHeight*2)+'px';
        document.querySelector('.tour-unit p').style.fontSize='21px';
        window.dispatchEvent(new Event('resize'));
      });
      await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
      const large=await page.evaluate(()=>{
        const a=document.querySelector('.tour-unit').getBoundingClientRect();
        const b=document.querySelector('.tour-spot').getBoundingClientRect();
        return {fits:a.top>=0&&a.bottom<=innerHeight,
          clear:!(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)};
      });
      assert.equal(large.fits,true,'large target fits '+width);
      assert.equal(large.clear,true,'large target stays clear '+width);
      await page.keyboard.press('Escape');
      assert.equal(await page.$('.tour-portal'),null);
      await page.close();
    }
  } finally { await browser.close(); }
});


test('all seventeen configured steps finish six stages without missing targets', async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless:true
  });
  try {
    const page = await browser.newPage();
    await page.setViewport({width:1366,height:768});
    await page.setContent('<main></main>');
    await page.addStyleTag({content:fs.readFileSync('public/css/guided-tour.css','utf8')});
    await page.addScriptTag({content:`
      let currentUserAccount={userId:'fixture',tourProgress:{context:{experience:'new'}}};
      let currentAppView='hub',isUnboxingInProgress=false;
      function queuePreferenceSave(){}
      function navTo(view){currentAppView=view}
      function openSettingsModal(){currentAppView='settings'}
    `});
    await page.addScriptTag({content:fs.readFileSync('public/js/tour-steps.js','utf8')});
    await page.evaluate(() => {
      for(const stage of Object.values(SparkyTourSteps)) for(const step of stage.steps) {
        const key = step.target.match(/data-tour="([^"]+)"/)[1];
        const target = document.createElement('button');
        target.dataset.tour=key;
        target.textContent=key;
        target.style.cssText='position:absolute;left:40px;top:130px;width:190px;height:50px';
        document.body.append(target);
      }
    });
    await page.addScriptTag({content:fs.readFileSync('public/js/guided-tour.js','utf8')});
    await page.evaluate(() => GuidedTour.startStage('home'));
    for(let i=0;i<17;i++){
      await page.waitForSelector('.tour-unit');
      await page.evaluate(() => {
        const next=[...document.querySelectorAll('.tour-unit button')].find(button=>button.textContent==='Tiếp →');
        next.click();
      });
      await page.waitForFunction(() => !document.querySelector('.tour-unit'));
    }
    await page.waitForSelector('.companion-guide');
    const state=await page.evaluate(()=>currentUserAccount.tourProgress.context.tourState);
    assert.deepEqual(state,{home:'done',kho:'done',mini:'done',pet:'done',shop:'done',set:'done'});
  } finally {await browser.close();}
});


test('offer waits for readiness, collapses and remembers skip without starting a tour', async () => {
  const browser = await puppeteer.launch({
    executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true
  });
  try {
    const page=await browser.newPage();
    await page.setContent('<main>Home</main>');
    await page.addStyleTag({content:fs.readFileSync('public/css/guided-tour.css','utf8')});
    await page.addScriptTag({content:`
      let currentUserAccount={userId:'offer-fixture',tourProgress:{context:{experience:'new'}}};
      let currentAppView='hub',isUnboxingInProgress=false;
      function queuePreferenceSave(){}
    `});
    for(const name of ['tour-steps','guided-tour']) {
      await page.addScriptTag({content:fs.readFileSync('public/js/'+name+'.js','utf8')});
    }
    await page.evaluate(()=>GuidedTour.view('hub'));
    assert.equal(await page.$('.companion-guide'),null);
    await page.waitForSelector('.companion-guide');
    await page.waitForSelector('.tour-offer-small',{timeout:12000});
    await page.click('.tour-offer-reopen');
    assert.equal(await page.$('.tour-offer-small'),null);
    await page.evaluate(()=>[...document.querySelectorAll('.companion-guide button')].find(button=>button.textContent==='Bỏ qua phần này').click());
    const state=await page.evaluate(()=>currentUserAccount.tourProgress.context.tourState.home);
    assert.equal(state,'skipped');
    await page.evaluate(()=>GuidedTour.view('hub'));
    assert.equal(await page.$('.tour-portal'),null);
    assert.equal(await page.$('.companion-guide'),null);
  } finally {await browser.close();}
});


test('blocked pet images preserve their box and offline closes the tour', async () => {
  const browser=await puppeteer.launch({
    executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true
  });
  try {
    const page=await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request',request=>request.abort());
    await page.setContent('<button id="original">Open</button><div data-tour="level" style="position:absolute;top:120px;left:20px;width:210px;height:70px">Level</div>');
    await page.addStyleTag({content:fs.readFileSync('public/css/guided-tour.css','utf8')});
    await page.addScriptTag({content:`
      let currentUserAccount={userId:'image-fixture',tourProgress:{context:{experience:'new'}}};
      let currentAppView='hub',isUnboxingInProgress=false;
      function queuePreferenceSave(){}
      function navTo(view){currentAppView=view}
    `});
    for(const name of ['tour-steps','guided-tour']) {
      await page.addScriptTag({content:fs.readFileSync('public/js/'+name+'.js','utf8')});
    }
    await page.focus('#original');
    await page.evaluate(()=>GuidedTour.startStage('home'));
    await page.waitForSelector('.tour-unit');
    const size=await page.$eval('.tour-pet-box',element=>[element.offsetWidth,element.offsetHeight]);
    assert.deepEqual(size,[72,72]);
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(()=>document.querySelector('.tour-unit').contains(document.activeElement)),true);
    await page.evaluate(()=>window.dispatchEvent(new Event('offline')));
    assert.equal(await page.$('.tour-portal'),null);
    assert.equal(await page.evaluate(()=>document.activeElement.id),'original');
  } finally {await browser.close();}
});


test('late targets are observed and cancelling while waiting leaves no portal', async () => {
  const browser=await puppeteer.launch({
    executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true
  });
  try {
    const page=await browser.newPage();
    await page.setContent('<main></main>');
    await page.addStyleTag({content:fs.readFileSync('public/css/guided-tour.css','utf8')});
    await page.addScriptTag({content:`
      let currentUserAccount={userId:'delayed',tourProgress:{context:{experience:'new'}}};
      let currentAppView='hub',isUnboxingInProgress=false;
      function queuePreferenceSave(){}
      function navTo(view){currentAppView=view}
    `});
    for(const name of ['tour-steps','guided-tour']) {
      await page.addScriptTag({content:fs.readFileSync('public/js/'+name+'.js','utf8')});
    }
    await page.evaluate(()=>{
      GuidedTour.startStage('home');
      setTimeout(()=>{
        const target=document.createElement('div');
        target.dataset.tour='level';
        target.style.cssText='position:absolute;left:20px;top:120px;width:190px;height:70px';
        document.body.append(target);
      },180);
    });
    await page.waitForSelector('.tour-unit');
    await page.evaluate(()=>{
      skipPetTour();
      document.querySelector('[data-tour="level"]').remove();
      GuidedTour.startStage('home');
      skipPetTour();
    });
    assert.equal(await page.$('.tour-portal'),null);
    assert.equal(await page.evaluate(()=>GuidedTour.active),false);
  } finally {await browser.close();}
});


test('active tour retargets across mobile breakpoint and restores saved cursor', async () => {
  const browser=await puppeteer.launch({
    executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true
  });
  try {
    const page=await browser.newPage();
    await page.setViewport({width:390,height:844});
    await page.setContent('<div data-tour="quests" style="position:absolute;top:100px;left:20px;width:200px;height:80px">Quest</div>');
    await page.addStyleTag({content:fs.readFileSync('public/css/guided-tour.css','utf8')});
    await page.addScriptTag({content:`
      let currentUserAccount={userId:'resume',tourProgress:{context:{experience:'new',tourCursor:{stage:'home',index:1}}}};
      let currentAppView='hub',isUnboxingInProgress=false;
      function queuePreferenceSave(){}
      function navTo(view){currentAppView=view}
    `});
    for(const name of ['tour-steps','guided-tour']) {
      await page.addScriptTag({content:fs.readFileSync('public/js/'+name+'.js','utf8')});
    }
    await page.evaluate(()=>GuidedTour.startStage('home'));
    await page.waitForSelector('.tour-unit');
    assert.match(await page.$eval('.tour-unit p',element=>element.textContent),/ba nhiệm vụ/);
    await page.setViewport({width:844,height:390});
    await page.waitForFunction(()=>document.querySelector('.tour-pet-box')?.offsetWidth===72);
    assert.equal(await page.$$eval('.tour-portal',elements=>elements.length),1);
    await page.keyboard.press('Escape');
    await page.evaluate(()=>GuidedTour.startStage('home'));
    await page.waitForSelector('.tour-unit');
    assert.match(await page.$eval('.tour-unit p',element=>element.textContent),/ba nhiệm vụ/);
    await page.keyboard.press('Escape');
    assert.equal(await page.$('.tour-portal'),null);
  } finally {await browser.close();}
});


test('Escape closes only the settings modal owned by the tour', async () => {
  const browser=await puppeteer.launch({
    executablePath:process.env.CHROME_PATH || 'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true
  });
  try {
    for(const alreadyOpen of [false,true]) {
      const page=await browser.newPage();
      await page.setContent('<div id="modal-settings" class="'+(alreadyOpen?'':'hidden')+'"><button data-tour="replay" style="position:absolute;top:100px;left:20px;width:200px;height:60px">Replay</button></div>');
      await page.addStyleTag({content:'.hidden{display:none}'+fs.readFileSync('public/css/guided-tour.css','utf8')});
      await page.addScriptTag({content:`
        let currentUserAccount={userId:'settings',tourProgress:{context:{experience:'new'}}};
        let currentAppView='hub',isUnboxingInProgress=false;
        function queuePreferenceSave(){}
        function navTo(view){currentAppView=view}
        function openSettingsModal(){document.getElementById('modal-settings').classList.remove('hidden')}
        function closeSettingsModal(){document.getElementById('modal-settings').classList.add('hidden')}
      `});
      for(const name of ['tour-steps','guided-tour']) {
        await page.addScriptTag({content:fs.readFileSync('public/js/'+name+'.js','utf8')});
      }
      await page.evaluate(()=>GuidedTour.startStage('set'));
      await page.waitForSelector('.tour-unit');
      await page.keyboard.press('Escape');
      assert.equal(await page.$('.tour-portal'),null);
      assert.equal(await page.$eval('#modal-settings',element=>!element.classList.contains('hidden')),alreadyOpen);
      await page.close();
    }
  } finally {await browser.close();}
});
