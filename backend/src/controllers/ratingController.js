const Rating = require('../models/Rating');
const Tutorial = require('../models/Tutorial');
const httpError = require('../utils/httpError');

exports.getForTutorial = async (req, res) => {
	const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, status: 'published' });
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	const [summary, userRating] = await Promise.all([
		Rating.aggregate([
			{ $match: { tutorial: tutorial._id } },
			{ $group: { _id: null, average: { $avg: '$value' }, count: { $sum: 1 } } }
		]),
		req.user ? Rating.findOne({ tutorial: tutorial._id, author: req.user.id }) : null
	]);
	res.json({ average: summary[0]?.average || 0, count: summary[0]?.count || 0, userRating: userRating?.value || null });
};

exports.upsert = async (req, res) => {
	const tutorial = await Tutorial.findOne({ _id: req.params.tutorialId, status: 'published' });
	if (!tutorial) throw httpError(404, 'Tutorial not found.');
	const rating = await Rating.findOneAndUpdate(
		{ tutorial: tutorial._id, author: req.user.id },
		{ value: req.body.value },
		{ new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
	);
	res.json({ rating });
};

exports.remove = async (req, res) => {
	const rating = await Rating.findOneAndDelete({ tutorial: req.params.tutorialId, author: req.user.id });
	if (!rating) throw httpError(404, 'Your rating was not found.');
	res.status(204).end();
};