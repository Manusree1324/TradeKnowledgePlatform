const express = require('express');
const { body } = require('express-validator');
const controller = require('../controllers/authController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.post('/register', [
	body('name').trim().isLength({ min: 2, max: 100 }),
	body('email').trim().isEmail().normalizeEmail(),
	body('password').isString().isLength({ min: 10, max: 128 }),
	body('role').optional().isIn(['student', 'professional']),
	body('tradeSpecialization').optional({ nullable: true }).trim().isLength({ max: 80 }),
	body('experienceLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
	validateRequest
], asyncHandler(controller.register));

router.post('/login', [
	body('email').trim().isEmail().normalizeEmail(),
	body('password').isString().notEmpty(),
	validateRequest
], asyncHandler(controller.login));
router.get('/me', requireAuth, asyncHandler(controller.me));

module.exports = router;