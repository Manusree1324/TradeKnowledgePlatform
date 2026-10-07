const jwt = require('jsonwebtoken');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');
const httpError = require('../utils/httpError');

function tokenFromRequest(req) {
	const authorization = req.get('authorization') || '';
	return authorization.startsWith('Bearer ') ? authorization.slice(7) : null;
}

async function loadUser(req, required) {
	const token = tokenFromRequest(req);
	if (!token) {
		if (required) throw httpError(401, 'Sign in to continue.');
		return null;
	}
	if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');

	let payload;
	try {
		payload = jwt.verify(token, process.env.JWT_SECRET);
	} catch {
		throw httpError(401, 'Your session is invalid or expired.');
	}

	const user = await User.findById(payload.sub);
	if (!user) throw httpError(401, 'Your account is no longer available.');
	req.user = user;
	return user;
}

exports.requireAuth = asyncHandler(async (req, _res, next) => {
	await loadUser(req, true);
	next();
});

exports.optionalAuth = asyncHandler(async (req, _res, next) => {
	await loadUser(req, false);
	next();
});