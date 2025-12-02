const express = require('express');
const router = express.Router();
const xss = require('xss');

// Lưu comment tạm thời trong RAM (mảng)
const comments = [];

// Gửi comment (không lọc XSS, không csrf)
router.post('/comment', (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ message: 'No content' });
  comments.push(content);
  // const cleanContent = xss(content);
  // if (!cleanContent) return res.status(400).json({ message: 'No content' });
  // comments.push(cleanContent);
  res.json({ message: 'Comment added' });
});

// Lấy tất cả comment
router.get('/comment', (req, res) => {
  res.json({ comments });
});

module.exports = router; 