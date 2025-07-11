const mongoose = require('mongoose');
const skillSchema = new mongoose.Schema({
  name: {type: String, required: true, unique: true, trim: true},
  category: {type: String, required: true, enum: ['Technology', 'Design', 'Business', 'Language', 'Health', 'Arts', 'Other']},
  isPremium: {type: Boolean, default: false},
  description: {type: String, maxlength: 500},
  difficulty: {type: String, enum: ['Beginner', 'Intermediate', 'Advanced'],
  default: 'Beginner'},
  estimatedTime: {type: String, default: '1-2 hours'},
  popularity: {type: Number, default: 0}}, 
  {timestamps: true});
module.exports = mongoose.model('Skill', skillSchema);
