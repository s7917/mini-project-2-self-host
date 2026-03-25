const ModuleService = require('../services/ModuleService');
const { sendSuccess, sendError } = require('../utils/response');

exports.create = async (req, res, next) => {
  try {
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
    const data = await ModuleService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Module updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    const data = await ModuleService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'Module updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await ModuleService.remove(req.params.id);
    sendSuccess(res, 200, null, 'Module deleted');
  } catch (err) { next(err); }
};
