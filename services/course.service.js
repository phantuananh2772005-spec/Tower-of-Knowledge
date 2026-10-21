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
    SELECT m.ma_moc 
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
      await db.execute(`
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
        VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, '0/4')
      `, [ma_tien_do_moc, ma_nguoi_dung, firstMoc.ma_moc]);
    }
  }

  return { success: true, message: 'Đăng ký môn học thành công!', course };
}

/**
 * Ensure course progress and first checkpoint are initialized (Legacy helper)
 */
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
    SELECT m.ma_moc 
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
      await db.execute(`
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
        VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, '0/4')
      `, [ma_tien_do_moc, ma_nguoi_dung, firstMoc.ma_moc]);
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
      'SELECT ma_moc, ma_chuong, tieu_de, loai_moc, diem_thuong, xu_thuong, thu_tu FROM moc_bai_hoc WHERE ma_chuong = $1 ORDER BY thu_tu ASC',
      [ch.ma_chuong]
    );

    const enrichedCheckpoints = [];
    for (const m of checkpoints) {
      let status = 'KHOA';
      let diem_dat_duoc = 0;
      let xu_da_nhan = 0;
      let buoc_hien_tai = 1;
      let cac_buoc_hoan_thanh = '0/4';

      if (isEnrolled && ma_nguoi_dung) {
        const prog = await db.queryOne(
          'SELECT trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
          [ma_nguoi_dung, m.ma_moc]
        );
        if (prog) {
          status = prog.trang_thai;
          diem_dat_duoc = prog.diem_dat_duoc || 0;
          xu_da_nhan = prog.xu_da_nhan || 0;
          buoc_hien_tai = prog.buoc_hien_tai || 1;
          cac_buoc_hoan_thanh = prog.cac_buoc_hoan_thanh || '0/4';
        }
      }

      enrichedCheckpoints.push({
        ...m,
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

/**
 * Get checkpoint content for learning / taking test
 */
async function getCheckpointContent(ma_moc, ma_nguoi_dung, stepRequested) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  let userStatus = 'KHOA';
  let buoc_hien_tai = 1;
  let cac_buoc_hoan_thanh = '0/4';

  if (ma_nguoi_dung) {
    const prog = await db.queryOne(
      'SELECT trang_thai, buoc_hien_tai, cac_buoc_hoan_thanh FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );
    if (prog) {
      userStatus = prog.trang_thai;
      buoc_hien_tai = prog.buoc_hien_tai || 1;
      cac_buoc_hoan_thanh = prog.cac_buoc_hoan_thanh || '0/4';
    }
  }

  if (userStatus === 'KHOA') {
    throw new Error('Mốc bài học này đang bị khóa. Hãy hoàn thành các mốc trước để mở khóa!');
  }

  const activeStep = stepRequested ? Math.max(1, Math.min(4, parseInt(stepRequested, 10))) : Math.min(4, buoc_hien_tai);

  // Fetch questions for activeStep
  let rawQuestions = await db.query(`
    SELECT ma_cau_hoi, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d,
           du_lieu_cau_hoi, muc_bloom, buoc_luyen_tap, do_kho
    FROM cau_hoi
    WHERE ma_moc = $1 AND buoc_luyen_tap = $2
    ORDER BY ma_cau_hoi ASC
  `, [ma_moc, activeStep]);

  if (!rawQuestions || rawQuestions.length === 0) {
    rawQuestions = await db.query(`
      SELECT ma_cau_hoi, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d,
             du_lieu_cau_hoi, muc_bloom, buoc_luyen_tap, do_kho
      FROM cau_hoi
      WHERE ma_moc = $1
      ORDER BY ma_cau_hoi ASC
    `, [ma_moc]);
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
            options: (parsed.options || []).sort(() => Math.random() - 0.5)
          };
        } else if (q.loai_cau_hoi === 'SAP_XEP_CAU') {
          const allTokens = [...(parsed.correct_order || []), ...(parsed.distractors || [])].sort(() => Math.random() - 0.5);
          du_lieu = {
            prompt: parsed.prompt,
            tokens: allTokens
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
      du_lieu,
      do_kho: q.do_kho || 1
    };
  });

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
    tong_so_buoc: 4,
    cac_buoc_hoan_thanh,
    thong_tin_cac_buoc: [
      { buoc: 1, tieu_de: 'Khắc sâu Định nghĩa', ti_le: '100% Nhớ', hoan_thanh: buoc_hien_tai > 1 },
      { buoc: 2, tieu_de: 'Củng cố Nhận thức', ti_le: '80% Nhớ - 20% Hiểu', hoan_thanh: buoc_hien_tai > 2 },
      { buoc: 3, tieu_de: 'Kết nối & Phân tích', ti_le: '50% Nhớ - 40% Hiểu - 10% Vận dụng', hoan_thanh: buoc_hien_tai > 3 },
      { buoc: 4, tieu_de: 'Làm chủ & Sắp xếp', ti_le: '10% Nhớ - 60% Hiểu - 30% Vận dụng', hoan_thanh: buoc_hien_tai > 4 }
    ],
    danh_sach_cau_hoi: formattedQuestions
  };
}

/**
 * Submit answers for a specific Duolingo Step
 */
async function submitStep(ma_moc, buocNumber, submissions, ma_nguoi_dung) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  const step = Math.max(1, Math.min(4, parseInt(buocNumber || 1, 10)));

  let questions = await db.query(
    'SELECT * FROM cau_hoi WHERE ma_moc = $1 AND buoc_luyen_tap = $2 ORDER BY ma_cau_hoi ASC',
    [ma_moc, step]
  );

  if (!questions || questions.length === 0) {
    questions = await db.query(
      'SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC',
      [ma_moc]
    );
  }

  if (!questions || questions.length === 0) {
    throw new Error('Mốc bài học chưa có câu hỏi nào.');
  }

  const rewardCoins = Math.max(5, Math.round((checkpoint.xu_thuong || 20) / 4));
  const rewardExp = Math.max(10, Math.round((checkpoint.diem_thuong || 40) / 4));
  const evaluation = evaluateQuizSubmission(submissions, questions, 70, rewardCoins, rewardExp);

  let checkpointCompleted = false;
  let nextCheckpointUnlocked = null;

  if (evaluation.isPassed && ma_nguoi_dung) {
    const userProg = await db.queryOne(
      'SELECT buoc_hien_tai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, ma_moc]
    );

    const currentStep = userProg ? (userProg.buoc_hien_tai || 1) : 1;
    let nextStep = currentStep;
    if (step >= currentStep) {
      nextStep = currentStep + 1;
    }

    if (nextStep > 4) {
      checkpointCompleted = true;
      await db.execute(`
        UPDATE tien_do_moc_bai_hoc
        SET trang_thai = 'DA_HOAN_THANH',
            buoc_hien_tai = 5,
            cac_buoc_hoan_thanh = '4/4',
            thoi_diem_hoan_thanh = SYSDATETIME(),
            diem_dat_duoc = diem_dat_duoc + $1,
            xu_da_nhan = xu_da_nhan + $2
        WHERE ma_nguoi_dung = $3 AND ma_moc = $4
      `, [evaluation.earnedExp, evaluation.earnedCoins, ma_nguoi_dung, ma_moc]);

      // Unlock next checkpoint
      const courseChapter = await db.queryOne('SELECT ma_mon FROM chuong_hoc WHERE ma_chuong = $1', [checkpoint.ma_chuong]);
      if (courseChapter) {
        const allCourseCheckpoints = await db.query(`
          SELECT m.ma_moc, m.thu_tu, c.thu_tu as chuong_thu_tu
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
            await db.execute(`
              INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
              VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, '0/4')
            `, [newMocProgId, ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]);
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

        await db.execute(`
          UPDATE tien_do_mon_hoc
          SET phan_tram_hoan_thanh = $1,
              ngay_hoan_thanh = CASE WHEN $1 >= 100 THEN SYSDATETIME() ELSE NULL END
          WHERE ma_nguoi_dung = $2 AND ma_mon = $3
        `, [compPct, ma_nguoi_dung, courseChapter.ma_mon]);
      }
    } else {
      await db.execute(`
        UPDATE tien_do_moc_bai_hoc
        SET buoc_hien_tai = $1,
            cac_buoc_hoan_thanh = $2,
            diem_dat_duoc = diem_dat_duoc + $3,
            xu_da_nhan = xu_da_nhan + $4
        WHERE ma_nguoi_dung = $5 AND ma_moc = $6
      `, [nextStep, `${nextStep - 1}/4`, evaluation.earnedExp, evaluation.earnedCoins, ma_nguoi_dung, ma_moc]);
    }

    if (evaluation.earnedCoins > 0) {
      await mutateCoins(ma_nguoi_dung, evaluation.earnedCoins, 'HOAN_THANH_MOC', `Hoàn thành Bước ${step} mốc ${checkpoint.tieu_de}`);
    }
    if (evaluation.earnedExp > 0) {
      await addExperience(ma_nguoi_dung, evaluation.earnedExp);
    }
  }

  return {
    ...evaluation,
    buoc_vua_lam: step,
    buoc_ke_tiep: evaluation.isPassed ? Math.min(5, step + 1) : step,
    moc_hoan_thanh: checkpointCompleted,
    moc_ke_tiep_mo_khoa: nextCheckpointUnlocked ? nextCheckpointUnlocked.ma_moc : null
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

  await db.execute(`
    UPDATE tien_do_moc_bai_hoc
    SET trang_thai = 'DA_HOAN_THANH',
        buoc_hien_tai = 5,
        cac_buoc_hoan_thanh = '4/4',
        thoi_diem_hoan_thanh = SYSDATETIME(),
        diem_dat_duoc = $1,
        xu_da_nhan = $2
    WHERE ma_nguoi_dung = $3 AND ma_moc = $4
  `, [earnedExp, earnedCoins, ma_nguoi_dung, ma_moc]);

  // Unlock next checkpoint
  const courseChapter = await db.queryOne('SELECT ma_mon FROM chuong_hoc WHERE ma_chuong = $1', [checkpoint.ma_chuong]);
  let nextCheckpointUnlocked = null;

  if (courseChapter) {
    const allCourseCheckpoints = await db.query(`
      SELECT m.ma_moc, m.thu_tu, c.thu_tu as chuong_thu_tu
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
        await db.execute(`
          INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
          VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, '0/4')
        `, [newMocProgId, ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]);
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

    await db.execute(`
      UPDATE tien_do_mon_hoc
      SET phan_tram_hoan_thanh = $1,
          ngay_hoan_thanh = CASE WHEN $1 >= 100 THEN SYSDATETIME() ELSE NULL END
      WHERE ma_nguoi_dung = $2 AND ma_mon = $3
    `, [compPct, ma_nguoi_dung, courseChapter.ma_mon]);
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
  const q = await db.queryOne('SELECT * FROM cau_hoi WHERE ma_cau_hoi = $1 AND ma_moc = $2', [ma_cau_hoi, ma_moc]);
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

  let questions = await db.query('SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC', [ma_moc]);
  if (!questions || questions.length === 0) {
    return await completeTheoreticalCheckpoint(ma_moc, ma_nguoi_dung);
  }

  const rewardCoins = checkpoint.xu_thuong || 15;
  const rewardExp = checkpoint.diem_thuong || 25;
  const evaluation = evaluateQuizSubmission(submissions, questions, 60, rewardCoins, rewardExp);

  let nextCheckpointUnlocked = null;
  if (ma_nguoi_dung) {
    await db.execute(`
      UPDATE tien_do_moc_bai_hoc
      SET trang_thai = 'DA_HOAN_THANH',
          buoc_hien_tai = 5,
          cac_buoc_hoan_thanh = '4/4',
          thoi_diem_hoan_thanh = SYSDATETIME(),
          diem_dat_duoc = diem_dat_duoc + $1,
          xu_da_nhan = xu_da_nhan + $2
      WHERE ma_nguoi_dung = $3 AND ma_moc = $4
    `, [evaluation.earnedExp || rewardExp, evaluation.earnedCoins || rewardCoins, ma_nguoi_dung, ma_moc]);

    // Unlock next checkpoint
    const courseChapter = await db.queryOne('SELECT ma_mon FROM chuong_hoc WHERE ma_chuong = $1', [checkpoint.ma_chuong]);
    if (courseChapter) {
      const allCourseCheckpoints = await db.query(`
        SELECT m.ma_moc, m.thu_tu, c.thu_tu as chuong_thu_tu
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
          await db.execute(`
            INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, buoc_hien_tai, cac_buoc_hoan_thanh)
            VALUES ($1, $2, $3, 'DA_MO', 0, 0, 1, '0/4')
          `, [newMocProgId, ma_nguoi_dung, nextUnlock.nextCheckpoint.ma_moc]);
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

      await db.execute(`
        UPDATE tien_do_mon_hoc
        SET phan_tram_hoan_thanh = $1,
            ngay_hoan_thanh = CASE WHEN $1 >= 100 THEN SYSDATETIME() ELSE NULL END
        WHERE ma_nguoi_dung = $2 AND ma_mon = $3
      `, [compPct, ma_nguoi_dung, courseChapter.ma_mon]);
    }

    const coinsToAward = evaluation.earnedCoins || rewardCoins;
    const expToAward = evaluation.earnedExp || rewardExp;
    if (coinsToAward > 0) {
      await mutateCoins(ma_nguoi_dung, coinsToAward, 'HOAN_THANH_MOC', `Hoàn thành mốc ${checkpoint.tieu_de}`);
    }
    if (expToAward > 0) {
      await addExperience(ma_nguoi_dung, expToAward);
    }
  }

  return {
    success: true,
    da_hoan_thanh: true,
    scorePercentage: evaluation.scorePercentage,
    correctCount: evaluation.correctCount,
    totalQuestions: evaluation.totalQuestions,
    earnedCoins: evaluation.earnedCoins || rewardCoins,
    earnedExp: evaluation.earnedExp || rewardExp,
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
  checkSingleQuestion,
  ensureCourseInitialized
};
