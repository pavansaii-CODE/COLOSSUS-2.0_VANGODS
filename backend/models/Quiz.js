// models/Quiz.js
const mongoose = require('mongoose');

// Define the quiz schema
const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },

  moduleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Module',
    required: false // Optional for standalone quizzes
  },

  questions: [
    {
      question: {
        type: String,
        required: true
      },
      options: {
        type: [String],
        required: true,
        validate: [arrayLimit, 'Each question must have at least 2 options.']
      },
      correctAnswer: {
        type: String,
        required: true
      }
    }
  ],

  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Optional for AI-generated quizzes
  },

  isAI: {
    type: Boolean,
    default: false
  },

  generatedTopic: {
    type: String,
    default: null // Only used if isAI = true
  }

}, { timestamps: true });

// Validator to ensure options array has at least 2 choices
function arrayLimit(val) {
  return val.length >= 2;
}

module.exports = mongoose.model('Quiz', quizSchema);
