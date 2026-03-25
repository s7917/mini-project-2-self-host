const LessonService = require('../services/LessonService');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
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
    const data = await LessonService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Lesson updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    const data = await LessonService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Lesson updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await LessonService.remove(req.params.id);
    sendSuccess(res, 200, null, 'Lesson deleted');
  } catch (err) { next(err); }
};
