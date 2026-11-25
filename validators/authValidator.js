const Joi = require('joi');
const AppError = require('../utils/AppError');

const schema = Joi.object({
  email: Joi.string().email().max(100).required(),
  password: Joi.string()
    .min(8)
    .max(72)
    .custom((value, helpers) => (
      Buffer.byteLength(value, 'utf8') <= 72
        ? value
        : helpers.error('string.max', { limit: 72 })
    ))
    .required()
}).unknown(false);

exports.validateAuth = (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const pesan = error.details.map((detail) => detail.message).join('; ');
    return next(new AppError(422, pesan, 'VALIDATION_ERROR'));
  }
  req.body = value;
  next();
};
