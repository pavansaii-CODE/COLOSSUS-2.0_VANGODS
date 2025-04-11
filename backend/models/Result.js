// models/Result.js
const mongoose = require('mongoose');

const resultSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },

  score: {
    type: Number,
    required: true
  },

  totalQuestions: {
    type: Number,
    required: true
  },

  percentage: {
    type: Number,
    required: true
  },

  submittedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Result', resultSchema);
