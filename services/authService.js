const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const userData = require('../data/userData');
const AppError = require('../utils/AppError');

const LOGIN_ERROR_MESSAGE = 'Email atau password salah';

exports.register = async ({ email, password }) => {
  const passwordHash = await bcrypt.hash(password, 10);

  try {
    return await userData.create({ email, passwordHash });
  } catch (error) {
    if (error.code === 'P2002') {
      throw new AppError(409, 'Email sudah terdaftar', 'EMAIL_DUPLIKAT');
    }
    throw error;
  }
};

exports.login = async ({ email, password }) => {
  const user = await userData.findByEmail(email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AppError(401, LOGIN_ERROR_MESSAGE, 'LOGIN_GAGAL');
  }

  const token = jwt.sign(
    { id: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '2h' }
  );
  return { token };
};
