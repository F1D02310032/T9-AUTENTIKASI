const authService = require('../services/authService');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  res.status(201).json(await authService.register(req.body));
});

exports.login = asyncHandler(async (req, res) => {
  res.status(200).json(await authService.login(req.body));
});

exports.saya = (req, res) => {
  res.status(200).json({ id: req.user.id });
};
