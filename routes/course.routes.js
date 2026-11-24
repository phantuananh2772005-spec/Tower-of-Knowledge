const express = require('express');
const courseService = require('../services/course.service');
const courseSessions = require('../services/course-sessions.service');
const { records } = require('../services/checkpoint-records');
const { authenticate, optionalAuthenticate } = require('../middlewares/auth.middleware');

const router = express.Router();

function apiOperation(operation, errorCode, errorStatus) {
  return async (req, res) => {
    try {
      res.apiSuccess(await operation(req));
    } catch (error) {
      res.apiError(error.message, errorCode, errorStatus);
    }
  };
}

router.get('/courses', optionalAuthenticate, apiOperation(
  req => courseService.listCourses(req.user?.id ?? null), 'FETCH_COURSES_FAILED', 500
));

router.get('/my-courses', authenticate, apiOperation(
  req => courseService.listMyCourses(req.user.id), 'FETCH_MY_COURSES_FAILED', 500
));

router.post('/courses/:slug/enroll', authenticate, apiOperation(
  req => courseService.enrollCourse(req.params.slug, req.user.id), 'ENROLL_FAILED', 400
));

router.get('/courses/:slug', optionalAuthenticate, apiOperation(async req => {
  const userId = req.user?.id ?? null;
  const details = await courseService.getCourseDetails(req.params.slug, userId);
  const milestones = details.chapters.flatMap(chapter => chapter.milestones);
  const byMilestone = userId ? await records(userId, milestones.map(milestone => milestone.id)) : {};
  for (const milestone of milestones) {
    milestone.record = byMilestone[milestone.id] ?? null;
  }
  return details;
}, 'FETCH_COURSE_FAILED', 404));

router.get('/checkpoints/:id', authenticate, apiOperation(async req => {
  const milestoneId = req.params.id;
  const preview = await courseService.getCheckpointPreview(milestoneId, req.user.id);
  const byMilestone = await records(req.user.id, [milestoneId]);
  return { ...preview, record: byMilestone[milestoneId] ?? null };
}, 'CHECKPOINT_ACCESS_DENIED', 403));

router.post('/checkpoints/:id/complete-theory', authenticate, apiOperation(
  req => courseService.completeTheoreticalCheckpoint(req.params.id, req.user.id),
  'THEORY_COMPLETION_FAILED', 400
));

router.post('/checkpoints/:id/sessions', authenticate, apiOperation(
  req => courseSessions.startSession(req.params.id, req.user.id, req.body ?? {}),
  'STUDY_SESSION_START_FAILED', 400
));

router.get('/checkpoints/:id/sessions/:sid', authenticate, apiOperation(
  req => courseSessions.getSession(req.params.id, req.user.id, req.params.sid),
  'STUDY_SESSION_ACCESS_DENIED', 403
));

router.post('/checkpoints/:id/sessions/:sid/answer', authenticate, apiOperation(
  req => courseSessions.answer(req.params.id, req.user.id, req.params.sid, req.body ?? {}),
  'STUDY_ANSWER_FAILED', 400
));

router.post('/checkpoints/:id/sessions/:sid/pair', authenticate, apiOperation(
  req => courseSessions.checkPair(req.params.id, req.user.id, req.params.sid, req.body ?? {}),
  'STUDY_PAIR_CHECK_FAILED', 400
));

router.post('/checkpoints/:id/sessions/:sid/lookups', authenticate, apiOperation(
  req => courseSessions.attachLookups(req.params.id, req.user.id, req.params.sid, req.body ?? {}),
  'STUDY_LOOKUP_FAILED', 400
));

router.post('/checkpoints/:id/sessions/:sid/finish', authenticate, apiOperation(
  req => courseSessions.finish(req.params.id, req.user.id, req.params.sid, req.body ?? {}),
  'STUDY_SESSION_FINISH_FAILED', 400
));

module.exports = router;
