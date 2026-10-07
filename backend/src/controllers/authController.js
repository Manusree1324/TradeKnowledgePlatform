const jwt = require('jsonwebtoken');
const User = require('../models/User');
const httpError = require('../utils/httpError');
const generateToken = require('../utils/generateToken');

exports.register = async (req, res) => {
	const { name, email, password, role, tradeSpecialization, experienceLevel } = req.body;
	const user = await User.create({
		name,
		email,
		password,
		role: role === 'professional' ? 'professional' : 'student',
		tradeSpecialization,
		experienceLevel
	});

	res.status(201).json({ token: generateToken(user.id), user: user.toSafeObject() });
};

exports.login = async (req, res) => {
	const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
	if (!user || !(await user.comparePassword(req.body.password))) {
		throw httpError(401, 'Email or password is incorrect.');
	}

	res.json({ token: generateToken(user.id), user: user.toSafeObject() });
};

exports.me = (req, res) => {
	res.json({ user: req.user.toSafeObject() });
};