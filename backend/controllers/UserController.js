const UserService = require('../services/UserService');
const { sendSuccess, sendError } = require('../utils/response');

exports.getAll = async (req, res, next) => {
  try {
    const data = await UserService.getAll();
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try {
    const data = await UserService.getById(req.params.id);
    if (!data) return sendError(res, 404, 'User not found');
    sendSuccess(res, 200, data);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const data = await UserService.update(req.params.id, req.body);
    sendSuccess(res, 200, data, 'User updated');
  } catch (err) { next(err); }
};

exports.patch = async (req, res, next) => {
  try {
    const data = await UserService.patch(req.params.id, req.body);
    sendSuccess(res, 200, data, 'User updated');
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    await UserService.remove(req.params.id);
    sendSuccess(res, 200, null, 'User deleted');
  } catch (err) { next(err); }
};
