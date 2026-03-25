const EnrollmentService = require('../services/EnrollmentService');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
    const data = await EnrollmentService.create(req.body);
    sendSuccess(res, 201, data, 'Enrollment created');
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await EnrollmentService.getAll();
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await EnrollmentService.getById(req.params.id);
    if (!data) return sendError(res, 404, 'Enrollment not found');
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await EnrollmentService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Enrollment updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    const data = await EnrollmentService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Enrollment updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await EnrollmentService.remove(req.params.id);
    sendSuccess(res, 200, null, 'Enrollment deleted');
  } catch (err) { next(err); }
};
