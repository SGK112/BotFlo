const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  company: { type: String },
  role: { type: String },
  subscription: {
    plan: { type: String, enum: ['starter', 'professional', 'enterprise'], default: 'starter' },
    status: { type: String, enum: ['active', 'inactive', 'trial'], default: 'active' },
    trialEndsAt: { type: Date },
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String }
  },
  usage: {
    chatbots: { type: Number, default: 0 },
    conversations: { type: Number, default: 0 },
    lastReset: { type: Date, default: Date.now }
  },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
