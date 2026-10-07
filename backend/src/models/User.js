const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
	name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
	email: { type: String, required: true, unique: true, lowercase: true, trim: true },
	password: { type: String, required: true, minlength: 10, select: false },
	role: { type: String, enum: ['student', 'professional', 'admin'], default: 'student' },
	tradeSpecialization: { type: String, trim: true, maxlength: 80, default: '' },
	experienceLevel: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
	bio: { type: String, trim: true, maxlength: 500, default: '' },
	profileImage: { type: String, default: '' },
	bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tutorial' }]
}, { timestamps: { createdAt: true, updatedAt: false } });

userSchema.pre('save', async function hashPassword() {
	if (!this.isModified('password')) return;
	this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = function comparePassword(candidate) {
	return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toSafeObject = function toSafeObject() {
	const user = this.toObject();
	delete user.password;
	return user;
};

module.exports = mongoose.models.User || mongoose.model('User', userSchema);