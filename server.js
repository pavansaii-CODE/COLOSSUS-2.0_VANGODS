const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fileUpload = require('express-fileupload');

const authRoutes = require('./backend/routes/auth');
const userRoutes = require('./backend/routes/user');
const quizRoutes = require('./backend/routes/quiz');
const resultRoutes = require('./backend/routes/result');

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/colossus2')
  .then(() => {
    console.log('✅ MongoDB connected');
    // Start server after successful DB connection
    const PORT = 5000;
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors());
app.use(express.json());
app.use(fileUpload());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/results', resultRoutes);

// Define routes first (before static files)
// Default route -> home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, 'frontend')));

// Home page route
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'home.html'));
});

// Dashboard route (protected page after login)
app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'index.html'));
});

// Sign recognition page route
app.get('/sign-recognition', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend', 'sign_recognition.html'));
});

// Redirect old login page to new login page
app.get('/login.html', (req, res) => {
  res.redirect('/login-new.html');
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Server is started after MongoDB connection is established
