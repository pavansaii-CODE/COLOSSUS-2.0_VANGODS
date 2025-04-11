const jwt = require('jsonwebtoken');

// JWT secret key - in production, this should be in an environment variable
const JWT_SECRET = 'signlearn-jwt-secret-key-2024';

// Middleware to verify JWT token
const auth = (req, res, next) => {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if no token
  if (!token) {
    return res.status(401).json({ error: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Add user from payload
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

// Export the middleware and secret
module.exports = {
  auth,
  JWT_SECRET
};
