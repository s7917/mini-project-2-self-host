const Joi = require('joi');

exports.lessonCreateSchema = Joi.object({
  module_id: Joi.number().integer().required(),
  lesson_name: Joi.string().min(2).required(),
  content: Joi.string().optional().allow('')
});

exports.lessonPatchSchema = Joi.object({
  module_id: Joi.number().integer().optional(),
  lesson_name: Joi.string().min(2).optional(),
  content: Joi.string().optional().allow('')
}).min(1);
