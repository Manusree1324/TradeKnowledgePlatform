const express = require('express');
const { body, param } = require('express-validator');
const controller = require('../controllers/tutorialController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth, optionalAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
const validId = param('id').isMongoId();
const validTutorialFields = [
	body('title').optional().trim().isLength({ min: 8, max: 160 }),
	body('description').optional().trim().isLength({ min: 20, max: 500 }),
	body('content').optional().trim().isLength({ min: 80, max: 30000 }),
	body('category').optional().isString().notEmpty(),
	body('images').optional().isArray({ max: 8 }),
	body('steps').optional().isArray({ min: 1, max: 30 }),
	body('safetyPrecautions').optional().isArray({ min: 1, max: 30 })
];
const requiredOnCreate = [
	body('title').trim().isLength({ min: 8, max: 160 }),
	body('description').trim().isLength({ min: 20, max: 500 }),
	body('content').trim().isLength({ min: 80, max: 30000 }),
	body('category').isString().notEmpty(),
	body('steps').isArray({ min: 1, max: 30 }),
	body('steps.*.title').trim().isLength({ min: 3, max: 160 }),
	body('steps.*.description').trim().isLength({ min: 10, max: 2000 }),
	body('safetyPrecautions').isArray({ min: 1, max: 30 }),
	body('safetyPrecautions.*').trim().isLength({ min: 8, max: 500 }),
	body('images').optional().isArray({ max: 8 })
];

router.get('/', optionalAuth, asyncHandler(controller.list));
router.get('/:id', validId, validateRequest, optionalAuth, asyncHandler(controller.getById));
router.post('/', requireAuth, requiredOnCreate, validateRequest, asyncHandler(controller.create));
router.put('/:id', requireAuth, validId, validTutorialFields, validateRequest, asyncHandler(controller.update));
router.delete('/:id', requireAuth, validId, validateRequest, asyncHandler(controller.remove));

module.exports = router;