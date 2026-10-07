const Comment = require('../models/Comment');
const Tutorial = require('../models/Tutorial');
const httpError = require('../utils/httpError');

exports.list = async (req, res) => {
	const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, status: 'published' });
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	const comments = await Comment.find({ tutorial: tutorial._id })
		.populate('author', 'name profileImage tradeSpecialization')
		.sort({ createdAt: 1 });
	res.json({ comments });
};

exports.create = async (req, res) => {
	const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, status: 'published' });
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	const comment = await Comment.create({ tutorial: tutorial._id, author: req.user.id, content: req.body.content });
	await comment.populate('author', 'name profileImage');
	res.status(201).json({ comment });
};

exports.remove = async (req, res) => {
	const comment = await Comment.findById(req.params.id);
	if (!comment) throw httpError(404, 'Comment not found.');
	if (comment.author.toString() !== req.user.id && req.user.role !== 'admin') {
		throw httpError(403, 'You can only delete your own comments.');
	}
	await comment.deleteOne();
	res.status(204).end();
};