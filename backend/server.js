const setupEnv = require('./secretSession/setupEnv');
// setupEnv();
process.env.JWT_SECRET = '123';
require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const sessionConfig = require('./middleware/sessionConfig');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const jwtRoutes = require('./routes/jwtRoutes');
const commentRoutes = require('./routes/commentRoutes');
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

connectDB();

app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}))

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(sessionConfig);


app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', jwtRoutes);
app.use('/api', commentRoutes);

// Error handling
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      message: 'Invalid CSRF token. Please get a new token from /api/csrf-token',
      error: 'CSRF token invalid'
    });
  }
  console.error(err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('http://localhost:' + PORT);
});
