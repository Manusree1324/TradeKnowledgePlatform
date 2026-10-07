const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true, unique: true, maxlength: 80 },
	description: { type: String, trim: true, maxlength: 500, default: '' },
	slug: { type: String, required: true, unique: true, lowercase: true, trim: true }
}, { timestamps: true });

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);