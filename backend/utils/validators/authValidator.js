const Joi = require('joi');

const emailRule = Joi.string().email({ tlds: { allow: false } });

exports.localLoginSchema = Joi.object({
  email: emailRule.required(),
  password: Joi.string().min(6).required()
});

exports.localSignupSchema = Joi.object({
  name: Joi.string().min(2).required(),
  email: emailRule.required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('learner', 'instructor').default('learner')
});
