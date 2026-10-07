const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/ratingController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.get('/:tutorialId', param('tutorialId').isMongoId(), validateRequest, optionalAuth, asyncHandler(controller.getForTutorial));
router.put('/:tutorialId', requireAuth, [
	param('tutorialId').isMongoId(),
	body('value').isInt({ min: 1, max: 5 }),
	validateRequest
], asyncHandler(controller.upsert));
router.delete('/:tutorialId', requireAuth, param('tutorialId').isMongoId(), validateRequest, asyncHandler(controller.remove));

module.exports = router;