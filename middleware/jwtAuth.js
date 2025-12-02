const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  
  if (!token) {
    return next(); 
  }

  try {
    const decoded = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
    req.user = decoded;

    if (req.path === '/jwt/verify') {
      return res.json({
        success: true,
        message: 'Token is valid',
        user: req.user
      });
    }
    
    return next();
  } catch (err) {

    if (req.path === '/jwt/verify') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    return next(); 
  }
};

module.exports = verifyToken; 