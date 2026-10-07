const mongoose = require('mongoose');

const stepSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true, maxlength: 160 },
	description: { type: String, required: true, trim: true, maxlength: 2000 }
}, { _id: false });

const tutorialSchema = new mongoose.Schema({
	title: { type: String, required: true, trim: true, minlength: 8, maxlength: 160 },
	description: { type: String, required: true, trim: true, minlength: 20, maxlength: 500 },
	content: { type: String, required: true, trim: true, minlength: 80, maxlength: 30000 },
	category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
	images: [{ type: String, trim: true }],
	steps: { type: [stepSchema], validate: [(steps) => steps.length > 0, 'At least one practical step is required.'] },
	safetyPrecautions: {
		type: [{ type: String, trim: true, maxlength: 500 }],
		validate: [(items) => items.length > 0, 'At least one safety precaution is required.']
	},
	moderationNote: { type: String, trim: true, maxlength: 1000, default: '' },
	status: { type: String, enum: ['pending', 'published', 'rejected'], default: 'pending', index: true },
	views: { type: Number, min: 0, default: 0 }
}, { timestamps: true });

tutorialSchema.index({ title: 'text', description: 'text', content: 'text' });

module.exports = mongoose.models.Tutorial || mongoose.model('Tutorial', tutorialSchema);