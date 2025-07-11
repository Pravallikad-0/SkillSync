const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  bio: { type: String, maxlength: 500 },
  skillsToTeach: [{ type: String, trim: true }],
  skillsToLearn: [{ type: String, trim: true }],
  skillKarma: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
  subscriptionPlan: {type: String, enum: ['free', 'monthly', 'yearly'], default: 'free' },
  subscriptionExpiry: { type: Date },
  isPremium: {type: Boolean,default: false,
  get: function() {
      if (this.subscriptionPlan === 'free') return false;
      if (!this.subscriptionExpiry) return false;
      return new Date() < this.subscriptionExpiry;
    }
  },
  profileImage: { type: String, default: '' },
  joinedAt: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { getters: true },
  toObject: { getters: true }
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
