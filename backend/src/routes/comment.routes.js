const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/commentController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.get('/tutorial/:tutorialId', param('tutorialId').isMongoId(), validateRequest, asyncHandler(controller.list));
router.post('/tutorial/:tutorialId', requireAuth, [
	param('tutorialId').isMongoId(),
	body('content').trim().isLength({ min: 2, max: 2000 }),
	validateRequest
], asyncHandler(controller.create));
router.delete('/:id', requireAuth, param('id').isMongoId(), validateRequest, asyncHandler(controller.remove));

module.exports = router;