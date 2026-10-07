const Comment = require('../models/Comment');
const Category = require('../models/Category');
const Rating = require('../models/Rating');
const Tutorial = require('../models/Tutorial');
const User = require('../models/User');
const escapeRegex = require('../utils/escapeRegex');
const httpError = require('../utils/httpError');

async function resolveCategory(value) {
	const category = await Category.findOne({
		$or: [{ slug: value }, ...( /^[a-f\d]{24}$/i.test(value) ? [{ _id: value }] : [])]
	});
	if (!category) throw httpError(400, 'Choose a valid trade category.');
	return category._id;
}

function canManage(tutorial, user) {
	const authorId = tutorial.author?._id || tutorial.author;
	return user && (user.role === 'admin' || authorId?.toString() === user.id.toString());
}

exports.list = async (req, res) => {
	const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
	const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
	const filter = {};
	if (req.query.mine === 'true') {
		if (!req.user) throw httpError(401, 'Sign in to view your tutorials.');
		filter.author = req.user.id;
	} else {
		filter.status = 'published';
	}

	if (req.query.category) {
		const category = await Category.findOne({ slug: req.query.category });
		if (!category) return res.json({ tutorials: [], page, pages: 0, total: 0 });
		filter.category = category._id;
	}
	if (req.query.search && req.query.search.trim()) {
		const safeSearch = escapeRegex(req.query.search.trim().slice(0, 120));
		filter.$or = [
			{ title: { $regex: safeSearch, $options: 'i' } },
			{ description: { $regex: safeSearch, $options: 'i' } },
			{ content: { $regex: safeSearch, $options: 'i' } }
		];
	}

	const [tutorials, total] = await Promise.all([
		Tutorial.find(filter).populate('category', 'name slug').populate('author', 'name profileImage tradeSpecialization')
			.sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
		Tutorial.countDocuments(filter)
	]);
	res.json({ tutorials, page, pages: Math.ceil(total / limit), total });
};

exports.getById = async (req, res) => {
	const tutorial = await Tutorial.findById(req.params.id)
		.populate('category', 'name slug description')
		.populate('author', 'name profileImage tradeSpecialization experienceLevel');
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	if (tutorial.status !== 'published' && !canManage(tutorial, req.user)) {
		throw httpError(404, 'Tutorial not found.');
	}

	if (tutorial.status === 'published') {
		tutorial.views += 1;
		await tutorial.save();
	}
	res.json({ tutorial });
};

exports.create = async (req, res) => {
	const tutorial = await Tutorial.create({
		title: req.body.title,
		description: req.body.description,
		content: req.body.content,
		category: await resolveCategory(req.body.category),
		author: req.user.id,
		images: req.body.images || [],
		steps: req.body.steps,
		safetyPrecautions: req.body.safetyPrecautions,
		status: req.user.role === 'admin' && req.body.status === 'published' ? 'published' : 'pending'
	});
	await tutorial.populate(['category', { path: 'author', select: 'name profileImage' }]);
	res.status(201).json({ tutorial, message: 'Tutorial submitted for review.' });
};

exports.update = async (req, res) => {
	const tutorial = await Tutorial.findById(req.params.id);
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	if (!canManage(tutorial, req.user)) throw httpError(403, 'You can only edit your own tutorials.');

	let contentChanged = false;
	for (const field of ['title', 'description', 'content', 'images', 'steps', 'safetyPrecautions']) {
		if (req.body[field] !== undefined) tutorial[field] = req.body[field];
		if (req.body[field] !== undefined) contentChanged = true;
	}
	if (req.body.category !== undefined) {
		tutorial.category = await resolveCategory(req.body.category);
		contentChanged = true;
	}
	if (req.user.role === 'admin' && ['pending', 'published', 'rejected'].includes(req.body.status)) {
		tutorial.status = req.body.status;
	} else if (req.user.role !== 'admin' && req.body.status !== undefined) {
		throw httpError(403, 'Only an administrator can change tutorial status.');
	} else if (req.user.role !== 'admin' && contentChanged && tutorial.status !== 'pending') {
		tutorial.status = 'pending';
		tutorial.moderationNote = '';
	}

	await tutorial.save();
	await tutorial.populate(['category', { path: 'author', select: 'name profileImage' }]);
	res.json({ tutorial });
};

exports.remove = async (req, res) => {
	const tutorial = await Tutorial.findById(req.params.id);
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	if (!canManage(tutorial, req.user)) throw httpError(403, 'You can only delete your own tutorials.');

	await Promise.all([
		Comment.deleteMany({ tutorial: tutorial._id }),
		Rating.deleteMany({ tutorial: tutorial._id }),
		User.updateMany({ bookmarks: tutorial._id }, { $pull: { bookmarks: tutorial._id } }),
		tutorial.deleteOne()
	]);
	res.status(204).end();
};