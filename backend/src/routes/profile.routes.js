const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/profileController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.get('/me', requireAuth, asyncHandler(controller.getMe));
router.put('/me', requireAuth, [
	body('name').optional().trim().isLength({ min: 2, max: 100 }),
	body('tradeSpecialization').optional().trim().isLength({ max: 80 }),
	body('experienceLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
	body('bio').optional().trim().isLength({ max: 500 }),
	body('profileImage').optional({ checkFalsy: true }).isURL({ protocols: ['http', 'https'], require_protocol: true }),
	validateRequest
], asyncHandler(controller.update));
router.get('/:userId', param('userId').isMongoId(), validateRequest, asyncHandler(controller.getById));

module.exports = router;