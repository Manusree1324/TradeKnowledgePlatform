const Category = require('../models/Category');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const Tutorial = require('../models/Tutorial');
const User = require('../models/User');
const escapeRegex = require('../utils/escapeRegex');
const slugify = require('../utils/slugify');
const httpError = require('../utils/httpError');

exports.stats = async (_req, res) => {
	const [users, tutorials, pending, published, comments, categories, views] = await Promise.all([
		User.countDocuments(),
		Tutorial.countDocuments(),
		Tutorial.countDocuments({ status: 'pending' }),
		Tutorial.countDocuments({ status: 'published' }),
		Comment.countDocuments(),
		Category.countDocuments(),
		Tutorial.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }])
	]);
	res.json({ stats: { users, tutorials, pendingTutorials: pending, publishedTutorials: published, comments, categories, views: views[0]?.total || 0 } });
};

exports.listUsers = async (req, res) => {
	const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 25, 1), 100);
	const safeSearch = req.query.search ? escapeRegex(req.query.search.trim().slice(0, 120)) : '';
	const filter = safeSearch ? {
		$or: [
			{ name: { $regex: safeSearch, $options: 'i' } },
			{ email: { $regex: safeSearch, $options: 'i' } }
		]
	} : {};
	const [users, total] = await Promise.all([
		User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
		User.countDocuments(filter)
	]);
	res.json({ users, page, pages: Math.ceil(total / limit), total });
};

exports.updateUser = async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) throw httpError(404, 'User not found.');
	if (user.id === req.user.id && req.body.role !== 'admin') {
		throw httpError(400, 'You cannot remove your own administrator access.');
	}
	if (user.role === 'admin' && req.body.role !== 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
		throw httpError(400, 'The final administrator account cannot be demoted.');
	}
	user.role = req.body.role;
	await user.save();
	res.json({ user: user.toSafeObject() });
};

exports.deleteUser = async (req, res) => {
	const user = await User.findById(req.params.id);
	if (!user) throw httpError(404, 'User not found.');
	if (user.id === req.user.id) throw httpError(400, 'You cannot delete your own administrator account.');
	if (user.role === 'admin' && await User.countDocuments({ role: 'admin' }) <= 1) {
		throw httpError(400, 'The final administrator account cannot be deleted.');
	}
	const tutorials = await Tutorial.find({ author: user._id }).select('_id');
	const ids = tutorials.map(({ _id }) => _id);
	await Promise.all([
		Tutorial.deleteMany({ author: user._id }),
		Comment.deleteMany({ $or: [{ author: user._id }, { tutorial: { $in: ids } }] }),
		Rating.deleteMany({ $or: [{ author: user._id }, { tutorial: { $in: ids } }] }),
		User.updateMany({ bookmarks: { $in: ids } }, { $pull: { bookmarks: { $in: ids } } }),
		user.deleteOne()
	]);
	res.status(204).end();
};

exports.listTutorials = async (req, res) => {
	const filter = {};
	if (['pending', 'published', 'rejected'].includes(req.query.status)) filter.status = req.query.status;
	const tutorials = await Tutorial.find(filter)
		.populate('author', 'name email')
		.populate('category', 'name slug')
		.sort({ createdAt: -1 });
	res.json({ tutorials });
};

exports.moderateTutorial = async (req, res) => {
	const tutorial = await Tutorial.findById(req.params.id);
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	tutorial.status = req.body.status;
	tutorial.moderationNote = req.body.moderationNote || '';
	await tutorial.save();
	res.json({ tutorial });
};

exports.createCategory = async (req, res) => {
	const category = await Category.create({
		name: req.body.name,
		description: req.body.description || '',
		slug: slugify(req.body.slug || req.body.name)
	});
	res.status(201).json({ category });
};

exports.updateCategory = async (req, res) => {
	const changes = {};
	for (const field of ['name', 'description', 'slug']) {
		if (req.body[field] !== undefined) changes[field] = req.body[field];
	}
	if (changes.name && !changes.slug) changes.slug = slugify(changes.name);
	if (changes.slug) changes.slug = slugify(changes.slug);
	const category = await Category.findByIdAndUpdate(req.params.id, changes, { new: true, runValidators: true });
	if (!category) throw httpError(404, 'Category not found.');
	res.json({ category });
};

exports.deleteCategory = async (req, res) => {
	const category = await Category.findById(req.params.id);
	if (!category) throw httpError(404, 'Category not found.');
	if (await Tutorial.exists({ category: category._id })) {
		throw httpError(409, 'Move or remove this category’s tutorials before deleting it.');
	}
	await category.deleteOne();
	res.status(204).end();
};