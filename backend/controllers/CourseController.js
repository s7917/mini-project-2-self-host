const CourseService = require('../services/CourseService');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
    const data = await CourseService.create(req.body);
    sendSuccess(res, 201, data, 'Course created');
  } catch (err) { next(err); }
};

exports.getAll = async (req, res, next) => {
  try {
    const data = await CourseService.getAll();
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await CourseService.getById(req.params.id);
    if (!data) return sendError(res, 404, 'Course not found');
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await CourseService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Course updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    const data = await CourseService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Course updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await CourseService.remove(req.params.id);
    sendSuccess(res, 200, null, 'Course deleted');
  } catch (err) { next(err); }
};
