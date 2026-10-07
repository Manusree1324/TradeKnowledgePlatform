const httpError = require('../utils/httpError');

module.exports = function adminOnly(req, _res, next) {
	if (!req.user || req.user.role !== 'admin') return next(httpError(403, 'Administrator access is required.'));
	return next();
};