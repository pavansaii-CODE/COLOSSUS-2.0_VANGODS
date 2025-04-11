
function requireAdmin(req, res, next) {
    const userRole = req.headers['x-user-role']; // Simulated role from headers
  
    if (userRole !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  
    next();
  }
  
  module.exports = {
    requireAdmin
  };
  