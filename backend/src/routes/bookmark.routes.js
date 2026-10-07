const express = require('express');
const { param } = require('express-validator');
const controller = require('../controllers/bookmarkController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();
router.use(requireAuth);
router.get('/', asyncHandler(controller.list));
router.post('/:tutorialId', param('tutorialId').isMongoId(), validateRequest, asyncHandler(controller.add));
router.delete('/:tutorialId', param('tutorialId').isMongoId(), validateRequest, asyncHandler(controller.remove));

module.exports = router;