const mongoose = require('mongoose');
const skillRequestSchema = new mongoose.Schema({
  requester: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  teacher: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
  skillRequested: {type: String, required: true},
  skillOffered: {type: String, default: ''},
  message: {type: String, maxlength: 500},
  status: {type: String, enum: ['pending', 'accepted', 'declined', 'completed'],
  default: 'pending'},
  sessionNotes: {type: String, maxlength: 1000},
  documents: [{filename: String, url: String,
    uploadedAt: {type: Date, default: Date.now}
  }],
  completedAt: {type: Date}}, 
  {timestamps: true});
module.exports = mongoose.model('SkillRequest', skillRequestSchema);
