const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../public/index.html');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add CSS rules
const oldCss = `    #app-sidebar.collapsed .sidebar-footer .sidebar-stats {
      display: none !important;
    }
  </style>`;

const newCss = `    #app-sidebar.collapsed .sidebar-footer .sidebar-stats {
      display: none !important;
    }

    /* Hiệu ứng bản đồ leo tháp uốn lượn SVG Bezier */
    @keyframes bob {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }
    .bob { animation: bob 1.4s ease-in-out infinite; }
    .shake { animation: shake 0.35s ease-in-out; }
    .nd { cursor: pointer; transition: filter 0.15s ease; }
    .nd:hover { filter: brightness(1.15); }
  </style>`;

if (content.includes(oldCss.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldCss.replace(/\n/g, '\r\n'), newCss.replace(/\n/g, '\r\n'));
  console.log('✓ Patched CSS');
} else if (content.includes(oldCss)) {
  content = content.replace(oldCss, newCss);
  console.log('✓ Patched CSS (LF)');
} else {
  console.warn('CSS anchor not found');
}

// 2. Patch view-saga HTML
const oldViewSaga = `      <!-- ================= VIEW 1: BẢN ĐỒ LỘ TRÌNH LEO THÁP (CHUYỂN VÀO KHI HỌC MÔN) ================= -->
      <section id="view-saga" class="hidden px-4 max-w-lg w-full mx-auto pt-6 pb-16">

        <!-- Dynamic Roadmap Content rendered via loadRoadmap() from live DB -->
        <div id="saga-roadmap-track" class="flex flex-col items-center gap-6 pt-4 pb-16 min-h-[300px]">
          <div class="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
            <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span class="text-xs font-medium">Đang tải bản đồ mốc học từ hệ thống...</span>
          </div>
        </div>

    </section>`;

const newViewSaga = `      <!-- ================= VIEW 1: BẢN ĐỒ LỘ TRÌNH LEO THÁP (CHUYỂN VÀO KHI HỌC MÔN) ================= -->
      <section id="view-saga" class="hidden px-4 max-w-2xl w-full mx-auto pt-4 pb-16">

        <!-- Header & Chapter Selector Toolbar -->
        <div class="w-full bg-[var(--card)]/90 border border-indigo-500/25 rounded-2xl p-3 mb-4 shadow-xl backdrop-blur-sm flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-sm font-bold text-[var(--foreground)] flex items-center gap-1.5">
              <span>🗺️</span>
              <span>Bản Đồ Tháp Mốc Học</span>
            </span>
            <select id="saga-chapter-select" onchange="changeSagaChapter(this.value)" class="bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)] rounded-xl px-2.5 py-1.5 font-semibold outline-hidden cursor-pointer">
              <option value="ch_csdl_01">Chương 1: Tổng quan CSDL (5 mốc)</option>
              <option value="ch_csdl_02">Chương 2: Mô hình ERD</option>
              <option value="ch_csdl_03">Chương 3: Ngôn ngữ SQL</option>
              <option value="ch_csdl_04">Chương 4: Chuẩn hóa CSDL</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <span id="saga-chapter-stars-badge" class="text-xs font-bold text-amber-500 font-mono bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-lg flex items-center gap-1">
              <span>⭐</span>
              <span id="saga-chapter-stars-count">0/15 sao</span>
            </span>
          </div>
        </div>

        <!-- Dynamic Roadmap Content rendered via renderRealSagaRoadmap() from live DB -->
        <div id="saga-roadmap-track" class="w-full flex flex-col items-center gap-4">
          <div class="flex flex-col items-center justify-center py-16 text-[var(--muted-foreground)]">
            <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <span class="text-xs font-medium">Đang tải bản đồ mốc học từ hệ thống...</span>
          </div>
        </div>

      </section>`;

if (content.includes(oldViewSaga.replace(/\n/g, '\r\n'))) {
  content = content.replace(oldViewSaga.replace(/\n/g, '\r\n'), newViewSaga.replace(/\n/g, '\r\n'));
  console.log('✓ Patched view-saga HTML');
} else if (content.includes(oldViewSaga)) {
  content = content.replace(oldViewSaga, newViewSaga);
  console.log('✓ Patched view-saga HTML (LF)');
} else {
  console.warn('view-saga HTML anchor not found');
}

// 3. Patch renderRealSagaRoadmap in scripts
const oldRoadmapStart = '    function renderRealSagaRoadmap(courseData) {';
const oldRoadmapEnd = '      container.innerHTML = htmlOutput;\r\n      syncAllPetDisplays();\r\n      scrollToActiveNode(true);\r\n    }';
const oldRoadmapEndLF = '      container.innerHTML = htmlOutput;\n      syncAllPetDisplays();\n      scrollToActiveNode(true);\n    }';

const startIdx = content.indexOf(oldRoadmapStart);
let endIdx = -1;
if (content.includes(oldRoadmapEnd)) {
  endIdx = content.indexOf(oldRoadmapEnd) + oldRoadmapEnd.length;
} else if (content.includes(oldRoadmapEndLF)) {
  endIdx = content.indexOf(oldRoadmapEndLF) + oldRoadmapEndLF.length;
}

if (startIdx !== -1 && endIdx !== -1) {
  const newRoadmapCode = `    let currentSagaChapterId = 'ch_csdl_01';
    let sagaDragD = 0;
    let sagaCumLengths = [0];
    let sagaSegs = [];
    let sagaBusy = false;

    function getStarCountForMoc(moc) {
      if (!moc || (moc.trang_thai !== 'HOAN_THANH' && moc.trang_thai !== 'DA_HOAN_THANH')) return 0;
      const score = (typeof moc.diem_dat_duoc === 'number' && moc.diem_dat_duoc > 0) ? moc.diem_dat_duoc : 100;
      if (score >= 100) return 3;
      if (score >= 80) return 2;
      if (score >= 70) return 1;
      return 1;
    }

    function onSagaLockedClick(mocId) {
      const el = document.getElementById('btn_moc_lock_' + mocId);
      if (el) {
        el.classList.remove('shake');
        void el.getBoundingClientRect();
        el.classList.add('shake');
      }
      const speechTxt = document.getElementById('roadmap-pet-speech-text');
      if (speechTxt) speechTxt.textContent = 'Hoàn thành mốc trước đã! 🔒';
      showToast('Mốc này đang khóa. Hãy hoàn thành các mốc trước để mở khóa!', 'info');
      setTimeout(() => {
        if (speechTxt) speechTxt.textContent = 'Học tiếp nào! 🎯';
      }, 2000);
    }

    function changeSagaChapter(chId) {
      currentSagaChapterId = chId || 'ch_csdl_01';
      if (liveCourseData) {
        renderRealSagaRoadmap(liveCourseData);
      }
    }

    function renderRealSagaRoadmap(courseData) {
      const container = document.getElementById('saga-roadmap-track');
      if (!container || !courseData || !courseData.cac_chuong) return;

      // Update chapter select dropdown if present
      const chSelect = document.getElementById('saga-chapter-select');
      if (chSelect && chSelect.value !== currentSagaChapterId) {
        chSelect.value = currentSagaChapterId;
      }

      // Calculate overall progress across course
      let totalMocs = 0;
      let completedMocs = 0;
      courseData.cac_chuong.forEach(ch => {
        (ch.cac_moc || []).forEach(m => {
          totalMocs++;
          if (m.trang_thai === 'DA_HOAN_THANH' || m.trang_thai === 'HOAN_THANH') completedMocs++;
        });
      });

      const pct = totalMocs > 0 ? Math.round((completedMocs / totalMocs) * 100) : 0;
      const progText = document.getElementById('topbar-progress-text');
      if (progText) progText.textContent = \`Đã qua \${completedMocs}/\${totalMocs} mốc\`;
      const progBar = document.getElementById('topbar-progress-bar');
      if (progBar) progBar.style.width = \`\${pct}%\`;

      // Find active chapter
      const activeChapter = courseData.cac_chuong.find(c => c.ma_chuong === currentSagaChapterId) || courseData.cac_chuong[0];
      const mocs = activeChapter.cac_moc || [];
      if (mocs.length === 0) {
        container.innerHTML = '<div class="py-12 text-center text-slate-400 text-xs">Chưa có mốc học tập trong chương này.</div>';
        return;
      }

      // Calculate stars for chapter badge
      const earnedStars = mocs.reduce((sum, m) => sum + getStarCountForMoc(m), 0);
      const maxStars = mocs.length * 3;
      const starsBadge = document.getElementById('saga-chapter-stars-count');
      if (starsBadge) {
        starsBadge.textContent = \`\${earnedStars}/\${maxStars} sao\`;
      }

      // Determine active milestone index (cur)
      let cur = 0;
      const foundActive = mocs.findIndex(m => m.trang_thai === 'DA_MO');
      if (foundActive >= 0) {
        cur = foundActive;
      } else {
        const lastDone = mocs.map(m => m.trang_thai).lastIndexOf('DA_HOAN_THANH');
        cur = lastDone >= 0 ? Math.min(mocs.length - 1, lastDone + 1) : 0;
      }

      // Coordinates setup
      let coords = [];
      let gateCoord = { x: 340, y: 150 };

      if (mocs.length === 5) {
        coords = [
          { x: 300, y: 880 },
          { x: 400, y: 760 },
          { x: 280, y: 630 },
          { x: 400, y: 500 },
          { x: 340, y: 330 }
        ];
        gateCoord = { x: 340, y: 150 };
      } else {
        const startY = 820, endY = 360;
        const xOffsets = [300, 410, 270, 410, 340];
        const stepY = (startY - endY) / Math.max(1, mocs.length - 1);
        for (let i = 0; i < mocs.length; i++) {
          coords.push({
            x: xOffsets[i % xOffsets.length],
            y: Math.round(startY - i * stepY)
          });
        }
        gateCoord = { x: 340, y: 160 };
      }

      const N = mocs.map((m, i) => ({
        x: coords[i].x,
        y: coords[i].y,
        l: m.tieu_de ? m.tieu_de.split(':')[0] : \`Mốc 1.\${i + 1}\`,
        raw: m
      }));

      // Render SVG Roadmap
      container.innerHTML = \`
        <div class="w-full bg-[#0b1020] rounded-3xl overflow-hidden border border-indigo-500/30 shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative">
          <svg id="saga-map-svg" width="100%" viewBox="0 0 680 1010" role="img" class="block touch-manipulation select-none">
            <title>Bản đồ học tập - Tháp Tri Thức</title>
            <desc>Bản đồ các mốc học zigzag có đường nối Bezier, bầu trời đêm công nghệ và linh vật Pet di chuyển</desc>
          </svg>
        </div>
      \`;

      const NS = 'http://www.w3.org/2000/svg';
      const svg = document.getElementById('saga-map-svg');
      function el(t, a, p) {
        const e = document.createElementNS(NS, t);
        for (const k in a) e.setAttribute(k, a[k]);
        (p || svg).appendChild(e);
        return e;
      }

      const gBg = el('g', {}),
            gPath = el('g', {}),
            gNodes = el('g', {}),
            gDr = el('g', {});

      // Seeded random for consistent twinkling stars
      let seed = 7;
      function rnd() {
        seed = (seed * 16807) % 2147483647;
        return seed / 2147483647;
      }

      // Background Gradient Sections
      el('rect', { x: 0, y: 0, width: 680, height: 1010, fill: '#0b1020' }, gBg);
      el('rect', { x: 0, y: 0, width: 680, height: 330, fill: '#10163a' }, gBg);
      el('rect', { x: 0, y: 330, width: 680, height: 340, fill: '#0e1433' }, gBg);

      // 80 Twinkling stars
      for (let i = 0; i < 80; i++) {
        const c = el('circle', {
          cx: rnd() * 680,
          cy: rnd() * 1000,
          r: rnd() * 1.4 + 0.4,
          fill: '#cfd8ff',
          opacity: 0.35 + rnd() * 0.5
        }, gBg);
        if (i % 6 === 0) {
          el('animate', {
            attributeName: 'opacity',
            values: '0.2;1;0.2',
            dur: (2 + rnd() * 3) + 's',
            repeatCount: 'indefinite'
          }, c);
        }
      }

      // Isometric Database Cylinder decoration
      function db(x, y, s, col) {
        const g = el('g', { opacity: 0.45, transform: 'translate(' + x + ',' + y + ') scale(' + s + ')' }, gBg);
        el('rect', { x: -30, y: -24, width: 60, height: 48, fill: col }, g);
        el('ellipse', { cx: 0, cy: 24, rx: 30, ry: 10, fill: col }, g);
        el('ellipse', { cx: 0, cy: -24, rx: 30, ry: 10, fill: '#9fb4ff' }, g);
        el('path', { d: 'M-30 -6 A30 10 0 0 0 30 -6', fill: 'none', stroke: '#0b1020', 'stroke-width': 2 }, g);
        el('path', { d: 'M-30 10 A30 10 0 0 0 30 10', fill: 'none', stroke: '#0b1020', 'stroke-width': 2 }, g);
      }

      // Server Rack decoration
      function rack(x, y, s, col) {
        const g = el('g', { opacity: 0.4, transform: 'translate(' + x + ',' + y + ') scale(' + s + ')' }, gBg);
        for (let i = 0; i < 3; i++) {
          el('rect', { x: -32, y: -30 + i * 22, width: 64, height: 18, rx: 3, fill: col }, g);
          el('circle', { cx: -22, cy: -21 + i * 22, r: 3, fill: '#5DCAA5' }, g);
          el('rect', { x: -8, y: -23 + i * 22, width: 34, height: 4, fill: '#0b1020' }, g);
        }
      }

      // Tech Hexagon decoration
      function hexo(x, y, r, col) {
        const p = [];
        for (let i = 0; i < 6; i++) {
          const a = Math.PI / 3 * i;
          p.push((x + r * Math.cos(a)).toFixed(1) + ',' + (y + r * Math.sin(a)).toFixed(1));
        }
        el('polygon', { points: p.join(' '), fill: 'none', stroke: col, 'stroke-width': 2, opacity: 0.35 }, gBg);
      }

      db(95, 330, 1.1, '#3C3489');
      db(130, 720, 0.9, '#3C3489');
      db(570, 560, 1, '#185FA5');
      db(585, 900, 0.8, '#3C3489');
      db(120, 980, 0.6, '#185FA5');

      rack(570, 230, 1, '#26215C');
      rack(100, 520, 0.9, '#26215C');
      rack(560, 780, 0.8, '#26215C');
      rack(105, 130, 0.8, '#26215C');

      hexo(540, 90, 26, '#7F77DD');
      hexo(150, 860, 22, '#7F77DD');
      hexo(590, 400, 18, '#378ADD');
      hexo(60, 620, 16, '#378ADD');

      // Helper function to draw star polygons
      function drawStarPolygon(cx, cy, R, col, strokeCol) {
        const p = [];
        for (let i = 0; i < 10; i++) {
          const r = i % 2 ? R * 0.45 : R;
          const a = -Math.PI / 2 + Math.PI / 5 * i;
          p.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
        }
        return el('polygon', { points: p.join(' '), fill: col, stroke: strokeCol || '#d97706', 'stroke-width': 0.8 }, gNodes);
      }

      sagaSegs = [];
      sagaCumLengths = [0];

      // Draw Bezier curved path
      for (let i = 0; i < N.length - 1; i++) {
        const a = N[i], b = N[i + 1], m = (a.y + b.y) / 2;
        const d = 'M' + a.x + ' ' + a.y + ' C' + a.x + ' ' + m + ' ' + b.x + ' ' + m + ' ' + b.x + ' ' + b.y;

        // Wide underlay track
        el('path', { d: d, fill: 'none', stroke: '#1a2342', 'stroke-width': 20, 'stroke-linecap': 'round' }, gPath);

        const reached = (i + 1 <= cur);
        const s = el('path', {
          d: d,
          fill: 'none',
          stroke: reached ? '#1D9E75' : '#3a4766',
          'stroke-width': reached ? 10 : 6,
          'stroke-linecap': 'round',
          'stroke-dasharray': reached ? 'none' : '2 14'
        }, gPath);

        sagaSegs.push(s);
        sagaCumLengths.push(sagaCumLengths[sagaCumLengths.length - 1] + s.getTotalLength());
      }

      // Connecting line to Gate
      const lastNode = N[N.length - 1];
      el('path', {
        d: 'M' + lastNode.x + ' ' + (lastNode.y - 55) + ' L' + gateCoord.x + ' ' + (gateCoord.y + 40),
        stroke: '#3a4766',
        'stroke-width': 5,
        'stroke-dasharray': '2 12',
        'stroke-linecap': 'round',
        fill: 'none'
      }, gPath);

      // Chapter Gate
      const gt = el('g', { class: 'cursor-pointer' }, gPath);
      el('rect', { x: gateCoord.x - 70, y: gateCoord.y - 20, width: 140, height: 44, rx: 22, fill: '#1a2342', stroke: '#7F77DD', 'stroke-width': 2 }, gt);
      const nextChNum = (currentSagaChapterId === 'ch_csdl_01') ? '2' : (currentSagaChapterId === 'ch_csdl_02') ? '3' : '4';
      const nextChId = (currentSagaChapterId === 'ch_csdl_01') ? 'ch_csdl_02' : (currentSagaChapterId === 'ch_csdl_02') ? 'ch_csdl_03' : 'ch_csdl_04';
      el('text', { x: gateCoord.x, y: gateCoord.y + 8, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 600, fill: '#CECBF6' }, gt).textContent = \`Chương \${nextChNum}\`;
      el('line', { x1: gateCoord.x - 70, y1: gateCoord.y + 24, x2: gateCoord.x - 70, y2: gateCoord.y + 60, stroke: '#7F77DD', 'stroke-width': 3 }, gt);
      el('line', { x1: gateCoord.x + 70, y1: gateCoord.y + 24, x2: gateCoord.x + 70, y2: gateCoord.y + 60, stroke: '#7F77DD', 'stroke-width': 3 }, gt);
      gt.onclick = () => {
        changeSagaChapter(nextChId);
      };

      // Draw Checkpoints with HTML Buttons via foreignObject
      N.forEach((n, i) => {
        const m = n.raw;
        const isBoss = (m.loai_moc === 'THU_THACH_BOSS' || i === N.length - 1);
        const isCompleted = (m.trang_thai === 'HOAN_THANH' || m.trang_thai === 'DA_HOAN_THANH');
        const isActive = (i === cur || m.trang_thai === 'DA_MO');
        const isLocked = (!isCompleted && !isActive);

        const g = el('g', { class: 'nd' }, gNodes);
        g.dataset.i = i;

        if (isBoss) {
          // Boss Node: Big 3D Hexagon
          const hp = (r, cy) => {
            const p = [];
            for (let k = 0; k < 6; k++) {
              const a = Math.PI / 3 * k + Math.PI / 6;
              p.push((n.x + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
            }
            return p.join(' ');
          };
          el('polygon', { points: hp(54, n.y + 8), fill: isLocked ? '#2a2412' : '#8a5a0b' }, g);
          el('polygon', { points: hp(54, n.y), fill: isLocked ? '#3a3016' : '#d89a1b', stroke: isLocked ? '#5a4a1c' : '#fac775', 'stroke-width': 4 }, g);
          el('polygon', { points: hp(40, n.y), fill: isLocked ? '#241d0e' : '#412402' }, g);

          // Crown polygon
          const c = el('g', { opacity: isLocked ? 0.5 : 1 }, g);
          el('polygon', {
            points: (n.x - 22) + ',' + (n.y + 14) + ' ' + (n.x - 26) + ',' + (n.y - 14) + ' ' + (n.x - 11) + ',' + (n.y - 2) + ' ' + n.x + ',' + (n.y - 20) + ' ' + (n.x + 11) + ',' + (n.y - 2) + ' ' + (n.x + 26) + ',' + (n.y - 14) + ' ' + (n.x + 22) + ',' + (n.y + 14),
            fill: '#fac775',
            stroke: '#ef9f27',
            'stroke-width': 2
          }, c);
          [[n.x - 26, n.y - 14], [n.x, n.y - 20], [n.x + 26, n.y - 14]].forEach(q => {
            el('circle', { cx: q[0], cy: q[1], r: 4, fill: '#fcebeb' }, c);
          });

          // Clickable button
          const fo = el('foreignObject', { x: n.x - 45, y: n.y - 45, width: 90, height: 90 }, g);
          fo.innerHTML = \`<button id="btn_moc_boss_\${m.ma_moc}" onclick="\${isLocked ? \`onSagaLockedClick('\${m.ma_moc}')\` : \`startMocLearning('\${m.ma_moc}')\`}" class="w-full h-full opacity-0 cursor-pointer" title="\${escapeHtml(m.tieu_de)}"></button>\`;

          // Label
          el('text', { x: n.x, y: n.y + 84, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: isLocked ? '#7a6528' : '#fac775' }, g).textContent = n.l;

        } else if (isActive) {
          // Active Learning Node with pulsating radar rings
          const r = 38;
          const ring = el('circle', { cx: n.x, cy: n.y, r: r + 6, fill: 'none', stroke: '#5DCAA5', 'stroke-width': 3 }, g);
          el('animate', { attributeName: 'r', values: (r + 4) + ';' + (r + 18) + ';' + (r + 4), dur: '1.6s', repeatCount: 'indefinite' }, ring);
          el('animate', { attributeName: 'opacity', values: '0.9;0;0.9', dur: '1.6s', repeatCount: 'indefinite' }, ring);

          el('circle', { cx: n.x, cy: n.y + 6, r: r, fill: '#0F6E56' }, g);
          el('circle', { cx: n.x, cy: n.y, r: r, fill: '#22c08a' }, g);

          // Play triangle icon
          el('polygon', {
            points: (n.x - 8) + ',' + (n.y - 12) + ' ' + (n.x + 13) + ',' + n.y + ' ' + (n.x - 8) + ',' + (n.y + 12),
            fill: '#fff'
          }, g);

          // Clickable button
          const fo = el('foreignObject', { x: n.x - 38, y: n.y - 38, width: 76, height: 76 }, g);
          fo.innerHTML = \`<button id="btn_moc_active_\${m.ma_moc}" onclick="startMocLearning('\${m.ma_moc}')" class="w-full h-full opacity-0 cursor-pointer" title="Bắt đầu: \${escapeHtml(m.tieu_de)}"></button>\`;

          // Label
          el('text', { x: n.x, y: n.y + r + 36, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#5DCAA5' }, g).textContent = n.l;

        } else if (isCompleted) {
          // Completed Node: Green 3D circle with Checkmark + Gold Stars
          const r = 30;
          el('circle', { cx: n.x, cy: n.y + 6, r: r, fill: '#0F6E56' }, g);
          el('circle', { cx: n.x, cy: n.y, r: r, fill: '#22c08a' }, g);

          // Checkmark
          el('path', {
            d: 'M' + (n.x - 10) + ' ' + n.y + ' L' + (n.x - 3) + ' ' + (n.y + 8) + ' L' + (n.x + 11) + ' ' + (n.y - 9),
            fill: 'none',
            stroke: '#fff',
            'stroke-width': 5,
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round'
          }, g);

          // Gold Stars based on accuracy percentage
          const starCount = getStarCountForMoc(m);
          const starOffsets = (starCount === 3) ? [-18, 0, 18] : (starCount === 2) ? [-10, 10] : [0];
          starOffsets.forEach((dx, k) => {
            const isCenterBig = (starCount === 3 && k === 1);
            drawStarPolygon(n.x + dx, n.y + r + 16, isCenterBig ? 8.5 : 7, '#fac775');
          });

          // Clickable button for review
          const fo = el('foreignObject', { x: n.x - 30, y: n.y - 30, width: 60, height: 60 }, g);
          fo.innerHTML = \`<button id="btn_moc_done_\${m.ma_moc}" onclick="startMocLearning('\${m.ma_moc}')" class="w-full h-full opacity-0 cursor-pointer" title="Ôn tập: \${escapeHtml(m.tieu_de)}"></button>\`;

          // Label
          el('text', { x: n.x, y: n.y + r + 38, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#b9c2dd' }, g).textContent = n.l;

        } else {
          // Locked Node: Steel padlock
          const r = 30;
          el('circle', { cx: n.x, cy: n.y + 6, r: r, fill: '#171d33' }, g);
          el('circle', { cx: n.x, cy: n.y, r: r, fill: '#2a3350' }, g);

          // Padlock
          el('rect', { x: n.x - 8, y: n.y - 3, width: 16, height: 13, rx: 2, fill: '#7a8199' }, g);
          el('path', {
            d: 'M' + (n.x - 5) + ' ' + (n.y - 3) + ' V' + (n.y - 8) + ' A5 5 0 0 1 ' + (n.x + 5) + ' ' + (n.y - 8) + ' V' + (n.y - 3),
            fill: 'none',
            stroke: '#7a8199',
            'stroke-width': 3
          }, g);

          // Clickable locked trigger
          const fo = el('foreignObject', { x: n.x - 30, y: n.y - 30, width: 60, height: 60 }, g);
          fo.innerHTML = \`<div id="btn_moc_lock_\${m.ma_moc}" onclick="onSagaLockedClick('\${m.ma_moc}')" class="w-full h-full cursor-not-allowed"></div>\`;

          // Label
          el('text', { x: n.x, y: n.y + r + 38, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#5d6785' }, g).textContent = n.l;
        }

        g.addEventListener('click', () => {
          if (!isLocked) {
            slidePetToNode(i);
          }
        });
      });

      // Bottom Start Marker
      const sx = el('text', {
        x: 340,
        y: 985,
        'text-anchor': 'middle',
        'font-size': 12,
        fill: '#7a8199',
        'letter-spacing': 1.5,
        'font-weight': 600
      }, gNodes);
      sx.textContent = '▲ XUẤT PHÁT TỪ ĐÂY ▲';

      // Real User Equipped Pet Container (Integrated with syncAllPetDisplays)
      const dg = el('g', { id: 'active-learning-node' }, gDr);
      const bub = el('g', { transform: 'translate(-55,-44)' }, dg);
      el('rect', { x: 0, y: 0, width: 110, height: 26, rx: 13, fill: '#0b1020', stroke: '#1D9E75', 'stroke-width': 1.5 }, bub);
      const bt = el('text', { id: 'roadmap-pet-speech-text', x: 55, y: 17, 'text-anchor': 'middle', 'font-size': 12, fill: '#5DCAA5', 'font-weight': 600 }, bub);
      bt.textContent = 'Học tiếp nào! 🎯';

      const bodyG = el('g', { class: 'bob' }, dg);
      const foPet = el('foreignObject', { x: -30, y: -95, width: 60, height: 60, class: 'overflow-visible pointer-events-none' }, bodyG);
      foPet.innerHTML = \`<div id="roadmap-pet-avatar" class="w-14 h-14 flex items-center justify-center filter drop-shadow-md mx-auto"></div>\`;

      function pointAt(d) {
        if (sagaSegs.length === 0) return { x: N[0].x, y: N[0].y };
        let i = 0;
        while (i < sagaSegs.length - 1 && d > sagaCumLengths[i + 1]) i++;
        const seg = sagaSegs[i];
        if (!seg) return { x: N[0].x, y: N[0].y };
        const L = seg.getTotalLength();
        const p = seg.getPointAtLength(Math.min(Math.max(d - sagaCumLengths[i], 0), L));
        return p;
      }

      function placePet(d) {
        const p = pointAt(d);
        dg.setAttribute('transform', 'translate(' + p.x + ',' + p.y + ')');
      }

      function slidePetToNode(targetIdx) {
        if (sagaBusy) return;
        const targetD = sagaCumLengths[Math.min(targetIdx, N.length - 1)] || 0;
        sagaBusy = true;
        const fromD = sagaDragD, t0 = performance.now(), dur = 400 + Math.abs(targetD - fromD) * 2.2;
        bt.textContent = 'Đi thôi!';

        function f(t) {
          let k = Math.min((t - t0) / dur, 1);
          k = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
          sagaDragD = fromD + (targetD - fromD) * k;
          placePet(sagaDragD);
          if (k < 1) {
            requestAnimationFrame(f);
          } else {
            sagaBusy = false;
            bt.textContent = (targetIdx === cur) ? 'Học tiếp nào! 🎯' : 'Ôn lại nhé! ✨';
          }
        }
        requestAnimationFrame(f);
      }

      // Initial placement at active node
      sagaDragD = sagaCumLengths[Math.min(cur, N.length - 1)] || 0;
      placePet(sagaDragD);

      syncAllPetDisplays();
      scrollToActiveNode(true);
    }`;

  const before = content.slice(0, startIdx);
  const after = content.slice(endIdx);
  content = before + newRoadmapCode.replace(/\n/g, '\r\n') + after;
  console.log('✓ Patched renderRealSagaRoadmap in scripts');
} else {
  console.warn('Could not locate renderRealSagaRoadmap in script tags:', { startIdx, endIdx });
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('✅ Finished patching public/index.html');
