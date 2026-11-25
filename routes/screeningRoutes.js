const express = require('express');
const controller = require('../controllers/screeningController');
const { butuhLogin } = require('../middleware/auth');
const { validateScreening } = require('../validators/screeningValidator');

const router = express.Router();

router.post('/', butuhLogin, validateScreening, controller.create);

module.exports = router;
