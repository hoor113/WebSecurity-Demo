const express = require('express');
const jwt = require('jsonwebtoken');
const csrfProtection = require('../middleware/csrfProtection');

// Sử dụng secret key đơn giản cho demo
const JWT_SECRET = '123';

const router = express.Router();

// Mock database
let users = [
    { 
        username: 'user1', 
        email: 'user1@example.com',
        fullName: 'User One',
        phone: '1234567890',
        address: '123 Main St'
    }
];

router.get('/csrf-token', csrfProtection, (req, res) => {  //Tạo CSRF Token
  res.json({ csrfToken: req.csrfToken() });
});

router.get('/session-info', csrfProtection, (req, res) => {
  res.json({
    sessionID: req.sessionID,
    user: req.session.user || null,
    cookie: req.session.cookie,
    csrfToken: req.csrfToken()
  });
});

router.get('/profile', (req, res) => {
  // Hỗ trợ cả JWT và Session authentication
  
  // Kiểm tra JWT token trước
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('JWT Authentication successful:', decoded);
      return res.json({ 
        success: true, 
        user: decoded,
        authMethod: 'JWT'
      });
    } catch (err) {
      console.log('JWT Authentication failed:', err.message);
      return res.status(401).json({ success: false, message: 'Invalid or expired JWT token' });
    }
  }
  
  // Fallback to session authentication
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }

  // Trả về thông tin user từ session
  res.json({ 
    success: true, 
    user: req.session.user,
    authMethod: 'Session'
  });
});

module.exports = router;
