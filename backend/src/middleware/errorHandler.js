module.exports = function errorHandler(error, _req, res, _next) {
	let status = error.status || 500;
	let message = error.message || 'An unexpected server error occurred.';

	if (error.name === 'ValidationError') {
		status = 400;
		message = Object.values(error.errors).map(({ message: detail }) => detail).join(' ');
	} else if (error.name === 'CastError') {
		status = 400;
		message = 'The requested identifier is invalid.';
	} else if (error.code === 11000) {
		status = 409;
		message = 'A record with that value already exists.';
	} else if (error.name === 'MulterError') {
		status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
		message = error.code === 'LIMIT_FILE_SIZE' ? 'Image must be 5 MB or smaller.' : 'The image upload could not be processed.';
	}

	if (status >= 500) console.error(error);
	res.status(status).json({ message, ...(process.env.NODE_ENV === 'development' && status >= 500 ? { detail: error.message } : {}) });
};