const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  rater: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ratee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SkillRequest',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  },
  skill: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// Prevent duplicate ratings for the same request
ratingSchema.index({ rater: 1, ratee: 1, request: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);