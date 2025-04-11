// models/User.js
const mongoose = require('mongoose');

// Define the schema for a user
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },

  password: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ['learner', 'admin'],
    default: 'learner'
  },

  progress: {
    modulesCompleted: [String],
    quizzes: [{
      quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
      },
      score: Number,
      date: Date
    }]
  }
}, {
  timestamps: true 
});

// Export the model
module.exports = mongoose.model('User', userSchema);
