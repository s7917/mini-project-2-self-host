const Joi = require('joi');

const emailRule = Joi.string().email({ tlds: { allow: false } });

exports.userUpdateSchema = Joi.object({
  name: Joi.string().required(),
  email: emailRule.required(),
  role: Joi.string().valid('learner', 'instructor', 'admin').required()
});

exports.userPatchSchema = Joi.object({
  name: Joi.string().optional(),
  email: emailRule.optional(),
  role: Joi.string().valid('learner', 'instructor', 'admin').optional()
}).min(1);
