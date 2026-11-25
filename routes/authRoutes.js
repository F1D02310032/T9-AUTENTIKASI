const express = require('express');
const controller = require('../controllers/authController');
const { butuhLogin } = require('../middleware/auth');
const { validateAuth } = require('../validators/authValidator');

const router = express.Router();

router.post('/register', validateAuth, controller.register);
router.post('/login', validateAuth, controller.login);
router.get('/saya', butuhLogin, controller.saya);

module.exports = router;
