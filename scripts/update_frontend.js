const fs = require('fs');

let html = fs.readFileSync('public/index.html', 'utf8');

// 1. Insert #modal-theory before </main>
const theoryModalHtml = `    <!-- ================= MODAL ĐỌC BÀI LÝ THUYẾT (THEORY LESSON MODAL) ================= -->
    <div id="modal-theory" class="hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs transition-opacity duration-200" onclick="if(event.target===this)closeTheoryModal()">
      <div class="bg-[var(--card)] border border-[var(--border)] rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--background)]/50">
          <div class="flex items-center gap-2.5">
            <span class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-base">📖</span>
            <div>
              <h3 id="theory-title" class="font-bold text-sm text-[var(--foreground)]">Khái niệm CSDL & Các Mức Trừu Tượng</h3>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">Lý thuyết cốt lõi</span>
                <span id="theory-reward-badge" class="text-[10px] text-[var(--muted-foreground)]">🎁 Thưởng: +10 🪙 Xu · +15 ⭐ EXP</span>
              </div>
            </div>
          </div>
          <button onclick="closeTheoryModal()" class="w-8 h-8 rounded-lg hover:bg-[var(--border)]/50 text-[var(--muted-foreground)] hover:text-[var(--foreground)] flex items-center justify-center text-sm transition cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Body cuộn được chứa nội dung lý thuyết -->
        <div id="theory-content" class="p-6 overflow-y-auto space-y-4 text-xs leading-relaxed text-[var(--foreground)] font-normal">
          <!-- Render động từ API -->
        </div>

        <!-- Footer với nút Hoàn thành nhận Xu/EXP -->
        <div class="px-6 py-4 border-t border-[var(--border)] flex items-center justify-between shrink-0 bg-[var(--background)]/50">
          <button onclick="closeTheoryModal()" class="px-4 py-2 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition cursor-pointer">
            Đóng
          </button>
          <button id="btn-complete-theory" onclick="confirmCompleteTheory()" class="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer shadow-md flex items-center gap-2">
            <span>✓ Đã hiểu bài & Nhận thưởng</span>
            <span class="bg-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-mono">+10 🪙</span>
          </button>
        </div>
      </div>
    </div>\n\n`;

if (!html.includes('id="modal-theory"')) {
  html = html.replace('    </main>', theoryModalHtml + '    </main>');
  console.log('✓ Inserted modal-theory markup');
}

// 2. Add real system integration script functions
const realSystemScript = `
    // =========================================================================
    // REAL DATABASE INTEGRATION: CURRICULUM, QUIZ ENGINE, PETS & LEADERBOARD
    // =========================================================================

    let liveCourseData = null;
    let currentTheoryMoc = null;
    let currentQuizSession = null;
    let answeredInCurrentQuiz = false;

    // --- 1. Load & Render Real Saga Roadmap ---
    async function loadCourseRoadmap() {
      const token = localStorage.getItem('tok_token');
      try {
        const headers = token ? { 'Authorization': 'Bearer ' + token } : {};
        const resp = await fetch('/api/courses/co-so-du-lieu', { headers });
        const res = await resp.json();
        if (res.success && res.data) {
          liveCourseData = res.data;
          renderRealSagaRoadmap(res.data);
        }
      } catch (err) {
        console.error('Lỗi khi tải lộ trình môn học:', err);
      }
    }

    function renderRealSagaRoadmap(courseData) {
      const container = document.getElementById('saga-roadmap-track');
      if (!container || !courseData || !courseData.cac_chuong) return;

      let totalMocs = 0;
      let completedMocs = 0;
      courseData.cac_chuong.forEach(ch => {
        (ch.cac_moc || []).forEach(m => {
          totalMocs++;
          if (m.trang_thai === 'HOAN_THANH') completedMocs++;
        });
      });

      // Update topbar progress
      const pct = totalMocs > 0 ? Math.round((completedMocs / totalMocs) * 100) : 0;
      const progText = document.getElementById('topbar-progress-text');
      if (progText) progText.textContent = \`Đã qua \${completedMocs}/\${totalMocs} mốc\`;
      const progBar = document.getElementById('topbar-progress-bar');
      if (progBar) progBar.style.width = \`\${pct}%\`;

      // Zig-zag horizontal offset array
      const offsets = [
        'translate-x-[0px]',
        'translate-x-[-25px]',
        'translate-x-[25px]',
        'translate-x-[-20px]',
        'translate-x-[30px]',
        'translate-x-[-35px]'
      ];
      let offsetIdx = 0;

      // Render chapters from top to bottom (Boss at top, Chapter 1 at bottom)
      const reversedChapters = [...courseData.cac_chuong].reverse();
      let htmlOutput = '';

      reversedChapters.forEach((ch, chIdx) => {
        const isLastChapter = (chIdx === 0); // Top chapter is Chapter 4 (Boss)
        const reversedMocs = [...(ch.cac_moc || [])].reverse();

        reversedMocs.forEach(m => {
          const offsetClass = offsets[offsetIdx % offsets.length];
          offsetIdx++;

          const isBoss = (m.loai_moc === 'THU_THACH_BOSS');
          const isCompleted = (m.trang_thai === 'HOAN_THANH');
          const isActive = (m.trang_thai === 'DA_MO');
          const isLocked = (m.trang_thai === 'KHOA');

          // Connector line from above node
          htmlOutput += \`<div class="w-1.5 h-5 \${isCompleted ? 'bg-emerald-500/60' : 'bg-[var(--border)] opacity-40'} rounded-full"></div>\`;

          if (isBoss) {
            // Boss Node
            htmlOutput += \`
              <div class="flex flex-col items-center text-center \${isLocked ? 'opacity-40' : ''} my-2">
                <button onclick="startPlay('\${m.ma_moc}', '\${escapeHtml(m.tieu_de)}', '\${m.loai_moc}')" 
                        title="\${escapeHtml(m.tieu_de)}" 
                        class="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl saga-circle bg-amber-500/20 border-4 border-amber-400 text-amber-500 flex items-center justify-center text-4xl sm:text-5xl shadow-2xl \${isLocked ? 'cursor-not-allowed opacity-50' : 'crown-glow hover:scale-105 transition cursor-pointer'}">
                  👑
                </button>
                <span class="text-xs font-bold mt-2 uppercase tracking-wider text-amber-600">\${escapeHtml(m.tieu_de)}</span>
              </div>
            \`;
          } else if (isActive) {
            // Active Learning Node with equipped Pet on top
            htmlOutput += \`
              <div id="active-learning-node" class="flex flex-col items-center \${offsetClass} relative">
                <div class="flex flex-col items-center absolute -top-16 select-none pointer-events-none z-10">
                  <span class="bg-[var(--card)] text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-500/40 shadow-xs text-emerald-600 mb-0.5 whitespace-nowrap animate-pulse">
                    Học tiếp nào! 🎯
                  </span>
                  <div id="roadmap-pet-avatar" class="w-12 h-12 flex items-center justify-center filter drop-shadow-md">
                    <span class="text-3xl pet-animated">\${currentEquippedPet ? currentEquippedPet.icon : '🐉'}</span>
                  </div>
                </div>
                <button onclick="startPlay('\${m.ma_moc}', '\${escapeHtml(m.tieu_de)}', '\${m.loai_moc}')" 
                        title="Bắt đầu: \${escapeHtml(m.tieu_de)}" 
                        class="w-12 h-12 rounded-full saga-circle bg-emerald-600 text-white font-bold text-sm flex items-center justify-center shadow-xl node-current border-3 border-emerald-300 hover:scale-115 transition active:scale-95 cursor-pointer">
                  ▶
                </button>
                <span class="text-[11px] font-bold mt-1 text-emerald-600 max-w-[150px] text-center truncate">\${escapeHtml(m.tieu_de.split(':')[0])}</span>
              </div>
            \`;
          } else if (isCompleted) {
            // Completed Checkmark Node
            htmlOutput += \`
              <div class="flex flex-col items-center \${offsetClass}">
                <button onclick="startPlay('\${m.ma_moc}', '\${escapeHtml(m.tieu_de)}', '\${m.loai_moc}')" 
                        title="Ôn tập: \${escapeHtml(m.tieu_de)}" 
                        class="w-8 h-8 sm:w-9 sm:h-9 rounded-full saga-circle bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-sm hover:scale-110 transition cursor-pointer">
                  ✓
                </button>
                <span class="text-[10px] font-medium mt-1 text-[var(--muted-foreground)] max-w-[140px] text-center truncate">\${escapeHtml(m.tieu_de.split(':')[0])}</span>
              </div>
            \`;
          } else {
            // Locked Node
            htmlOutput += \`
              <div class="flex flex-col items-center \${offsetClass} opacity-40">
                <div title="Cần hoàn thành mốc trước để mở khóa" 
                     class="w-8 h-8 rounded-full saga-circle bg-[var(--card)] border border-[var(--border)] text-[10px] text-[var(--muted-foreground)] flex items-center justify-center cursor-not-allowed">
                  🔒
                </div>
                <span class="text-[10px] font-medium mt-1 text-[var(--muted-foreground)] max-w-[140px] text-center truncate">\${escapeHtml(m.tieu_de.split(':')[0])}</span>
              </div>
            \`;
          }
        });

        // Chapter Separator Pill (except after the last chapter at bottom)
        if (chIdx < reversedChapters.length - 1) {
          htmlOutput += \`
            <div class="w-1.5 h-6 border-l-2 border-dashed border-[var(--border)] my-1 opacity-50"></div>
            <div class="px-3 py-1 rounded-full bg-[var(--card)] border border-[var(--border)] text-[10px] font-bold text-[var(--muted-foreground)] shadow-2xs">
              \${escapeHtml(ch.tieu_de.split(':')[0] || ch.tieu_de)}
            </div>
            <div class="w-1.5 h-6 border-l-2 border-dashed border-[var(--border)] my-1 opacity-50"></div>
          \`;
        }
      });

      // Bottom Start Marker
      htmlOutput += \`
        <div class="text-center pt-4 text-[10px] text-[var(--muted-foreground)] uppercase tracking-wider font-semibold">
          ▲ Xuất phát từ đây ▲
        </div>
      \`;

      container.innerHTML = htmlOutput;
      syncAllPetDisplays();
      scrollToActiveNode(true);
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // --- 2. Checkpoint Execution (Theory vs Quiz) ---
    async function startPlay(mocId, tieuDe, loaiMoc) {
      if (loaiMoc === 'LY_THUYET') {
        await openTheoryModal(mocId);
        return;
      }

      // Quiz or Boss Challenge
      const token = localStorage.getItem('tok_token');
      try {
        const resp = await fetch('/api/checkpoints/' + mocId, {
          headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        const res = await resp.json();
        if (res.success && res.data) {
          const qs = res.data.danh_sach_cau_hoi || [];
          if (qs.length === 0) {
            showToast('Mốc này chưa có câu hỏi nào trong ngân hàng đề!', 'info');
            return;
          }
          currentQuizSession = {
            mocId: mocId,
            tieuDe: tieuDe || res.data.tieu_de,
            loaiMoc: loaiMoc,
            questions: qs,
            answers: [],
            qIndex: 0
          };
          navTo('play');
          renderQuizQuestion();
        } else {
          showToast(res.error?.message || 'Không thể mở mốc bài tập này!', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối khi tải câu hỏi mốc!', 'error');
      }
    }

    function renderQuizQuestion() {
      if (!currentQuizSession) return;
      const { tieuDe, questions, qIndex } = currentQuizSession;
      if (qIndex >= questions.length) {
        finishAndSubmitQuiz();
        return;
      }

      answeredInCurrentQuiz = false;
      const q = questions[qIndex];

      const playTitle = document.getElementById('play-title');
      if (playTitle) playTitle.textContent = \`\${tieuDe} · Câu \${qIndex + 1}/\${questions.length}\`;

      const playProg = document.getElementById('play-progress');
      if (playProg) {
        const pct = Math.round((qIndex / questions.length) * 100);
        playProg.style.width = \`\${pct}%\`;
      }

      const qPrompt = document.getElementById('q-prompt');
      if (qPrompt) qPrompt.textContent = q.noi_dung;

      const container = document.getElementById('q-options-container');
      if (container) {
        container.innerHTML = '';
        (q.dap_an || []).forEach((opt, idx) => {
          const btn = document.createElement('button');
          btn.className = "w-full text-left p-3.5 rounded-xl border border-[var(--border)] hover:bg-[var(--card)] transition text-xs flex items-center justify-between cursor-pointer";
          btn.innerHTML = \`<span>\${escapeHtml(opt)}</span><span class="font-mono text-[10px] text-[var(--muted-foreground)] border border-[var(--border)] px-1.5 py-0.5 rounded">\${idx + 1}</span>\`;
          btn.onclick = () => selectQuizOption(btn, idx);
          container.appendChild(btn);
        });
      }

      const fbBox = document.getElementById('q-feedback-box');
      if (fbBox) fbBox.classList.add('hidden');
      const nextBtn = document.getElementById('btn-next-step');
      if (nextBtn) nextBtn.classList.add('hidden');
    }

    function selectQuizOption(btnElement, choiceIdx) {
      if (!currentQuizSession || answeredInCurrentQuiz) return;
      answeredInCurrentQuiz = true;

      const { questions, qIndex, answers } = currentQuizSession;
      const q = questions[qIndex];
      answers.push({ ma_cau_hoi: q.ma_cau_hoi, chi_muc_chon: choiceIdx });

      // Highlight selected option
      const container = document.getElementById('q-options-container');
      if (container) {
        container.querySelectorAll('button').forEach((b, i) => {
          b.disabled = true;
          if (i === choiceIdx) {
            b.classList.add('border-emerald-500', 'bg-emerald-500/10', 'text-emerald-600', 'font-medium');
          } else {
            b.classList.add('opacity-40');
          }
        });
      }

      // Show Next button
      const nextBtn = document.getElementById('btn-next-step');
      if (nextBtn) {
        nextBtn.classList.remove('hidden');
        if (qIndex === questions.length - 1) {
          nextBtn.textContent = 'Hoàn thành bài thi & Nộp bài ✓';
        } else {
          nextBtn.textContent = 'Câu tiếp theo →';
        }
      }

      if (audioSettings && audioSettings.quiz) {
        playAdvancedSound('click');
      }
    }

    function nextQuestion() {
      if (!currentQuizSession) return;
      currentQuizSession.qIndex++;
      if (currentQuizSession.qIndex >= currentQuizSession.questions.length) {
        finishAndSubmitQuiz();
      } else {
        renderQuizQuestion();
      }
    }

    async function finishAndSubmitQuiz() {
      if (!currentQuizSession) return;
      const { mocId, answers, tieuDe } = currentQuizSession;
      const token = localStorage.getItem('tok_token');

      try {
        const resp = await fetch(\`/api/checkpoints/\${mocId}/submit\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({ cau_tra_loi: answers })
        });
        const res = await resp.json();

        if (res.success && res.data) {
          const { diem_so, so_cau_dung, tong_cau, dat_yeu_cau, xu_nhan_duoc, exp_nhan_duoc } = res.data;

          if (dat_yeu_cau) {
            if (audioSettings && audioSettings.quiz) playAdvancedSound('quiz-correct');
            alert(\`🎉 CHÚC MỪNG BẠN ĐÃ VƯỢT QUA MỐC BÀI TẬP!\\n\\n📊 Điểm số: \${diem_so}/100 (\${so_cau_dung}/\${tong_cau} câu đúng)\\n🎁 Phần thưởng: +\${xu_nhan_duoc} 🪙 Xu Tri Thức · +\${exp_nhan_duoc} ⭐ EXP\`);
          } else {
            if (audioSettings && audioSettings.quiz) playAdvancedSound('quiz-wrong');
            alert(\`Chưa đạt điểm yêu cầu (\${diem_so}/100 điểm, đúng \${so_cau_dung}/\${tong_cau} câu).\\nCần tối thiểu 70 điểm để vượt qua mốc. Hãy ôn tập lại kiến thức và thử lại nhé!\`);
          }

          // Refresh user data & roadmap
          await Promise.all([
            refreshUserData(),
            loadCourseRoadmap()
          ]);
        } else {
          showToast(res.error?.message || 'Lỗi khi nộp bài thi!', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối khi nộp bài thi!', 'error');
      }

      currentQuizSession = null;
      closePlay();
    }

    // --- 3. Theory Modal Controller ---
    async function openTheoryModal(mocId) {
      const token = localStorage.getItem('tok_token');
      try {
        const resp = await fetch('/api/checkpoints/' + mocId, {
          headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        const res = await resp.json();
        if (res.success && res.data) {
          currentTheoryMoc = res.data;
          document.getElementById('theory-title').textContent = res.data.tieu_de;

          // Render theoretical content nicely
          const contentEl = document.getElementById('theory-content');
          const raw = res.data.noi_dung_ly_thuyet || 'Chưa có nội dung lý thuyết cho mốc này.';
          contentEl.innerHTML = formatTheoryContent(raw);

          // Configure Complete button
          const btnComplete = document.getElementById('btn-complete-theory');
          if (res.data.trang_thai === 'HOAN_THANH') {
            btnComplete.innerHTML = '<span>✓ Đã hoàn thành (Xem lại)</span>';
            btnComplete.disabled = false;
          } else {
            btnComplete.innerHTML = '<span>✓ Đã hiểu bài & Nhận thưởng</span><span class="bg-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-mono">+' + (res.data.xu_thuong || 10) + ' 🪙</span>';
            btnComplete.disabled = false;
          }

          const modal = document.getElementById('modal-theory');
          if (modal) modal.classList.remove('hidden');
        } else {
          showToast(res.error?.message || 'Không thể tải nội dung lý thuyết!', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối khi tải lý thuyết mốc!', 'error');
      }
    }

    function formatTheoryContent(text) {
      return text.split('\\n\\n').map(p => {
        p = p.trim();
        if (p.startsWith('### ')) {
          return \`<h4 class="font-bold text-emerald-600 text-sm mt-3 mb-1">\${escapeHtml(p.replace('### ', ''))}</h4>\`;
        }
        if (p.startsWith('## ')) {
          return \`<h3 class="font-bold text-[var(--foreground)] text-base mt-4 mb-2 pb-1 border-b border-[var(--border)]">\${escapeHtml(p.replace('## ', ''))}</h3>\`;
        }
        if (p.startsWith('# ')) {
          return \`<h2 class="font-extrabold text-[var(--foreground)] text-lg mb-2">\${escapeHtml(p.replace('# ', ''))}</h2>\`;
        }
        if (p.startsWith('- ') || p.startsWith('* ')) {
          const items = p.split('\\n').map(li => \`<li class="ml-4 list-disc">\${escapeHtml(li.replace(/^[-*]\\s+/, ''))}</li>\`).join('');
          return \`<ul class="space-y-1 text-xs text-[var(--foreground)]/90">\${items}</ul>\`;
        }
        return \`<p class="leading-relaxed text-xs text-[var(--foreground)]/90 bg-[var(--card)] p-3 rounded-xl border border-[var(--border)]">\${escapeHtml(p)}</p>\`;
      }).join('');
    }

    function closeTheoryModal() {
      const modal = document.getElementById('modal-theory');
      if (modal) modal.classList.add('hidden');
      currentTheoryMoc = null;
    }

    async function confirmCompleteTheory() {
      if (!currentTheoryMoc) return;
      const mocId = currentTheoryMoc.ma_moc;
      const token = localStorage.getItem('tok_token');

      try {
        const resp = await fetch(\`/api/checkpoints/\${mocId}/complete-theory\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          },
          body: JSON.stringify({})
        });
        const res = await resp.json();
        if (res.success && res.data) {
          if (audioSettings && audioSettings.quiz) playAdvancedSound('success');
          showToast(\`🎉 Chúc mừng! Đã hoàn thành mốc lý thuyết (+\${res.data.xu_thuong || 10} 🪙 Xu, +\${res.data.diem_thuong || 15} ⭐ EXP)!\`);
          closeTheoryModal();
          await Promise.all([
            refreshUserData(),
            loadCourseRoadmap()
          ]);
        } else {
          showToast(res.error?.message || 'Không thể lưu tiến độ lý thuyết!', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối khi hoàn thành lý thuyết!', 'error');
      }
    }

    // --- 4. Real Pet Shop & Equipment ---
    async function loadRealPets() {
      const token = localStorage.getItem('tok_token');
      try {
        const resp = await fetch('/api/pets', {
          headers: token ? { 'Authorization': 'Bearer ' + token } : {}
        });
        const res = await resp.json();
        if (res.success && Array.isArray(res.data)) {
          res.data.forEach(p => {
            const isSparky = p.ma_thu_cung.includes('sparky');
            const isFox = p.ma_thu_cung.includes('kitsune') || p.ma_thu_cung.includes('fox');
            const petId = isFox ? 'fox' : (isSparky ? 'dragon' : 'golem');

            ownedPets[petId] = Boolean(p.da_so_huu || isSparky);

            // Update Shop Button
            const btnBuy = document.getElementById(\`btn-buy-\${petId}\`);
            if (btnBuy) {
              if (p.dang_kich_hoat) {
                btnBuy.className = "shrink-0 py-1.5 px-2.5 rounded-lg bg-emerald-600/20 text-emerald-600 border border-emerald-500/40 font-bold text-[11px] transition cursor-pointer";
                btnBuy.textContent = "✓ Đang dùng";
              } else if (p.da_so_huu) {
                btnBuy.className = "shrink-0 py-1.5 px-2.5 rounded-lg bg-emerald-600/20 text-emerald-600 border border-emerald-500/40 font-bold text-[11px] transition cursor-pointer";
                btnBuy.textContent = "Trang bị";
              } else {
                btnBuy.className = isFox 
                  ? "shrink-0 py-1.5 px-2.5 rounded-lg bg-amber-600 text-white font-bold text-[11px] hover:bg-amber-700 transition cursor-pointer shadow-xs whitespace-nowrap"
                  : "shrink-0 py-1.5 px-2.5 rounded-lg bg-purple-600 text-white font-bold text-[11px] hover:bg-purple-700 transition cursor-pointer shadow-xs whitespace-nowrap";
                btnBuy.textContent = (p.gia_xu || 100) + ' 🪙 Mua';
              }
            }
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải danh mục linh thú:', err);
      }
    }

    // Override buyPet with real server endpoint
    async function buyPet(petId, name, icon, buff, price) {
      const dbPetId = (petId === 'fox') ? 'pet_kitsune' : ((petId === 'dragon') ? 'pet_sparky' : 'pet_golem');
      const token = localStorage.getItem('tok_token');

      if (ownedPets[petId]) {
        await equipPetOnServer(dbPetId, petId, name, icon, buff);
        return;
      }

      if (userCoins < price) {
        alert(\`🪙 Bạn còn thiếu \${price - userCoins} Xu! Hãy hoàn thành thêm các mốc học trên lộ trình để tích lũy Xu nhé.\`);
        return;
      }

      try {
        const resp = await fetch(\`/api/pets/\${dbPetId}/buy\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          }
        });
        const res = await resp.json();
        if (res.success) {
          if (audioSettings && audioSettings.quiz) playAdvancedSound('success');
          alert(\`🎉 Chúc mừng! Bạn đã mở khóa thành công linh thú \${name}!\`);
          await refreshUserData();
          await loadRealPets();
          equipPet(petId, name, icon, buff, petId === 'fox' ? KITSUNE_ANIM_GIF : SPARKY_ANIM_GIF);
        } else {
          showToast(res.error?.message || 'Không thể mở khóa linh thú!', 'error');
        }
      } catch (err) {
        showToast('Lỗi kết nối khi mua linh thú!', 'error');
      }
    }

    async function equipPetOnServer(dbPetId, petId, name, icon, buff) {
      const token = localStorage.getItem('tok_token');
      try {
        const resp = await fetch(\`/api/pets/\${dbPetId}/equip\`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': 'Bearer ' + token } : {})
          }
        });
        const res = await resp.json();
        if (res.success) {
          equipPet(petId, name, icon, buff, petId === 'fox' ? KITSUNE_ANIM_GIF : SPARKY_ANIM_GIF);
          alert(\`🎉 Đã đổi sang linh vật \${name} đồng hành!\`);
          navTo('pet');
          await loadRealPets();
        }
      } catch (err) {
        equipPet(petId, name, icon, buff, petId === 'fox' ? KITSUNE_ANIM_GIF : SPARKY_ANIM_GIF);
      }
    }

    // --- 5. Real Leaderboard from SQL Server ---
    async function loadRealLeaderboard() {
      try {
        const resp = await fetch('/api/arena/leaderboard');
        const res = await resp.json();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          const mapped = res.data.map(u => {
            const isFox = (u.ten_thu_cung || '').includes('Kitsune') || (u.ten_thu_cung || '').includes('Cáo');
            const icon = isFox ? '🦊' : ((u.ten_thu_cung || '').includes('Sparky') || (u.ten_thu_cung || '').includes('Rồng') ? '🐉' : '🛡️');
            return [u.ten_hien_thi, icon, u.danh_hieu || 'TẬP SỰ', String(u.tong_diem_kinh_nghiem || 0)];
          });
          RANK_DATA.all.hang = mapped;
          RANK_DATA.csdl.hang = mapped;
          renderRank();
        }
      } catch (err) {
        console.error('Lỗi khi tải bảng xếp hạng:', err);
      }
    }

    async function refreshUserData() {
      const token = localStorage.getItem('tok_token');
      if (!token) return;
      try {
        const resp = await fetch('/api/auth/me', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const res = await resp.json();
        if (res.success && res.data) {
          applyUserData(res.data.nguoi_dung || res.data);
        }
      } catch (err) {}
    }
`;

// Insert before initLiveBackend
if (!html.includes('loadCourseRoadmap()')) {
  html = html.replace('async function initLiveBackend() {', realSystemScript + '\n    async function initLiveBackend() {');
  console.log('✓ Injected real system integration scripts');
}

// Update initLiveBackend to invoke real modules
const oldInitTarget = `    // Auto-init on page load
    setTimeout(initLiveBackend, 150);`;

const newInitSnippet = `
      // Load real system dynamic data
      await Promise.all([
        loadCourseRoadmap(),
        loadRealPets(),
        loadRealLeaderboard()
      ]);
    }

    // Auto-init on page load
    setTimeout(initLiveBackend, 150);`;

if (!html.includes('loadCourseRoadmap(),')) {
  html = html.replace('    // Auto-init on page load\n    setTimeout(initLiveBackend, 150);', newInitSnippet);
  console.log('✓ Updated initLiveBackend to load real course, pets, and leaderboard');
}

fs.writeFileSync('public/index.html', html, 'utf8');
console.log('✓ Saved public/index.html successfully');
