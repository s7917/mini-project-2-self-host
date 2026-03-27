const ModuleService = require('../services/ModuleService');
const ApprovalService = require('../services/ApprovalService');
const InstructorScopeService = require('../services/InstructorScopeService');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertCourseOwnership(req.user.sub, Number(req.body.course_id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'module',
        action: 'create',
        payload: req.body
      });
      return sendSuccess(res, 202, data, 'Module creation request submitted for admin approval');
    }

    const data = await ModuleService.create(req.body);
    sendSuccess(res, 201, data, 'Module created');
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await ModuleService.getAll();
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await ModuleService.getById(req.params.id);
    if (!data) return sendError(res, 404, 'Module not found');
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertModuleOwnership(req.user.sub, Number(req.params.id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'module',
        action: 'update',
        entity_id: Number(req.params.id),
        payload: req.body
      });
      return sendSuccess(res, 202, data, 'Module update request submitted for admin approval');
    }

    const data = await ModuleService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Module updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertModuleOwnership(req.user.sub, Number(req.params.id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'module',
        action: 'update',
        entity_id: Number(req.params.id),
        payload: req.body
      });
      return sendSuccess(res, 202, data, 'Module update request submitted for admin approval');
    }

    const data = await ModuleService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Module updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    if (req.user.role === 'instructor') {
      await InstructorScopeService.assertModuleOwnership(req.user.sub, Number(req.params.id));
      const data = await ApprovalService.createRequest({
        requester_id: req.user.sub,
        request_type: 'module',
        action: 'delete',
        entity_id: Number(req.params.id),
        payload: {}
      });
      return sendSuccess(res, 202, data, 'Module deletion request submitted for admin approval');
    }

    await ModuleService.remove(req.params.id);
    sendSuccess(res, 200, null, 'Module deleted');
  } catch (err) { next(err); }
};
