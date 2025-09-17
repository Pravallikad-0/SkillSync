const mongoose = require('mongoose');

const skillModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  skill: {
    type: String,
    required: true,
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  content: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner'
  },
  estimatedTime: {
    type: String,
    default: '1-2 hours'
  },
  resources: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['video', 'document', 'link', 'image', 'other'],
      default: 'link'
    }
  }],
  sections: [{
    title: String,
    content: String,
    order: Number
  }],
  prerequisites: [String],
  learningObjectives: [String],
  isPublic: {
    type: Boolean,
    default: false
  },
  accessCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SkillModule', skillModuleSchema);