const Joi = require('joi');

exports.userUpdateSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  role: Joi.string().valid('learner', 'instructor', 'admin').required()
});

exports.userPatchSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid('learner', 'instructor', 'admin').optional()
}).min(1);
