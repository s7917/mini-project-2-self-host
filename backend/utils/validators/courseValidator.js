const Joi = require('joi');

exports.courseCreateSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().optional().allow(''),
  instructor_id: Joi.number().integer().required()
});

exports.coursePatchSchema = Joi.object({
  title: Joi.string().min(3).optional(),
  description: Joi.string().optional().allow(''),
  instructor_id: Joi.number().integer().optional()
}).min(1);
