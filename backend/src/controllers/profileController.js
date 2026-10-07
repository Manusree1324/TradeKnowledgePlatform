const User = require('../models/User');
const httpError = require('../utils/httpError');

exports.getMe = (req, res) => {
	res.json({ user: req.user.toSafeObject() });
};

exports.getById = async (req, res) => {
	const user = await User.findById(req.params.userId)
		.select('name role tradeSpecialization experienceLevel bio profileImage createdAt');
	if (!user) throw httpError(404, 'Profile not found.');
	res.json({ user });
};

exports.update = async (req, res) => {
	for (const field of ['name', 'tradeSpecialization', 'experienceLevel', 'bio', 'profileImage']) {
		if (req.body[field] !== undefined) req.user[field] = req.body[field];
	}
	await req.user.save();
	res.json({ user: req.user.toSafeObject() });
};