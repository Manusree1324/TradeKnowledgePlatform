const Tutorial = require('../models/Tutorial');
const User = require('../models/User');
const httpError = require('../utils/httpError');

exports.list = async (req, res) => {
	const user = await User.findById(req.user.id).populate({
		path: 'bookmarks',
		match: { status: 'published' },
		populate: [{ path: 'category', select: 'name slug' }, { path: 'author', select: 'name profileImage' }]
	});
	res.json({ tutorials: user.bookmarks });
};

exports.add = async (req, res) => {
	const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, status: 'published' });
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	await User.updateOne({ _id: req.user.id }, { $addToSet: { bookmarks: tutorial._id } });
	res.status(204).end();
};

exports.remove = async (req, res) => {
	await User.updateOne({ _id: req.user.id }, { $pull: { bookmarks: req.params.tutorialId } });
	res.status(204).end();
};