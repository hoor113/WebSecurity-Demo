const express = require('express');
const jwt = require('jsonwebtoken');
const xss = require('xss');
const crypto = require('crypto');
const User = require('../models/User');
const csrfProtection = require('../middleware/csrfProtection');
const csrf = require('csurf');

const router = express.Router();

// Mock database
let users = [
    { username: 'user1', password: 'pass1', balance: 1000 }
];

router.post('/register', async (req, res) => {
  try {
    const { username, password, email } = req.body;
    const cleanUsername = xss(username);
    const cleanPassword = xss(password);

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }

    const user = new User({ username: cleanUsername, password: cleanPassword, email: email });
    await user.save();

    res.status(201).json({ success: true, message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Error registering user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = xss(username);
    const cleanPassword = xss(password);

    const user = await User.findOne({ username: cleanUsername });
    if (!user || !(await user.comparePassword(cleanPassword))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '10s' });
    req.session.regenerate((err) => {
      if (err) return res.status(500).json({ message: 'Error regenerating session' });

      req.session.user = { id: user._id, username: user.username, email: user.email };

      req.session.save((err) => {
        if (err) return res.status(500).json({ message: 'Error saving session' });

        res.cookie('jwtToken', token, { 
          httpOnly: false, 
          secure: false,
          sameSite: 'lax',
          maxAge: 3600000 
        });
        console.log('Session saved:', req.sessionID, req.session.user);

        res.json({ 
          success: true, 
          message: 'Login successful', 
          sessionID: req.sessionID,
          user: { 
            id: user._id, 
            username: user.username,
            email: user.email,
            createdAt: user.createdAt
          } 
        });
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Error logging in' });
  }
});

// Endpoint để lấy CSRF token sau khi đã login
router.get('/csrf-token', csrfProtection, (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, message: 'Not logged in' });
  }
  res.json({ csrfToken: req.csrfToken() });
});

router.post('/logout', (req, res) => {
  if (!req.session.user) {
    return res.status(200).json({ message: 'No active session to logout' });
  }

  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Error logging out' });
    res.clearCookie('jwtToken');
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// Get balance route
router.get('/balance', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: 'Not logged in' });
    }
    
    let user = users.find(u => u.username === req.session.user.username);
    
    // Nếu không tìm thấy user trong mock array, tạo mới với balance mặc định
    if (!user) {
        user = { username: req.session.user.username, password: 'temp', balance: 1000 };
        users.push(user);
        console.log('Created new user in mock array for balance check:', user);
    }
    
    res.json({ success: true, balance: user.balance });
});

// Transfer money route (vulnerable to CSRF) - REMOVED CSRF PROTECTION FOR DEMO
router.post('/transfer', (req, res) => {
    console.log("req.session.user:", req.session);
    if (!req.session.user) {
        req.session.user = { username: 'user1' }; // For testing purposes
    }

    const { amount, to } = req.body;
    let user = users.find(u => u.username === req.session.user.username);
    
    // Nếu không tìm thấy user trong mock array, tạo mới với balance mặc định
    if (!user) {
        user = { username: req.session.user.username, password: 'temp', balance: 1000 };
        users.push(user);
        console.log('Created new user in mock array:', user);
    }
    
    if (user.balance >= amount) {
        user.balance -= amount;
        console.log(`Transfer: ${amount} from ${user.username} to ${to}. New balance: ${user.balance}`);
        res.json({ success: true, message: 'Transfer successful', newBalance: user.balance });
    } else {
        res.status(400).json({ success: false, message: 'Insufficient funds' });
    }
});

module.exports = router;
