/**
 * Course & Progression Service
 * Implements course navigation, checkpoint unlocking (Lazy Initialization),
 * Duolingo 4-step Bloom Progression, and server-side quiz grading.
 */

const db = require('../database/db');
const {
  evaluateQuizSubmission,
  calculateCompletionPercentage,
  findNextCheckpointToUnlock
} = require('../core/rules/progression.rules');
const {
  calculateQuestionWeight,
  aggregateSessionTelemetry,
  selectAdaptiveQuestions
} = require('../core/rules/adaptive.rules');
const { mutateCoins, addExperience } = require('./economy.service');

/**
 * List all courses with progress
 */
async function listCourses(ma_nguoi_dung) {
  const courses = await db.query('SELECT ma_mon, ten_mon, slug, mo_ta, anh_bia, thu_tu FROM mon_hoc ORDER BY thu_tu ASC');
  
  const results = [];
  for (const c of courses) {
    let progress = null;
    if (ma_nguoi_dung) {
      progress = await db.queryOne(
        'SELECT phan_tram_hoan_thanh, ngay_bat_dau, ngay_hoan_thanh FROM tien_do_mon_hoc WHERE ma_nguoi_dung = $1 AND ma_mon = $2',
        [ma_nguoi_dung, c.ma_mon]
      );
    }
    results.push({
      ...c,
      tien_do: progress ? progress.phan_tram_hoan_thanh : 0.0,
      da_bat_dau: Boolean(progress)
    });
  }

  return results;
}

/**
 * List user's actively enrolled courses only
 */
async function listMyCourses(ma_nguoi_dung) {
  if (!ma_nguoi_dung) return [];
  const rows = await db.query(`
    SELECT m.ma_mon, m.ten_mon, m.slug, m.mo_ta, m.anh_bia, m.thu_tu,
           p.phan_tram_hoan_thanh, p.ngay_bat_dau, p.ngay_hoan_thanh
    FROM tien_do_mon_hoc p
    JOIN mon_hoc m ON p.ma_mon = m.ma_mon
    WHERE p.ma_nguoi_dung = $1
    ORDER BY p.ngay_bat_dau DESC
  `, [ma_nguoi_dung]);
  return (rows || []).map(r => ({
    ...r,
    tien_do: r.phan_tram_hoan_thanh || 0.0,
    da_bat_dau: true
  }));
}

/**
 * Explicit Course Enrollment
 */
async function enrollCourse(slug, ma_nguoi_dung) {
  if (!ma_nguoi_dung) throw new Error('Vui lòng đăng nhập để đăng ký môn học.');
  const course = await db.queryOne('SELECT * FROM mon_hoc WHERE slug = $1', [slug]);
  if (!course) throw new Error('Không tìm thấy môn học.');

  let progMon = await db.queryOne(
    'SELECT ma_tien_do_mon FROM tien_do_mon_hoc WHERE ma_nguoi_dung = $1 AND ma_mon = $2',
    [ma_nguoi_dung, course.ma_mon]
  );

  if (!progMon) {
    const ma_tien_do_mon = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.execute(`
      INSERT INTO tien_do_mon_hoc (ma_tien_do_mon, ma_nguoi_dung, ma_mon, phan_tram_hoan_thanh, ngay_bat_dau)
      VALUES ($1, $2, $3, 0.0, SYSDATETIME())
    `, [ma_tien_do_mon, ma_nguoi_dung, course.ma_mon]);
  }

  // Ensure first checkpoint is open
  const firstMoc = await db.queryOne(`
    SELECT m.ma_moc, m.tong_so_buoc 
    FROM moc_bai_hoc m
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE c.ma_mon = $1
    ORDER BY c.thu_tu ASC, m.thu_tu ASC
  `, [course.ma_mon]);

  if (firstMoc) {
    const progMoc = await db.queryOne(
      'SELECT ma_tien_do_moc FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, firstMoc.ma_moc]
    );

    if (!progMoc) {
      const ma_tien_do_moc = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const totalSteps = firstMoc.tong_so_buoc || 4;
      await db.execute(`
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
        VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, $4)
      `, [ma_tien_do_moc, ma_nguoi_dung, firstMoc.ma_moc, `0/${totalSteps}`]);
    }
  }

  return { success: true, message: 'Đăng ký môn học thành công!', course };
}

/**
 * Ensure course progress and first checkpoint are initialized (Legacy helper)
 */
/**
 * Safe, cross-database UPSERT for course progress (compatible with PostgreSQL & MSSQL)
 */
async function upsertCourseProgress(ma_nguoi_dung, ma_mon, compPct, isCompletedCourse) {
  const existingProg = await db.queryOne(
    'SELECT ma_tien_do_mon FROM tien_do_mon_hoc WHERE ma_nguoi_dung = $1 AND ma_mon = $2',
    [ma_nguoi_dung, ma_mon]
  );
  if (!existingProg) {
    const ma_tien_do_mon = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.execute(`
      INSERT INTO tien_do_mon_hoc (ma_tien_do_mon, ma_nguoi_dung, ma_mon, phan_tram_hoan_thanh, ngay_bat_dau, ngay_hoan_thanh)
      VALUES ($1, $2, $3, $4, SYSDATETIME(), ${isCompletedCourse ? 'SYSDATETIME()' : 'NULL'})
    `, [ma_tien_do_mon, ma_nguoi_dung, ma_mon, compPct]);
  } else {
    await db.execute(`
      UPDATE tien_do_mon_hoc
      SET phan_tram_hoan_thanh = $1,
          ngay_hoan_thanh = ${isCompletedCourse ? 'SYSDATETIME()' : 'NULL'}
      WHERE ma_nguoi_dung = $2 AND ma_mon = $3
    `, [compPct, ma_nguoi_dung, ma_mon]);
  }
}

async function ensureCourseInitialized(ma_nguoi_dung, ma_mon) {
  let progMon = await db.queryOne(
    'SELECT ma_tien_do_mon FROM tien_do_mon_hoc WHERE ma_nguoi_dung = $1 AND ma_mon = $2',
    [ma_nguoi_dung, ma_mon]
  );

  if (!progMon) {
    const ma_tien_do_mon = `pm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.execute(`
      INSERT INTO tien_do_mon_hoc (ma_tien_do_mon, ma_nguoi_dung, ma_mon, phan_tram_hoan_thanh, ngay_bat_dau)
      VALUES ($1, $2, $3, 0.0, SYSDATETIME())
    `, [ma_tien_do_mon, ma_nguoi_dung, ma_mon]);
  }

  const firstMoc = await db.queryOne(`
    SELECT m.ma_moc, m.tong_so_buoc 
    FROM moc_bai_hoc m
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE c.ma_mon = $1
    ORDER BY c.thu_tu ASC, m.thu_tu ASC
  `, [ma_mon]);

  if (firstMoc) {
    const progMoc = await db.queryOne(
      'SELECT ma_tien_do_moc FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, firstMoc.ma_moc]
    );

    if (!progMoc) {
      const ma_tien_do_moc = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const totalSteps = firstMoc.tong_so_buoc || 4;
      await db.execute(`
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
        VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, $4)
      `, [ma_tien_do_moc, ma_nguoi_dung, firstMoc.ma_moc, `0/${totalSteps}`]);
    }
  }
}

/**
 * Get detailed course view by slug
 */
async function getCourseDetails(slug, ma_nguoi_dung) {
  const course = await db.queryOne('SELECT * FROM mon_hoc WHERE slug = $1', [slug]);
  if (!course) throw new Error('Không tìm thấy môn học.');

  let isEnrolled = false;
  let userProgress = null;
  if (ma_nguoi_dung) {
    await ensureCourseInitialized(ma_nguoi_dung, course.ma_mon);
    userProgress = await db.queryOne(
      'SELECT ma_tien_do_mon, phan_tram_hoan_thanh FROM tien_do_mon_hoc WHERE ma_nguoi_dung = $1 AND ma_mon = $2',
      [ma_nguoi_dung, course.ma_mon]
    );
    isEnrolled = Boolean(userProgress);
  }

  const chapters = await db.query('SELECT * FROM chuong_hoc WHERE ma_mon = $1 ORDER BY thu_tu ASC', [course.ma_mon]);
  const chaptersWithCheckpoints = [];

  for (const ch of chapters) {
    const checkpoints = await db.query(
      `SELECT m.ma_moc, m.ma_chuong, m.tieu_de, m.loai_moc, m.diem_thuong, m.xu_thuong, m.thu_tu, 
              m.tong_so_buoc, m.so_cau_moi_buoc, m.cau_hinh_bloom,
              (CASE 
                WHEN m.loai_moc = 'THU_THACH_BOSS' THEN 
                  (SELECT COUNT(*) FROM cau_hoi q JOIN moc_bai_hoc m2 ON q.ma_moc = m2.ma_moc WHERE m2.ma_chuong = m.ma_chuong)
                ELSE 
                  (SELECT COUNT(*) FROM cau_hoi q WHERE q.ma_moc = m.ma_moc)
              END) AS so_luong_cau_hoi
       FROM moc_bai_hoc m 
       WHERE m.ma_chuong = $1 
       ORDER BY m.thu_tu ASC`,
      [ch.ma_chuong]
    );

    const enrichedCheckpoints = [];
    for (const m of checkpoints) {
      const totalSteps = m.tong_so_buoc || 4;
      let status = 'KHOA';
      let diem_dat_duoc = 0;
      let xu_da_nhan = 0;
      let buoc_hien_tai = 1;
      let cac_buoc_hoan_thanh = `0/${totalSteps}`;

      if (ma_nguoi_dung) {
        const prog = await db.queryOne(
          'SELECT trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
          [ma_nguoi_dung, m.ma_moc]
        );
        if (prog) {
          status = prog.trang_thai;
          diem_dat_duoc = prog.diem_dat_duoc || 0;
          xu_da_nhan = prog.xu_da_nhan || 0;
          buoc_hien_tai = prog.buoc_hien_tai || 1;
          cac_buoc_hoan_thanh = prog.cac_buoc_hoan_thanh || `0/${totalSteps}`;
        }
      }

      enrichedCheckpoints.push({
        ...m,
        tong_so_buoc: totalSteps,
        so_cau_moi_buoc: m.so_cau_moi_buoc || 10,
        so_luong_cau_hoi: parseInt(m.so_luong_cau_hoi || 0, 10),
        trang_thai: status,
        diem_dat_duoc,
        xu_da_nhan,
        buoc_hien_tai,
        cac_buoc_hoan_thanh
      });
    }

    chaptersWithCheckpoints.push({
      ...ch,
      cac_moc: enrichedCheckpoints
    });
  }

  return {
    mon_hoc: {
      ...course,
      da_dang_ky: isEnrolled,
      phan_tram_hoan_thanh: userProgress ? userProgress.phan_tram_hoan_thanh : 0.0
    },
    cac_chuong: chaptersWithCheckpoints
  };
}

const DEFAULT_BLOOM_MATRIX_5 = {
  1: { NHO: 0.7, HIEU: 0.3, VAN_DUNG: 0.0, tieu_de: 'Khởi động & Nhận diện', ti_le: '70% Nhớ - 30% Hiểu' },
  2: { NHO: 0.3, HIEU: 0.5, VAN_DUNG: 0.2, tieu_de: 'Thấm sâu khái niệm', ti_le: '30% Nhớ - 50% Hiểu - 20% Vận dụng' },
  3: { NHO: 0.1, HIEU: 0.4, VAN_DUNG: 0.5, tieu_de: 'Tăng tốc & Thử thách', ti_le: '10% Nhớ - 40% Hiểu - 50% Vận dụng' },
  4: { NHO: 0.0, HIEU: 0.3, VAN_DUNG: 0.7, tieu_de: 'Bứt phá kỹ năng', ti_le: '30% Hiểu - 70% Vận dụng' },
  5: { NHO: 0.0, HIEU: 0.1, VAN_DUNG: 0.9, tieu_de: 'Đỉnh tháp & Làm chủ', ti_le: '10% Hiểu - 90% Vận dụng' }
};

const DEFAULT_BLOOM_MATRIX_4 = {
  1: { NHO: 0.7, HIEU: 0.3, VAN_DUNG: 0.0, tieu_de: 'Khởi động & Nhận biết', ti_le: '70% Nhớ - 30% Hiểu' },
  2: { NHO: 0.4, HIEU: 0.4, VAN_DUNG: 0.2, tieu_de: 'Tăng tốc & Thấu hiểu', ti_le: '40% Nhớ - 40% Hiểu - 20% Vận dụng' },
  3: { NHO: 0.2, HIEU: 0.3, VAN_DUNG: 0.5, tieu_de: 'Bứt phá & Vận dụng', ti_le: '20% Nhớ - 30% Hiểu - 50% Vận dụng' },
  4: { NHO: 0.1, HIEU: 0.6, VAN_DUNG: 0.3, tieu_de: 'Làm chủ & Sắp xếp', ti_le: '10% Nhớ - 60% Hiểu - 30% Vận dụng' }
};

const DEFAULT_BLOOM_MATRIX_3 = {
  1: { NHO: 0.8, HIEU: 0.2, VAN_DUNG: 0.0, tieu_de: 'Khởi động & Ghi nhớ', ti_le: '80% Nhớ - 20% Hiểu' },
  2: { NHO: 0.3, HIEU: 0.5, VAN_DUNG: 0.2, tieu_de: 'Thấu hiểu Bản chất', ti_le: '30% Nhớ - 50% Hiểu - 20% Vận dụng' },
  3: { NHO: 0.1, HIEU: 0.3, VAN_DUNG: 0.6, tieu_de: 'Vận dụng Thực tiễn', ti_le: '10% Nhớ - 30% Hiểu - 60% Vận dụng' }
};

function resolveBloomMatrix(checkpoint) {
  const totalSteps = checkpoint.tong_so_buoc || 4;
  if (checkpoint.cau_hinh_bloom) {
    try {
      const parsed = typeof checkpoint.cau_hinh_bloom === 'string' ? JSON.parse(checkpoint.cau_hinh_bloom) : checkpoint.cau_hinh_bloom;
      if (parsed && typeof parsed === 'object') return parsed;
    } catch (e) {
      // Fallback
    }
  }
  if (totalSteps >= 5) return DEFAULT_BLOOM_MATRIX_5;
  if (totalSteps === 3) return DEFAULT_BLOOM_MATRIX_3;
  return DEFAULT_BLOOM_MATRIX_4;
}

function poolQuestionsByBloom(allQuestions, targetRatio, targetCount) {
  if (!allQuestions || allQuestions.length === 0) return [];
  if (allQuestions.length <= targetCount) {
    return [...allQuestions].sort(() => Math.random() - 0.5);
  }

  const buckets = {
    NHO: allQuestions.filter(q => (q.muc_bloom || 'NHO') === 'NHO'),
    HIEU: allQuestions.filter(q => (q.muc_bloom || 'NHO') === 'HIEU' || (q.muc_bloom || 'NHO') === 'THONG_HIEU'),
    VAN_DUNG: allQuestions.filter(q => (q.muc_bloom || 'NHO') === 'VAN_DUNG' || (q.muc_bloom || 'NHO') === 'PHAN_TICH')
  };

  for (const k of Object.keys(buckets)) {
    buckets[k].sort(() => Math.random() - 0.5);
  }

  const needNho = Math.round(targetCount * (targetRatio.NHO !== undefined ? targetRatio.NHO : 0.33));
  const needHieu = Math.round(targetCount * (targetRatio.HIEU !== undefined ? targetRatio.HIEU : 0.33));
  const needVanDung = Math.max(0, targetCount - needNho - needHieu);

  const picked = [];
  const pickedIds = new Set();

  function pickFromBucket(bName, count) {
    const list = buckets[bName] || [];
    let taken = 0;
    for (const item of list) {
      if (taken >= count) break;
      if (!pickedIds.has(item.ma_cau_hoi)) {
        picked.push(item);
        pickedIds.add(item.ma_cau_hoi);
        taken++;
      }
    }
    return taken;
  }

  pickFromBucket('NHO', needNho);
  pickFromBucket('HIEU', needHieu);
  pickFromBucket('VAN_DUNG', needVanDung);

  if (picked.length < targetCount) {
    const remaining = allQuestions.filter(q => !pickedIds.has(q.ma_cau_hoi)).sort(() => Math.random() - 0.5);
    for (const rem of remaining) {
      if (picked.length >= targetCount) break;
      picked.push(rem);
      pickedIds.add(rem.ma_cau_hoi);
    }
  }

  return picked;
}

/**
 * Get checkpoint content for learning / taking test
 */
async function getCheckpointContent(ma_moc, ma_nguoi_dung, stepRequested, resumeIds) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  const totalSteps = checkpoint.tong_so_buoc || 4;
  const questionsPerStep = checkpoint.so_cau_moi_buoc || 10;
  const bloomMatrix = resolveBloomMatrix(checkpoint);

  let userStatus = 'KHOA';
  let buoc_hien_tai = 1;
  let cac_buoc_hoan_thanh = `0/${totalSteps}`;
  let duLieuTriNhoRaw = null;

  if (ma_nguoi_dung) {
    const prog = await db.queryOne(
      'SELECT trang_thai, buoc_hien_tai, cac_buoc_hoan_thanh, du_lieu_tri_nho FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );
    if (prog) {
      userStatus = prog.trang_thai;
      buoc_hien_tai = prog.buoc_hien_tai || 1;
      cac_buoc_hoan_thanh = prog.cac_buoc_hoan_thanh || `0/${totalSteps}`;
      duLieuTriNhoRaw = prog.du_lieu_tri_nho;
    }
  }

  if (userStatus === 'KHOA') {
    throw new Error('Mốc bài học này đang bị khóa. Hãy hoàn thành các mốc trước để mở khóa!');
  }

  const activeStep = stepRequested ? Math.max(1, Math.min(totalSteps, parseInt(stepRequested, 10))) : Math.min(totalSteps, buoc_hien_tai);

  // Fetch candidate questions from pool:
  // If Boss Checkpoint, pool across the ENTIRE CHAPTER!
  // If standard checkpoint, pool within this checkpoint.
  let allPoolQuestions = [];
  if (checkpoint.loai_moc === 'THU_THACH_BOSS') {
    allPoolQuestions = await db.query(`
      SELECT q.ma_cau_hoi, q.noi_dung, q.loai_cau_hoi, q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d,
             q.du_lieu_cau_hoi, q.muc_bloom, q.buoc_luyen_tap, q.do_kho, q.vi_tri_dap_an_dung, q.giai_thich
      FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      WHERE m.ma_chuong = $1
      ORDER BY q.ma_cau_hoi ASC
    `, [checkpoint.ma_chuong]);
  } else {
    allPoolQuestions = await db.query(`
      SELECT ma_cau_hoi, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d,
             du_lieu_cau_hoi, muc_bloom, buoc_luyen_tap, do_kho, vi_tri_dap_an_dung, giai_thich
      FROM cau_hoi
      WHERE ma_moc = $1
      ORDER BY ma_cau_hoi ASC
    `, [ma_moc]);
  }

  // Pool questions according to activeStep's Bloom matrix
  const targetStepConfig = bloomMatrix[activeStep] || { NHO: 0.33, HIEU: 0.33, VAN_DUNG: 0.34 };
  let rawQuestions = poolQuestionsByBloom(allPoolQuestions, targetStepConfig, questionsPerStep);

  // Adaptive Question Selection based on memory state weights (Spaced Repetition & Weakness Focus)
  let memoryMap = {};
  if (duLieuTriNhoRaw) {
    try {
      memoryMap = typeof duLieuTriNhoRaw === 'string' ? JSON.parse(duLieuTriNhoRaw) : duLieuTriNhoRaw;
    } catch (e) {
      memoryMap = {};
    }
  }

  if (rawQuestions && rawQuestions.length > 0) {
    rawQuestions = selectAdaptiveQuestions(rawQuestions, memoryMap, questionsPerStep);
  }
  // Resume only known question IDs from this accessible checkpoint's own pool.
  if (Array.isArray(resumeIds) && resumeIds.length > 0) {
    const poolById = new Map(allPoolQuestions.map(q => [q.ma_cau_hoi, q]));
    const ids = [...new Set(resumeIds)];
    if (ids.length > 200 || ids.some(id => typeof id !== 'string' || !poolById.has(id))) {
      throw new Error('Bộ câu hỏi đã thay đổi. Hãy bắt đầu lại chặng học.');
    }
    rawQuestions = ids.map(id => poolById.get(id));
  }

  // Format questions safely (NEVER expose vi_tri_dap_an_dung to client)
  const formattedQuestions = (rawQuestions || []).map(q => {
    let du_lieu = null;
    if (q.du_lieu_cau_hoi) {
      try {
        const parsed = JSON.parse(q.du_lieu_cau_hoi);
        if (q.loai_cau_hoi === 'NOI_CAP' && parsed.pairs) {
          const leftItems = parsed.pairs.map(p => p.left).sort(() => Math.random() - 0.5);
          const rightItems = parsed.pairs.map(p => p.right).sort(() => Math.random() - 0.5);
          const pairsMap = {};
          parsed.pairs.forEach(p => {
            pairsMap[p.left] = p.right;
          });
          du_lieu = { leftItems, rightItems, totalPairs: parsed.pairs.length, pairsMap };
        } else if (q.loai_cau_hoi === 'DIEN_TU') {
          du_lieu = {
            sentence_template: parsed.sentence_template,
            options: (parsed.options || []).sort(() => Math.random() - 0.5),
            blank_answer: parsed.blank_answer
          };
        } else if (q.loai_cau_hoi === 'SAP_XEP_CAU') {
          const allTokens = [...(parsed.correct_order || []), ...(parsed.distractors || [])].sort(() => Math.random() - 0.5);
          du_lieu = {
            prompt: parsed.prompt,
            tokens: allTokens,
            correct_order: parsed.correct_order
          };
        }
      } catch (e) {
        du_lieu = null;
      }
    }

    return {
      ma_cau_hoi: q.ma_cau_hoi,
      noi_dung: q.noi_dung,
      loai_cau_hoi: q.loai_cau_hoi || 'TRAC_NGHIEM_4',
      muc_bloom: q.muc_bloom || 'NHO',
      buoc_luyen_tap: q.buoc_luyen_tap || 1,
      dap_an: q.loai_cau_hoi === 'TRAC_NGHIEM_4' ? [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d] : null,
      vi_tri_dap_an_dung: q.vi_tri_dap_an_dung !== undefined && q.vi_tri_dap_an_dung !== null ? Number(q.vi_tri_dap_an_dung) : null,
      giai_thich: q.giai_thich || '',
      du_lieu,
      do_kho: q.do_kho || 1
    };
  });

  const thong_tin_cac_buoc = [];
  for (let b = 1; b <= totalSteps; b++) {
    const sc = bloomMatrix[b] || { tieu_de: `Chặng ${b}`, ti_le: 'Hỗn hợp' };
    thong_tin_cac_buoc.push({
      buoc: b,
      tieu_de: sc.tieu_de || `Chặng ${b}`,
      ti_le: sc.ti_le || 'Hỗn hợp',
      hoan_thanh: buoc_hien_tai > b
    });
  }

  return {
    ma_moc: checkpoint.ma_moc,
    tieu_de: checkpoint.tieu_de,
    loai_moc: checkpoint.loai_moc,
    noi_dung_ly_thuyet: checkpoint.noi_dung_ly_thuyet,
    diem_thuong: checkpoint.diem_thuong,
    xu_thuong: checkpoint.xu_thuong,
    trang_thai: userStatus,
    buoc_hien_tai,
    buoc_dang_hoc: activeStep,
    tong_so_buoc: totalSteps,
    so_cau_moi_buoc: questionsPerStep,
    cac_buoc_hoan_thanh,
    thong_tin_cac_buoc,
    danh_sach_cau_hoi: formattedQuestions
  };
}

/**
 * Submit answers for a specific Duolingo Step
 */
async function submitStep(ma_moc, buocNumber, submissions, ma_nguoi_dung) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  const totalSteps = checkpoint.tong_so_buoc || 4;
  const questionsPerStep = checkpoint.so_cau_moi_buoc || 10;
  const step = Math.max(1, Math.min(totalSteps, parseInt(buocNumber || 1, 10)));

  let questions = [];
  if (checkpoint.loai_moc === 'THU_THACH_BOSS') {
    questions = await db.query(`
      SELECT q.* FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      WHERE m.ma_chuong = $1
      ORDER BY q.ma_cau_hoi ASC
    `, [checkpoint.ma_chuong]);
  } else {
    questions = await db.query(
      'SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC',
      [ma_moc]
    );
  }

  if (!questions || questions.length === 0) {
    throw new Error('Mốc bài học chưa có câu hỏi nào.');
  }

  // LOGIC-002 Fix: Evaluate against the specific step's submitted questions
  // while enforcing minimum question count for the step so partial submissions cannot bypass grading
  const expectedStepQuestionCount = Math.min(questionsPerStep, questions.length);
  const submittedIds = new Set(
    (submissions || [])
      .filter(s => s && s.ma_cau_hoi)
      .map(s => String(s.ma_cau_hoi))
  );
  let stepQuestions = questions.filter(q => submittedIds.has(String(q.ma_cau_hoi)));
  if (stepQuestions.length < expectedStepQuestionCount) {
    for (const q of questions) {
      if (stepQuestions.length >= expectedStepQuestionCount) break;
      if (!submittedIds.has(String(q.ma_cau_hoi))) {
        stepQuestions.push(q);
      }
    }
  }

  const rewardCoins = Math.max(5, Math.round((checkpoint.xu_thuong || 20) / totalSteps));
  const rewardExp = Math.max(10, Math.round((checkpoint.diem_thuong || 40) / totalSteps));
  const evaluation = evaluateQuizSubmission(submissions, stepQuestions, 70, rewardCoins, rewardExp);

  // Compute session telemetry from submission attempts (with lookups & per-question time)
  const attempts = (submissions && submissions.length > 0) ? submissions : evaluation.details;
  const telemetry = aggregateSessionTelemetry(attempts);

  let checkpointCompleted = false;
  let nextCheckpointUnlocked = null;
  let actualEarnedCoins = evaluation.earnedCoins;
  let actualEarnedExp = evaluation.earnedExp;

  if (ma_nguoi_dung) {
    const userProg = await db.queryOne(
      'SELECT trang_thai, buoc_hien_tai, cac_buoc_hoan_thanh, du_lieu_tri_nho FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );

    // Update memory weights per question
    let memoryMap = {};
    if (userProg && userProg.du_lieu_tri_nho) {
      try {
        memoryMap = typeof userProg.du_lieu_tri_nho === 'string' ? JSON.parse(userProg.du_lieu_tri_nho) : userProg.du_lieu_tri_nho;
      } catch (e) {
        memoryMap = {};
      }
    }

    for (const att of attempts) {
      if (att && att.ma_cau_hoi) {
        memoryMap[att.ma_cau_hoi] = calculateQuestionWeight(memoryMap[att.ma_cau_hoi], att);
      }
    }
    const updatedMemoryJson = JSON.stringify(memoryMap);

    // Save consolidated session record
    const ma_phien = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await db.execute(`
        INSERT INTO lich_su_phien_hoc (
          ma_phien, ma_nguoi_dung, ma_moc, loai_phien, buoc_so,
          thoi_gian_tong_giay, ti_le_dung, toc_do_trung_binh_giay, tong_so_lan_tra_cuu,
          chi_tiet_cau_hoi
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        ma_phien, ma_nguoi_dung, ma_moc, 'DUOLINGO_STEP', step,
        telemetry.thoi_gian_tong_giay, telemetry.ti_le_dung, telemetry.toc_do_trung_binh_giay, telemetry.tong_so_lan_tra_cuu,
        JSON.stringify(evaluation.details || attempts)
      ]);
    } catch (errLog) {
      console.warn('⚠️ Telemetry log notice:', errLog.message);
    }

    if (evaluation.isPassed) {
      const currentStep = userProg ? (userProg.buoc_hien_tai || 1) : 1;
      const isAlreadyCompletedMoc = userProg && userProg.trang_thai === 'DA_HOAN_THANH';
      const isFirstTimeStepPass = !isAlreadyCompletedMoc && step >= currentStep;

      // LOGIC-003 Fix: Prevent infinite coin/EXP farming and progress string regression on step replay
      if (!isFirstTimeStepPass) {
        actualEarnedCoins = 0;
        actualEarnedExp = 0;
        const preservedStepsStr = isAlreadyCompletedMoc
          ? `${totalSteps}/${totalSteps}`
          : (userProg?.cac_buoc_hoan_thanh || `${Math.min(totalSteps, Math.max(0, currentStep - 1))}/${totalSteps}`);
        await db.execute(`
          UPDATE tien_do_moc_bai_hoc
          SET buoc_hien_tai = $1,
              cac_buoc_hoan_thanh = $2,
              du_lieu_tri_nho = $3
          WHERE ma_nguoi_dung = $4 AND ma_moc = $5
        `, [currentStep, preservedStepsStr, updatedMemoryJson, ma_nguoi_dung, ma_moc]);
      } else {
        const nextStep = currentStep + 1;

        if (nextStep > totalSteps) {
          checkpointCompleted = true;
          await db.execute(`
            UPDATE tien_do_moc_bai_hoc
            SET trang_thai = 'DA_HOAN_THANH',
                buoc_hien_tai = $1,
                cac_buoc_hoan_thanh = $2,
                thoi_diem_hoan_thanh = SYSDATETIME(),
                diem_dat_duoc = diem_dat_duoc + $3,
                xu_da_nhan = xu_da_nhan + $4,
                du_lieu_tri_nho = $5
            WHERE ma_nguoi_dung = $6 AND ma_moc = $7
          `, [totalSteps + 1, `${totalSteps}/${totalSteps}`, actualEarnedExp, actualEarnedCoins, updatedMemoryJson, ma_nguoi_dung, ma_moc]);

          // Unlock next checkpoint
          const courseChapter = await db.queryOne('SELECT ma_mon FROM chuong_hoc WHERE ma_chuong = $1', [checkpoint.ma_chuong]);
          if (courseChapter) {
            const allCourseCheckpoints = await db.query(`
              SELECT m.ma_moc, m.thu_tu, m.tong_so_buoc, c.thu_tu as chuong_thu_tu
              FROM moc_bai_hoc m
              JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
              WHERE c.ma_mon = $1
              ORDER BY c.thu_tu ASC, m.thu_tu ASC
            `, [courseChapter.ma_mon]);

            const nextUnlock = findNextCheckpointToUnlock(allCourseCheckpoints, ma_moc);
            if (nextUnlock && nextUnlock.nextCheckpoint) {
              nextCheckpointUnlocked = nextUnlock.nextCheckpoint;
              const nextProg = await db.queryOne(
                'SELECT ma_tien_do_moc, trang_thai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
                [ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]
              );
              if (!nextProg) {
                const newMocProgId = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
                const nextTotalSteps = nextUnlock.nextCheckpoint.tong_so_buoc || 4;
                await db.execute(`
                  INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh, du_lieu_tri_nho)
                  VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, $4, $5)
                `, [newMocProgId, ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc, `0/${nextTotalSteps}`, '{}']);
              } else if (nextProg.trang_thai === 'KHOA' || nextProg.trang_thai === 'CHUA_MO') {
                await db.execute(`
                  UPDATE tien_do_moc_bai_hoc
                  SET trang_thai = 'DA_MO'
                  WHERE ma_nguoi_dung = $1 AND ma_moc = $2
                `, [ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]);
              }
            }

            // Recalculate course percentage
            const completedCountResult = await db.queryOne(`
              SELECT COUNT(*) as count
              FROM tien_do_moc_bai_hoc p
              JOIN moc_bai_hoc m ON p.ma_moc = m.ma_moc
              JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
              WHERE p.ma_nguoi_dung = $1 AND c.ma_mon = $2 AND p.trang_thai = 'DA_HOAN_THANH'
            `, [ma_nguoi_dung, courseChapter.ma_mon]);

            const totalCount = allCourseCheckpoints.length;
            const compPct = calculateCompletionPercentage(totalCount, completedCountResult ? completedCountResult.count : 0);
            const isCompletedCourse = compPct >= 100;

                        await upsertCourseProgress(ma_nguoi_dung, courseChapter.ma_mon, compPct, isCompletedCourse);
          }
        } else {
          await db.execute(`
            UPDATE tien_do_moc_bai_hoc
            SET buoc_hien_tai = $1,
                cac_buoc_hoan_thanh = $2,
                diem_dat_duoc = diem_dat_duoc + $3,
                xu_da_nhan = xu_da_nhan + $4,
                du_lieu_tri_nho = $5
            WHERE ma_nguoi_dung = $6 AND ma_moc = $7
          `, [nextStep, `${step}/${totalSteps}`, actualEarnedExp, actualEarnedCoins, updatedMemoryJson, ma_nguoi_dung, ma_moc]);
        }

        if (actualEarnedCoins > 0) {
          await mutateCoins(ma_nguoi_dung, actualEarnedCoins, 'HOAN_THANH_MOC', `Hoàn thành Bước ${step} mốc ${checkpoint.tieu_de}`);
        }
        if (actualEarnedExp > 0) {
          await addExperience(ma_nguoi_dung, actualEarnedExp);
        }
      }
    } else {
      // Step not passed yet: persist memory weights so weak questions get prioritized on retry
      await db.execute(`
        UPDATE tien_do_moc_bai_hoc
        SET du_lieu_tri_nho = $1
        WHERE ma_nguoi_dung = $2 AND ma_moc = $3
      `, [updatedMemoryJson, ma_nguoi_dung, ma_moc]);
    }
  }

  return {
    ...evaluation,
    earnedCoins: actualEarnedCoins,
    earnedExp: actualEarnedExp,
    telemetry,
    buoc_vua_lam: step,
    buoc_ke_tiep: evaluation.isPassed ? Math.min(totalSteps + 1, step + 1) : step,
    tong_so_buoc: totalSteps,
    moc_hoan_thanh: checkpointCompleted,
    moc_ke_tiep_mo_khoa: nextCheckpointUnlocked ? nextCheckpointUnlocked.ma_moc : null
  };
}

/**
 * Save partial step session when learner quits learning midway.
 * Persists answered questions, lookup telemetry, real-time seconds, and updates adaptive spaced memory.
 */
async function saveAbandonedStep(ma_moc, buocNumber, submissions, ma_nguoi_dung) {
  if (!submissions || !Array.isArray(submissions) || submissions.length === 0) {
    return { saved: false, message: 'Không có câu hỏi nào để lưu.' };
  }

  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  const step = Math.max(1, parseInt(buocNumber || 1, 10));

  // Sanitize attempts
  const attempts = submissions.map(s => ({
    ma_cau_hoi: s.ma_cau_hoi,
    cau_tra_loi: s.cau_tra_loi !== undefined ? s.cau_tra_loi : s.tra_loi,
    la_dung: Boolean(s.isCorrect !== undefined ? s.isCorrect : s.la_dung),
    thoi_gian_giay: Math.max(0.5, Number(s.thoi_gian_giay) || 5.0),
    so_lan_tra_cuu: Math.max(0, parseInt(s.so_lan_tra_cuu, 10) || 0),
    nhat_ky_tra_cuu: Array.isArray(s.nhat_ky_tra_cuu) ? s.nhat_ky_tra_cuu : []
  }));

  const telemetry = aggregateSessionTelemetry(attempts);

  if (ma_nguoi_dung) {
    // 1. Update memory weights in user's checkpoint progress
    const userProg = await db.queryOne(
      'SELECT du_lieu_tri_nho FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );

    let memoryMap = {};
    if (userProg && userProg.du_lieu_tri_nho) {
      try {
        memoryMap = typeof userProg.du_lieu_tri_nho === 'string' ? JSON.parse(userProg.du_lieu_tri_nho) : userProg.du_lieu_tri_nho;
      } catch (e) {
        memoryMap = {};
      }
    }

    for (const att of attempts) {
      if (att && att.ma_cau_hoi) {
        memoryMap[att.ma_cau_hoi] = calculateQuestionWeight(memoryMap[att.ma_cau_hoi], att);
      }
    }
    const updatedMemoryJson = JSON.stringify(memoryMap);

    await db.execute(`
      UPDATE tien_do_moc_bai_hoc
      SET du_lieu_tri_nho = $1
      WHERE ma_nguoi_dung = $2 AND ma_moc = $3
    `, [updatedMemoryJson, ma_nguoi_dung, ma_moc]);

    // 2. Save record into lich_su_phien_hoc with loai_phien = 'DUOLINGO_STEP_PARTIAL'
    const ma_phien = `sess_part_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await db.execute(`
        INSERT INTO lich_su_phien_hoc (
          ma_phien, ma_nguoi_dung, ma_moc, loai_phien, buoc_so,
          thoi_gian_tong_giay, ti_le_dung, toc_do_trung_binh_giay, tong_so_lan_tra_cuu,
          chi_tiet_cau_hoi
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        ma_phien, ma_nguoi_dung, ma_moc, 'DUOLINGO_STEP_PARTIAL', step,
        telemetry.thoi_gian_tong_giay, telemetry.ti_le_dung, telemetry.toc_do_trung_binh_giay, telemetry.tong_so_lan_tra_cuu,
        JSON.stringify(attempts)
      ]);
    } catch (errLog) {
      console.warn('⚠️ Partial telemetry log error:', errLog.message);
    }
  }

  return {
    saved: true,
    savedQuestionsCount: attempts.length,
    telemetry
  };
}

/**
 * Complete a theoretical checkpoint
 */
async function completeTheoreticalCheckpoint(ma_moc, ma_nguoi_dung) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  let userStatus = 'KHOA';
  if (ma_nguoi_dung) {
    const prog = await db.queryOne(
      'SELECT trang_thai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );
    if (prog) userStatus = prog.trang_thai;
  }

  if (userStatus === 'KHOA') {
    throw new Error('Mốc bài học này đang bị khóa.');
  }

  // Award full coins and EXP
  const earnedCoins = checkpoint.xu_thuong || 10;
  const earnedExp = checkpoint.diem_thuong || 15;
  const totalSteps = checkpoint.tong_so_buoc || 4;

  await db.execute(`
    UPDATE tien_do_moc_bai_hoc
    SET trang_thai = 'DA_HOAN_THANH',
        buoc_hien_tai = $1,
        cac_buoc_hoan_thanh = $2,
        thoi_diem_hoan_thanh = SYSDATETIME(),
        diem_dat_duoc = $3,
        xu_da_nhan = $4
    WHERE ma_nguoi_dung = $5 AND ma_moc = $6
  `, [totalSteps + 1, `${totalSteps}/${totalSteps}`, earnedExp, earnedCoins, ma_nguoi_dung, ma_moc]);

  // Unlock next checkpoint
  const courseChapter = await db.queryOne('SELECT ma_mon FROM chuong_hoc WHERE ma_chuong = $1', [checkpoint.ma_chuong]);
  let nextCheckpointUnlocked = null;

  if (courseChapter) {
    const allCourseCheckpoints = await db.query(`
      SELECT m.ma_moc, m.thu_tu, m.tong_so_buoc, c.thu_tu as chuong_thu_tu
      FROM moc_bai_hoc m
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      WHERE c.ma_mon = $1
      ORDER BY c.thu_tu ASC, m.thu_tu ASC
    `, [courseChapter.ma_mon]);

    const nextUnlock = findNextCheckpointToUnlock(allCourseCheckpoints, ma_moc);
    if (nextUnlock && nextUnlock.nextCheckpoint) {
      nextCheckpointUnlocked = nextUnlock.nextCheckpoint;
      const nextProg = await db.queryOne(
        'SELECT ma_tien_do_moc FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
        [ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]
      );
      if (!nextProg) {
        const newMocProgId = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
        const nextTotalSteps = nextUnlock.nextCheckpoint.tong_so_buoc || 4;
        await db.execute(`
          INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
          VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, $4)
        `, [newMocProgId, ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc, `0/${nextTotalSteps}`]);
      }
    }

    const completedCountResult = await db.queryOne(`
      SELECT COUNT(*) as count
      FROM tien_do_moc_bai_hoc p
      JOIN moc_bai_hoc m ON p.ma_moc = m.ma_moc
      JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
      WHERE p.ma_nguoi_dung = $1 AND c.ma_mon = $2 AND p.trang_thai = 'DA_HOAN_THANH'
    `, [ma_nguoi_dung, courseChapter.ma_mon]);

    const compPct = calculateCompletionPercentage(allCourseCheckpoints.length, completedCountResult ? completedCountResult.count : 0);
    const isCompletedCourse = compPct >= 100;

                await upsertCourseProgress(ma_nguoi_dung, courseChapter.ma_mon, compPct, isCompletedCourse);
  }

  await mutateCoins(ma_nguoi_dung, earnedCoins, 'HOAN_THANH_MOC', `Hoàn thành lý thuyết mốc ${checkpoint.tieu_de}`);
  await addExperience(ma_nguoi_dung, earnedExp);

  return {
    success: true,
    da_hoan_thanh: true,
    xu_nhan_duoc: earnedCoins,
    exp_nhan_duoc: earnedExp,
    moc_ke_tiep_mo_khoa: nextCheckpointUnlocked ? nextCheckpointUnlocked.ma_moc : null
  };
}

/**
 * Check a single question answer in real-time
 */
async function checkSingleQuestion(ma_moc, ma_cau_hoi, tra_loi) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  let q = null;
  if (checkpoint.loai_moc === 'THU_THACH_BOSS') {
    q = await db.queryOne(`
      SELECT q.* FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      WHERE q.ma_cau_hoi = $1 AND m.ma_chuong = $2
    `, [ma_cau_hoi, checkpoint.ma_chuong]);
  } else {
    q = await db.queryOne('SELECT * FROM cau_hoi WHERE ma_cau_hoi = $1 AND ma_moc = $2', [ma_cau_hoi, ma_moc]);
  }
  if (!q) throw new Error('Không tìm thấy câu hỏi.');

  const evalResult = evaluateQuizSubmission([tra_loi], [q], 0, 0, 0);
  const detail = evalResult.details[0] || { la_dung: false, giai_thich: q.giai_thich || '' };

  return {
    la_dung: detail.la_dung,
    giai_thich: q.giai_thich || 'Khái niệm trọng tâm giúp khắc sâu kiến thức.',
    dap_an_dung: detail.dap_an_dung
  };
}

/**
 * Submit quiz submission: marks checkpoint as completed, awards rewards, and unlocks next checkpoint
 */
async function submitQuizCheckpoint(ma_moc, submissions, ma_nguoi_dung) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  let questions = [];
  if (checkpoint.loai_moc === 'THU_THACH_BOSS') {
    questions = await db.query(`
      SELECT q.* FROM cau_hoi q
      JOIN moc_bai_hoc m ON q.ma_moc = m.ma_moc
      WHERE m.ma_chuong = $1
      ORDER BY q.ma_cau_hoi ASC
    `, [checkpoint.ma_chuong]);
  } else {
    questions = await db.query('SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC', [ma_moc]);
  }
  if (!questions || questions.length === 0) {
    return await completeTheoreticalCheckpoint(ma_moc, ma_nguoi_dung);
  }

  const rewardCoins = checkpoint.xu_thuong || 15;
  const rewardExp = checkpoint.diem_thuong || 25;
  const passScore = checkpoint.diem_dat || 70;

  // Evaluate against the session's submitted questions, enforcing minimum question count
  const minSessionQuestions = Math.min(checkpoint.so_cau_moi_buoc || 10, questions.length);
  const submittedIds = new Set(
    (submissions || [])
      .filter(s => s && s.ma_cau_hoi)
      .map(s => String(s.ma_cau_hoi))
  );
  let targetQuestions = questions.filter(q => submittedIds.has(String(q.ma_cau_hoi)));
  if (targetQuestions.length < minSessionQuestions) {
    for (const q of questions) {
      if (targetQuestions.length >= minSessionQuestions) break;
      if (!submittedIds.has(String(q.ma_cau_hoi))) {
        targetQuestions.push(q);
      }
    }
  }

  const evaluation = evaluateQuizSubmission(submissions, targetQuestions, passScore, rewardCoins, rewardExp);

  // Compute session telemetry
  const attempts = (submissions && submissions.length > 0) ? submissions : evaluation.details;
  const telemetry = aggregateSessionTelemetry(attempts);

  let nextCheckpointUnlocked = null;
  let actualEarnedCoins = 0;
  let actualEarnedExp = 0;

  if (ma_nguoi_dung) {
    const userProg = await db.queryOne(
      'SELECT trang_thai, du_lieu_tri_nho FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );

    let memoryMap = {};
    if (userProg && userProg.du_lieu_tri_nho) {
      try {
        memoryMap = typeof userProg.du_lieu_tri_nho === 'string' ? JSON.parse(userProg.du_lieu_tri_nho) : userProg.du_lieu_tri_nho;
      } catch (e) {
        memoryMap = {};
      }
    }

    for (const att of attempts) {
      if (att && att.ma_cau_hoi) {
        memoryMap[att.ma_cau_hoi] = calculateQuestionWeight(memoryMap[att.ma_cau_hoi], att);
      }
    }
    const updatedMemoryJson = JSON.stringify(memoryMap);

    // Save session record
    const ma_phien = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    try {
      await db.execute(`
        INSERT INTO lich_su_phien_hoc (
          ma_phien, ma_nguoi_dung, ma_moc, loai_phien, buoc_so,
          thoi_gian_tong_giay, ti_le_dung, toc_do_trung_binh_giay, tong_so_lan_tra_cuu,
          chi_tiet_cau_hoi
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `, [
        ma_phien, ma_nguoi_dung, ma_moc, 'MOC_PLAY', 4,
        telemetry.thoi_gian_tong_giay, telemetry.ti_le_dung, telemetry.toc_do_trung_binh_giay, telemetry.tong_so_lan_tra_cuu,
        JSON.stringify(evaluation.details || attempts)
      ]);
    } catch (errLog) {
      console.warn('⚠️ Telemetry log notice:', errLog.message);
    }

    // LOGIC-004 Fix: Only mark DA_HOAN_THANH, award coins/EXP, and unlock next checkpoint if evaluation.isPassed is true
    if (evaluation.isPassed) {
      const isAlreadyCompleted = userProg && userProg.trang_thai === 'DA_HOAN_THANH';
      actualEarnedCoins = isAlreadyCompleted ? 0 : evaluation.earnedCoins;
      actualEarnedExp = isAlreadyCompleted ? 0 : evaluation.earnedExp;

      const totalSteps = checkpoint.tong_so_buoc || 4;
      await db.execute(`
        UPDATE tien_do_moc_bai_hoc
        SET trang_thai = 'DA_HOAN_THANH',
            buoc_hien_tai = $1,
            cac_buoc_hoan_thanh = $2,
            thoi_diem_hoan_thanh = SYSDATETIME(),
            diem_dat_duoc = diem_dat_duoc + $3,
            xu_da_nhan = xu_da_nhan + $4,
            du_lieu_tri_nho = $5
        WHERE ma_nguoi_dung = $6 AND ma_moc = $7
      `, [totalSteps + 1, `${totalSteps}/${totalSteps}`, actualEarnedExp, actualEarnedCoins, updatedMemoryJson, ma_nguoi_dung, ma_moc]);

      // Unlock next checkpoint
      const courseChapter = await db.queryOne('SELECT ma_mon FROM chuong_hoc WHERE ma_chuong = $1', [checkpoint.ma_chuong]);
      if (courseChapter) {
        const allCourseCheckpoints = await db.query(`
          SELECT m.ma_moc, m.thu_tu, m.tong_so_buoc, c.thu_tu as chuong_thu_tu
          FROM moc_bai_hoc m
          JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
          WHERE c.ma_mon = $1
          ORDER BY c.thu_tu ASC, m.thu_tu ASC
        `, [courseChapter.ma_mon]);

        const nextUnlock = findNextCheckpointToUnlock(allCourseCheckpoints, ma_moc);
        if (nextUnlock && nextUnlock.nextCheckpoint) {
          nextCheckpointUnlocked = nextUnlock.nextCheckpoint;
          const nextProg = await db.queryOne(
            'SELECT ma_tien_do_moc, trang_thai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
            [ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]
          );
          if (!nextProg) {
            const newMocProgId = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
            const nextTotalSteps = nextUnlock.nextCheckpoint.tong_so_buoc || 4;
            await db.execute(`
              INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
              VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, $4)
            `, [newMocProgId, ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc, `0/${nextTotalSteps}`]);
          } else if (nextProg.trang_thai === 'KHOA' || nextProg.trang_thai === 'CHUA_MO') {
            await db.execute(`
              UPDATE tien_do_moc_bai_hoc
              SET trang_thai = 'DA_MO'
              WHERE ma_nguoi_dung = $1 AND ma_moc = $2
            `, [ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]);
          }
        }

        // Recalculate course completion percentage
        const completedCountResult = await db.queryOne(`
          SELECT COUNT(*) as count
          FROM tien_do_moc_bai_hoc p
          JOIN moc_bai_hoc m ON p.ma_moc = m.ma_moc
          JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
          WHERE p.ma_nguoi_dung = $1 AND c.ma_mon = $2 AND p.trang_thai = 'DA_HOAN_THANH'
        `, [ma_nguoi_dung, courseChapter.ma_mon]);

        const compPct = calculateCompletionPercentage(allCourseCheckpoints.length, completedCountResult ? completedCountResult.count : 0);
        const isCompletedCourse = compPct >= 100;

                    await upsertCourseProgress(ma_nguoi_dung, courseChapter.ma_mon, compPct, isCompletedCourse);
      }

      if (actualEarnedCoins > 0) {
        await mutateCoins(ma_nguoi_dung, actualEarnedCoins, 'HOAN_THANH_MOC', `Hoàn thành mốc ${checkpoint.tieu_de}`);
      }
      if (actualEarnedExp > 0) {
        await addExperience(ma_nguoi_dung, actualEarnedExp);
      }
    } else {
      // Failed to pass threshold: persist updated memory weights without unlocking or completing
      await db.execute(`
        UPDATE tien_do_moc_bai_hoc
        SET du_lieu_tri_nho = $1
        WHERE ma_nguoi_dung = $2 AND ma_moc = $3
      `, [updatedMemoryJson, ma_nguoi_dung, ma_moc]);
    }
  }

  return {
    success: true,
    isPassed: evaluation.isPassed,
    da_hoan_thanh: evaluation.isPassed,
    telemetry,
    scorePercentage: evaluation.scorePercentage,
    correctCount: evaluation.correctCount,
    totalQuestions: evaluation.totalQuestions,
    earnedCoins: actualEarnedCoins,
    earnedExp: actualEarnedExp,
    moc_ke_tiep_mo_khoa: nextCheckpointUnlocked ? nextCheckpointUnlocked.ma_moc : null
  };
}

module.exports = {
  listCourses,
  listMyCourses,
  enrollCourse,
  getCourseDetails,
  getCheckpointContent,
  completeTheoreticalCheckpoint,
  submitQuizCheckpoint,
  submitStep,
  saveAbandonedStep,
  checkSingleQuestion,
  ensureCourseInitialized
};
