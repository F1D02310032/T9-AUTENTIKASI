const jwt = require('jsonwebtoken');
const AppError = require('../utils/AppError');

exports.butuhLogin = (req, res, next) => {
  const authorization = req.get('Authorization');
  if (typeof authorization !== 'string' || !authorization.startsWith('Bearer ')) {
    return next(new AppError(401, 'Token diperlukan', 'TOKEN_DIPERLUKAN'));
  }

  const token = authorization.slice(7).trim();
  if (!token) {
    return next(new AppError(401, 'Token diperlukan', 'TOKEN_DIPERLUKAN'));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (typeof payload !== 'object' || !Number.isInteger(payload.id)) {
      return next(new AppError(401, 'Token tidak valid', 'TOKEN_TIDAK_VALID'));
    }

    req.user = { id: payload.id };
    return next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError(401, 'Token tidak valid', 'TOKEN_TIDAK_VALID'));
    }
    return next(error);
  }
};
