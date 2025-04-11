// Protected route middleware
const { auth } = require('./auth');

// Middleware to protect routes that require authentication
const protectedRoute = (req, res, next) => {
  // Check if user is authenticated
  auth(req, res, (err) => {
    if (err) {
      // If not authenticated, redirect to login page
      return res.redirect('/login-new.html');
    }
    // If authenticated, continue
    next();
  });
};

module.exports = protectedRoute;
