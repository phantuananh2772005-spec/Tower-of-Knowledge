const express = require('express');
const router = express.Router();
const courseService = require('../services/course.service');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

// 1. List all available system courses
router.get('/courses', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const courses = await courseService.listCourses(userId);
    return res.apiSuccess(courses);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_COURSES_FAILED', 500);
  }
});

// 2. List enrolled courses of the current user
router.get('/my-courses', authenticate, async (req, res) => {
  try {
    const courses = await courseService.listMyCourses(req.user.ma_nguoi_dung);
    return res.apiSuccess(courses);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_MY_COURSES_FAILED', 500);
  }
});

// 3. Explicit Course Enrollment
router.post('/courses/:slug/enroll', authenticate, async (req, res) => {
  try {
    const result = await courseService.enrollCourse(req.params.slug, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'ENROLL_FAILED', 400);
  }
});

// 4. Get course details and roadmap
router.get('/courses/:slug', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const details = await courseService.getCourseDetails(req.params.slug, userId);
    return res.apiSuccess(details);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_COURSE_FAILED', 404);
  }
});

// 5. Get checkpoint content (supports ?step=X)
router.get('/checkpoints/:id', authenticate, async (req, res) => {
  try {
    const step = req.query.step ? parseInt(req.query.step, 10) : undefined;
    const content = await courseService.getCheckpointContent(req.params.id, req.user.ma_nguoi_dung, step);
    return res.apiSuccess(content);
  } catch (err) {
    return res.apiError(err.message, 'CHECKPOINT_ACCESS_DENIED', 403);
  }
});

// 6. Complete theory checkpoint
router.post('/checkpoints/:id/complete-theory', authenticate, async (req, res) => {
  try {
    const result = await courseService.completeTheoreticalCheckpoint(req.params.id, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'THEORY_COMPLETION_FAILED', 400);
  }
});

// 7. Submit Duolingo Step answers
router.post('/checkpoints/:id/submit-step', authenticate, async (req, res) => {
  try {
    const { buoc, cau_tra_loi } = req.body;
    if (!cau_tra_loi || !Array.isArray(cau_tra_loi)) {
      return res.apiError('Danh sách câu trả lời không hợp lệ.', 'INVALID_SUBMISSION', 400);
    }
    const result = await courseService.submitStep(req.params.id, buoc, cau_tra_loi, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'SUBMIT_STEP_FAILED', 400);
  }
});

// 8. Submit checkpoint (completes checkpoint, unlocks next node, awards EXP and coins)
router.post('/checkpoints/:id/submit', authenticate, async (req, res) => {
  try {
    const { cau_tra_loi } = req.body;
    if (!cau_tra_loi || !Array.isArray(cau_tra_loi)) {
      return res.apiError('Danh sách câu trả lời không hợp lệ.', 'INVALID_SUBMISSION', 400);
    }
    const result = await courseService.submitQuizCheckpoint(req.params.id, cau_tra_loi, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'SUBMIT_FAILED', 400);
  }
});

// 9. Real-time Single Question Evaluation for Duolingo Practice
router.post('/checkpoints/:id/check-answer', authenticate, async (req, res) => {
  try {
    const { ma_cau_hoi, tra_loi } = req.body;
    if (!ma_cau_hoi || tra_loi === undefined) {
      return res.apiError('Thiếu mã câu hỏi hoặc câu trả lời.', 'INVALID_INPUT', 400);
    }
    const result = await courseService.checkSingleQuestion(req.params.id, ma_cau_hoi, tra_loi);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'CHECK_ANSWER_FAILED', 400);
  }
});

module.exports = router;
