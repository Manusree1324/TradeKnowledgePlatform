const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(requireAuth, adminOnly);
router.get('/stats', asyncHandler(controller.stats));
router.get('/users', asyncHandler(controller.listUsers));
router.patch('/users/:id', [
	param('id').isMongoId(),
	body('role').isIn(['student', 'professional', 'admin']),
	validateRequest
], asyncHandler(controller.updateUser));
router.delete('/users/:id', param('id').isMongoId(), validateRequest, asyncHandler(controller.deleteUser));
router.get('/tutorials', asyncHandler(controller.listTutorials));
router.patch('/tutorials/:id/status', [
	param('id').isMongoId(),
	body('status').isIn(['pending', 'published', 'rejected']),
	body('moderationNote').optional().trim().isLength({ max: 1000 }),
	validateRequest
], asyncHandler(controller.moderateTutorial));

module.exports = router;