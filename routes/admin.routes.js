const express = require('express');
const adminService = require('../services/admin.service');
const { requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(requireAdmin);

function adminOperation(operation, errorCode, { successStatus = 200, failureStatus = 500 } = {}) {
  return async (req, res) => {
    try {
      return res.apiSuccess(await operation(req), successStatus);
    } catch (error) {
      const status = error.status ?? failureStatus;
      if (status >= 500) {
        console.error('[ADMIN] ' + errorCode, error);
        return res.apiError('Không thể xử lý yêu cầu quản trị.', errorCode, status);
      }
      const message = error.severity ? 'Dữ liệu không đáp ứng ràng buộc.' : error.message;
      return res.apiError(message, errorCode, status);
    }
  };
}

const create = { successStatus: 201, failureStatus: 400 };
const write = { failureStatus: 400 };

router.get('/stats', adminOperation(() => adminService.getSystemStats(), 'FETCH_STATS_FAILED'));

router.get('/courses', adminOperation(() => adminService.listCourses(), 'FETCH_COURSES_FAILED'));
router.post('/courses', adminOperation(
  req => adminService.createCourse(req.body), 'CREATE_COURSE_FAILED', create
));
router.put('/courses/:id', adminOperation(
  req => adminService.updateCourse(req.params.id, req.body), 'UPDATE_COURSE_FAILED', write
));
router.delete('/courses/:id', adminOperation(
  req => adminService.deleteCourse(req.params.id), 'DELETE_COURSE_FAILED', write
));

router.post('/chapters', adminOperation(
  req => adminService.createChapter(req.body), 'CREATE_CHAPTER_FAILED', create
));
router.put('/chapters/:id', adminOperation(
  req => adminService.updateChapter(req.params.id, req.body), 'UPDATE_CHAPTER_FAILED', write
));
router.delete('/chapters/:id', adminOperation(
  req => adminService.deleteChapter(req.params.id), 'DELETE_CHAPTER_FAILED', write
));

router.post('/checkpoints', adminOperation(
  req => adminService.createCheckpoint(req.body), 'CREATE_CHECKPOINT_FAILED', create
));
router.put('/checkpoints/:id', adminOperation(
  req => adminService.updateCheckpoint(req.params.id, req.body), 'UPDATE_CHECKPOINT_FAILED', write
));
router.delete('/checkpoints/:id', adminOperation(
  req => adminService.deleteCheckpoint(req.params.id), 'DELETE_CHECKPOINT_FAILED', write
));

router.get('/questions', adminOperation(
  req => adminService.listQuestions(req.query), 'FETCH_QUESTIONS_FAILED', { failureStatus: 400 }
));
router.post('/questions', adminOperation(
  req => adminService.createQuestion(req.body), 'CREATE_QUESTION_FAILED', create
));
router.put('/questions/:id', adminOperation(
  req => adminService.updateQuestion(req.params.id, req.body), 'UPDATE_QUESTION_FAILED', write
));
router.delete('/questions/:id', adminOperation(
  req => adminService.deleteQuestion(req.params.id), 'DELETE_QUESTION_FAILED', write
));
router.post('/questions/bulk', adminOperation(
  req => adminService.bulkImportQuestions(req.body?.questions, req.body?.default_milestone_id),
  'BULK_IMPORT_FAILED', write
));

router.get('/users', adminOperation(() => adminService.listUsers(), 'FETCH_USERS_FAILED'));
router.put('/users/:id/role', adminOperation(
  req => adminService.updateUserRole(req.params.id, req.body?.role, req.user.id), 'UPDATE_ROLE_FAILED', write
));
router.put('/users/:id/disabled', adminOperation(
  req => adminService.setUserDisabled(req.params.id, req.body?.disabled, req.user.id), 'UPDATE_USER_STATUS_FAILED', write
));
router.post('/users/:id/coins', adminOperation(
  req => adminService.adjustUserCoins(req.params.id, req.body?.amount, req.body?.reason), 'ADJUST_COINS_FAILED', write
));

router.get('/logs', adminOperation(
  () => adminService.getActivityLogs(), 'FETCH_LOGS_FAILED'
));
router.get('/learning-activity', adminOperation(
  () => adminService.getLearningActivityFeed(), 'FETCH_LEARNING_ACTIVITY_FAILED'
));
router.get('/learners', adminOperation(
  () => adminService.getLearnersTelemetryList(), 'FETCH_LEARNERS_FAILED'
));
router.get('/learners/:id/telemetry', adminOperation(
  req => adminService.getLearnerDeepTelemetry(req.params.id), 'FETCH_LEARNER_TELEMETRY_FAILED'
));
router.get('/transactions', adminOperation(
  () => adminService.getAllTransactions(), 'FETCH_TRANSACTIONS_FAILED'
));

router.get('/pets', adminOperation(() => adminService.listPets(), 'FETCH_PETS_FAILED'));
router.post('/pets', adminOperation(
  req => adminService.createPet(req.body), 'CREATE_PET_FAILED', create
));
router.put('/pets/:id', adminOperation(
  req => adminService.updatePet(req.params.id, req.body), 'UPDATE_PET_FAILED', write
));
router.delete('/pets/:id', adminOperation(
  req => adminService.deletePet(req.params.id), 'DELETE_PET_FAILED', write
));

module.exports = router;
