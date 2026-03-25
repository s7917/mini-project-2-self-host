const Joi = require('joi');

exports.moduleCreateSchema = Joi.object({
  course_id: Joi.number().integer().required(),
  module_name: Joi.string().min(2).required(),
  sequence_order: Joi.number().integer().min(1).required()
});

exports.modulePatchSchema = Joi.object({
  course_id: Joi.number().integer().optional(),
  module_name: Joi.string().min(2).optional(),
  sequence_order: Joi.number().integer().min(1).optional()
}).min(1);
