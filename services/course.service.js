/**
 * Course & Progression Service
 * Implements course navigation, checkpoint unlocking (Lazy Initialization),
 * and server-side quiz grading.
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
 * Ensure course progress and first checkpoint are initialized (Lazy Initialization)
 */
async function ensureCourseInitialized(ma_nguoi_dung, ma_mon) {
  // Check if course progress exists
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

  // Get first checkpoint of course
  const firstMoc = await db.queryOne(`
    SELECT TOP 1 m.ma_moc 
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
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan)
        VALUES ($1, $2, $3, 'DA_MO', 0, 0)
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

  if (ma_nguoi_dung) {
    await ensureCourseInitialized(ma_nguoi_dung, course.ma_mon);
  }

  const chapters = await db.query('SELECT * FROM chuong_hoc WHERE ma_mon = $1 ORDER BY thu_tu ASC', [course.ma_mon]);

  const allCheckpoints = [];
  const chaptersWithCheckpoints = [];

  for (const ch of chapters) {
    const checkpoints = await db.query(
      'SELECT ma_moc, ma_chuong, tieu_de, loai_moc, diem_thuong, xu_thuong, thu_tu FROM moc_bai_hoc WHERE ma_chuong = $1 ORDER BY thu_tu ASC',
      [ch.ma_chuong]
    );

    const enrichedCheckpoints = [];
    for (const m of checkpoints) {
      allCheckpoints.push(m);
      let status = 'KHOA';
      let diem_dat_duoc = 0;
      let xu_da_nhan = 0;

      if (ma_nguoi_dung) {
        const prog = await db.queryOne(
          'SELECT trang_thai, diem_dat_duoc, xu_da_nhan FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
          [ma_nguoi_dung, m.ma_moc]
        );
        if (prog) {
          status = prog.trang_thai;
          diem_dat_duoc = prog.diem_dat_duoc;
          xu_da_nhan = prog.xu_da_nhan;
        }
      }

      enrichedCheckpoints.push({
        ...m,
        trang_thai: status,
        diem_dat_duoc,
        xu_da_nhan
      });
    }

    chaptersWithCheckpoints.push({
      ...ch,
      cac_moc: enrichedCheckpoints
    });
  }

  // Calculate current completion percentage
  let progressPct = 0;
  if (ma_nguoi_dung) {
    const userProgress = await db.queryOne(
      'SELECT phan_tram_hoan_thanh FROM tien_do_mon_hoc WHERE ma_nguoi_dung = $1 AND ma_mon = $2',
      [ma_nguoi_dung, course.ma_mon]
    );
    progressPct = userProgress ? userProgress.phan_tram_hoan_thanh : 0;
  }

  return {
    mon_hoc: {
      ...course,
      phan_tram_hoan_thanh: progressPct
    },
    cac_chuong: chaptersWithCheckpoints
  };
}

/**
 * Get checkpoint content for learning / taking test
 */
async function getCheckpointContent(ma_moc, ma_nguoi_dung) {
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
    throw new Error('Mốc bài học này đang bị khóa. Hãy hoàn thành các mốc trước để mở khóa!');
  }

  if (checkpoint.loai_moc === 'LY_THUYET') {
    return {
      ma_moc: checkpoint.ma_moc,
      tieu_de: checkpoint.tieu_de,
      loai_moc: checkpoint.loai_moc,
      noi_dung_ly_thuyet: checkpoint.noi_dung_ly_thuyet,
      diem_thuong: checkpoint.diem_thuong,
      xu_thuong: checkpoint.xu_thuong,
      trang_thai: userStatus
    };
  }

  // TRAC_NGHIEM or THU_THACH_BOSS: NEVER return vi_tri_dap_an_dung to client!
  const questions = await db.query(`
    SELECT ma_cau_hoi, noi_dung, loai_cau_hoi, dap_an_a, dap_an_b, dap_an_c, dap_an_d, do_kho
    FROM cau_hoi
    WHERE ma_moc = $1
    ORDER BY ma_cau_hoi ASC
  `, [ma_moc]);

  return {
    ma_moc: checkpoint.ma_moc,
    tieu_de: checkpoint.tieu_de,
    loai_moc: checkpoint.loai_moc,
    diem_thuong: checkpoint.diem_thuong,
    xu_thuong: checkpoint.xu_thuong,
    trang_thai: userStatus,
    danh_sach_cau_hoi: questions.map(q => ({
      ma_cau_hoi: q.ma_cau_hoi,
      noi_dung: q.noi_dung,
      dap_an: [q.dap_an_a, q.dap_an_b, q.dap_an_c, q.dap_an_d],
      do_kho: q.do_kho
    }))
  };
}

/**
 * Complete a theoretical checkpoint
 */
async function completeTheoreticalCheckpoint(ma_moc, ma_nguoi_dung) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');
  if (checkpoint.loai_moc !== 'LY_THUYET') {
    throw new Error('Chỉ mốc lý thuyết mới có thể hoàn thành trực tiếp mà không cần làm bài thi.');
  }

  // Check current status
  const prog = await db.queryOne(
    'SELECT trang_thai, xu_da_nhan FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
    [ma_nguoi_dung, ma_moc]
  );

  const isFirstTime = !prog || prog.trang_thai !== 'HOAN_THANH';

  // Mark checkpoint completed
  if (!prog) {
    const ma_tien_do_moc = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    await db.execute(`
      INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, thoi_diem_hoan_thanh)
      VALUES ($1, $2, $3, 'HOAN_THANH', $4, $5, SYSDATETIME())
    `, [ma_tien_do_moc, ma_nguoi_dung, ma_moc, checkpoint.diem_thuong, checkpoint.xu_thuong]);
  } else {
    await db.execute(`
      UPDATE tien_do_moc_bai_hoc 
      SET trang_thai = 'HOAN_THANH', diem_dat_duoc = $1, xu_da_nhan = $2, thoi_diem_hoan_thanh = SYSDATETIME()
      WHERE ma_nguoi_dung = $3 AND ma_moc = $4
    `, [checkpoint.diem_thuong, checkpoint.xu_thuong, ma_nguoi_dung, ma_moc]);
  }

  // If first time, distribute rewards
  if (isFirstTime) {
    await mutateCoins(ma_nguoi_dung, checkpoint.xu_thuong, 'THUONG_MOC_HOC', `Thưởng hoàn thành lý thuyết: ${checkpoint.tieu_de}`);
    await addExperience(ma_nguoi_dung, checkpoint.diem_thuong);
  }

  // Unlock next checkpoint
  await unlockNextCheckpoint(ma_moc, ma_nguoi_dung);

  return {
    thanh_cong: true,
    diem_thuong: checkpoint.diem_thuong,
    xu_thuong: checkpoint.xu_thuong,
    da_hoan_thanh_truoc_do: !isFirstTime
  };
}

/**
 * Submit quiz submission and grade on server
 */
async function submitQuizCheckpoint(ma_moc, submissions, ma_nguoi_dung) {
  const checkpoint = await db.queryOne('SELECT * FROM moc_bai_hoc WHERE ma_moc = $1', [ma_moc]);
  if (!checkpoint) throw new Error('Không tìm thấy mốc bài học.');

  // Fetch real questions with correct answers
  const questions = await db.query('SELECT * FROM cau_hoi WHERE ma_moc = $1 ORDER BY ma_cau_hoi ASC', [ma_moc]);
  if (!questions || questions.length === 0) {
    throw new Error('Mốc bài học chưa có câu hỏi nào.');
  }

  // Grade using pure business rule
  const result = evaluateQuizSubmission(
    submissions,
    questions,
    70,
    checkpoint.xu_thuong,
    checkpoint.diem_thuong
  );

  const prog = await db.queryOne(
    'SELECT trang_thai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
    [ma_nguoi_dung, ma_moc]
  );
  const isFirstTimePassing = (!prog || prog.trang_thai !== 'HOAN_THANH') && result.isPassed;

  if (result.isPassed) {
    if (!prog) {
      const ma_tien_do_moc = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.execute(`
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan, thoi_diem_hoan_thanh)
        VALUES ($1, $2, $3, 'HOAN_THANH', $4, $5, SYSDATETIME())
      `, [ma_tien_do_moc, ma_nguoi_dung, ma_moc, result.awardedExp, result.awardedCoins]);
    } else {
      await db.execute(`
        UPDATE tien_do_moc_bai_hoc 
        SET trang_thai = 'HOAN_THANH', diem_dat_duoc = $1, xu_da_nhan = $2, thoi_diem_hoan_thanh = SYSDATETIME()
        WHERE ma_nguoi_dung = $3 AND ma_moc = $4
      `, [result.awardedExp, result.awardedCoins, ma_nguoi_dung, ma_moc]);
    }

    if (isFirstTimePassing) {
      await mutateCoins(ma_nguoi_dung, result.awardedCoins, 'THUONG_MOC_HOC', `Thưởng vượt mốc trắc nghiệm: ${checkpoint.tieu_de}`);
      await addExperience(ma_nguoi_dung, result.awardedExp);
    }

    // Unlock next checkpoint
    await unlockNextCheckpoint(ma_moc, ma_nguoi_dung);
  }

  return {
    ...result,
    isFirstTimePassing
  };
}

/**
 * Unlock the subsequent checkpoint in the curriculum sequence
 */
async function unlockNextCheckpoint(currentMocId, ma_nguoi_dung) {
  // Find current course
  const currentChapter = await db.queryOne(`
    SELECT c.ma_mon 
    FROM moc_bai_hoc m
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE m.ma_moc = $1
  `, [currentMocId]);

  if (!currentChapter) return;

  const ma_mon = currentChapter.ma_mon;

  // Fetch all checkpoints in course in natural order
  const allMocs = await db.query(`
    SELECT m.ma_moc, c.thu_tu * 100 + m.thu_tu AS thu_tu
    FROM moc_bai_hoc m
    JOIN chuong_hoc c ON m.ma_chuong = c.ma_chuong
    WHERE c.ma_mon = $1
    ORDER BY c.thu_tu ASC, m.thu_tu ASC
  `, [ma_mon]);

  const unlockResult = findNextCheckpointToUnlock(allMocs, currentMocId);
  const nextMocId = unlockResult?.nextCheckpoint?.ma_moc;

  if (nextMocId) {
    const existing = await db.queryOne(
      'SELECT ma_tien_do_moc, trang_thai FROM tien_do_moc_bai_hoc WHERE ma_nguoi_dung = $1 AND ma_moc = $2',
      [ma_nguoi_dung, nextMocId]
    );

    if (!existing) {
      const ma_tien_do_moc = `pck_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      await db.execute(`
        INSERT INTO tien_do_moc_bai_hoc (ma_tien_do_moc, ma_nguoi_dung, ma_moc, trang_thai, diem_dat_duoc, xu_da_nhan)
        VALUES ($1, $2, $3, 'DA_MO', 0, 0)
      `, [ma_tien_do_moc, ma_nguoi_dung, nextMocId]);
    }
  }

  const completedMocs = await db.query(`
    SELECT ma_moc 
    FROM tien_do_moc_bai_hoc 
    WHERE ma_nguoi_dung = $1 AND trang_thai = 'HOAN_THANH'
  `, [ma_nguoi_dung]);
  const completedIds = completedMocs.map(c => c.ma_moc);

  // Recalculate course percentage
  const totalCheckpoints = allMocs.length;
  const completedCount = allMocs.filter(m => completedIds.includes(m.ma_moc) || m.ma_moc === currentMocId).length;
  const percentage = calculateCompletionPercentage(completedCount, totalCheckpoints);

  await db.execute(`
    UPDATE tien_do_mon_hoc
    SET phan_tram_hoan_thanh = $1,
        ngay_hoan_thanh = (CASE WHEN $1 >= 100.0 THEN SYSDATETIME() ELSE NULL END)
    WHERE ma_nguoi_dung = $2 AND ma_mon = $3
  `, [percentage, ma_nguoi_dung, ma_mon]);
}

module.exports = {
  listCourses,
  getCourseDetails,
  getCheckpointContent,
  completeTheoreticalCheckpoint,
  submitQuizCheckpoint,
  ensureCourseInitialized
};
