const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
	tutorial: { type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial', required: true, index: true },
	author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	content: { type: String, required: true, trim: true, minlength: 2, maxlength: 2000 }
}, { timestamps: true });

module.exports = mongoose.models.Comment || mongoose.model('Comment', commentSchema);