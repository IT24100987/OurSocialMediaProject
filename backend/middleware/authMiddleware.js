const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if header has Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, token missing' });
      }

      if (!process.env.JWT_SECRET) {
        return res.status(500).json({ message: 'Server authentication is not configured' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token payload (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user || req.user.isActive === false) {
        return res.status(401).json({ message: 'Not authorized, user account is invalid or inactive' });
      }

      next(); // move to next middleware
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
