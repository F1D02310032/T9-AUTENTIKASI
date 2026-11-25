const express = require('express');
const controller = require('../controllers/movieController');
const { butuhLogin } = require('../middleware/auth');
const { validateMovie } = require('../validators/movieValidator');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', butuhLogin, validateMovie, controller.create);
router.put('/:id', butuhLogin, validateMovie, controller.update);
router.delete('/:id', butuhLogin, controller.remove);

module.exports = router;
