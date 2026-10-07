const jwt = require('jsonwebtoken');

module.exports = function generateToken(userId) {
	if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not configured.');
	return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, { expiresIn: '7d' });
};