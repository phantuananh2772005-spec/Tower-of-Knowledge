function renderLearningGarden(courseData) {
  const host=document.getElementById('saga-roadmap-track');
  if(!host||!courseData?.cac_chuong)return;
  window.gardenChapterObserver?.disconnect();
  window.gardenArtObserver?.disconnect();
  const chapters=courseData.cac_chuong||[], done=m=>['DA_HOAN_THANH','HOAN_THANH'].includes(m?.trang_thai);
  const entries=chapters.flatMap((chapter,index)=>{
    const previous=chapters[index-1]?.cac_moc||[];
    const unlocked=index===0||done(previous.at(-1));
    return (chapter.cac_moc||[]).map((m,i)=>({m,chapter,index,i,unlocked,available:unlocked&&(done(m)||m.trang_thai==='DA_MO')}));
  });
  const active=entries.find(e=>e.unlocked&&e.m.trang_thai==='DA_MO')||entries.filter(e=>e.available).at(-1)||entries[0];
  if(!active){host.innerHTML='<p class="garden-empty">Môn học này chưa có mốc học.</p>';return;}
  currentSagaChapterId=active.chapter.ma_chuong;
  setSagaFocusMoc(active.m);
  const complete=entries.filter(e=>done(e.m)).length;
  const name=courseData.mon_hoc?.ten_mon||'Lộ trình học tập';
  const courseCode=courseData.mon_hoc?.slug==='chuyen-doi-so'?'CĐS':courseData.mon_hoc?.ma_mon==='mon_csdl'?'CSDL':'Môn học';
  function updateChapter(ch){
    currentSagaChapterId=ch.ma_chuong;
    if(currentAppView!=='saga')return;
    document.getElementById('sidebar-saga-course-tag').textContent=courseCode+' · C'+(ch.thu_tu||chapters.indexOf(ch)+1);
  }
  updateChapter(active.chapter);
  const esc=escapeHtml;
  host.innerHTML=`<div class="garden-map"><div class="garden-intro"><div><span class="garden-eyebrow">HÀNH TRÌNH TRI THỨC</span><h2>${esc(name)}</h2><p>Mỗi bước nhỏ, thêm một điều mới.</p></div><div class="garden-summary"><span class="garden-progress">${complete}/${entries.length} mốc đã hoàn thành</span><div class="garden-course-progress" role="progressbar" aria-label="Tiến độ môn học" aria-valuenow="${complete}" aria-valuemin="0" aria-valuemax="${entries.length}"><span style="width:${complete/entries.length*100}%"></span></div><button id="btn_garden_change_course" type="button">Đổi môn →</button></div></div><div class="garden-chapters"></div><div class="garden-finish"><span aria-hidden="true">🏁</span><strong>Đích đến của hành trình</strong><span>Hoàn thành từng mốc để chinh phục môn học.</span></div></div><div class="garden-jump-wrap"><button id="btn_garden_current" type="button">↟ Về mốc đang học</button></div>`;
  const container=host.querySelector('.garden-chapters');
  chapters.forEach((ch,index)=>{
    const items=entries.filter(e=>e.index===index), unlocked=index===0||items.some(e=>e.unlocked);
    const section=document.createElement('section');section.className='garden-chapter';section.dataset.chapter=ch.ma_chuong;section.dataset.season=['spring','summer','autumn','winter'][index%4];section.id='garden-chapter-'+ch.ma_chuong;
    const offsets=[50,66,56,34,44,63,50],height=Math.max(220,items.length*170+150), points=items.map((e,i)=>({x:offsets[i%offsets.length]*6,y:136+i*170}));
    let d='';points.forEach((p,i)=>{if(!i){d=`M ${p.x} ${p.y}`;return;}const last=points[i-1],mid=(last.y+p.y)/2;d+=` C ${last.x} ${mid}, ${p.x} ${mid}, ${p.x} ${p.y}`;});
    section.innerHTML=`<header class="garden-chapter-heading"><span class="garden-chapter-number">${String(ch.thu_tu||index+1).padStart(2,'0')}</span><div><h3>${esc(ch.tieu_de||'Chương '+(index+1))}</h3><p>${unlocked?'Khám phá từng mốc trên đường đi':'Hoàn thành chương trước để mở khóa'}</p></div><span class="garden-chapter-state">${unlocked?'🌿':'🔒'}</span><span class="garden-chapter-score" aria-label="Sao của chương">★ ${(ch.cac_moc||[]).reduce((sum,m)=>sum+getStarCountForMoc(m),0)}/${items.length*3}</span></header><div class="garden-landscape"><div class="garden-lane" style="height:${height}px"><svg class="garden-trail" aria-hidden="true" viewBox="0 0 600 ${height}" preserveAspectRatio="none"><path class="garden-trail-shadow" d="${d}"/><path class="garden-trail-line" d="${d}"/></svg></div></div>`;
    const lane=section.querySelector('.garden-lane');
    items.forEach((entry,i)=>{
      const {m}=entry,isDone=done(m),isActive=entry===active,locked=!entry.available,isBoss=m.loai_moc==='THU_THACH_BOSS'||i===items.length-1;
      const wrapper=document.createElement('div');wrapper.className='garden-stop '+(isDone?'is-done':locked?'is-locked':'is-open');wrapper.style.left=offsets[i%offsets.length]+'%';wrapper.style.top=(100+i*170)+'px';
      if(isActive)wrapper.id='active-learning-node';
      const buttonId=(locked?'btn_moc_lock_':isDone?'btn_moc_done_':'btn_moc_active_')+m.ma_moc;
      const title=m.tieu_de||`Mốc ${index+1}.${i+1}`,label=title.split(':')[0],detail=title.includes(':')?title.slice(title.indexOf(':')+1).trim():'';
      wrapper.innerHTML=`<button type="button" id="${esc(buttonId)}" class="garden-node${isBoss?' is-boss':''}" aria-label="${esc(title+(locked?' — Chưa mở':isDone?' — Ôn tập':' — Bắt đầu học'))}" ${locked?'aria-disabled="true"':''} ${isActive?'aria-current="step"':''}>${isActive?'<span class="garden-pet"><span id="roadmap-pet-avatar" aria-hidden="true"></span></span><span id="roadmap-pet-speech-text" class="garden-current-speech" aria-hidden="true">Tiếp tục nhé!</span>':'<img class="garden-node-icon" src="/design/map-assets/'+(isBoss?'pixel-boss-paper':'pixel-learn-v2')+'.webp" alt="" width="96" height="96" decoding="async">'}${locked?'<span class="garden-node-badge lock" aria-hidden="true"><svg viewBox="0 0 24 24"><rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/></svg></span>':isDone?'<span class="garden-node-badge complete" aria-hidden="true">✓</span>':''}</button><div class="garden-stop-label"><strong>${esc(label)}</strong>${detail?'<span>'+esc(detail)+'</span>':''}${isDone?'<span class="garden-stars" aria-label="'+getStarCountForMoc(m)+' sao">'+'★'.repeat(getStarCountForMoc(m))+'☆'.repeat(3-getStarCountForMoc(m))+'</span>':''}</div>`;
      wrapper.querySelector('button').onclick=()=>{
        if(locked){onSagaLockedClick(m.ma_moc);return;}
        currentSagaChapterId=ch.ma_chuong;setSagaFocusMoc(m);updateChapter(ch);startMocLearning(m.ma_moc);
      };
      lane.appendChild(wrapper);
    });
    container.appendChild(section);
  });
  const artSize=matchMedia('(max-width:767px)').matches?480:960;
  const loadArt=section=>{
    const base='/design/map-assets/optimized/'+section.dataset.season+'-'+artSize;
    section.style.setProperty('--season-art',CSS.supports('background-image','image-set(url("x.avif") type("image/avif"))')?`image-set(url('${base}.avif') type('image/avif'),url('${base}.webp') type('image/webp'))`:`url('${base}.webp')`);
  };
  const scenes=[...host.querySelectorAll('.garden-chapter')];
  // Load the initial/active scenery immediately; fetch other scenes near the viewport.
  loadArt(scenes[0]);
  if(scenes[active.index]!==scenes[0])loadArt(scenes[active.index]);
  window.gardenArtObserver=new IntersectionObserver(records=>{
    records.forEach(record=>{if(record.isIntersecting){loadArt(record.target);window.gardenArtObserver.unobserve(record.target);}});
  },{root:document.getElementById('app-main-scroll'),rootMargin:'600px 0px'});
  scenes.forEach(section=>window.gardenArtObserver.observe(section));
  host.querySelector('#btn_garden_current').onclick=()=>scrollToActiveNode(true);
  host.querySelector('#btn_garden_change_course').onclick=()=>navTo('enrolled');
  syncAllPetDisplays();
  const root=document.getElementById('app-main-scroll');
  window.gardenChapterObserver=new IntersectionObserver(records=>{
    const record=records.filter(r=>r.isIntersecting).sort((a,b)=>a.boundingClientRect.top-b.boundingClientRect.top)[0];
    if(record){const ch=chapters.find(ch=>ch.ma_chuong===record.target.dataset.chapter);if(ch)updateChapter(ch);}
  },{root,rootMargin:'-5% 0px -70% 0px',threshold:0});
  host.querySelectorAll('.garden-chapter').forEach(el=>window.gardenChapterObserver.observe(el));
}
