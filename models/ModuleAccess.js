const mongoose = require('mongoose');

const moduleAccessSchema = new mongoose.Schema({
  module: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillModule',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grantedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillRequest',
    required: true
  },
  accessType: {
    type: String,
    enum: ['view', 'download', 'full'],
    default: 'view'
  },
  expiresAt: {
    type: Date,
    default: null // null means permanent access
  },
  progress: {
    completedSections: [Number],
    lastAccessed: Date,
    timeSpent: {
      type: Number,
      default: 0 // in minutes
    },
    isCompleted: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate access grants
moduleAccessSchema.index({ module: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('ModuleAccess', moduleAccessSchema);