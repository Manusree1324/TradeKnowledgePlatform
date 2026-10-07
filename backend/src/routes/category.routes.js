const express = require('express');
const { body, param } = require('express-validator');
const Category = require('../models/Category');
const adminController = require('../controllers/adminController');
const asyncHandler = require('../utils/asyncHandler');
const { requireAuth } = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

router.get('/', asyncHandler(async (_req, res) => {
  const categories = await Category.aggregate([
    { $lookup: { from: 'tutorials', localField: '_id', foreignField: 'category', as: 'tutorials' } },
    { $project: { name: 1, description: 1, slug: 1, tutorialCount: { $size: { $filter: { input: '$tutorials', as: 'tutorial', cond: { $eq: ['$$tutorial.status', 'published'] } } } } } },
    { $sort: { name: 1 } }
  ]);
  res.json({ categories });
}));

router.post('/', requireAuth, adminOnly, [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('slug').optional().trim().isLength({ min: 2, max: 100 }),
  validateRequest
], asyncHandler(adminController.createCategory));
router.put('/:id', requireAuth, adminOnly, [
  param('id').isMongoId(),
  body('name').optional().trim().isLength({ min: 2, max: 80 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('slug').optional().trim().isLength({ min: 2, max: 100 }),
  validateRequest
], asyncHandler(adminController.updateCategory));
router.delete('/:id', requireAuth, adminOnly, param('id').isMongoId(), validateRequest, asyncHandler(adminController.deleteCategory));

module.exports = router;