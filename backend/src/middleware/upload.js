const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');

const uploadDirectory = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });

const extensions = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' };

module.exports = multer({
	storage: multer.diskStorage({
		destination: (_req, _file, callback) => callback(null, uploadDirectory),
		filename: (_req, file, callback) => callback(null, `${crypto.randomUUID()}${extensions[file.mimetype] || ''}`)
	}),
	limits: { fileSize: 5 * 1024 * 1024, files: 1 },
	fileFilter: (_req, file, callback) => {
		if (!extensions[file.mimetype]) {
			const error = new Error('Only JPEG, PNG, and WebP images are accepted.');
			error.status = 400;
			return callback(error);
		}
		return callback(null, true);
	}
});