const express = require('express');
const router = express.Router();
const courseService = require('../services/course.service');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

router.get('/courses', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const courses = await courseService.listCourses(userId);
    return res.apiSuccess(courses);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_COURSES_FAILED', 500);
  }
});

router.get('/courses/:slug', optionalAuthenticate, async (req, res) => {
  try {
    const userId = req.user ? req.user.ma_nguoi_dung : null;
    const details = await courseService.getCourseDetails(req.params.slug, userId);
    return res.apiSuccess(details);
  } catch (err) {
    return res.apiError(err.message, 'FETCH_COURSE_FAILED', 404);
  }
});

router.get('/checkpoints/:id', authenticate, async (req, res) => {
  try {
    const content = await courseService.getCheckpointContent(req.params.id, req.user.ma_nguoi_dung);
    return res.apiSuccess(content);
  } catch (err) {
    return res.apiError(err.message, 'CHECKPOINT_ACCESS_DENIED', 403);
  }
});

router.post('/checkpoints/:id/complete-theory', authenticate, async (req, res) => {
  try {
    const result = await courseService.completeTheoreticalCheckpoint(req.params.id, req.user.ma_nguoi_dung);
    return res.apiSuccess(result);
  } catch (err) {
    return res.apiError(err.message, 'THEORY_COMPLETION_FAILED', 400);
  }
});

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

module.exports = router;
