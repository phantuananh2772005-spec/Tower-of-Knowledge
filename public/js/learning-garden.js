function gardenLessonTitle(milestone) {
  return (milestone.title || '').replace(/^Mốc\s+\d+(?:\.\d+)*\s*:\s*/i, '');
}

function gardenTopicNumber(chapter, milestone) {
  return `${chapter.sort_order}.${milestone.sort_order}`;
}

function gardenTopicForLesson(course, milestoneId) {
  for (const chapter of course?.chapters ?? []) {
    const milestone = chapter.milestones?.find(item => item.id === milestoneId);
    if (milestone) return gardenTopicNumber(chapter, milestone);
  }
  return null;
}

function renderLearningGarden(courseData) {
  const host=document.getElementById('saga-roadmap-track');
  if(!host||!courseData?.chapters)return;
  window.gardenChapterObserver?.disconnect();
  window.gardenArtObserver?.disconnect();
  window.gardenThemeObserver?.disconnect();
  window.gardenArtCleanup?.();
  const chapters=courseData.chapters||[], done=m=>m?.status==='COMPLETED';
  const entries=chapters.flatMap((chapter,index)=>(chapter.milestones||[]).map(m=>({
    m,chapter,index,available:done(m)||m.status==='OPEN'
  })));
  const active=entries.find(e=>e.m.status==='OPEN')||entries.filter(e=>e.available).at(-1)||entries[0];
  if(!active){host.innerHTML='<p class="garden-empty">Môn học này chưa có mốc học.</p>';return;}
  currentSagaChapterId=active.chapter.id;
  setSagaFocusMoc(active.m);
  const complete=entries.filter(e=>done(e.m)).length;
  const name=courseData.name||'Lộ trình học tập';
  const courseCode=courseData.slug==='chuyen-doi-so'?'CĐS':courseData.slug==='co-so-du-lieu'?'CSDL':'Môn học';
  function updateChapter(ch){
    currentSagaChapterId=ch.id;
    if(currentAppView!=='saga')return;
    document.getElementById('sidebar-saga-course-tag').textContent=courseCode+' · C'+(ch.sort_order||chapters.indexOf(ch)+1);
  }
  updateChapter(active.chapter);
  const esc=escapeHtml;
  host.innerHTML=`<div class="garden-map"><div class="garden-intro"><div><span class="garden-eyebrow">HÀNH TRÌNH TRI THỨC</span><h2>${esc(name)}</h2></div><div class="garden-summary"><span class="garden-progress">${complete}/${entries.length} mốc đã hoàn thành</span><div class="garden-course-progress" role="progressbar" aria-label="Tiến độ môn học" aria-valuenow="${complete}" aria-valuemin="0" aria-valuemax="${entries.length}"><span style="width:${complete/entries.length*100}%"></span></div><button id="btn_garden_change_course" type="button">Đổi môn →</button></div></div><div class="garden-chapters"></div><div class="garden-finish"><span aria-hidden="true">🏁</span><strong>Đích đến của hành trình</strong><span>Hoàn thành từng mốc để chinh phục môn học.</span></div></div><div class="garden-jump-wrap"><button id="btn_garden_current" type="button">↟ Về mốc đang học</button></div>`;
  const container=host.querySelector('.garden-chapters');
  chapters.forEach((ch,index)=>{
    const chapterTopics = entries.filter(entry => entry.index === index);
    const items = chapterTopics.flatMap(entry => {
      const {m} = entry;
      const steps = Array.from({length: m.step_count}, (_, i) => i + 1);
      if (m.has_theory || m.kind === 'THEORY') steps.unshift(null);
      return steps.map(step => ({...entry, step}));
    });
    const practice = items.filter(item => item.step !== null);
    const chapterStars = practice.reduce((sum, {m, step}) => sum + (m.record?.steps?.[step]?.stars ?? 0), 0);
    const unlocked = index === 0 || chapterTopics.some(entry => entry.available);
    const section=document.createElement('section');section.className='garden-chapter';section.dataset.chapter=ch.id;section.dataset.season=['spring','summer','autumn','winter'][index%4];section.id='garden-chapter-'+ch.id;
    const offsets=[50,66,56,34,44,63,50],height=Math.max(220,items.length*170+150), points=items.map((e,i)=>({x:offsets[i%offsets.length]*6,y:136+i*170}));
    let d='';points.forEach((p,i)=>{if(!i){d=`M ${p.x} ${p.y}`;return;}const last=points[i-1],mid=(last.y+p.y)/2;d+=` C ${last.x} ${mid}, ${p.x} ${mid}, ${p.x} ${p.y}`;});
    section.innerHTML=`<header class="garden-chapter-heading"><span class="garden-chapter-number">${String(ch.sort_order||index+1).padStart(2,'0')}</span><div><h3>${esc(ch.title||'Chương '+(index+1))}</h3><p>${unlocked?'Khám phá từng mốc trên đường đi':'Hoàn thành chương trước để mở khóa'}</p></div><span class="garden-chapter-state">${unlocked?'🌿':'🔒'}</span><span class="garden-chapter-score" aria-label="Sao của chương">★ ${chapterStars}/${practice.length*3}</span></header><div class="garden-landscape"><div class="garden-lane" style="height:${height}px"><svg class="garden-trail" aria-hidden="true" viewBox="0 0 600 ${height}" preserveAspectRatio="none"><path class="garden-trail-shadow" d="${d}"/><path class="garden-trail-line" d="${d}"/></svg></div></div>`;
    const lane=section.querySelector('.garden-lane');
    items.forEach((entry,i)=>{
      const {m, step} = entry;
      const theory = step === null;
      const isDone = done(m) || (!theory && entry.available && step <= m.completed_steps);
      const locked = !entry.available || (!theory && !isDone && step !== m.current_step);
      const isActive = m === active.m && (m.kind === 'THEORY' ? theory : step === (done(m) ? m.step_count : m.current_step));
      const isBoss = m.kind === 'BOSS' && step === m.step_count;
      const wrapper=document.createElement('div');wrapper.className='garden-stop '+(isDone?'is-done':locked?'is-locked':'is-open');wrapper.style.left=offsets[i%offsets.length]+'%';wrapper.style.top=(100+i*170)+'px';
      if(isActive)wrapper.id='active-learning-node';
      const stars = m.record?.steps?.[step]?.stars ?? 0;
      const buttonId = 'garden-stop-' + m.id + '-' + (step ?? 'theory');
      const number = gardenTopicNumber(ch, m);
      const label = theory ? 'Mục ' + number : 'Chặng ' + step;
      const detail = theory ? gardenLessonTitle(m) : (!m.has_theory && step === 1 ? 'Mục ' + number + ' · ' + gardenLessonTitle(m) : '');
      const title = 'Mục ' + number + ' · ' + gardenLessonTitle(m) + ' · ' + (theory ? 'Lý thuyết' : label);
      wrapper.innerHTML=`<button type="button" id="${esc(buttonId)}" class="garden-node${isBoss?' is-boss':''}" aria-label="${esc(title+(locked?' — Chưa mở':isDone?' — Ôn tập':' — Bắt đầu học'))}" ${locked?'aria-disabled="true"':''} ${isActive?'aria-current="step"':''}>${isActive?'<span class="garden-pet"><span id="roadmap-pet-avatar" aria-hidden="true"></span></span><span id="roadmap-pet-speech-text" class="garden-current-speech" aria-hidden="true">Tiếp tục nhé!</span>':'<img class="garden-node-icon" data-garden-kind="'+(isBoss?'boss':'learn')+'" src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=" alt="" width="96" height="96" decoding="async">'}${locked?'<span class="garden-node-badge lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg></span>':isDone?'<span class="garden-node-badge complete" aria-hidden="true">✓</span>':''}</button><div class="garden-stop-label">${theory ? '<strong>' + esc(label) + '</strong>' : '<span class="garden-stars" aria-label="' + stars + ' trên 3 sao">' + '★'.repeat(stars) + '☆'.repeat(3 - stars) + '</span>'}${detail?'<span>'+esc(detail)+'</span>':''}</div>`;
      wrapper.querySelector('button').onclick=()=>{
        if(locked){onSagaLockedClick(wrapper.querySelector('button'), !theory && entry.available);return;}
        currentSagaChapterId=ch.id;setSagaFocusMoc(m);updateChapter(ch);
        if (theory) openTheoryModal(m.id);
        else openCheckpointModal(m.id, step);
      };
      lane.appendChild(wrapper);
    });
    container.appendChild(section);
  });
  const artQuery=matchMedia('(max-width:767px)'),loaded=new Set();
  const themes=['sky','halloween','teachers','christmas','new-year','tet','valentine','womens-day','youth-spring'];
  const theme=()=>themes.includes(document.documentElement.dataset.scenicTheme)?document.documentElement.dataset.scenicTheme:'sky';
  const loadArt=section=>{
    if(!section)return;
    loaded.add(section);
    const base='/assets/garden-v2/'+theme()+'/'+section.dataset.season+'-'+(artQuery.matches?480:960);
    section.style.setProperty('--season-art',CSS.supports('background-image','image-set(url("x.avif") type("image/avif"))')?`image-set(url('${base}.avif') type('image/avif'),url('${base}.webp') type('image/webp'))`:`url('${base}.webp')`);
  };
  const refreshIcons=()=>host.querySelectorAll('[data-garden-kind]').forEach(img=>{
    const current=theme(),src=img.dataset.gardenKind==='boss'?'/assets/garden-v2/nodes/'+current+'-boss.webp':current==='sky'?'/assets/navigation/enrolled.webp':'/assets/seasonal-icons/'+current+'/enrolled.webp';
    if(img.getAttribute('src')!==src)img.src=src;
  });
  const refresh=()=>{if(currentAppView!=='saga')return;loaded.forEach(loadArt);refreshIcons()};
  window.refreshLearningGardenArt=refresh;
  const scenes=[...host.querySelectorAll('.garden-chapter')];
  loadArt(scenes[0]);
  if(scenes[active.index]!==scenes[0])loadArt(scenes[active.index]);
  refreshIcons();
  window.gardenArtObserver=new IntersectionObserver(records=>{
    records.forEach(record=>{if(record.isIntersecting){loadArt(record.target);window.gardenArtObserver.unobserve(record.target);}});
  },{root:document.getElementById('app-main-scroll'),rootMargin:'600px 0px'});
  scenes.forEach(section=>window.gardenArtObserver.observe(section));
  window.gardenThemeObserver=new MutationObserver(refresh);
  window.gardenThemeObserver.observe(document.documentElement,{attributes:true,attributeFilter:['data-scenic-theme']});
  artQuery.addEventListener('change',refresh);
  window.gardenArtCleanup=()=>artQuery.removeEventListener('change',refresh);
  host.querySelector('#btn_garden_current').onclick=()=>scrollToActiveNode(true);
  host.querySelector('#btn_garden_change_course').onclick=()=>navTo('enrolled');
  syncAllPetDisplays();
  const root=document.getElementById('app-main-scroll');
  window.gardenChapterObserver=new IntersectionObserver(records=>{
    const record=records.filter(r=>r.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if(record){const ch=chapters.find(ch=>ch.id===record.target.dataset.chapter);if(ch)updateChapter(ch);}
  },{root,rootMargin:'-5% 0px -70% 0px',threshold:0});
  host.querySelectorAll('.garden-chapter').forEach(el=>window.gardenChapterObserver.observe(el));
}
