const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
	tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true, index: true },
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	value: { type: Number, required: true, min: 1, max: 5, validate: Number.isInteger }
}, { timestamps: true });

ratingSchema.index({ tutorial: 1, author: 1 }, { unique: true });

module.exports = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);