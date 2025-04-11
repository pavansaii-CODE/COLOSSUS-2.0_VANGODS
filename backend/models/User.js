// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash the password if it's modified (or new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash the password along with the new salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to return user data without sensitive information
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Export the model
module.exports = mongoose.model('User', userSchema);
