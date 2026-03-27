const LessonService = require('../services/LessonService');
const ApprovalService = require('../services/ApprovalService');
const InstructorScopeService = require('../services/InstructorScopeService');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertModuleOwnership(req.user.sub, Number(req.body.module_id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'lesson',
        action: 'create',
        payload: req.body
      });
      return sendSuccess(res, 202, data, 'Lesson creation request submitted for admin approval');
    }

    const data = await LessonService.create(req.body);
    sendSuccess(res, 201, data, 'Lesson created');
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await LessonService.getAll();
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await LessonService.getById(req.params.id);
    if (!data) return sendError(res, 404, 'Lesson not found');
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertLessonOwnership(req.user.sub, Number(req.params.id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'lesson',
        action: 'update',
        entity_id: Number(req.params.id),
        payload: req.body
      });
      return sendSuccess(res, 202, data, 'Lesson update request submitted for admin approval');
    }

    const data = await LessonService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Lesson updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertLessonOwnership(req.user.sub, Number(req.params.id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'lesson',
        action: 'update',
        entity_id: Number(req.params.id),
        payload: req.body
      });
      return sendSuccess(res, 202, data, 'Lesson update request submitted for admin approval');
    }

    const data = await LessonService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Lesson updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertLessonOwnership(req.user.sub, Number(req.params.id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'lesson',
        action: 'delete',
        entity_id: Number(req.params.id),
        payload: {}
      });
      return sendSuccess(res, 202, data, 'Lesson deletion request submitted for admin approval');
    }

    await LessonService.remove(req.params.id);
    sendSuccess(res, 200, null, 'Lesson deleted');
  } catch (err) { next(err); }
};
